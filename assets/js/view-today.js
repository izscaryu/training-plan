import { dayPlan, dayKind, weekInfo, planned, setsFor, suggestions, upcomingGymDay } from './model.js';
import { SESSIONS, TYPE_INFO, CYCLES, TEST, LIFTS, EXTRA_LIFTS } from './plan.js';
import { BEFORE_MT, REST_DAY, SKILL_BY_CYCLE } from './content.js';
import { todayStr, weekOf, addDays, weekStart, fmtLong, fmtShort, fmtRange, DAY_SHORT, START, END, dayNumber, weekday, fmtKg } from './calc.js';
import { esc, liftBlock, toast, qs } from './ui.js';
import * as store from './store.js';

let selected = null;

function clampDate(d) {
  if (dayNumber(d) < dayNumber(START)) return START;
  if (dayNumber(d) > dayNumber(END)) return END;
  return d;
}

function kindClass(key) {
  return { gym: 'k-gym', mt: 'k-mt', rest: 'k-rest', test: 'k-test', none: 'k-none' }[dayKind(key)];
}

function dayShortLabel(key) {
  const k = dayKind(key);
  if (k === 'gym') return SESSIONS[key].label.replace('Short Session', 'Taper').replace('Session ', '');
  if (k === 'mt') return 'MT';
  if (k === 'test') return 'Test';
  if (key === 'done') return '';
  return 'Rest';
}

function rotationStrip(viewWeek) {
  const now = weekOf(todayStr());
  const cells = [];
  for (let n = 1; n <= 13; n++) {
    const w = weekInfo(n);
    const cls = ['rot', `t-${w.type}`];
    if (n === viewWeek) cls.push('is-view');
    if (n === now) cls.push('is-now');
    if (now > n) cls.push('is-past');
    if (n === 4 || n === 7 || n === 10 || n === 13) cls.push('gap');
    cells.push(`<button type="button" class="${cls.join(' ')}" data-week="${n}" aria-label="Week ${n}, ${w.test ? 'test week' : 'type ' + w.type}"><span>${w.type}</span></button>`);
  }
  return `<div class="rotation" role="group" aria-label="Rotation, 13 weeks">${cells.join('')}</div>`;
}

function weekDays(viewWeek) {
  const start = weekStart(viewWeek);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const p = dayPlan(d);
    const cls = ['day', kindClass(p.key)];
    if (d === selected) cls.push('is-selected');
    if (d === todayStr()) cls.push('is-today');
    const beyond = p.key === 'done' || dayNumber(d) > dayNumber(END);
    out.push(`<button type="button" class="${cls.join(' ')}" data-go="${d}" ${beyond ? 'disabled' : ''} aria-pressed="${d === selected}">
      <span class="day-name">${DAY_SHORT[i]}</span><span class="day-num">${Number(d.slice(8))}</span><span class="day-tag">${esc(dayShortLabel(p.key))}</span>
    </button>`);
  }
  return `<div class="days" role="group" aria-label="Days of week ${viewWeek}">${out.join('')}</div>`;
}

function loggedOn(date) {
  return store.all().filter((e) => e.date === date && e.type !== 'adj');
}

function exerciseRows(session, cycle) {
  return session.exercises.map((ex) => {
    if (ex.finisher && cycle === 4) return '';
    const sets = ex.main ? 'See above' : setsFor(ex, cycle);
    return `<tr><td class="ex-g">${esc(ex.g)}</td><td><span class="ex-name">${esc(ex.n)}</span>${ex.load ? `<span class="ex-load">${esc(ex.load)}</span>` : ''}</td><td class="ex-sets">${esc(sets)}</td><td class="ex-rest">${esc(ex.rest || '')}</td></tr>`;
  }).join('');
}

