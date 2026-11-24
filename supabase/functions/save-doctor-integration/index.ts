import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return reply({ error: "Authentication required" }, 401);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    if (!url || !anonKey) throw new Error("Supabase client configuration is unavailable");
    const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return reply({ error: "Invalid doctor session" }, 401);
    const body = await req.json();
    const provider = String(body?.provider ?? "");
    if (!["ai", "sms", "whatsapp"].includes(provider)) return reply({ error: "Unsupported integration provider" }, 400);
    const config = body?.config && typeof body.config === "object" && !Array.isArray(body.config) ? body.config : {};
    const secret = typeof body?.secret === "string" ? body.secret : "";
    if (JSON.stringify(config).length > 8192 || secret.length > 12000) return reply({ error: "Configuration is too large" }, 413);
    const { data, error } = await client.rpc("save_doctor_integration", {
      p_provider: provider, p_config: config, p_secret: secret
    });
    if (error) return reply({ error: error.message }, 400);
    return reply({ success: true, result: data });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Integration settings could not be saved" }, 500);
  }
});
