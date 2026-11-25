drop function if exists public.save_doctor_integration(text,jsonb,text);
drop function if exists public.get_doctor_integration_status();

create or replace function public.save_doctor_integration(
  p_auth_user_id uuid,
  p_doctor_id bigint,
  p_provider text,
  p_config jsonb,
  p_secret text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_secret_id uuid;
begin
  if p_auth_user_id is null or p_doctor_id is null then raise exception 'Doctor identity required'; end if;
  if p_provider not in ('ai','sms','whatsapp') then raise exception 'Unsupported provider'; end if;
  if p_config is null or pg_column_size(p_config) > 8192 then raise exception 'Invalid integration settings'; end if;
  if not exists(select 1 from public.doctors d where d.id=p_doctor_id and d.auth_user_id=p_auth_user_id and d.status='Active') then
    raise exception 'Active doctor account required';
  end if;
  select di.secret_id into v_secret_id from private.doctor_integrations di
    where di.auth_user_id=p_auth_user_id and di.provider=p_provider;
  if coalesce(length(p_secret),0)>0 then
    if v_secret_id is null then
      v_secret_id := vault.create_secret(p_secret,
        'classicai_' || replace(p_auth_user_id::text,'-','') || '_' || p_provider,
        'ClassicAI doctor integration secret');
    else
      perform vault.update_secret(v_secret_id,p_secret,null,'ClassicAI doctor integration secret',null);
    end if;
  elsif v_secret_id is null then
    raise exception 'API credentials are required for first-time setup';
  end if;
  insert into private.doctor_integrations(auth_user_id,doctor_id,provider,config,secret_id,updated_at)
  values(p_auth_user_id,p_doctor_id,p_provider,p_config,v_secret_id,now())
  on conflict(auth_user_id,provider) do update set doctor_id=excluded.doctor_id,config=excluded.config,secret_id=excluded.secret_id,updated_at=now();
  return jsonb_build_object('saved',true,'provider',p_provider,'updatedAt',now());
end;
$$;
revoke all on function public.save_doctor_integration(uuid,bigint,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.save_doctor_integration(uuid,bigint,text,jsonb,text) to service_role;

create or replace function public.get_doctor_integration_status(p_auth_user_id uuid,p_doctor_id bigint)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('provider',di.provider,'config',di.config,'configured',(di.secret_id is not null),'updatedAt',di.updated_at) order by di.provider),'[]'::jsonb)
  from private.doctor_integrations di
  join public.doctors d on d.id=di.doctor_id and d.auth_user_id=di.auth_user_id and d.status='Active'
  where di.auth_user_id=p_auth_user_id and di.doctor_id=p_doctor_id
$$;
revoke all on function public.get_doctor_integration_status(uuid,bigint) from public, anon, authenticated;
grant execute on function public.get_doctor_integration_status(uuid,bigint) to service_role;