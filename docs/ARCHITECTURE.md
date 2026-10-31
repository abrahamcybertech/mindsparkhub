# MindSpark Hub Mobile: Architecture and Data Flow

## 1. System Architecture

The MindSpark Hub mobile platform is designed as an untrusted client interfacing with an institutional Next.js 14 API gateway. It follows OWASP MASVS Level 1 standards for public access and Level 2 controls for staff administrative operations.

```
+--------------------------------------------------------------+
|             MindSpark Hub Mobile Client (Expo Go)            |
|  - React Native 0.88, React 19, TypeScript (Strict Mode)     |
|  - Expo Router (File based Tab and Stack Navigation)         |
|  - TanStack Query (Stale while revalidate caching)          |
|  - Hardware Keystore Token Isolation (expo-secure-store)     |
|  - Background Privacy Shield (expo-screen-capture)           |
+--------------------------------------------------------------+
                               |
                  HTTPS / TLS 1.3 | Header Guard:
                               | x-app-version, x-device-id
                               v
+--------------------------------------------------------------+
|          Next.js Versioned REST API Gateway (/api/v1)        |
|  - Rate Limiting per IP and Hashed Device Identifier         |
|  - Anti Bot Challenge Token Verification                     |
|  - Scrypt / PBKDF2 Password Hashing & RFC 6238 TOTP Engine   |
|  - RBAC Least Privilege Authorization Gate                   |
|  - Cryptographic Append Only Audit Log (SHA256 Chaining)     |
+--------------------------------------------------------------+
                               |
                               v
+--------------------------------------------------------------+
|                      Persistence Layer                       |
|  - Node SQLite (Local Development)                           |
|  - Supabase PostgreSQL with Row Level Security (Production)  |
|  - Media Storage Bucket (Consent Confirmed Photographs)      |
+--------------------------------------------------------------+
```

---

## 2. Authentication and Token Lifecycle

Staff authentication enforces mandatory multi factor authentication with zero client privilege escalation:

```
Mobile App                    API Gateway (/api/v1)              Database
    |                                   |                            |
    |--- 1. POST /auth/login ---------->|                            |
    |    (email, password, deviceId)    |--- Verify password ------->|
    |                                   |<-- Valid (MFA Enrolled) ---|
    |<-- 2. 200 OK (MFA Challenge) -----|                            |
    |                                   |                            |
    |--- 3. POST /auth/mfa ------------>|                            |
    |    (challenge, code, deviceId)    |--- Verify TOTP / Backup -->|
    |                                   |<-- Valid ------------------|
    |                                   |--- Issue Token Pair ------>|
    |<-- 4. 200 OK (Tokens + Roles) ----|                            |
    |                                   |                            |
    |--- 5. Hardware Storage -----------> (expo-secure-store)
```

### Token Specifications
- **Access Token:** Short lived cryptographic token with 15 minute lifespan. Transmitted via `Authorization: Bearer <token>` on administrative routes.
- **Refresh Token:** Rotating 30 day token family stored only in hardware keystore. Using a refresh token issues a new pair and marks the previous token consumed. If an already consumed token is presented, the server revokes the entire family immediately to prevent replay attacks.
- **Biometric Unlock:** `expo-local-authentication` provides quick unlocking for local device access without replacing remote server authentication.

---

## 3. Data Integrity and Offline Capability

- **Public Caching:** Cached public data (programmes, articles, gallery) uses TanStack Query with a 5 minute stale time and 1 hour garbage collection time.
- **Offline Drafts:** Engagement forms can be drafted offline and are preserved in local secure storage. Forms require active connectivity to submit to prevent unencrypted queuing of citizen information.
- **Safeguarding Gating:** Minor imagery is filtered at the database query level. Unverified photographs are excluded before API responses are generated.
