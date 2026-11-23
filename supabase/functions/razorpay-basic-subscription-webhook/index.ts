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

const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, null);
  if (!supabaseUrl || !serviceKey || !keyId || !keySecret || !webhookSecret) return json(503, { error: "Webhook not configured" }, null);
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();
  const expected = await hmacHex(webhookSecret, rawBody);
  if (!signature || !safeEqual(expected.toLowerCase(), signature.toLowerCase())) return json(400, { error: "Invalid webhook signature" }, null);
  try {
    const event = JSON.parse(rawBody);
    if (event?.event !== "payment.captured") return json(200, { received: true, ignored: true }, null);
    const entity = event?.payload?.payment?.entity;
    const orderId = String(entity?.order_id ?? "");
    const paymentId = String(entity?.id ?? "");
    if (!orderId || !paymentId) return json(400, { error: "Missing payment identifiers" }, null);
    const admin = adminClient();
    const { data: localOrder, error } = await admin.from("basic_subscription_orders")
      .select("amount_paise,currency").eq("razorpay_order_id", orderId).maybeSingle();
    if (error) throw error;
    if (!localOrder) return json(200, { received: true, ignored: true }, null);
    const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`) }
    });
    const payment = await response.json();
    if (!response.ok || payment.status !== "captured" || payment.order_id !== orderId ||
        payment.amount !== 299900 || payment.amount !== localOrder.amount_paise ||
        payment.currency !== "INR" || payment.currency !== localOrder.currency) {
      return json(400, { error: "Payment is not a matching captured subscription payment" }, null);
    }
    const { data: result, error: activationError } = await admin.rpc("activate_basic_subscription", {
      p_razorpay_order_id: orderId, p_razorpay_payment_id: paymentId,
      p_amount_paise: payment.amount, p_currency: payment.currency
    });
    if (activationError || !result?.success) {
      console.error("Basic subscription webhook activation failed", { orderId, code: activationError?.code });
      return json(500, { error: "Could not activate subscription" }, null);
    }
    return json(200, { received: true, activated: true, alreadyProcessed: result.already_processed }, null);
  } catch (error) {
    console.error("razorpay-basic-subscription-webhook failed", error);
    return json(500, { error: "Webhook processing failed" }, null);
  }
});
