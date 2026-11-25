-- Persistent patient-case archive. The existing table is empty and already has owner-scoped RLS policies.
ALTER TABLE public.patient_cases
  ADD COLUMN IF NOT EXISTS patient_age text,
  ADD COLUMN IF NOT EXISTS patient_gender text,
  ADD COLUMN IF NOT EXISTS disease_type text,
  ADD COLUMN IF NOT EXISTS diagnosis_title text,
  ADD COLUMN IF NOT EXISTS thermal text,
  ADD COLUMN IF NOT EXISTS thirst text,
  ADD COLUMN IF NOT EXISTS followup_date date,
  ADD COLUMN IF NOT EXISTS doctor_notes text;

ALTER TABLE public.patient_cases
  ALTER COLUMN doctor_user_id SET NOT NULL,
  ALTER COLUMN doctor_reg SET NOT NULL;

CREATE INDEX IF NOT EXISTS patient_cases_owner_created_at_idx
  ON public.patient_cases (doctor_user_id, created_at DESC);

REVOKE ALL ON TABLE public.patient_cases FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.patient_cases TO authenticated;

ALTER TABLE public.patient_cases ENABLE ROW LEVEL SECURITY;