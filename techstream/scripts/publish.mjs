#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataFile = path.join(root, 'data/news.json');

async function fetchWithTimeout(url, options = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHN() {
  const url = 'https://hn.algolia.com/api/v1/search_by_date?query=AI%20agents&tags=story&hitsPerPage=10';
  const res = await fetchWithTimeout(url);
  const json = await res.json();
  const top = (json.hits || []).find(h => h.url && h.title);
  if (!top) return null;
  return {
    title: top.title,
    link: top.url,
    source: 'Hacker News',
    points: top.points || 0
  };
}

async function fetchGitHubRelease() {
  const repos = [
    'langchain-ai/langchain',
    'crewAIInc/crewAI',
    'Significant-Gravitas/AutoGPT'
  ];
  for (const repo of repos) {
    try {
      const res = await fetchWithTimeout(`https://api.github.com/repos/${repo}/releases?per_page=1`, {
        headers: { 'User-Agent': 'techstream-bot' }
      });
      if (!res.ok) continue;
      const releases = await res.json();
      if (!Array.isArray(releases) || releases.length === 0) continue;
      const r = releases[0];
      return {
        repo,
        name: r.name || r.tag_name,
        link: r.html_url,
        publishedAt: r.published_at
      };
    } catch {}
  }
  return null;
}

async function main() {
  const [hn, release] = await Promise.all([fetchHN(), fetchGitHubRelease()]);

  const bullets = [];
  const bullets_en = [];

  if (hn) {
    const pts    = hn.points ? ` (${hn.points} pontos no HN)` : '';
    const pts_en = hn.points ? ` (${hn.points} points on HN)` : '';
    bullets.push(`Destaque: ${hn.title}${pts}.`);
    bullets_en.push(`Highlight: ${hn.title}${pts_en}.`);
  } else {
    bullets.push('Sem destaque forte em HN para AI Agents nas últimas horas.');
    bullets_en.push('No strong AI Agents highlight on HN in the last few hours.');
  }

  if (release) {
    bullets.push(`Release: ${release.repo} lançou ${release.name}.`);
    bullets_en.push(`Release: ${release.repo} released ${release.name}.`);
  } else {
    bullets.push('Sem update relevante de framework nas fontes monitoradas.');
    bullets_en.push('No relevant framework update from monitored sources.');
  }

  const now = new Date();
  const sourceSummary = [
    hn?.source,
    release ? `GitHub Releases (${release.repo})` : null
  ].filter(Boolean).join(' + ') || 'Curadoria automática';

  const item = {
    id: now.toISOString().slice(0, 10),
    date: now.toISOString(),
    title: hn?.title || 'Sem novidades relevantes hoje.',
    title_en: hn?.title || 'No relevant news today.',
    link: hn?.link || (release?.link ?? 'https://news.ycombinator.com/'),
    sourceSummary,
    bullets,
    bullets_en,
  };

  const current = JSON.parse(await fs.readFile(dataFile, 'utf8'));
  const items = Array.isArray(current.items) ? current.items : [];

  if (items[0]?.id === item.id) {
    items[0] = item;
  } else {
    items.unshift(item);
  }

  await fs.writeFile(dataFile, JSON.stringify({ items: items.slice(0, 30) }, null, 2) + '\n');
  console.log('Published:', item.title);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
