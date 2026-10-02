import { md, esc } from './md.js';
import * as C from './content.js';
import { WEEKS, LAYOUTS, SESSIONS, LIFTS, GOALS, START_MAX, TEST, DOC_URL, CYCLES } from './plan.js';
import { planned, setsAllCycles, adjustments } from './model.js';
import { weekStart, addDays, fmtRange, todayStr, weekOf, fmtKg, DAY_SHORT, fmtShort } from './calc.js';

const SECTIONS = [
  ['quick', 'Quick start'],
  ['approach', 'Approach and targets'],
  ['layout', 'Weekly layout'],
  ['warmup', 'Warm-up'],
  ['workouts', 'Workouts, A and B weeks'],
  ['cweeks', 'Workouts, C weeks'],
  ['progression', 'Main-lift progression'],
  ['skills', 'Calisthenics skills'],
  ['rules', 'Adjustment rules'],
  ['nutrition', 'Nutrition and recovery'],
  ['tracking', 'Tracking'],
  ['evidence', 'Evidence'],
];

function table(head, rows, opts = {}) {
  return `<div class="table-wrap"><table class="${opts.cls || ''}"><thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr class="${r.cls || ''}">${r.cells.map((c, i) => `<td class="${(opts.numCols || []).includes(i) ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function cellFor(key) {
  if (key === 'mt') return '<span class="tag tag-mt">Muay Thai 17:00</span>';
  if (key === 'rest' || key === 'rest-b') return '<span class="tag tag-rest">Rest</span>';
  const s = SESSIONS[key];
  return `<span class="tag tag-gym">Gym: ${esc(s.label)}${s.label.startsWith('Day') ? ' ' + esc(s.title) : ''}</span>`;
}

function layoutTable() {
  const rows = DAY_SHORT.map((d, i) => ({ cells: [esc(d), cellFor(LAYOUTS.A[i]), cellFor(LAYOUTS.B[i]), cellFor(LAYOUTS.C[i])] }));
  return table(['Day', 'Week A (3 + 3)', 'Week B (3 + 2)', 'Week C (2 + 3)'], rows, { cls: 'layout' });
}

function calendarTable() {
  const now = weekOf(todayStr());
  const rows = WEEKS.map((w) => {
    const start = weekStart(w.n);
    const end = w.n === 13 ? '2026-12-31' : addDays(start, 6);
    const type = w.test ? 'Test' : `${w.type}${w.deload ? ', deload' : ''}${w.taper ? ', taper' : ''}`;
    const cyc = w.test ? 'Test' : `${CYCLES[w.cycle].name}${[1, 4, 7, 10].includes(w.n) ? ` (${CYCLES[w.cycle].reps})` : ''}`;
    return { cls: w.n === now ? 'current' : '', cells: [String(w.n), esc(fmtRange(start, end)), esc(type), esc(cyc)] };
  });
  return table(['Week', 'Dates', 'Type', 'Cycle'], rows, { numCols: [0] });
}

function targetsTable() {
  const rows = ['squat', 'bench', 'deadlift'].map((l) => ({
    cells: [esc(LIFTS[l].short), `${fmtKg(START_MAX[l])} kg`, `${GOALS[l].goal} kg`, `${esc(GOALS[l].realistic)} kg`, `${GOALS[l].stretch} kg`],
  }));
  return table(['Lift', 'Now', 'Your goal', 'Realistic', 'Stretch'], rows, { numCols: [1, 2, 3, 4] });
}

function sessionTable(key) {
  const s = SESSIONS[key];
  const cweek = key === 'X' || key === 'Y';
  const rows = s.exercises.map((ex) => ({
    cells: [
      `<span class="ex-name">${esc(ex.g)} ${esc(ex.n)}</span>`,
      esc(ex.main ? (cweek ? 'C-week row' : 'Top set + back-offs') : setsAllCycles(ex)),
      esc(ex.main ? 'Progression table' : ex.load || ''),
      esc(ex.rest || ''),
    ],
  }));
  return table(['Exercise', 'Sets × reps', 'Load', 'Rest'], rows, { cls: 'ex-plan' });
}

function notesList(key) {
  return `<dl class="notes">${SESSIONS[key].notes.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>`;
}

function progTable(lift) {
  const now = weekOf(todayStr());
  const rows = [];
  for (let w = 1; w <= 12; w++) {
    const p = planned(lift, w);
    const wi = WEEKS[w - 1];
    let top = '—', bo = '';
    if (p.top) top = `${p.top.kgHi ? `${fmtKg(p.top.kg)}–${fmtKg(p.top.kgHi)}` : fmtKg(p.top.kg)} × ${p.top.reps}${w === 12 ? ' (Tue)' : ''}`;
    if (p.bo) bo = `${p.bo.sets} × ${p.bo.reps} @ ${fmtKg(p.bo.kg)}`;
    if (lift === 'squat' && w === 12) {
      const sat = planned('squat', 12, 'sat');
      bo = `Tue ${bo}, Sat ${sat.bo.sets} × ${sat.bo.reps} @ ${fmtKg(sat.bo.kg)}`;
    }
    if (p.note) bo += ` (${p.note})`;
    rows.push({ cls: `${w === now ? 'current' : ''} ${wi.deload ? 'deload' : ''}`, cells: [`${w} ${wi.type}`, esc(top), esc(bo), esc(p.rpe)] });
  }
  if (lift !== 'paused') rows.push({ cls: now === 13 ? 'current' : '', cells: ['13', esc(lift === 'deadlift' ? 'Test Wed Dec 30' : 'Test Mon Dec 28'), '', ''] });
  if (lift === 'paused') {
    return table(['Week', 'Sets × reps @ kg', 'Target RPE'], rows.map((r) => ({ cls: r.cls, cells: [r.cells[0], r.cells[2], r.cells[3]] })), { cls: 'prog' });
  }
  return table(['Week', 'Top set (kg × reps)', 'Back-offs (kg)', 'Target RPE'], rows, { cls: 'prog' });
}

