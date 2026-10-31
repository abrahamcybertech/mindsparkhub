# MindSpark Hub Mobile: STRIDE Threat Model and MASVS Control Mapping

## 1. Overview and Standards Baseline

The MindSpark Hub mobile platform implements the **OWASP Mobile Application Security Verification Standard (MASVS)**:
- **MASVS Level 1 (MASVS L1):** Minimum baseline applied across the entire public application.
- **MASVS Level 2 (MASVS L2):** Defense in depth controls applied across the restricted staff portal.
- **OWASP MASTG:** Test methodologies applied during verification.

---

## 2. STRIDE Mobile Threat Assessment

| Threat Category | Description | Countermeasures & Architectural Controls | Verification Method |
|---|---|---|---|
| **Spoofing** | Attacker impersonates legitimate staff member or injects fake API credentials | Mandatory TOTP multi factor authentication; short lived access tokens (15m); rotating refresh tokens with immediate reuse detection; generic authentication errors that never reveal username validity. | `test-mobile-security.mjs`, Bearer token validation tests |
| **Tampering** | Attacker modifies mobile requests or tampers with form submissions | Hashed device identifier (`x-device-id`), unique request identifiers (`x-request-id`), short lived anti bot challenge tokens; strict Zod validation rejecting undeclared fields on the server. | Automated API schema validation |
| **Repudiation** | Staff member denies performing event approvals or content status changes | Append only cryptographic audit log linking prior hashes via SHA256; recorded actor ID, IP address, timestamp, and action parameters. | `SEC-07` backend audit test |
| **Information Disclosure** | Credentials extracted from APK/IPA bundle, device cache, or app switcher screenshots | Hardware backed storage via `expo-secure-store`; zero AsyncStorage usage for credentials; background screen privacy shield (`PrivacyShield.tsx`); stripped console logs in production builds. | `SEC-MOB-01`, `SEC-MOB-02`, static code analysis |
| **Denial of Service** | Bot automated spamming against public contact and outreach forms | Server issued anti bot challenge tokens; IP rate limits (10 req/min for login, 20 req/min for forms); honeypot trap fields that immediately discard automated payloads. | `SEC-MOB-06`, rate limiter test |
| **Elevation of Privilege** | Editor attempts event approval or Programme Manager accesses audit trail | Server side Role Based Access Control (RBAC) enforced per endpoint; client side role checks hide UI controls only as a convenience. | Permissions matrix unit tests |

---

## 3. OWASP MASVS Control Mapping

### MASVS-STORAGE (Data Storage and Privacy)
- **MASVS-STORAGE-1:** System credential storage mechanisms (`expo-secure-store`) are used exclusively for sensitive tokens.
- **MASVS-STORAGE-2:** No sensitive personal information is written to application logs, crash dumps, or local unencrypted caches.

### MASVS-CRYPTO (Cryptography)
- **MASVS-CRYPTO-1:** Standard strong cryptographic primitives (TLS 1.3, SHA256, Scrypt password hashing).
- **MASVS-CRYPTO-2:** Keys are generated securely with cryptographically random entropy.

### MASVS-AUTH (Authentication and Session Management)
- **MASVS-AUTH-1:** Authentication is enforced entirely on the remote backend server.
- **MASVS-AUTH-2:** Multi factor authentication is mandatory on all dashboard accounts.
- **MASVS-AUTH-3:** Sessions expire predictably with automatic idle timeout and token family revocation upon sign out.

### MASVS-NETWORK (Network Communication)
- **MASVS-NETWORK-1:** All network communication uses HTTPS (TLS 1.3). Cleartext HTTP is rejected.
- **MASVS-NETWORK-2:** Platform level certificate verification is enforced.

### MASVS-PLATFORM (Platform Interaction)
- **MASVS-PLATFORM-1:** App permissions (Calendar, Notifications) are requested at the moment of use with clear institutional justification.
- **MASVS-PLATFORM-2:** Deep links and universal links validate incoming host domains against an allow list (`mindspark-hub.vercel.app`, `mindsparkhub.org`).

---

## 4. Role Based Access Control (RBAC) Matrix

| Permission | SUPER ADMIN | ADMIN | EDITOR | PROGRAMME MANAGER | PUBLIC VISITOR |
|---|:---:|:---:|:---:|:---:|:---:|
| `content:read` | Yes | Yes | Yes | Yes | Yes |
| `events:draft` | Yes | Yes | No | Yes | No |
| `events:approve` | Yes | Yes | No | No | No |
| `articles:manage` | Yes | Yes | Yes | No | No |
| `articles:publish` | Yes | Yes | Yes | No | No |
| `gallery:manage` | Yes | Yes | Yes | No | No |
| `inquiries:view` | Yes | Yes | No | No | No |
| `inquiries:manage` | Yes | Yes | No | No | No |
| `audit:view` | Yes | No | No | No | No |
| `security:manage` | Yes | No | No | No | No |
