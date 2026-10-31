# MindSpark Hub Official Platform: Data Classification and Children Safeguarding

## 1. Data Classification Tiers

In compliance with the **Nigeria Data Protection Act 2023 (NDPA)** and strict institutional child safeguarding principles, all data handled by MindSpark Hub is classified into four security tiers:

| Tier | Category | Examples | Storage & Encryption | Access Boundary | Retention Period |
|---|---|---|---|---|---|
| **Tier 1: Public Content** | Information published intentionally for public enlightenment | Approved programme overviews, verified excos, published articles, approved seminar dates | Public read access; cached at edge | Unrestricted public | Permanent or until edited |
| **Tier 2: Operational Data** | Internal coordination and administrative workflow data | Event drafts, meeting agendas, functional unit rules, inventory notes, draft articles | Encrypted at rest; restricted to authenticated staff | Staff by RBAC role | 5 years |
| **Tier 3: Personal Data** | Identifying information collected from adult citizens | Names, email addresses, phone numbers, volunteer application statements | Encrypted at rest; TLS 1.3 in transit; strict access logs | Administrators & Super Admins only | 24 months post inquiry resolution |
| **Tier 4: Minors Data & Imagery** | Identifiable photographs, student testimonials, and outreach notes of secondary school minors | SSI 1.0 seminar photographs showing identifiable students | Re-encoded, metadata stripped (EXIF/GPS erased), encrypted storage; consent token bound | Strictly guarded; consent required to display | Indefinite with active consent; immediate purge upon takedown |

---

## 2. Children Safeguarding Architecture (Section 9 Compliance)

Secondary school students are minors under Nigerian law (Child's Rights Act and NDPA 2023). Protecting their safety, dignity, and digital identity is a core institutional priority.

### 2.1 Direct Data Collection Prohibition
- **Zero Forms for Minors:** No public web form on MindSpark Hub accepts data directly from children. Every public form (Get Involved, Contact, Mentorship) carries a mandatory affirmation: *"I confirm I am 18 years of age or older"*. Any inquiry mentioning minors must be submitted by a verified school principal, teacher, or legal guardian.

### 2.2 Photograph Publishing Controls
- **Mandatory Consent Check:** Any gallery item flagged with `is_minor_depicted = true` cannot be set to `is_published = true` unless:
  1. A documented institutional consent reference code is entered (`consent_reference`).
  2. The `consent_verified` boolean is explicitly signed off by an Administrator or Super Administrator.
- **Metadata Stripping:** The image upload and processing pipeline automatically strips all Exchangeable Image File Format (EXIF) metadata, including geolocation, GPS coordinates, device identifiers, and timestamp metadata before storage.
- **Privacy First Presentation:** Where possible, crowd and panoramic seminar photographs that convey the transformative scale of outreach without focusing on individual minor faces are prioritized.

### 2.3 One-Click Emergency Takedown Path
- The administrative gallery module features an instant **Emergency Takedown** button for any item depicting minors.
- When clicked:
  1. The item's `is_published` status is immediately flipped to `false`.
  2. Public edge caches for that asset are invalidated.
  3. An immutable entry is written to `audit_logs` recording the takedown request, the initiating actor, and timestamp.
  4. The platform respects takedown notices within 1 hour of receipt.
