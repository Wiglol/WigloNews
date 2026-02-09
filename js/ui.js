import { SECTIONS, listArticles, getArticle, BRIEFS } from './data.js';

export function escapeHTML(str=''){
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(iso){
  if(!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const fmt = new Intl.DateTimeFormat(undefined, { month:'short', day:'numeric', year:'numeric' });
  return fmt.format(d);
}

function formatRelative(dateISO){
  try{
    const dt = new Date(dateISO + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - dt) / (1000*60*60*24));
    if(diff === 0) return 'Today';
    if(diff === 1) return 'Yesterday';
    if(diff <= 7) return `${diff} days ago`;
    return formatDate(dateISO);
  }catch{ return formatDate(dateISO); }
}

export function sectionLabel(sectionId){
  return (SECTIONS.find(s => s.id === sectionId)?.label) ?? 'Latest';
}

export function renderHeaderState(state){
  const active = {
    latest: state.route.name === 'home' && !state.route.section,
    research: state.route.name === 'section' && state.route.section === 'research',
    policy: state.route.name === 'section' && state.route.section === 'policy',
    clinics: state.route.name === 'section' && state.route.section === 'clinics',
    data: state.route.name === 'section' && state.route.section === 'data',
    opinion: state.route.name === 'section' && state.route.section === 'opinion',
    saved: state.route.name === 'saved',
    about: state.route.name === 'about',
    help: state.route.name === 'help',
  };

  const edition = `Edition • ${formatDate('2026-02-09')}`;
  return { active, edition };
}

function storyRow(a, { saved=false }={}){
  const img = a.image?.src
    ? `<img src="${escapeHTML(a.image.src)}" alt="${escapeHTML(a.image.alt || '')}" loading="lazy">`
    : `<div class="ph" aria-hidden="true"></div>`;

  return `
    <article class="story-row">
      <a class="thumb" href="#/article/${escapeHTML(a.id)}" aria-label="Read: ${escapeHTML(a.title)}">${img}</a>
      <div>
        <div class="kicker">${escapeHTML(sectionLabel(a.section))} • <span class="mut">${escapeHTML(formatRelative(a.published))}</span></div>
        <h4 class="headline headline-lg"><a href="#/article/${escapeHTML(a.id)}">${escapeHTML(a.title)}</a></h4>
        <p class="mut">${escapeHTML(a.dek)}</p>
      </div>
      <div class="right">
        <div class="meta-row">${escapeHTML(a.author?.name || 'Staff')} · ${a.readMinutes} min</div>
        <div class="meta-row">${escapeHTML((a.tags||[]).slice(0,2).join(' · '))}</div>
        <button class="icon-btn icon-btn-sm" data-action="toggle-save" data-id="${escapeHTML(a.id)}" aria-label="${saved ? 'Unsave story' : 'Save story'}">${saved ? 'Saved' : 'Save'}</button>
      </div>
    </article>
  `;
}

export function renderHome(state){
  const items = listArticles({ section: 'latest', q: state.query, sort: state.sort });
  const featured = items[0];
  const rest = items.slice(1);

  const left = `
    <div class="module">
      <h3>Sections</h3>
      <ul class="list">
        ${SECTIONS.filter(s => s.id !== 'latest').map(s => `<li><a href="#/section/${escapeHTML(s.id)}">${escapeHTML(s.label)}</a></li>`).join('')}
      </ul>
    </div>
    <div class="module">
      <h3>Reading list</h3>
      <p class="mut">Saved stories stay on this device.</p>
      <p><a class="icon-btn" href="#/saved">View saved (${state.saved.size})</a></p>
    </div>
  `;

  const main = items.length ? `
    <section class="featured" aria-label="Featured story">
      <div class="kicker">${escapeHTML(sectionLabel(featured.section))} • ${escapeHTML(formatRelative(featured.published))}</div>
      <h1 class="headline headline-xl"><a href="#/article/${escapeHTML(featured.id)}">${escapeHTML(featured.title)}</a></h1>
      <p class="dek">${escapeHTML(featured.dek)}</p>
      <div class="byline">${escapeHTML(featured.author?.name || 'Staff')} · ${featured.readMinutes} min read
        <span class="pill">${escapeHTML((featured.tags||[])[0] || 'Research')}</span>
      </div>

      ${featured.image?.src ? `
        <figure class="figure reveal">
          <img src="${escapeHTML(featured.image.src)}" alt="${escapeHTML(featured.image.alt || '')}" loading="eager">
          ${featured.image.caption ? `<figcaption class="caption">${escapeHTML(featured.image.caption)}</figcaption>` : ''}
        </figure>
      ` : ''}

      <div class="inline-actions">
        <a class="primary-btn" href="#/article/${escapeHTML(featured.id)}">Read</a>
        <button class="icon-btn" data-action="toggle-save" data-id="${escapeHTML(featured.id)}">${state.saved.has(featured.id) ? 'Saved' : 'Save for later'}</button>
        <button class="icon-btn" data-action="copy-link">Copy link</button>
      </div>
    </section>

    <section aria-label="Latest stories" style="margin-top:var(--space-7)">
      <div class="kicker" style="margin-bottom: var(--space-3)">Latest</div>
      <div class="story-rows">
        ${rest.length ? rest.map(a => storyRow(a, { saved: state.saved.has(a.id) })).join('') : `
          <div class="empty">
            <h3>No results</h3>
            <p>Try a shorter search or clear it.</p>
            <p><button class="primary-btn" data-action="clear-search">Clear search</button></p>
          </div>
        `}
      </div>
    </section>
  ` : `
    <div class="empty">
      <h3>No stories match your search</h3>
      <p>Clear the search to see the full edition.</p>
      <p><button class="primary-btn" data-action="clear-search">Clear search</button></p>
    </div>
  `;

  const mostRead = listArticles({ sort: 'read' }).slice(0, 5);
  const briefs = BRIEFS[0];

  const right = `
    <div class="module">
      <h3>Most read</h3>
      <ul class="list">
        ${mostRead.map(a => `<li><a href="#/article/${escapeHTML(a.id)}">${escapeHTML(a.title)}</a></li>`).join('')}
      </ul>
    </div>
    <div class="module">
      <h3>${escapeHTML(briefs.label)}</h3>
      <ul class="list">
        ${briefs.items.map(b => `<li><a href="#/section/${escapeHTML(b.section)}">${escapeHTML(b.title)}</a></li>`).join('')}
      </ul>
    </div>
    <div class="module">
      <h3>Newsletter</h3>
      <p class="mut">A weekly digest of studies, guidelines, and what actually held up in clinics.</p>
      <p><button class="primary-btn" data-action="open-subscribe">Subscribe</button></p>
    </div>
  `;

  return `
    <div class="home-grid">
      <aside class="leftcol" aria-label="Index">${left}</aside>
      <div>${main}</div>
      <aside class="aside" aria-label="Sidebar">${right}</aside>
    </div>
  `;
}

export function renderSection(state){
  const section = state.route.section ?? 'research';
  const items = listArticles({ section, q: state.query, sort: state.sort });

  return `
    <div>
      <div class="section-head">
        <div>
          <h1 class="headline" style="margin:0; font-size: 34px; line-height:1.1">${escapeHTML(sectionLabel(section))}</h1>
          <p class="mut" style="margin:6px 0 0">${items.length} stor${items.length===1?'y':'ies'} · Sorted ${state.sort==='new'?'by newest':'by read time'}</p>
        </div>
        <div class="cluster">
          <label class="sr-only" for="sortSel">Sort</label>
          <select id="sortSel" class="select" aria-label="Sort stories">
            <option value="new" ${state.sort==='new'?'selected':''}>Newest</option>
            <option value="read" ${state.sort==='read'?'selected':''}>Read time</option>
          </select>
          <button class="icon-btn" data-action="clear-search">Clear search</button>
        </div>
      </div>

      <div class="story-rows">
        ${items.length ? items.map(a => storyRow(a, { saved: state.saved.has(a.id) })).join('') : `
          <div class="empty">
            <h3>No results</h3>
            <p>Try a different search or browse Latest.</p>
            <p class="cluster"><button class="primary-btn" data-action="clear-search">Clear search</button><a class="icon-btn" href="#/">Latest</a></p>
          </div>
        `}
      </div>
    </div>
  `;
}

function buildHeadingMap(blocks){
  const map = new Map();
  const used = new Set();
  let n = 0;
  for(const b of blocks){
    if(b.type !== 'h2' && b.type !== 'h3') continue;
    const key = `${b.type}:${n++}`;
    b._key = key;
    const base = String(b.text||'section').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,64) || 'section';
    let id = base;
    let i = 2;
    while(used.has(id)){ id = `${base}-${i++}`; }
    used.add(id);
    map.set(key, id);
  }
  return map;
}

