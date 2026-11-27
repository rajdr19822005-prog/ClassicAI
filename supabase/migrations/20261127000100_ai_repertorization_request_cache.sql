-- Durable idempotency cache for AI repertorisation.
-- Private to the Edge Function service role; no browser/API role access.
create table if not exists public.repertorization_ai_requests (
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null,
  request_id uuid not null,
  request_hash text not null check (length(request_hash) = 64),
  status text not null check (status in ('processing','ready_for_billing','completed','failed')),
  result jsonb,
  billing jsonb,
  model text,
  lease_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (doctor_id, request_id),
  constraint repertorization_ai_requests_completed_check
    check (status <> 'completed' or (result is not null and billing is not null))
);

create index if not exists repertorization_ai_requests_status_lease_idx
  on public.repertorization_ai_requests(status, lease_until);

create or replace function public.set_repertorization_ai_requests_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists repertorization_ai_requests_updated_at on public.repertorization_ai_requests;
create trigger repertorization_ai_requests_updated_at
before update on public.repertorization_ai_requests
for each row execute function public.set_repertorization_ai_requests_updated_at();

alter table public.repertorization_ai_requests enable row level security;
revoke all on table public.repertorization_ai_requests from public, anon, authenticated;
grant all on table public.repertorization_ai_requests to service_role;

revoke all on function public.set_repertorization_ai_requests_updated_at() from public, anon, authenticated;