function gymBoard(p) {
  const s = p.session;
  const w = p.w;
  const logged = loggedOn(p.date);
  const mains = s.exercises.filter((ex) => ex.main);
  const blocks = mains.map((ex) => liftBlock(ex.main, planned(ex.main, p.week, ex.variant), { name: ex.n })).join('');
  const tracked = s.exercises.filter((ex) => ex.track).map((ex) => {
    const t = EXTRA_LIFTS[ex.track];
    return `<li><span>${esc(t.name)}</span><span class="num">${esc(setsFor(ex, p.cycle))}</span><span class="muted">${esc(ex.load)}</span></li>`;
  }).join('');
  const skills = SKILL_BY_CYCLE[Math.min(p.cycle, 4)];
  const hasEmom = s.exercises.some((ex) => ex.n.startsWith('EMOM'));
  const meta = `Week ${p.week} (${w.type}), ${w.taper ? 'taper' : CYCLES[w.cycle].name + ' cycle'}, ${s.length}`;
  const loggedNote = logged.length
    ? `<p class="logged-note">Logged: ${logged.filter((e) => e.type === 'lift').length} sets saved for this day. <a href="#/log?date=${p.date}">See the log</a></p>`
    : '';
  return `<article class="board b-gym">
    <header class="board-head">
      <p class="board-label">${esc(s.label)}</p>
      <h2>${esc(s.title)}</h2>
      <p class="board-meta">${esc(meta)}</p>
    </header>
    ${loggedNote}
    ${w.deload ? '<p class="callout">Deload week: straight sets only, everything should feel easy (RPE 6 or less).</p>' : ''}
    ${blocks}
    ${tracked ? `<section class="tracked"><h3>Also log</h3><ul>${tracked}</ul></section>` : ''}
    <a class="btn primary block" href="#/log?date=${p.date}&session=${encodeURIComponent(p.key)}">Log this session</a>
    <details class="fold">
      <summary>Full workout, in order</summary>
      <div class="table-wrap"><table class="ex-table"><thead><tr><th scope="col">#</th><th scope="col">Exercise</th><th scope="col">Sets × reps</th><th scope="col">Rest</th></tr></thead><tbody>${exerciseRows(s, p.cycle)}</tbody></table></div>
      ${p.cycle === 4 && !w.taper ? '<p class="small">Peak cycle: one set fewer on the power block and accessories, no finisher.</p>' : ''}
    </details>
    <details class="fold">
      <summary>Technique and substitutions</summary>
      <dl class="notes">${s.notes.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>
    </details>
    ${w.taper ? '' : `<details class="fold">
      <summary>Skills this cycle</summary>
      <dl class="notes">
        <dt>Handstand (warm-up)</dt><dd>${esc(skills.hs)}</dd>
        ${hasEmom ? `<dt>Muscle-up drill</dt><dd>${esc(skills.mu)}</dd><dt>L-sit</dt><dd>${esc(skills.lsit)}</dd>` : ''}
      </dl>
    </details>`}
  </article>`;
}

function mtBoard(p) {
  const logged = store.byType('mt').find((e) => e.date === p.date);
  const light = p.key === 'mt-light';
  return `<article class="board b-mt">
    <header class="board-head">
      <p class="board-label">Muay Thai</p>
      <h2>Class 17:00–18:00</h2>
      <p class="board-meta">Week ${p.week} (${p.w.type})${light ? ', taper week' : ''}</p>
    </header>
    ${light ? '<p class="callout">Taper week: technique and light sparring only, if the class runs.</p>' : ''}
    <section class="plain">
      <h3>Before class, 5 min</h3>
      <ul>${BEFORE_MT.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <h3>Fuel</h3>
      <p>Light carbs 60–90 min before: a banana, toast with honey or rice cakes. Protein and carbs within 2 h after.</p>
    </section>
    <button type="button" class="btn ${logged ? 'secondary' : 'primary'} block" data-action="log-mt" data-date="${p.date}" ${logged ? `data-id="${logged.id}"` : ''}>${logged ? 'Class logged, tap to undo' : 'Log class'}</button>
  </article>`;
}

