import crypto from 'node:crypto';

const ENCRYPTED_PREFIX = 'enc:v1:';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer | null {
  const raw = process.env.MFA_ENCRYPTION_KEY;
  if (!raw) return null;

  const key = Buffer.from(raw, 'hex');
  return key.length === 32 ? key : null;
}

export function encryptSecret(value: string): string {
  if (!value) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(value: string): string {
  if (!value || !value.startsWith(ENCRYPTED_PREFIX)) return value;

  const key = getEncryptionKey();
  if (!key) {
    throw new Error('MFA_ENCRYPTION_KEY is required to decrypt stored MFA secrets.');
  }

  const parts = value.slice(ENCRYPTED_PREFIX.length).split('.');
  if (parts.length !== 3) {
    throw new Error('Encrypted MFA secret is malformed.');
  }

  const iv = Buffer.from(parts[0], 'base64url');
  const authTag = Buffer.from(parts[1], 'base64url');
  const encrypted = Buffer.from(parts[2], 'base64url');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Encrypted MFA secret has an invalid header.');
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
