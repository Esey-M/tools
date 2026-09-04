import { site, categoryBySlug } from '../config.js';
import { layout, adSlot, breadcrumbs } from './layout.js';
import { esc, formatDate } from '../lib/html.js';
import * as seo from '../lib/seo.js';

const B = site.basePath;

function faqBlock(faq) {
  if (!faq?.length) return '';
  return `<section class="section faq" id="faq" aria-labelledby="faq-h">
  <h2 id="faq-h">Frequently asked questions</h2>
  ${faq.map((entry) => `<details>
    <summary>${esc(entry.q)}</summary>
    <div>${entry.a}</div>
  </details>`).join('\n  ')}
</section>`;
}

function stepsBlock(steps, name) {
  if (!steps?.length) return '';
  return `<section class="section" id="how-to" aria-labelledby="howto-h">
  <h2 id="howto-h">How to use the ${esc(name)}</h2>
  <ol class="prose">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
</section>`;
}

function relatedBlock(related, byslug) {
  const items = (related || []).map((slug) => byslug[slug]).filter(Boolean);
  if (!items.length) return '';
  return `<section class="section" aria-labelledby="rel-h">
  <h2 id="rel-h">Related tools</h2>
  <div class="card-grid">
    ${items.map((t) => `<a class="tool-card" href="${B}/${t.slug}/">
      <strong>${esc(t.h1 || t.title)}</strong>
      <span>${esc(t.cardText || t.description)}</span>
    </a>`).join('\n    ')}
  </div>
</section>`;
}

export function renderToolPage(tool, ctx) {
  const { bySlug, categoryTools } = ctx;
  const cat = categoryBySlug[tool.category];
  const name = tool.h1 || tool.title;
  const path = `/${tool.slug}/`;
  const canonical = seo.url(path);

  const trail = [
    { name: 'Home', href: '/' },
    { name: cat.name, href: `/category/${cat.slug}/` },
    { name, href: path },
  ];

  const schema = seo.graph([
    seo.publisher(),
    seo.websiteSchema(),
    seo.toolSchema(tool),
    seo.breadcrumbSchema(trail),
    seo.howToSchema(tool),
    seo.faqSchema(tool.faq),
  ]);

  // Sidebar: sibling tools in the same category, current one excluded.
  const siblings = (categoryTools[tool.category] || [])
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 9);

  const content = `
${breadcrumbs(trail)}
<div class="tool-layout">
  <div>
    <header class="page-head">
      <h1>${esc(name)}</h1>
      <p class="lede">${tool.lede || esc(tool.description)}</p>
    </header>

    <div class="panel" id="tool">
      ${tool.form}
      <noscript>
        <p class="notice notice-warn" style="margin-top:16px">
          This tool needs JavaScript to calculate. Everything below still explains how to work it out by hand.
        </p>
      </noscript>
    </div>

    ${adSlot('tool-top')}

    ${tool.answer ? `<section class="section prose" id="what-is" aria-labelledby="what-h">
      <h2 id="what-h">${esc(tool.answerHeading || `What this ${name.toLowerCase()} tells you`)}</h2>
      <div class="answer">${tool.answer}</div>
    </section>` : ''}

    ${(tool.sections || []).map((s) => `<section class="section prose"${s.id ? ` id="${s.id}"` : ''}>
      <h2${s.id ? ` id="${s.id}-h"` : ''}>${esc(s.h2)}</h2>
      ${s.html}
    </section>`).join('\n')}

    ${stepsBlock(tool.steps, name)}
    ${adSlot('tool-mid')}
    ${faqBlock(tool.faq)}
    ${relatedBlock(tool.related, bySlug)}

    <p style="margin-top:36px;font-size:.84rem;color:var(--ink-3)">
      Last reviewed ${formatDate(tool.updated || '2026-01-01')}.
      ${tool.disclaimer ? esc(tool.disclaimer) : 'Results are estimates for general information only.'}
    </p>
  </div>

  <aside class="side">
    ${siblings.length ? `<nav aria-labelledby="side-h">
      <h2 id="side-h">More ${cat.name.toLowerCase()}</h2>
      <ul class="side-list">
        ${siblings.map((t) => `<li><a href="${B}/${t.slug}/">${esc(t.h1 || t.title)}</a></li>`).join('\n        ')}
      </ul>
      <p style="margin-top:10px"><a href="${B}/category/${cat.slug}/" style="font-size:.88rem">All ${cat.name.toLowerCase()} →</a></p>
    </nav>` : ''}
    ${adSlot('sidebar', 'vertical')}
  </aside>
</div>`;

  return layout({
    title: tool.title,
    description: tool.description,
    canonical,
    schema,
    content,
    extraCss: tool.css,
    inlineJs: tool.js,
    currentPath: path,
  });
}
