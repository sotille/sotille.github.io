async function loadNews() {
  const list = document.getElementById('news-list');
  try {
    const res = await fetch('./data/news.json', { cache: 'no-store' });
    const data = await res.json();
    if (!Array.isArray(data.items) || data.items.length === 0) {
      list.textContent = 'Sem notícias publicadas ainda.';
      return;
    }

    list.innerHTML = data.items.map(item => `
      <article class="card">
        <h3>${item.title}</h3>
        <div class="meta">${new Date(item.date).toLocaleString('pt-BR')} • ${item.sourceSummary}</div>
        <ul>${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        <p><a href="${item.link}" target="_blank" rel="noopener">Fonte principal</a></p>
      </article>
    `).join('');
  } catch (e) {
    list.textContent = 'Falha ao carregar notícias.';
  }
}

loadNews();
