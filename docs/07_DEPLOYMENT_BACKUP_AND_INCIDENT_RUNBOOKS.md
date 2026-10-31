# MindSpark Hub Official Platform: Deployment, Backup and Incident Response Runbooks

## 1. Production Deployment Runbook

### 1.1 Prerequisites
- Node.js 18+ or 20+ runtime
- Production environment variables configured in `.env.production`
- SSL/TLS certificate installed (Let's Encrypt / Cloudflare Edge TLS)

### 1.2 Environment Variables Specification
```bash
# Database Configuration
DATABASE_URL="file:./mindspark.db" # or postgresql://mindspark:secret@host/dbname

# Cryptographic Keys (Must be minimum 32 random bytes)
SESSION_SECRET="generate-32-char-cryptographic-hex-string"
MFA_ENCRYPTION_KEY="generate-32-char-key-for-mfa-secrets"

# Super Admin Initial Bootstrap (One-time secure initialization)
INITIAL_ADMIN_EMAIL="admin@mindsparkhub.org"
INITIAL_ADMIN_PASSWORD="ReplaceWithSecure16CharPass!"

# Public URLs
NEXT_PUBLIC_SITE_URL="https://mindsparkhub.org"
```

### 1.3 Pre-Deployment Verification Checks
```bash
# 1. Typecheck and lint
npm run lint
npm run typecheck

# 2. Execute automated security and writing rule test suites
npm run test:security
npm run test:copy-rules

# 3. Compile optimized production build
npm run build
```

---

## 2. Automated Backup and Restore Runbook

### 2.1 Backup Schedule & Architecture
- **Frequency:** Hourly differential database snapshot; Daily full encrypted cold backup.
- **Retention:** 30 daily snapshots, 12 monthly archives in geographically separate encrypted storage.
- **Recovery Point Objective (RPO):** < 1 hour.
- **Recovery Time Objective (RTO):** < 30 minutes.

### 2.2 Restore Verification Drill
```bash
# To test or execute database restoration:
# 1. Stop web service
systemctl stop mindspark-web

# 2. Archive current corrupted state for forensics
mv mindspark.db mindspark.db.corrupt.$(date +%s)

# 3. Restore verified encrypted snapshot
gpg --decrypt backup_mindspark_latest.db.gpg > mindspark.db

# 4. Verify database integrity
sqlite3 mindspark.db "PRAGMA integrity_check;"

# 5. Restart web service and verify health endpoint
systemctl start mindspark-web
curl -f http://localhost:3000/api/health
```

---

## 3. Security Incident Response Runbook

### 3.1 Severity Levels
- **SEV 1 (Critical):** Active administrative account takeover, unauthorized database modification, or live data exfiltration.
- **SEV 2 (High):** Repeated brute force credential attacks, safeguarding takedown request unresolved > 2 hours, or broken access control bug.
- **SEV 3 (Medium):** Spammed public forms, localized denial of service, non-critical certificate expiration warning.

### 3.2 Immediate Containment Procedure (SEV 1)
1. **Revoke Active Sessions:** Execute global session invalidation query:
   ```sql
   DELETE FROM sessions;
   ```
2. **Lock Compromised Account:**
   ```sql
   UPDATE users SET is_active = 0, locked_until = datetime('now', '+7 days') WHERE email = 'compromised@mindsparkhub.org';
   ```
3. **Inspect Append-Only Audit Trail:**
   Query `audit_logs` for all actions taken by the compromised actor during the attack window.
4. **Initiate Communication:** If personal data was impacted, notify the Nigeria Data Protection Commission (NDPC) within 72 hours per NDPA statutory guidelines.
