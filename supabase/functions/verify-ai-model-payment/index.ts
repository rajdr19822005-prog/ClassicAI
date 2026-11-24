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
  if(!url||!anonKey||!serviceKey||!keyId||!keySecret)return json(503,{error:"AI Model payment verification is not configured."},origin);
  const user=await getUser(req);if(!user)return json(401,{error:"Please sign in again."},origin);
  try{
    const body=await req.json(),orderId=String(body?.razorpay_order_id??""),paymentId=String(body?.razorpay_payment_id??""),signature=String(body?.razorpay_signature??"");
    if(!/^order_[A-Za-z0-9]+$/.test(orderId)||!/^pay_[A-Za-z0-9]+$/.test(paymentId)||!/^[a-f0-9]{64}$/i.test(signature))return json(400,{error:"Invalid Razorpay response."},origin);
    const expected=await hmacHex(keySecret,orderId+"|"+paymentId);if(!safeEqual(expected.toLowerCase(),signature.toLowerCase()))return json(400,{error:"Payment signature verification failed."},origin);
    const admin=adminClient();
    const {data:local,error:localError}=await admin.from("premium_module_orders").select("id,auth_user_id,amount_paise,status,module_key").eq("razorpay_order_id",orderId).maybeSingle();
    if(localError||!local||local.auth_user_id!==user.id)return json(404,{error:"AI Model order not found for this account."},origin);
    const response=await fetch("https://api.razorpay.com/v1/payments/"+encodeURIComponent(paymentId),{headers:{"Authorization":"Basic "+btoa(keyId+":"+keySecret)}});
    const payment=await response.json();
    if(!response.ok||payment.order_id!==orderId||payment.amount!==local.amount_paise||payment.currency!=="INR"||payment.status!=="captured")return json(409,{error:"Payment is not captured yet. Do not pay again; retry verification."},origin);
    const {data:result,error}=await admin.rpc("activate_premium_module_order",{p_order_id:local.id,p_razorpay_payment_id:paymentId});
    if(error||!result)return json(500,{error:"Payment verified but AI Model access needs reconciliation. Contact support with payment ID "+paymentId},origin);
    return json(200,{success:true,alreadyActivated:result.alreadyActivated===true,paidUntil:result.paidUntil,moduleKey:result.moduleKey},origin);
  }catch(error){console.error("verify-ai-model-payment failed",error);return json(500,{error:"Could not verify AI Model payment."},origin);}
});
