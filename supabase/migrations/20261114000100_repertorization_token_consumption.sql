-- Atomic, retry-safe repertorization token consumption.
-- The service-role-only RPC is called only after the Edge Function validates
-- the caller's Supabase Auth access token and derives auth_user_id from Auth.

create table if not exists public.repertorization_token_uses (
  request_id uuid primary key,
  auth_user_id uuid not null,
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  remaining_tokens integer not null check (remaining_tokens >= 0),
  created_at timestamptz not null default now()
);

create index if not exists repertorization_token_uses_auth_user_id_idx
  on public.repertorization_token_uses (auth_user_id, created_at desc);

alter table public.repertorization_token_uses enable row level security;
revoke all on table public.repertorization_token_uses from public, anon, authenticated;
grant all on table public.repertorization_token_uses to service_role;

create or replace function public.consume_repertorization_token(
  p_auth_user_id uuid,
  p_request_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_doctor_id bigint;
  v_remaining integer;
  v_existing public.repertorization_token_uses%rowtype;
begin
  if p_auth_user_id is null or p_request_id is null then
    return jsonb_build_object('success', false, 'error', 'Authenticated user and request ID are required');
  end if;

  select d.id into v_doctor_id
  from public.doctors d
  where d.auth_user_id = p_auth_user_id
    and d.status = 'Active'
  order by d.id
  limit 1;

  if v_doctor_id is null then
    return jsonb_build_object('success', false, 'error', 'An active doctor account is required');
  end if;

  -- The unique request ID serializes concurrent retries. A repeated request
  -- returns the original result without deducting a second token.
  insert into public.repertorization_token_uses (
    request_id, auth_user_id, doctor_id, remaining_tokens
  ) values (p_request_id, p_auth_user_id, v_doctor_id, 0)
  on conflict (request_id) do nothing;

  if not found then
    select * into v_existing
    from public.repertorization_token_uses
    where request_id = p_request_id;

    if not found or v_existing.auth_user_id <> p_auth_user_id then
      return jsonb_build_object('success', false, 'error', 'Request ID is invalid or belongs to another account');
    end if;

    return jsonb_build_object(
      'success', true,
      'already_processed', true,
      'remaining_tokens', v_existing.remaining_tokens
    );
  end if;

  update public.doctors
  set ai_tokens = coalesce(ai_tokens, 0) - 1
  where id = v_doctor_id
    and auth_user_id = p_auth_user_id
    and status = 'Active'
    and coalesce(ai_tokens, 0) > 0
  returning ai_tokens into v_remaining;

  if not found then
    delete from public.repertorization_token_uses
    where request_id = p_request_id;

    return jsonb_build_object(
      'success', false,
      'error', 'No tokens remain or the doctor account is inactive',
      'remaining_tokens', 0
    );
  end if;

  update public.repertorization_token_uses
  set remaining_tokens = v_remaining
  where request_id = p_request_id;

  return jsonb_build_object(
    'success', true,
    'already_processed', false,
    'remaining_tokens', v_remaining
  );
end;
$$;

revoke all on function public.consume_repertorization_token(uuid, uuid) from public, anon, authenticated;
grant execute on function public.consume_repertorization_token(uuid, uuid) to service_role;
