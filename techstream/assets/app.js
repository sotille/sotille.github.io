function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function skeletonCards(count = 4) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="sk sk-meta"></div>
      <div class="sk sk-h1"></div>
      <div class="sk sk-h2"></div>
      <div class="sk sk-l1"></div>
      <div class="sk sk-l2"></div>
      <div class="sk sk-l3"></div>
      <div class="sk sk-btn"></div>
    </div>
  `).join('');
}

function renderCard(item) {
  const date = formatDate(item.date);
  const source = item.sourceSummary
    ? `<span class="card-sep">·</span><span class="card-source" title="${item.sourceSummary}">${item.sourceSummary}</span>`
    : '';
  const bullets = item.bullets
    .map(b => `<li>${b}</li>`)
    .join('');

  return `
    <article class="card">
      <div class="card-meta">
        <span class="card-date">${date}</span>
        ${source}
      </div>
      <h3 class="card-title">${item.title}</h3>
      <ul class="card-bullets">${bullets}</ul>
      <a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">
        Fonte principal
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </article>
  `;
}

async function loadNews() {
  const list  = document.getElementById('news-list');
  const count = document.getElementById('news-count');

  list.innerHTML = skeletonCards(4);

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
        </div>
      `;
      return;
    }

    const sorted = [...data.items].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    list.innerHTML = sorted.map(renderCard).join('');

    if (count) {
      count.textContent = `${sorted.length} ${sorted.length === 1 ? 'item' : 'itens'}`;
    }
  } catch {
    list.innerHTML = `
      <div class="state-box">
        <div class="state-icon state-icon--error">⚠️</div>
        <p class="state-title">Falha ao carregar notícias.</p>
        <p class="state-sub">Tente recarregar a página.</p>
      </div>
    `;
  }
}

loadNews();