function adjustmentNote() {
  const list = adjustments();
  if (!list.length) return '';
  return `<p class="callout">These tables include your adjustments: ${list.map((a) => `${esc(LIFTS[a.lift].short)} ${a.kg > 0 ? '+' : ''}${fmtKg(a.kg)} kg from week ${a.fromWeek}`).join('; ')}. Change them in <a href="#/settings">Settings</a>.</p>`;
}

function testTables() {
  const days = table(['Day', 'Test'], TEST.days.map((d) => ({ cells: [esc(`${['Mon', 'Tue', 'Wed', 'Thu'][TEST.days.indexOf(d)]} ${fmtShort(d.date)}`), esc(d.what)] })));
  const att = table(['Lift', 'Opener', '2nd', '3rd'], ['squat', 'bench', 'deadlift'].map((l) => ({ cells: [esc(LIFTS[l].short), ...TEST.attempts[l].map((a) => `${esc(a)} kg`)] })), { numCols: [1, 2, 3] });
  const jumps = table(['Last attempt felt', 'Squat or deadlift', 'Bench'], TEST.jumps.map((r) => ({ cells: r.map(esc) })));
  return `${days}${att}<p>Pick the 2nd and 3rd attempts from how the last one felt:</p>${jumps}`;
}

function section(id, title, body) {
  return `<section class="plan-section" id="sec-${id}" tabindex="-1"><h2>${esc(title)}</h2>${body}</section>`;
}

export function renderPlan(root, sub) {
  const body = [
    section('quick', 'Quick start', md(C.QUICK_START)),
    section('approach', 'The approach and honest targets', md(C.APPROACH) + `<h3>Honest check of your Dec 31 targets</h3>${md(C.TARGETS_LEAD)}${targetsTable()}${md(C.TARGETS_NOTES)}`),
    section('layout', 'Weekly layout and calendar', `<p>Every week keeps the same skeleton, and each week type drops one session from it.</p>${layoutTable()}${md(C.LAYOUT_NOTES)}<h3>Rotation calendar</h3>${calendarTable()}${md(C.CALENDAR_NOTE)}`),
    section('warmup', 'Standard warm-up', md(C.WARMUP)),
    section('workouts', 'Gym workouts: 3-gym weeks (A and B)', md(C.WORKOUTS_INTRO) +
      ['D1', 'D2', 'D3'].map((k) => `<h3>${esc(SESSIONS[k].label)}: ${esc(SESSIONS[k].title)} (${['Tuesday', 'Thursday', 'Saturday'][['D1', 'D2', 'D3'].indexOf(k)]})</h3>${sessionTable(k)}<h4>Technique and substitutions</h4>${notesList(k)}`).join('') +
      `<h3>Finishers (optional, 10 min max)</h3>${md(C.FINISHERS)}`),
    section('cweeks', 'Gym workouts: 2-gym weeks (C)', md(C.CWEEK_RULES) +
      `<h3>Session X: squat + bench (Tuesday)</h3>${sessionTable('X')}<h3>Session Y: deadlift + paused bench (Saturday)</h3>${sessionTable('Y')}`),
    section('progression', 'Main-lift progression', md(C.PROGRESSION_INTRO) + adjustmentNote() +
      `<h3>Squat (Day 1, Session X)</h3>${progTable('squat')}<h3>Bench press (Day 2, Session X)</h3>${progTable('bench')}<h3>Paused bench (Day 1, Session Y)</h3>${progTable('paused')}<h3>Deadlift (Day 3, Session Y)</h3>${progTable('deadlift')}` +
      `<h3>Week 12 taper (Dec 21–27)</h3>${md(C.TAPER)}<h3>Test week (Dec 28–31)</h3>${testTables()}${md(C.TEST_NOTES)}`),
    section('skills', 'Calisthenics skills', md(C.SKILLS_TEXT)),
    section('rules', 'Adjustment rules', md(C.RULES)),
    section('nutrition', 'Nutrition, sleep and recovery', md(C.NUTRITION)),
    section('tracking', 'Tracking', md(C.TRACKING)),
    section('evidence', 'Evidence behind the plan', md(C.EVIDENCE)),
  ].join('');

  root.innerHTML = `<div class="wrap view-plan">
    <section class="intro">
      <h1>Your plan</h1>
      <p class="lede">Oct 5 – Dec 31, 2026: four 3-week cycles, then a test week. Tables update when you add an adjustment in Settings.</p>
      <div class="actions">
        <a class="btn secondary" href="${DOC_URL}" target="_blank" rel="noopener">Open the editable doc</a>
        <button type="button" class="btn secondary" data-action="print">Print or save as PDF</button>
      </div>
      <nav class="toc" aria-label="Plan sections"><ul>${SECTIONS.map(([id, t]) => `<li><a href="#/plan/${id}">${esc(t)}</a></li>`).join('')}</ul></nav>
    </section>
    ${body}
  </div>`;

  root.querySelector('[data-action="print"]').addEventListener('click', () => window.print());
  if (sub) {
    const el = document.getElementById(`sec-${sub}`);
    if (el) requestAnimationFrame(() => { el.scrollIntoView({ block: 'start' }); el.focus({ preventScroll: true }); });
  } else {
    window.scrollTo(0, 0);
  }
}
