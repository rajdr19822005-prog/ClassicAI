# Secure doctor authentication integration (staged)

This branch prepares a backend-controlled doctor administration path. It is **not live-enabled** and does not make the current demo production-ready.

## Components

- `supabase/functions/doctor-admin/index.ts`: server-only doctor management endpoint. It validates a Supabase Auth access token and requires trusted `app_metadata.role === "admin"`. The service-role key is read only from Edge Function secrets.
- `docs/doctor-auth-rls-migration.sql`: reviewed migration proposal for per-doctor row-level security. It has not been applied to the live database.
- The ADMIN app must be updated to use Supabase Auth for administrator sign-in and call the Edge Function for list/invite/status/token operations. It must not write the `doctors` table directly or store access PINs.
- ClassicAI doctor sign-in must use Supabase Auth and query only the authenticated doctor's profile. Case writes must derive identity from the authenticated session and include the mapped `doctor_user_id`.

## Deployment checklist

1. Create an admin identity in Supabase Auth and set `app_metadata.role = "admin"` using a trusted dashboard/server-side process. Never set it from the public client or `user_metadata`.
2. Set Edge Function secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_ALLOWED_ORIGIN` (the exact HTTPS origin serving the ADMIN app).
3. Deploy the Edge Function and test the unauthenticated and non-admin paths first.
4. Update the ADMIN HTML to sign in with Supabase Auth, collect a doctor's email (not a reusable PIN), and invoke the function. Do not send initial passwords or PINs over WhatsApp.
5. Review and apply the SQL migration only after confirming schema, backup, and the doctor-to-auth mapping plan. Applying it changes live access behavior.
6. Update ClassicAI to sign in through Supabase Auth, then test two separate doctor accounts for cross-account isolation.
7. Remove legacy plaintext `access_pin` only after all approved doctors have migrated and reset their credentials.

## Important

- Do not set real patient data in the current demo.
- Do not deploy until the actual ADMIN origin is known and administrator account is configured.
- If an invite is delivered but the doctor mapping fails, reconcile the account manually before retrying.
- The Edge Function intentionally does not accept client-supplied roles, PINs, doctor registration numbers as ownership proof, or service-role credentials.
