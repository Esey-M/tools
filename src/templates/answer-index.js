import { site } from '../config.js';
import { layout, adSlot, breadcrumbs } from './layout.js';
import { esc } from '../lib/html.js';
import * as seo from '../lib/seo.js';

const B = site.basePath;

/** Hub page listing every generated answer page in a section. */
export function renderAnswerIndex(spec, ctx) {
  const trail = [{ name: 'Home', href: '/' }, { name: spec.name, href: `/${spec.slug}/` }];

  const content = `${breadcrumbs(trail)}
<header class="page-head">
  <h1>${esc(spec.h1)}</h1>
  <p class="lede">${spec.lede}</p>
</header>
${adSlot('index-top')}
${spec.groups.map((g) => `<section class="section">
  <div class="section-head"><div><h2>${esc(g.title)}</h2><p>${esc(g.blurb)}</p></div></div>
  <div class="pills" style="justify-content:flex-start">
    ${g.pages.map((p) => `<a class="pill" href="${B}/${p.slug}/">${esc(p.label)}</a>`).join('')}
  </div>
</section>`).join('')}`;

  return layout({
    title: spec.title,
    description: spec.description,
    canonical: seo.url(`/${spec.slug}/`),
    schema: seo.graph([seo.publisher(), seo.websiteSchema(), seo.breadcrumbSchema(trail)]),
    content,
    currentPath: `/${spec.slug}/`,
    searchIndex: ctx.searchIndex,
  });
}
