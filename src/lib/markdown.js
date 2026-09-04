// ---------------------------------------------------------------------------
// A deliberately small Markdown subset — enough for blog posts, with zero
// dependencies so the build stays instant and auditable.
// Supports: headings, paragraphs, bold/italic/code, links, lists, blockquotes,
// tables, horizontal rules and fenced code blocks.
// ---------------------------------------------------------------------------
import { esc, slugify } from './html.js';

function inline(src) {
  let out = esc(src);
  out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const external = /^https?:\/\//.test(href);
    const rel = external ? ' rel="noopener" target="_blank"' : '';
    return `<a href="${href}"${rel}>${text}</a>`;
  });
  return out;
}

function tableRow(line) {
  return line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
}

export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }

    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      if (level <= 3) headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^(---|\*\*\*)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (line.startsWith('|') && lines[i + 1] && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const head = tableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(tableRow(lines[i++]));
      out.push(
        '<div class="table-scroll"><table><thead><tr>' +
        head.map((c) => `<th>${inline(c)}</th>`).join('') +
        '</tr></thead><tbody>' +
        rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('') +
        '</tbody></table></div>'
      );
      continue;
    }

    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${renderMarkdown(body.join('\n')).html}</blockquote>`);
      continue;
    }

    const bullet = /^\s*([-*])\s+/;
    const numbered = /^\s*\d+\.\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const re = ordered ? numbered : bullet;
      const items = [];
      while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ''));
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|```|\||\s*>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) {
      para.push(lines[i++]);
    }
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    else i++;
  }

  return { html: out.join('\n'), headings };
}

/** Parse `---` YAML-ish frontmatter. Values are plain strings or [a, b] lists. */
export function parseFrontmatter(raw) {
  const match = String(raw).replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    data[kv[1]] = value;
  }
  return { data, body: match[2] };
}
