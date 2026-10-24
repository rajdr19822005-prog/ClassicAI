# ClassicAI Android source

This Flutter project packages the supplied `assets/web/index.html` in an Android WebView. The page is bundled in the app, while its external scripts and hosted services still require internet access.

## Build and validate

1. Install the current stable Flutter SDK, Java 17, and Android SDK.
2. Run `flutter create --platforms=android --org=com.classicai .` to generate Android platform files.
3. In `android/app/build.gradle.kts`, confirm `applicationId = "com.classicai.mobile"`. Confirm the ID is available and correct before any Play upload; the ID cannot be changed after the app is published.
4. Run:
   ```sh
   flutter pub get
   flutter analyze
   flutter test
   flutter build apk --debug
   ```
5. For Play, configure the upload keystore as described below and build a signed Android App Bundle.

## GitHub Actions release signing

Add these repository Actions secrets under Settings → Secrets and variables → Actions:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded upload keystore file
- `ANDROID_KEY_ALIAS`: key alias
- `ANDROID_KEY_PASSWORD`: key password
- `ANDROID_STORE_PASSWORD`: keystore password

Then run Actions → Android CI → Run workflow. The manually dispatched signed release job will create an `classicai-release-aab` artifact if all secrets are configured. Keep a secure offline backup of the upload keystore and passwords; never commit them.

## Release blockers to resolve before public or tester distribution

- **Authentication:** the supplied HTML contains a hard-coded fallback doctor login/PIN. Remove this shortcut and use secure server-side authentication before distributing the app. Client-side HTML can be inspected or modified.
- **Payments:** the HTML uses Razorpay Checkout in a WebView. Validate the complete checkout flow on real Android devices; popups/redirects may behave differently from desktop browsers. Payment capture, signature verification, and token-crediting must happen on a trusted backend/webhook, not based solely on a client callback.
- **Supabase:** the embedded URL and anon/public key are client-facing configuration, not a service-role secret. Verify Row Level Security and policies for every table and restrict access by authenticated user/doctor.
- **Patient data:** the app handles patient/clinical case information. Define consent, access control, retention, deletion, encryption, privacy policy, and Google Play Data safety declarations before rollout.
- **External dependencies:** Tailwind, Font Awesome, Supabase JS, Razorpay Checkout, and html2pdf load from third-party URLs. Most features therefore require internet connectivity. Test PDF export and WhatsApp/external-link behavior on Android.
- **Play Console:** finish app details, privacy policy, Data safety, content declarations, tester list, and internal-testing rollout yourself. No Play Console upload is performed by this repository workflow.

The workflow tests Dart analysis and a smoke test, then builds a debug APK. The signed release bundle job runs only on manual workflow dispatch and requires the four signing secrets. Device, payment, and Play Console validation are still required.
