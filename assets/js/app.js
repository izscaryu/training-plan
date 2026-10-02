import { renderToday } from './view-today.js';
import { renderPlan } from './view-plan.js';
import { renderLog } from './view-log.js';
import { renderProgress } from './view-progress.js';
import { renderSettings } from './view-settings.js';
import * as store from './store.js';

const main = document.getElementById('main');
const VIEWS = ['today', 'plan', 'log', 'progress', 'settings'];
const TITLES = { today: 'Today', plan: 'Plan', log: 'Log', progress: 'Progress', settings: 'Settings' };
let current = null;

function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path] = h.split('?');
  const [view, sub] = path.split('/');
  return { view: VIEWS.includes(view) ? view : 'today', sub };
}

function render(fresh) {
  const { view, sub } = parse();
  document.querySelectorAll('.tabbar a').forEach((a) => {
    if (a.dataset.tab === view) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.title = `${TITLES[view]} – Training plan`;
  try {
    if (view === 'today') renderToday(main);
    else if (view === 'plan') renderPlan(main, sub);
    else if (view === 'log') renderLog(main, fresh);
    else if (view === 'progress') renderProgress(main);
    else renderSettings(main, sub);
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="wrap"><h1>Something broke on this page</h1><p>${String(e.message || e).replace(/</g, '&lt;')}</p><p><a href="#/today">Back to Today</a></p></div>`;
  }
  current = view;
}

function isTyping() {
  const el = document.activeElement;
  return el && main.contains(el) && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'checkbox' && el.type !== 'radio';
}

function updateSyncDot() {
  const dot = document.getElementById('syncState');
  if (!dot) return;
  const s = store.getSettings();
  if (!store.syncConfigured()) { dot.hidden = true; return; }
  dot.hidden = false;
  const state = store.isSyncing() ? 'busy' : s.lastSyncError ? 'error' : 'ok';
  dot.dataset.state = state;
  const label = state === 'busy' ? 'Syncing' : state === 'error' ? `Sync failed: ${s.lastSyncError}` : `Synced${s.lastSync ? ' ' + new Date(s.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`;
  dot.setAttribute('aria-label', label);
  dot.title = label;
}

window.addEventListener('hashchange', () => {
  const { view } = parse();
  render(true);
  if (view !== 'plan' && view !== 'settings') window.scrollTo(0, 0);
});

store.subscribe((reason) => {
  updateSyncDot();
  if (reason === 'sync') return;
  if (current === 'log' && isTyping()) return;
  if (current === 'settings' && reason === 'settings' && isTyping()) return;
  render(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') store.autoPull();
});

if (!location.hash) history.replaceState(null, '', '#/today');
render(true);
updateSyncDot();
store.autoPull();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Offline mode unavailable', e));
}
