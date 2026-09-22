/* ============================================================
   PROJECT RENDERER — builds the filter buttons and project
   cards from projects.js. Runs before main.js so all cards
   exist by the time interactions are wired.
   ============================================================ */
'use strict';

(() => {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const barWidths = [80, 55, 70];
  const card = (p, i) => `
      <article class="project reveal" data-delay="${i * 120}" data-tags="${p.filters.join(' ')}" data-tilt data-cursor="view">
        <div class="project__visual project__visual--${(i % 3) + 1}" data-link="${esc(p.file)}" role="link" tabindex="0" aria-label="Open ${esc(p.title)} live demo"><span class="project__badge">${esc(p.badge || 'Live demo')}</span>
          <div class="project__browser"><i></i><i></i><i></i><div class="project__browser-body">
            <b>${esc(p.title)}</b><span>${esc(p.preview)}</span>
            <div class="mock-bars">${barWidths.map(w => `<u style="width:${w}%"></u>`).join('')}</div>
          </div></div>
        </div>
        <div class="project__meta">
          <div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div>
          <div class="project__tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
          <a class="project__link" href="${esc(p.file)}" target="_blank" rel="noopener">Open live demo
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg></a>
        </div>
      </article>`;

  const filterBtn = ([key, label], i) =>
    `<button class="filter${i === 0 ? ' is-active' : ''}" data-filter="${key}" data-cursor="hover">${esc(label)}</button>`;

  const grid = document.getElementById('projectsGrid');
  const filters = document.getElementById('projectsFilters');
  if (!grid || !filters || typeof PROJECTS === 'undefined') return;

  filters.innerHTML = FILTERS.map(filterBtn).join('');
  grid.innerHTML = PROJECTS.map(card).join('\n');
})();