function blockToHTML(block, state, headingMap){
  if(!block) return '';

  if(block.type === 'p'){
    const cls = block.lead ? 'lead' : '';
    return `<p class="${cls}">${escapeHTML(block.text)}</p>`;
  }

  if(block.type === 'h2' || block.type === 'h3'){
    const id = headingMap.get(block._key) || '';
    return `<${block.type} id="${escapeHTML(id)}">${escapeHTML(block.text)}</${block.type}>`;
  }

  if(block.type === 'ul'){
    return `<ul>${(block.items||[]).map(li => `<li>${escapeHTML(li)}</li>`).join('')}</ul>`;
  }

  if(block.type === 'callout'){
    const bullets = (block.bullets||[]).map(b => `<li>${escapeHTML(b)}</li>`).join('');
    return `
      <aside class="callout reveal" role="note">
        <strong>${escapeHTML(block.title || 'Note')}</strong>
        ${bullets ? `<ul style="margin:10px 0 0; padding-left: 18px">${bullets}</ul>` : ''}
      </aside>
    `;
  }

  if(block.type === 'pullquote'){
    return `<blockquote class="pullquote reveal">${escapeHTML(block.text)}</blockquote>`;
  }

  if(block.type === 'figure'){
    return `
      <figure class="figure reveal">
        <img src="${escapeHTML(block.src)}" alt="${escapeHTML(block.alt || '')}" loading="lazy">
        ${block.caption ? `<figcaption class="caption">${escapeHTML(block.caption)}</figcaption>` : ''}
      </figure>
    `;
  }

  if(block.type === 'interactive'){
    const active = state.articleUI?.tab || (block.tabs?.[0]?.id);
    return `
      <section class="tabs reveal" aria-label="${escapeHTML(block.title || 'Interactive')}">
        <div class="kicker">Interactive</div>
        <h3 style="margin:6px 0 0">${escapeHTML(block.title)}</h3>
        ${block.hint ? `<p class="mut" style="margin:8px 0 0">${escapeHTML(block.hint)}</p>` : ''}

        <div class="tablist" role="tablist" aria-label="Tracks">
          ${(block.tabs||[]).map(t => {
            const selected = t.id === active;
            return `<button class="tab" role="tab" aria-selected="${selected ? 'true' : 'false'}" data-action="set-tab" data-value="${escapeHTML(t.id)}">${escapeHTML(t.label)}</button>`;
          }).join('')}
        </div>

        ${(block.tabs||[]).map(t => {
          const selected = t.id === active;
          return `
            <div class="tabpanel" role="tabpanel" ${selected ? '' : 'hidden'} data-tabpanel="${escapeHTML(t.id)}">
              <dl class="kv">
                ${(t.kv||[]).map(pair => `
                  <div class="item">
                    <dt>${escapeHTML(pair.k)}</dt>
                    <dd>${escapeHTML(pair.v)}</dd>
                  </div>
                `).join('')}
              </dl>
              ${t.note ? `<p class="mut" style="margin: var(--space-3) 0 0">${escapeHTML(t.note)}</p>` : ''}
            </div>
          `;
        }).join('')}
      </section>
    `;
  }

  if(block.type === 'sources'){
    const items = (block.items||[])
      .filter(i => i && i.href)
      .map(i => `<li><a href="${escapeHTML(i.href)}" target="_blank" rel="noreferrer">${escapeHTML(i.label || i.href)}</a></li>`)
      .join('');
    return `
      <div class="sources">
        <ul>${items}</ul>
      </div>
    `;
  }

  return '';
}

