import { adjustments, entryE1rm } from './model.js';
import { LIFTS, EXTRA_LIFTS, DOC_URL } from './plan.js';
import { todayStr, fmtKg, weekOf } from './calc.js';
import { esc, toast, download } from './ui.js';
import * as store from './store.js';

const PLATE_CHOICES = [25, 20, 15, 10, 5, 2.5, 2, 1.5, 1.25, 1, 0.5];
const ALL_LIFTS = { ...LIFTS, ...EXTRA_LIFTS };

function adjSection() {
  const list = adjustments();
  const rows = list.length
    ? `<ul class="adj-list">${list.map((a) => `<li><span><strong>${esc(LIFTS[a.lift]?.short || a.lift)} ${a.kg > 0 ? '+' : ''}${fmtKg(a.kg)} kg</strong> from week ${a.fromWeek}${a.note ? `<span class="muted">, ${esc(a.note)}</span>` : ''}</span><button type="button" class="icon-btn danger" data-del-adj="${a.id}" aria-label="Remove this adjustment">Remove</button></li>`).join('')}</ul>`
    : '<p class="empty">No adjustments. The plan runs on its original numbers.</p>';
  const kgOpts = [-10, -7.5, -5, -2.5, 2.5, 5, 7.5, 10].map((k) => `<option value="${k}" ${k === 5 ? 'selected' : ''}>${k > 0 ? '+' : ''}${fmtKg(k)} kg</option>`).join('');
  const w = Math.min(12, Math.max(1, weekOf(todayStr()) + 1));
  const weekOpts = Array.from({ length: 12 }, (_, i) => i + 1).map((n) => `<option value="${n}" ${n === w ? 'selected' : ''}>Week ${n}</option>`).join('');
  return `<section class="set-section" id="adjust">
    <h2>Plan adjustments</h2>
    <p>When a top set is 1.5 RPE or more easier than planned, add 2.5 kg (bench) or 5 kg (squat, deadlift) from the next week. Every planned number in the app moves with it.</p>
    ${rows}
    <form class="log-form" id="adjForm">
      <div class="three">
        <label class="field"><span>Lift</span><select name="lift">${Object.entries(LIFTS).map(([k, v]) => `<option value="${k}">${esc(v.short)}</option>`).join('')}</select></label>
        <label class="field"><span>Change</span><select name="kg">${kgOpts}</select></label>
        <label class="field"><span>From</span><select name="fromWeek">${weekOpts}</select></label>
      </div>
      <button type="submit" class="btn primary">Add adjustment</button>
    </form>
  </section>`;
}

function platesSection() {
  const s = store.getSettings();
  return `<section class="set-section">
    <h2>Bar and plates</h2>
    <p>Used for the plate picture next to each planned weight.</p>
    <form id="plateForm" class="log-form">
      <label class="field"><span>Bar</span><select name="bar">${[20, 15, 10].map((b) => `<option value="${b}" ${s.bar === b ? 'selected' : ''}>${b} kg</option>`).join('')}</select></label>
      <fieldset class="plates-pick"><legend>Plates your gym has</legend>
        ${PLATE_CHOICES.map((p) => `<label class="check"><input type="checkbox" name="plate" value="${p}" ${s.plates.includes(p) ? 'checked' : ''}> ${fmtKg(p)} kg</label>`).join('')}
      </fieldset>
    </form>
  </section>`;
}

