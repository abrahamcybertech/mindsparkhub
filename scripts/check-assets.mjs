/**
 * Automated Asset Integrity Checker for MindSpark Hub Mobile
 * Verifies existence and valid PNG signatures for all branded mobile assets.
 */

import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_ASSETS = [
  'icon.png',
  'adaptive-icon.png',
  'splash-icon.png',
  'notification-icon.png',
  'favicon.png',
  'logo.png',
];

const ASSETS_DIR = path.resolve('assets');
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

let errors = 0;

console.log('--- Checking MindSpark Hub Mobile Brand Assets ---');

for (const assetName of REQUIRED_ASSETS) {
  const assetPath = path.join(ASSETS_DIR, assetName);
  if (!fs.existsSync(assetPath)) {
    console.error(`[ASSET ERROR] Missing required asset: ${assetName}`);
    errors++;
    continue;
  }

  const stat = fs.statSync(assetPath);
  if (stat.size === 0) {
    console.error(`[ASSET ERROR] Asset is empty: ${assetName}`);
    errors++;
    continue;
  }

  const fd = fs.openSync(assetPath, 'r');
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);

  if (!buffer.equals(PNG_MAGIC)) {
    console.error(`[ASSET ERROR] Asset is not a valid PNG (bad magic bytes): ${assetName}`);
    errors++;
    continue;
  }

  console.log(`[PASS] ${assetName} (${(stat.size / 1024).toFixed(1)} KB)`);
}

if (errors > 0) {
  console.error(`\nAsset check failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('All required mobile brand assets are present and valid PNG files.');
}
