/**
 * Automated Writing Rules Checker for MindSpark Hub
 * Enforces Section 2.1 of Master Build Prompt:
 * - NO em dashes (—) anywhere
 * - NO en dashes (–) anywhere
 * - NO emojis or decorative unicode symbols
 * - NO visible copy hyphens (e.g. "secondary-school", "anti-social", "real-world")
 * Technical hyphens in code (CSS classes, paths, HTML attributes) are permitted.
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');
const CONTENT_DIR = path.resolve('src/data');

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const EM_DASH = '\u2014';
const EN_DASH = '\u2013';

// Problematic visible hyphens that must be rewritten per Section 2.1
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
];

let errorsFound = 0;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Skip comment lines or technical configuration lines
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // Check for em dash
    if (line.includes(EM_DASH)) {
      console.error(`[RULE VIOLATION] Em dash found at ${filePath}:${lineNum}`);
      console.error(`  > ${line.trim()}`);
      errorsFound++;
    }

    // Check for en dash
    if (line.includes(EN_DASH)) {
      console.error(`[RULE VIOLATION] En dash found at ${filePath}:${lineNum}`);
      console.error(`  > ${line.trim()}`);
      errorsFound++;
    }

    // Check for emoji
    if (EMOJI_REGEX.test(line)) {
      console.error(`[RULE VIOLATION] Emoji found at ${filePath}:${lineNum}`);
      console.error(`  > ${line.trim()}`);
      errorsFound++;
    }

    // Check for forbidden hyphenated copy in JSX strings or data strings
    for (const pattern of FORBIDDEN_WORDS_WITH_HYPHENS) {
      if (pattern.test(line)) {
        // Exclude import statements and CSS class names
        if (!line.includes('import ') && !line.includes('className=') && !line.includes('href=')) {
          console.error(`[RULE VIOLATION] Forbidden visible hyphen found matching ${pattern} at ${filePath}:${lineNum}`);
          console.error(`  > ${line.trim()}`);
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
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        traverse(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|json|md)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

console.log('--- MindSpark Hub Writing Rules Scanner Starting ---');
traverse(SRC_DIR);

if (errorsFound > 0) {
  console.error(`\nBuild failed: ${errorsFound} writing rule violation(s) detected.`);
  process.exit(1);
} else {
  console.log('Writing rules check passed. No em dashes, en dashes, emojis, or forbidden visible hyphens found.');
}
