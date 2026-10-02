// Plan logic: what's on a given day, planned loads (with your adjustments), the planned e1RM curve,
// what you've logged per week, and rule-based suggestions.

import { WEEKS, LAYOUTS, SESSIONS, PROG, LIFTS, GOALS, START_MAX, BW_BAND } from './plan.js';
import { weekOf, weekday, e1rm, round25, dayNumber, todayStr, addDays } from './calc.js';
import * as store from './store.js';

export function weekInfo(n) {
  return WEEKS[n - 1] || null;
}

export function layoutFor(n) {
  const w = weekInfo(n);
  if (!w) return null;
  if (w.test) return LAYOUTS.test;
  if (w.taper) return LAYOUTS.taper;
  return LAYOUTS[w.type];
}

export function dayPlan(date) {
  const week = weekOf(date);
  const wd = weekday(date);
  if (week === 0) return { date, week, wd, key: 'pre' };
  if (week === 14) return { date, week, wd, key: 'done' };
  const w = weekInfo(week);
  const key = layoutFor(week)[wd];
  return { date, week, wd, w, key, cycle: w.cycle, session: SESSIONS[key] || null };
}

export function dayKind(key) {
  if (!key) return 'none';
  if (key.startsWith('mt')) return 'mt';
  if (key === 'rest' || key === 'rest-b') return 'rest';
  if (key.startsWith('test')) return 'test';
  if (key === 'pre' || key === 'done') return 'none';
  return 'gym';
}

// ---------- adjustments ----------

export function adjustments() {
  return store.byType('adj').sort((a, b) => a.fromWeek - b.fromWeek || (a.createdAt < b.createdAt ? -1 : 1));
}

export function adjFor(lift, week) {
  return adjustments().filter((a) => a.lift === lift && a.fromWeek <= week).reduce((s, a) => s + Number(a.kg || 0), 0);
}

// Planned prescription for a lift in a week, with adjustments applied.
export function planned(lift, week, variant) {
  const base = PROG[lift] && PROG[lift][week];
  if (!base) return null;
  const src = variant === 'sat' && base.sat ? base.sat : base;
  const adj = adjFor(lift, week);
  const out = { rpe: src.rpe, t: src.t ?? null, note: src.note || base.note || null, adj };
  out.top = variant !== 'sat' && src.top
    ? { kg: src.top[0] + adj, reps: src.top[1], kgHi: base.topHi ? base.topHi + adj : null }
    : null;
  out.bo = src.bo ? { sets: src.bo[0], reps: src.bo[1], kg: src.bo[2] + adj } : null;
  return out;
}

export function setsFor(ex, cycle) {
  if (ex.sets && typeof ex.sets === 'object') return ex.sets[Math.min(cycle, 4)] || ex.sets[1];
  if (ex.acc && cycle === 4 && typeof ex.sets === 'string') {
    return ex.sets.replace(/^(\d+)(\s*×)/, (m, n, rest) => `${Math.max(1, Number(n) - 1)}${rest}`);
  }
  return ex.sets || '';
}

export function setsAllCycles(ex) {
  if (ex.sets && typeof ex.sets === 'object') {
    const vals = [1, 2, 3, 4].map((c) => ex.sets[c]);
    if (vals.every((v) => v === vals[0])) return vals[0];
    // group equal neighbours: C1–C3 3 × 8/leg, C4 2 × 6/leg
    const parts = [];
    let start = 1;
    for (let c = 2; c <= 5; c++) {
      if (c === 5 || vals[c - 1] !== vals[start - 1]) {
        parts.push(`${start === c - 1 ? `C${start}` : `C${start}–C${c - 1}`} ${vals[start - 1]}`);
        start = c;
      }
    }
    return parts.join(', ');
  }
  if (ex.acc && typeof ex.sets === 'string' && /^\d+\s*×/.test(ex.sets)) {
    return `${ex.sets} (C4: ${setsFor(ex, 4)})`;
  }
  return ex.sets || '';
}

// ---------- planned and logged e1RM ----------

export const MAIN = ['squat', 'bench', 'deadlift'];

export function plannedCurve(lift) {
  const pts = [{ week: 0, v: START_MAX[lift], label: 'Start' }];
  // week 1 is a deliberately easy calibration week, so the curve starts at week 2
  for (let w = 2; w <= 12; w++) {
    const p = planned(lift, w);
    if (p && p.top && p.t) pts.push({ week: w, v: e1rm(p.top.kg, p.top.reps, p.t) });
  }
  pts.push({ week: 13, v: GOALS[lift].projected + adjFor(lift, 12), label: 'Test' });
  return pts;
}

export function liftEntries(lift) {
  return store.byType('lift').filter((e) => e.lift === lift).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.createdAt < b.createdAt ? -1 : 1)));
}

// An estimate needs an RPE; a made test attempt without one counts as a true max (RPE 10).
export function entryE1rm(e) {
  if (!e || !e.kg || !e.reps) return null;
  if ((e.rpe === '' || e.rpe == null) && e.kind !== 'test') return null;
  return e1rm(e.kg, e.reps, e.rpe);
}

export function bestByWeek(lift) {
  const out = new Map();
  for (const e of liftEntries(lift)) {
    const w = weekOf(e.date);
    if (w < 1 || w > 13) continue;
    const v = entryE1rm(e);
    if (v == null) continue;
    const cur = out.get(w);
    if (!cur || v > cur.v) out.set(w, { week: w, v, entry: e });
  }
  return [...out.values()].sort((a, b) => a.week - b.week);
}

