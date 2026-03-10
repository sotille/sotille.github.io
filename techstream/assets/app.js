const EXTERNAL_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
const BOLT_ICON    = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

/* ── Date helpers ────────────────────────────────────────────── */
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeAgo(iso) {
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 2)  return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD}d`;
}

/* ── Source chip ─────────────────────────────────────────────── */
function sourceMeta(item) {
  if (!item.sourceSummary) return '';
  return `<span class="card-sep">·</span>
          <span class="card-source" title="${item.sourceSummary}">${item.sourceSummary}</span>`;
}

/* ── Featured card (lead story) ─────────────────────────────── */
function renderFeaturedCard(item) {
  const bullets = item.bullets.map(b => `<li>${b}</li>`).join('');
  return `
    <article class="card card--featured">
      <div class="featured-header">
        <span class="featured-badge">${BOLT_ICON} Destaque do dia</span>
        <div class="card-meta" style="margin:0">
          <span class="card-date">${formatDate(item.date)}</span>
          <span class="card-sep">·</span>
          <span class="card-ago" id="featured-card-ago">${timeAgo(item.date)}</span>
          ${sourceMeta(item)}
        </div>
      </div>
      <h3 class="card-title">${item.title}</h3>
      <ul class="card-bullets">${bullets}</ul>
      <a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">
        Fonte principal ${EXTERNAL_ICON}
      </a>
    </article>`;
}

/* ── Compact card (secondary stories) ───────────────────────── */
function renderCompactCard(item, idx) {
  const bullets = item.bullets.slice(0, 3).map(b => `<li>${b}</li>`).join('');
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
        </div>
        <h3 class="card-title">${item.title}</h3>
        <ul class="card-bullets">${bullets}</ul>
        <a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">
          Fonte principal ${EXTERNAL_ICON}
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

  // Build items, duplicate for seamless loop
  const makeItems = () =>
    items.map(item =>
      `<span class="ticker-item">${item.title}</span>`
    ).join('');

  track.innerHTML = makeItems() + makeItems();

  // Calibrate animation duration: ~80px per item title character equivalent
  const totalWidth = track.scrollWidth / 2; // half because we duplicated
  const speed = 80; // px/s
  const duration = Math.max(20, totalWidth / speed);
  track.style.setProperty('--ticker-duration', `${duration}s`);
}

/* ── Live relative time ──────────────────────────────────────── */
function startLiveTime(isoDate) {
  const el = document.getElementById('featured-card-ago');
  if (!el) return;
  const update = () => { el.textContent = timeAgo(isoDate); };
  update();
  setInterval(update, 60_000);
}

/* ── Card entrance stagger ───────────────────────────────────── */
function animateCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.classList.add('card-enter');
    card.style.animationDelay = `${i * 80}ms`;
  });
}

/* ── Load ────────────────────────────────────────────────────── */
async function loadNews() {
  const list  = document.getElementById('news-list');
  const count = document.getElementById('news-count');

  list.innerHTML = skeletonHTML();

  try {
    const res = await fetch('./data/news.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data.items) || data.items.length === 0) {
      list.innerHTML = `
        <div class="state-box">
          <div class="state-icon state-icon--empty">📡</div>
          <p class="state-title">Sem notícias publicadas ainda.</p>
          <p class="state-sub">Volte amanhã para a próxima curadoria.</p>
        </div>`;
      return;
    }

    const sorted = [...data.items].sort((a, b) => new Date(b.date) - new Date(a.date));
    const [featured, ...rest] = sorted;

    let html = renderFeaturedCard(featured);
    if (rest.length > 0) {
      html += `<div class="secondary-grid">${rest.map(renderCompactCard).join('')}</div>`;
    }
    list.innerHTML = html;

    if (count) {
      count.textContent = `${sorted.length} ${sorted.length === 1 ? 'item' : 'itens'}`;
    }

    populateTicker(sorted);
    startLiveTime(featured.date);
    animateCards();

  } catch {
    list.innerHTML = `
      <div class="state-box">
        <div class="state-icon state-icon--error">⚠️</div>
        <p class="state-title">Falha ao carregar notícias.</p>
        <p class="state-sub">Tente recarregar a página.</p>
      </div>`;
  }
}

loadNews();
