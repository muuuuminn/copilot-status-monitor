export function slugifyFeatureName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function normalizeWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

export function normalizeText(value) {
  return normalizeWhitespace(value).toLowerCase();
}

export function stripTags(html) {
  return normalizeWhitespace(String(html).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '));
}

export function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function statusRank(status) {
  switch (status) {
    case 'Public Preview':
      return 3;
    case 'GA':
      return 2;
    default:
      return 1;
  }
}

export function confidenceRank(value) {
  switch (value) {
    case 'high': return 3;
    case 'medium': return 2;
    default: return 1;
  }
}

export function unique(values) {
  return [...new Set(values)];
}

export function snippetAround(text, phrase, radius = 160) {
  const source = String(text);
  const idx = normalizeText(source).indexOf(normalizeText(phrase));
  if (idx === -1) return '';
  const start = Math.max(0, idx - radius);
  const end = Math.min(source.length, idx + phrase.length + radius);
  return normalizeWhitespace(source.slice(start, end));
}

export function toAbsoluteUrl(baseUrl, href) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function samePath(a, b) {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return ua.origin === ub.origin && ua.pathname === ub.pathname;
  } catch {
    return a === b;
  }
}