export function renderArticle(state){
  const a = getArticle(state.route.id);
  if(!a){
    return `
      <div class="error">
        <h3>Story not found</h3>
        <p>That link may be outdated. Try browsing Latest or searching.</p>
        <p class="cluster"><a class="primary-btn" href="#/">Go to Latest</a><button class="icon-btn" data-action="open-search">Search</button></p>
      </div>
    `;
  }

  const headingMap = buildHeadingMap(a.blocks);
  const toc = a.blocks
    .filter(b => b.type === 'h2' || b.type === 'h3')
    .map(b => ({
      id: headingMap.get(b._key),
      text: b.text,
      level: b.type,
    }))
    .filter(t => t.id);

  const hero = a.image?.src ? `
    <figure class="figure reveal">
      <img src="${escapeHTML(a.image.src)}" alt="${escapeHTML(a.image.alt || '')}" loading="eager">
      ${a.image.caption ? `<figcaption class="caption">${escapeHTML(a.image.caption)}</figcaption>` : ''}
    </figure>
  ` : '';

  const saved = state.saved.has(a.id);

  const asideModules = `
    <div class="module">
      <h3>On this page</h3>
      ${toc.length ? `
        <ul class="toc" id="toc">
          ${toc.map(t => `
            <li class="${t.level==='h3' ? 'sub' : ''}"><a href="#/article/${escapeHTML(a.id)}" data-action="scroll-to" data-value="${escapeHTML(t.id)}">${escapeHTML(t.text)}</a></li>
          `).join('')}
        </ul>
      ` : `<p class="mut">No sections.</p>`}
    </div>
    <div class="module">
      <h3>Key numbers</h3>
      <ul class="list">
        <li><strong>${escapeHTML(a.keyNumbers?.devices ?? '1,000+')}</strong><br><span class="mut">AI-enabled devices authorized (U.S. FDA list)</span></li>
        <li><strong>${escapeHTML(a.keyNumbers?.trials ?? 'Dozens')}</strong><br><span class="mut">Randomized trials across specialties</span></li>
        <li><strong>${escapeHTML(a.keyNumbers?.risk ?? 'Meaningful')}</strong><br><span class="mut">Risk of drift without monitoring</span></li>
      </ul>
    </div>
    <div class="module">
      <h3>Related</h3>
      <ul class="list">
        ${a.related.map(id => {
          const r = getArticle(id);
          return r ? `<li><a href="#/article/${escapeHTML(r.id)}">${escapeHTML(r.title)}</a></li>` : '';
        }).filter(Boolean).join('')}
      </ul>
    </div>
  `;

  const body = a.blocks.map(b => blockToHTML(b, state, headingMap)).join('');

  return `
    <div class="progress" aria-hidden="true"><div id="progressFill"></div></div>

    <div class="article-shell">
      <article class="article" aria-label="Article">
        <header>
          <div class="kicker">${escapeHTML(sectionLabel(a.section))} • ${escapeHTML(formatRelative(a.published))}</div>
          <h1>${escapeHTML(a.title)}</h1>
          <p class="dek">${escapeHTML(a.dek)}</p>
          <div class="byline">${escapeHTML(a.author?.name || 'Staff')} · ${a.readMinutes} min read · Updated ${escapeHTML(formatDate(a.updated || a.published))}
            ${(a.tags||[]).slice(0,2).map(t => `<span class="pill">${escapeHTML(t)}</span>`).join('')}
          </div>

          <div class="inline-actions">
            <button class="primary-btn" data-action="toggle-save" data-id="${escapeHTML(a.id)}">${saved ? 'Saved' : 'Save for later'}</button>
            <button class="icon-btn" data-action="copy-link">Copy link</button>
            <button class="icon-btn" data-action="print">Print</button>
          </div>
        </header>

        ${hero}

        <div class="article-body">
          ${body}
        </div>

        <hr class="hr">
        <p class="mut">Have a paper we should read? <a href="#/about">Send a tip</a>.</p>
      </article>

      <aside class="aside" aria-label="Sidebar">
        ${asideModules}
      </aside>
    </div>
  `;
}

