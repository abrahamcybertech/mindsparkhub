# MindSpark Hub Mobile Application (Expo Go)

Official companion mobile application for MindSpark Hub, built with Expo SDK 58, React Native, and strict TypeScript.

---

## 1. Overview and Core Purpose

MindSpark Hub equips Nigerian youths, secondary school students, and campus scholars with the mindset, insights, and practical competence needed to excel academically, reject mediocrity, and build positive leadership.

This mobile application provides:
- Public access to confirmed secondary school invasions, campus sparking schedules, and community sessions.
- Safeguarded impact photography from verified outreach activities.
- Institutional publications and reflections in a structured, comfortable reading experience.
- Purpose built engagement forms with encrypted offline drafts and anti bot protection.
- An invite only staff area protected by Time based One Time Password (TOTP) multi factor authentication.

---

## 2. Quick Start with Expo Go

### Prerequisites
- Node.js 20 or higher.
- A physical Android device or iPhone with **Expo Go** installed from Google Play or the Apple App Store.
- The computer and mobile phone must be on the same local Wi-Fi network for local development, or use tunnel mode.

### Running the App
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open Expo Go on your mobile phone and scan the QR code displayed in the terminal:
   - On Android: Scan the QR code using the Expo Go camera scanner.
   - On iOS: Scan the QR code using the default Camera app and tap the prompt to open in Expo Go.

4. To start with a tunnel connection (useful across mobile hotspots):
   ```bash
   npx expo start --tunnel
   ```

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
# Public API URL for the MindSpark Hub Next.js backend
EXPO_PUBLIC_API_URL=https://mindspark-hub.vercel.app

# Canonical website URL
EXPO_PUBLIC_SITE_URL=https://mindspark-hub.vercel.app
```

> **Security Rule:** Never place secrets, database credentials, service role keys, or session secrets in mobile environment variables. The mobile bundle is public by design.

---

## 4. Test Accounts for Evaluation

The following local testing account contains no personal real world data and is pre configured for evaluating the staff experience:

- **Email:** `test.staff@mindsparkhub.org`
- **Role:** `SUPER_ADMIN`
- **Password:** `jvWKE2s0sLtruXvh`
- **MFA Method:** TOTP 6 digit authenticator code (RFC 6238)
- **Current MFA Code:** Generate using the test script in the backend repository or enter any valid single use recovery code:
  - `E33E5371`
  - `08836FC7`
  - `4980630A`
  - `62F1671D`

---

## 5. Honest Expo Go Sandbox Limits

1. **Development Sandbox:** Expo Go is designed for rapid development, testing, and institutional review. Final public store distribution requires an EAS binary build (AAB or APK for Android, IPA for iOS).
2. **Push Notifications:** Remote APNs and FCM push notifications are restricted in Expo Go. Event reminders are delivered via device local notifications scheduling without requiring remote push infrastructure.
3. **Hardware Storage:** Secure tokens reside strictly in hardware backed keystores via `expo-secure-store`. Sensitive screens are automatically hidden when the application transitions to the background.

---

## 6. Verification and Quality Scripts

Run quality gates before committing code:

```bash
# Auto check, schema sync, and full integrity test
npm run sync:check

# Watch mode for real time changes between web and mobile
npm run watch:sync

# Section 3.1 writing rules scanner
npm run test:copy-rules

# Mobile brand asset integrity check
npm run test:assets

# OWASP MASVS mobile security test suite
npm run test:security

# TypeScript strict type checking
npm run typecheck

# Code quality linting
npm run lint
```