function restBoard(p) {
  const isSunday = p.wd === 6;
  const bLine = p.key === 'rest-b' ? '<p class="callout">No class on Fridays in B weeks, so you go into Saturday\'s heavy deadlift rested.</p>' : '';
  return `<article class="board b-rest">
    <header class="board-head">
      <p class="board-label">${isSunday ? 'Sunday' : 'Rest day'}</p>
      <h2>Rest</h2>
      <p class="board-meta">Week ${p.week} (${p.w.type})</p>
    </header>
    ${bLine}
    <section class="plain"><ul>${REST_DAY.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
    ${isSunday ? `<section class="plain"><h3>Sunday check-in</h3><p>Log this morning's bodyweight, then look at Progress: your week's best e1RMs and 7-day average weight are already there.</p></section>
    <a class="btn secondary block" href="#/log?date=${p.date}&tab=bw">Log bodyweight</a>` : ''}
  </article>`;
}

function testBoard(p) {
  if (p.key === 'testCal') {
    return `<article class="board b-test">
      <header class="board-head"><p class="board-label">Test day, optional</p><h2>Calisthenics</h2><p class="board-meta">Morning, fresh</p></header>
      <section class="plain"><ul>${SESSIONS.testCal.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
      <a class="btn primary block" href="#/log?date=${p.date}&tab=skill">Log results</a>
    </article>`;
  }
  const lifts = SESSIONS[p.key].lifts;
  const rows = lifts.map((l) => `<tr><th scope="row">${esc(LIFTS[l].short)}</th>${TEST.attempts[l].map((a) => `<td class="num">${esc(a)} kg</td>`).join('')}</tr>`).join('');
  return `<article class="board b-test">
    <header class="board-head"><p class="board-label">Test day</p><h2>${esc(SESSIONS[p.key].title)}</h2><p class="board-meta">Rest 4–5 min between attempts</p></header>
    <div class="table-wrap"><table><thead><tr><th scope="col">Lift</th><th scope="col">Opener</th><th scope="col">2nd</th><th scope="col">3rd</th></tr></thead><tbody>${rows}</tbody></table></div>
    <h3 class="sub">Next attempt, by how the last one felt</h3>
    <div class="table-wrap"><table><thead><tr><th scope="col">Felt</th><th scope="col">Squat or deadlift</th><th scope="col">Bench</th></tr></thead><tbody>
      ${TEST.jumps.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="small">Warm up as usual without handstands, then bar × 8, 50% × 5, 70% × 3 and 85% × 1 of your opener. Take a 4th attempt only if the 3rd was RPE 8 or easier.</p>
    <a class="btn primary block" href="#/log?date=${p.date}&session=${p.key}">Log attempts</a>
  </article>`;
}

function board(p) {
  const k = dayKind(p.key);
  if (k === 'gym') return gymBoard(p);
  if (k === 'mt') return mtBoard(p);
  if (k === 'rest') return restBoard(p);
  if (k === 'test') return testBoard(p);
  return `<article class="board b-rest"><header class="board-head"><h2>Plan complete</h2></header><p>The semester block ended on 31 December. See Progress for how it went.</p></article>`;
}

function nextUp(p) {
  const k = dayKind(p.key);
  if (k === 'gym' || k === 'test') return '';
  const next = upcomingGymDay(addDays(p.date, 1));
  if (!next || !next.session) return '';
  const s = next.session;
  const firstMain = (s.exercises || []).find((ex) => ex.main);
  let line = '';
  if (firstMain) {
    const pl = planned(firstMain.main, next.week, firstMain.variant);
    if (pl && pl.top) line = `${firstMain.n} ${fmtKg(pl.top.kg)} kg × ${pl.top.reps}, RPE ${pl.rpe}`;
    else if (pl && pl.bo) line = `${firstMain.n} ${pl.bo.sets} × ${pl.bo.reps} at ${fmtKg(pl.bo.kg)} kg`;
  }
  return `<button type="button" class="next-up" data-go="${next.date}">
    <span class="next-when">Next gym day, ${esc(fmtLong(next.date))}</span>
    <span class="next-what">${esc(s.label)}: ${esc(s.title)}</span>
    ${line ? `<span class="next-detail">${esc(line)}</span>` : ''}
  </button>`;
}

function suggestionList() {
  const list = suggestions();
  if (!list.length) return '';
  return `<section class="suggest"><h3>From your log</h3>${list.slice(0, 3).map((s, i) => `<div class="suggest-item tone-${s.tone}"><p>${esc(s.text)}</p>${s.action ? `<button type="button" class="btn small" data-action="apply-adj" data-i="${i}">Apply</button>` : ''}</div>`).join('')}</section>`;
}

