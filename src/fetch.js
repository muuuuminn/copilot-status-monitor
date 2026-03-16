export async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'copilot-status-monitor/0.2 (+https://github.com)'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
