import { site } from '../config.js';
import { layout, adSlot, breadcrumbs } from './layout.js';
import { esc, formatDate } from '../lib/html.js';
import { toolIcon } from '../lib/icons.js';
import * as seo from '../lib/seo.js';

const B = site.basePath;

/**
 * An "answer page": one page that answers one specific query exactly
 * ("170 cm in feet"), then gives the working, nearby values and the tool.
 * These target long-tail searches that a generic tool page cannot rank for.
 */
export function renderAnswerPage(page, ctx) {
  const trail = [{ name: 'Home', href: '/' }, ...page.breadcrumb];
  const canonical = seo.url('/' + page.slug + '/');
  const tool = page.toolSlug ? ctx.bySlug[page.toolSlug] : null;

  const schema = seo.graph([
    seo.publisher(),
    seo.websiteSchema(),
    seo.breadcrumbSchema(trail),
    seo.faqSchema(page.faq),
    {
      '@type': 'WebPage',
      '@id': `${canonical}#page`,
      url: canonical,
      name: page.title,
      description: page.description,
      inLanguage: site.lang,
      isPartOf: { '@id': `${site.origin}/#website` },
      primaryImageOfPage: undefined,
      // The literal answer, so engines can lift it without parsing prose.
      mainEntity: page.answerFact
        ? { '@type': 'Question', name: page.answerFact.q,
            acceptedAnswer: { '@type': 'Answer', text: page.answerFact.a } }
        : undefined,
    },
  ]);

  const content = `
${breadcrumbs(trail)}
<div class="tool-layout">
  <div>
    <header class="page-head">
      <h1>${esc(page.h1)}</h1>
      ${page.lede ? `<p class="lede">${page.lede}</p>` : ''}
    </header>

    <div class="answer-box">
      <div class="answer-label">${esc(page.answerLabel || 'Answer')}</div>
      <div class="answer-value">${page.answerValue}</div>
      ${page.answerNote ? `<div class="answer-note">${page.answerNote}</div>` : ''}
    </div>

    ${tool ? `<a class="answer-cta" href="${B}/${tool.slug}/">
      <span class="tool-icon">${toolIcon(tool)}</span>
      <span class="tool-body">
        <strong>Convert any value with the ${esc(tool.h1 || tool.title)}</strong>
        <span>${esc(tool.cardText || tool.description)}</span>
      </span>
    </a>` : ''}

    ${adSlot('answer-top')}

    ${(page.sections || []).map((s) => `<section class="section prose">
      <h2>${esc(s.h2)}</h2>
      ${s.html}
    </section>`).join('')}

    ${page.faq?.length ? `<section class="section faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Frequently asked questions</h2>
      ${page.faq.map((f) => `<details><summary>${esc(f.q)}</summary><div>${f.a}</div></details>`).join('')}
    </section>` : ''}

    ${page.related?.length ? `<section class="section">
      <h2>Nearby values</h2>
      <div class="pills" style="justify-content:flex-start">
        ${page.related.map((r) => `<a class="pill" href="${B}/${r.slug}/">${esc(r.label)}</a>`).join('')}
      </div>
    </section>` : ''}

    <p style="margin-top:36px;font-size:.84rem;color:var(--ink-3)">
      Last reviewed ${formatDate(page.updated || '2026-01-01')}. ${esc(page.footnote || '')}
    </p>
  </div>

  <aside class="side">
    ${page.siblings?.length ? `<nav aria-labelledby="sib-h">
      <h2 id="sib-h">${esc(page.siblingsTitle || 'Related conversions')}</h2>
      <ul class="side-list">
        ${page.siblings.map((s) => `<li><a href="${B}/${s.slug}/">${esc(s.label)}</a></li>`).join('')}
      </ul>
    </nav>` : ''}
    ${adSlot('sidebar', 'vertical')}
  </aside>
</div>`;

  return layout({
    title: page.title,
    description: page.description,
    canonical,
    schema,
    content,
    inlineJs: page.inlineJs,
    currentPath: '/' + page.slug + '/',
    searchIndex: ctx.searchIndex,
  });
}