function syncSection() {
  const s = store.getSettings();
  const token = store.getToken();
  const status = store.isSyncing()
    ? 'Syncing now…'
    : s.lastSyncError
      ? `Last sync failed: ${s.lastSyncError}`
      : s.lastSync
        ? `Last synced ${new Date(s.lastSync).toLocaleString()}.`
        : store.syncConfigured() ? 'Ready to sync.' : 'Not set up. Your log is saved in this browser only.';
  return `<section class="set-section" id="sync">
    <h2>Sync between phone and laptop</h2>
    <p>Optional. Your log lives in this browser. To see it on other devices, keep a copy in a private GitHub repo.</p>
    <p class="status ${s.lastSyncError ? 'is-error' : ''}" role="status">${esc(status)}</p>
    <details class="fold">
      <summary>How to set it up (5 minutes, once)</summary>
      <ol>
        <li>Create a <strong>private</strong> repo called <code>training-log</code> at <a href="https://github.com/new" target="_blank" rel="noopener">github.com/new</a>. Tick "Add a README file".</li>
        <li>Create a fine-grained token at <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub token settings</a>: Repository access "Only select repositories", pick <code>training-log</code>, then Permissions, Contents, "Read and write".</li>
        <li>Paste the token below and tap Save, then Test connection. Do the same once on each device.</li>
      </ol>
      <p class="small">The token stays in this browser and is never in the site's code. It can only touch that one repo; if a device gets lost, delete the token on GitHub.</p>
    </details>
    <form class="log-form" id="syncForm" autocomplete="off">
      <div class="two">
        <label class="field"><span>GitHub user</span><input name="owner" value="${esc(s.sync.owner)}" autocapitalize="off" spellcheck="false"></label>
        <label class="field"><span>Repo</span><input name="repo" value="${esc(s.sync.repo)}" autocapitalize="off" spellcheck="false"></label>
      </div>
      <div class="two">
        <label class="field"><span>Branch</span><input name="branch" value="${esc(s.sync.branch)}" autocapitalize="off" spellcheck="false"></label>
        <label class="field"><span>File</span><input name="path" value="${esc(s.sync.path)}" autocapitalize="off" spellcheck="false"></label>
      </div>
      <label class="field"><span>Token ${token ? `(saved, ends in ${esc(token.slice(-4))})` : ''}</span><input name="token" type="password" placeholder="${token ? 'Paste a new token to replace it' : 'github_pat_…'}" autocapitalize="off" spellcheck="false"></label>
      <label class="check"><input type="checkbox" name="auto" ${s.sync.auto ? 'checked' : ''}> Sync automatically after each save</label>
      <div class="actions">
        <button type="submit" class="btn primary">Save</button>
        <button type="button" class="btn secondary" data-action="test">Test connection</button>
        <button type="button" class="btn secondary" data-action="sync" ${store.syncConfigured() ? '' : 'disabled'}>Sync now</button>
        ${token ? '<button type="button" class="btn secondary danger" data-action="forget">Remove token</button>' : ''}
      </div>
    </form>
  </section>`;
}

function backupSection() {
  return `<section class="set-section">
    <h2>Backup</h2>
    <p>Download everything you've logged, or load a backup back in. Importing merges, it never deletes.</p>
    <div class="actions">
      <button type="button" class="btn secondary" data-action="export-json">Download backup (JSON)</button>
      <button type="button" class="btn secondary" data-action="export-csv">Download lifts (CSV)</button>
      <label class="btn secondary file-btn">Import backup<input type="file" accept="application/json,.json" data-action="import" hidden></label>
    </div>
  </section>`;
}

function aboutSection() {
  return `<section class="set-section">
    <h2>About</h2>
    <p>The full plan also lives in an <a href="${DOC_URL}" target="_blank" rel="noopener">editable doc</a>. This site shows the same plan and keeps your log.</p>
    <p class="small">${store.storageWorks() ? 'Saving works in this browser.' : 'This browser is blocking storage (private mode?), so entries will be lost when you close it.'}</p>
    <button type="button" class="btn secondary danger" data-action="wipe">Delete everything on this device</button>
  </section>`;
}

