// Local storage for the log, plus optional sync to a JSON file in a GitHub repo.
// Every record has an id and updatedAt; deletes are kept as tombstones so they sync too.

const KEY_ENTRIES = 'tp.entries.v1';
const KEY_SETTINGS = 'tp.settings.v1';
const KEY_TOKEN = 'tp.ghtoken.v1';
const API = 'https://api.github.com';

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function defaultSettings() {
  return {
    bar: 20,
    plates: [25, 20, 15, 10, 5, 2.5, 1.25],
    sync: { owner: 'izscaryu', repo: 'training-log', branch: 'main', path: 'log.json', auto: true },
    lastSync: null,
    lastSyncError: null,
  };
}

let entries = load(KEY_ENTRIES, []);
let settings = (() => {
  const saved = load(KEY_SETTINGS, {});
  const base = defaultSettings();
  return { ...base, ...saved, sync: { ...base.sync, ...(saved.sync || {}) } };
})();

const listeners = new Set();
let storageOk = true;

function persist() {
  try {
    localStorage.setItem(KEY_ENTRIES, JSON.stringify(entries));
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
    storageOk = true;
  } catch (e) {
    storageOk = false;
    console.warn('Could not save to this browser', e);
  }
}

export function storageWorks() { return storageOk; }

function emit(reason = 'data') {
  listeners.forEach((fn) => {
    try { fn(reason); } catch (e) { console.error(e); }
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function uid() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export const nowIso = () => new Date().toISOString();

// ---------- records ----------

export function all() {
  return entries.filter((e) => !e.deleted);
}

export function byType(type) {
  return all().filter((e) => e.type === type);
}

export function get(id) {
  return all().find((e) => e.id === id);
}

function changed() {
  persist();
  emit('data');
  scheduleSync();
}

export function add(rec) {
  const r = { ...rec, id: uid(), createdAt: nowIso(), updatedAt: nowIso() };
  entries.push(r);
  changed();
  return r;
}

export function addMany(list) {
  const out = list.map((rec) => ({ ...rec, id: uid(), createdAt: nowIso(), updatedAt: nowIso() }));
  entries.push(...out);
  changed();
  return out;
}

export function update(id, patch) {
  const i = entries.findIndex((e) => e.id === id);
  if (i < 0) return null;
  entries[i] = { ...entries[i], ...patch, id, updatedAt: nowIso() };
  changed();
  return entries[i];
}

export function remove(id) {
  const i = entries.findIndex((e) => e.id === id);
  if (i < 0) return;
  entries[i] = { id, type: entries[i].type, deleted: true, updatedAt: nowIso() };
  changed();
}

export function removeMany(ids) {
  const set = new Set(ids);
  entries = entries.map((e) => (set.has(e.id) ? { id: e.id, type: e.type, deleted: true, updatedAt: nowIso() } : e));
  changed();
}

export function wipeLocal() {
  entries = [];
  settings = { ...defaultSettings(), sync: settings.sync };
  persist();
  emit('data');
}

// ---------- settings ----------

export function getSettings() { return settings; }

export function setSettings(patch) {
  settings = { ...settings, ...patch };
  persist();
  emit('settings');
}

export function setSync(patch) {
  settings = { ...settings, sync: { ...settings.sync, ...patch } };
  persist();
  emit('settings');
}

export function getToken() {
  try { return localStorage.getItem(KEY_TOKEN) || ''; } catch { return ''; }
}

export function setToken(t) {
  try {
    if (t) localStorage.setItem(KEY_TOKEN, t.trim());
    else localStorage.removeItem(KEY_TOKEN);
  } catch { /* ignore */ }
  emit('settings');
}

export function syncConfigured() {
  const s = settings.sync;
  return Boolean(getToken() && s.owner && s.repo && s.path);
}

// ---------- merge, export, import ----------

function newer(a, b) {
  return (a.updatedAt || '') > (b.updatedAt || '');
}

export function merge(local, remote) {
  const map = new Map();
  for (const e of remote) map.set(e.id, e);
  for (const e of local) {
    const cur = map.get(e.id);
    if (!cur || newer(e, cur)) map.set(e.id, e);
  }
  return [...map.values()];
}

function canonical(list) {
  return JSON.stringify([...list].sort((a, b) => (a.id < b.id ? -1 : 1)));
}

export function exportJson() {
  return JSON.stringify({ app: 'training-plan', version: 1, exportedAt: nowIso(), entries }, null, 1);
}

export function importJson(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.entries;
  if (!Array.isArray(list)) throw new Error('That file has no entries list.');
  const valid = list.filter((e) => e && typeof e.id === 'string' && typeof e.type === 'string');
  const before = all().length;
  entries = merge(entries, valid);
  changed();
  return all().length - before;
}

// ---------- GitHub sync ----------

let syncing = false;
let syncTimer = null;
let lastAutoPull = 0;

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function b64decode(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function contentsPath() {
  const { owner, repo, path } = settings.sync;
  const p = path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${p}`;
}

async function gh(path, opts = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    Authorization: `Bearer ${getToken()}`,
  };
  if (opts.body) headers['Content-Type'] = 'application/json';
  return fetch(API + path, { ...opts, cache: 'no-store', headers });
}

async function ghError(res, action) {
  let detail = '';
  try { detail = (await res.json()).message || ''; } catch { /* no body */ }
  const { owner, repo } = settings.sync;
  const msg = {
    401: 'GitHub rejected the token. Create a new one and paste it in again.',
    403: `The token can't ${action} ${owner}/${repo}. Give it Contents: Read and write for that repo.`,
    404: `GitHub can't find ${owner}/${repo}, or the token isn't allowed to see it.`,
  }[res.status] || `GitHub said ${res.status}${detail ? `: ${detail}` : ''}.`;
  const err = new Error(msg);
  err.status = res.status;
  return err;
}

async function pull() {
  const res = await gh(`${contentsPath()}?ref=${encodeURIComponent(settings.sync.branch || 'main')}`);
  if (res.status === 404) {
    // Either the file doesn't exist yet (fine) or the repo is missing (not fine) — check the repo.
    const repoRes = await gh(`/repos/${encodeURIComponent(settings.sync.owner)}/${encodeURIComponent(settings.sync.repo)}`);
    if (!repoRes.ok) throw await ghError(repoRes, 'read');
    return { list: [], sha: null };
  }
  if (!res.ok) throw await ghError(res, 'read');
  const j = await res.json();
  const data = JSON.parse(b64decode(j.content || ''));
  return { list: Array.isArray(data.entries) ? data.entries : [], sha: j.sha };
}

async function push(list, sha) {
  const body = {
    message: `Log update ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    content: b64encode(JSON.stringify({ app: 'training-plan', version: 1, updatedAt: nowIso(), entries: list }, null, 1)),
    branch: settings.sync.branch || 'main',
  };
  if (sha) body.sha = sha;
  const res = await gh(contentsPath(), { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) throw await ghError(res, 'write to');
}

export function isSyncing() { return syncing; }

export async function syncNow() {
  if (!syncConfigured()) return { ok: false, message: 'Sync is not set up yet.' };
  if (syncing) return { ok: false, message: 'A sync is already running.' };
  syncing = true;
  emit('sync');
  try {
    let { list: remote, sha } = await pull();
    let merged = merge(entries, remote);
    if (canonical(merged) !== canonical(remote)) {
      try {
        await push(merged, sha);
      } catch (e) {
        if (e.status !== 409 && e.status !== 422) throw e;
        ({ list: remote, sha } = await pull()); // someone else wrote in between: merge again
        merged = merge(merged, remote);
        await push(merged, sha);
      }
    }
    entries = merged;
    settings = { ...settings, lastSync: nowIso(), lastSyncError: null };
    persist();
    return { ok: true };
  } catch (e) {
    settings = { ...settings, lastSyncError: e.message || String(e) };
    persist();
    return { ok: false, message: settings.lastSyncError };
  } finally {
    syncing = false;
    emit('sync');
    emit('data');
  }
}

export async function testConnection() {
  if (!getToken()) return { ok: false, message: 'Paste a token first.' };
  const { owner, repo } = settings.sync;
  const res = await gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  if (!res.ok) return { ok: false, message: (await ghError(res, 'read')).message };
  const j = await res.json();
  const canWrite = j.permissions ? j.permissions.push !== false : true;
  if (!canWrite) return { ok: false, message: `The token can read ${owner}/${repo} but not write to it.` };
  return { ok: true, message: `Connected to ${j.full_name} (${j.private ? 'private' : 'public'}).`, private: j.private };
}

function scheduleSync() {
  if (!syncConfigured() || !settings.sync.auto) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => { syncNow(); }, 2500);
}

export function autoPull() {
  if (!syncConfigured() || !settings.sync.auto) return;
  if (Date.now() - lastAutoPull < 60000) return;
  lastAutoPull = Date.now();
  syncNow();
}
