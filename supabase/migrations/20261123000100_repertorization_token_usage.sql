-- One immutable usage row per completed repertorization request.
-- The browser never writes this table or the doctors.ai_tokens column directly.
create table if not exists public.repertorization_token_usage (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null,
  request_id uuid not null,
  tokens_deducted integer not null default 1 check (tokens_deducted = 1),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now(),
  constraint repertorization_token_usage_doctor_request_key unique (doctor_id, request_id)
);

create index if not exists repertorization_token_usage_doctor_created_idx
  on public.repertorization_token_usage (doctor_id, created_at desc);

alter table public.repertorization_token_usage enable row level security;
revoke all on table public.repertorization_token_usage from public, anon, authenticated;
grant all on table public.repertorization_token_usage to service_role;
grant usage, select on sequence public.repertorization_token_usage_id_seq to service_role;

create or replace function public.consume_repertorization_token(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_doctor public.doctors%rowtype;
  v_usage public.repertorization_token_usage%rowtype;
  v_balance integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_request_id is null then
    raise exception 'Request ID is required' using errcode = '22023';
  end if;

  -- Serialize retries for the same doctor/request pair, including concurrent requests.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_request_id::text, 0)
  );

  select * into v_doctor
  from public.doctors d
  where d.auth_user_id = v_user_id and d.status = 'Active'
  for update;

  if not found then
    raise exception 'Active doctor account not found' using errcode = '42501';
  end if;

  select * into v_usage
  from public.repertorization_token_usage u
  where u.doctor_id = v_doctor.id and u.request_id = p_request_id;

  if found then
    select coalesce(d.ai_tokens, 0) into v_balance
    from public.doctors d where d.id = v_doctor.id;
    return pg_catalog.jsonb_build_object(
      'success', true,
      'already_processed', true,
      'tokens_deducted', 1,
      'balance', v_balance
    );
  end if;

  update public.doctors d
  set ai_tokens = coalesce(d.ai_tokens, 0) - 1
  where d.id = v_doctor.id
    and d.auth_user_id = v_user_id
    and d.status = 'Active'
    and coalesce(d.ai_tokens, 0) >= 1
  returning d.ai_tokens into v_balance;

  if not found then
    raise exception 'Insufficient tokens' using errcode = 'P0001';
  end if;

  insert into public.repertorization_token_usage (
    doctor_id, auth_user_id, request_id, tokens_deducted, balance_after
  ) values (
    v_doctor.id, v_user_id, p_request_id, 1, v_balance
  );

  return pg_catalog.jsonb_build_object(
    'success', true,
    'already_processed', false,
    'tokens_deducted', 1,
    'balance', v_balance
  );
end;
$$;

revoke all on function public.consume_repertorization_token(uuid) from public, anon, authenticated;
grant execute on function public.consume_repertorization_token(uuid) to authenticated;
