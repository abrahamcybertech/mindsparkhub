# MindSpark Hub Mobile: Deployment, Rollback, and Incident Runbooks

## 1. EAS Production Build Runbook

### 1.1 Prerequisites
1. Ensure the Expo CLI and EAS CLI are installed:
   ```bash
   npm install -g eas-cli
   ```
2. Authenticate with the organisation Expo account:
   ```bash
   eas login
   ```
3. Run the automated pre build verification pipeline:
   ```bash
   npm run sync:check
   ```

### 1.2 Android Binary Build (Google Play AAB & Preview APK)
- **Preview APK (For internal device testing):**
  ```bash
  eas build --platform android --profile preview
  ```
- **Production Android App Bundle (For Google Play):**
  ```bash
  eas build --platform android --profile production
  ```

### 1.3 iOS Binary Build (Apple App Store IPA)
- **Production IPA:**
  ```bash
  eas build --platform ios --profile production
  ```

---

## 2. Release Rollback Procedure

If a critical flaw or regression is detected in an active store release:

1. **Activate Server Version Gate Kill Switch:**
   If a released mobile version has a critical security vulnerability, set the environment variable on the Next.js production backend:
   ```bash
   MOBILE_KILL_SWITCH=true
   ```
   Or raise the minimum supported version to enforce an immediate update prompt:
   ```bash
   MIN_SUPPORTED_APP_VERSION=1.0.1
   ```
2. **Revoke Active Mobile Tokens:**
   Run the administrative database query to revoke all mobile refresh token families:
   ```sql
   UPDATE mobile_refresh_tokens SET revoked_at = datetime('now') WHERE revoked_at IS NULL;
   ```
3. **Deploy Hotfix Binary:**
   Increment the patch version in `app.json` and `package.json`, re run `npm run sync:check`, and trigger an emergency EAS production build.

---

## 3. Security Incident Response Runbook

### Incident Type A: Staff Account Compromise
1. Log into the web administrative dashboard as a Super Administrator.
2. Navigate to `/admin/users` and deactivate the affected account (`is_active = 0`).
3. Revoke all active mobile refresh token families associated with the user ID:
   ```sql
   UPDATE mobile_refresh_tokens SET revoked_at = datetime('now') WHERE user_id = 'COMPROMISED_USER_ID';
   ```
4. Reset the user password and generate a new TOTP multi factor enrollment secret.
5. Record the incident and corrective actions in the append only audit trail.

### Incident Type B: Public API Denial of Service or Bot Abuse
1. Identify abusive IP ranges or device hashes from the server access logs.
2. The server automatically throttles IP addresses exceeding 20 requests per minute and rejects requests missing a valid anti bot challenge token.
3. If necessary, enable Cloudflare Under Attack mode on `mindspark-hub.vercel.app`.

### Incident Type C: Photographic Safeguarding Takedown Notice
1. When a takedown notice is received via `/api/v1/reports`, the system logs the report with an assigned reference code.
2. An Administrator opens `/staff/content` in the mobile app or `/admin/gallery` on the web dashboard.
3. Toggle the publication switch to `Unpublished` immediately while evaluating the request.
4. Notify the requesting citizen via their provided contact email within 48 hours in accordance with NDPA guidelines.
