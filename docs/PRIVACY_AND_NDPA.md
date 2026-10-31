# MindSpark Hub Mobile: Privacy and NDPA Compliance Documentation

## 1. Statutory Alignment (Nigeria Data Protection Act 2023)

MindSpark Hub complies fully with the **Nigeria Data Protection Act 2023 (NDPA)** and the regulations of the Nigeria Data Protection Commission (NDPC).

### 1.1 Lawful Bases for Processing

| Data Collection Flow | Data Elements | Lawful Basis | Processing Purpose |
|---|---|---|---|
| Public Contact Inquiries | Full Name, Email, Phone, Message | Consent (freely given via unticked checkbox) | Responding to citizen inquiries and feedback |
| Volunteer / Mentorship Applications | Full Name, Email, Phone, State, City, Skills, Message | Consent and Legitimate Institutional Interest | Evaluating volunteer suitability for school and campus sessions |
| Outreach Photography | Images of outreach seminars (FGC Wukari) | Parental and Institutional Consent | Documenting educational impact and public accountability |
| Staff Dashboard Access | Official Email, Name, Auth Tokens, IP Address, Device ID | Contractual Necessity and Security Interest | Protecting institutional records and managing platform operations |

---

## 2. Minor Safeguarding and Photographic Integrity

In accordance with Section 31 of the NDPA and institutional safeguarding standards:
1. **Consent Gate:** Photographs depicting secondary school students require verified institutional and parental consent before publication.
2. **Server Enforcement:** The mobile API queries only records where `consent_verified = 1`. Unverified records are strictly filtered at the database level.
3. **Citizen Takedown Mechanism:** The mobile application provides an accessible takedown request tool inside the image viewer modal. Takedown requests generate a trackable reference code and notify administrators for swift review.

---

## 3. Data Retention Schedule

| Record Category | Retention Period | Deletion Procedure |
|---|---|---|
| Public General Inquiries | 12 months from resolution | Anonymized or purged from database |
| Volunteer Applications | 24 months from submission | Archived or deleted upon request |
| Temporary Anti Bot Challenges | 5 minutes from issuance | Auto expired by database indexing |
| Mobile Access Tokens | 15 minutes | Auto expired; overwritten on refresh |
| Mobile Refresh Tokens | 30 days or until revoked | Revoked immediately on sign out |
| Cryptographic Audit Logs | 7 years | Retained for regulatory accountability |

---

## 4. App Store Privacy Disclosures

### 4.1 Apple App Store (App Privacy Nutrition Label)
- **Data Used to Track You:** None. MindSpark Hub does not track users across third party apps or websites.
- **Data Linked to You:**
  - *Contact Info:* Name, Email, Phone (collected only when submitted via forms).
  - *User Content:* Form messages and takedown requests.
  - *Identifiers:* Hashed device identifier for rate limiting and bot defense.
- **Data Not Linked to You:** Diagnostics (crash rate and performance aggregates).

### 4.2 Google Play Store (Data Safety Form)
- **Data Shared with Third Parties:** No personal data is shared with third party advertisers or data brokers.
- **Data Collected:** Name, email, phone number, messages (only upon user initiated form submission).
- **Security Practices:**
  - Data is encrypted in transit over HTTPS (TLS 1.3).
  - Users can request deletion of their data by contacting privacy@mindsparkhub.org.
  - Staff tokens reside in hardware backed secure storage.
