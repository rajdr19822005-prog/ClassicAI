import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});
const isUuid = (v: unknown): v is string => typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "Doctor sign-in required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const aiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !anonKey) return json(503, { error: "Secure repertorisation service is not configured" });
  if (!aiKey) return json(503, { code: "AI_PROVIDER_NOT_CONFIGURED", error: "AI service is not configured. No token was deducted. Ask the administrator to configure OPENAI_API_KEY." });

  try {
    const raw = await req.text();
    if (raw.length > 24000) return json(413, { error: "Case payload is too large (maximum 24 KB)" });
    const body = JSON.parse(raw);
    if (!isUuid(body?.request_id)) return json(400, { error: "A valid request_id is required" });
    const rubrics = Array.isArray(body?.selected_rubrics) ? body.selected_rubrics.filter((x: unknown) => typeof x === "string").slice(0, 100) : [];
    const candidates = Array.isArray(body?.candidate_remedies) ? body.candidate_remedies.slice(0, 100) : [];
    if (!rubrics.length) return json(422, { error: "Select at least one repertory symptom or rubric before analysis" });
    if (!candidates.length) return json(422, { error: "No remedy catalogue was supplied" });

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return json(401, { error: "Valid doctor sign-in required" });

    const { data: doctor, error: doctorError } = await caller.from("doctors")
      .select("id,status").eq("auth_user_id", user.id).eq("status", "Active").maybeSingle();
    if (doctorError || !doctor) return json(403, { error: "An active linked doctor account is required" });

    const caseContext = {
      diagnosis_category: String(body?.diagnosis_category ?? "").slice(0, 120),
      selected_rubrics: rubrics,
      other_symptoms: String(body?.other_symptoms ?? "").slice(0, 5000),
      thermal: String(body?.thermal ?? "").slice(0, 100),
      thirst: String(body?.thirst ?? "").slice(0, 100),
      ves_level: String(body?.ves_level ?? "").slice(0, 40),
      gnm_conflicts: rubrics.filter((r: string) => r.startsWith("GNM:")),
      candidate_remedies: candidates.map((r: any) => ({
        name: String(r?.name ?? "").slice(0, 120),
        thermal: String(r?.thermal ?? "").slice(0, 120),
        miasm: String(r?.miasm ?? "").slice(0, 120),
        keySymptoms: Array.isArray(r?.keySymptoms) ? r.keySymptoms.slice(0, 30) : [],
        keywords: Array.isArray(r?.keywords) ? r.keywords.slice(0, 60) : [],
        materiaMedicaNote: String(r?.shortNote ?? "").slice(0, 700),
        vesAffinity: String(r?.vesAffinity ?? "").slice(0, 300),
        gnmMatches: Array.isArray(r?.gnmMatches) ? r.gnmMatches.slice(0, 10) : [],
      })),
    };

    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `You are a clinical decision-support assistant for a licensed physician using a homeopathic repertorisation research tool. Analyze only the supplied case and candidate remedy records. Never invent repertory rubric grades, source citations, materia medica facts, remedy coverage, or patient facts. Do not diagnose, prescribe, recommend potency/dose, or claim homeopathy is proven effective. Treat VES as a separately reported interpretive framework and explicitly label it as a modelled interpretation, not a validated clinical measurement. GNM is a separate, non-evidence-based hypothesis layer: do not use GNM conflicts to increase remedy scores or infer that a conflict caused disease. Rank candidates primarily by direct selected-rubric/key-symptom concordance, modalities, generals and contradictions. Report missing questions and explicit contradictions. Scores are comparative heuristic scores, not probabilities. Return JSON only with keys: summary (string), dataset_scope (string), missing_questions (string[]), top_remedies (array of objects {name, score, matching_evidence:string[], contradictions:string[], materia_medica_comparison:string, ves_interpretation:string}), gnm_observations (string[]), limitations (string[]). Include at most 5 remedies. If evidence is weak, say so.` },
          { role: "user", content: JSON.stringify(caseContext) },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!aiResponse.ok) {
      console.error("AI provider returned non-success", aiResponse.status);
      return json(502, { error: "AI analysis failed. No token was deducted; retry later." });
    }
    const completion = await aiResponse.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return json(502, { error: "AI returned an invalid result. No token was deducted." });
    let result: any;
    try { result = JSON.parse(content); } catch { return json(502, { error: "AI returned malformed analysis. No token was deducted." }); }
    if (!Array.isArray(result.top_remedies) || !result.top_remedies.length) {
      return json(502, { error: "AI analysis did not contain ranked remedies. No token was deducted." });
    }
    const allowed = new Set(caseContext.candidate_remedies.map((r: any) => r.name));
    result.top_remedies = result.top_remedies.filter((r: any) => allowed.has(r?.name)).slice(0, 5);
    if (!result.top_remedies.length) return json(502, { error: "AI returned remedies outside the supplied catalogue. No token was deducted." });

    // Charge only after a valid AI result. Existing RPC enforces subscription,
    // active doctor status, balance and idempotent request_id semantics.
    const { data: billing, error: billingError } = await caller.rpc("consume_repertorization_token", {
      p_request_id: body.request_id,
    });
    if (billingError || !billing?.success || !Number.isSafeInteger(Number(billing.balance))) {
      const message = String(billingError?.message ?? "");
      if (message.includes("active ClassicAI Basic subscription is required")) {
        return json(402, { code: "SUBSCRIPTION_REQUIRED", error: "An active ClassicAI Basic subscription is required. No token was deducted." });
      }
      if (message.includes("Insufficient tokens")) return json(402, { code: "INSUFFICIENT_TOKENS", error: "Insufficient tokens. No token was deducted." });
      console.error("AI repertorisation billing failed", billingError?.code);
      return json(500, { error: "Analysis completed but token deduction could not be confirmed. Retry with the same request ID." });
    }

    return json(200, {
      success: true,
      balance: Number(billing.balance),
      request_id: body.request_id,
      engine_version: "2.0.0",
      model,
      ...result,
    });
  } catch (error) {
    console.error("ai-repertorize failed", error);
    return json(500, { error: "Repertorisation could not be completed. No token was deducted unless the request reached the final billing step." });
  }
});
