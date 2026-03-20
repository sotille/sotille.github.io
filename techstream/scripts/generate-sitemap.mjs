#!/usr/bin/env node
/**
 * Gera sitemap.xml a partir de data/news.json.
 * Rodar: node ./scripts/generate-sitemap.mjs
 * Integrado automaticamente no publish:daily via package.json.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const dataFile   = path.join(__dirname, '..', 'data/news.json');
const outFile    = path.join(__dirname, '..', 'sitemap.xml');
const BASE_URL   = 'https://sotille.github.io/techstream';

const data  = JSON.parse(await fs.readFile(dataFile, 'utf8'));
const items = Array.isArray(data.items) ? data.items : [];
const lastmod = items[0]?.date
  ? new Date(items[0].date).toISOString().slice(0, 10)
  : new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

await fs.writeFile(outFile, xml);
console.log('sitemap.xml gerado — lastmod:', lastmod);
