import {
  initState,
  getState,
  subscribe,
  setState,
  setToast,
  toggleTheme,
  toggleSaved,
  closeOverlays,
  openSearch,
  openSubscribe,
  addNewsletterEmail,
} from './state.js';

import {
  renderHeaderState,
  renderView,
  renderOverlays,
  formatDate,
} from './ui.js';

const $ = (sel, root=document) => root.querySelector(sel);

let currentRouteKey = '';
let routeLoadTimer = null;

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const btn = $('#themeBtn');
  if(btn){
    btn.textContent = theme === 'dark' ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

function updateHeader(state){
  const { active, edition } = renderHeaderState(state);
  const editionEl = $('#edition');
  if(editionEl) editionEl.textContent = edition;

  document.querySelectorAll('[data-nav]').forEach(a => {
    const key = a.getAttribute('data-nav');
    const isActive = !!active[key];
    a.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  const savedCount = state.saved.size;
  const savedEl = $('#savedCount');
  if(savedEl) savedEl.textContent = savedCount ? String(savedCount) : '';

  const q = state.query ?? '';
  const headerQ = $('#headerSearch');
  if(headerQ && headerQ.value !== q) headerQ.value = q;
}

function render(){
  const state = getState();
  applyTheme(state.theme);
  updateHeader(state);

  const view = $('#view');
  const overlays = $('#overlays');
  if(!view || !overlays) return;

  overlays.innerHTML = renderOverlays(state);
  view.innerHTML = renderView(state);

  wireOverlays();
  wireArticleEnhancements();
  wireRevealOnScroll();
}

function routeKey(route){
  return `${route.name}:${route.section ?? ''}:${route.id ?? ''}`;
}

function startRouteLoading(nextRoute){
  const nextKey = routeKey(nextRoute);
  if(nextKey === currentRouteKey) return;
  currentRouteKey = nextKey;

  window.clearTimeout(routeLoadTimer);
  setState({ network: { status: 'loading', message: 'Loading' } });
  const token = nextKey;

  routeLoadTimer = window.setTimeout(() => {
    const st = getState();
    if(routeKey(st.route) !== token) return;
    setState({ network: { status: 'ok', message: null } });
  }, 160);
}

function scrollToId(id){
  const el = document.getElementById(id);
  if(!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

function onGlobalClick(e){
  // If a hash-link is clicked inside a modal, let it navigate but close overlays immediately.
  const modalLink = e.target.closest('a[href^="#/"]');
  if(modalLink && modalLink.closest('.modal')){
    closeOverlays();
    return;
  }

  const target = e.target.closest('[data-action]');
  if(!target) return;

  const action = target.getAttribute('data-action');
  if(!action) return;

  if(action === 'stop'){
    return;
  }

  if(action === 'toggle-theme'){
    e.preventDefault();
    toggleTheme();
    return;
  }

  if(action === 'toggle-sections'){
    e.preventDefault();
    const st = getState();
    setState({ ui: { sectionsOpen: !st.ui.sectionsOpen, searchOpen: false, subscribeOpen: false } });
    return;
  }

  if(action === 'open-search'){
    e.preventDefault();
    openSearch();
    return;
  }

  if(action === 'open-subscribe'){
    e.preventDefault();
    openSubscribe();
    return;
  }

  if(action === 'close-overlays'){
    e.preventDefault();
    closeOverlays();
    return;
  }

  if(action === 'dismiss-toast'){
    e.preventDefault();
    setState({ ui: { toast: null } });
    return;
  }

  if(action === 'clear-search'){
    e.preventDefault();
    setState({ query: '' });
    return;
  }

  if(action === 'clear-saved'){
    e.preventDefault();
    setState({ saved: new Set() });
    setToast('Saved list cleared.');
    return;
  }

  if(action === 'retry'){
    e.preventDefault();
    setState({ network: { status: 'ok', error: null, message: null } });
    return;
  }

  if(action === 'toggle-save'){
    e.preventDefault();
    const id = target.getAttribute('data-id');
    if(id) toggleSaved(id);
    return;
  }

  if(action === 'copy-link'){
    e.preventDefault();
    const url = target.getAttribute('data-url') || location.href;
    copyText(url);
    return;
  }

  if(action === 'print'){
    e.preventDefault();
    window.print();
    return;
  }

  if(action === 'set-tab'){
    e.preventDefault();
    const tab = target.getAttribute('data-value');
    if(tab) setState({ articleUI: { tab } });
    return;
  }

  if(action === 'scroll-to'){
    e.preventDefault();
    const id = target.getAttribute('data-value');
    if(id) scrollToId(id);
    return;
  }
}

function onGlobalInput(e){
  const el = e.target;
  if(!(el instanceof HTMLElement)) return;

  if(el.matches('#headerSearch') || el.matches('#modalSearch')){
    setState({ query: el.value });
  }
}

function onGlobalChange(e){
  const el = e.target;
  if(!(el instanceof HTMLElement)) return;

  if(el.matches('#sortSel')){
    const v = (el).value;
    setState({ sort: v });
  }
}

function saveTip({ link, note }){
  const LS_TIPS = 'pp_tips';
  const payload = { id: Math.random().toString(16).slice(2), link, note, savedAt: new Date().toISOString() };
  try{
    const arr = JSON.parse(localStorage.getItem(LS_TIPS) || '[]');
    const next = Array.isArray(arr) ? [payload, ...arr].slice(0, 50) : [payload];
    localStorage.setItem(LS_TIPS, JSON.stringify(next));
    return true;
  }catch{
    return false;
  }
}

function onGlobalSubmit(e){
  const form = e.target;
  if(!(form instanceof HTMLFormElement)) return;

  if(form.matches('#headerSearchForm') || form.matches('#searchForm')){
    e.preventDefault();
    // keep results visible on whatever page the user is on
    closeOverlays();
    return;
  }

  if(form.matches('#subscribeForm')){
    e.preventDefault();
    const email = ($('#newsletterEmail', form)?.value || '').trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const err = $('#subscribeError', form);
    if(err) err.textContent = '';
    if(!ok){
      if(err) err.textContent = 'Please enter a valid email address.';
      return;
    }
    addNewsletterEmail(email);
    closeOverlays();
    setToast('Subscribed locally. No emails are sent from this site.', { kind: 'success', timeout: 3200 });
    return;
  }

  if(form.matches('#tipForm')){
    e.preventDefault();
    const link = (form.querySelector('input[name="link"]')?.value || '').trim();
    const note = (form.querySelector('textarea[name="note"]')?.value || '').trim();
    if(!link && !note){
      setToast('Add a link or a note first.');
      return;
    }
    const ok = saveTip({ link, note });
    form.reset();
    setToast(ok ? 'Tip saved locally.' : 'Could not save tip.', { kind: ok ? 'success' : 'error' });
  }
}

function onGlobalKeydown(e){
  const st = getState();
  const activeEl = document.activeElement;
  const inInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true');

  if(e.key === 'Escape'){
    if(st.ui.sectionsOpen || st.ui.searchOpen || st.ui.subscribeOpen){
      closeOverlays();
      e.preventDefault();
    }
    return;
  }

  if(e.key === '/' && !inInput){
    const q = $('#headerSearch');
    if(q){
      q.focus();
      q.select();
      e.preventDefault();
    }
  }
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    setToast('Link copied.', { timeout: 1800 });
  }catch{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try{ document.execCommand('copy'); }catch{}
    ta.remove();
    setToast('Copied.', { timeout: 1800 });
  }
}

function wireOverlays(){
  const st = getState();
  if(st.ui.searchOpen){
    requestAnimationFrame(() => $('#modalSearch')?.focus());
  }
  if(st.ui.subscribeOpen){
    requestAnimationFrame(() => $('#newsletterEmail')?.focus());
  }

  const modal = $('#overlays .modal');
  if(modal) trapFocus(modal);
}

function trapFocus(container){
  const focusable = container.querySelectorAll('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])');
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function onKey(ev){
    if(ev.key !== 'Tab') return;
    if(ev.shiftKey && document.activeElement === first){
      ev.preventDefault();
      last.focus();
    } else if(!ev.shiftKey && document.activeElement === last){
      ev.preventDefault();
      first.focus();
    }
  }
  container.addEventListener('keydown', onKey);
}

function wireArticleEnhancements(){
  const st = getState();
  if(st.route.name !== 'article') return;

  // reading progress
  const bar = $('#progressFill');
  if(bar){
    const onScroll = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const val = Math.min(1, Math.max(0, window.scrollY / max));
      bar.style.width = `${Math.round(val * 100)}%`;
    };
    window.removeEventListener('scroll', wireArticleEnhancements._scroll);
    wireArticleEnhancements._scroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // TOC highlight (IntersectionObserver)
  const toc = $('#toc');
  if(toc){
    const links = [...toc.querySelectorAll('[data-action="scroll-to"][data-value]')];
    const ids = links.map(a => a.getAttribute('data-value')).filter(Boolean);
    const headings = ids.map(id => document.getElementById(id)).filter(Boolean);

    if(headings.length){
      const obs = new IntersectionObserver((entries) => {
        const visible = entries
          .filter(en => en.isIntersecting)
          .sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if(!visible.length) return;
        const id = visible[0].target.id;
        for(const a of links){
          const on = a.getAttribute('data-value') === id;
          a.setAttribute('aria-current', on ? 'true' : 'false');
        }
      }, { rootMargin: '-20% 0px -70% 0px', threshold: [0.1, 0.5] });
      headings.forEach(h => obs.observe(h));
    }
  }
}

function wireRevealOnScroll(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;

  const nodes = document.querySelectorAll('.reveal');
  if(!nodes.length) return;
  const obs = new IntersectionObserver((entries) => {
    for(const en of entries){
      if(en.isIntersecting){
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      }
    }
  }, { threshold: 0.1 });
  nodes.forEach(n => obs.observe(n));
}

function boot(){
  initState();
  const st = getState();
  applyTheme(st.theme);

  const editionEl = $('#edition');
  if(editionEl) editionEl.textContent = `Edition • ${formatDate('2026-02-09')}`;

  document.addEventListener('click', onGlobalClick);
  document.addEventListener('input', onGlobalInput);
  document.addEventListener('change', onGlobalChange);
  document.addEventListener('submit', onGlobalSubmit);
  document.addEventListener('keydown', onGlobalKeydown);

  subscribe((next) => {
    startRouteLoading(next.route);
    render();
  });

  startRouteLoading(st.route);
  render();
}

boot();
