import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();
const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
const paymentsEnabled = Deno.env.get("BASIC_SUBSCRIPTION_PAYMENTS_ENABLED") === "true";
const allowedOrigins = new Set(["https://classicai.vercel.app", "null", "http://localhost", "http://127.0.0.1"]);
const isAllowedOrigin = (origin: string | null) => !origin || allowedOrigins.has(origin) ||
  (origin.startsWith("https://classicai-") && origin.endsWith(".vercel.app"));
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "https://classicai.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (status: number, body: unknown, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" } });
const adminClient = () => createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
async function authenticatedUser(req: Request) {
  const bearer = req.headers.get("Authorization") ?? "";
  if (!bearer.startsWith("Bearer ") || !supabaseUrl || !anonKey) return null;
  const auth = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await auth.auth.getUser(bearer.slice(7));
  return error || !user ? null : user;
}
async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
  return Array.from(signature, b => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);
  if (!isAllowedOrigin(origin)) return json(403, { error: "Origin not allowed" }, origin);
  if (!supabaseUrl || !anonKey || !serviceKey || !keyId || !keySecret) return json(503, { error: "Subscription payment service is not configured." }, origin);
  if (!paymentsEnabled) return json(503, { error: "Secure subscription checkout is not enabled yet. Please contact ClassicAI support." }, origin);
  const user = await authenticatedUser(req);
  if (!user) return json(401, { error: "Please sign in again." }, origin);
  try {
    const admin = adminClient();
    const { data: doctor, error: doctorError } = await admin.from("doctors")
      .select("id, doctor_name, status, auth_user_id")
      .eq("auth_user_id", user.id).eq("status", "Active").maybeSingle();
    if (doctorError || !doctor) return json(403, { error: "An active approved doctor account is required." }, origin);

    const receipt = `caisub_${doctor.id}_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 299900, currency: "INR", receipt,
        notes: { product: "ClassicAI Basic Subscription", plan_id: "basic_12m", doctor_id: String(doctor.id), validity_months: "12", credits: "50" }
      })
    });
    const order = await response.json();
    if (!response.ok || !order?.id || order.amount !== 299900 || order.currency !== "INR") {
      console.error("Razorpay subscription order creation failed", { status: response.status, code: order?.error?.code });
      return json(502, { error: "Could not create the subscription payment order." }, origin);
    }
    const { error: insertError } = await admin.from("basic_subscription_orders").insert({
      doctor_id: doctor.id, auth_user_id: user.id, plan_id: "basic_12m",
      credits: 50, amount_paise: 299900, currency: "INR", razorpay_order_id: order.id, status: "created"
    });
    if (insertError) {
      console.error("Subscription order record could not be saved", { code: insertError.code });
      return json(500, { error: "Could not prepare the subscription. Please retry." }, origin);
    }
    return json(200, {
      keyId, orderId: order.id, amount: 299900, currency: "INR",
      name: "ClassicAI", description: "Basic Subscription — 12 months + 50 credits",
      prefill: { name: doctor.doctor_name ?? "", email: user.email ?? "" }
    }, origin);
  } catch (error) {
    console.error("create-basic-subscription-order failed", error);
    return json(500, { error: "Could not prepare the subscription payment." }, origin);
  }
});
