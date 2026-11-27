import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
const allowedOrigin = (origin: string | null) => !origin || origin === "https://classicai.vercel.app" || origin === "null" || origin === "http://localhost" || origin === "http://127.0.0.1" || (origin.startsWith("https://classicai-") && origin.endsWith(".vercel.app"));
const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigin(origin) ? origin : "https://classicai.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
});
const json = (status: number, body: unknown, origin: string | null) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" }
});
const url = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? "";
const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
const adminClient = () => createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
async function getUser(req: Request) {
  const bearer = req.headers.get("Authorization") ?? "";
  if (!bearer.startsWith("Bearer ") || !url || !anonKey) return null;
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await client.auth.getUser(bearer.slice(7));
  return error || !user ? null : user;
}
async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  const origin=req.headers.get("origin");
  if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders(origin)});
  if(req.method!=="POST")return json(405,{error:"Method not allowed"},origin);
  if(!allowedOrigin(origin))return json(403,{error:"Origin not allowed"},origin);
  if(Deno.env.get("AI_MODEL_PAYMENTS_ENABLED")!=="true"||!url||!anonKey||!serviceKey||!keyId||!keySecret||!webhookSecret)return json(503,{error:"AI Model subscription checkout is not enabled. Complete Razorpay test verification first."},origin);
  const user=await getUser(req);if(!user)return json(401,{error:"Please sign in again."},origin);
  try{
    const body=await req.json(),idem=String(body?.idempotencyKey??"");
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idem))return json(400,{error:"A valid request ID is required."},origin);
    const admin=adminClient();
    const {data:doctor,error:doctorError}=await admin.from("doctors").select("id,doctor_name,status,trial_expires_at").eq("auth_user_id",user.id).eq("status","Active").maybeSingle();
    if(doctorError||!doctor)return json(403,{error:"An approved ClassicAI account is required."},origin);
    const {data:sub,error:subError}=await admin.from("doctor_subscriptions").select("status,starts_at,expires_at").eq("doctor_id",doctor.id).eq("auth_user_id",user.id).maybeSingle();
    if(subError)throw subError;
    const trial=Boolean(doctor.trial_expires_at&&new Date(doctor.trial_expires_at).getTime()>Date.now());
    const paid=Boolean(sub&&sub.status==="active"&&new Date(sub.starts_at).getTime()<=Date.now()&&new Date(sub.expires_at).getTime()>Date.now());
    if(!trial&&!paid)return json(402,{error:"An active Basic trial or subscription is required."},origin);
    const {data:catalog,error:catalogError}=await admin.from("premium_module_catalog").select("price_paise,duration_days,enabled").eq("module_key","live_ai_agent").maybeSingle();
    if(catalogError||!catalog||catalog.enabled!==true||!Number.isSafeInteger(Number(catalog.price_paise))||Number(catalog.price_paise)<100||!Number.isSafeInteger(Number(catalog.duration_days))||Number(catalog.duration_days)<1)return json(503,{error:"AI Model add-on is not currently available for purchase."},origin);
    const {data:prior,error:priorError}=await admin.from("premium_module_orders").select("id,amount_paise,duration_days,status,razorpay_order_id").eq("doctor_id",doctor.id).eq("idempotency_key",idem).maybeSingle();
    if(priorError)throw priorError;
    if(prior){
      if(prior.status==="paid")return json(409,{error:"This AI Model subscription was already purchased."},origin);
      if(prior.razorpay_order_id)return json(200,{orderId:prior.razorpay_order_id,keyId,amount:Number(prior.amount_paise),currency:"INR",name:"ClassicAI",description:"AI Model / Live AI Agent subscription"},origin);
      return json(409,{error:"AI Model order is being prepared. Retry the same request shortly."},origin);
    }
    const {data:row,error:insertError}=await admin.from("premium_module_orders").insert({
      doctor_id:doctor.id,auth_user_id:user.id,module_key:"live_ai_agent",amount_paise:catalog.price_paise,duration_days:catalog.duration_days,status:"pending",idempotency_key:idem
    }).select("id").single();
    if(insertError)throw insertError;
    const response=await fetch("https://api.razorpay.com/v1/orders",{
      method:"POST",headers:{"Authorization":"Basic "+btoa(keyId+":"+keySecret),"Content-Type":"application/json"},
      body:JSON.stringify({amount:catalog.price_paise,currency:"INR",receipt:"caiagent_"+row.id.replaceAll("-","").slice(0,20),notes:{product:"ClassicAI AI Model",doctor_id:String(doctor.id),module_order_id:row.id}})
    });
    const order=await response.json();
    if(!response.ok||!order?.id||order.amount!==catalog.price_paise||order.currency!=="INR"){await admin.from("premium_module_orders").update({status:"failed"}).eq("id",row.id);return json(502,{error:"Razorpay could not create the AI Model order."},origin);}
    const {error:updateError}=await admin.from("premium_module_orders").update({razorpay_order_id:order.id}).eq("id",row.id);
    if(updateError)throw updateError;
    return json(200,{orderId:order.id,keyId,amount:catalog.price_paise,currency:"INR",name:"ClassicAI",description:"AI Model / Live AI Agent subscription",prefill:{name:doctor.doctor_name??"",email:user.email??""}},origin);
  }catch(error){console.error("create-ai-model-order failed",error);return json(500,{error:"Could not prepare AI Model subscription."},origin);}
});
