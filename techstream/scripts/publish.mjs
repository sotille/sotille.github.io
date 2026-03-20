#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const root = process.cwd();
const dataFile = path.join(root, 'data/news.json');
const anthropic = new Anthropic();

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

async function generateBullets(hn, release) {
  const context = [
    hn      ? `Main story: "${hn.title}" (${hn.points} HN points) — ${hn.link}` : null,
    release ? `Framework release: ${release.repo} released ${release.name}`      : null,
  ].filter(Boolean).join('\n');

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `You are a senior tech news editor writing for experienced developers.

Based on these headlines, write exactly 3 bullet points in Brazilian Portuguese and 3 in English.

Headlines:
${context}

Rules:
- Each bullet is one sentence, max 110 characters
- First bullet: what the story actually is (no title repetition)
- Second bullet: why it matters technically or architecturally
- Third bullet: concrete practical impact for developers
- Tone: direct, sharp, zero filler words
- Do NOT start bullets with "Destaque:", "Highlight:", or the title verbatim

Respond ONLY with valid JSON, no markdown:
{"bullets":["pt1","pt2","pt3"],"bullets_en":["en1","en2","en3"]}`
    }]
  });

  try {
    return JSON.parse(response.content[0].text.trim());
  } catch {
    return null;
  }
}

async function main() {
  const [hn, release] = await Promise.all([fetchHN(), fetchGitHubRelease()]);

  // Try Claude-generated bullets; fall back to simple ones if API fails
  let bullets, bullets_en;
  try {
    const generated = await generateBullets(hn, release);
    bullets    = generated?.bullets;
    bullets_en = generated?.bullets_en;
  } catch (err) {
    console.warn('Claude API error, using fallback bullets:', err.message);
  }

  if (!bullets || bullets.length < 2) {
    bullets = [
      hn      ? `Destaque: ${hn.title}.`                              : 'Sem destaque forte em HN para AI Agents nas últimas horas.',
      release ? `Release: ${release.repo} lançou ${release.name}.`   : 'Sem update relevante de framework nas fontes monitoradas.',
    ];
    bullets_en = [
      hn      ? `Highlight: ${hn.title}.`                            : 'No strong AI Agents highlight on HN in the last few hours.',
      release ? `Release: ${release.repo} released ${release.name}.` : 'No relevant framework update from monitored sources.',
    ];
  }

  const now = new Date();
  const sourceSummary = [
    hn?.source,
    release ? `GitHub Releases (${release.repo})` : null
  ].filter(Boolean).join(' + ') || 'Curadoria automática';

  const item = {
    id:            now.toISOString().slice(0, 10),
    date:          now.toISOString(),
    title:         hn?.title    || 'Sem novidades relevantes hoje.',
    title_en:      hn?.title    || 'No relevant news today.',
    link:          hn?.link     || (release?.link ?? 'https://news.ycombinator.com/'),
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
