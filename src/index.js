import fs from 'node:fs/promises';
import path from 'node:path';
import rules from '../config/evidence-rules.json' with { type: 'json' };
import { fetchText } from './fetch.js';
import { parseVsCodeMatrix } from './matrix.js';
import { resolveStatuses } from './resolve.js';
import { diffPages, diffRecords } from './diff.js';
import { renderMarkdown } from './report.js';
import { crawlCopilotPages } from './crawl.js';

const cwd = process.cwd();
const snapshotsDir = path.join(cwd, 'data', 'snapshots');
const diffsDir = path.join(cwd, 'data', 'diffs');
const reportsDir = path.join(cwd, 'reports');

async function ensureDirs() {
  await fs.mkdir(snapshotsDir, { recursive: true });
  await fs.mkdir(diffsDir, { recursive: true });
  await fs.mkdir(reportsDir, { recursive: true });
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

  const [matrixHtml, pages] = await Promise.all([
    fetchText(rules.matrixUrl),
    crawlCopilotPages(rules)
  ]);

  const matrixFeatures = parseVsCodeMatrix(matrixHtml);
  const resolved = await resolveStatuses(matrixFeatures, rules, pages);

  const snapshot = {
    generatedAt: iso,
    sources: {
      rootUrl: rules.rootUrl,
      matrixUrl: rules.matrixUrl,
      rulesFile: 'config/evidence-rules.json'
    },
    pageInventory: resolved.pageInventory,
    crawledPages: pages.map((page) => ({
      url: page.url,
      title: page.title,
      category: page.category,
      headings: page.headings,
      text: page.text.slice(0, 2000)
    })),
    records: resolved.records
  };

  const previous = await readLatestSnapshot();
  const featureChanges = diffRecords(previous.snapshot?.records ?? [], snapshot.records);
  const pageChanges = diffPages(previous.snapshot?.crawledPages ?? [], snapshot.crawledPages);
  const diff = { generatedAt: iso, featureChanges, pageChanges };

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
