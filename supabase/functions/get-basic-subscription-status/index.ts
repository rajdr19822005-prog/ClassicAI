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
  if (!supabaseUrl || !anonKey || !serviceKey) return json(503, { error: "Subscription status service is not configured." }, origin);
  const user = await authenticatedUser(req);
  if (!user) return json(401, { error: "Please sign in again." }, origin);
  try {
    const admin = adminClient();
    const { data: doctor, error: doctorError } = await admin.from("doctors")
      .select("id, ai_tokens, status").eq("auth_user_id", user.id).eq("status", "Active").maybeSingle();
    if (doctorError || !doctor) return json(403, { error: "An active approved doctor account is required." }, origin);
    const { data: subscription, error } = await admin.from("doctor_subscriptions")
      .select("plan_id, status, starts_at, expires_at")
      .eq("doctor_id", doctor.id).eq("auth_user_id", user.id).maybeSingle();
    if (error) throw error;
    const active = Boolean(subscription && subscription.status === "active" &&
      new Date(subscription.starts_at).getTime() <= Date.now() &&
      new Date(subscription.expires_at).getTime() > Date.now());
    return json(200, {
      active, planId: subscription?.plan_id ?? null,
      startsAt: subscription?.starts_at ?? null, expiresAt: subscription?.expires_at ?? null,
      balance: Number(doctor.ai_tokens ?? 0), pricePaise: 299900,
      creditsIncluded: 50, validityMonths: 12,
      checkoutEnabled: paymentsEnabled && Boolean(keyId && keySecret)
    }, origin);
  } catch (error) {
    console.error("get-basic-subscription-status failed", error);
    return json(500, { error: "Could not load subscription status." }, origin);
  }
});
