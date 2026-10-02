// The plan as data. Numbers here drive the Today view, the Plan tables, logging defaults and the charts.

export const DOC_URL = 'https://claude.ai/code/artifact/1e66c504-e182-43dc-9147-7e64010e4baa';

export const START_MAX = { squat: 90, bench: 72.5, deadlift: 115 };

export const GOALS = {
  squat: { goal: 100, realistic: '100', stretch: 105, projected: 100 },
  bench: { goal: 80, realistic: '77.5', stretch: 80, projected: 77.5 },
  deadlift: { goal: 140, realistic: '130–135', stretch: 140, projected: 132.5 },
};

export const LIFTS = {
  squat: { name: 'Back squat', short: 'Squat', step: 5 },
  bench: { name: 'Bench press', short: 'Bench', step: 2.5 },
  paused: { name: 'Paused bench press', short: 'Paused bench', step: 2.5 },
  deadlift: { name: 'Deadlift', short: 'Deadlift', step: 5 },
};

// Other things you can log with kg × reps
export const EXTRA_LIFTS = {
  pullup: { name: 'Weighted pull-up', short: 'Weighted pull-up', added: true },
  dip: { name: 'Weighted dip', short: 'Weighted dip', added: true },
  ohp: { name: 'Strict overhead press', short: 'Overhead press' },
  other: { name: 'Other exercise', short: 'Other' },
};

export const CYCLES = {
  1: { name: 'Base', reps: '5s', weeks: 'W1–3' },
  2: { name: 'Build', reps: '4s', weeks: 'W4–6' },
  3: { name: 'Strength', reps: '3s', weeks: 'W7–9' },
  4: { name: 'Peak', reps: 'singles', weeks: 'W10–12' },
};

export const WEEKS = [
  { n: 1, type: 'A', cycle: 1 },
  { n: 2, type: 'B', cycle: 1 },
  { n: 3, type: 'C', cycle: 1, deload: true },
  { n: 4, type: 'A', cycle: 2 },
  { n: 5, type: 'B', cycle: 2 },
  { n: 6, type: 'C', cycle: 2, deload: true },
  { n: 7, type: 'A', cycle: 3 },
  { n: 8, type: 'B', cycle: 3 },
  { n: 9, type: 'C', cycle: 3, deload: true },
  { n: 10, type: 'A', cycle: 4 },
  { n: 11, type: 'B', cycle: 4 },
  { n: 12, type: 'C', cycle: 4, taper: true },
  { n: 13, type: 'T', cycle: 5, test: true },
];

export const TYPE_INFO = {
  A: { name: 'Week A', what: '3 gym + 3 Muay Thai', role: 'moderate lifting' },
  B: { name: 'Week B', what: '3 gym + 2 Muay Thai', role: 'heaviest lifting' },
  C: { name: 'Week C', what: '2 gym + 3 Muay Thai', role: 'deload' },
  T: { name: 'Test week', what: 'tests Dec 28 and 30', role: 'test' },
};

// Monday ... Sunday
export const LAYOUTS = {
  A: ['mt', 'D1', 'mt', 'D2', 'mt', 'D3', 'rest'],
  B: ['mt', 'D1', 'mt', 'D2', 'rest-b', 'D3', 'rest'],
  C: ['mt', 'X', 'mt', 'rest', 'mt', 'Y', 'rest'],
  taper: ['mt-light', 'XT', 'mt-light', 'rest', 'rest', 'YT', 'rest'],
  test: ['testSB', 'rest', 'testD', 'testCal', 'done', 'done', 'done'],
};