function csv() {
  const head = ['date', 'week', 'exercise', 'set_type', 'kg', 'reps', 'sets', 'rpe', 'e1rm', 'note'];
  const rows = store.byType('lift').sort((a, b) => (a.date < b.date ? -1 : 1)).map((e) => [
    e.date, weekOf(e.date), e.lift === 'other' ? e.name || 'other' : (ALL_LIFTS[e.lift]?.name || e.lift), e.kind, e.kg, e.reps, e.sets, e.rpe, LIFTS[e.lift] ? (entryE1rm(e) ?? '') : '', e.note || '',
  ]);
  return [head, ...rows].map((r) => r.map((c) => {
    const v = String(c ?? '');
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(',')).join('\n');
}

export function renderSettings(root, sub) {
  root.innerHTML = `<div class="wrap view-settings">
    <section class="intro"><h1>Settings</h1></section>
    ${adjSection()}
    ${platesSection()}
    ${syncSection()}
    ${backupSection()}
    ${aboutSection()}
  </div>`;

  root.querySelector('#adjForm').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = ev.target.elements;
    const rec = { type: 'adj', date: todayStr(), lift: f.lift.value, kg: Number(f.kg.value), fromWeek: Number(f.fromWeek.value), note: 'Added by hand' };
    store.add(rec);
    toast(`${LIFTS[rec.lift].short}: ${rec.kg > 0 ? '+' : ''}${fmtKg(rec.kg)} kg from week ${rec.fromWeek}`);
  });
  root.querySelectorAll('[data-del-adj]').forEach((b) => b.addEventListener('click', () => {
    store.remove(b.dataset.delAdj);
    toast('Adjustment removed');
  }));

  root.querySelector('#plateForm').addEventListener('change', (ev) => {
    const f = ev.currentTarget;
    const plates = [...f.querySelectorAll('input[name="plate"]:checked')].map((i) => Number(i.value));
    store.setSettings({ bar: Number(f.elements.bar.value), plates });
    toast('Plates saved');
  });

  const sf = root.querySelector('#syncForm');
  const saveSync = () => {
    const f = sf.elements;
    store.setSync({ owner: f.owner.value.trim(), repo: f.repo.value.trim(), branch: f.branch.value.trim() || 'main', path: f.path.value.trim() || 'log.json', auto: f.auto.checked });
    if (f.token.value.trim()) store.setToken(f.token.value.trim());
  };
  sf.addEventListener('submit', (ev) => {
    ev.preventDefault();
    saveSync();
    toast('Sync settings saved');
  });
  sf.querySelector('[data-action="test"]').addEventListener('click', async () => {
    saveSync();
    toast('Checking GitHub…');
    const r = await store.testConnection();
    toast(r.message);
    if (r.ok && r.private === false) toast(`${r.message} It's public, so anyone can read your log. A private repo is better.`);
  });
  sf.querySelector('[data-action="sync"]').addEventListener('click', async () => {
    const r = await store.syncNow();
    toast(r.ok ? 'Synced' : r.message);
  });
  sf.querySelector('[data-action="forget"]')?.addEventListener('click', () => {
    store.setToken('');
    toast('Token removed from this browser');
  });

  root.querySelector('[data-action="export-json"]').addEventListener('click', () => {
    download(`training-log-${todayStr()}.json`, store.exportJson());
  });
  root.querySelector('[data-action="export-csv"]').addEventListener('click', () => {
    download(`lifts-${todayStr()}.csv`, csv(), 'text/csv');
  });
  root.querySelector('[data-action="import"]').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      const added = store.importJson(await file.text());
      toast(added > 0 ? `Imported ${added} entries` : 'Nothing new in that file');
    } catch (e) {
      toast(`Couldn't read that file: ${e.message}`);
    }
  });
  root.querySelector('[data-action="wipe"]').addEventListener('click', () => {
    if (confirm('Delete every entry and setting on this device? Download a backup first if you want to keep them. A synced copy on GitHub is not touched.')) {
      store.wipeLocal();
      store.setToken('');
      toast('Everything on this device is deleted');
    }
  });

  if (sub) document.getElementById(sub)?.scrollIntoView({ block: 'start' });
}
