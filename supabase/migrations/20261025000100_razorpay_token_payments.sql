create table if not exists public.payment_orders (
  id bigserial primary key,
  doctor_id bigint not null references public.doctors(id) on delete restrict,
  auth_user_id uuid not null,
  plan_id text not null,
  tokens integer not null check (tokens > 0 and tokens <= 1000000),
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  status text not null default 'created' check (status in ('created','paid','failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payment_orders_doctor_id_idx on public.payment_orders (doctor_id);

alter table public.payment_orders enable row level security;
revoke all on table public.payment_orders from anon, authenticated;
grant all on table public.payment_orders to service_role;

create or replace function public.apply_razorpay_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_amount_paise integer,
  p_currency text
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.payment_orders%rowtype;
  v_balance integer;
begin
  if p_razorpay_order_id is null or p_razorpay_payment_id is null then
    raise exception 'Payment identifiers are required';
  end if;

  select * into v_order
  from public.payment_orders
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.amount_paise <> p_amount_paise or v_order.currency <> p_currency then
    raise exception 'Payment amount or currency mismatch';
  end if;

  if v_order.status = 'paid' then
    if v_order.razorpay_payment_id <> p_razorpay_payment_id then
      raise exception 'Order already credited with a different payment';
    end if;
    select coalesce(ai_tokens, 0) into v_balance
    from public.doctors where id = v_order.doctor_id;
    return jsonb_build_object('success', true, 'already_processed', true, 'tokens_added', v_order.tokens, 'balance', v_balance);
  end if;

  if v_order.status <> 'created' then
    raise exception 'Order is not eligible for credit';
  end if;

  if exists (select 1 from public.payment_orders where razorpay_payment_id = p_razorpay_payment_id and id <> v_order.id) then
    raise exception 'Payment already used for another order';
  end if;

  update public.doctors
  set ai_tokens = coalesce(ai_tokens, 0) + v_order.tokens
  where id = v_order.doctor_id and auth_user_id = v_order.auth_user_id and status = 'Active'
  returning ai_tokens into v_balance;

  if not found then
    raise exception 'Active doctor account not found';
  end if;

  update public.payment_orders
  set status = 'paid', razorpay_payment_id = p_razorpay_payment_id, paid_at = now()
  where id = v_order.id;

  return jsonb_build_object('success', true, 'already_processed', false, 'tokens_added', v_order.tokens, 'balance', v_balance);
end;
$$;

revoke all on function public.apply_razorpay_payment(text, text, integer, text) from public, anon, authenticated;
grant execute on function public.apply_razorpay_payment(text, text, integer, text) to service_role;
