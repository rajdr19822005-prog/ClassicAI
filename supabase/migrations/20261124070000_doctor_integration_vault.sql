create table if not exists private.doctor_integrations (
  auth_user_id uuid not null,
  doctor_id bigint not null references public.doctors(id) on delete cascade,
  provider text not null check (provider in ('ai','sms','whatsapp')),
  config jsonb not null default '{}'::jsonb,
  secret_id uuid,
  updated_at timestamptz not null default now(),
  primary key (auth_user_id, provider)
);
revoke all on private.doctor_integrations from public, anon, authenticated;

create or replace function public.save_doctor_integration(
  p_provider text,
  p_config jsonb,
  p_secret text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_doctor_id bigint;
  v_secret_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_provider not in ('ai','sms','whatsapp') then raise exception 'Unsupported provider'; end if;
  if p_config is null or pg_column_size(p_config) > 8192 then raise exception 'Invalid integration settings'; end if;
  select d.id into v_doctor_id from public.doctors d
   where d.auth_user_id = v_uid and d.status = 'Active' limit 1;
  if v_doctor_id is null then raise exception 'Active doctor account required'; end if;

  select di.secret_id into v_secret_id from private.doctor_integrations di
   where di.auth_user_id = v_uid and di.provider = p_provider;

  if coalesce(length(p_secret),0) > 0 then
    if v_secret_id is null then
      v_secret_id := vault.create_secret(p_secret,
        'classicai_' || replace(v_uid::text,'-','') || '_' || p_provider,
        'ClassicAI doctor integration secret');
    else
      perform vault.update_secret(v_secret_id, p_secret, null, 'ClassicAI doctor integration secret', null);
    end if;
  elsif v_secret_id is null then
    raise exception 'API credentials are required for first-time setup';
  end if;

  insert into private.doctor_integrations(auth_user_id,doctor_id,provider,config,secret_id,updated_at)
  values(v_uid,v_doctor_id,p_provider,coalesce(p_config,'{}'::jsonb),v_secret_id,now())
  on conflict(auth_user_id,provider) do update
    set doctor_id=excluded.doctor_id, config=excluded.config,
        secret_id=excluded.secret_id, updated_at=now();

  return jsonb_build_object('saved',true,'provider',p_provider,'updatedAt',now());
end;
$$;
revoke all on function public.save_doctor_integration(text,jsonb,text) from public, anon;
grant execute on function public.save_doctor_integration(text,jsonb,text) to authenticated;

create or replace function public.get_doctor_integration_status()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'provider',di.provider,
    'config',di.config,
    'configured',(di.secret_id is not null),
    'updatedAt',di.updated_at
  ) order by di.provider),'[]'::jsonb)
  from private.doctor_integrations di
  join public.doctors d on d.id=di.doctor_id and d.auth_user_id=di.auth_user_id and d.status='Active'
  where di.auth_user_id=auth.uid()
$$;
revoke all on function public.get_doctor_integration_status() from public, anon;
grant execute on function public.get_doctor_integration_status() to authenticated;
