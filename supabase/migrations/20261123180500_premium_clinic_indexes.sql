-- Cover tenant identity and composite patient foreign keys for premium module query paths.
create index if not exists clinic_patients_auth_user_idx on public.clinic_patients (auth_user_id);
create index if not exists clinic_medicines_auth_user_idx on public.clinic_medicines (auth_user_id);
create index if not exists clinic_invoices_auth_user_idx on public.clinic_invoices (auth_user_id);
create index if not exists clinic_followups_auth_user_idx on public.clinic_followups (auth_user_id);
create index if not exists clinic_invoices_patient_doctor_fk_idx on public.clinic_invoices (patient_id, doctor_id);
create index if not exists clinic_followups_patient_doctor_fk_idx on public.clinic_followups (patient_id, doctor_id);
