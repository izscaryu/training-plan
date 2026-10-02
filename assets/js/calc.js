// Pure helpers: dates, estimated maxes, plate maths. No DOM in here.

export const START = '2026-10-05';
export const END = '2026-12-31';

// ---------- dates (all date maths in UTC days, so DST never shifts a week) ----------

export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

export function dayNumber(s) {
  const { y, m, d } = parseDate(s);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function fromDayNumber(n) {
  const dt = new Date(n * 86400000);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(s, n) {
  return fromDayNumber(dayNumber(s) + n);
}

export function todayStr() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

// 0 = Monday ... 6 = Sunday
export function weekday(s) {
  const js = new Date(dayNumber(s) * 86400000).getUTCDay(); // 0 = Sunday
  return (js + 6) % 7;
}

// Week 1 starts Mon Oct 5. Returns 0 before the plan, 14 after it.
export function weekOf(s) {
  const diff = dayNumber(s) - dayNumber(START);
  if (diff < 0) return 0;
  if (dayNumber(s) > dayNumber(END)) return 14;
  return Math.floor(diff / 7) + 1;
}

export function weekStart(n) {
  return addDays(START, (n - 1) * 7);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function fmtLong(s) {
  const { m, d } = parseDate(s);
  return `${DAY_NAMES[weekday(s)]} ${d} ${MONTHS[m - 1]}`;
}

export function fmtShort(s) {
  const { m, d } = parseDate(s);
  return `${d} ${MON_SHORT[m - 1]}`;
}

export function fmtRange(a, b) {
  const pa = parseDate(a), pb = parseDate(b);
  if (pa.m === pb.m) return `${MON_SHORT[pa.m - 1]} ${pa.d}–${pb.d}`;
  return `${MON_SHORT[pa.m - 1]} ${pa.d}–${MON_SHORT[pb.m - 1]} ${pb.d}`;
}

// ---------- estimated 1RM from the RPE chart ----------

// % of 1RM for 1..10 reps at a given RPE (common RIR-based powerlifting chart)
const CHART = {
  10: [100, 95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9],
  9.5: [97.8, 93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3],
  9: [95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7],
  8.5: [93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4],
  8: [92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0],
  7.5: [90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 66.7],
  7: [89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 65.3],
  6.5: [87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 66.7, 64.0],
  6: [86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 65.3, 62.6],
};

export function pctOf1RM(reps, rpe) {
  const r = Math.min(10, Math.max(6, Math.round(rpe * 2) / 2));
  const row = CHART[r] || CHART[String(r)];
  return row[reps - 1];
}

// Returns null when the inputs can't give a sensible estimate.
export function e1rm(kg, reps, rpe) {
  kg = Number(kg); reps = Number(reps);
  if (!kg || !reps || reps < 1) return null;
  const r = rpe === '' || rpe == null || Number.isNaN(Number(rpe)) ? 10 : Number(rpe);
  let est;
  if (reps <= 10) {
    est = kg / (pctOf1RM(reps, r) / 100);
  } else {
    const rir = Math.max(0, 10 - r);
    est = kg * (1 + (reps + rir) / 30); // Epley with reps in reserve
  }
  return Math.round(est * 2) / 2;
}

export function round25(x) {
  return Math.round(x / 2.5) * 2.5;
}

export function fmtKg(x) {
  if (x == null || Number.isNaN(x)) return '–';
  const v = Math.round(x * 100) / 100;
  return Number.isInteger(v) ? String(v) : String(v).replace(/0+$/, '');
}

// ---------- plates ----------

export const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export function platesPerSide(total, bar = 20, available = DEFAULT_PLATES) {
  const out = [];
  if (total < bar) return { plates: out, leftover: 0, belowBar: true };
  let rem = (total - bar) / 2;
  const sorted = [...available].sort((a, b) => b - a);
  for (const p of sorted) {
    while (rem >= p - 1e-9) {
      out.push(p);
      rem = Math.round((rem - p) * 1000) / 1000;
    }
  }
  return { plates: out, leftover: rem, belowBar: false };
}

// ---------- small stats ----------

export function rollingMean(points, days = 7) {
  // points: [{day: dayNumber, v}], sorted by day. Mean of entries within the last `days` days.
  return points.map((p) => {
    const win = points.filter((q) => q.day <= p.day && q.day > p.day - days);
    const mean = win.reduce((s, q) => s + q.v, 0) / win.length;
    return { day: p.day, v: Math.round(mean * 10) / 10 };
  });
}