export function renderSaved(state){
  const ids = [...state.saved];
  const items = ids.map(getArticle).filter(Boolean);

  return `
    <div>
      <h1 class="headline" style="margin:0 0 var(--space-2)">Saved</h1>
      <p class="mut" style="margin:0 0 var(--space-6)">${items.length ? `${items.length} stor${items.length===1?'y':'ies'} saved on this device.` : 'Your reading list is empty.'}</p>

      ${items.length ? `
        <div class="story-rows">
          ${items.map(a => storyRow(a, { saved: true })).join('')}
        </div>
        <p style="margin-top: var(--space-6)"><button class="icon-btn" data-action="clear-saved">Clear saved</button></p>
      ` : `
        <div class="empty">
          <h3>Nothing saved yet</h3>
          <p>Open a story and tap “Save for later.”</p>
          <p><a class="primary-btn" href="#/">Browse Latest</a></p>
        </div>
      `}
    </div>
  `;
}

export function renderAbout(){
  return `
    <div class="about">
      <h1>About Pulse & Pattern</h1>
      <p><strong>Pulse & Pattern</strong> is a small, offline-first publication focused on research-grade AI in medicine. The goal is to make reading feel like scanning a paper: clear structure, evidence cues, and a page you can trust to stay readable.</p>

      <h2>Editorial stance</h2>
      <ul>
        <li>We care about evidence: prospective validation, clinical endpoints, and failure modes.</li>
        <li>We treat model performance as context-dependent, not a permanent property.</li>
        <li>We prefer plain language for risk: drift, bias, and human factors.</li>
      </ul>

      <h2>Send a tip</h2>
      <p class="mut">Tips are saved to this device. Nothing is sent anywhere.</p>

      <form class="form" id="tipForm">
        <label class="field">Paper / link
          <input id="tipLink" name="link" type="url" placeholder="https://…" autocomplete="off">
        </label>
        <label class="field">What to look for
          <textarea id="tipNote" name="note" rows="4" placeholder="Why it matters, what the study tested…"></textarea>
        </label>
        <div class="cluster">
          <button class="primary-btn" type="submit">Save tip</button>
          <button class="icon-btn" type="reset">Clear</button>
        </div>
        <p class="mut" id="tipStatus" style="margin: var(--space-2) 0 0"></p>
      </form>

    </div>
  `;
}

