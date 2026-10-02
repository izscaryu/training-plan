// Small hand-rolled SVG charts. Colours come from CSS classes so light/dark both work.

import { esc } from './md.js';
import { START, END, dayNumber, fmtShort, fmtKg, fromDayNumber } from './calc.js';

function niceTicks(lo, hi, count = 4) {
  const span = hi - lo;
  const raw = span / count;
  const steps = [1, 2, 2.5, 5, 10, 20, 25, 50];
  const step = steps.find((s) => s >= raw) || 50;
  const start = Math.ceil(lo / step) * step;
  const ticks = [];
  for (let v = start; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

// lift chart: planned e1RM curve (grey), your weekly best (blue), goal (dashed reference)
export function liftChart({ title, planned, logged, goal, goalLabel }) {
  const W = 360, H = 210, L = 34, R = 60, T = 16, B = 26;
  const values = [...planned.map((p) => p.v), ...logged.map((p) => p.v), goal];
  const lo = Math.floor(Math.min(...values) - 3);
  const hi = Math.ceil(Math.max(...values) + 3);
  const X = (w) => L + (w / 13) * (W - L - R);
  const Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const ticks = niceTicks(lo, hi, 4);

  const grid = ticks.map((t) => `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-tick" x="${L - 8}" y="${Y(t) + 4}" text-anchor="end">${fmtKg(t)}</text>`).join('');
  const xt = [[0, 'Start'], [3, 'W3'], [6, 'W6'], [9, 'W9'], [13, 'Test']]
    .map(([w, l]) => `<text class="c-tick" x="${X(w)}" y="${H - 8}" text-anchor="middle">${l}</text>`).join('');

  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.week).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
  const planLine = `<path class="c-plan" d="${path(planned)}"/>` +
    planned.map((p) => `<circle class="c-plan-dot" cx="${X(p.week)}" cy="${Y(p.v)}" r="2.5"><title>Plan, ${p.label || 'week ' + p.week}: ${fmtKg(p.v)} kg</title></circle>`).join('');
  const goalLine = `<line class="c-goal" x1="${L}" x2="${W - R}" y1="${Y(goal)}" y2="${Y(goal)}"/><text class="c-goal-label" x="${W - R + 6}" y="${Y(goal) + 4}">${esc(goalLabel)}</text>`;

  let logLine = '';
  if (logged.length) {
    logLine = (logged.length > 1 ? `<path class="c-log" d="${path(logged)}"/>` : '') +
      logged.map((p) => `<g class="c-hit"><circle class="c-log-dot" cx="${X(p.week)}" cy="${Y(p.v)}" r="4.5"/><circle cx="${X(p.week)}" cy="${Y(p.v)}" r="12" fill="transparent"><title>Week ${p.week}: best e1RM ${fmtKg(p.v)} kg</title></circle></g>`).join('');
    const last = logged[logged.length - 1];
    logLine += `<text class="c-end-label" x="${Math.max(X(last.week), L + 12)}" y="${Y(last.v) - 11}" text-anchor="middle">${fmtKg(last.v)}</text>`;
  }

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${grid}${xt}${goalLine}${planLine}${logLine}</svg>`;
}

// bodyweight chart: daily weigh-ins (small grey), 7-day average (blue), target band (tint)
export function bwChart({ points, avg, band }) {
  const W = 360, H = 190, L = 34, R = 12, T = 12, B = 26;
  const d0 = Math.min(dayNumber(START) - 3, ...(points.length ? [points[0].day] : []));
  const d1 = Math.max(dayNumber(END), ...(points.length ? [points[points.length - 1].day] : []));
  const vals = points.map((p) => p.v);
  const lo = Math.floor(Math.min(band[0] - 1, ...vals) * 2) / 2;
  const hi = Math.ceil(Math.max(band[1] + 1, ...vals) * 2) / 2;
  const X = (d) => L + ((d - d0) / (d1 - d0)) * (W - L - R);
  const Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const ticks = niceTicks(lo, hi, 4);
  const grid = ticks.map((t) => `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-tick" x="${L - 8}" y="${Y(t) + 4}" text-anchor="end">${fmtKg(t)}</text>`).join('');
  const months = ['2026-10-05', '2026-11-02', '2026-11-30', '2026-12-28']
    .map((d) => `<text class="c-tick" x="${X(dayNumber(d))}" y="${H - 8}" text-anchor="middle">${fmtShort(d)}</text>`).join('');
  const bandRect = `<rect class="c-band" x="${L}" width="${W - L - R}" y="${Y(band[1])}" height="${Y(band[0]) - Y(band[1])}"/>`;
  const dots = points.map((p) => `<circle class="c-bw-dot" cx="${X(p.day)}" cy="${Y(p.v)}" r="2.5"><title>${fmtShort(fromDayNumber(p.day))}: ${fmtKg(p.v)} kg</title></circle>`).join('');
  const line = avg.length > 1 ? `<path class="c-log" d="${avg.map((p, i) => `${i ? 'L' : 'M'}${X(p.day).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ')}"/>` : '';
  let label = '';
  if (avg.length) {
    const last = avg[avg.length - 1];
    label = `<text class="c-end-label" x="${Math.min(Math.max(X(last.day), L + 14), W - R - 14)}" y="${Y(last.v) - 10}" text-anchor="middle">${fmtKg(last.v)}</text>`;
  }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bodyweight, 7-day average against the target band">${bandRect}${grid}${months}${dots}${line}${label}</svg>`;
}
