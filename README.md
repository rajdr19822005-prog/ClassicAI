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

**The app is deliberately fail-closed and is not yet a usable production release.** During review, the supplied HTML was found to contain a hard-coded doctor/PIN bypass, client-side doctor-record enumeration, and client-side token crediting after a payment callback. Those shortcuts were removed/disabled rather than shipped as if secure. Login and recharge must remain unavailable until the following are implemented and tested:

- **Authentication and authorization:** implement Supabase Auth or a trusted backend; bind doctor identity to an authenticated user; enforce row-level security on all patient/doctor tables. Never enumerate all doctor rows using the anon key or rely on localStorage as authorization.
- **Payments:** implement a server endpoint/webhook that verifies Razorpay signatures and payment status and atomically grants credits. A browser callback or UPI handoff is not payment verification. Keep Razorpay secret credentials on the backend only.
- **Patient data:** define consent, access control, retention/deletion, privacy policy, encryption and Google Play Data safety declarations. Test on real devices.
- **External integrations:** test CDN loading, PDF export, and WhatsApp/external links in Android WebView. These integrations require internet.
- **Play Console:** confirm package ID, provide store listing and privacy policy, complete Data safety and applicable health/content declarations, configure testers, then upload the signed AAB under Internal testing.

## GitHub Actions signing

Add repository Actions secrets under Settings → Secrets and variables → Actions:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded upload keystore
- `ANDROID_KEY_ALIAS`: key alias
- `ANDROID_KEY_PASSWORD`: key password
- `ANDROID_STORE_PASSWORD`: keystore password

Then choose Actions → Android CI → Run workflow. If the secrets are present, the signed job should upload an artifact named `classicai-release-aab`. Keep an offline backup of the upload keystore and passwords. Never commit them or send them in chat.

No signed AAB has been generated and no Play Console upload has been performed.