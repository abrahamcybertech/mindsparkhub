# MindSpark Hub Official Platform: Architecture Overview and Data Model

## 1. System Architecture

MindSpark Hub is architected as an institutional web platform delivering a fast, accessible public digital presence alongside a secure, role-restricted administrative portal.

### 1.1 Architecture Components

```
+-------------------------------------------------------------+
|                     Public Web Visitors                     |
+-------------------------------------------------------------+
                              | HTTPS
                              v
+-------------------------------------------------------------+
|               Next.js Edge & App Router Layer               |
|  - Strict Security Headers (CSP, HSTS, X-Frame-Options)    |
|  - Server-Side Rendering (SSR) & Static Generation (SSG)    |
|  - Semantic WCAG 2.2 AA Components                         |
|  - Dynamic Route Handlers & Server Actions                  |
|  - Rate Limiting & Anti-Bot Protection Middleware           |
+-------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------------+             +-----------------------------+
|  Public Content Engine      |             |  Secure Admin Console       |
|  - Home & 3 Impact Vehicles |             |  - Mandatory TOTP MFA       |
|  - Units & Verified Excos   |             |  - Role-Based Access (RBAC) |
|  - Gallery (Safeguarded)    |             |  - 4-Eyes Event Approval    |
|  - Insights & Resources     |             |  - Append-Only Audit Logs   |
|  - Minors Protection Shield |             |  - Immutable Security Log   |
+-----------------------------+             +-----------------------------+
         |                                           |
         +--------------------+----------------------+
                              |
                              v
+-------------------------------------------------------------+
|                  Application Service Layer                  |
|  - Zod Input Normalisation & Strict Allow-list Validation   |
|  - Image Magic Bytes Inspection & Metadata Stripping Engine |
|  - HTML Sanitisation Layer (DOMPurify Safe Node Pipeline)   |
|  - Rate Limiter with In-Memory Token Bucket                 |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               Data Storage & Persistence Layer              |
|  - Relational Database (SQLite / PostgreSQL schema)         |
|  - Encrypted Password Hashes (Argon2id / Scrypt)            |
|  - Row-Level Access Policies & Least Privilege Queries      |
|  - Media Storage with Random Hex Tokens (Private Uploads)   |
+-------------------------------------------------------------+
```

---

## 2. Relational Data Model

### 2.1 Users & Authentication (`users`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Unique user identifier |
| `name` | TEXT | NOT NULL | Full name of administrator |
| `email` | TEXT | NOT NULL, UNIQUE | Official email address |
| `password_hash` | TEXT | NOT NULL | Salted Argon2id / Scrypt password hash |
| `role` | TEXT | NOT NULL | SUPER_ADMIN, ADMIN, EDITOR, PROGRAMME_MANAGER |
| `mfa_enabled` | BOOLEAN | DEFAULT FALSE | Whether MFA is actively enforced |
| `mfa_secret` | TEXT | NULLABLE | Encrypted TOTP secret key |
| `mfa_backup_codes` | TEXT | NULLABLE | Hashed recovery codes array (JSON) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `failed_sign_ins` | INTEGER | DEFAULT 0 | Failed attempt counter for lockouts |
| `locked_until` | TIMESTAMP | NULLABLE | Progressive lockout expiration |
| `last_sign_in_at` | TIMESTAMP | NULLABLE | Timestamp of last successful session |
| `created_at` | TIMESTAMP | NOT NULL | Record creation date |
| `updated_at` | TIMESTAMP | NOT NULL | Record last update |

### 2.2 Sessions (`sessions`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Session identifier |
| `user_id` | TEXT / UUID | FOREIGN KEY (`users.id`) | Bound user account |
| `session_token` | TEXT | UNIQUE, NOT NULL | Cryptographic 256-bit token |
| `ip_address` | TEXT | NOT NULL | Client IP (hashed for privacy) |
| `user_agent` | TEXT | NOT NULL | Browser user agent |
| `expires_at` | TIMESTAMP | NOT NULL | Short idle timeout (absolute 8h limit) |
| `created_at` | TIMESTAMP | NOT NULL | Session inception timestamp |

### 2.3 Executive Council & Units (`exco_members`, `units`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Exco member record ID |
| `name` | TEXT | NOT NULL | Official verified name |
| `role_title` | TEXT | NOT NULL | Executive office or unit leadership role |
| `unit_slug` | TEXT | NOT NULL | Link to 8 functional units or secretariat/finance |
| `bio` | TEXT | NOT NULL | Official background and mandate |
| `image_url` | TEXT | NOT NULL | Verified photograph path |
| `order_index` | INTEGER | DEFAULT 0 | Display priority |
| `is_published` | BOOLEAN | DEFAULT TRUE | Controlled publishing status |

### 2.4 Programmes & Events (`programmes`, `events`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Unique ID |
| `slug` | TEXT | NOT NULL, UNIQUE | ssi, cs, ce |
| `title` | TEXT | NOT NULL | Secondary Schools Invasion, Campus Sparking, etc. |
| `tagline` | TEXT | NOT NULL | Verified orientation motto/tagline |
| `audience` | TEXT | NOT NULL | Teenagers, Undergraduates, Adults |
| `objectives` | JSON | NOT NULL | Array of structured core objectives |
| `content` | TEXT | NOT NULL | Structured curriculum and seminar details |
| `is_active` | BOOLEAN | DEFAULT TRUE | Published status |

