-- 15-day Basic app trial, followed by the paid Basic subscription.
-- Existing paid subscriptions are preserved. Existing accounts with no subscription history
-- receive one 15-day launch trial. New doctor records receive 15 days from provisioning.
alter table public.doctors
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_expires_at timestamptz;

update public.doctors d
set trial_started_at = coalesce(d.trial_started_at, now()),
    trial_expires_at = coalesce(d.trial_expires_at, coalesce(d.trial_started_at, now()) + interval '15 days')
where d.status = 'Active'
  and not exists (
    select 1 from public.doctor_subscriptions s where s.doctor_id = d.id
  );

create or replace function private.initialize_doctor_trial()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trial_started_at is null then
    new.trial_started_at := coalesce(new.created_at, now());
  end if;
  if new.trial_expires_at is null then
    new.trial_expires_at := new.trial_started_at + interval '15 days';
  end if;
  return new;
end;
$$;

drop trigger if exists doctors_initialize_trial on public.doctors;
create trigger doctors_initialize_trial
before insert on public.doctors
for each row execute function private.initialize_doctor_trial();

-- One authoritative server-side predicate for all Basic app features.
create or replace function private.current_basic_access_doctor_id()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select d.id
  from public.doctors d
  where d.auth_user_id = (select auth.uid())
    and d.status = 'Active'
    and (
      d.trial_expires_at > now()
      or exists (
        select 1
        from public.doctor_subscriptions s
        where s.doctor_id = d.id
          and s.auth_user_id = d.auth_user_id
          and s.status = 'active'
          and s.starts_at <= now()
          and s.expires_at > now()
      )
    )
  limit 1;
$$;

revoke all on function private.current_basic_access_doctor_id() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.current_basic_access_doctor_id() to authenticated;

-- Case archives must not remain accessible after the trial/subscription expires.
drop policy if exists patient_cases_delete_own on public.patient_cases;
drop policy if exists patient_cases_insert_own on public.patient_cases;
drop policy if exists patient_cases_select_own on public.patient_cases;
drop policy if exists patient_cases_update_own on public.patient_cases;
drop policy if exists patient_cases_basic_access_own on public.patient_cases;
create policy patient_cases_basic_access_own on public.patient_cases
for all to authenticated
using (
  doctor_user_id = (select auth.uid())
  and (select private.current_basic_access_doctor_id()) is not null
  and doctor_reg = (
    select d.reg_no from public.doctors d
    where d.id = (select private.current_basic_access_doctor_id())
  )
)
with check (
  doctor_user_id = (select auth.uid())
  and (select private.current_basic_access_doctor_id()) is not null
  and doctor_reg = (
    select d.reg_no from public.doctors d
    where d.id = (select private.current_basic_access_doctor_id())
  )
);

-- Clinic workspace is included in Basic; it is not a separately subscribed module.
drop policy if exists premium_doctor_owns_patients on public.clinic_patients;
drop policy if exists premium_doctor_owns_medicines on public.clinic_medicines;
drop policy if exists premium_doctor_owns_invoices on public.clinic_invoices;
drop policy if exists premium_doctor_owns_followups on public.clinic_followups;
drop policy if exists basic_access_owns_patients on public.clinic_patients;
drop policy if exists basic_access_owns_medicines on public.clinic_medicines;
drop policy if exists basic_access_owns_invoices on public.clinic_invoices;
drop policy if exists basic_access_owns_followups on public.clinic_followups;

create policy basic_access_owns_patients on public.clinic_patients
for all to authenticated
using (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()))
with check (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()));

create policy basic_access_owns_medicines on public.clinic_medicines
for all to authenticated
using (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()))
with check (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()));

create policy basic_access_owns_invoices on public.clinic_invoices
for all to authenticated
using (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()))
with check (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()));

create policy basic_access_owns_followups on public.clinic_followups
for all to authenticated
using (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()))
with check (doctor_id = (select private.current_basic_access_doctor_id()) and auth_user_id = (select auth.uid()));

-- Enforce the same 15-day trial / paid Basic rule in the token-consumption RPC.
create or replace function public.consume_repertorization_token(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
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

  if (select private.current_basic_access_doctor_id()) is distinct from v_doctor.id then
    raise exception 'An active ClassicAI Basic trial or subscription is required' using errcode = '42501';
  end if;

  select * into v_usage
  from public.repertorization_token_usage u
  where u.doctor_id = v_doctor.id and u.request_id = p_request_id;

  if found then
    select coalesce(d.ai_tokens, 0) into v_balance
    from public.doctors d where d.id = v_doctor.id;
    return pg_catalog.jsonb_build_object(
      'success', true, 'already_processed', true, 'tokens_deducted', 1, 'balance', v_balance
    );
  end if;

  update public.doctors d
  set ai_tokens = coalesce(d.ai_tokens, 0) - 1
  where d.id = v_doctor.id
    and d.auth_user_id = v_user_id
    and d.status = 'Active'
    and coalesce(d.ai_tokens, 0) >= 1
  returning d.ai_tokens into v_balance;

  if not found then raise exception 'Insufficient tokens' using errcode = 'P0001'; end if;

  insert into public.repertorization_token_usage (
    doctor_id, auth_user_id, request_id, tokens_deducted, balance_after
  ) values (v_doctor.id, v_user_id, p_request_id, 1, v_balance);

  return pg_catalog.jsonb_build_object(
    'success', true, 'already_processed', false, 'tokens_deducted', 1, 'balance', v_balance
  );
end;
$function$;
