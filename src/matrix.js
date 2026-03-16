import { normalizeText, normalizeWhitespace, slugifyFeatureName } from './utils.js';

function stripTagsLocal(html) {
  return normalizeWhitespace(html.replace(/<[^>]+>/g, ' '));
}

function mapSymbol(symbol) {
  const clean = normalizeWhitespace(symbol);
  if (clean.includes('✓')) return 'supported';
  if (clean.includes('P')) return 'preview';
  if (clean.includes('C')) return 'conditional';
  if (clean.includes('✗')) return 'unsupported';
  return 'unknown';
}

export function parseVsCodeMatrix(html) {
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gis;
  const headings = [...html.matchAll(headingRegex)];

  for (let i = 0; i < headings.length; i += 1) {
    const headingText = stripTagsLocal(headings[i][2]);
    const normalizedHeading = normalizeText(headingText);
    if (!normalizedHeading.includes('vs code') || !normalizedHeading.includes('latest')) continue;

    const start = (headings[i].index ?? 0) + headings[i][0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : html.length;
    const section = html.slice(start, end);
    const tableMatch = section.match(/<table[\s\S]*?<\/table>/i);
    if (!tableMatch) continue;

    const tbodyMatch = tableMatch[0].match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    const body = tbodyMatch ? tbodyMatch[1] : tableMatch[0];
    const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const parsed = rows.map((row) => {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) => stripTagsLocal(cell[1]));
      const featureName = cells[0] ?? '';
      const rawSymbol = cells[1] ?? '';
      return {
        featureKey: slugifyFeatureName(featureName),
        featureName,
        support: mapSymbol(rawSymbol),
        rawSymbol
      };
    }).filter((item) => item.featureName);

    if (parsed.length > 0) return parsed;
  }

  throw new Error('Could not find the VS Code latest releases matrix table.');
}
