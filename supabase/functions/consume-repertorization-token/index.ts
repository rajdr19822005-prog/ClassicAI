import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("MEDICAL_AI_PROJECT_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("MEDICAL_AI_ANON_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("MEDICAL_AI_SERVICE_ROLE_KEY") ?? (() => {
  try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ?? ""; } catch { return ""; }
})();

const corsHeaders = {
  // Authorization is enforced by validating the JWT below; CORS is not auth.
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { success: false, error: "Method not allowed" });
  if (!supabaseUrl || !anonKey || !serviceKey) {
    console.error("Token consumption function is missing Supabase configuration");
    return json(503, { success: false, error: "Secure token service is not configured" });
  }

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return json(401, { success: false, error: "Sign in with an approved doctor account" });
  }

  try {
    const caller = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await caller.auth.getUser(authorization.slice(7));
    if (authError || !user) {
      return json(401, { success: false, error: "Your session is invalid or expired. Sign in again." });
    }

    const body = await req.json();
    const requestId = String(body?.request_id ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return json(400, { success: false, error: "A valid request ID is required" });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await admin.rpc("consume_repertorization_token", {
      p_auth_user_id: user.id,
      p_request_id: requestId,
    });
    if (error) {
      console.error("Token consumption RPC failed", { code: error.code });
      return json(500, { success: false, error: "Could not update the token balance. Please retry safely." });
    }
    if (!data?.success) {
      return json(402, {
        success: false,
        error: data?.error ?? "Token consumption was not completed",
        remaining_tokens: Number(data?.remaining_tokens ?? 0),
      });
    }
    return json(200, {
      success: true,
      already_processed: Boolean(data.already_processed),
      remaining_tokens: Number(data.remaining_tokens),
    });
  } catch (error) {
    console.error("consume-repertorization-token failed", error);
    return json(400, { success: false, error: "Invalid token consumption request" });
  }
});
