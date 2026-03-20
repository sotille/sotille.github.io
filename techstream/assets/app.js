/* ── i18n ────────────────────────────────────────────────────── */
const TRANSLATIONS = {
  'pt-BR': {
    eyebrow:              'Monitoramento global · Atualizado diariamente',
    'title.prefix':       'Notícias de ',
    'title.hl':           'IA & Tecnologia',
    'hero.sub':           'Curadoria diária de tendências, lançamentos e destaques do mundo tech — sem ruído, só o que importa.',
    'radar.label':        'Monitoramento Global · Ativo',
    'section.title':      'Últimas notícias',
    'featured.badge':     'Destaque do dia',
    'card.source':        'Fonte principal',
    'footer.text':        'Atualizado automaticamente 1× ao dia · Curadoria de IA & Tech',
    'count.one':          '{n} item',
    'count.other':        '{n} itens',
    'ticker.loading':     'Carregando notícias…',
    'time.now':           'agora mesmo',
    'time.min':           'há {n}min',
    'time.hour':          'há {n}h',
    'time.day':           'há {n}d',
    'state.empty.title':  'Sem notícias publicadas ainda.',
    'state.empty.sub':    'Volte amanhã para a próxima curadoria.',
    'state.error.title':  'Falha ao carregar notícias.',
    'state.error.sub':    'Tente recarregar a página.',
    'lang.switch':        'EN',
    'lang.aria':          'Switch to English',
    'page.title':         'TechStream — Notícias de IA e Tecnologia',
    'meta.desc':          'Curadoria diária de notícias relevantes de IA e tecnologia. Atualizado automaticamente.',
    'newsletter.eyebrow': 'Newsletter',
    'newsletter.title':   'Receba no seu email',
    'newsletter.sub':     'Curadoria diária de IA & Tech direto na sua caixa de entrada, sem ruído.',
    'newsletter.placeholder': 'seu@email.com',
    'newsletter.btn':     'Inscrever',
    'newsletter.success': '✓ Inscrito! Verifique seu email.',
    'newsletter.error':   'Erro ao inscrever. Tente novamente.',
  },
  en: {
    eyebrow:              'Global Monitoring · Updated daily',
    'title.prefix':       '',
    'title.hl':           'AI & Tech News',
    'hero.sub':           'Daily curation of trends, launches and highlights from the tech world — no noise, only what matters.',
    'radar.label':        'Global Monitoring · Active',
    'section.title':      'Latest news',
    'featured.badge':     'Story of the day',
    'card.source':        'Primary source',
    'footer.text':        'Automatically updated 1× per day · AI & Tech Curation',
    'count.one':          '{n} item',
    'count.other':        '{n} items',
    'ticker.loading':     'Loading news…',
    'time.now':           'just now',
    'time.min':           '{n}min ago',
    'time.hour':          '{n}h ago',
    'time.day':           '{n}d ago',
    'state.empty.title':  'No news published yet.',
    'state.empty.sub':    'Come back tomorrow for the next curation.',
    'state.error.title':  'Failed to load news.',
    'state.error.sub':    'Try reloading the page.',
    'lang.switch':        'PT',
    'lang.aria':          'Mudar para Português',
    'page.title':         'TechStream — AI & Technology News',
    'meta.desc':          'Daily curation of relevant AI and technology news. Automatically updated.',
    'newsletter.eyebrow': 'Newsletter',
    'newsletter.title':   'Get it in your inbox',
    'newsletter.sub':     'Daily AI & Tech curation delivered straight to your inbox, no noise.',
    'newsletter.placeholder': 'your@email.com',
    'newsletter.btn':     'Subscribe',
    'newsletter.success': '✓ Subscribed! Check your email.',
    'newsletter.error':   'Error subscribing. Please try again.',
  },
};

let currentLang = localStorage.getItem('ts-lang') || 'pt-BR';

