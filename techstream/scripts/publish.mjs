#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataFile = path.join(root, 'data/news.json');

async function fetchHN() {
  const url = 'https://hn.algolia.com/api/v1/search_by_date?query=AI%20agents&tags=story&hitsPerPage=10';
  const res = await fetch(url);
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
      const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=1`, {
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

  const now = new Date();
  const item = {
    id: now.toISOString().slice(0, 10),
    date: now.toISOString(),
    title: hn?.title || 'Sem novidades relevantes hoje.',
    link: hn?.link || (release?.link ?? 'https://news.ycombinator.com/'),
    sourceSummary: [hn?.source, release ? `GitHub Releases (${release.repo})` : null].filter(Boolean).join(' + ') || 'Curadoria automática',
    bullets: [
      hn ? `Destaque: ${hn.title}` : 'Sem destaque forte em HN para AI Agents nas últimas horas.',
      release ? `Update de framework: ${release.repo} lançou ${release.name}.` : 'Sem update relevante de framework nas fontes monitoradas.',
      'Impacto prático: acompanhar tendências de agentes para decisões de stack e automação.',
      'Resumo ultracurto para operação diária de baixo custo.'
    ].slice(0, 4)
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
