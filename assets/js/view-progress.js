import { plannedCurve, bestByWeek, bestEver, heaviestSingle, weekSummary, bwPoints, suggestions, MAIN, hasAnyLog, bwAverage } from './model.js';
import { GOALS, LIFTS, START_MAX, SKILLS, BW_BAND } from './plan.js';
import { liftChart, bwChart } from './charts.js';
import { rollingMean, fmtKg, fmtShort, todayStr } from './calc.js';
import { esc, toast } from './ui.js';
import * as store from './store.js';

function liftSection(lift) {
  const planned = plannedCurve(lift);
  const logged = bestByWeek(lift);
  const best = bestEver(lift);
  const single = heaviestSingle(lift);
  const g = GOALS[lift];
  const chart = liftChart({ title: `${LIFTS[lift].short}: estimated max by week against the plan`, planned, logged, goal: g.goal, goalLabel: `Goal ${g.goal}` });
  const summary = best
    ? `Best estimated max <strong>${fmtKg(best.v)} kg</strong>${single ? `, heaviest single ${fmtKg(single.kg)} kg` : ''}. Started at ${fmtKg(START_MAX[lift])} kg.`
    : `No sets logged yet. Started at ${fmtKg(START_MAX[lift])} kg; realistic target ${esc(g.realistic)} kg.`;
  return `<section class="prog-lift">
    <h2>${esc(LIFTS[lift].short)}</h2>
    <p>${summary}</p>
    <div class="legend" aria-hidden="true"><span class="li"><span class="key key-log"></span>You, best per week</span><span class="li"><span class="key key-plan"></span>Plan</span><span class="li"><span class="key key-goal"></span>Goal</span></div>
    ${chart}
  </section>`;
}

function bwSection() {
  const pts = bwPoints();
  const avg = rollingMean(pts.map((p) => ({ day: p.day, v: p.v })), 7);
  const now = bwAverage(todayStr(), 7);
  return `<section class="prog-bw">
    <h2>Bodyweight</h2>
    <p>${now != null ? `7-day average <strong>${fmtKg(now)} kg</strong>. Target band ${BW_BAND[0]}–${BW_BAND[1]} kg (73–74.5 on creatine).` : `No weigh-ins this week. Target band ${BW_BAND[0]}–${BW_BAND[1]} kg.`}</p>
    <div class="legend" aria-hidden="true"><span class="li"><span class="key key-log"></span>7-day average</span><span class="li"><span class="key key-dot"></span>Weigh-ins</span><span class="li"><span class="key key-band"></span>Target band</span></div>
    ${bwChart({ points: pts, avg, band: BW_BAND })}
  </section>`;
}

function weeklyTable() {
  const rows = weekSummary();
  const cell = (v) => (v == null ? '<span class="muted">–</span>' : fmtKg(v));
  return `<section class="prog-weeks">
    <h2>Week by week</h2>
    <p class="small">Best estimated max per lift, 7-day bodyweight average and Muay Thai classes logged.</p>
    <div class="table-wrap"><table class="weekly"><thead><tr><th scope="col">Week</th><th scope="col">BW</th><th scope="col">Squat</th><th scope="col">Bench</th><th scope="col">Deadlift</th><th scope="col">MT</th></tr></thead>
    <tbody>${rows.map((r) => `<tr><td>${r.week} ${r.type}</td><td class="num">${cell(r.bw)}</td><td class="num">${cell(r.squat)}</td><td class="num">${cell(r.bench)}</td><td class="num">${cell(r.deadlift)}</td><td class="num">${r.mt || '<span class="muted">–</span>'}</td></tr>`).join('')}</tbody></table></div>
  </section>`;
}

function skillsTable() {
  const list = store.byType('skill');
  const rows = Object.entries(SKILLS).map(([k, s]) => {
    const mine = list.filter((e) => e.skill === k);
    if (!mine.length) return `<tr><td>${esc(s.name)}</td><td class="num"><span class="muted">–</span></td><td></td></tr>`;
    const best = mine.reduce((a, b) => (Number(b.value) > Number(a.value) ? b : a));
    return `<tr><td>${esc(s.name)}</td><td class="num">${fmtKg(best.value)} ${esc(s.unit)}</td><td>${esc(fmtShort(best.date))}</td></tr>`;
  }).join('');
  return `<section class="prog-skills"><h2>Skills</h2>
    <p class="small">Start: 12 strict pull-ups, 22 dips, no skills yet.</p>
    <div class="table-wrap"><table><thead><tr><th scope="col">Skill</th><th scope="col">Best</th><th scope="col">Date</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

export function renderProgress(root) {
  const list = suggestions();
  const tips = list.length
    ? `<section class="suggest"><h2>Suggestions from your log</h2>${list.map((s, i) => `<div class="suggest-item tone-${s.tone}"><p>${esc(s.text)}</p>${s.action ? `<button type="button" class="btn small" data-apply="${i}">Apply</button>` : ''}</div>`).join('')}</section>`
    : '';
  const empty = hasAnyLog() ? '' : '<p class="callout">Your charts fill in as you log. The grey line is what the plan expects; your weekly best goes on top of it.</p>';
  root.innerHTML = `<div class="wrap view-progress">
    <section class="intro"><h1>Progress</h1><p class="lede">Estimated maxes from your logged sets, against the plan and your Dec 31 goals.</p>${empty}</section>
    ${tips}
    ${MAIN.map(liftSection).join('')}
    ${bwSection()}
    ${weeklyTable()}
    ${skillsTable()}
  </div>`;
  root.querySelectorAll('[data-apply]').forEach((b) => b.addEventListener('click', () => {
    const s = list[Number(b.dataset.apply)];
    if (!s || !s.action) return;
    store.add({ type: 'adj', date: todayStr(), ...s.action });
    toast(`${LIFTS[s.action.lift].short}: ${s.action.kg > 0 ? '+' : ''}${s.action.kg} kg from week ${s.action.fromWeek}`);
  }));
}
