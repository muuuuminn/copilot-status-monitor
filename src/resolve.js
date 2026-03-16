import { collectEvidence } from './evidence.js';
import { statusRank } from './utils.js';

function chooseRule(matrixFeature, rules) {
  const normalizedMatrixName = matrixFeature.featureName.toLowerCase();
  return rules.find((rule) =>
    rule.featureKey === matrixFeature.featureKey ||
    rule.aliases.some((alias) => normalizedMatrixName.includes(alias.toLowerCase()))
  );
}

export async function resolveStatuses(matrixFeatures, config) {
  const records = [];

  for (const matrixFeature of matrixFeatures) {
    const rule = chooseRule(matrixFeature, config.rules);
    const evidence = rule ? await collectEvidence(rule) : [];
    const suggested = evidence
      .map((item) => item.suggestedStatus)
      .filter((item) => item && item !== 'Unknown');

    const notes = [];
    let releaseStatus = 'Unknown';
    let confidence = 'low';
    let conflictFlag = false;

    if (matrixFeature.support === 'preview') {
      releaseStatus = 'Public Preview';
      confidence = 'high';
      notes.push('Matrix shows P for VS Code.');
    }

    if (suggested.includes('Public Preview')) {
      if (releaseStatus === 'GA') conflictFlag = true;
      releaseStatus = 'Public Preview';
      confidence = matrixFeature.support === 'preview' ? 'high' : 'medium';
      notes.push('Documentation page contains a public preview indication.');
    }

    if (releaseStatus === 'Unknown' && suggested.includes('GA')) {
      releaseStatus = 'GA';
      confidence = 'medium';
      notes.push('Supporting documentation indicates GA coverage.');
    } else if (releaseStatus === 'Public Preview' && suggested.includes('GA')) {
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
      evidence
    });
  }

  return records.sort((a, b) => {
    const rankDiff = statusRank(b.releaseStatus) - statusRank(a.releaseStatus);
    if (rankDiff !== 0) return rankDiff;
    return a.featureName.localeCompare(b.featureName);
  });
}
