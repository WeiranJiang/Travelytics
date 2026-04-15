/**
 * Remove |MASK| anonymisation tokens from text and tidy up any whitespace or
 * punctuation artefacts they leave behind (e.g. double-spaces, orphaned commas).
 */
export function removeMask(input?: string): string | undefined {
  const value = emptyToUndefined(input);
  if (!value) return undefined;
  return value
    .replace(/\|MASK\|/g, '')       // strip every |MASK| token
    .replace(/[ \t]{2,}/g, ' ')     // collapse consecutive spaces
    .replace(/,\s*,/g, ',')         // remove double-commas
    .replace(/^[,\s]+|[,\s]+$/g, '') // trim leading/trailing commas & spaces
    .trim() || undefined;
}

export function emptyToUndefined(value?: string): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function parseNumber(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function stripHtml(input?: string): string | undefined {
  const value = emptyToUndefined(input);
  if (!value) return undefined;
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>\s*<p>/gi, ' ')
    .replace(/<\/li>\s*<li>/gi, ' ')
    .replace(/<li>/gi, '')
    .replace(/<\/?(ul|ol|p)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sentenceCase(input?: string): string | undefined {
  const value = emptyToUndefined(input);
  if (!value) return undefined;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseMdyyToIso(input?: string): string | undefined {
  const value = emptyToUndefined(input);
  if (!value) return undefined;
  const [m, d, yy] = value.split('/').map(Number);
  if (!m || !d || !yy) return undefined;
  const fullYear = yy >= 70 ? 1900 + yy : 2000 + yy;
  const date = new Date(Date.UTC(fullYear, m - 1, d));
  return date.toISOString().slice(0, 10);
}

export function humanizeSnakeCase(input: string): string {
  const custom: Record<string, string> = {
    ac: 'Air conditioning',
    breakfast_included: 'Buffet breakfast included',
    wifi: 'Wi-Fi',
  };
  if (custom[input]) return custom[input];
  return input
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseJsonStringArray(input?: string): string[] {
  const value = emptyToUndefined(input);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item));
  } catch {
    return [];
  }
}

export function normalizeTextList(input?: string): string[] {
  const parsed = parseJsonStringArray(input)
    .map((value) => stripHtml(value))
    .filter((value): value is string => Boolean(value));

  if (parsed.length > 0) return parsed;

  const single = stripHtml(input);
  return single ? [single] : [];
}

export function normalizeText(input?: string, fallback = ''): string {
  const items = normalizeTextList(input);
  if (items.length > 0) return items.join(' · ');
  return fallback;
}