export function renderHelp(){
  return `
    <div class="help">
      <h1>Help</h1>
      <hr class="hr">

      <h2>Keyboard</h2>
      <ul>
        <li><strong>Tab</strong> moves between links and controls (focus is always visible).</li>
        <li><strong>Enter</strong> activates the focused item.</li>
        <li><strong>Esc</strong> closes overlays (Search, Subscribe, Sections).</li>
        <li><strong>/</strong> focuses search (when not typing in an input).</li>
      </ul>

      <h2>Reading tools</h2>
      <ul>
        <li>Use <strong>Save for later</strong> to keep a local reading list.</li>
        <li>Use <strong>Print</strong> for a clean print layout.</li>
      </ul>

      <h2>Accessibility</h2>
      <ul>
        <li>A Skip link appears on focus and jumps to the main content.</li>
        <li>Reduced-motion is respected for transitions and reveals.</li>
        <li>Images include alt text and captions where needed.</li>
      </ul>
    </div>
  `;
}

function renderNotFound(){
  return `
    <div class="error">
      <h3>Page not found</h3>
      <p>That route doesn’t exist in this edition.</p>
      <p class="cluster"><a class="primary-btn" href="#/">Go to Latest</a><a class="icon-btn" href="#/help">Help</a></p>
    </div>
  `;
}

export function renderError(state){
  return `
    <div class="error">
      <h3>Something went wrong</h3>
      <p>${escapeHTML(state.network.error || 'Unknown error')}</p>
      <p><button class="primary-btn" data-action="retry">Retry</button></p>
    </div>
  `;
}

export function renderLoading(route){
  const lines = (n) => Array.from({length:n}, () => `<div class="skeleton" style="height:14px"></div>`).join('');
  const block = (h) => `<div class="skeleton" style="height:${h}px"></div>`;

  if(route.name === 'article'){
    return `
      ${block(8)}
      ${block(42)}
      ${block(20)}
      <div style="margin-top: var(--space-6)">${block(320)}</div>
      <div style="margin-top: var(--space-6)">${lines(10)}</div>
    `;
  }

  return `
    ${block(8)}
    ${block(32)}
    <div style="margin-top: var(--space-6)">${lines(7)}</div>
  `;
}

export function renderView(state){
  if(state.network.status === 'error') return renderError(state);
  if(state.network.status === 'loading'){
    return `<div aria-busy="true">${renderLoading(state.route)}</div>`;
  }

  switch(state.route.name){
    case 'home': return renderHome(state);
    case 'section': return renderSection(state);
    case 'article': return renderArticle(state);
    case 'saved': return renderSaved(state);
    case 'about': return renderAbout(state);
    case 'help': return renderHelp(state);
    case 'notfound':
    default: return renderNotFound();
  }
}

