import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const reply = (body: unknown, status=200) => new Response(JSON.stringify(body),{status,headers:cors});
const allowedModules = new Set(["live_ai_agent","sms_gateway","whatsapp_messaging","premium_clinic_suite"]);

Deno.serve(async (req:Request) => {
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return reply({error:"Method not allowed"},405);
  const auth=req.headers.get("Authorization");
  if(!auth?.startsWith("Bearer ")) return reply({error:"Authentication required"},401);
  try {
    const url=Deno.env.get("SUPABASE_URL");
    const anon=Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
    if(!url||!anon||!service) throw new Error("Server configuration unavailable");
    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
    const {data:userData,error:userError}=await userClient.auth.getUser();
    const user=userData.user;
    if(userError||!user) return reply({error:"Invalid session"},401);
    if(user.app_metadata?.role!=="admin") return reply({error:"Administrator access required"},403);
    const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const body=await req.json();
    const action=String(body?.action||"");
    if(action==="list_catalog") {
      const [{data:catalog,error:e1},{data:rates,error:e2}] = await Promise.all([
        admin.from("premium_module_catalog").select("*").order("display_name"),
        admin.from("messaging_rates").select("*").order("provider")
      ]);
      if(e1||e2) throw e1||e2;
      return reply({catalog:catalog||[],rates:rates||[]});
    }
    if(action==="list_doctors") {
      const {data:doctors,error}=await admin.from("doctors").select("id,doctor_name,clinic_name,reg_no,status,auth_user_id").order("doctor_name").limit(500);
      if(error) throw error;
      const ids=(doctors||[]).map(d=>d.id);
      const [{data:wallets,error:we},{data:entitlements,error:ee}]=await Promise.all([
        admin.from("doctor_wallets").select("doctor_id,balance_paise").in("doctor_id",ids.length?ids:[-1]),
        admin.from("doctor_module_entitlements").select("doctor_id,module_key,status,paid_until,admin_suspended,suspension_reason").in("doctor_id",ids.length?ids:[-1])
      ]);
      if(we||ee) throw we||ee;
      return reply({doctors:(doctors||[]).map(d=>({...d,wallet_balance_paise:(wallets||[]).find(w=>w.doctor_id===d.id)?.balance_paise||0,modules:(entitlements||[]).filter(e=>e.doctor_id===d.id)}))});
    }
    if(action==="set_catalog") {
      const moduleKey=String(body.moduleKey||"");
      const price=Math.round(Number(body.priceRupees)*100);
      const days=Number(body.durationDays);
      const enabled=body.enabled===true;
      if(!allowedModules.has(moduleKey)||!Number.isSafeInteger(price)||price<100||!Number.isInteger(days)||days<1||days>3650)
        return reply({error:"Enter a valid module price and duration"},400);
      const {error}=await admin.from("premium_module_catalog").update({price_paise:price,duration_days:days,enabled,updated_at:new Date().toISOString()}).eq("module_key",moduleKey);
      if(error) throw error;
      return reply({success:true});
    }
    if(action==="set_rate") {
      const provider=String(body.provider||"");
      const cost=Math.round(Number(body.providerCostRupees)*100);
      const enabled=body.enabled===true;
      if(!["sms","whatsapp"].includes(provider)||!Number.isSafeInteger(cost)||cost<1||cost>100000)
        return reply({error:"Enter a valid provider cost"},400);
      const {error}=await admin.from("messaging_rates").update({provider_cost_paise:cost,service_margin_percent:30,enabled,updated_at:new Date().toISOString()}).eq("provider",provider);
      if(error) throw error;
      return reply({success:true,serviceMarginPercent:30});
    }
    if(action==="set_module_entitlement") {
      const doctorId=Number(body.doctorId);
      const moduleKey=String(body.moduleKey||"");
      const mode=String(body.mode||"");
      const reason=String(body.reason||"").trim().slice(0,500);
      if(!Number.isInteger(doctorId)||doctorId<1||!allowedModules.has(moduleKey)||!["suspend","reactivate"].includes(mode))
        return reply({error:"Invalid doctor or module selection"},400);
      const {data:doctor,error:de}=await admin.from("doctors").select("id,auth_user_id").eq("id",doctorId).maybeSingle();
      if(de||!doctor?.auth_user_id) return reply({error:"Linked doctor account not found"},404);
      const {data:current,error:ce}=await admin.from("doctor_module_entitlements").select("*").eq("doctor_id",doctorId).eq("module_key",moduleKey).maybeSingle();
      if(ce) throw ce;
      if(mode==="suspend") {
        const row={doctor_id:doctorId,auth_user_id:doctor.auth_user_id,module_key:moduleKey,status:"suspended",admin_suspended:true,suspension_reason:reason||"Suspended by administrator",updated_by:user.id,updated_at:new Date().toISOString()};
        const {error}=await admin.from("doctor_module_entitlements").upsert(row,{onConflict:"doctor_id,module_key"});
        if(error) throw error;
      } else {
        if(!current) return reply({error:"No entitlement exists for this doctor and module"},404);
        const paidUntil=current.paid_until?new Date(current.paid_until):null;
        const stillPaid=!!paidUntil&&paidUntil.getTime()>Date.now();
        const {error}=await admin.from("doctor_module_entitlements").update({
          admin_suspended:false,status:stillPaid?"active":"expired",
          suspension_reason:null,updated_by:user.id,updated_at:new Date().toISOString()
        }).eq("doctor_id",doctorId).eq("module_key",moduleKey);
        if(error) throw error;
      }
      return reply({success:true});
    }
    return reply({error:"Unsupported action"},400);
  } catch(error) {
    return reply({error:error instanceof Error?error.message:"Billing administration failed"},500);
  }
});
