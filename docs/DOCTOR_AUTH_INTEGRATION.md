# Secure doctor authentication integration (staged)

This branch contains the staged secure-auth integration. The Edge Function and RLS migration have been activated in the live Supabase project, but this does **not** make the application production-ready until frontend deployment and isolation tests pass.

## Components

- `supabase/functions/doctor-admin/index.ts`: server-only doctor management endpoint. It validates a Supabase Auth access token and requires trusted `app_metadata.role === "admin"`. The service-role key is read only from Edge Function secrets.
- `docs/doctor-auth-rls-migration.sql`: reviewed migration proposal for per-doctor row-level security. It has not been applied to the live database.
- `admin-app/ClassicalAIAdmin-secure.html` now provides an Auth-based admin UI and calls the Edge Function for list/invite/status/token operations. It must not write the `doctors` table directly or store access PINs. Configure its public project URL/key in the UI and host it on the exact origin configured for the function.
- `assets/web/index.html` and `assets/web/app.js` now implement email/password Supabase Auth login and load only the current user's active doctor profile using `auth_user_id`. The `auth_user_id` column and RLS policy are live; doctor sign-in still requires the doctor Auth account to be invited and linked to an active doctor row. Case writes remain disabled and must derive identity from the authenticated session and include the mapped `doctor_user_id`.

## Deployment checklist

1. Create an admin identity in Supabase Auth and set `app_metadata.role = "admin"` using a trusted dashboard/server-side process. Never set it from the public client or `user_metadata`.
2. Set Edge Function secrets: `MEDICAL_AI_PROJECT_URL`, `MEDICAL_AI_ANON_KEY`, `MEDICAL_AI_SERVICE_ROLE_KEY`, and `ADMIN_ALLOWED_ORIGIN` (the exact HTTPS origin serving the ADMIN app). Supabase reserves the `SUPABASE_` prefix for built-in secrets.
3. Deploy the Edge Function and test the unauthenticated and non-admin paths first.
4. Host `admin-app/ClassicalAIAdmin-secure.html` on the approved HTTPS origin; sign in with Supabase Auth, collect a doctor's email (not a reusable PIN), and invoke the function. Do not send initial passwords or PINs over WhatsApp.
5. Review and apply the SQL migration only after confirming schema, backup, and the doctor-to-auth mapping plan. Applying it changes live access behavior.
6. Update ClassicAI to sign in through Supabase Auth, then test two separate doctor accounts for cross-account isolation.
7. Remove legacy plaintext `access_pin` only after all approved doctors have migrated and reset their credentials.

## Important

- Do not set real patient data in the current demo.
- The configured ADMIN origin is `https://classicai.vercel.app`; confirm the secure admin page is served from that exact origin before using admin operations.
- If an invite is delivered but the doctor mapping fails, reconcile the account manually before retrying.
- The Edge Function intentionally does not accept client-supplied roles, PINs, doctor registration numbers as ownership proof, or service-role credentials.


## Current implementation checkpoint (2026-10-24)

- ClassicAI login form and client logic now use Supabase Auth email/password and query the active doctor profile by the authenticated user's UID.
- A public publishable key is configured in `assets/web/supabase-config.js`; this is intended for browser use. No service-role key is committed.
- The replacement ADMIN page, Edge Function scaffold, and RLS proposal are on branch `feat/secure-doctor-auth` and PR #1.
- Live RLS migration has been applied and verified enabled on `public.doctors` and `public.patient_cases`; `doctor-admin` has been deployed with JWT verification enabled. The function reads the custom secret names listed above. Before production use, verify the current secrets, publish the corrected frontend build, and complete two-doctor isolation tests. Do not enable cloud case saving until those tests pass.
