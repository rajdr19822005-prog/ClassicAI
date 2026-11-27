-- Doctor and medical-student registration profiles.
-- Applicants are always Pending; only an administrator can approve/activate access.
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS applicant_type text NOT NULL DEFAULT 'doctor'
    CHECK (applicant_type IN ('doctor','student')),
  ADD COLUMN IF NOT EXISTS registration_type text NOT NULL DEFAULT 'permanent'
    CHECK (registration_type IN ('permanent','provisional','student')),
  ADD COLUMN IF NOT EXISTS college_name text,
  ADD COLUMN IF NOT EXISTS course_name text,
  ADD COLUMN IF NOT EXISTS study_year text,
  ADD COLUMN IF NOT EXISTS student_id text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected'));

ALTER TABLE public.doctors
  ADD CONSTRAINT doctors_student_profile_check
  CHECK (
    (applicant_type = 'doctor' AND registration_type IN ('permanent','provisional'))
    OR
    (applicant_type = 'student' AND registration_type = 'student'
      AND nullif(btrim(college_name),'') IS NOT NULL
      AND nullif(btrim(course_name),'') IS NOT NULL
      AND nullif(btrim(student_id),'') IS NOT NULL)
  ) NOT VALID;

ALTER TABLE public.doctors VALIDATE CONSTRAINT doctors_student_profile_check;

CREATE INDEX IF NOT EXISTS doctors_applicant_status_idx
  ON public.doctors(applicant_type,status,created_at DESC);

COMMENT ON COLUMN public.doctors.applicant_type IS 'doctor or medical student; self-declared profile, subject to administrator verification';
COMMENT ON COLUMN public.doctors.registration_type IS 'permanent, provisional, or student';
COMMENT ON COLUMN public.doctors.verification_status IS 'administrator-controlled application verification state';
