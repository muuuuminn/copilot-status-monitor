function byKey(records) {
  return new Map(records.map((record) => [record.featureKey, record]));
}

export function diffRecords(previous, current) {
  const prevMap = byKey(previous);
  const currMap = byKey(current);
  const changes = [];

  for (const [key, curr] of currMap) {
    const prev = prevMap.get(key);
    if (!prev) {
      changes.push({
        featureKey: curr.featureKey,
        featureName: curr.featureName,
        changeType: 'added',
        currentValue: `${curr.matrixSupport} / ${curr.releaseStatus}`
      });
      continue;
    }

    if (prev.releaseStatus !== curr.releaseStatus) {
      changes.push({ featureKey: curr.featureKey, featureName: curr.featureName, changeType: 'release_status_changed', previousValue: prev.releaseStatus, currentValue: curr.releaseStatus });
    }
    if (prev.matrixSupport !== curr.matrixSupport) {
      changes.push({ featureKey: curr.featureKey, featureName: curr.featureName, changeType: 'support_changed', previousValue: prev.matrixSupport, currentValue: curr.matrixSupport });
    }
    if (prev.confidence !== curr.confidence) {
      changes.push({ featureKey: curr.featureKey, featureName: curr.featureName, changeType: 'confidence_changed', previousValue: prev.confidence, currentValue: curr.confidence });
    }
    if (prev.conflictFlag !== curr.conflictFlag) {
      changes.push({ featureKey: curr.featureKey, featureName: curr.featureName, changeType: 'conflict_changed', previousValue: String(prev.conflictFlag), currentValue: String(curr.conflictFlag) });
    }
    if (prev.notes.join(' | ') !== curr.notes.join(' | ')) {
      changes.push({ featureKey: curr.featureKey, featureName: curr.featureName, changeType: 'notes_changed', previousValue: prev.notes.join(' | '), currentValue: curr.notes.join(' | ') });
    }
  }

  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) {
      changes.push({ featureKey: prev.featureKey, featureName: prev.featureName, changeType: 'removed', previousValue: `${prev.matrixSupport} / ${prev.releaseStatus}` });
    }
  }

  return changes.sort((a, b) => a.featureName.localeCompare(b.featureName) || a.changeType.localeCompare(b.changeType));
}
