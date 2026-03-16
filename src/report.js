function esc(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function renderMarkdown(snapshot, diff, previousSnapshotName) {
  const lines = [];
  lines.push('# GitHub Copilot for VS Code status report');
  lines.push('');
  lines.push(`Generated at: ${snapshot.generatedAt}`);
  lines.push(`Matrix source: ${snapshot.sources.matrixUrl}`);
  lines.push(`Rules file: ${snapshot.sources.rulesFile}`);
  lines.push('');
  lines.push('## Current status');
  lines.push('');
  lines.push('| Feature | VS Code support | Release status | Confidence | Conflict | Notes | Evidence |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const record of snapshot.records) {
    const evidence = record.evidence.map((item) => `[link](${item.url})`).join('<br>');
    lines.push(`| ${esc(record.featureName)} | ${esc(record.matrixSupport)} (${esc(record.matrixSymbol)}) | ${esc(record.releaseStatus)} | ${esc(record.confidence)} | ${record.conflictFlag ? 'yes' : 'no'} | ${esc(record.notes.join(' / '))} | ${evidence} |`);
  }
  lines.push('');
  lines.push('## Diff from previous snapshot');
  lines.push('');
  if (previousSnapshotName) {
    lines.push(`Previous snapshot: ${previousSnapshotName}`);
    lines.push('');
  }
  if (diff.length === 0) {
    lines.push('No differences detected.');
  } else {
    lines.push('| Feature | Change type | Previous | Current |');
    lines.push('|---|---|---|---|');
    for (const item of diff) {
      lines.push(`| ${esc(item.featureName)} | ${esc(item.changeType)} | ${esc(item.previousValue ?? '-')} | ${esc(item.currentValue ?? '-')} |`);
    }
  }
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- Matrix `P` is treated as Public Preview for the VS Code surface.');
  lines.push('- Matrix `✓` only means supported in VS Code. Without explicit maturity evidence, release status remains Unknown.');
  lines.push('- Conflicts are surfaced when one document suggests Public Preview and another suggests GA.');
  return lines.join('\n');
}
