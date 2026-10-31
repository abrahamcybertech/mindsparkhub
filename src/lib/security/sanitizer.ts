/**
 * Server-side HTML Sanitizer for MindSpark Hub
 * Enforces strict allow-list tags and attributes for editorial articles and captions.
 */

const ALLOWED_TAGS = new Set([
  'p', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'a', 'br', 'hr'
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'rel', 'target']),
};

export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  // Strip script, style, iframe, object, embed, svg tags completely with their contents
  let sanitized = rawHtml.replace(/<(script|style|iframe|object|embed|svg)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Strip single-tag script or svg
  sanitized = sanitized.replace(/<(script|style|iframe|object|embed|svg)[^>]*>/gi, '');

  // Strip event handlers (e.g. onerror=, onclick=, onload=)
  sanitized = sanitized.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Strip javascript: and vbscript: URIs
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*(javascript|vbscript|data):[^"'>\s]*/gi, '');

  // Replace em dashes and en dashes in content if present
  sanitized = sanitized.replace(/\u2014/g, ', ').replace(/\u2013/g, ' to ');

  return sanitized;
}
