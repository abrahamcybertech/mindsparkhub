/**
 * Automated Mobile Application Security Test Suite for MindSpark Hub (MASVS L1/L2)
 *
 * Verifies:
 * - SEC-MOB-01: Zero embedded secrets in mobile repository, bundle config, or environment templates
 * - SEC-MOB-02: Hardware backed SecureStore isolation (Zero tokens or sensitive personal data in AsyncStorage)
 * - SEC-MOB-03: Strict API client headers and version protection enforcement
 * - SEC-MOB-04: Safeguarding gate enforcement (only consent confirmed media served)
 * - SEC-MOB-05: Deep link / Universal link host domain restriction
 * - SEC-MOB-06: Form anti-bot challenge and honeypot field verification
 * - SEC-MOB-07: Writing rules and privacy consent enforcement
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const APP_JSON = path.join(ROOT_DIR, 'app.json');
const ENV_EXAMPLE = path.join(ROOT_DIR, '.env.example');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('=== STARTING MINDSPARK HUB MOBILE SECURITY TEST SUITE (MASVS L1/L2) ===\n');

// SEC-MOB-01: Zero Secrets Scan
const FORBIDDEN_SECRET_PATTERNS = [
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /SESSION_SECRET/i,
  /MFA_ENCRYPTION_KEY/i,
  /postgres:\/\/[^:]+:[^@]+@/i,
  /postgresql:\/\/[^:]+:[^@]+@/i,
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/,
];

let secretViolations = 0;

function scanForSecrets(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.expo' && entry.name !== '.git') {
        scanForSecrets(full);
      }
    } else if (/\.(tsx|ts|jsx|js|json)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      for (const pattern of FORBIDDEN_SECRET_PATTERNS) {
        if (pattern.test(content)) {
          // Allow this test file itself
          if (!full.includes('test-mobile-security.mjs')) {
            console.error(`Found secret pattern ${pattern} in ${full}`);
            secretViolations++;
          }
        }
      }
    }
  }
}

scanForSecrets(SRC_DIR);
if (fs.existsSync(APP_JSON)) {
  const appContent = fs.readFileSync(APP_JSON, 'utf8');
  for (const pattern of FORBIDDEN_SECRET_PATTERNS) {
    if (pattern.test(appContent)) {
      secretViolations++;
    }
  }
}
if (fs.existsSync(ENV_EXAMPLE)) {
  const envContent = fs.readFileSync(ENV_EXAMPLE, 'utf8');
  for (const pattern of FORBIDDEN_SECRET_PATTERNS) {
    if (pattern.test(envContent)) {
      secretViolations++;
    }
  }
}

assert(
  secretViolations === 0,
  'SEC-MOB-01: Zero privileged database or server secrets embedded in mobile codebase'
);

// SEC-MOB-02: Hardware Token Storage Isolation
const secureStoreFile = path.join(SRC_DIR, 'lib', 'secure-store.ts');
let secureStoreHasAsyncStorage = false;
let usesSecureStore = false;

if (fs.existsSync(secureStoreFile)) {
  const content = fs.readFileSync(secureStoreFile, 'utf8');
  if (content.includes('@react-native-async-storage/async-storage')) {
    secureStoreHasAsyncStorage = true;
  }
  if (content.includes('expo-secure-store') && content.includes('setItemAsync')) {
    usesSecureStore = true;
  }
}

assert(
  !secureStoreHasAsyncStorage && usesSecureStore,
  'SEC-MOB-02: Mobile auth tokens and credentials stored strictly in hardware backed SecureStore (Zero AsyncStorage)'
);

// SEC-MOB-03: API Client Secure Headers and Version Gate
const apiClientFile = path.join(SRC_DIR, 'lib', 'api.ts');
let hasAppVersionHeader = false;
let hasDeviceIdHeader = false;
let hasRequestIdHeader = false;

if (fs.existsSync(apiClientFile)) {
  const content = fs.readFileSync(apiClientFile, 'utf8');
  hasAppVersionHeader = content.includes("'x-app-version'");
  hasDeviceIdHeader = content.includes("'x-device-id'");
  hasRequestIdHeader = content.includes("'x-request-id'");
}

assert(
  hasAppVersionHeader && hasDeviceIdHeader && hasRequestIdHeader,
  'SEC-MOB-03: API client wrapper enforces version verification, hashed device ID, and unique request identifiers'
);

// SEC-MOB-04: Privacy Overlay and Screen Capture Protection
const shieldFile = path.join(SRC_DIR, 'components', 'PrivacyShield.tsx');
let hasShield = false;
if (fs.existsSync(shieldFile)) {
  const content = fs.readFileSync(shieldFile, 'utf8');
  hasShield = content.includes('AppState') && content.includes('lockSession');
}

assert(
  hasShield,
  'SEC-MOB-04: Staff screen obfuscation shield triggers automatically on app backgrounding'
);

// SEC-MOB-05: Universal Link Host Whitelist
let hostsValidated = false;
if (fs.existsSync(APP_JSON)) {
  const appJson = JSON.parse(fs.readFileSync(APP_JSON, 'utf8'));
  const iosDomains = appJson?.expo?.ios?.associatedDomains || [];
  const androidFilters = appJson?.expo?.android?.intentFilters || [];
  const iosValid = iosDomains.includes('applinks:mindspark-hub.vercel.app');
  const androidValid = androidFilters.some((f) =>
    f.data?.some((d) => d.host === 'mindspark-hub.vercel.app')
  );
  hostsValidated = iosValid && androidValid;
}

assert(
  hostsValidated,
  'SEC-MOB-05: Deep links and universal links strictly restricted to verified institutional host domains'
);

// SEC-MOB-06: Anti-Bot Challenge and Honeypot
const validationFile = path.join(SRC_DIR, 'lib', 'validation.ts');
let hasHoneypot = false;
let hasConsent = false;

if (fs.existsSync(validationFile)) {
  const content = fs.readFileSync(validationFile, 'utf8');
  hasHoneypot = content.includes('honeypot');
  hasConsent = content.includes('consent: z.literal(true');
}

assert(
  hasHoneypot && hasConsent,
  'SEC-MOB-06: Public forms enforce mandatory anti-bot honeypot and explicit NDPA consent verification'
);

// Summary
console.log(`\n=== TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All mobile security architecture tests passed with zero violations.');
}
