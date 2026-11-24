import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const url = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? "";
const allowedOrigin = (origin: string | null) => !origin || origin === "https://classicai.vercel.app" ||
  origin === "null" || origin === "http://localhost" || origin === "http://127.0.0.1" ||
  (origin.startsWith("https://classicai-") && origin.endsWith(".vercel.app"));
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigin(origin) ? origin : "https://classicai.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
});
const reply = (status: number, body: unknown, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" }, origin);
  if (!allowedOrigin(origin)) return reply(403, { error: "Origin not allowed" }, origin);
  if (!url || !anonKey || !serviceKey) return reply(503, { error: "Registration service is not configured." }, origin);
  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return reply(401, { error: "Email verification and sign-in are required before submitting an application." }, origin);
  try {
    const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await auth.auth.getUser(authorization.slice(7));
    if (authError || !user || !user.email) return reply(401, { error: "A valid signed-in account is required." }, origin);
    if (!user.email_confirmed_at && !user.confirmed_at) return reply(403, { error: "Please verify your email before submitting the application." }, origin);

    const meta = user.user_metadata ?? {};
    const applicantType = String(meta.applicant_type ?? "");
    if (!["doctor", "student"].includes(applicantType)) return reply(400, { error: "No Doctor / Medical Student registration form was found for this account." }, origin);
    const doctorName = String(meta.doctor_name ?? "").trim();
    const registrationType = String(meta.registration_type ?? "");
    const regNo = String(meta.reg_no ?? "").trim();
    const college = String(meta.college_name ?? "").trim();
    const course = String(meta.course_name ?? "").trim();
    const studentId = String(meta.student_id ?? "").trim();
    const year = String(meta.study_year ?? "").trim();
    const clinicName = String(meta.clinic_name ?? "").trim();
    const phone = String(meta.whatsapp_no ?? "").trim();
    if (!doctorName || doctorName.length > 120 || clinicName.length > 160 || phone.length > 30) return reply(400, { error: "Applicant profile fields are invalid." }, origin);
    if (applicantType === "doctor" && (!["permanent", "provisional"].includes(registrationType) || !regNo || regNo.length > 80)) {
      return reply(400, { error: "Valid permanent or provisional council registration details are required." }, origin);
    }
    if (applicantType === "student" && (registrationType !== "student" || !college || college.length > 180 || !course || course.length > 100 || !studentId || studentId.length > 100)) {
      return reply(400, { error: "College, course and Student ID / Roll number are required for student applications." }, origin);
    }

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }, origin);
    const { data: existing, error: existingError } = await admin.from("doctors")
      .select("id,status,applicant_type,registration_type")
      .eq("auth_user_id", user.id).maybeSingle();
    if (existingError) throw existingError;
    if (existing) return reply(200, { registered: true, status: existing.status, doctorId: existing.id, applicantType: existing.applicant_type }, origin);

    const effectiveRegNo = applicantType === "student" ? "STUDENT-" + crypto.randomUUID() : regNo;
    const { data: duplicate, error: duplicateError } = await admin.from("doctors")
      .select("id").eq("reg_no", effectiveRegNo).maybeSingle();
    if (duplicateError) throw duplicateError;
    if (duplicate) return reply(409, { error: "This registration / identifier already exists. Contact ClassicAI Admin to reconcile the existing record." }, origin);

    const record = {
      doctor_name: doctorName,
      clinic_name: applicantType === "student" ? (college + (clinicName ? " · " + clinicName : "")) : clinicName,
      reg_no: effectiveRegNo,
      access_pin: crypto.randomUUID() + crypto.randomUUID(),
      ai_tokens: 0,
      status: "Pending",
      auth_user_id: user.id,
      applicant_type: applicantType,
      registration_type: registrationType,
      college_name: applicantType === "student" ? college : null,
      course_name: applicantType === "student" ? course : null,
      study_year: year || null,
      student_id: applicantType === "student" ? studentId : null,
      whatsapp_no: phone || null,
      verification_status: "pending"
    };
    const { data: created, error: createError } = await admin.from("doctors")
      .insert(record)
      .select("id,status,applicant_type,registration_type")
      .single();
    if (createError) {
      if (createError.code === "23505") return reply(409, { error: "An application with this registration number or account already exists." }, origin);
      throw createError;
    }
    return reply(201, { registered: true, status: created.status, doctorId: created.id, applicantType: created.applicant_type, message: "Application submitted for Admin verification." }, origin);
  } catch (error) {
    console.error("register-applicant failed", error);
    return reply(500, { error: "Application could not be submitted. Please retry after signing in." }, origin);
  }
});
