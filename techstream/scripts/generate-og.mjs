#!/usr/bin/env node
/**
 * Gera og-image.png (1200×630) para uso como Open Graph image.
 * Rodar: node ./scripts/generate-og.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, '..', 'og-image.png');

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#3b82f6" fill-opacity="0.07"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="#060d1a"/>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Glow blob -->
  <ellipse cx="380" cy="310" rx="420" ry="290" fill="#3b82f6" fill-opacity="0.04"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="5" height="630" fill="url(#grad)"/>

  <!-- Logo icon background -->
  <rect x="60" y="56" width="68" height="68" rx="16" fill="url(#grad)"/>
  <!-- Bolt polygon -->
  <polygon points="88,69 75,94 84,94 83,113 96,88 87,88 88,69" fill="white"/>

  <!-- Logo text -->
  <text x="150" y="103" font-family="sans-serif" font-size="42" font-weight="bold"
        fill="url(#grad)" letter-spacing="-1">TechStream</text>

  <!-- Separator -->
  <rect x="60" y="148" width="460" height="1" fill="#162038"/>

  <!-- Headline line 1 -->
  <text x="60" y="252" font-family="sans-serif" font-size="74" font-weight="bold"
        fill="#e8f0ff" letter-spacing="-2">Notícias de</text>
  <!-- Headline line 2 (gradient) -->
  <text x="60" y="346" font-family="sans-serif" font-size="74" font-weight="bold"
        fill="url(#grad)" letter-spacing="-2">IA &amp; Tecnologia</text>

  <!-- Subtext -->
  <text x="60" y="414" font-family="sans-serif" font-size="24" fill="#7c93b8">
    Curadoria diária · Sem ruído · Só o que importa
  </text>

  <!-- Live badge -->
  <rect x="60" y="516" width="64" height="34" rx="17" fill="#22c55e" fill-opacity="0.12"/>
  <circle cx="83" cy="533" r="5" fill="#22c55e"/>
  <text x="97" y="538" font-family="monospace" font-size="13" font-weight="bold"
        fill="#22c55e" letter-spacing="1">LIVE</text>

  <!-- Badge subtext -->
  <text x="141" y="538" font-family="monospace" font-size="13" fill="#3d5070">
    · Atualizado diariamente · AI &amp; Tech Curation
  </text>

  <!-- Radar decoration -->
  <circle cx="980" cy="315" r="212" fill="none" stroke="#162038" stroke-width="1"/>
  <circle cx="980" cy="315" r="148" fill="none" stroke="#162038" stroke-width="1"/>
  <circle cx="980" cy="315" r="84"  fill="none" stroke="#243558" stroke-width="1"/>
  <line x1="768" y1="315" x2="1192" y2="315" stroke="#162038" stroke-width="1"/>
  <line x1="980" y1="103" x2="980"  y2="527"  stroke="#162038" stroke-width="1"/>

  <!-- Sweep line -->
  <line x1="980" y1="315" x2="1162" y2="162"
        stroke="#3b82f6" stroke-width="2" stroke-opacity="0.5"/>

  <!-- Blips -->
  <circle cx="1060" cy="226" r="5" fill="#22c55e"/>
  <circle cx="876"  cy="390" r="4" fill="#22c55e" fill-opacity="0.7"/>
  <circle cx="1068" cy="376" r="3" fill="#22c55e" fill-opacity="0.5"/>
  <circle cx="904"  cy="248" r="3" fill="#22c55e" fill-opacity="0.4"/>

  <!-- Center dot -->
  <circle cx="980" cy="315" r="7" fill="#3b82f6"/>
  <circle cx="980" cy="315" r="3" fill="white"/>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(outFile);

console.log('og-image.png gerado em', outFile);
