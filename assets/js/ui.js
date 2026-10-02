// Shared UI pieces: plate diagram, planned-lift block, toast, small formatters.

import { esc } from './md.js';
import { platesPerSide, fmtKg } from './calc.js';
import { LIFTS } from './plan.js';
import * as store from './store.js';

export { esc };

const THICK = { 25: 26, 20: 22, 15: 19, 10: 16, 5: 12, 2.5: 9, 1.25: 7, 2: 9, 1.5: 8, 1: 7, 0.5: 6 };
const TALL = { 25: 64, 20: 64, 15: 64, 10: 64, 5: 46, 2.5: 36, 2: 34, 1.5: 32, 1.25: 28, 1: 26, 0.5: 22 };

export function plateClass(p) {
  return 'p' + String(p).replace('.', '_');
}

export function platesSvg(totalKg) {
  const { bar, plates } = store.getSettings();
  const res = platesPerSide(totalKg, bar, plates);
  if (res.belowBar) {
    return `<p class="plates-note">Below the ${fmtKg(bar)} kg bar: use dumbbells or a lighter bar.</p>`;
  }
  const H = 72, mid = H / 2;
  let x = 40;
  const rects = res.plates.map((p) => {
    const w = THICK[p] || 8, h = TALL[p] || 30;
    const r = `<rect class="plate ${plateClass(p)}" x="${x}" y="${mid - h / 2}" width="${w}" height="${h}" rx="2"/>`;
    x += w + 2;
    return r;
  }).join('');
  const sleeveEnd = Math.max(x + 18, 120);
  const svg = `<svg class="plates" viewBox="0 0 ${sleeveEnd + 6} ${H}" width="${sleeveEnd + 6}" height="${H}" aria-hidden="true">
    <rect class="bar" x="0" y="${mid - 4}" width="30" height="8" rx="2"/>
    <rect class="collar" x="28" y="${mid - 12}" width="10" height="24" rx="2"/>
    <rect class="sleeve" x="38" y="${mid - 6}" width="${sleeveEnd - 38}" height="12" rx="2"/>
    ${rects}
  </svg>`;
  const list = res.plates.length ? res.plates.map(fmtKg).join(' + ') : 'nothing, just the bar';
  const left = res.leftover > 0.01 ? ` <span class="warn-text">${fmtKg(res.leftover * 2)} kg can't be made with your plates; round it.</span>` : '';
  return `<div class="plates-row" role="img" aria-label="Per side: ${esc(list)}">${svg}<p class="plates-caption">Per side: <strong>${esc(list)}</strong>${left}</p></div>`;
}

export function kgRange(lo, hi) {
  return hi && hi !== lo ? `${fmtKg(lo)}–${fmtKg(hi)}` : fmtKg(lo);
}

// The big planned block for one main lift on the Today view.
export function liftBlock(liftKey, p, { name } = {}) {
  const lift = LIFTS[liftKey];
  const title = name || lift.name;
  if (!p) return '';
  let hero, then = '', plateKg;
  if (p.top) {
    hero = `<span class="hero-num">${kgRange(p.top.kg, p.top.kgHi)}<span class="unit">kg</span></span><span class="hero-reps">× ${p.top.reps}</span>`;
    plateKg = p.top.kg;
    if (p.bo) then = `<p class="then">Then ${p.bo.sets} × ${p.bo.reps} at <strong>${fmtKg(p.bo.kg)} kg</strong></p>`;
  } else if (p.bo) {
    hero = `<span class="hero-num">${fmtKg(p.bo.kg)}<span class="unit">kg</span></span><span class="hero-reps">${p.bo.sets} × ${p.bo.reps}</span>`;
    plateKg = p.bo.kg;
  }
  const adj = p.adj ? `<span class="adj-tag">${p.adj > 0 ? '+' : ''}${fmtKg(p.adj)} kg adjusted</span>` : '';
  const note = p.note ? `<p class="lift-note">${esc(p.note)}</p>` : '';
  return `<section class="lift-block">
    <div class="lift-head"><h3>${esc(title)}</h3><span class="rpe-chip">RPE ${esc(p.rpe)}</span></div>
    <div class="hero">${hero}</div>
    ${adj}
    ${platesSvg(plateKg)}
    ${then}${note}
  </section>`;
}

// ---------- toast ----------

let toastTimer;
export function toast(msg, action) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button" class="toast-btn">${esc(action.label)}</button>` : ''}`;
  el.classList.add('show');
  if (action) {
    el.querySelector('.toast-btn').addEventListener('click', () => { action.run(); el.classList.remove('show'); }, { once: true });
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), action ? 6000 : 2600);
}

export function rpeOptions(selected, { blank = true } = {}) {
  const opts = [];
  if (blank) opts.push(`<option value="">–</option>`);
  for (let r = 5; r <= 10; r += 0.5) {
    const v = String(r);
    opts.push(`<option value="${v}" ${String(selected) === v ? 'selected' : ''}>${v}</option>`);
  }
  return opts.join('');
}

export function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export function qs(name) {
  const h = location.hash.split('?')[1] || '';
  return new URLSearchParams(h).get(name);
}
