import { confidenceRank, normalizeText, samePath, snippetAround, unique } from './utils.js';

const CATEGORY_SCORE = {
  feature_detail: 4,
  feature_catalog: 4,
  reference: 3,
  howto: 2,
  tutorial: 1,
  admin: 1,
  other: 0
};

function keywordFound(text, keywords) {
  return keywords.find((kw) => text.includes(normalizeText(kw)));
}

function pagePriority(page, feature, config) {
  let score = CATEGORY_SCORE[page.category] ?? 0;
  if ((feature.preferredCategories ?? []).includes(page.category)) score += 2;
  if ((feature.specificUrls ?? []).some((url) => samePath(url, page.url))) score += 4;
  return score;
}

export function collectEvidenceForFeature(feature, pages, config) {
  const aliases = unique([feature.featureName, ...(feature.aliases ?? [])]).map(normalizeText);
  const evidence = [];

  for (const page of pages) {
    const matchedAlias = aliases.find((alias) => page.normalizedText.includes(alias));
    if (!matchedAlias) continue;

    const statuses = [];
    const previewHint = keywordFound(page.normalizedText, config.keywords.publicPreview);
    const gaHint = keywordFound(page.normalizedText, config.keywords.ga);
    const vscodeHint = keywordFound(page.normalizedText, config.keywords.vscode);

    if (previewHint) statuses.push('Public Preview');
    if (gaHint) statuses.push('GA');
    if (statuses.length === 0) statuses.push('Unknown');

    for (const status of unique(statuses)) {
      evidence.push({
        url: page.url,
        title: page.title,
        category: page.category,
        matchedAlias,
        matchedSnippet: snippetAround(page.text, matchedAlias),
        suggestedStatus: status,
        priority: pagePriority(page, feature, config),
        hasVsCodeContext: Boolean(vscodeHint),
        confidence: status === 'Unknown' ? 'low' : (page.category === 'feature_detail' || page.category === 'feature_catalog' || page.category === 'reference' ? 'medium' : 'low'),
        reason: [
          `Matched alias "${matchedAlias}"`,
          previewHint ? `preview hint "${previewHint}"` : null,
          gaHint ? `GA hint "${gaHint}"` : null,
          vscodeHint ? `VS Code hint "${vscodeHint}"` : 'No explicit VS Code hint on page'
        ].filter(Boolean).join('; ')
      });
    }
  }

  return evidence.sort((a, b) => {
    const pr = b.priority - a.priority;
    if (pr !== 0) return pr;
    const cr = confidenceRank(b.confidence) - confidenceRank(a.confidence);
    if (cr !== 0) return cr;
    return a.url.localeCompare(b.url);
  });
}
