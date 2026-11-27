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
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);
  if (!allowedOrigin(origin)) return json(403, { error: "Origin not allowed" }, origin);
  if (Deno.env.get("WALLET_PAYMENTS_ENABLED") !== "true" || !url || !anonKey || !serviceKey || !keyId || !keySecret || !webhookSecret)
    return json(503, { error: "Wallet recharge is not enabled. Complete Razorpay test verification first." }, origin);
  const user = await getUser(req);
  if (!user) return json(401, { error: "Please sign in again." }, origin);
  try {
    const body = await req.json();
    const amount = Number(body?.amountPaise);
    const idem = String(body?.idempotencyKey ?? "");
    if (![50000,100000,200000,500000].includes(amount) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idem))
      return json(400, { error: "Choose a valid wallet amount and retry." }, origin);
    const admin = adminClient();
    const { data: doctor, error: doctorError } = await admin.from("doctors")
      .select("id,doctor_name,status,trial_expires_at").eq("auth_user_id",user.id).eq("status","Active").maybeSingle();
    if (doctorError || !doctor) return json(403, { error: "An approved ClassicAI account is required." }, origin);
    const { data: sub, error: subError } = await admin.from("doctor_subscriptions")
      .select("status,starts_at,expires_at").eq("doctor_id",doctor.id).eq("auth_user_id",user.id).maybeSingle();
    if (subError) throw subError;
    const trial = Boolean(doctor.trial_expires_at && new Date(doctor.trial_expires_at).getTime() > Date.now());
    const paid = Boolean(sub && sub.status === "active" && new Date(sub.starts_at).getTime() <= Date.now() && new Date(sub.expires_at).getTime() > Date.now());
    if (!trial && !paid) return json(402, { error: "An active Basic trial or subscription is required before wallet recharge." }, origin);
    const { data: prior, error: priorError } = await admin.from("wallet_topup_orders").select("id,amount_paise,status,razorpay_order_id")
      .eq("doctor_id",doctor.id).eq("idempotency_key",idem).maybeSingle();
    if (priorError) throw priorError;
    if (prior) {
      if (Number(prior.amount_paise) !== amount) return json(409, { error: "This request ID was already used for a different amount." }, origin);
      if (prior.status === "paid") return json(409, { error: "This wallet recharge was already completed." }, origin);
      if (prior.razorpay_order_id) return json(200, { orderId:prior.razorpay_order_id,keyId,amount,currency:"INR",name:"ClassicAI",description:"Common Wallet Recharge" }, origin);
      return json(409, { error: "Wallet order is being prepared. Wait briefly and retry the same request." }, origin);
    }
    const { data: row, error: insertError } = await admin.from("wallet_topup_orders")
      .insert({ doctor_id:doctor.id,auth_user_id:user.id,amount_paise:amount,status:"pending",idempotency_key:idem })
      .select("id").single();
    if (insertError) throw insertError;
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method:"POST",headers:{"Authorization":"Basic "+btoa(keyId+":"+keySecret),"Content-Type":"application/json"},
      body:JSON.stringify({amount,currency:"INR",receipt:"caiwallet_"+row.id.replaceAll("-","").slice(0,20),notes:{product:"ClassicAI Common Wallet",doctor_id:String(doctor.id),topup_id:row.id}})
    });
    const order = await response.json();
    if (!response.ok || !order?.id || order.amount !== amount || order.currency !== "INR") {
      await admin.from("wallet_topup_orders").update({status:"failed"}).eq("id",row.id);
      return json(502,{error:"Razorpay could not create the wallet order."},origin);
    }
    const { error: updateError } = await admin.from("wallet_topup_orders").update({razorpay_order_id:order.id}).eq("id",row.id);
    if (updateError) throw updateError;
    return json(200,{orderId:order.id,keyId,amount,currency:"INR",name:"ClassicAI",description:"Common Wallet Recharge",prefill:{name:doctor.doctor_name??"",email:user.email??""}},origin);
  } catch (error) {
    console.error("create-wallet-topup-order failed",error);
    return json(500,{error:"Could not prepare the wallet recharge. Retry safely."},origin);
  }
});
