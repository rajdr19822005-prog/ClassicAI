-- ClassicAI Premium Clinic Modules: tenant-isolated clinic records, stock, billing and follow-ups.
-- Every row is scoped to the authenticated active doctor with an unexpired Basic entitlement.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.current_premium_doctor_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select d.id
  from public.doctors d
  join public.doctor_subscriptions s
    on s.doctor_id = d.id
   and s.auth_user_id = d.auth_user_id
  where d.auth_user_id = (select auth.uid())
    and d.status = 'Active'
    and s.status = 'active'
    and s.starts_at <= now()
    and s.expires_at > now()
  limit 1;
$$;
revoke all on function private.current_premium_doctor_id() from public, anon;
grant execute on function private.current_premium_doctor_id() to authenticated;

create table if not exists public.clinic_patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  full_name text not null check (length(btrim(full_name)) between 1 and 160),
  phone text,
  age integer check (age is null or age between 0 and 125),
  gender text check (gender is null or gender in ('Male','Female','Other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, doctor_id)
);
create index if not exists clinic_patients_doctor_created_idx
  on public.clinic_patients (doctor_id, created_at desc);
create index if not exists clinic_patients_doctor_name_idx
  on public.clinic_patients (doctor_id, lower(full_name));

create table if not exists public.clinic_medicines (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  medicine_name text not null check (length(btrim(medicine_name)) between 1 and 160),
  potency text not null default '',
  dosage_form text not null default 'Other',
  batch_number text,
  expiry_date date,
  stock_qty numeric(12,2) not null default 0 check (stock_qty >= 0),
  reorder_level numeric(12,2) not null default 0 check (reorder_level >= 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clinic_medicines_doctor_name_idx
  on public.clinic_medicines (doctor_id, lower(medicine_name));
create index if not exists clinic_medicines_doctor_expiry_idx
  on public.clinic_medicines (doctor_id, expiry_date);

create table if not exists public.clinic_invoices (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid,
  patient_name text not null check (length(btrim(patient_name)) between 1 and 160),
  invoice_no text not null,
  line_items jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','partial','paid','void')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (doctor_id, invoice_no),
  foreign key (patient_id, doctor_id) references public.clinic_patients(id, doctor_id) on delete restrict
);
create index if not exists clinic_invoices_doctor_created_idx
  on public.clinic_invoices (doctor_id, created_at desc);
create index if not exists clinic_invoices_doctor_patient_idx
  on public.clinic_invoices (doctor_id, patient_id);

create table if not exists public.clinic_followups (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  due_at timestamptz not null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','manual')),
  message text not null check (length(btrim(message)) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (patient_id, doctor_id) references public.clinic_patients(id, doctor_id) on delete restrict
);
create index if not exists clinic_followups_doctor_due_idx
  on public.clinic_followups (doctor_id, due_at asc) where status = 'pending';

alter table public.clinic_patients enable row level security;
alter table public.clinic_medicines enable row level security;
alter table public.clinic_invoices enable row level security;
alter table public.clinic_followups enable row level security;

revoke all on table public.clinic_patients, public.clinic_medicines, public.clinic_invoices, public.clinic_followups
  from public, anon;
grant select, insert, update, delete on table public.clinic_patients, public.clinic_medicines, public.clinic_invoices, public.clinic_followups
  to authenticated, service_role;

drop policy if exists premium_doctor_owns_patients on public.clinic_patients;
create policy premium_doctor_owns_patients on public.clinic_patients
  for all to authenticated
  using (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()))
  with check (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()));

drop policy if exists premium_doctor_owns_medicines on public.clinic_medicines;
create policy premium_doctor_owns_medicines on public.clinic_medicines
  for all to authenticated
  using (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()))
  with check (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()));

drop policy if exists premium_doctor_owns_invoices on public.clinic_invoices;
create policy premium_doctor_owns_invoices on public.clinic_invoices
  for all to authenticated
  using (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()))
  with check (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()));

drop policy if exists premium_doctor_owns_followups on public.clinic_followups;
create policy premium_doctor_owns_followups on public.clinic_followups
  for all to authenticated
  using (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()))
  with check (doctor_id = (select private.current_premium_doctor_id()) and auth_user_id = (select auth.uid()));
