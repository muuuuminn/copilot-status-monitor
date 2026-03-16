import { collectEvidenceForFeature } from './evidence.js';
import { samePath, statusRank } from './utils.js';

function chooseRule(matrixFeature, rules) {
  const normalizedMatrixName = matrixFeature.featureName.toLowerCase();
  return rules.find((rule) =>
    rule.featureKey === matrixFeature.featureKey ||
    (rule.aliases ?? []).some((alias) => normalizedMatrixName.includes(alias.toLowerCase()))
  );
}

function classifyEvidence(evidence) {
  const preview = evidence.filter((item) => item.suggestedStatus === 'Public Preview');
  const ga = evidence.filter((item) => item.suggestedStatus === 'GA');
  const topPreview = preview[0];
  const topGa = ga[0];
  return { preview, ga, topPreview, topGa };
}

function pageSummary(pages) {
  return {
    totalPages: pages.length,
    categories: pages.reduce((acc, page) => {
      acc[page.category] = (acc[page.category] ?? 0) + 1;
      return acc;
    }, {})
  };
}

export async function resolveStatuses(matrixFeatures, config, pages) {
  const records = [];

  for (const matrixFeature of matrixFeatures) {
    const rule = chooseRule(matrixFeature, config.features);
    const evidence = rule ? collectEvidenceForFeature(rule, pages, config) : [];
    const { preview, ga, topPreview, topGa } = classifyEvidence(evidence);

    const notes = [];
    let releaseStatus = 'Unknown';
    let confidence = 'low';
    let conflictFlag = false;

    if (matrixFeature.support === 'preview') {
      releaseStatus = 'Public Preview';
      confidence = 'high';
      notes.push('Matrix shows P for VS Code.');
    }

    if (topPreview) {
      if (releaseStatus === 'GA') conflictFlag = true;
      releaseStatus = 'Public Preview';
      confidence = matrixFeature.support === 'preview' ? 'high' : 'medium';
      notes.push(`Higher-priority documentation indicates Public Preview (${topPreview.category}).`);
    }

    if (releaseStatus === 'Unknown' && topGa) {
      releaseStatus = 'GA';
      confidence = topGa.priority >= 4 ? 'medium' : 'low';
      notes.push(`Documentation indicates GA coverage (${topGa.category}).`);
    } else if (releaseStatus === 'Public Preview' && topGa) {
      conflictFlag = true;
      notes.push('Conflicting evidence: another page suggests GA coverage.');
    }

    if (matrixFeature.support === 'supported' && releaseStatus === 'Unknown') {
      notes.push('Matrix shows support in VS Code, but no explicit GA/Public Preview evidence was found.');
    }

    if (matrixFeature.support === 'conditional' && releaseStatus === 'Unknown') {
      notes.push('Matrix shows conditional support; explicit maturity evidence was not found.');
    }

    if (matrixFeature.support === 'unsupported') {
      releaseStatus = 'Unknown';
      confidence = 'low';
      notes.push('Feature is not supported in VS Code latest release, so GA/Public Preview is not classified for this surface.');
    }

    if (!rule) {
      notes.push('No feature-specific matching rule exists yet.');
    }

    const evidenceUrls = rule?.specificUrls ?? [];
    const directEvidencePresent = evidence.some((item) => evidenceUrls.some((url) => samePath(url, item.url)));
    if (rule && !directEvidencePresent) {
      notes.push('No evidence was found on preferred direct pages; status may rely on broader crawl matches or remain Unknown.');
    }

    records.push({
      featureKey: matrixFeature.featureKey,
      featureName: matrixFeature.featureName,
      surface: 'vscode',
      matrixSupport: matrixFeature.support,
      matrixSymbol: matrixFeature.rawSymbol,
      releaseStatus,
      confidence,
      conflictFlag,
      notes,
      evidence: evidence.slice(0, 8)
    });
  }

  return {
    records: records.sort((a, b) => {
      const rankDiff = statusRank(b.releaseStatus) - statusRank(a.releaseStatus);
      if (rankDiff !== 0) return rankDiff;
      return a.featureName.localeCompare(b.featureName);
    }),
    pageInventory: pageSummary(pages)
  };
}
