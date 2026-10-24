-- REVIEW-ONLY proposal for the current ClassicAI Supabase project.
-- DO NOT RUN until a Supabase Auth user has been created and mapped to the existing doctor row.
-- This script intentionally enables RLS only together with ownership policies.
-- It has NOT been applied to the live database.

BEGIN;

ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.patient_cases
  ADD COLUMN IF NOT EXISTS doctor_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT;

-- Existing rows remain inaccessible until the administrator assigns doctors.auth_user_id
-- and any existing patient_cases rows are backfilled to doctor_user_id.

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS doctors_select_own_profile ON public.doctors;
CREATE POLICY doctors_select_own_profile
  ON public.doctors
  FOR SELECT TO authenticated
  USING (auth_user_id = (SELECT auth.uid()) AND status = 'Active');

DROP POLICY IF EXISTS patient_cases_select_own ON public.patient_cases;
CREATE POLICY patient_cases_select_own
  ON public.patient_cases
  FOR SELECT TO authenticated
  USING (doctor_user_id = (SELECT auth.uid()) AND doctor_reg = (SELECT d.reg_no FROM public.doctors d WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'));

DROP POLICY IF EXISTS patient_cases_insert_own ON public.patient_cases;
CREATE POLICY patient_cases_insert_own
  ON public.patient_cases
  FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = (SELECT auth.uid()) AND doctor_reg = (SELECT d.reg_no FROM public.doctors d WHERE d.auth_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS patient_cases_update_own ON public.patient_cases;
CREATE POLICY patient_cases_update_own
  ON public.patient_cases
  FOR UPDATE TO authenticated
  USING (doctor_user_id = (SELECT auth.uid()) AND doctor_reg = (SELECT d.reg_no FROM public.doctors d WHERE d.auth_user_id = (SELECT auth.uid())))
  WITH CHECK (doctor_user_id = (SELECT auth.uid()) AND doctor_reg = (SELECT d.reg_no FROM public.doctors d WHERE d.auth_user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS patient_cases_delete_own ON public.patient_cases;
CREATE POLICY patient_cases_delete_own
  ON public.patient_cases
  FOR DELETE TO authenticated
  USING (doctor_user_id = (SELECT auth.uid()) AND doctor_reg = (SELECT d.reg_no FROM public.doctors d WHERE d.auth_user_id = (SELECT auth.uid()) AND d.status = 'Active'));

REVOKE ALL ON public.doctors FROM anon, authenticated;
REVOKE SELECT (access_pin) ON public.doctors FROM anon, authenticated;
GRANT SELECT (id, doctor_name, clinic_name, reg_no, ai_tokens, status, created_at, whatsapp_no, promo_used, auth_user_id) ON public.doctors TO authenticated;

REVOKE ALL ON public.patient_cases FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_cases TO authenticated;

COMMIT;

-- After migration:
-- 1. Create/verify a Supabase Auth user for each doctor using a strong password.
-- 2. Assign doctors.auth_user_id to that user's auth.users.id using an administrator-only session.
-- 3. Ensure case writes set doctor_user_id from the authenticated user's ID, never from a client-supplied doctor registration number.
-- 4. Move token balances and payments behind server-side functions; never grant client UPDATE on doctors.
-- 5. After migration and account reset, securely remove the legacy plaintext access_pin column.
-- 6. Run Supabase Security Advisor and test anon/authenticated access before enabling cloud features.
