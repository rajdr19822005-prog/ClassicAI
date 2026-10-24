# ClassicAI

Android release scaffold for the ClassicAI project.

> Status: starter scaffold only. This repository was empty before this commit, so the app's actual product features, data integrations, and release identity still need to be supplied and validated.

## Stack
- Flutter / Dart
- Android App Bundle (.aab) for Google Play
- GitHub Actions for validation and Android build artifacts
- Vercel remains available for a web frontend or web/API components; it does not build Android packages itself.

## Current app identity
- Flutter project name: classicai
- Provisional Android application ID: com.classicai.mobile

Confirm that application ID before publishing. Changing it later creates a different Play Store app.

## CI
The Android workflow generates standard Android platform files with Flutter, runs static analysis and widget tests, and produces a debug APK for installation smoke tests. A debug APK is not a Google Play release artifact.

## Google Play internal testing still requires
1. Implement and review the real ClassicAI product functionality.
2. Confirm the final application ID, app name, icon, screenshots, and store listing.
3. Configure a release keystore and GitHub Actions secrets before producing a Play-uploadable signed AAB.
4. Complete privacy policy, Data safety, content rating, target audience, and any applicable app declarations.
5. Test the signed build on physical Android devices before uploading it to the Play Console internal testing track.

Never commit signing keys, passwords, service-role keys, or provider API secrets.
