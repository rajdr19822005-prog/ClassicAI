import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("MEDICAL_AI_PROJECT_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("MEDICAL_AI_SERVICE_ROLE_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();
const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

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
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  if (!supabaseUrl || !serviceKey || !keyId || !keySecret || !webhookSecret) {
    console.error("Razorpay webhook secrets are not configured");
    return json(503, { error: "Webhook not configured" });
  }
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await req.text();
  const expected = await hmacHex(webhookSecret, rawBody);
  if (!signature || !safeEqual(expected.toLowerCase(), signature.toLowerCase())) return json(400, { error: "Invalid webhook signature" });

  try {
    const event = JSON.parse(rawBody);
    if (!["payment.captured", "order.paid"].includes(event?.event)) return json(200, { received: true, ignored: true });

    const payment = event?.payload?.payment?.entity;
    const order = event?.payload?.order?.entity;
    const orderId = String(payment?.order_id ?? order?.id ?? "");
    const paymentId = String(payment?.id ?? "");
    if (!orderId || !paymentId) return json(400, { error: "Missing payment identifiers" });

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: localOrder, error: localError } = await admin.from("payment_orders")
      .select("amount_paise,currency,status").eq("razorpay_order_id", orderId).maybeSingle();
    if (localError) throw localError;
    if (!localOrder) return json(200, { received: true, ignored: true });

    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`) },
    });
    const confirmed = await paymentResponse.json();
    if (!paymentResponse.ok || confirmed.status !== "captured" || confirmed.order_id !== orderId ||
        confirmed.amount !== localOrder.amount_paise || confirmed.currency !== localOrder.currency) {
      return json(400, { error: "Payment is not a matching captured payment" });
    }

    const { data: result, error } = await admin.rpc("apply_razorpay_payment", {
      p_razorpay_order_id: orderId, p_razorpay_payment_id: paymentId,
      p_amount_paise: confirmed.amount, p_currency: confirmed.currency,
    });
    if (error || !result?.success) {
      console.error("Razorpay webhook credit failed", { orderId, code: error?.code });
      return json(500, { error: "Could not credit payment" });
    }
    return json(200, { received: true, credited: true, alreadyProcessed: result.already_processed });
  } catch (error) {
    console.error("razorpay-webhook failed", error);
    return json(500, { error: "Webhook processing failed" });
  }
});