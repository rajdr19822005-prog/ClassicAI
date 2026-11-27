import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown, extra: Record<string,string> = {}) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, ...extra, "Content-Type": "application/json", "Cache-Control": "no-store" },
});
const isUuid = (v: unknown): v is string => typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const boundedText = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0,max) : "";
const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2,"0")).join("");
};
const validResult = (r: any) => {
  if (!r || typeof r.summary !== "string" || !Array.isArray(r.top_remedies) || !r.top_remedies.length) return false;
  if (!Array.isArray(r.missing_questions) || !Array.isArray(r.limitations)) return false;
  return r.top_remedies.length <= 5 && r.top_remedies.every((x: any) =>
    x && typeof x.name === "string" && x.name.trim().length > 0 &&
    Number.isFinite(Number(x.score)) && Number(x.score) >= 0 && Number(x.score) <= 100 &&
    Array.isArray(x.matching_evidence) && Array.isArray(x.contradictions) &&
    typeof x.materia_medica_comparison === "string" && typeof x.ves_interpretation === "string"
  );
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json(401, { error: "Doctor sign-in required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const aiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json(503, { error: "Secure repertorisation service is not configured" });
  if (!aiKey) return json(503, { code: "AI_PROVIDER_NOT_CONFIGURED", error: "AI service is not configured. No token was deducted." });

  let admin: any = null;
  let requestId = "";
  let doctorId: number | null = null;
  try {
    const raw = await req.text();
    if (raw.length > 24000) return json(413, { error: "Case payload is too large (maximum 24 KB)" });
    const body = JSON.parse(raw);
    if (!isUuid(body?.request_id)) return json(400, { error: "A valid request_id is required" });
    requestId = body.request_id;

    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await caller.auth.getUser();
    if (authError || !user) return json(401, { error: "Valid doctor sign-in required" });
    const { data: doctor, error: doctorError } = await caller.from("doctors")
      .select("id,status").eq("auth_user_id", user.id).eq("status", "Active").maybeSingle();
    if (doctorError || !doctor) return json(403, { error: "An active linked doctor account is required" });
    doctorId = Number(doctor.id);

    const narrative = boundedText(body.case_narrative ?? body.other_symptoms, 7000);
    const diagnosis = boundedText(body.diagnosis_category, 120);
    if (!diagnosis || narrative.length < 15) {
      return json(422, { error: "Provide a case category and a clinical narrative of at least 15 characters." });
    }
    const caseContext = {
      diagnosis_category: diagnosis,
      age: boundedText(body.case_age, 30),
      gender: boundedText(body.case_gender, 30),
      narrative,
      thermal: boundedText(body.thermal, 100),
      thirst: boundedText(body.thirst, 100),
      ves_level: boundedText(body.ves_level, 40),
    };
    const requestHash = await sha256(JSON.stringify(caseContext));
    admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    let { data: cached, error: cacheReadError } = await admin.from("repertorization_ai_requests")
      .select("request_hash,status,result,billing,model,lease_until")
      .eq("doctor_id", doctorId).eq("request_id", requestId).maybeSingle();
    if (cacheReadError) {
      console.error("AI request cache lookup failed", cacheReadError.code);
      return json(503, { error: "Idempotent request storage is unavailable. No token was deducted." });
    }
    if (cached && cached.request_hash !== requestHash) {
      return json(409, { code: "REQUEST_ID_REUSED", error: "This request ID is already bound to a different case. Start a new analysis." });
    }
    if (cached?.status === "completed" && cached.result && cached.billing) {
      return json(200, { success: true, request_id: requestId, engine_version: "3.0.0", model: cached.model, ...cached.result, ...cached.billing });
    }

    const now = Date.now();
    let ownsRequest = false;
    if (!cached) {
      const lease = new Date(now + 120000).toISOString();
      const { error: insertError } = await admin.from("repertorization_ai_requests").insert({
        doctor_id: doctorId, auth_user_id: user.id, request_id: requestId,
        request_hash: requestHash, status: "processing", lease_until: lease,
      });
      if (!insertError) ownsRequest = true;
      else if (insertError.code !== "23505") {
        console.error("AI request claim failed", insertError.code);
        return json(503, { error: "Could not reserve this analysis request. No token was deducted." });
      }
      if (!ownsRequest) {
        const reread = await admin.from("repertorization_ai_requests")
          .select("request_hash,status,result,billing,model,lease_until")
          .eq("doctor_id", doctorId).eq("request_id", requestId).maybeSingle();
        cached = reread.data;
        if (reread.error || !cached) return json(503, { error: "Could not confirm request state. Retry with the same request ID." });
        if (cached.request_hash !== requestHash) return json(409, { code: "REQUEST_ID_REUSED", error: "This request ID is already bound to a different case." });
      }
    }

    if (!ownsRequest && cached?.status === "ready_for_billing" && cached.result) {
      // Reuse the already validated result. Never pay the AI provider twice for this request ID.
    } else if (!ownsRequest && cached?.status === "processing" && cached.lease_until && Date.parse(cached.lease_until) > now) {
      return json(409, { code: "REQUEST_IN_PROGRESS", error: "This analysis is already running. Retry with the same request ID shortly." }, { "Retry-After": "5" });
    } else if (!ownsRequest) {
      const lease = new Date(now + 120000).toISOString();
      const { data: claimed, error: claimError } = await admin.from("repertorization_ai_requests")
        .update({ status: "processing", lease_until: lease, result: null, billing: null, model: null })
        .eq("doctor_id", doctorId).eq("request_id", requestId).eq("request_hash", requestHash)
        .or("status.eq.failed,and(status.eq.processing,lease_until.lte." + new Date(now).toISOString() + ")")
        .select("request_id").maybeSingle();
      if (claimError || !claimed) return json(409, { code: "REQUEST_IN_PROGRESS", error: "This request is being processed elsewhere. Retry with the same request ID." }, { "Retry-After": "5" });
      ownsRequest = true;
    }

    let result: any = cached?.status === "ready_for_billing" ? cached.result : null;
    let model = cached?.status === "ready_for_billing" ? cached.model : null;
    if (!result) {
      model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${aiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model, temperature: 0.15, response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `You provide preliminary, comparative homeopathic research hypotheses for a licensed physician. The request contains no licensed repertory database or verified source excerpts. Do not claim to query, reproduce, or be equivalent to Adonis Repertory, Complete Repertory, Synthesis, Kent, Boericke, or any named source. Do not invent rubric grades, page citations, source coverage, materia medica quotations, or clinical facts. Clearly state that remedy comparisons are model-generated and are not source-verified repertorisation. Analyze only the supplied case narrative and general model knowledge; where uncertain, say so. Do not diagnose, prescribe, recommend potency/dose, claim efficacy, or advise delaying evidence-based care. Do not use GNM as a causal or scoring framework. VES, if mentioned, must be clearly marked as an unvalidated interpretive framework and must not affect remedy ranking. Scores are heuristic comparisons, not probabilities. Return JSON only with keys: summary (string), dataset_scope (string), missing_questions (string[]), top_remedies (array of {name,score,matching_evidence:string[],contradictions:string[],materia_medica_comparison:string,ves_interpretation:string}), limitations (string[]). Include no more than 5 cautious candidate hypotheses. Include a limitation that the repertory and materia medica source data have not yet been integrated or independently verified.` },
            { role: "user", content: JSON.stringify(caseContext) },
          ],
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (!aiResponse.ok) {
        await admin.from("repertorization_ai_requests").update({ status: "failed", lease_until: new Date().toISOString() })
          .eq("doctor_id", doctorId).eq("request_id", requestId);
        console.error("AI provider returned non-success", aiResponse.status);
        return json(502, { error: "AI analysis failed. No token was deducted; retry later." });
      }
      const completion = await aiResponse.json();
      const content = completion?.choices?.[0]?.message?.content;
      try { result = typeof content === "string" ? JSON.parse(content) : null; } catch { result = null; }
      if (!validResult(result)) {
        await admin.from("repertorization_ai_requests").update({ status: "failed", lease_until: new Date().toISOString() })
          .eq("doctor_id", doctorId).eq("request_id", requestId);
        return json(502, { error: "AI returned an invalid or incomplete analysis. No token was deducted." });
      }
      result.top_remedies = result.top_remedies.slice(0,5).map((r: any) => ({
        ...r, name: boundedText(r.name,120), score: Number(r.score),
        matching_evidence: r.matching_evidence.filter((x: unknown) => typeof x === "string").slice(0,12).map((x: string)=>x.slice(0,500)),
        contradictions: r.contradictions.filter((x: unknown) => typeof x === "string").slice(0,12).map((x: string)=>x.slice(0,500)),
        materia_medica_comparison: boundedText(r.materia_medica_comparison,1600),
        ves_interpretation: boundedText(r.ves_interpretation,800),
      }));
      result.missing_questions = result.missing_questions.filter((x: unknown)=>typeof x==="string").slice(0,15).map((x:string)=>x.slice(0,500));
      result.limitations = result.limitations.filter((x: unknown)=>typeof x==="string").slice(0,15).map((x:string)=>x.slice(0,500));
      result.dataset_scope = "AI model knowledge only; no verified repertory or materia medica corpus is currently connected.";
      // Persist before billing. A retry can reuse this exact result without another model call.
      const { error: saveError } = await admin.from("repertorization_ai_requests").update({
        status: "ready_for_billing", result, model, lease_until: new Date(Date.now()+86400000).toISOString(),
      }).eq("doctor_id", doctorId).eq("request_id", requestId).eq("request_hash", requestHash);
      if (saveError) {
        console.error("Could not persist AI result before billing", saveError.code);
        return json(503, { error: "Analysis could not be safely finalized. No token was deducted; retry with the same request ID." });
      }
    }

    const { data: billing, error: billingError } = await caller.rpc("consume_repertorization_token", { p_request_id: requestId });
    if (billingError || !billing?.success || !Number.isSafeInteger(Number(billing.balance))) {
      const message = String(billingError?.message ?? "");
      if (message.includes("active ClassicAI Basic subscription is required")) return json(402, { code: "SUBSCRIPTION_REQUIRED", error: "An active ClassicAI Basic subscription is required. No token was deducted." });
      if (message.includes("Insufficient tokens")) return json(402, { code: "INSUFFICIENT_TOKENS", error: "Insufficient tokens. No token was deducted." });
      console.error("AI repertorisation billing failed", billingError?.code);
      return json(500, { error: "Analysis is ready but billing could not be confirmed. Retry with the same request ID." });
    }
    const billingPayload = { balance: Number(billing.balance), tokens_deducted: Number(billing.tokens_deducted || 1) };
    const { error: finishError } = await admin.from("repertorization_ai_requests").update({
      status: "completed", billing: billingPayload, lease_until: new Date().toISOString(),
    }).eq("doctor_id", doctorId).eq("request_id", requestId).eq("request_hash", requestHash);
    if (finishError) {
      console.error("AI request completion persistence failed", finishError.code);
      return json(500, { error: "Billing was processed; retry with the same request ID to retrieve the result safely." });
    }
    return json(200, { success: true, request_id: requestId, engine_version: "3.0.0", model, ...result, ...billingPayload });
  } catch (error) {
    if (admin && doctorId && requestId) {
      try {
        await admin.from("repertorization_ai_requests").update({ status: "failed", lease_until: new Date().toISOString() })
          .eq("doctor_id", doctorId).eq("request_id", requestId).eq("status", "processing");
      } catch (_) {}
    }
    console.error("ai-repertorize failed", error);
    return json(500, { error: "Repertorisation could not be completed. Retry with the same request ID; no token is deducted before validated output." });
  }
});
