import { dayPlan, dayKind, planned, setsFor, entryE1rm, suggestions, bwAverage } from './model.js';
import { SESSIONS, LIFTS, EXTRA_LIFTS, SKILLS, TEST } from './plan.js';
import { todayStr, weekOf, fmtLong, fmtShort, fmtKg, e1rm } from './calc.js';
import { esc, toast, rpeOptions, qs } from './ui.js';
import * as store from './store.js';

const ALL_LIFTS = { ...LIFTS, ...EXTRA_LIFTS };
const KIND_LABEL = { top: 'Top set', backoff: 'Back-off', single: 'Single', test: 'Test attempt', set: 'Set' };
const SESSION_KEYS = ['D1', 'D2', 'D3', 'X', 'Y', 'XT', 'YT', 'testSB', 'testD'];

let state = { tab: null, date: null, session: null, editing: null, filter: 'all', showAll: false, saved: null };

function planWeek(date) {
  return Math.min(13, Math.max(1, weekOf(date)));
}

function num(v) {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function firstNum(s) {
  const m = String(s || '').match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function repsFromSets(s) {
  // "4 × 5" -> {sets: 4, reps: 5}
  const m = String(s || '').match(/(\d+)\s*×\s*(\d+)/);
  return m ? { sets: Number(m[1]), reps: Number(m[2]) } : { sets: null, reps: null };
}

// ---------- session logger ----------

function liftRows(key, ex, week) {
  const lift = ex.main;
  const p = planned(lift, week, ex.variant);
  if (!p) return '';
  const id = `${lift}${ex.variant ? '-' + ex.variant : ''}`;
  const planLine = [
    p.top ? `${p.top.kgHi ? `${fmtKg(p.top.kg)}–${fmtKg(p.top.kgHi)}` : fmtKg(p.top.kg)} kg × ${p.top.reps} @ RPE ${p.rpe}` : '',
    p.bo ? `${p.top ? 'then ' : ''}${p.bo.sets} × ${p.bo.reps} at ${fmtKg(p.bo.kg)} kg${p.top ? '' : ` @ RPE ${p.rpe}`}` : '',
  ].filter(Boolean).join(', ');
  const top = p.top ? `<div class="set-row" data-kind="top">
      <span class="set-label">Top set</span>
      <label><span>kg</span><input name="${id}.top.kg" inputmode="decimal" value="${fmtKg(p.top.kg)}"></label>
      <label><span>Reps</span><input name="${id}.top.reps" inputmode="numeric" value="${p.top.reps}"></label>
      <label><span>RPE</span><select name="${id}.top.rpe">${rpeOptions('')}</select></label>
    </div>` : '';
  const bo = p.bo ? `<div class="set-row" data-kind="backoff">
      <span class="set-label">${p.top ? 'Back-offs' : 'Work sets'}</span>
      <label><span>Sets</span><input name="${id}.bo.sets" inputmode="numeric" value="${p.bo.sets}"></label>
      <label><span>Reps</span><input name="${id}.bo.reps" inputmode="numeric" value="${p.bo.reps}"></label>
      <label><span>kg</span><input name="${id}.bo.kg" inputmode="decimal" value="${fmtKg(p.bo.kg)}"></label>
      <label><span>RPE</span><select name="${id}.bo.rpe">${rpeOptions('')}</select></label>
    </div>` : '';
  return `<fieldset class="lift-log" data-lift="${lift}" data-id="${id}">
    <legend>${esc(ex.n)}</legend>
    <label class="check"><input type="checkbox" name="${id}.done" checked> Done</label>
    <p class="plan-line">Plan: ${esc(planLine)}</p>
    ${top}${bo}
    <p class="e1rm-live" data-for="${id}" aria-live="polite"></p>
  </fieldset>`;
}

function testRows(key) {
  return SESSIONS[key].lifts.map((lift) => {
    const att = TEST.attempts[lift];
    const rows = [0, 1, 2, 3].map((i) => `<div class="set-row" data-kind="test">
      <span class="set-label">${i < 3 ? ['Opener', '2nd', '3rd'][i] : '4th (optional)'}</span>
      <label><span>kg</span><input name="${lift}.a${i}.kg" inputmode="decimal" value="${i < 3 ? firstNum(att[i]) : ''}"></label>
      <label><span>RPE</span><select name="${lift}.a${i}.rpe">${rpeOptions('')}</select></label>
      <label class="check inline"><input type="checkbox" name="${lift}.a${i}.made"> Made it</label>
    </div>`).join('');
    return `<fieldset class="lift-log" data-lift="${lift}" data-id="${lift}"><legend>${esc(LIFTS[lift].name)}</legend>
      <p class="plan-line">Plan: ${esc(att.join(' / '))} kg. Tick each attempt you made; only made attempts count as your max.</p>${rows}</fieldset>`;
  }).join('');
}

function trackedRows(key, cycle) {
  return SESSIONS[key].exercises.filter((ex) => ex.track).map((ex) => {
    const t = EXTRA_LIFTS[ex.track];
    const { sets, reps } = repsFromSets(setsFor(ex, cycle));
    return `<fieldset class="lift-log small-log" data-id="${ex.track}">
      <legend>${esc(t.name)}</legend>
      <p class="plan-line">Plan: ${esc(setsFor(ex, cycle))}, ${esc(ex.load)}. Leave kg empty to skip.</p>
      <div class="set-row">
        <label><span>${t.added ? 'Added kg' : 'kg'}</span><input name="${ex.track}.kg" inputmode="decimal" placeholder="–"></label>
        <label><span>Sets</span><input name="${ex.track}.sets" inputmode="numeric" value="${sets ?? ''}"></label>
        <label><span>Reps</span><input name="${ex.track}.reps" inputmode="numeric" value="${reps ?? ''}"></label>
        <label><span>RPE</span><select name="${ex.track}.rpe">${rpeOptions('')}</select></label>
      </div>
    </fieldset>`;
  }).join('');
}

function sessionForm() {
  const p = dayPlan(state.date);
  const week = planWeek(state.date);
  let key = state.session || (SESSIONS[p.key] && SESSIONS[p.key].kind !== 'testcal' ? p.key : null);
  if (!key || !SESSION_KEYS.includes(key)) key = 'D1';
  state.session = key;
  const s = SESSIONS[key];
  const cycle = Math.min(4, (p.w && p.w.cycle) || 1);
  const isTest = s.kind === 'test';
  const options = SESSION_KEYS.map((k) => `<option value="${k}" ${k === key ? 'selected' : ''}>${esc(SESSIONS[k].label)}: ${esc(SESSIONS[k].title)}</option>`).join('');
  const mainRows = isTest ? testRows(key) : s.exercises.filter((ex) => ex.main).map((ex) => liftRows(key, ex, week)).join('');
  return `<form class="log-form" id="sessionForm" novalidate>
    <label class="field"><span>Session</span><select name="session" id="sessionPick">${options}</select></label>
    <p class="small">Planned numbers for week ${week}. Change any field to what you actually did.</p>
    ${mainRows}
    ${isTest ? '' : trackedRows(key, cycle)}
    <fieldset class="readiness"><legend>How did you feel?</legend>
      <div class="seg" role="radiogroup">
        ${['green', 'yellow', 'red'].map((r) => `<label class="seg-item r-${r}"><input type="radio" name="readiness" value="${r}"><span>${r[0].toUpperCase() + r.slice(1)}</span></label>`).join('')}
      </div>
    </fieldset>
    ${isTest ? '' : '<label class="check"><input type="checkbox" name="acc" checked> Did the accessories</label>'}
    <label class="field"><span>Bodyweight this morning (kg)</span><input name="bw" inputmode="decimal" placeholder="Optional"></label>
    <label class="field"><span>Notes</span><textarea name="note" rows="2" placeholder="Sleep, soreness, how Muay Thai went"></textarea></label>
    <button type="submit" class="btn primary block">Save session</button>
  </form>`;
}

function readSession(form) {
  const fd = new FormData(form);
  const key = fd.get('session');
  const s = SESSIONS[key];
  const out = [];
  const base = { date: state.date, session: key };
  if (s.kind === 'test') {
    for (const lift of s.lifts) {
      for (let i = 0; i < 4; i++) {
        const kg = num(fd.get(`${lift}.a${i}.kg`));
        if (!kg) continue;
        const made = fd.get(`${lift}.a${i}.made`) === 'on';
        out.push({ ...base, type: 'lift', lift, kind: 'test', kg, reps: made ? 1 : 0, sets: 1, rpe: fd.get(`${lift}.a${i}.rpe`) || '', note: made ? `Attempt ${i + 1}` : `Attempt ${i + 1}, missed` });
      }
    }
  } else {
    for (const ex of s.exercises.filter((e) => e.main)) {
      const id = `${ex.main}${ex.variant ? '-' + ex.variant : ''}`;
      if (fd.get(`${id}.done`) !== 'on') continue;
      const tkg = num(fd.get(`${id}.top.kg`)), treps = num(fd.get(`${id}.top.reps`));
      if (tkg && treps) out.push({ ...base, type: 'lift', lift: ex.main, kind: 'top', kg: tkg, reps: treps, sets: 1, rpe: fd.get(`${id}.top.rpe`) || '' });
      const bkg = num(fd.get(`${id}.bo.kg`)), breps = num(fd.get(`${id}.bo.reps`)), bsets = num(fd.get(`${id}.bo.sets`));
      if (bkg && breps && bsets) out.push({ ...base, type: 'lift', lift: ex.main, kind: 'backoff', kg: bkg, reps: breps, sets: bsets, rpe: fd.get(`${id}.bo.rpe`) || '' });
    }
    for (const ex of s.exercises.filter((e) => e.track)) {
      const kgRaw = fd.get(`${ex.track}.kg`);
      if (kgRaw === '' || kgRaw == null) continue;
      const reps = num(fd.get(`${ex.track}.reps`));
      if (!reps) continue;
      out.push({ ...base, type: 'lift', lift: ex.track, kind: 'set', kg: num(kgRaw) || 0, reps, sets: num(fd.get(`${ex.track}.sets`)) || 1, rpe: fd.get(`${ex.track}.rpe`) || '' });
    }
  }
  const bw = num(fd.get('bw'));
  if (bw) out.push({ type: 'bw', date: state.date, kg: bw });
  out.push({ type: 'session', date: state.date, session: key, readiness: fd.get('readiness') || '', acc: fd.get('acc') === 'on', note: (fd.get('note') || '').trim() });
  return out;
}

function liveE1rm(form) {
  form.querySelectorAll('fieldset.lift-log[data-lift]').forEach((fs) => {
    const id = fs.dataset.id;
    const out = form.querySelector(`.e1rm-live[data-for="${id}"]`);
    if (!out) return;
    const kg = form.elements[`${id}.top.kg`]?.value, reps = form.elements[`${id}.top.reps`]?.value, rpe = form.elements[`${id}.top.rpe`]?.value;
    if (kg && reps && rpe) {
      out.textContent = `Estimated max from the top set: ${fmtKg(e1rm(num(kg), num(reps), rpe))} kg`;
    } else if (kg && reps) {
      out.textContent = 'Add the RPE to get an estimated max.';
    } else {
      out.textContent = '';
    }
  });
}

// ---------- single-entry forms ----------

function liftOptions(selected) {
  return Object.entries(ALL_LIFTS).map(([k, v]) => `<option value="${k}" ${k === selected ? 'selected' : ''}>${esc(v.name)}</option>`).join('');
}

function setForm(e = {}) {
  const lift = e.lift || 'squat';
  return `<form class="log-form" id="setForm" novalidate>
    <div class="two">
      <label class="field"><span>Exercise</span><select name="lift" id="liftPick">${liftOptions(lift)}</select></label>
      <label class="field"><span>Set type</span><select name="kind">${Object.entries(KIND_LABEL).map(([k, v]) => `<option value="${k}" ${k === (e.kind || 'top') ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    </div>
    <label class="field other-name" ${lift === 'other' ? '' : 'hidden'}><span>Exercise name</span><input name="name" value="${esc(e.name || '')}"></label>
    <div class="four">
      <label class="field"><span id="kgLabel">${ALL_LIFTS[lift]?.added ? 'Added kg' : 'kg'}</span><input name="kg" inputmode="decimal" value="${e.kg ?? ''}" required></label>
      <label class="field"><span>Reps</span><input name="reps" inputmode="numeric" value="${e.reps ?? ''}" required></label>
      <label class="field"><span>Sets</span><input name="sets" inputmode="numeric" value="${e.sets ?? 1}"></label>
      <label class="field"><span>RPE</span><select name="rpe">${rpeOptions(e.rpe ?? '')}</select></label>
    </div>
    <label class="field"><span>Notes</span><input name="note" value="${esc(e.note || '')}"></label>
    <p class="e1rm-live" id="setE1rm" aria-live="polite"></p>
    <button type="submit" class="btn primary block">${state.editing ? 'Save changes' : 'Save set'}</button>
    ${state.editing ? '<button type="button" class="btn secondary block" data-action="cancel-edit">Cancel</button>' : ''}
  </form>`;
}

function bwForm(e = {}) {
  const avg = bwAverage(state.date, 7);
  return `<form class="log-form" id="bwForm" novalidate>
    <label class="field"><span>Bodyweight (kg), morning, after the toilet</span><input name="kg" inputmode="decimal" value="${e.kg ?? ''}" required></label>
    <p class="small">${avg != null ? `7-day average up to ${esc(fmtShort(state.date))}: <strong>${fmtKg(avg)} kg</strong>. Target band 72.5–74 kg.` : 'Weigh in most mornings; the 7-day average is what counts.'}</p>
    <button type="submit" class="btn primary block">${state.editing ? 'Save changes' : 'Save bodyweight'}</button>
    ${state.editing ? '<button type="button" class="btn secondary block" data-action="cancel-edit">Cancel</button>' : ''}
  </form>`;
}

function skillForm(e = {}) {
  const sk = e.skill || 'mu';
  return `<form class="log-form" id="skillForm" novalidate>
    <div class="two">
      <label class="field"><span>Skill or test</span><select name="skill" id="skillPick">${Object.entries(SKILLS).map(([k, v]) => `<option value="${k}" ${k === sk ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>
      <label class="field"><span id="skillUnit">${SKILLS[sk].unit === 's' ? 'Seconds' : 'Reps'}</span><input name="value" inputmode="decimal" value="${e.value ?? ''}" required></label>
    </div>
    <label class="field"><span>Notes</span><input name="note" value="${esc(e.note || '')}" placeholder="Band, kip, freestanding or wall"></label>
    <button type="submit" class="btn primary block">${state.editing ? 'Save changes' : 'Save result'}</button>
    ${state.editing ? '<button type="button" class="btn secondary block" data-action="cancel-edit">Cancel</button>' : ''}
  </form>`;
}

function mtForm(e = {}) {
  return `<form class="log-form" id="mtForm" novalidate>
    <div class="two">
      <label class="field"><span>Class</span><select name="time">${['17:00', '09:00', '20:45'].map((t) => `<option ${t === (e.time || '17:00') ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Sparring</span><select name="sparring">${[['', 'None'], ['light', 'Light'], ['hard', 'Hard']].map(([v, l]) => `<option value="${v}" ${v === (e.sparring || '') ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <label class="field"><span>Notes</span><input name="note" value="${esc(e.note || '')}" placeholder="Knocks, soreness, what you worked on"></label>
    <button type="submit" class="btn primary block">${state.editing ? 'Save changes' : 'Log class'}</button>
    ${state.editing ? '<button type="button" class="btn secondary block" data-action="cancel-edit">Cancel</button>' : ''}
  </form>`;
}

// ---------- history ----------

function describe(e) {
  if (e.type === 'lift') {
    const l = ALL_LIFTS[e.lift] || { name: e.lift };
    const name = e.lift === 'other' && e.name ? e.name : l.name;
    const kgTxt = l.added ? `+${fmtKg(e.kg)} kg` : `${fmtKg(e.kg)} kg`;
    if (e.kind === 'test') {
      return { title: `${name}, ${e.note || 'test attempt'}`, detail: `${kgTxt}${e.rpe ? `, RPE ${e.rpe}` : ''}`, e1: e.reps ? entryE1rm(e) : null };
    }
    const what = Number(e.sets) > 1 ? `${e.sets} × ${e.reps} @ ${kgTxt}` : `${kgTxt} × ${e.reps}`;
    return { title: name, detail: `${KIND_LABEL[e.kind] || 'Set'}: ${what}${e.rpe ? `, RPE ${e.rpe}` : ''}${e.note ? `, ${e.note}` : ''}`, e1: LIFTS[e.lift] ? entryE1rm(e) : null };
  }
  if (e.type === 'bw') return { title: 'Bodyweight', detail: `${fmtKg(e.kg)} kg` };
  if (e.type === 'skill') return { title: SKILLS[e.skill]?.name || 'Skill', detail: `${fmtKg(e.value)} ${SKILLS[e.skill]?.unit || ''}${e.note ? `, ${e.note}` : ''}` };
  if (e.type === 'mt') return { title: `Muay Thai ${e.time || ''}`.trim(), detail: [e.sparring ? `${e.sparring} sparring` : '', e.note || ''].filter(Boolean).join(', ') || 'Class done' };
  if (e.type === 'session') {
    const s = SESSIONS[e.session];
    return { title: s ? `${s.label}: ${s.title}` : 'Session', detail: [e.readiness ? `Felt ${e.readiness}` : '', e.acc ? 'accessories done' : '', e.note || ''].filter(Boolean).join(', ') || 'Saved' };
  }
  return { title: e.type, detail: '' };
}

const FILTERS = [['all', 'All'], ['lift', 'Lifts'], ['bw', 'Bodyweight'], ['skill', 'Skills'], ['mt', 'Muay Thai']];

function historyHtml() {
  let list = store.all().filter((e) => e.type !== 'adj');
  if (state.filter !== 'all') list = list.filter((e) => e.type === state.filter);
  list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
  const dates = [...new Set(list.map((e) => e.date))];
  const shown = state.showAll ? dates : dates.slice(0, 10);
  const chips = `<div class="chips" role="group" aria-label="Filter the log">${FILTERS.map(([k, l]) => `<button type="button" class="chip ${state.filter === k ? 'is-on' : ''}" data-filter="${k}" aria-pressed="${state.filter === k}">${l}</button>`).join('')}</div>`;
  if (!list.length) {
    return `<section class="history"><h2>Your log</h2>${chips}<p class="empty">Nothing logged yet. Save your first session above and it shows up here.</p></section>`;
  }
  const groups = shown.map((d) => {
    const items = list.filter((e) => e.date === d).map((e) => {
      const x = describe(e);
      return `<li class="h-item h-${e.type}">
        <div class="h-text"><span class="h-title">${esc(x.title)}</span><span class="h-detail">${esc(x.detail)}</span></div>
        ${x.e1 ? `<span class="h-e1">${fmtKg(x.e1)}<small>e1RM</small></span>` : ''}
        <div class="h-actions">
          ${['lift', 'bw', 'skill', 'mt'].includes(e.type) ? `<button type="button" class="icon-btn" data-edit="${e.id}" aria-label="Edit ${esc(x.title)}">Edit</button>` : ''}
          <button type="button" class="icon-btn danger" data-del="${e.id}" aria-label="Delete ${esc(x.title)}">Delete</button>
        </div>
      </li>`;
    }).join('');
    return `<li class="h-day"><h3>${esc(fmtLong(d))}</h3><ul>${items}</ul></li>`;
  }).join('');
  const more = !state.showAll && dates.length > shown.length ? `<button type="button" class="btn secondary block" data-action="more">Show ${dates.length - shown.length} older days</button>` : '';
  return `<section class="history"><h2>Your log</h2>${chips}<ul class="h-days">${groups}</ul>${more}</section>`;
}

// ---------- render ----------

const TABS = [['session', 'Session'], ['set', 'One set'], ['bw', 'Bodyweight'], ['skill', 'Skills'], ['mt', 'Muay Thai']];

function defaultTab(date) {
  const k = dayKind(dayPlan(date).key);
  if (dayPlan(date).key === 'testCal') return 'skill';
  if (k === 'gym' || k === 'test') return 'session';
  if (k === 'mt') return 'mt';
  return 'bw';
}

export function renderLog(root, fresh) {
  if (fresh) {
    const d = qs('date');
    state.date = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : (state.date || todayStr());
    state.session = qs('session') || null;
    state.tab = qs('tab') || (qs('session') ? 'session' : defaultTab(state.date));
    state.editing = null;
    state.saved = null;
  }
  const editRec = state.editing ? store.get(state.editing) : null;
  if (state.editing && !editRec) state.editing = null;
  let form;
  if (editRec) {
    form = { lift: setForm, bw: bwForm, skill: skillForm, mt: mtForm }[editRec.type](editRec);
  } else if (state.saved && state.tab === 'session') {
    form = '<button type="button" class="btn secondary block" data-action="another">Log another session</button>';
  } else {
    form = { session: sessionForm, set: setForm, bw: bwForm, skill: skillForm, mt: mtForm }[state.tab]();
  }
  const saved = state.saved ? `<div class="saved" role="status"><h3>Saved</h3><ul>${state.saved.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>${suggestions().length ? '<p><a href="#/today">See suggestions on Today</a></p>' : ''}</div>` : '';
  root.innerHTML = `<div class="wrap view-log">
    <section class="intro"><h1>${editRec ? 'Edit entry' : 'Log'}</h1></section>
    <label class="field date-field"><span>Date</span><input type="date" name="date" id="logDate" value="${state.date}" min="2026-09-01" max="2027-01-31"></label>
    <p class="small">${esc(fmtLong(state.date))}${weekOf(state.date) >= 1 && weekOf(state.date) <= 13 ? `, week ${weekOf(state.date)}` : ''}</p>
    ${editRec ? '' : `<div class="tabs" role="tablist" aria-label="What to log">${TABS.map(([k, l]) => `<button type="button" role="tab" class="tab ${state.tab === k ? 'is-on' : ''}" aria-selected="${state.tab === k}" data-tab="${k}">${l}</button>`).join('')}</div>`}
    ${saved}
    ${form}
    ${historyHtml()}
  </div>`;
  wire(root);
}

function finishSave(root, lines) {
  state.saved = lines;
  state.editing = null;
  renderLog(root, false);
  window.scrollTo({ top: 0 });
}

function wire(root) {
  root.querySelector('#logDate').addEventListener('change', (ev) => {
    if (!ev.target.value) return;
    state.date = ev.target.value;
    if (state.tab === 'session') state.session = null;
    state.saved = null;
    renderLog(root, false);
  });
  root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    state.tab = b.dataset.tab;
    state.saved = null;
    renderLog(root, false);
  }));
  root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    state.filter = b.dataset.filter;
    renderLog(root, false);
  }));
  root.querySelector('[data-action="more"]')?.addEventListener('click', () => { state.showAll = true; renderLog(root, false); });
  root.querySelector('[data-action="another"]')?.addEventListener('click', () => { state.saved = null; renderLog(root, false); });
  root.querySelector('[data-action="cancel-edit"]')?.addEventListener('click', () => { state.editing = null; renderLog(root, false); });
  root.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => {
    state.editing = b.dataset.edit;
    const rec = store.get(state.editing);
    if (rec) state.date = rec.date;
    state.saved = null;
    renderLog(root, false);
    window.scrollTo({ top: 0 });
  }));
  root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    const rec = store.get(b.dataset.del);
    if (!rec) return;
    store.remove(rec.id);
    toast('Entry deleted', { label: 'Undo', run: () => store.update(rec.id, { ...rec, deleted: false }) });
  }));

  const sf = root.querySelector('#sessionForm');
  if (sf) {
    sf.querySelector('#sessionPick').addEventListener('change', (ev) => { state.session = ev.target.value; renderLog(root, false); });
    sf.addEventListener('input', () => liveE1rm(sf));
    sf.addEventListener('change', () => liveE1rm(sf));
    sf.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const recs = readSession(sf);
      const lifts = recs.filter((r) => r.type === 'lift');
      if (!lifts.length && !recs.some((r) => r.type === 'bw')) {
        toast('Nothing to save yet: fill in at least one set.');
        return;
      }
      store.addMany(recs);
      const lines = lifts.map((r) => {
        const x = describe(r);
        return `${x.title}: ${x.detail}${x.e1 ? `, e1RM ${fmtKg(x.e1)} kg` : ''}`;
      });
      if (recs.some((r) => r.type === 'bw')) lines.push(`Bodyweight ${fmtKg(recs.find((r) => r.type === 'bw').kg)} kg`);
      toast('Session saved');
      finishSave(root, lines);
    });
    liveE1rm(sf);
  }

  const setF = root.querySelector('#setForm');
  if (setF) {
    const update = () => {
      const lift = setF.elements.lift.value;
      setF.querySelector('.other-name').hidden = lift !== 'other';
      setF.querySelector('#kgLabel').textContent = ALL_LIFTS[lift]?.added ? 'Added kg' : 'kg';
      const kg = num(setF.elements.kg.value), reps = num(setF.elements.reps.value), rpe = setF.elements.rpe.value;
      const out = setF.querySelector('#setE1rm');
      out.textContent = !LIFTS[lift] || !kg || !reps ? '' : rpe ? `Estimated max: ${fmtKg(e1rm(kg, reps, rpe))} kg` : 'Add the RPE to get an estimated max.';
    };
    setF.addEventListener('input', update);
    setF.addEventListener('change', update);
    update();
    setF.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const f = setF.elements;
      const kg = num(f.kg.value), reps = num(f.reps.value);
      const lift = f.lift.value;
      if (kg == null || !reps) { toast('Add the kg and reps first.'); return; }
      const rec = { type: 'lift', date: state.date, lift, kind: f.kind.value, kg, reps, sets: num(f.sets.value) || 1, rpe: f.rpe.value, note: f.note.value.trim(), name: lift === 'other' ? f.name.value.trim() : undefined };
      if (state.editing) store.update(state.editing, rec); else store.add(rec);
      const x = describe(rec);
      toast(state.editing ? 'Changes saved' : 'Set saved');
      finishSave(root, [`${x.title}: ${x.detail}${x.e1 ? `, e1RM ${fmtKg(x.e1)} kg` : ''}`]);
    });
  }

  const bwF = root.querySelector('#bwForm');
  bwF?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const kg = num(bwF.elements.kg.value);
    if (!kg || kg < 30 || kg > 200) { toast('Enter your weight in kg, for example 73.2.'); return; }
    if (state.editing) store.update(state.editing, { kg, date: state.date }); else store.add({ type: 'bw', date: state.date, kg });
    toast('Bodyweight saved');
    finishSave(root, [`Bodyweight ${fmtKg(kg)} kg`]);
  });

  const skF = root.querySelector('#skillForm');
  if (skF) {
    skF.elements.skill.addEventListener('change', () => {
      skF.querySelector('#skillUnit').textContent = SKILLS[skF.elements.skill.value].unit === 's' ? 'Seconds' : 'Reps';
    });
    skF.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const value = num(skF.elements.value.value);
      if (value == null) { toast('Enter a number of reps or seconds.'); return; }
      const rec = { type: 'skill', date: state.date, skill: skF.elements.skill.value, value, note: skF.elements.note.value.trim() };
      if (state.editing) store.update(state.editing, rec); else store.add(rec);
      toast('Result saved');
      finishSave(root, [`${SKILLS[rec.skill].name}: ${fmtKg(value)} ${SKILLS[rec.skill].unit}`]);
    });
  }

  const mtF = root.querySelector('#mtForm');
  mtF?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const rec = { type: 'mt', date: state.date, time: mtF.elements.time.value, sparring: mtF.elements.sparring.value, note: mtF.elements.note.value.trim() };
    if (state.editing) store.update(state.editing, rec); else store.add(rec);
    toast('Class logged');
    finishSave(root, [`Muay Thai ${rec.time}`]);
  });
}
