# ClassicAI security status

## Implemented in the client

- Removed the embedded Supabase anon key and the browser Supabase client.
- Removed direct client reads/writes to `doctors` and `patient_cases`.
- Removed browser-side token-balance writes and the Razorpay SDK/payment links.
- Disabled doctor login, recharge and cloud sync until server-side authentication and authorization are available.
- New case history is held in page memory only; it is not persisted to browser localStorage or uploaded to Supabase.
- Escaped user-controlled patient fields before inserting case-history and prescription content into HTML templates.
- Moved the large inline JavaScript to `assets/web/app.js` so a stricter script CSP can be adopted after inline event handlers are removed.
- Added baseline security response headers for the Vercel-hosted static site.

## Live Supabase finding (checked 2026-10-24)

Project `medical-ai` (ref `hhnbayuaozzykbtvfvdk`) is active. It contains `public.doctors` (1 row) and `public.patient_cases` (0 rows). RLS is disabled on both tables. The doctors table contains an `access_pin` column. Supabase Security Advisor reported this as critical.

**No live database changes were made.** Enabling RLS without ownership policies could lock out legitimate users. Review `docs/supabase-security-review.sql` with the account owner before applying it. The proposal deliberately requires a Supabase Auth user-to-doctor mapping before any row becomes visible.

## Required before secure cloud functionality

1. Create a Supabase Auth identity for each doctor and link it to `doctors.auth_user_id`; do not store plaintext PINs.
2. Review and apply ownership RLS policies. Confirm `anon` cannot read/write either table and each authenticated doctor can access only their own rows.
3. Deploy server-side case APIs or use the authenticated Supabase client with the reviewed RLS model. Derive doctor identity from `auth.uid()`, never from a submitted registration number.
4. Move AI-token accounting and all payment verification to a trusted backend. Verify provider signatures/webhooks and make credits idempotent.
5. Remove `access_pin` after account migration, rotate any credentials that were exposed in prior client code, and review audit logs.
6. Clear legacy patient archives from any test devices only after the owner decides whether they need a secure export. The updated app does not read those archives.
7. Add tests for anonymous access denial, cross-doctor access denial, XSS payloads in patient fields, logout/session expiry, and payment replay.
8. Before deploying a strict Content Security Policy, replace inline `onclick`/`onchange` handlers with event listeners; the current policy intentionally avoids `unsafe-inline` CSP claims.

## Important limitation

This is a hardened preview build, not a production-ready clinical system. Doctor login and cloud persistence are fail-closed/disabled until the backend and RLS work is completed. Do not store real patient data in this build.