function modalShell({ title, body, id }){
  return `
    <div class="backdrop" data-action="close-overlays" aria-hidden="true">
      <div class="modal" data-action="stop" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}" id="${escapeHTML(id)}">
        <header>
          <div>
            <h2>${escapeHTML(title)}</h2>
          </div>
          <button class="icon-btn" data-action="close-overlays" aria-label="Close">Close</button>
        </header>
        <div class="body">${body}</div>
      </div>
    </div>
  `;
}

function renderSearchResults(state){
  const q = (state.query||'').trim();
  const items = q ? listArticles({ q, sort: 'new' }).slice(0, 8) : [];
  if(!q){
    return `<p class="mut" style="margin:0">Type a keyword to search across all sections.</p>`;
  }
  if(!items.length){
    return `<p style="margin:0">No results for <strong>${escapeHTML(q)}</strong>.</p>`;
  }
  return `
    <div class="module" style="margin:0">
      <div class="kicker" style="margin-bottom: var(--space-2)">Results</div>
      <ul class="list" style="border-top: 1px solid var(--rule); padding-top: var(--space-2)">
        ${items.map(a => `
          <li style="padding: 10px 0; border-bottom: 1px solid var(--rule-2)">
            <div class="kicker">${escapeHTML(sectionLabel(a.section))} • ${escapeHTML(formatRelative(a.published))}</div>
            <a href="#/article/${escapeHTML(a.id)}" style="font-family: var(--serif); font-weight: 600; text-decoration: none">${escapeHTML(a.title)}</a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

export function renderOverlays(state){
  const toast = state.ui.toast ? `
    <div class="toast" role="status" aria-live="polite">
      <span>${escapeHTML(state.ui.toast.message)}</span>
      <button class="iconbtn" data-action="dismiss-toast" aria-label="Dismiss notification">×</button>
    </div>
  ` : '';

  const sectionsMenu = state.ui.sectionsOpen ? modalShell({
    title: 'Sections',
    id: 'sectionsModal',
    body: `
      <ul class="list" style="margin:0">
        <li><a href="#/">Latest</a></li>
        ${SECTIONS.filter(s => s.id !== 'latest').map(s => `<li><a href="#/section/${escapeHTML(s.id)}">${escapeHTML(s.label)}</a></li>`).join('')}
        <li class="divider" aria-hidden="true"></li>
        <li><a href="#/saved">Saved (${state.saved.size})</a></li>
        <li><a href="#/about">About</a></li>
        <li><a href="#/help">Help</a></li>
      </ul>
    `,
  }) : '';

  const search = state.ui.searchOpen ? modalShell({
    title: 'Search',
    id: 'searchModal',
    body: `
      <form class="form" id="searchForm">
        <label class="field">Search stories
          <input id="modalSearch" name="q" type="search" value="${escapeHTML(state.query)}" placeholder="Try: radiology, trials, drift" autocomplete="off">
        </label>
        <div class="cluster">
          <button class="primary-btn" type="submit">Search</button>
          <button class="icon-btn" type="button" data-action="clear-search">Clear</button>
        </div>
      </form>
      <hr class="hr">
      ${renderSearchResults(state)}
    `,
  }) : '';

  const subscribe = state.ui.subscribeOpen ? modalShell({
    title: 'Newsletter',
    id: 'subscribeModal',
    body: `
      <p class="mut" style="margin-top:0">Saved to this device. No network calls.</p>
      <form class="form" id="subscribeForm">
        <label class="field">Email
          <input id="newsletterEmail" name="email" type="email" placeholder="name@domain.com" autocomplete="email" required>
        </label>
        <label class="field">Focus
          <select name="focus" class="select">
            <option value="research">Mostly research</option>
            <option value="policy">Policy + research</option>
            <option value="clinics">Clinics + implementation</option>
          </select>
        </label>
        <p class="mut" id="subscribeError" style="margin: 0 0 var(--space-2)"></p>
        <button class="primary-btn" type="submit">Subscribe</button>
      </form>
      ${state.newsletters.emails.length ? `
        <hr class="hr">
        <div class="module">
          <h3>Saved emails (local)</h3>
          <ul class="list">
            ${state.newsletters.emails.slice(0,6).map(e => `<li>${escapeHTML(e)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `,
  }) : '';

  return `${sectionsMenu}${search}${subscribe}${toast}`;
}
