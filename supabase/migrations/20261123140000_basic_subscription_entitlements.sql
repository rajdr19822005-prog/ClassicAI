-- ClassicAI Basic Subscription: ₹2,999 / 12 months / 50 repertorisation credits.
-- Isolated from legacy token-recharge orders so existing payment history and balances remain intact.

create table if not exists public.basic_subscription_orders (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null,
  plan_id text not null default 'basic_12m' check (plan_id = 'basic_12m'),
  credits integer not null default 50 check (credits = 50),
  amount_paise integer not null default 299900 check (amount_paise = 299900),
  currency text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  status text not null default 'created' check (status in ('created','paid','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists basic_subscription_orders_doctor_created_idx
  on public.basic_subscription_orders (doctor_id, created_at desc);

create table if not exists public.doctor_subscriptions (
  id bigserial primary key,
  doctor_id bigint not null unique references public.doctors(id) on delete restrict,
  auth_user_id uuid not null,
  plan_id text not null default 'basic_12m' check (plan_id = 'basic_12m'),
  status text not null default 'active' check (status in ('active','expired','cancelled')),
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  last_order_id bigint references public.basic_subscription_orders(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doctor_subscriptions_valid_period check (expires_at > starts_at)
);

create index if not exists doctor_subscriptions_user_expiry_idx
  on public.doctor_subscriptions (auth_user_id, expires_at desc);

create table if not exists public.basic_subscription_credit_grants (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null,
  order_id bigint not null unique references public.basic_subscription_orders(id) on delete restrict,
  credits_granted integer not null check (credits_granted = 50),
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);

alter table public.basic_subscription_orders enable row level security;
alter table public.doctor_subscriptions enable row level security;
alter table public.basic_subscription_credit_grants enable row level security;

revoke all on table public.basic_subscription_orders from public, anon, authenticated;
revoke all on table public.doctor_subscriptions from public, anon, authenticated;
revoke all on table public.basic_subscription_credit_grants from public, anon, authenticated;
grant all on table public.basic_subscription_orders to service_role;
grant all on table public.doctor_subscriptions to service_role;
grant all on table public.basic_subscription_credit_grants to service_role;
grant usage, select on sequence public.basic_subscription_orders_id_seq to service_role;
grant usage, select on sequence public.doctor_subscriptions_id_seq to service_role;
grant usage, select on sequence public.basic_subscription_credit_grants_id_seq to service_role;

create or replace function public.activate_basic_subscription(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_amount_paise integer,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.basic_subscription_orders%rowtype;
  v_doctor public.doctors%rowtype;
  v_subscription public.doctor_subscriptions%rowtype;
  v_balance integer;
  v_start timestamptz;
  v_expiry timestamptz;
begin
  if p_razorpay_order_id is null or p_razorpay_payment_id is null then
    raise exception 'Payment identifiers are required';
  end if;

  select * into v_order
  from public.basic_subscription_orders
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then raise exception 'Subscription order not found'; end if;
  if v_order.amount_paise <> p_amount_paise or v_order.currency <> p_currency then
    raise exception 'Subscription payment amount or currency mismatch';
  end if;

  if v_order.status = 'paid' then
    if v_order.razorpay_payment_id <> p_razorpay_payment_id then
      raise exception 'Subscription order already processed with a different payment';
    end if;
    select coalesce(ai_tokens, 0) into v_balance from public.doctors where id = v_order.doctor_id;
    select * into v_subscription from public.doctor_subscriptions where doctor_id = v_order.doctor_id;
    return pg_catalog.jsonb_build_object(
      'success', true, 'already_processed', true, 'credits_added', 50,
      'balance', v_balance, 'expires_at', v_subscription.expires_at
    );
  end if;

  if v_order.status <> 'created' then raise exception 'Subscription order is not eligible for activation'; end if;
  if exists (
    select 1 from public.basic_subscription_orders
    where razorpay_payment_id = p_razorpay_payment_id and id <> v_order.id
  ) then raise exception 'Payment already used for another subscription order'; end if;

  select * into v_doctor
  from public.doctors
  where id = v_order.doctor_id
    and auth_user_id = v_order.auth_user_id
    and status = 'Active'
  for update;

  if not found then raise exception 'Active doctor account not found'; end if;

  select * into v_subscription
  from public.doctor_subscriptions
  where doctor_id = v_doctor.id
  for update;

  if found and v_subscription.status = 'active' and v_subscription.expires_at > now() then
    v_start := v_subscription.starts_at;
    v_expiry := v_subscription.expires_at + interval '12 months';
  else
    v_start := now();
    v_expiry := v_start + interval '12 months';
  end if;

  update public.doctors
  set ai_tokens = coalesce(ai_tokens, 0) + 50
  where id = v_doctor.id and auth_user_id = v_order.auth_user_id and status = 'Active'
  returning ai_tokens into v_balance;

  if not found then raise exception 'Active doctor account not found'; end if;

  insert into public.doctor_subscriptions (
    doctor_id, auth_user_id, plan_id, status, starts_at, expires_at, last_order_id, updated_at
  ) values (
    v_doctor.id, v_order.auth_user_id, 'basic_12m', 'active', v_start, v_expiry, v_order.id, now()
  )
  on conflict (doctor_id) do update set
    auth_user_id = excluded.auth_user_id,
    plan_id = excluded.plan_id,
    status = 'active',
    starts_at = excluded.starts_at,
    expires_at = excluded.expires_at,
    last_order_id = excluded.last_order_id,
    updated_at = now();

  insert into public.basic_subscription_credit_grants (
    doctor_id, auth_user_id, order_id, credits_granted, balance_after
  ) values (
    v_doctor.id, v_order.auth_user_id, v_order.id, 50, v_balance
  );

  update public.basic_subscription_orders
  set status = 'paid', razorpay_payment_id = p_razorpay_payment_id, paid_at = now()
  where id = v_order.id;

  return pg_catalog.jsonb_build_object(
    'success', true, 'already_processed', false, 'credits_added', 50,
    'balance', v_balance, 'expires_at', v_expiry
  );
end;
$$;

revoke all on function public.activate_basic_subscription(text,text,integer,text) from public, anon, authenticated;
grant execute on function public.activate_basic_subscription(text,text,integer,text) to service_role;

-- The token service is the authoritative entitlement gate. Existing completed request IDs
-- remain idempotently readable, but new repertorization requires a currently active Basic plan.
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
      'success', true, 'already_processed', true, 'tokens_deducted', 1, 'balance', v_balance
    );
  end if;

  if not exists (
    select 1 from public.doctor_subscriptions s
    where s.doctor_id = v_doctor.id
      and s.auth_user_id = v_user_id
      and s.status = 'active'
      and s.starts_at <= now()
      and s.expires_at > now()
  ) then
    raise exception 'An active ClassicAI Basic subscription is required' using errcode = '42501';
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
$$;

revoke all on function public.consume_repertorization_token(uuid) from public, anon, authenticated;
grant execute on function public.consume_repertorization_token(uuid) to authenticated;
