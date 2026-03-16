import { fetchText } from './fetch.js';
import { decodeHtmlEntities, normalizeText, stripTags, toAbsoluteUrl } from './utils.js';

const pageCache = new Map();

async function getHtml(url) {
  if (!pageCache.has(url)) {
    pageCache.set(url, fetchText(url));
  }
  return pageCache.get(url);
}

function extractLinks(html, currentUrl, includePathPrefix) {
  const out = [];
  const regex = /<a\b[^>]*href=["']([^"'#]+)(?:#[^"']*)?["'][^>]*>/gi;
  for (const match of html.matchAll(regex)) {
    const abs = toAbsoluteUrl(currentUrl, decodeHtmlEntities(match[1]));
    if (!abs) continue;
    const url = new URL(abs);
    if (url.hostname !== 'docs.github.com') continue;
    if (!url.pathname.startsWith(includePathPrefix)) continue;
    out.push(url.toString());
  }
  return [...new Set(out)];
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(decodeHtmlEntities(m[1])) : '';
}

function classifyPage(url, html) {
  const path = new URL(url).pathname;
  const bodyText = normalizeText(stripTags(html));
  if (path.includes('/reference/')) return 'reference';
  if (path.includes('/tutorial')) return 'tutorial';
  if (path.includes('/concept')) return 'feature_detail';
  if (path.includes('/using-github-copilot/') || path.includes('/how-tos/')) return 'howto';
  if (path.includes('/get-started/features')) return 'feature_catalog';
  if (path.includes('/managing-copilot/') || path.includes('/managing-copilot-for-your-organization') || bodyText.includes('for enterprise administrators')) return 'admin';
  if (path.includes('/get-started/')) return 'feature_catalog';
  return 'other';
}

function extractHeadings(html) {
  return [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((m) => stripTags(decodeHtmlEntities(m[1])))
    .filter(Boolean)
    .slice(0, 12);
}

export async function crawlCopilotPages(config) {
  const queue = [config.rootUrl];
  const visited = new Set();
  const pages = [];

  while (queue.length > 0 && pages.length < config.crawl.maxPages) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    const html = await getHtml(url);
    const text = stripTags(html);
    const page = {
      url,
      title: extractTitle(html),
      category: classifyPage(url, html),
      headings: extractHeadings(html),
      text,
      normalizedText: normalizeText(text)
    };
    pages.push(page);

    const links = extractLinks(html, url, config.crawl.includePathPrefix);
    for (const link of links) {
      if (!visited.has(link)) queue.push(link);
    }
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url));
}
