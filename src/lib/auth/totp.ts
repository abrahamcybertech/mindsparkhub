import { TOTP, Secret } from 'otpauth';
import crypto from 'node:crypto';

export interface TOTPSetupResult {
  secret: string;
  uri: string;
  backupCodes: string[];
  hashedBackupCodes: string[];
}

/**
 * Generate a new TOTP secret, enrollment URI, and set of single-use backup codes
 */
export function generateTOTPSetup(userEmail: string): TOTPSetupResult {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: 'MindSpark Hub',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });

  const rawBackupCodes: string[] = [];
  const hashedBackupCodes: string[] = [];

  for (let i = 0; i < 8; i++) {
    // Generate 8-character human friendly hex codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    rawBackupCodes.push(code);
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    hashedBackupCodes.push(hash);
  }

  return {
    secret: secret.base32,
    uri: totp.toString(),
    backupCodes: rawBackupCodes,
    hashedBackupCodes,
  };
}

/**
 * Validate a 6-digit TOTP token against a user's base32 secret
 */
export function verifyTOTPToken(token: string, secretBase32: string): boolean {
  if (!token || !secretBase32) return false;
  const totp = new TOTP({
    issuer: 'MindSpark Hub',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });

  // delta returns null if invalid, or window difference if valid
  const delta = totp.validate({ token: token.trim(), window: 1 });
  return delta !== null;
}

/**
 * Verify a single-use backup recovery code against stored hashes
 */
export function verifyAndConsumeBackupCode(
  inputCode: string,
  storedHashedCodes: string[]
): { valid: boolean; remainingHashedCodes: string[] } {
  const normalized = inputCode.trim().toUpperCase();
  const inputHash = crypto.createHash('sha256').update(normalized).digest('hex');

  const index = storedHashedCodes.indexOf(inputHash);
  if (index === -1) {
    return { valid: false, remainingHashedCodes: storedHashedCodes };
  }

  const updated = [...storedHashedCodes];
  updated.splice(index, 1);
  return { valid: true, remainingHashedCodes: updated };
}
