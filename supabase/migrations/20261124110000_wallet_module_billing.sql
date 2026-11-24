-- ClassicAI independent module subscriptions + common messaging wallet.
-- Repository migration only: apply to a staging database after review; production is not changed by this commit.

create schema if not exists private;
revoke all on schema private from public, anon;

create table if not exists public.premium_module_catalog (
  module_key text primary key check (module_key in ('live_ai_agent','sms_gateway','whatsapp_messaging','premium_clinic_suite')),
  display_name text not null,
  price_paise bigint check (price_paise is null or price_paise >= 100),
  duration_days integer check (duration_days is null or duration_days between 1 and 3650),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.premium_module_catalog(module_key,display_name,price_paise,duration_days,enabled)
values
 ('live_ai_agent','Live AI Agent',200000,365,false),
 ('sms_gateway','SMS Gateway',null,null,false),
 ('whatsapp_messaging','WhatsApp Messaging',null,null,false),
 ('premium_clinic_suite','Premium Clinic Suite',null,null,false)
on conflict (module_key) do nothing;

create table if not exists public.doctor_module_entitlements (
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  module_key text not null references public.premium_module_catalog(module_key) on delete restrict,
  status text not null default 'inactive' check (status in ('inactive','active','suspended','expired')),
  paid_until timestamptz,
  admin_suspended boolean not null default false,
  suspension_reason text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  last_payment_reference text,
  primary key (doctor_id,module_key),
  unique (auth_user_id,module_key)
);
create index if not exists doctor_module_entitlements_user_idx
  on public.doctor_module_entitlements(auth_user_id,module_key,status);

create table if not exists public.premium_module_orders (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  module_key text not null references public.premium_module_catalog(module_key),
  amount_paise bigint not null check (amount_paise > 0),
  duration_days integer not null check (duration_days > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (doctor_id,idempotency_key)
);

create table if not exists public.doctor_wallets (
  doctor_id bigint primary key references public.doctors(id) on delete restrict,
  auth_user_id uuid not null unique references auth.users(id) on delete restrict,
  balance_paise bigint not null default 0 check (balance_paise >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_topup_orders (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  amount_paise bigint not null check (amount_paise in (50000,100000,200000,500000)),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (doctor_id,idempotency_key)
);

create table if not exists public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  entry_type text not null check (entry_type in ('topup','message_charge','refund','adjustment')),
  amount_paise bigint not null check (amount_paise <> 0),
  balance_after_paise bigint not null check (balance_after_paise >= 0),
  reference_id text,
  idempotency_key uuid,
  description text not null,
  created_at timestamptz not null default now(),
  unique (doctor_id,idempotency_key)
);
create index if not exists wallet_ledger_doctor_created_idx
  on public.wallet_ledger(doctor_id,created_at desc);

create table if not exists public.messaging_rates (
  provider text primary key check (provider in ('sms','whatsapp')),
  provider_cost_paise bigint not null default 0 check (provider_cost_paise >= 0),
  service_margin_percent integer not null default 30 check (service_margin_percent = 30),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.messaging_rates(provider,provider_cost_paise,service_margin_percent,enabled)
values ('sms',0,30,false),('whatsapp',0,30,false)
on conflict (provider) do nothing;

create table if not exists public.messaging_usage (
  id uuid primary key default gen_random_uuid(),
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider in ('sms','whatsapp')),
  idempotency_key uuid not null,
  units integer not null check (units > 0),
  provider_cost_paise bigint not null check (provider_cost_paise >= 0),
  service_margin_paise bigint not null check (service_margin_paise >= 0),
  wallet_deduction_paise bigint not null check (wallet_deduction_paise > 0),
  created_at timestamptz not null default now(),
  unique (doctor_id,idempotency_key)
);

alter table public.premium_module_catalog enable row level security;
alter table public.doctor_module_entitlements enable row level security;
alter table public.premium_module_orders enable row level security;
alter table public.doctor_wallets enable row level security;
alter table public.wallet_topup_orders enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.messaging_rates enable row level security;
alter table public.messaging_usage enable row level security;

revoke all on public.premium_module_catalog,public.doctor_module_entitlements,public.premium_module_orders,
 public.doctor_wallets,public.wallet_topup_orders,public.wallet_ledger,public.messaging_rates,public.messaging_usage
 from public,anon,authenticated;
grant select on public.premium_module_catalog,public.doctor_module_entitlements,public.doctor_wallets,
 public.wallet_ledger,public.messaging_rates,public.messaging_usage to authenticated;
grant all on public.premium_module_catalog,public.doctor_module_entitlements,public.premium_module_orders,
 public.doctor_wallets,public.wallet_topup_orders,public.wallet_ledger,public.messaging_rates,public.messaging_usage to service_role;

drop policy if exists module_catalog_read_enabled on public.premium_module_catalog;
create policy module_catalog_read_enabled on public.premium_module_catalog
 for select to authenticated using (enabled = true or exists (
   select 1 from public.doctors d where d.auth_user_id=(select auth.uid()) and d.status='Active'
 ));
drop policy if exists own_module_entitlements_read on public.doctor_module_entitlements;
create policy own_module_entitlements_read on public.doctor_module_entitlements
 for select to authenticated using (auth_user_id=(select auth.uid()));
drop policy if exists own_wallet_read on public.doctor_wallets;
create policy own_wallet_read on public.doctor_wallets
 for select to authenticated using (auth_user_id=(select auth.uid()));
drop policy if exists own_wallet_ledger_read on public.wallet_ledger;
create policy own_wallet_ledger_read on public.wallet_ledger
 for select to authenticated using (auth_user_id=(select auth.uid()));
drop policy if exists messaging_rates_read on public.messaging_rates;
create policy messaging_rates_read on public.messaging_rates
 for select to authenticated using (true);
drop policy if exists own_messaging_usage_read on public.messaging_usage;
create policy own_messaging_usage_read on public.messaging_usage
 for select to authenticated using (auth_user_id=(select auth.uid()));

create or replace function private.charge_messaging_wallet(
  p_auth_user_id uuid,
  p_doctor_id bigint,
  p_provider text,
  p_idempotency_key uuid,
  p_units integer default 1
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rate public.messaging_rates%rowtype;
  v_module text;
  v_actual bigint;
  v_charge bigint;
  v_margin bigint;
  v_balance bigint;
  v_existing public.messaging_usage%rowtype;
begin
  if p_auth_user_id is null or p_doctor_id is null or p_idempotency_key is null
     or p_provider not in ('sms','whatsapp') or p_units is null or p_units < 1 or p_units > 100 then
    raise exception 'Invalid messaging charge request';
  end if;
  if not exists(select 1 from public.doctors d where d.id=p_doctor_id and d.auth_user_id=p_auth_user_id and d.status='Active') then
    raise exception 'Active doctor account required';
  end if;
  select * into v_existing from public.messaging_usage
   where doctor_id=p_doctor_id and idempotency_key=p_idempotency_key;
  if found then
    return jsonb_build_object('alreadyCharged',true,'deductedPaise',v_existing.wallet_deduction_paise);
  end if;

  v_module := case when p_provider='sms' then 'sms_gateway' else 'whatsapp_messaging' end;
  if not exists (
    select 1 from public.doctor_module_entitlements e
    where e.doctor_id=p_doctor_id and e.auth_user_id=p_auth_user_id
      and e.module_key=v_module and e.status='active'
      and e.admin_suspended=false and e.paid_until > now()
  ) then raise exception 'Messaging subscription is not active'; end if;

  select * into v_rate from public.messaging_rates where provider=p_provider and enabled=true;
  if not found or v_rate.provider_cost_paise <= 0 then raise exception 'Messaging rate is not configured'; end if;

  v_actual := v_rate.provider_cost_paise * p_units;
  v_charge := ceil(v_actual::numeric * (100 + v_rate.service_margin_percent) / 100)::bigint;
  v_margin := v_charge - v_actual;

  insert into public.doctor_wallets(doctor_id,auth_user_id,balance_paise)
    values(p_doctor_id,p_auth_user_id,0) on conflict(doctor_id) do nothing;
  select balance_paise into v_balance from public.doctor_wallets where doctor_id=p_doctor_id for update;
  if v_balance < v_charge then raise exception 'Insufficient wallet balance'; end if;
  update public.doctor_wallets set balance_paise=balance_paise-v_charge,updated_at=now()
    where doctor_id=p_doctor_id returning balance_paise into v_balance;

  insert into public.messaging_usage(doctor_id,auth_user_id,provider,idempotency_key,units,
    provider_cost_paise,service_margin_paise,wallet_deduction_paise)
  values(p_doctor_id,p_auth_user_id,p_provider,p_idempotency_key,p_units,v_actual,v_margin,v_charge);

  insert into public.wallet_ledger(doctor_id,auth_user_id,entry_type,amount_paise,balance_after_paise,
    reference_id,idempotency_key,description)
  values(p_doctor_id,p_auth_user_id,'message_charge',-v_charge,v_balance,
    p_idempotency_key::text,p_idempotency_key,
    p_provider||' usage: provider '||v_actual||' paise + ClassicAI 30% margin '||v_margin||' paise');

  return jsonb_build_object('alreadyCharged',false,'providerCostPaise',v_actual,
    'serviceMarginPaise',v_margin,'deductedPaise',v_charge,'balanceAfterPaise',v_balance);
end;
$$;
revoke all on function private.charge_messaging_wallet(uuid,bigint,text,uuid,integer) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.charge_messaging_wallet(uuid,bigint,text,uuid,integer) to service_role;