// top: [kg, reps] · topHi: upper end of a range · bo: [sets, reps, kg] · t: target RPE as a number
export const PROG = {
  squat: {
    1: { top: [70, 5], bo: [3, 5, 62.5], rpe: '6–7', t: 6.5 },
    2: { top: [72.5, 5], bo: [2, 5, 65], rpe: '7–8', t: 7.5 },
    3: { bo: [3, 3, 65], rpe: '6 or less' },
    4: { top: [75, 4], bo: [3, 4, 67.5], rpe: '7', t: 7 },
    5: { top: [80, 4], bo: [2, 4, 72.5], rpe: '8', t: 8 },
    6: { bo: [3, 3, 70], rpe: '6 or less' },
    7: { top: [82.5, 3], bo: [3, 3, 75], rpe: '7.5–8', t: 7.75 },
    8: { top: [85, 3], bo: [2, 3, 77.5], rpe: '8.5', t: 8.5 },
    9: { bo: [3, 2, 75], rpe: '6 or less' },
    10: { top: [90, 1], bo: [3, 2, 80], rpe: '8', t: 8 },
    11: { top: [92.5, 1], topHi: 95, bo: [2, 2, 82.5], rpe: '8.5–9', t: 8.75 },
    12: { top: [87.5, 1], bo: [2, 2, 77.5], rpe: '7 max', t: 7, sat: { bo: [2, 2, 70], rpe: 'easy' } },
  },
  bench: {
    1: { top: [55, 5], bo: [3, 5, 50], rpe: '6', t: 6 },
    2: { top: [57.5, 5], bo: [2, 5, 52.5], rpe: '7', t: 7 },
    3: { bo: [3, 3, 55], rpe: '6 or less' },
    4: { top: [60, 4], bo: [3, 4, 55], rpe: '7', t: 7 },
    5: { top: [62.5, 4], bo: [2, 4, 57.5], rpe: '8', t: 8 },
    6: { bo: [3, 3, 57.5], rpe: '6 or less' },
    7: { top: [65, 3], bo: [3, 3, 57.5], rpe: '8', t: 8 },
    8: { top: [67.5, 3], bo: [2, 3, 60], rpe: '8.5', t: 8.5 },
    9: { bo: [3, 2, 60], rpe: '6 or less' },
    10: { top: [70, 1], bo: [3, 2, 62.5], rpe: '7.5', t: 7.5 },
    11: { top: [72.5, 1], topHi: 75, bo: [2, 2, 62.5], rpe: '8.5–9', t: 8.75 },
    12: { top: [67.5, 1], bo: [2, 2, 60], rpe: '7 max', t: 7 },
  },
  paused: {
    1: { bo: [3, 6, 47.5], rpe: '6', t: 6 },
    2: { bo: [3, 6, 50], rpe: '7', t: 7 },
    3: { bo: [2, 5, 47.5], rpe: '6 or less' },
    4: { bo: [3, 5, 52.5], rpe: '7', t: 7 },
    5: { bo: [3, 5, 55], rpe: '7.5', t: 7.5 },
    6: { bo: [2, 4, 52.5], rpe: '6 or less' },
    7: { bo: [3, 4, 55], rpe: '7', t: 7 },
    8: { bo: [3, 4, 57.5], rpe: '7.5', t: 7.5 },
    9: { bo: [2, 3, 55], rpe: '6 or less' },
    10: { bo: [3, 3, 60], rpe: '7.5', t: 7.5 },
    11: { bo: [2, 3, 60], rpe: '7.5', t: 7.5 },
    12: { bo: [3, 1, 62.5], rpe: '6', t: 6, note: 'Saturday, fast' },
  },
  deadlift: {
    1: { top: [87.5, 5], bo: [2, 5, 80], rpe: '6–7', t: 6.5 },
    2: { top: [92.5, 5], bo: [2, 5, 82.5], rpe: '7–8', t: 7.5 },
    3: { bo: [2, 3, 80], rpe: '6 or less' },
    4: { top: [97.5, 4], bo: [2, 4, 87.5], rpe: '7', t: 7 },
    5: { top: [102.5, 4], bo: [2, 4, 92.5], rpe: '8', t: 8 },
    6: { bo: [2, 3, 87.5], rpe: '6 or less' },
    7: { top: [105, 3], bo: [2, 3, 95], rpe: '7.5', t: 7.5 },
    8: { top: [110, 3], bo: [2, 3, 100], rpe: '8.5', t: 8.5 },
    9: { bo: [2, 2, 95], rpe: '6 or less' },
    10: { top: [117.5, 1], bo: [2, 2, 102.5], rpe: '8', t: 8 },
    11: { top: [122.5, 1], topHi: 125, bo: [1, 2, 107.5], rpe: '8.5–9', t: 8.75 },
    12: { bo: [2, 2, 100], rpe: '6', t: 6, note: 'Saturday, fast' },
  },
};

