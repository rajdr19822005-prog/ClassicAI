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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);
  if (origin && !allowedOrigins.has(origin)) return json(403, { error: "Origin not allowed" }, origin);
  if (!supabaseUrl || !anonKey || !serviceKey) return json(503, { error: "Payment service is not configured yet." }, origin);
  if (!keyId || !keySecret) return json(503, { error: "Razorpay credentials have not been configured yet." }, origin);

  const bearer = req.headers.get("Authorization") ?? "";
  if (!bearer.startsWith("Bearer ")) return json(401, { error: "Please sign in again." }, origin);
  const token = bearer.slice(7);
  const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return json(401, { error: "Please sign in again." }, origin);

  try {
    const body = await req.json();
    if (body?.planId !== "tokens_150") return json(400, { error: "Unknown token package." }, origin);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: doctor, error: doctorError } = await admin.from("doctors")
      .select("id, doctor_name, clinic_name, reg_no, ai_tokens, status, auth_user_id")
      .eq("auth_user_id", user.id).eq("status", "Active").maybeSingle();
    if (doctorError || !doctor) return json(403, { error: "An active approved doctor account is required." }, origin);

    const plans: Record<string, { tokens: number; amountPaise: number; label: string }> = {
      tokens_25: { tokens: 25, amountPaise: 19900, label: "25 repertorization tokens" },
      tokens_50: { tokens: 50, amountPaise: 34900, label: "50 repertorization tokens" },
      tokens_100: { tokens: 100, amountPaise: 59900, label: "100 repertorization tokens" },
    };
    const plan = plans[String(body?.planId ?? "")];
    if (!plan) return json(400, { error: "Unknown token package." }, origin);
    const amount = plan.amountPaise;
    const receipt = `cai_${doctor.id}_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount, currency: "INR", receipt,
        notes: { product: "ClassicAI token recharge", doctor_id: String(doctor.id), plan_id: String(body.planId), tokens: String(plan.tokens) },
      }),
    });
    const order = await r.json();
    if (!r.ok || !order?.id || order.amount !== amount || order.currency !== "INR") {
      console.error("Razorpay order creation failed", { status: r.status, code: order?.error?.code });
      return json(502, { error: "Could not create a payment order. Please try again later." }, origin);
    }

    const { error: insertError } = await admin.from("payment_orders").insert({
      doctor_id: doctor.id, auth_user_id: user.id, plan_id: String(body.planId),
      tokens: plan.tokens, amount_paise: amount, currency: "INR", razorpay_order_id: order.id, status: "created",
    });
    if (insertError) {
      console.error("Payment order record could not be saved", insertError);
      return json(500, { error: "Could not prepare the payment. Please try again." }, origin);
    }
    return json(200, {
      keyId, orderId: order.id, amount, currency: "INR",
      tokens: plan.tokens, name: "ClassicAI", description: plan.label,
      prefill: { name: doctor.doctor_name ?? "", email: user.email ?? "" },
    }, origin);
  } catch (error) {
    console.error("razorpay-create-order failed", error);
    return json(500, { error: "Could not prepare the payment. Please try again." }, origin);
  }
});