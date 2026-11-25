# ClassicAI Android and Windows desktop source

This Flutter project provides the ClassicAI doctor application on Android and Windows. Android packages the local web interface; the Windows desktop build opens the production ClassicAI web application in a native Microsoft Edge WebView2 window.

## Windows Desktop application

The Windows CI workflow builds a separate **ClassicAI.exe** and creates:
- `ClassicAI-Desktop-Setup.exe` — Windows installer with Start Menu and optional desktop shortcuts.
- `ClassicAI-Desktop-Portable.zip` — portable release folder; extract the complete folder before running `classicai.exe`.

The installer includes the official Microsoft WebView2 Evergreen bootstrapper and installs the runtime silently. Windows 11 and many supported Windows 10 systems already include this runtime. The desktop shell requires an internet connection because the hosted application, authentication, and cloud services are online.

To build locally on Windows:
1. Install Flutter stable (3.44 or newer), Visual Studio 2022 with **Desktop development with C++**, and Inno Setup 6.
2. Run `flutter create --platforms=windows --org=com.classicai .`.
3. Run `flutter pub get` and `flutter test`.
4. Run `flutter build windows --release -t lib/main_windows.dart`.
5. Download the Microsoft Edge WebView2 Evergreen Bootstrapper to `dist/MicrosoftEdgeWebView2Setup.exe`.
6. Compile `installer/classicai.iss` with Inno Setup 6.

The GitHub Actions workflow publishes the installer and portable ZIP as a 30-day build artifact for each successful push, pull request, or manual run.

## Android build

1. Install stable Flutter, Java 17, and the Android SDK.
2. Run `flutter create --platforms=android --org=com.classicai .` to generate Android platform files.
3. Confirm `applicationId = "com.classicai.mobile"` in `android/app/build.gradle.kts`. Confirm the package ID is available and correct before the first Play upload; it cannot be changed after publishing.
4. Run `flutter pub get`, `flutter analyze`, `flutter test`, and `flutter build apk --debug`.

The Android CI workflow builds debug APKs for device testing. A signed Android App Bundle is built only when the workflow is manually dispatched and all signing secrets are configured.

## Security and production notes

- Doctor login uses Supabase Auth and an active doctor record linked to that Auth user. Keep doctor-to-user mapping and row-level security in place.
- Never put Supabase service-role keys, Razorpay secrets, or other server credentials in browser, Android, Windows, or Git files.
- Live payments remain disabled until Razorpay secrets, webhook delivery, and an end-to-end test payment have been verified.
- The current repertorization algorithm is a local heuristic ranking tool, not a generative AI model.
- The Windows desktop executable is a desktop client for the hosted ClassicAI service; it does not contain a private copy of production data or bypass account authorization.

## Razorpay setup

Keep payment feature flags disabled until test-mode checkout, captured-payment verification, webhook delivery, duplicate-event handling, expiry, and credit-ledger checks all pass. Never send secrets in chat or commit them to the repository.

## ClassicAI Basic Subscription (staged rollout)

- Basic plan: ₹2,999 for 12 months, including 50 repertorization credits.
- Subscription orders are separate from legacy token-recharge orders. Captured payments are verified server-side before the database activates the plan and adds 50 credits. Duplicate callbacks and webhooks are idempotent.
- Subscription enforcement remains OFF until Razorpay test-mode checkout and webhook verification pass.
- Existing doctor balances and legacy payment/token history are not rewritten.