export const TEST = {
  days: [
    { date: '2026-12-28', what: 'Squat, then bench 20–30 min later' },
    { date: '2026-12-29', what: 'Rest or an easy walk' },
    { date: '2026-12-30', what: 'Deadlift' },
    { date: '2026-12-31', what: 'Calisthenics test, morning (optional)' },
  ],
  attempts: {
    squat: ['90', '95', '100'],
    bench: ['70', '75', '77.5–80'],
    deadlift: ['117.5–120', '127.5', '132.5–135'],
  },
  jumps: [
    ['RPE 7 or easier', '+7.5–10 kg', '+5 kg'],
    ['RPE 8', '+5 kg', '+2.5 kg'],
    ['RPE 9', '+2.5 kg', '+1.25–2.5 kg'],
    ['RPE 9.5–10, or form broke', "Stop: that's your max", 'Stop'],
  ],
};

// Exercises: g = order/superset label, main = lift key from PROG, sets = text or per-cycle object,
// acc = accessory that loses one set in the Peak cycle, track = loggable with kg × reps.
export const SESSIONS = {
  D1: {
    label: 'Day 1', title: 'Squat', kind: 'gym', length: '75–85 min',
    exercises: [
      { g: '1', n: 'Warm-up + handstand', sets: '15 min', load: 'Standard warm-up' },
      { g: '2a', n: 'Box jump', sets: '4 × 3', load: 'Highest box you land softly on', rest: '60 s', acc: true },
      { g: '2b', n: 'Med-ball rotational scoop toss', sets: '3 × 4/side', load: '4–6 kg, max intent', rest: '60 s', acc: true },
      { g: '3', n: 'Back squat', main: 'squat', rest: '3–4 min, then 2–3 min' },
      { g: '4', n: 'Paused bench press', main: 'paused', rest: '2–3 min' },
      { g: '5a', n: 'Weighted pull-up', sets: { 1: '4 × 5', 2: '4 × 4', 3: '4 × 3', 4: '3 × 3' }, load: 'RPE 8, start +5 kg', rest: '90 s', track: 'pullup' },
      { g: '5b', n: 'Copenhagen plank', sets: '3 × 20–30 s/side', load: 'Knee on bench, then ankle', rest: '60 s', acc: true },
      { g: '6a', n: 'Leg curl', sets: '3 × 10–12', load: 'RIR 2', rest: '45 s', acc: true },
      { g: '6b', n: 'Hanging knee raise', sets: '3 × 10–15', load: 'Strict; toes-to-bar when easy', rest: '45 s', acc: true },
      { g: '6c', n: 'Face pull', sets: '3 × 15', load: 'Light', rest: '60 s', acc: true },
      { g: '7a', n: 'Neck flexion + extension', sets: '2 × 15–20 each', load: 'Plate or harness, light', rest: '45 s', acc: true },
      { g: '7b', n: 'Dead hang', sets: '2 × max', load: 'Aim for 60 s+', rest: '60 s', acc: true },
      { g: '8', n: 'Finisher (optional)', sets: '10 min max', load: 'See Finishers', finisher: true },
    ],
    notes: [
      ['Back squat', 'Big breath and brace before each rep, hip crease below the top of the knee, same depth every rep. Sub: front squat or safety-bar squat if your back is banged up.'],
      ['Paused bench', 'The bar stops dead on your chest for 1 s; shoulder blades pinned, feet planted. Sub: DB bench if a shoulder is sore.'],
      ['Box jump', "Step down, don't jump down (Achilles). Shins sore from Muay Thai: squat jumps instead."],
      ['Weighted pull-up', 'Dead hang to chin over the bar, no kip. Add 2.5 kg once every set is RPE 7 or less. Sub: heavy lat pulldown.'],
      ['Copenhagen plank', 'Protects the adductors you kick with. Sub: adductor machine 2 × 12.'],
      ['Leg curl', '3-second lowering. Sub: Nordic negatives 2 × 4 (expect soreness the first two times).'],
      ['Neck', 'Start at 2.5–5 kg with a towel under the plate, 2 s up and 2 s down. Add 1.25–2.5 kg when 20 reps are easy. Sub: hand-resistance isometrics 3 × 15 s per direction.'],
    ],
  },
  D2: {
    label: 'Day 2', title: 'Bench', kind: 'gym', length: '75–85 min',
    exercises: [
      { g: '1', n: 'Warm-up + handstand', sets: '15 min', load: 'Standard warm-up' },
      { g: '2a', n: 'Med-ball chest pass to wall', sets: '4 × 5', load: '4–6 kg, explosive', rest: '60 s', acc: true },
      { g: '2b', n: 'Explosive pull-up', sets: '4 × 3', load: 'Pull the bar to your chest', rest: '60–90 s', acc: true },
      { g: '3', n: 'Bench press', main: 'bench', rest: '3 min, then 2 min' },
      { g: '4', n: 'Bulgarian split squat', sets: { 1: '3 × 8/leg', 2: '3 × 8/leg', 3: '3 × 8/leg', 4: '2 × 6/leg' }, load: 'RPE 7, dumbbells', rest: '90 s' },
      { g: '5', n: 'EMOM 12 (4 rounds)', sets: 'Min 1 muscle-up drill, min 2 chest-supported DB row × 10, min 3 L-sit 15–20 s', load: 'Calisthenics skills', rest: 'Rest of the minute' },
      { g: '6a', n: 'Overhead cable triceps extension', sets: '3 × 10–12', load: 'RIR 2', rest: '45 s', acc: true },
      { g: '6b', n: 'DB lateral raise', sets: '3 × 12–15', load: 'RIR 1–2', rest: '45 s', acc: true },
      { g: '6c', n: 'Cable or band external rotation', sets: '2 × 15/side', load: 'Light', rest: '45 s', acc: true },
      { g: '7', n: 'Plate pinch', sets: '2 × 20–30 s', load: 'Two 10 kg plates, smooth side out', rest: '60 s', acc: true },
      { g: '8', n: 'Finisher (optional)', sets: '10 min max', load: 'See Finishers', finisher: true },
    ],
    notes: [
      ['Bench', 'Eyes under the bar, shoulder blades back and down, slight arch, feet planted, touch the lower chest, press back over the shoulders. Use safeties or a spotter on top sets. Sub: DB bench or floor press if a shoulder is irritated.'],
      ['Med-ball chest pass', 'Throw from the chest as hard as you can and catch the rebound. Sub: plyo push-ups 4 × 5.'],
      ['Explosive pull-up', 'Pull as high as possible, ideally bar to chest; end the set when the height drops.'],
      ['Bulgarian split squat', 'Rear foot on a bench, front shin near vertical, back knee down to a pad. Go light in week 1, because they make you sore. Sub: reverse lunge.'],
      ['EMOM', "Start each exercise on the minute and rest for what's left of it. Elbows complaining? Swap the muscle-up drill for band-assisted pull-ups for a week."],
      ['Lateral raise and external rotation', 'Shoulder endurance for holding your guard; strict and light.'],
    ],
  },
  D3: {
    label: 'Day 3', title: 'Deadlift', kind: 'gym', length: '75–85 min',
    exercises: [
      { g: '1', n: 'Warm-up + handstand', sets: '15 min', load: 'Standard warm-up' },
      { g: '2', n: 'Hang power clean', sets: { 1: '5 × 2', 2: '5 × 2', 3: '5 × 2', 4: '4 × 2' }, load: 'RPE 6–7, start ~50 kg', rest: '90 s' },
      { g: '3', n: 'Deadlift', main: 'deadlift', rest: '3–5 min, then 2–3 min' },
      { g: '4', n: 'Strict overhead press', sets: { 1: '3 × 6', 2: '3 × 5', 3: '3 × 4', 4: '3 × 3' }, load: 'RPE 7–8, start 35–37.5 kg', rest: '2 min', track: 'ohp' },
      { g: '5a', n: 'Weighted dip', sets: { 1: '3 × 6', 2: '3 × 5', 3: '3 × 4', 4: '3 × 4' }, load: 'RPE 7–8, start +10 kg', rest: '90 s', track: 'dip' },
      { g: '5b', n: 'Seated cable row', sets: '3 × 10', load: 'RIR 2', rest: '60 s', acc: true },
      { g: '5c', n: 'Ab wheel rollout from knees', sets: '3 × 8–10', load: 'Ribs down', rest: '60 s', acc: true },
      { g: '6a', n: 'DB curl', sets: '3 × 10–12', load: 'RIR 1–2', rest: '45 s', acc: true },
      { g: '6b', n: 'Standing calf raise', sets: '3 × 12–15', load: '1 s pause at the bottom', rest: '45 s', acc: true },
      { g: '6c', n: 'Band pull-apart', sets: '2 × 20', load: 'Light', rest: '30 s', acc: true },
      { g: '7a', n: 'Neck lateral flexion', sets: '2 × 15/side', load: 'Plate or band, light', rest: '45 s', acc: true },
      { g: '7b', n: 'Farmer carry', sets: '3 × 30–40 m', load: 'Heavy, 25–32 kg per hand', rest: '60 s', acc: true },
      { g: '8', n: 'Finisher (optional)', sets: '10 min max', load: 'Best day for it: Sunday is rest', finisher: true },
    ],
    notes: [
      ['Deadlift', 'Bar over mid-foot, shins to the bar, lats tight, push the floor away, finish with your glutes rather than leaning back. Double overhand for warm-ups, hook or mixed grip for heavy sets, straps fine on back-offs. Sub: trap-bar deadlift if your lower back is banged up.'],
      ['Hang power clean', 'Start at mid-thigh, fast elbows, catch high; stop when reps slow down. Sub: KB swing 4 × 10 (24–32 kg).'],
      ['Overhead press', 'Glutes and abs tight, bar close to your face, head through at the top. Sub: seated DB press.'],
      ['Dip', 'Shoulders down, slight forward lean, shoulder just below the elbow at the bottom if comfortable. Sub: close-grip bench 3 × 6.'],
      ['Ab wheel', 'Keep a slight hollow and stop before your hips sag. Sub: body saw or dead bug.'],
      ['Farmer carry', 'Tall posture, quick short steps. This is grip and trunk strength for the clinch.'],
    ],
  },
  X: {
    label: 'Session X', title: 'Squat + bench', kind: 'gym', length: 'about 70 min',
    exercises: [
      { g: '1', n: 'Warm-up + handstand', sets: '15 min', load: 'Standard warm-up' },
      { g: '2a', n: 'Box jump', sets: '3 × 3', load: 'Soft landing, step down', rest: '60 s' },
      { g: '2b', n: 'Med-ball chest pass to wall', sets: '3 × 5', load: '4–6 kg', rest: '60 s' },
      { g: '3', n: 'Back squat', main: 'squat', rest: '2–3 min' },
      { g: '4', n: 'Bench press', main: 'bench', rest: '2 min' },
      { g: '5a', n: 'Weighted pull-up', sets: { 1: '3 × 5', 2: '3 × 4', 3: '3 × 3', 4: '3 × 3' }, load: 'RPE 7', rest: '90 s', track: 'pullup' },
      { g: '5b', n: 'Copenhagen plank', sets: '2 × 20–30 s/side', load: 'Knee or ankle', rest: '60 s' },
      { g: '5c', n: 'Face pull', sets: '2 × 15', load: 'Light', rest: '45 s' },
      { g: '6', n: 'EMOM 8 (4 rounds)', sets: 'Min 1 muscle-up drill, min 2 L-sit 15–20 s', load: 'Calisthenics skills', rest: 'Rest of the minute' },
      { g: '7a', n: 'Neck flexion + extension', sets: '2 × 15 each', load: 'Light', rest: '45 s' },
      { g: '7b', n: 'Dead hang', sets: '1 × max', load: '', rest: '' },
    ],
    notes: [['Technique and substitutions', 'Same as Days 1–3. Accessories stay at RIR 3 (three reps left) this week; no finisher.']],
  },
  Y: {
    label: 'Session Y', title: 'Deadlift + paused bench', kind: 'gym', length: 'about 70 min',
    exercises: [
      { g: '1', n: 'Warm-up + handstand', sets: '15 min', load: 'Standard warm-up' },
      { g: '2a', n: 'KB swing', sets: '3 × 10', load: '24–32 kg, snappy', rest: '60 s' },
      { g: '2b', n: 'Med-ball rotational scoop toss', sets: '2 × 4/side', load: '4–6 kg', rest: '60 s' },
      { g: '3', n: 'Deadlift', main: 'deadlift', rest: '2–3 min' },
      { g: '4', n: 'Paused bench press', main: 'paused', rest: '2 min' },
      { g: '5a', n: 'Chest-supported DB row', sets: '2 × 10', load: 'RIR 3', rest: '60 s' },
      { g: '5b', n: 'Hanging knee raise', sets: '2 × 12', load: 'Strict', rest: '45 s' },
      { g: '5c', n: 'DB lateral raise', sets: '2 × 15', load: 'RIR 2–3', rest: '45 s' },
      { g: '6a', n: 'Leg curl', sets: '2 × 12', load: 'RIR 3', rest: '45 s' },
      { g: '6b', n: 'Triceps extension or DB curl (alternate weeks)', sets: '2 × 12', load: 'RIR 2–3', rest: '45 s' },
      { g: '6c', n: 'External rotation', sets: '2 × 15/side', load: 'Light', rest: '30 s' },
      { g: '7a', n: 'Neck lateral flexion', sets: '2 × 15/side', load: 'Light', rest: '45 s' },
      { g: '7b', n: 'Farmer carry', sets: '2 × 40 m', load: 'Heavy', rest: '60 s' },
    ],
    notes: [['Technique and substitutions', 'Same as Days 1–3. Accessories stay at RIR 3 (three reps left) this week; no finisher.']],
  },
  XT: {
    label: 'Short Session X', title: 'Taper: squat + bench', kind: 'gym', length: 'about 50 min',
    exercises: [
      { g: '1', n: 'Warm-up', sets: '15 min', load: 'Standard warm-up' },
      { g: '2', n: 'Back squat', main: 'squat', rest: '3 min' },
      { g: '3', n: 'Bench press', main: 'bench', rest: '3 min' },
      { g: '4', n: 'Pull-up', sets: '2 × 3', load: 'Bodyweight, crisp', rest: '90 s' },
    ],
    notes: [['Taper', 'Leave the gym feeling fresh. No accessories, no finisher.']],
  },
  YT: {
    label: 'Short Session Y', title: 'Taper: primer', kind: 'gym', length: 'about 40 min',
    exercises: [
      { g: '1', n: 'Warm-up', sets: '15 min', load: 'Standard warm-up' },
      { g: '2', n: 'Deadlift', main: 'deadlift', rest: '2–3 min' },
      { g: '3', n: 'Back squat (primer)', main: 'squat', variant: 'sat', rest: '2 min' },
      { g: '4', n: 'Paused bench press', main: 'paused', rest: '2 min' },
    ],
    notes: [['Taper', 'Fast, easy reps only. No accessories. Sunday is rest, Monday is test day.']],
  },
  testSB: { label: 'Test day', title: 'Squat + bench', kind: 'test', lifts: ['squat', 'bench'] },
  testD: { label: 'Test day', title: 'Deadlift', kind: 'test', lifts: ['deadlift'] },
  testCal: {
    label: 'Test day', title: 'Calisthenics', kind: 'testcal',
    items: ['Max strict pull-ups', 'Max dips (full range)', 'L-sit, longest hold', 'Chest-to-wall handstand, longest hold', 'Freestanding handstand, best hold', 'Strict muscle-ups, max reps'],
  },
};

export const SKILLS = {
  mu: { name: 'Muscle-ups', unit: 'reps' },
  lsit: { name: 'L-sit hold', unit: 's' },
  hswall: { name: 'Chest-to-wall handstand', unit: 's' },
  hsfree: { name: 'Freestanding handstand', unit: 's' },
  pullmax: { name: 'Max strict pull-ups', unit: 'reps' },
  dipmax: { name: 'Max dips', unit: 'reps' },
};

export const BW_BAND = [72.5, 74];
