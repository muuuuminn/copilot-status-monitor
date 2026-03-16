export function slugifyFeatureName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeText(value) {
  return normalizeWhitespace(value).toLowerCase();
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

export function unique(values) {
  return [...new Set(values)];
}

export function snippetAround(text, phrase, radius = 120) {
  const idx = normalizeText(text).indexOf(normalizeText(phrase));
  if (idx === -1) return '';
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + phrase.length + radius);
  return normalizeWhitespace(text.slice(start, end));
}
