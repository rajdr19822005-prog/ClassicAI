-- Migration proposal. Review before applying to any environment; take a database backup first.
-- This migration changes access control and will block legacy PIN-based browser access.
BEGIN;

ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.patient_cases
  ADD COLUMN IF NOT EXISTS doctor_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS doctors_select_own_profile ON public.doctors;
CREATE POLICY doctors_select_own_profile ON public.doctors
  FOR SELECT TO authenticated
  USING (auth_user_id = (SELECT auth.uid()) AND status = 'Active');

DROP POLICY IF EXISTS patient_cases_select_own ON public.patient_cases;
CREATE POLICY patient_cases_select_own ON public.patient_cases
  FOR SELECT TO authenticated
  USING (
    doctor_user_id = (SELECT auth.uid())
    AND doctor_reg = (
      SELECT d.reg_no FROM public.doctors d
      WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'
    )
  );

DROP POLICY IF EXISTS patient_cases_insert_own ON public.patient_cases;
CREATE POLICY patient_cases_insert_own ON public.patient_cases
  FOR INSERT TO authenticated
  WITH CHECK (
    doctor_user_id = (SELECT auth.uid())
    AND doctor_reg = (
      SELECT d.reg_no FROM public.doctors d
      WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'
    )
  );

DROP POLICY IF EXISTS patient_cases_update_own ON public.patient_cases;
CREATE POLICY patient_cases_update_own ON public.patient_cases
  FOR UPDATE TO authenticated
  USING (
    doctor_user_id = (SELECT auth.uid())
    AND doctor_reg = (
      SELECT d.reg_no FROM public.doctors d
      WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'
    )
  )
  WITH CHECK (
    doctor_user_id = (SELECT auth.uid())
    AND doctor_reg = (
      SELECT d.reg_no FROM public.doctors d
      WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'
    )
  );

DROP POLICY IF EXISTS patient_cases_delete_own ON public.patient_cases;
CREATE POLICY patient_cases_delete_own ON public.patient_cases
  FOR DELETE TO authenticated
  USING (
    doctor_user_id = (SELECT auth.uid())
    AND doctor_reg = (
      SELECT d.reg_no FROM public.doctors d
      WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'
    )
  );

-- Remove broad table grants first, then expose only safe doctor profile fields.
REVOKE ALL ON public.doctors FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.patient_cases FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, doctor_name, clinic_name, reg_no, whatsapp_no, ai_tokens, status, created_at, auth_user_id)
  ON public.doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_cases TO authenticated;

COMMIT;

-- Before enabling production access:
-- 1. Configure an administrator account with app_metadata.role = 'admin' through a trusted admin process.
--    Do not set this from user-editable user_metadata or a public client.
-- 2. Set Edge Function secrets: SUPABASE_URL, SUPABASE_ANON_KEY,
--    SUPABASE_SERVICE_ROLE_KEY, ADMIN_ALLOWED_ORIGIN.
-- 3. Deploy doctor-admin and change the ADMIN app to call it with the signed-in admin access token.
-- 4. Test anon denial, doctor A vs doctor B isolation, inactive doctor denial, and invite/link failure recovery.
-- 5. Verify table/column grants against the actual schema. This policy assumes patient_cases.doctor_reg exists.
-- 6. Confirm all app clients use the new publishable key and no legacy direct write paths remain.
-- 7. Run Supabase security advisors after applying, and test using two real Auth sessions.
-- 8. Do not enable cloud case history until client-side save/load paths explicitly send doctor_user_id from the verified session.
-- 9. Backfill existing cases before enabling cloud case history; do not guess owner mappings.
-- 10. Move token updates into the server and remove access_pin only after the migration/reset process is complete.