#### Events (`events`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Unique Event ID |
| `programme_slug` | TEXT | NOT NULL | Target programme |
| `title` | TEXT | NOT NULL | Event name |
| `venue` | TEXT | NOT NULL | Venue location |
| `start_time` | TIMESTAMP | NOT NULL | Scheduled start |
| `end_time` | TIMESTAMP | NOT NULL | Scheduled end |
| `description` | TEXT | NOT NULL | Event summary |
| `status` | TEXT | NOT NULL | DRAFT, PENDING_APPROVAL, APPROVED, COMPLETED, CANCELLED |
| `created_by` | TEXT | NOT NULL | Author user ID |
| `approved_by` | TEXT | NULLABLE | Approver user ID (must differ from author) |

### 2.5 Safeguarded Gallery Items (`gallery_items`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Gallery item ID |
| `title` | TEXT | NOT NULL | Descriptive title |
| `caption` | TEXT | NOT NULL | Verified caption |
| `alt_text` | TEXT | NOT NULL | Accessible alternative text (no hyphens) |
| `category` | TEXT | NOT NULL | ssi, cs, ce, seminar, mentorship, outreach |
| `image_url` | TEXT | NOT NULL | Re-encoded, metadata-stripped image path |
| `is_minor_depicted`| BOOLEAN | DEFAULT FALSE | Minor identification flag |
| `consent_verified` | BOOLEAN | DEFAULT FALSE | Mandatory parent/school consent proof |
| `consent_reference`| TEXT | NULLABLE | Documented consent record ID |
| `is_published` | BOOLEAN | DEFAULT FALSE | Published flag (blocked if minor & no consent) |
| `created_at` | TIMESTAMP | NOT NULL | Upload timestamp |

### 2.6 Insights & Articles (`articles`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Article ID |
| `slug` | TEXT | NOT NULL, UNIQUE | Clean URL slug |
| `title` | TEXT | NOT NULL | Editorial headline |
| `excerpt` | TEXT | NOT NULL | Summary for listings |
| `content` | TEXT | NOT NULL | Sanitised, safe rich text structure |
| `author_name` | TEXT | NOT NULL | Verified author name |
| `category` | TEXT | NOT NULL | Academic, Skills, Character, Leadership |
| `featured_image` | TEXT | NOT NULL | Article cover image |
| `reading_time_mins`| INTEGER | DEFAULT 3 | Estimated reading duration |
| `is_published` | BOOLEAN | DEFAULT FALSE | Status |
| `published_at` | TIMESTAMP | NULLABLE | Scheduled or actual publication date |

### 2.7 Inquiries & Applications (`submissions`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Submission record ID |
| `reference_code` | TEXT | NOT NULL, UNIQUE | Public reference number (e.g. MSH-2026-9812) |
| `type` | TEXT | NOT NULL | contact, volunteer, mentor, partner, join |
| `full_name` | TEXT | NOT NULL | Adult applicant full name |
| `email` | TEXT | NOT NULL | Contact email address |
| `phone_number` | TEXT | NULLABLE | Optional telephone |
| `interests` | TEXT | NULLABLE | Programme interest / skills offered |
| `message` | TEXT | NOT NULL | Plain text query or statement of intent |
| `consent_given` | BOOLEAN | NOT NULL | Plain language consent acknowledgment |
| `is_adult_confirmed`| BOOLEAN | NOT NULL | Confirmation applicant is 18 years or older |
| `status` | TEXT | DEFAULT 'NEW' | NEW, UNDER_REVIEW, CONTACTED, ARCHIVED |
| `internal_notes` | TEXT | NULLABLE | Private reviewer notes |
| `created_at` | TIMESTAMP | NOT NULL | Inception timestamp |

### 2.8 Append-Only Audit Logs (`audit_logs`)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | TEXT / UUID | PRIMARY KEY | Audit log entry ID |
| `actor_id` | TEXT | NOT NULL | User ID or system identifier |
| `actor_role` | TEXT | NOT NULL | Role at time of action |
| `action` | TEXT | NOT NULL | CREATE, UPDATE, DELETE, PUBLISH, APPROVE, EXPORT, SIGN_IN |
| `target_entity` | TEXT | NOT NULL | Target table or domain object |
| `target_id` | TEXT | NOT NULL | Target identifier |
| `ip_address` | TEXT | NOT NULL | Client IP address |
| `details` | TEXT | NOT NULL | Contextual information (no credentials or PII) |
| `outcome` | TEXT | NOT NULL | SUCCESS, FAILURE, DENIED |
| `previous_hash` | TEXT | NOT NULL | Hash chaining link to preceding entry |
| `entry_hash` | TEXT | NOT NULL | SHA-256 hash of this entry + previous_hash |
| `created_at` | TIMESTAMP | NOT NULL | Immutable timestamp |
