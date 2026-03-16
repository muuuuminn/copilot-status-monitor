import { promises as fs } from 'node:fs';
import path from 'node:path';
import rules from '../config/evidence-rules.json' with { type: 'json' };
import { fetchText } from './fetch.js';
import { diffRecords } from './diff.js';
import { parseVsCodeMatrix } from './matrix.js';
import { renderMarkdown } from './report.js';
import { resolveStatuses } from './resolve.js';

const rootDir = process.cwd();
const snapshotsDir = path.join(rootDir, 'data', 'snapshots');
const diffsDir = path.join(rootDir, 'data', 'diffs');
const reportsDir = path.join(rootDir, 'reports');

async function ensureDirs() {
  await Promise.all([
    fs.mkdir(snapshotsDir, { recursive: true }),
    fs.mkdir(diffsDir, { recursive: true }),
    fs.mkdir(reportsDir, { recursive: true })
  ]);
}

async function readLatestSnapshot() {
  const files = (await fs.readdir(snapshotsDir)).filter((file) => file.endsWith('.json')).sort();
  const latest = files.at(-1);
  if (!latest) return {};
  const fullPath = path.join(snapshotsDir, latest);
  const raw = await fs.readFile(fullPath, 'utf8');
  return { name: latest, snapshot: JSON.parse(raw) };
}

async function main() {
  await ensureDirs();
  const now = new Date();
  const iso = now.toISOString();
  const stamp = iso.slice(0, 10);

  const matrixHtml = await fetchText(rules.matrixUrl);
  const matrixFeatures = parseVsCodeMatrix(matrixHtml);
  const records = await resolveStatuses(matrixFeatures, rules);

  const snapshot = {
    generatedAt: iso,
    sources: {
      matrixUrl: rules.matrixUrl,
      rulesFile: 'config/evidence-rules.json'
    },
    records
  };

  const previous = await readLatestSnapshot();
  const diff = diffRecords(previous.snapshot?.records ?? [], snapshot.records);

  const snapshotPath = path.join(snapshotsDir, `snapshot_${stamp}.json`);
  const diffPath = path.join(diffsDir, `diff_${stamp}.json`);
  const reportPath = path.join(reportsDir, 'latest.md');

  await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  await fs.writeFile(diffPath, JSON.stringify(diff, null, 2) + '\n', 'utf8');
  await fs.writeFile(reportPath, renderMarkdown(snapshot, diff, previous.name) + '\n', 'utf8');

  console.log(`Wrote ${snapshotPath}`);
  console.log(`Wrote ${diffPath}`);
  console.log(`Wrote ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
