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

## Razorpay setup (required before collecting real payments)

The current token package is **150 tokens for ₹499 INR**. The price and token quantity are enforced on the server; the browser cannot choose a different amount.

1. In Razorpay Dashboard, create or obtain your **Key ID** and **Key Secret**. Start with Test Mode and use test credentials first.
2. In [Supabase Edge Function Secrets](https://supabase.com/dashboard/project/hhnbayuaozzykbtvfvdk/functions/secrets), add:
   - `RAZORPAY_KEY_ID` — Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` — Razorpay Key Secret
   - `RAZORPAY_WEBHOOK_SECRET` — a webhook secret you create in the Razorpay Dashboard
3. In Razorpay Dashboard → Webhooks, add this endpoint:
   `https://hhnbayuaozzykbtvfvdk.supabase.co/functions/v1/razorpay-webhook`
4. Subscribe to `payment.captured` and `order.paid`. Enter the same webhook secret in Razorpay and Supabase.
5. Ensure Razorpay is configured for automatic payment capture. The app credits tokens only when Razorpay confirms the payment is captured.
6. Test in Razorpay Test Mode with a test doctor account, confirm one successful payment adds exactly 150 tokens once, and confirm failed/cancelled payments add zero tokens. Only switch to Live Mode after these checks and your account is activated by Razorpay.

Edge Functions:
- `razorpay-create-order` — authenticated doctor creates a fixed-price server-side order.
- `razorpay-verify-payment` — verifies checkout HMAC and confirms captured payment before crediting.
- `razorpay-webhook` — validates Razorpay's webhook HMAC and safely handles duplicate delivery.

The webhook URL and function code are deployed, but payment processing returns a configuration error until all three Razorpay secrets are set. Never send secrets in chat, commit them to the repository, or place them in browser/mobile code.

## GitHub Actions signing

Add repository Actions secrets under Settings → Secrets and variables → Actions:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded upload keystore
- `ANDROID_KEY_ALIAS`: key alias
- `ANDROID_KEY_PASSWORD`: key password
- `ANDROID_STORE_PASSWORD`: keystore password

Then choose Actions → Android CI → Run workflow. If the secrets are present, the signed job should upload an artifact named `classicai-release-aab`. Keep an offline backup of the upload keystore and passwords. Never commit them or send them in chat.

No signed AAB has been generated and no Play Console upload has been performed.