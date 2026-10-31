import { sanitizeHtml } from '@/lib/security/sanitizer';

export type ArticleBlock =
  | { type: 'heading'; level: 2 | 3 | 4; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'divider' };

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: ' to ',
  mdash: ', ',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

export function plainText(value: string): string {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?(p|h[1-6]|li|ul|ol|blockquote|strong|em|u|a|span)[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function normaliseText(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, ' '))
    .replace(/\u2014/g, ', ')
    .replace(/\u2013/g, ' to ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function htmlToBlocks(rawHtml: string): ArticleBlock[] {
  const safe = sanitizeHtml(rawHtml || '');
  const blocks: ArticleBlock[] = [];
  const pattern = /<(h2|h3|h4|p|blockquote|ul|ol|hr)\b[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(safe)) !== null) {
    const tag = (match[1] || 'hr').toLowerCase();
    const inner = match[2] || '';

    if (tag === 'hr') {
      blocks.push({ type: 'divider' });
      continue;
    }
    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi))
        .map((item) => normaliseText(item[1] || ''))
        .filter(Boolean);
      if (items.length > 0) {
        blocks.push({ type: 'list', ordered: tag === 'ol', items });
      }
      continue;
    }

    const text = normaliseText(inner);
    if (!text) continue;
    if (tag === 'h2') blocks.push({ type: 'heading', level: 2, text });
    else if (tag === 'h3') blocks.push({ type: 'heading', level: 3, text });
    else if (tag === 'h4') blocks.push({ type: 'heading', level: 4, text });
    else if (tag === 'blockquote') blocks.push({ type: 'quote', text });
    else blocks.push({ type: 'paragraph', text });
  }

  if (blocks.length === 0 && safe.trim()) {
    const fallback = normaliseText(safe);
    if (fallback) blocks.push({ type: 'paragraph', text: fallback });
  }

  return blocks;
}

export function textToBlocks(value: string): ArticleBlock[] {
  const paragraphs = (value || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => {
    const lines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length > 1 && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      return {
        type: 'list',
        ordered: true,
        items: lines.map((line) => line.replace(/^\d+[.)]\s+/, '')),
      };
    }
    return { type: 'paragraph', text: paragraph.replace(/\n/g, ' ') };
  });
}

export function publicImageUrl(siteUrl: string, value: string): string {
  if (!value) return '';
  if (/^https:\/\//i.test(value)) return value;
  return `${siteUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}
