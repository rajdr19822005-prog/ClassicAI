// Supabase Edge Function: doctor-admin
// Required function secrets: SUPABASE_URL, SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY, ADMIN_ALLOWED_ORIGIN (exact HTTPS origin).
// Never place the service-role key in browser code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const url = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const allowedOrigin = Deno.env.get("ADMIN_ALLOWED_ORIGIN")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req) => {
  if (!allowedOrigin || req.headers.get("origin") !== allowedOrigin) {
    return new Response("Forbidden origin", { status: 403 });
  }
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "Sign in required" });

  // Validate the caller's access token with Supabase Auth; never trust browser-supplied role fields.
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await caller.auth.getUser();
  if (userError || !user || user.app_metadata?.role !== "admin") {
    return json(403, { error: "Administrator access required" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "list_doctors") {
      const { data, error } = await admin.from("doctors")
        .select("id,doctor_name,clinic_name,reg_no,whatsapp_no,ai_tokens,status,auth_user_id,created_at")
        .order("id", { ascending: false });
      if (error) throw error;
      return json(200, { doctors: data ?? [] });
    }

    if (action === "invite_doctor") {
      const doctorId = Number(body?.doctorId);
      const email = String(body?.email ?? "").trim().toLowerCase();
      if (!Number.isSafeInteger(doctorId) || doctorId < 1 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(400, { error: "Valid doctorId and email are required" });
      }

      const { data: doctor, error: lookupError } = await admin.from("doctors")
        .select("id,doctor_name,reg_no,status,auth_user_id")
        .eq("id", doctorId).maybeSingle();
      if (lookupError) throw lookupError;
      if (!doctor) return json(404, { error: "Doctor not found" });
      if (doctor.status !== "Active") return json(409, { error: "Approve/activate the doctor before inviting" });
      if (doctor.auth_user_id) return json(409, { error: "Doctor is already linked to an Auth account" });

      const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { doctor_reg: doctor.reg_no },
      });
      if (inviteError) throw inviteError;
      if (!invited.user) throw new Error("Supabase Auth did not return the invited user");

      const { error: linkError } = await admin.from("doctors")
        .update({ auth_user_id: invited.user.id })
        .eq("id", doctorId).is("auth_user_id", null);
      if (linkError) {
        // Avoid deleting the invite automatically: the invitation may already have been delivered.
        throw new Error("Invite sent, but doctor mapping failed. An administrator must reconcile auth_user_id.");
      }
      return json(200, { success: true, doctorId, authUserId: invited.user.id, message: "Invitation sent and account linked" });
    }

    if (action === "set_status") {
      const doctorId = Number(body?.doctorId);
      const status = body?.status;
      if (!Number.isSafeInteger(doctorId) || doctorId < 1 || !["Active", "Inactive", "Pending"].includes(status)) {
        return json(400, { error: "Valid doctorId and status are required" });
      }
      const { error } = await admin.from("doctors").update({ status }).eq("id", doctorId);
      if (error) throw error;
      return json(200, { success: true });
    }

    if (action === "set_tokens") {
      const doctorId = Number(body?.doctorId);
      const tokens = Number(body?.tokens);
      if (!Number.isSafeInteger(doctorId) || doctorId < 1 ||
          !Number.isSafeInteger(tokens) || tokens < 0 || tokens > 1000000) {
        return json(400, { error: "Valid doctorId and token amount (0–1,000,000) are required" });
      }
      const { error } = await admin.from("doctors").update({ ai_tokens: tokens }).eq("id", doctorId);
      if (error) throw error;
      return json(200, { success: true });
    }

    return json(400, { error: "Unknown action" });
  } catch (error) {
    // Do not return database details or secrets to the browser.
    console.error("doctor-admin failure", error);
    return json(500, { error: "Request failed; check the function logs" });
  }
});
