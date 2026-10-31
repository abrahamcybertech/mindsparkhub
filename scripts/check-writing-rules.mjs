/**
 * Automated Writing Rules Checker for MindSpark Hub Mobile App
 * Enforces Section 3.1 of Mobile App Master Build Prompt:
 * - NO em dashes (—) anywhere
 * - NO en dashes (–) anywhere
 * - NO emojis or decorative unicode symbols (including AI sparkle/star symbols)
 * - NO forbidden visible hyphens in copy (e.g. "secondary-school", "multi-factor", "anti-social", "real-world")
 * Technical hyphens in paths, package names, route segments, and CSS/style names are permitted.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');
const APP_JSON = path.join(ROOT_DIR, 'app.json');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/u;
const AI_SPARKLE_REGEX = /[\u2728\u2605\u2606\u2B50\u{1F31F}]/u;
const EM_DASH = '\u2014';
const EN_DASH = '\u2013';

// Problematic visible hyphens that must be rewritten per Section 3.1
const FORBIDDEN_WORDS_WITH_HYPHENS = [
  /secondary-school/i,
  /multi-factor/i,
  /two-step/i,
  /anti-social/i,
  /real-world/i,
  /purpose-driven/i,
  /life-changing/i,
  /well-researched/i,
  /cost-effective/i,
  /high-demand/i,
  /skill-based/i,
  /middle-aged/i,
  /follow-up/i,
  /working-class/i,
  /round-the-clock/i,
  /user-friendly/i,
  /full-time/i,
  /part-time/i,
  /in-depth/i,
  /first-hand/i,
  /step-by-step/i,
  /up-to-date/i,
  /hand-in-hand/i,
  /open-source/i,
  /state-of-the-art/i,
];

let errorsFound = 0;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    // Skip comment lines in code
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // Check for em dash
    if (line.includes(EM_DASH)) {
      console.error(`[RULE VIOLATION] Em dash found at ${filePath}:${lineNum}`);
      console.error(`  > ${trimmed}`);
      errorsFound++;
    }

    // Check for en dash
    if (line.includes(EN_DASH)) {
      console.error(`[RULE VIOLATION] En dash found at ${filePath}:${lineNum}`);
      console.error(`  > ${trimmed}`);
      errorsFound++;
    }

    // Check for emojis or AI sparkle symbols
    if (EMOJI_REGEX.test(line) || AI_SPARKLE_REGEX.test(line)) {
      console.error(`[RULE VIOLATION] Emoji or decorative symbol found at ${filePath}:${lineNum}`);
      console.error(`  > ${trimmed}`);
      errorsFound++;
    }

    // Check for forbidden hyphenated copy
    for (const pattern of FORBIDDEN_WORDS_WITH_HYPHENS) {
      if (pattern.test(line)) {
        // Exclude import statements, require statements, and file paths
        if (
          !line.includes('import ') &&
          !line.includes('require(') &&
          !line.includes('from ') &&
          !line.includes('href=') &&
          !line.includes('test(') &&
          !line.includes('//')
        ) {
          console.error(
            `[RULE VIOLATION] Forbidden visible hyphen matching ${pattern} at ${filePath}:${lineNum}`
          );
          console.error(`  > ${trimmed}`);
          errorsFound++;
        }
      }
    }
  });
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.expo' && entry.name !== '.git') {
        traverse(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|json|md)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

console.log('--- MindSpark Hub Mobile Writing Rules Scanner Starting ---');

if (fs.existsSync(APP_JSON)) {
  scanFile(APP_JSON);
}

traverse(SRC_DIR);
traverse(DOCS_DIR);

if (errorsFound > 0) {
  console.error(`\nCheck failed: ${errorsFound} writing rule violation(s) detected.`);
  process.exit(1);
} else {
  console.log('Writing rules check passed. No em dashes, en dashes, emojis, or forbidden visible hyphens found.');
}
