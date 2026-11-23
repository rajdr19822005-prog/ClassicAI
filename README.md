# ClassicalAI Android source

This Flutter project packages the supplied `assets/web/index.html` in an Android WebView. The app page is bundled locally; its CDN scripts and hosted integrations still require internet access.

## Current build status

The GitHub Actions workflow runs Dart analysis, a smoke test, and builds a **debug APK** for device testing. A successful debug APK is not a Google Play release. A signed Android App Bundle is built only when the workflow is manually dispatched and all signing secrets are configured.

## Build and validate

1. Install stable Flutter, Java 17, and the Android SDK.
2. Run `flutter create --platforms=android --org=com.classicai . to generate Android platform files.
3. Confirm `applicationId = "com.classicai.mobile"` in `android/app/build.gradle.kts`. Confirm the package ID is available and correct before the first Play upload; it cannot be changed after publishing.
4. Run `flutter pub get`, `flutter analyze`, `flutter test`, and `flutter build apk --debug`.

## Required before production or tester access

The doctor login uses Supabase Auth and an active doctor record linked to that Auth user. The Razorpay server functions and token-crediting database routine have been implemented, but **live payments remain disabled until the Razorpay secrets and webhook are configured and an end-to-end test payment succeeds**.

- **Authentication and authorization:** keep Supabase Auth, doctor-to-user mapping, and row-level security in place. Never enumerate all doctor rows using a public key or rely on localStorage as authorization.
- **Payments:** server-created Razorpay orders, server-side HMAC verification, a captured-payment status check, an idempotent database credit routine, and a signed webhook are implemented. See the setup steps below. Never put a Razorpay Key Secret in browser code or Git.
- **Patient data:** patient case cloud saving is still disabled. Before enabling it, define consent, access control, retention/deletion, privacy policy, encryption and Google Play Data safety declarations. Test on real devices.
- **External integrations:** test CDN loading, PDF export, and WhatsApp/external links in Android WebView. These integrations require internet.
- **Play Console:** confirm package ID, provide store listing and privacy policy, complete Data safety and applicable health/content declarations, configure testers, then upload the signed AAB under Internal testing.

## Token and payment status

The current repertorization algorithm runs locally in the browser and is a heuristic ranking tool, not a paid server-side AI service. It must not deduct tokens or accept token purchases. The UI keeps recharge disabled until a billable server-side service exists and has passed authenticated usage, billing, and retry tests. Existing doctor token balances are not modified by local calculations.

## Razorpay setup (required before collecting real payments)

The previous token packages were 25 tokens for ₹199, 50 tokens for ₹349, and 100 tokens for ₹599 INR. New purchases are disabled both in the client and by the server-side `PAYMENTS_ENABLED` gate while repertorization is local-only.

1. In Razorpay Dashboard, create or obtain your **Key ID** and **Key Secret**. Start with Test Mode and use test credentials first.
2. In [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/hhnbayuaozzykbtvfvdk/functions/secrets), add:
   - `RAZORPAY_KEY_ID` — Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` — Razorpay Key Secret
   - `RAZORPAY_WEBHOOK_SECRET` — a webhook secret you create in the Razorpay Dashboard
   - `PAYMENTS_ENABLED` — keep unset or `false` until a billable server-side service is integrated and end-to-end tested; only then set to `true`
3. In Razorpay Dashboard → Webhooks, add this endpoint:
   `https://hhnbayuaozzykbtvfvdk.supabase.co/functions/v1/razorpay-webhook`
4. Subscribe to `payment.captured` only. The handler acknowledges other event types without crediting tokens. Enter the same webhook secret in Razorpay and Supabase.
5. Ensure Razorpay is configured for automatic payment capture. The app credits tokens only when Razorpay confirms the payment is captured.
6. Do not enable token purchases until a billable server-side service is integrated. Then test in Razorpay Test Mode, verify each package credits exactly the configured token count once, and confirm failed/cancelled payments add zero tokens before switching to Live Mode.

Edge Functions:
- `razorpay-create-order` — authenticated doctor creates a fixed-price server-side order.
- `razorpay-verify-payment` — verifies checkout HMAC and confirms captured payment before crediting.
- `razorpay-webhook` — validates Razorpay's webhook HMAC and safely handles duplicate delivery; it credits only `payment.captured` events.

The webhook handler is in source control. Deploy the function and configure all three Razorpay secrets before testing payments. Never send secrets in chat, commit them to the repository, or place them in browser/mobile code.

## GitHub Actions signing

Add repository Actions secrets under Settings → Secrets and variables → Actions:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded upload keystore
- `ANDROID_KEY_ALIAS`: key alias
- `ANDROID_KEY_PASSWORD`: key password
- `ANDROID_STORE_PASSWORD`: keystore password

Then choose Actions → Android CI → Run workflow. If the secrets are present, the signed job should upload an artifact named `classicai-release-aab`. Keep an offline backup of the upload keystore and passwords. Never commit them or send them in chat.

No signed AAB has been generated and no Play Console upload has been performed.
## ClassicAI Basic Subscription (staged rollout)

- Basic plan: ₹2,999 for 12 months, including 50 repertorization credits.
- Subscription orders are separate from legacy token-recharge orders. Captured payments are verified against Razorpay's API and signature before the database activates the plan and adds 50 credits. Duplicate callbacks and webhooks are idempotent.
- Renewals extend from the current expiry when still active; otherwise a fresh 12-month period starts at verified payment time.
- The migration creates RLS-protected subscription, order, credit-grant and rollout-configuration tables. Existing doctor balances and legacy payment/token history are not rewritten.
- Subscription enforcement starts OFF (public.basic_subscription_config.enforcement_enabled = false) so current doctors are not locked out before checkout is configured and tested. Turn it ON only after test-mode checkout, captured-payment verification, webhook delivery, duplicate-event handling, expiry and credit-ledger checks pass.
- New Edge Functions: create-basic-subscription-order, verify-basic-subscription-payment, get-basic-subscription-status, and razorpay-basic-subscription-webhook.
- Configure a separate Razorpay payment.captured webhook to: https://hhnbayuaozzykbtvfvdk.supabase.co/functions/v1/razorpay-basic-subscription-webhook
- Required Supabase Edge Function secret: BASIC_SUBSCRIPTION_PAYMENTS_ENABLED. Keep it unset or false until the new flow has been tested with Razorpay Test Mode. Set it to true only when Razorpay keys, Supabase server credentials and the webhook secret are configured.
- After successful end-to-end verification, enable entitlement enforcement with: update public.basic_subscription_config set enforcement_enabled = true, updated_at = now() where id = 1;
- Enabling the gate blocks new repertorization for accounts without an active Basic subscription. Existing token balances remain stored and are not deleted.
- The current repertorisation engine is still a local heuristic ranking tool, not a generative AI model. Do not advertise it as a model-backed AI service until one is integrated and tested.