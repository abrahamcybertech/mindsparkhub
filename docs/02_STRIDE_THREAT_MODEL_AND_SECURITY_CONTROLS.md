# MindSpark Hub Official Platform: STRIDE Threat Model and Security Controls

## 1. Overview and Threat Modeling Methodology

MindSpark Hub adopts the **STRIDE** methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) combined with **OWASP ASVS Level 2** baseline and **Level 3 controls** for authentication, authorization, and dashboard administrative boundaries.

---

## 2. STRIDE Threat Assessment and Technical Controls

### 2.1 Spoofing Identity
| Threat Description | Severity | Countermeasures & Architectural Controls | Verification Test |
|---|---|---|---|
| Attacker attempts credential stuffing or brute force against `/admin/login` | HIGH | Progressive IP and per-account lockout; PBKDF2 / Argon2id password verification; rate limiting to 5 requests per minute; generic error messages that never distinguish between missing users and wrong passwords. | `test_auth_rate_limiting_and_lockout` |
| Attacker compromises admin password and bypasses 2FA | CRITICAL | Mandatory Time-based One-Time Password (TOTP RFC 6238) multi-factor authentication for all dashboard accounts; sessions cannot be created without 2FA validation; single-use hashed recovery backup codes. | `test_totp_mfa_enforcement` |
| Attacker forges or replays session cookies | HIGH | Cryptographic 256-bit session tokens; `HttpOnly`, `Secure`, `SameSite=Strict` cookies; rotation on every login and privilege upgrade; strict server-side idle timeout (30 min) and max lifetime (8h). | `test_session_invalidation_and_rotation` |

### 2.2 Tampering with Data
| Threat Description | Severity | Countermeasures & Architectural Controls | Verification Test |
|---|---|---|---|
| Attacker submits malicious SQL injection through input forms or query parameters | CRITICAL | Fully parameterized queries; strict object-relational mapping; zero string-concatenated SQL queries in codebase. | `test_sql_injection_defense` |
| Stored Cross-Site Scripting (XSS) via article rich text editor or gallery captions | CRITICAL | Editor outputs a safe JSON AST or strict allow-list HTML; server-side sanitization using DOMPurify with SVG/script execution stripped; output encoded in React JSX; strict Content Security Policy. | `test_xss_sanitization_in_articles` |
| Tampering with event publication or skipping management review | MEDIUM | Four-eyes event approval workflow: Programme Managers submit drafts; only Administrators or Super Administrators can set status to APPROVED and publish; self-approval is rejected. | `test_event_approval_workflow` |
| Malicious file upload disguised as JPEG or PNG containing web shells or exploit polyglots | CRITICAL | Magic byte verification (validating first 8 bytes of file against FF D8 FF for JPEG and 89 50 4E 47 for PNG); rejection of SVG, HTML, executable extensions; re-encoding through image pipeline; files served with `Content-Type: image/jpeg` and `X-Content-Type-Options: nosniff`. | `test_upload_magic_bytes_and_reencoding` |

### 2.3 Repudiation
| Threat Description | Severity | Countermeasures & Architectural Controls | Verification Test |
|---|---|---|---|
| Administrator modifies content or exports sensitive applicant data and denies action | HIGH | Cryptographically chained append-only audit logging table (`audit_logs`); every create, update, delete, approval, and export records actor, action, timestamp, IP, and SHA-256 hash chaining to prevent history alteration. Database user permissions prohibit UPDATE and DELETE on audit logs. | `test_audit_log_append_only_integrity` |

### 2.4 Information Disclosure
| Threat Description | Severity | Countermeasures & Architectural Controls | Verification Test |
|---|---|---|---|
| Exposure of unverified contact details, social links, or phone numbers before publication | LOW | Unverified elements are configured as hidden in the database until explicitly confirmed and published by an administrator; public templates hide missing values without leaving empty placeholders. | `test_unverified_contact_elements_hidden` |
| Identification and leakage of minor details from secondary school outreach photos | HIGH | Safeguarding Gate: Any photograph depicting minors requires documented parent/school consent reference; administrator must check "Consent Verified" before item can be set to published; instant one-click takedown path. | `test_minor_safeguarding_consent_requirement` |
| Stack traces, database schema, or internal paths leaked in production errors | MEDIUM | Production error boundary catches all uncaught exceptions; generic user-friendly messages returned to client; detailed error logs written strictly to private server logs with credentials stripped. | `test_production_error_handling` |

### 2.5 Denial of Service
| Threat Description | Severity | Countermeasures & Architectural Controls | Verification Test |
|---|---|---|---|
| Public contact / application form spam flooding the database or email notifications | HIGH | Per-IP and per-email rate limiting; hidden honeypot field (`website_url_check`); client submission timestamp check (rejecting submissions occurring faster than 3 seconds); payload size limits (max 50KB). | `test_form_honeypot_and_rate_limiting` |
| Large file upload DOS exhausting server storage or memory | MEDIUM | Maximum file size restricted to 5MB on the server; maximum image pixel dimensions enforced (max 3840x2160); image processing bounded by memory limits. | `test_upload_size_limit_rejection` |

### 2.6 Elevation of Privilege
| Threat Description | Severity | Countermeasures & Architectural Controls | Verification Test |
|---|---|---|---|
| Programme Manager or Editor attempts to access user management or promote their role | CRITICAL | Centralized Server Policy module checks permissions on every API route and server action; Deny by default; Super Administrator only for role management; self-promotion explicitly blocked. | `test_rbac_privilege_escalation_denial` |
| Insecure Direct Object References (IDOR) on viewing or editing application submissions | HIGH | Submission view and export endpoints require Administrator or Super Administrator role; Editors and Programme Managers are denied access. | `test_idor_and_submission_access_control` |

---

## 3. OWASP ASVS Level 2 & 3 Control Matrix

- **V1: Architecture, Design and Threat Modeling:** STRIDE analysis completed; data classification documented; zero third-party telemetry or non-essential cookies.
- **V2: Authentication:** Multi-factor authentication mandatory for all admin accounts; minimum 12-character passwords; Argon2id / Scrypt hashing; lockout protection.
- **V3: Session Management:** HttpOnly, Secure, SameSite=Strict cookies; short idle timeouts; server session invalidation on sign-out.
- **V4: Access Control:** Centralized server-side RBAC policy; least privilege; deny-by-default on all endpoints.
- **V5: Validation, Sanitization and Encoding:** Zod schemas for all inbound data; DOMPurify sanitization; magic bytes file validation.
- **V6: Cryptography:** RFC 6238 TOTP; SHA-256 hash chaining for audit logs; TLS 1.3 / HTTPS.
- **V8: Data Protection:** NDPA 2023 compliance; safeguarding for minors; no personal data collected from children.
- **V14: Configuration:** Strict security headers (CSP, HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin).