export function bestEver(lift) {
  let best = null;
  for (const e of liftEntries(lift)) {
    const v = entryE1rm(e);
    if (v != null && (!best || v > best.v)) best = { v, entry: e };
  }
  return best;
}

export function heaviestSingle(lift) {
  let best = null;
  for (const e of liftEntries(lift)) {
    if (Number(e.reps) === 1 && (!best || e.kg > best.kg)) best = e;
  }
  return best;
}

// ---------- bodyweight ----------

export function bwPoints() {
  return store.byType('bw')
    .map((e) => ({ day: dayNumber(e.date), date: e.date, v: Number(e.kg), entry: e }))
    .filter((p) => p.v > 0)
    .sort((a, b) => a.day - b.day);
}

export function bwAverage(endDate = todayStr(), days = 7) {
  const end = dayNumber(endDate);
  const pts = bwPoints().filter((p) => p.day <= end && p.day > end - days);
  if (!pts.length) return null;
  return Math.round((pts.reduce((s, p) => s + p.v, 0) / pts.length) * 10) / 10;
}

// ---------- weekly summary ----------

export function weekSummary() {
  const rows = [];
  const bw = bwPoints();
  const mts = store.byType('mt');
  for (let w = 1; w <= 13; w++) {
    const wbw = bw.filter((p) => weekOf(p.date) === w);
    const row = {
      week: w,
      type: weekInfo(w).type,
      bw: wbw.length ? Math.round((wbw.reduce((s, p) => s + p.v, 0) / wbw.length) * 10) / 10 : null,
      mt: mts.filter((e) => weekOf(e.date) === w).length,
    };
    for (const lift of MAIN) {
      const b = bestByWeek(lift).find((x) => x.week === w);
      row[lift] = b ? b.v : null;
    }
    rows.push(row);
  }
  return rows;
}

export function hasAnyLog() {
  return store.all().some((e) => e.type !== 'adj');
}

// ---------- rule-based suggestions ----------

function topEntries(lift) {
  return liftEntries(lift).filter((e) => e.kind === 'top' && e.rpe !== '' && e.rpe != null);
}

export function suggestions() {
  const out = [];
  const adj = adjustments();
  for (const lift of MAIN) {
    const tops = topEntries(lift).filter((e) => {
      const w = weekOf(e.date);
      return w >= 1 && w <= 11;
    });
    if (!tops.length) continue;
    const last = tops[tops.length - 1];
    const w = weekOf(last.date);
    const p = planned(lift, w);
    if (!p || !p.t) continue;
    const handled = adj.some((a) => a.lift === lift && a.createdAt > last.createdAt);
    if (handled) continue;
    const step = LIFTS[lift].step;
    const diff = Number(last.rpe) - p.t;
    const name = LIFTS[lift].short;
    if (w === 1 && Number(last.rpe) <= 5) {
      out.push({ lift, tone: 'up', text: `${name}: week 1 top set was RPE ${last.rpe}, so you're stronger than the plan assumes. Add ${step} kg from week 2.`, action: { lift, kg: step, fromWeek: 2, note: `Week 1 calibration (RPE ${last.rpe})` } });
    } else if (w === 1 && Number(last.rpe) >= 8) {
      out.push({ lift, tone: 'down', text: `${name}: week 1 top set was RPE ${last.rpe}, harder than planned. Take ${step} kg off from week 2.`, action: { lift, kg: -step, fromWeek: 2, note: `Week 1 calibration (RPE ${last.rpe})` } });
    } else if (diff <= -1.5 && w < 12) {
      out.push({ lift, tone: 'up', text: `${name}: week ${w} top set was RPE ${last.rpe} against a target of ${p.rpe}. Add ${step} kg from week ${w + 1}.`, action: { lift, kg: step, fromWeek: w + 1, note: `Top set RPE ${last.rpe} in week ${w}` } });
    } else if (tops.length >= 2) {
      const prev = tops[tops.length - 2];
      const pw = weekOf(prev.date);
      const pp = planned(lift, pw);
      if (pp && pp.t && Number(prev.rpe) - pp.t >= 1 && diff >= 1) {
        out.push({ lift, tone: 'down', text: `${name}: two top sets in a row came in harder than planned. Repeat this week's numbers next time; if it happens again, drop ${step} kg.`, action: { lift, kg: -step, fromWeek: Math.min(12, w + 1), note: 'Stall rule' } });
      }
    }
  }
  const avg14 = bwAverage(todayStr(), 14);
  const count14 = bwPoints().filter((p) => p.day > dayNumber(todayStr()) - 14).length;
  if (avg14 != null && count14 >= 7) {
    if (avg14 < BW_BAND[0]) out.push({ tone: 'info', text: `Bodyweight: your 2-week average is ${avg14} kg, under the ${BW_BAND[0]}–${BW_BAND[1]} kg band. Add 150–250 kcal a day, mostly carbs.` });
    if (avg14 > BW_BAND[1] + 0.5) out.push({ tone: 'info', text: `Bodyweight: your 2-week average is ${avg14} kg, over the band. If you're not on creatine, eat 150–250 kcal a day less.` });
  }
  return out;
}

export function upcomingGymDay(from = todayStr()) {
  for (let i = 0; i < 14; i++) {
    const d = addDays(from, i);
    const p = dayPlan(d);
    if (dayKind(p.key) === 'gym' || dayKind(p.key) === 'test') return p;
  }
  return null;
}

export { round25 };
