import { fetchText } from './fetch.js';
import { normalizeText, snippetAround, unique } from './utils.js';

const cache = new Map();

async function getPage(url) {
  if (!cache.has(url)) {
    cache.set(url, fetchText(url));
  }
  return cache.get(url);
}

export async function collectEvidence(rule) {
  const evidence = [];
  for (const page of rule.pages) {
    const body = await getPage(page.url);
    const normalizedBody = normalizeText(body);
    const matchedPhrase = page.matchAny.find((phrase) => normalizedBody.includes(normalizeText(phrase)));
    if (!matchedPhrase) continue;

    const statuses = [];
    if ((page.publicPreviewHints ?? []).some((hint) => normalizedBody.includes(normalizeText(hint)))) {
      statuses.push('Public Preview');
    }
    if ((page.gaHints ?? []).some((hint) => normalizedBody.includes(normalizeText(hint)))) {
      statuses.push('GA');
    }
    if (statuses.length === 0) statuses.push('Unknown');

    for (const status of unique(statuses)) {
      evidence.push({
        url: page.url,
        matchedPhrase,
        matchedSnippet: snippetAround(body, matchedPhrase),
        suggestedStatus: status,
        reason: `Matched "${matchedPhrase}" on page`
      });
    }
  }
  return evidence;
}
