import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "Sign in required" });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return json(500, { error: "Token service is not configured" });

  try {
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return json(401, { error: "Valid doctor sign-in required" });

    const body = await req.json().catch(() => null);
    const requestId = body?.request_id;
    if (typeof requestId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return json(400, { error: "A valid repertorization request ID is required" });
    }

    const { data, error } = await caller.rpc("consume_repertorization_token", {
      p_request_id: requestId,
    });
    if (error) {
      const message = String(error.message ?? "");
      if (message.includes("Insufficient tokens")) {
        return json(402, { success: false, code: "INSUFFICIENT_TOKENS", error: "Insufficient tokens. Please contact the administrator to recharge your account." });
      }
      if (message.includes("Active doctor account not found") || error.code === "42501") {
        return json(403, { success: false, code: "ACTIVE_DOCTOR_REQUIRED", error: "An active linked doctor account is required." });
      }
      console.error("consume-repertorization-token RPC failed", { code: error.code });
      return json(500, { success: false, error: "Token deduction could not be completed. Retry the same repertorization safely." });
    }

    if (!data || data.success !== true || !Number.isSafeInteger(Number(data.balance))) {
      return json(500, { success: false, error: "Token service returned an invalid result. Retry safely." });
    }
    return json(200, data);
  } catch (error) {
    console.error("consume-repertorization-token failed", error);
    return json(500, { success: false, error: "Token deduction could not be completed. Retry the same repertorization safely." });
  }
});