function t(key, vars = {}) {
  const str = TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS['pt-BR'][key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? _);
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t('page.title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t('meta.desc');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  const btn = document.getElementById('lang-btn');
  if (btn) {
    btn.textContent = t('lang.switch');
    btn.setAttribute('aria-label', t('lang.aria'));
  }
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('ts-lang', lang);
  applyTranslations();
  if (_newsSorted) renderNews(_newsSorted);
}

/* ── Icons ───────────────────────────────────────────────────── */
const EXTERNAL_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const BOLT_ICON    = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

/* ── Category detection & icons ──────────────────────────────── */
const CATEGORY_PATTERNS = {
  security: /security|vulnerab|cve|attack|breach|owasp|exploit|malware|hack|rogue|exposure/i,
  infra:    /kubernetes|k8s|docker|container|helm|devops|ci[\s/]cd|deploy|infra|ebpf|server/i,
  release:  /release|launch|v\d+\.\d+|npm|open.?source|lançou|released|platform/i,
  ai:       /\bai\b|agent|llm|gpt|claude|gemini|anthropic|openai|langchain|llama|rag|copilot|neural|mcp/i,
};

const CATEGORY_META = {
  ai: {
    label:    'AI & Agents',
    cls:      'cat--ai',
    icon: `<svg class="cat-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
      <circle class="cn1" cx="8" cy="2"  r="1.2" fill="currentColor"/>
      <circle class="cn2" cx="14" cy="8" r="1.2" fill="currentColor"/>
      <circle class="cn3" cx="8" cy="14" r="1.2" fill="currentColor"/>
      <circle class="cn4" cx="2" cy="8"  r="1.2" fill="currentColor"/>
      <line x1="8" y1="8" x2="8"  y2="2"  stroke="currentColor" stroke-width=".7" opacity=".35"/>
      <line x1="8" y1="8" x2="14" y2="8"  stroke="currentColor" stroke-width=".7" opacity=".35"/>
      <line x1="8" y1="8" x2="8"  y2="14" stroke="currentColor" stroke-width=".7" opacity=".35"/>
      <line x1="8" y1="8" x2="2"  y2="8"  stroke="currentColor" stroke-width=".7" opacity=".35"/>
    </svg>`,
  },
  security: {
    label:    'Security',
    cls:      'cat--security',
    icon: `<svg class="cat-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path class="sh-fill" d="M8 1.5L2.5 4v3.5C2.5 10.8 5 13.5 8 14.5c3-1 5.5-3.7 5.5-7V4L8 1.5z" fill="currentColor" opacity=".15"/>
      <path d="M8 1.5L2.5 4v3.5C2.5 10.8 5 13.5 8 14.5c3-1 5.5-3.7 5.5-7V4L8 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M5.5 8l1.7 1.7L10.5 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  infra: {
    label:    'Infra & DevOps',
    cls:      'cat--infra',
    icon: `<svg class="cat-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2"   width="12" height="3.5" rx="1" stroke="currentColor" stroke-width="1.1"/>
      <rect x="2" y="6.5" width="12" height="3.5" rx="1" stroke="currentColor" stroke-width="1.1"/>
      <rect x="2" y="11"  width="12" height="2.5" rx="1" stroke="currentColor" stroke-width="1.1"/>
      <circle class="bk1" cx="11.5" cy="3.75"  r="1" fill="currentColor"/>
      <circle class="bk2" cx="11.5" cy="8.25"  r="1" fill="currentColor"/>
    </svg>`,
  },
  release: {
    label:    'Release',
    cls:      'cat--release',
    icon: `<svg class="cat-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path class="rk-body" d="M8 1.5c0 0-3.5 3.5-3.5 7.5l3.5 3.5 3.5-3.5C11.5 5 8 1.5 8 1.5z" fill="currentColor" opacity=".18"/>
      <path d="M8 1.5c0 0-3.5 3.5-3.5 7.5l3.5 3.5 3.5-3.5C11.5 5 8 1.5 8 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
      <path d="M5 12.5l-1.5 1.5M11 12.5l1.5 1.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".5"/>
    </svg>`,
  },
  tech: {
    label:    'Tech',
    cls:      'cat--tech',
    icon: `<svg class="cat-svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <polygon class="bolt" points="9 1 4 9 8 9 7 15 12 7 8 7 9 1"/>
    </svg>`,
  },
};

function detectCategory(item) {
  const text = (item.title || '') + ' ' + (item.title_en || '') + ' ' + (item.bullets || []).join(' ');
  for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(text)) return cat;
  }
  return 'tech';
}

function categoryBadge(item) {
  const cat  = detectCategory(item);
  const meta = CATEGORY_META[cat];
  return `<span class="cat-badge ${meta.cls}">${meta.icon}${meta.label}</span>`;
}

/* ── Date helpers ────────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso) {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 2)  return t('time.now');
  if (diffMin < 60) return t('time.min', { n: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return t('time.hour', { n: diffH });
  const diffD = Math.floor(diffH / 24);
  return t('time.day', { n: diffD });
}

/* ── Item helpers (bilingual content) ───────────────────────── */
function itemTitle(item) {
  return (currentLang === 'en' && item.title_en) ? item.title_en : item.title;
}

function itemBullets(item) {
  return (currentLang === 'en' && item.bullets_en) ? item.bullets_en : item.bullets;
}

/* ── Source chip ─────────────────────────────────────────────── */
function sourceMeta(item) {
  if (!item.sourceSummary) return '';
  return `<span class="card-sep">·</span>
          <span class="card-source" title="${item.sourceSummary}">${item.sourceSummary}</span>`;
}

/* ── Featured card (lead story) ─────────────────────────────── */
function renderFeaturedCard(item) {
  const bullets = itemBullets(item).map(b => `<li>${b}</li>`).join('');
  return `
    <article class="card card--featured">
      <div class="featured-header">
        <div class="featured-header-left">
          <span class="featured-badge">${BOLT_ICON} ${t('featured.badge')}</span>
          ${categoryBadge(item)}
        </div>
        <div class="card-meta" style="margin:0">
          <span class="card-date">${formatDate(item.date)}</span>
          <span class="card-sep">·</span>
          <span class="card-ago" id="featured-card-ago">${timeAgo(item.date)}</span>
          ${sourceMeta(item)}
        </div>
      </div>
      <h3 class="card-title">${itemTitle(item)}</h3>
      <ul class="card-bullets">${bullets}</ul>
      <a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">
        ${t('card.source')} ${EXTERNAL_ICON}
      </a>
    </article>`;
}

/* ── Compact card (secondary stories) ───────────────────────── */
function renderCompactCard(item, idx) {
  const bullets = itemBullets(item).slice(0, 3).map(b => `<li>${b}</li>`).join('');
  const num = String(idx + 2).padStart(2, '0');
  return `
    <article class="card card--compact">
      <div class="card-index">${num}</div>
      <div class="card-compact-body">
        <div class="card-meta">
          <span class="card-date">${formatDate(item.date)}</span>
          <span class="card-sep">·</span>
          <span class="card-ago">${timeAgo(item.date)}</span>
          ${sourceMeta(item)}
          ${categoryBadge(item)}
        </div>
        <h3 class="card-title">${itemTitle(item)}</h3>
        <ul class="card-bullets">${bullets}</ul>
        <a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">
          ${t('card.source')} ${EXTERNAL_ICON}
        </a>
      </div>
    </article>`;
}

/* ── Skeleton ────────────────────────────────────────────────── */
function skeletonHTML() {
  const compact = Array.from({ length: 2 }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="sk sk-meta"></div>
      <div class="sk sk-h1"></div>
      <div class="sk sk-h2"></div>
      <div class="sk sk-l1"></div>
      <div class="sk sk-l2"></div>
      <div class="sk sk-btn"></div>
    </div>`).join('');

  return `
    <div class="skeleton-card skeleton-card--featured" aria-hidden="true">
      <div class="sk sk-label"></div>
      <div class="sk sk-meta" style="width:40%"></div>
      <div class="sk sk-h1-lg"></div>
      <div class="sk sk-h2-lg"></div>
      <div class="sk sk-l1"></div>
      <div class="sk sk-l2"></div>
      <div class="sk sk-l3"></div>
      <div class="sk sk-btn-lg"></div>
    </div>
    <div class="secondary-grid">${compact}</div>`;
}

/* ── Ticker ──────────────────────────────────────────────────── */
function populateTicker(items) {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  const makeItems = () =>
    items.map(item => {
      const cat  = detectCategory(item);
      const meta = CATEGORY_META[cat];
      return `<span class="ticker-item">
        <span class="ticker-cat ${meta.cls}">${meta.label}</span>${itemTitle(item)}
      </span>`;
    }).join('');

  track.innerHTML = makeItems() + makeItems();

  const totalWidth = track.scrollWidth / 2;
  const speed = 80; // px/s
  const duration = Math.max(20, totalWidth / speed);
  track.style.setProperty('--ticker-duration', `${duration}s`);
}

/* ── Live relative time ──────────────────────────────────────── */
let _liveTimeInterval = null;

function startLiveTime(isoDate) {
  const update = () => {
    const el = document.getElementById('featured-card-ago');
    if (el) el.textContent = timeAgo(isoDate);
  };
  if (_liveTimeInterval) clearInterval(_liveTimeInterval);
  update();
  _liveTimeInterval = setInterval(update, 60_000);
}

/* ── Card entrance stagger ───────────────────────────────────── */
function animateCards() {
  document.querySelectorAll('.card').forEach((card, i) => {
    card.classList.add('card-enter');
    card.style.animationDelay = `${i * 80}ms`;
  });
}

/* ── Render (called on load + lang switch) ───────────────────── */
let _newsSorted = null;

function renderNews(sorted) {
  const list  = document.getElementById('news-list');
  const count = document.getElementById('news-count');

  const [featured, ...rest] = sorted;
  let html = renderFeaturedCard(featured);
  if (rest.length > 0) {
    html += `<div class="secondary-grid">${rest.map(renderCompactCard).join('')}</div>`;
  }
  list.innerHTML = html;

  const n = sorted.length;
  if (count) count.textContent = n === 1 ? t('count.one', { n }) : t('count.other', { n });

  populateTicker(sorted);
  startLiveTime(featured.date);
  animateCards();
}

/* ── Load ────────────────────────────────────────────────────── */
async function loadNews() {
  const list = document.getElementById('news-list');
  list.innerHTML = skeletonHTML();

  try {
    const res = await fetch('./data/news.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data.items) || data.items.length === 0) {
      list.innerHTML = `
        <div class="state-box">
          <div class="state-icon state-icon--empty">📡</div>
          <p class="state-title">${t('state.empty.title')}</p>
          <p class="state-sub">${t('state.empty.sub')}</p>
        </div>`;
      return;
    }

    _newsSorted = [...data.items].sort((a, b) => new Date(b.date) - new Date(a.date));
    renderNews(_newsSorted);

  } catch {
    list.innerHTML = `
      <div class="state-box">
        <div class="state-icon state-icon--error">⚠️</div>
        <p class="state-title">${t('state.error.title')}</p>
        <p class="state-sub">${t('state.error.sub')}</p>
      </div>`;
  }
}

/* ── Newsletter ──────────────────────────────────────────────── */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = form.querySelector('.newsletter-btn');
    const input = form.querySelector('.newsletter-input');
    const msg   = document.getElementById('newsletter-msg');

    btn.disabled   = true;
    btn.textContent = '…';

    // If pub_id is placeholder, show friendly message
    const pubId = form.dataset.pubId || '';
    if (!pubId || pubId === 'YOUR_PUB_ID') {
      if (msg) { msg.textContent = '📬 Newsletter em breve!'; msg.className = 'newsletter-msg newsletter-msg--success'; }
      btn.disabled   = false;
      btn.textContent = t('newsletter.btn');
      return;
    }

    try {
      await fetch('https://www.beehiiv.com/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: input.value, publication_id: pubId }),
      });
      if (msg) { msg.textContent = t('newsletter.success'); msg.className = 'newsletter-msg newsletter-msg--success'; }
      input.value = '';
    } catch {
      if (msg) { msg.textContent = t('newsletter.error'); msg.className = 'newsletter-msg newsletter-msg--error'; }
    } finally {
      btn.disabled    = false;
      btn.textContent = t('newsletter.btn');
    }
  });
}

/* ── Boot ────────────────────────────────────────────────────── */
applyTranslations();

document.getElementById('lang-btn')?.addEventListener('click', () => {
  setLang(currentLang === 'pt-BR' ? 'en' : 'pt-BR');
});

loadNews();
initNewsletter();
