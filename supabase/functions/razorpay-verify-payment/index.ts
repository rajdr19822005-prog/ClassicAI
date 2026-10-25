import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("MEDICAL_AI_PROJECT_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("MEDICAL_AI_ANON_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("MEDICAL_AI_SERVICE_ROLE_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();
const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
const allowedOrigins = new Set(["https://classicai.vercel.app", "null", "http://localhost", "http://127.0.0.1"]);
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://classicai.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (status: number, body: unknown, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" } });

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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);
  if (origin && !allowedOrigins.has(origin)) return json(403, { error: "Origin not allowed" }, origin);
  if (!supabaseUrl || !anonKey || !serviceKey || !keyId || !keySecret) {
    return json(503, { error: "Payment verification is not configured yet." }, origin);
  }

  const bearer = req.headers.get("Authorization") ?? "";
  if (!bearer.startsWith("Bearer ")) return json(401, { error: "Please sign in again." }, origin);
  const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(bearer.slice(7));
  if (authError || !user) return json(401, { error: "Please sign in again." }, origin);

  try {
    const body = await req.json();
    const orderId = String(body?.razorpay_order_id ?? "");
    const paymentId = String(body?.razorpay_payment_id ?? "");
    const signature = String(body?.razorpay_signature ?? "");
    if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) {
      return json(400, { error: "Invalid payment response." }, origin);
    }

    const expected = await hmacHex(keySecret, `${orderId}|${paymentId}`);
    if (!safeEqual(expected.toLowerCase(), signature.toLowerCase())) return json(400, { error: "Payment signature could not be verified." }, origin);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: localOrder, error: orderError } = await admin.from("payment_orders")
      .select("doctor_id, auth_user_id, amount_paise, currency, tokens, status")
      .eq("razorpay_order_id", orderId).maybeSingle();
    if (orderError || !localOrder || localOrder.auth_user_id !== user.id) {
      return json(404, { error: "Payment order not found for this account." }, origin);
    }

    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`) },
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok || payment.order_id !== orderId || payment.amount !== localOrder.amount_paise ||
        payment.currency !== localOrder.currency || payment.status !== "captured") {
      return json(409, { error: "Payment is not confirmed as captured yet. If money was deducted, wait briefly and retry or contact support." }, origin);
    }

    const { data: result, error: creditError } = await admin.rpc("apply_razorpay_payment", {
      p_razorpay_order_id: orderId, p_razorpay_payment_id: paymentId,
      p_amount_paise: payment.amount, p_currency: payment.currency,
    });
    if (creditError || !result?.success) {
      console.error("Verified payment could not be credited", { orderId, code: creditError?.code });
      return json(500, { error: "Payment was verified, but token credit needs reconciliation. Contact support with your payment ID." }, origin);
    }
    return json(200, { success: true, tokensAdded: result.tokens_added, balance: result.balance, alreadyProcessed: result.already_processed });
  } catch (error) {
    console.error("razorpay-verify-payment failed", error);
    return json(500, { error: "Could not verify the payment. Please try again." }, origin);
  }
});