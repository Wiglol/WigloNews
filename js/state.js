const LS = {
  theme: 'pp_theme',
  saved: 'pp_saved',
  newsletter: 'pp_newsletter',
};

export const DEFAULTS = {
  route: { name: 'home', section: null, id: null },
  query: '',
  sort: 'new',
  ui: {
    sectionsOpen: false,
    searchOpen: false,
    subscribeOpen: false,
    toast: null,
  },
  articleUI: {
    tab: "imaging",
    tocOpen: false
  },
  theme: 'light', // 'light' | 'dark'
  saved: new Set(),
  newsletters: { emails: [], last: null },
  network: { status: 'ok' },
};

const listeners = new Set();
let state = structuredClone(DEFAULTS);

function safeJSONParse(str, fallback){
  try{ return JSON.parse(str) ?? fallback; }
  catch{ return fallback; }
}

function initFromStorage(){
  const theme = localStorage.getItem(LS.theme);
  if(theme === 'light' || theme === 'dark') state.theme = theme;

  const savedRaw = safeJSONParse(localStorage.getItem(LS.saved), []);
  if(Array.isArray(savedRaw)) state.saved = new Set(savedRaw.filter(x => typeof x === 'string'));

  const newsletter = safeJSONParse(localStorage.getItem(LS.newsletter), { emails: [], last: null });
  if(newsletter && typeof newsletter === 'object'){
    state.newsletters = {
      emails: Array.isArray(newsletter.emails) ? newsletter.emails.slice(0, 40) : [],
      last: typeof newsletter.last === 'string' ? newsletter.last : null,
    };
  }
}

function persist(){
  localStorage.setItem(LS.theme, state.theme);
  localStorage.setItem(LS.saved, JSON.stringify([...state.saved]));
  localStorage.setItem(LS.newsletter, JSON.stringify(state.newsletters));
}

function notify(){
  for(const fn of listeners) fn(getState());
}

export function getState(){
  // return a serializable snapshot
  return {
    ...state,
    saved: new Set(state.saved),
    ui: { ...state.ui },
    route: { ...state.route },
    newsletters: { ...state.newsletters },
    network: { ...state.network },
    articleUI: { ...state.articleUI },
  };
}

export function subscribe(fn){
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setState(patch){
  state = {
    ...state,
    ...patch,
    ui: { ...state.ui, ...(patch.ui ?? {}) },
    route: { ...state.route, ...(patch.route ?? {}) },
    newsletters: { ...state.newsletters, ...(patch.newsletters ?? {}) },
    network: { ...state.network, ...(patch.network ?? {}) },
    articleUI: { ...state.articleUI, ...(patch.articleUI ?? {}) },
  };
  persist();
  notify();
}

export function setToast(message, { kind='info', timeout=2600 }={}){
  const id = Math.random().toString(16).slice(2);
  setState({ ui: { toast: { id, message, kind } } });
  window.clearTimeout(setToast._t);
  setToast._t = window.setTimeout(() => {
    const cur = getState();
    if(cur.ui.toast?.id === id) setState({ ui: { toast: null } });
  }, timeout);
}

export function toggleTheme(){
  const next = state.theme === 'dark' ? 'light' : 'dark';
  setState({ theme: next });
  setToast(next === 'dark' ? 'Dark theme on' : 'Light theme on');
}

export function toggleSaved(articleId){
  const next = new Set(state.saved);
  if(next.has(articleId)) next.delete(articleId); else next.add(articleId);
  setState({ saved: next });
}

export function routeTo(hash){
  location.hash = hash;
}

function parseHash(){
  const raw = (location.hash || '#/').replace(/^#/, '');
  const parts = raw.split('/').filter(Boolean);
  if(parts.length === 0) return { name: 'home', section: null, id: null };

  const [a, b] = parts;
  if(a === '') return { name: 'home', section: null, id: null };
  if(a === 'section' && b) return { name: 'section', section: b, id: null };
  if(a === 'article' && b) return { name: 'article', section: null, id: b };
  if(a === 'saved') return { name: 'saved', section: null, id: null };
  if(a === 'about') return { name: 'about', section: null, id: null };
  if(a === 'help') return { name: 'help', section: null, id: null };
  return { name: 'notfound', section: null, id: null };
}

export function syncRoute(){
  // Navigating should collapse overlays so focus returns to the page.
  setState({
    route: parseHash(),
    ui: { sectionsOpen: false, searchOpen: false, subscribeOpen: false },
  });
}

export function closeOverlays(){
  setState({ ui: { sectionsOpen: false, searchOpen: false, subscribeOpen: false } });
}

export function openSearch(){
  setState({ ui: { searchOpen: true, sectionsOpen: false } });
}

export function openSubscribe(){
  setState({ ui: { subscribeOpen: true, sectionsOpen: false } });
}

export function addNewsletterEmail(email){
  const trimmed = (email ?? '').trim();
  if(!trimmed) return;
  const next = {
    emails: [trimmed, ...state.newsletters.emails.filter(e => e !== trimmed)].slice(0, 40),
    last: new Date().toISOString(),
  };
  setState({ newsletters: next });
}

export function initState(){
  initFromStorage();
  state.route = parseHash();
  persist();
}

window.addEventListener('hashchange', () => syncRoute());
window.addEventListener('storage', (e) => {
  if([LS.theme, LS.saved, LS.newsletter].includes(e.key)){
    initFromStorage();
    notify();
  }
});
