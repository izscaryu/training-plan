// A deliberately small markdown renderer for the plan's own prose:
// headings, paragraphs, bullet and numbered lists, pipe tables, **bold**, [links](https://...).

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text) {
  let out = esc(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (m, label, url) =>
    `<a href="${url}" target="_blank" rel="noopener">${label}</a>`);
  return out;
}

function cells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

export function md(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length + 1; // ## -> h3 inside sections, ### -> h4
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++; continue;
    }

    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i]); i++; }
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      html.push('<div class="table-wrap"><table><thead><tr>' +
        head.map((c) => `<th scope="col">${inline(c)}</th>`).join('') +
        '</tr></thead><tbody>' +
        body.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      html.push('<ul>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      html.push('<ol>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ol>');
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|- |\d+\. |\|)/.test(lines[i])) { para.push(lines[i].trim()); i++; }
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return html.join('\n');
}
