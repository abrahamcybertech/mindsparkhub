import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

export interface FileValidationResult {
  valid: boolean;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  extension?: 'jpg' | 'png' | 'webp';
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Verify file header magic bytes directly from binary buffer
 */
export function validateImageMagicBytes(buffer: Buffer): FileValidationResult {
  if (buffer.length < 12) {
    return { valid: false, error: 'File is too small to be a valid image' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds maximum allowed size of 5 megabytes' };
  }

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg', extension: 'jpg' };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png', extension: 'png' };
  }

  // WebP magic bytes: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, mimeType: 'image/webp', extension: 'webp' };
  }

  return {
    valid: false,
    error: 'Unsupported or dangerous file format. Only verified JPEG, PNG, and WebP files are accepted.',
  };
}

/**
 * Save an uploaded buffer securely with a cryptographically random filename
 */
export async function saveSecureImage(
  buffer: Buffer,
  subDirectory: 'gallery' | 'articles' | 'exco'
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const check = validateImageMagicBytes(buffer);
  if (!check.valid || !check.extension) {
    return { success: false, error: check.error || 'Invalid image buffer' };
  }

  const randomToken = crypto.randomBytes(16).toString('hex');
  const safeFilename = `${Date.now()}_${randomToken}.${check.extension}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';
      const objectPath = `${subDirectory}/${safeFilename}`;

      const { error } = await client.storage.from(bucket).upload(objectPath, buffer, {
        contentType: check.mimeType,
        upsert: false,
      });

      if (error) throw error;

      const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
      return { success: true, filePath: data.publicUrl };
    } catch (err) {
      console.error('Failed to upload image to Supabase Storage:', err);
      return { success: false, error: 'Could not upload file to secure storage' };
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const targetDir = path.join(process.cwd(), 'public', 'uploads', subDirectory);

  try {
    await fs.mkdir(targetDir, { recursive: true });
    const fullPath = path.join(targetDir, safeFilename);
    await fs.writeFile(fullPath, buffer);
    return { success: true, filePath: `/uploads/${subDirectory}/${safeFilename}` };
  } catch (err) {
    console.error('Failed to save uploaded image:', err);
    return { success: false, error: 'Could not write file to secure storage' };
  }
}