export function renderToday(root) {
  const t = todayStr();
  const fromHash = qs('d');
  if (fromHash && /^\d{4}-\d{2}-\d{2}$/.test(fromHash)) selected = clampDate(fromHash);
  if (!selected) selected = clampDate(t);
  const p = dayPlan(selected);
  const viewWeek = p.week;
  const w = weekInfo(viewWeek);
  const nowWeek = weekOf(t);
  let headline;
  if (nowWeek === 0) {
    const days = dayNumber(START) - dayNumber(t);
    headline = `<h1>Starts Monday 5 October</h1><p class="lede">${days === 1 ? 'Tomorrow' : `In ${days} days`}. Here's week 1, so you know what's coming.</p>`;
  } else if (nowWeek === 14) {
    headline = `<h1>Semester block done</h1><p class="lede">Check Progress for your test results.</p>`;
  } else {
    const nw = weekInfo(nowWeek);
    headline = `<h1>Week ${nowWeek} of 13</h1><p class="lede">${esc(TYPE_INFO[nw.type].name)}, ${esc(TYPE_INFO[nw.type].what)}${nw.test ? '' : `, ${CYCLES[nw.cycle] ? CYCLES[nw.cycle].name + ' cycle' : ''}`}${nw.deload ? ', deload' : ''}${nw.taper ? ', taper' : ''}.</p>`;
  }
  root.innerHTML = `<div class="wrap view-today">
    <section class="intro">${headline}${rotationStrip(viewWeek)}</section>
    <div class="weeknav">
      <button type="button" class="icon-btn" data-nav="-1" aria-label="Previous week" ${viewWeek <= 1 ? 'disabled' : ''}>‹</button>
      <p class="weeknav-label"><strong>Week ${viewWeek}</strong> <span>${esc(fmtRange(weekStart(viewWeek), viewWeek === 13 ? END : addDays(weekStart(viewWeek), 6)))}, ${esc(w.test ? 'test week' : TYPE_INFO[w.type].name)}</span></p>
      <button type="button" class="icon-btn" data-nav="1" aria-label="Next week" ${viewWeek >= 13 ? 'disabled' : ''}>›</button>
    </div>
    ${weekDays(viewWeek)}
    <p class="selected-date">${esc(fmtLong(selected))}${selected === t ? ' (today)' : ''}</p>
    ${board(p)}
    ${nextUp(p)}
    ${suggestionList()}
  </div>`;

  root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
    selected = b.dataset.go;
    history.replaceState(null, '', `#/today?d=${selected}`);
    renderToday(root);
  }));
  root.querySelectorAll('[data-week]').forEach((b) => b.addEventListener('click', () => {
    const n = Number(b.dataset.week);
    selected = clampDate(addDays(weekStart(n), Math.min(weekday(selected), n === 13 ? 3 : 6)));
    history.replaceState(null, '', `#/today?d=${selected}`);
    renderToday(root);
  }));
  root.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    const n = Math.min(13, Math.max(1, viewWeek + Number(b.dataset.nav)));
    selected = clampDate(addDays(weekStart(n), Math.min(weekday(selected), n === 13 ? 3 : 6)));
    history.replaceState(null, '', `#/today?d=${selected}`);
    renderToday(root);
  }));
  root.querySelectorAll('[data-action="log-mt"]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.id) {
      store.remove(b.dataset.id);
      toast('Class removed from the log');
    } else {
      store.add({ type: 'mt', date: b.dataset.date, time: '17:00' });
      toast('Class logged');
    }
  }));
  const list = suggestions();
  root.querySelectorAll('[data-action="apply-adj"]').forEach((b) => b.addEventListener('click', () => {
    const s = list[Number(b.dataset.i)];
    if (!s || !s.action) return;
    store.add({ type: 'adj', date: todayStr(), ...s.action });
    toast(`${LIFTS[s.action.lift].short}: ${s.action.kg > 0 ? '+' : ''}${s.action.kg} kg from week ${s.action.fromWeek}`);
  }));
}

export function resetTodaySelection() {
  selected = null;
}
