import { site, categories, categoryBySlug } from '../config.js';
import { layout, adSlot, breadcrumbs } from './layout.js';
import { esc, formatDate } from '../lib/html.js';
import * as seo from '../lib/seo.js';

const B = site.basePath;

const card = (t) => `<a class="tool-card" href="${B}/${t.slug}/">
  <strong>${esc(t.h1 || t.title)}</strong>
  <span>${esc(t.cardText || t.description)}</span>
</a>`;

/* ------------------------------------------------------------------ home */
export function renderHome(ctx) {
  const { tools, categoryTools, posts } = ctx;
  const popular = ctx.popular.map((s) => ctx.bySlug[s]).filter(Boolean);

  const schema = seo.graph([
    seo.publisher(),
    seo.websiteSchema(),
    seo.itemListSchema(popular, 'Most used tools'),
  ]);

  const content = `
<section class="hero">
  <h1>${tools.length} free tools for everyday life</h1>
  <p>Calculators, converters and file tools that load fast, work on your phone, and never ask you to sign up. Everything runs in your browser.</p>
  <div class="search" role="search">
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></svg>
    <input type="search" placeholder="What do you need to work out?" aria-label="Search tools"
           onfocus="document.getElementById('site-search').focus()" readonly>
  </div>
  <div class="pills">
    ${popular.slice(0, 6).map((t) => `<a class="pill" href="${B}/${t.slug}/">${esc(t.h1 || t.title)}</a>`).join('')}
  </div>
</section>

${adSlot('home-top')}

<section class="section">
  <div class="section-head">
    <h2>Most used</h2>
    <a href="${B}/tools/">All ${tools.length} tools →</a>
  </div>
  <div class="card-grid">${popular.map(card).join('')}</div>
</section>

${categories.map((cat) => {
    const list = (categoryTools[cat.slug] || []).slice(0, 8);
    if (!list.length) return '';
    return `<section class="section">
  <div class="section-head">
    <div>
      <h2>${esc(cat.name)}</h2>
      <p>${esc(cat.blurb)}</p>
    </div>
    <a href="${B}/category/${cat.slug}/">See all ${(categoryTools[cat.slug] || []).length} →</a>
  </div>
  <div class="card-grid">${list.map(card).join('')}</div>
</section>`;
  }).join('')}

${posts.length ? `<section class="section">
  <div class="section-head"><h2>From the blog</h2><a href="${B}/blog/">All posts →</a></div>
  <div class="post-list">
    ${posts.slice(0, 4).map((p) => `<a class="post-item" href="${B}/blog/${p.slug}/">
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <div class="post-meta"><span>${formatDate(p.date)}</span><span>${p.readingTime} min read</span></div>
    </a>`).join('')}
  </div>
</section>` : ''}`;

  return layout({
    title: `${site.name} – ${tools.length} Free Online Tools & Calculators`,
    description: site.description,
    canonical: seo.url('/'),
    schema, content, currentPath: '/',
    searchIndex: ctx.searchIndex,
  });
}

/* -------------------------------------------------------------- all tools */
export function renderAllTools(ctx) {
  const { tools, categoryTools } = ctx;
  const trail = [{ name: 'Home', href: '/' }, { name: 'All tools', href: '/tools/' }];

  const content = `${breadcrumbs(trail)}
<header class="page-head">
  <h1>All ${tools.length} tools</h1>
  <p class="lede">Every calculator, converter and utility on ${site.name}, grouped by what you are trying to do. All free, all instant, no account needed.</p>
</header>
<nav class="pills" style="justify-content:flex-start;margin-bottom:8px" aria-label="Jump to category">
  ${categories.filter((c) => (categoryTools[c.slug] || []).length).map((c) => `<a class="pill" href="#${c.slug}">${esc(c.name)}</a>`).join('')}
</nav>
${adSlot('list-top')}
${categories.map((cat) => {
    const list = categoryTools[cat.slug] || [];
    if (!list.length) return '';
    return `<section class="section" id="${cat.slug}">
  <div class="section-head">
    <div><h2>${esc(cat.name)}</h2><p>${esc(cat.blurb)}</p></div>
  </div>
  <div class="card-grid">${list.map(card).join('')}</div>
</section>`;
  }).join('')}`;

  return layout({
    title: `All ${tools.length} Free Online Tools | ${site.name}`,
    description: `Browse all ${tools.length} free tools on ${site.name} — calculators, converters, file and image tools, generators and more. No signup, works on any device.`,
    canonical: seo.url('/tools/'),
    schema: seo.graph([seo.publisher(), seo.websiteSchema(), seo.breadcrumbSchema(trail), seo.itemListSchema(tools, 'All tools')]),
    content, currentPath: '/tools/', searchIndex: ctx.searchIndex,
  });
}

/* --------------------------------------------------------------- category */
export function renderCategory(cat, ctx) {
  const list = ctx.categoryTools[cat.slug] || [];
  const trail = [{ name: 'Home', href: '/' }, { name: cat.name, href: `/category/${cat.slug}/` }];

  const content = `${breadcrumbs(trail)}
<header class="page-head">
  <h1>${esc(cat.name)}</h1>
  <p class="lede">${esc(cat.blurb)} ${list.length} free tools, no signup.</p>
</header>
${adSlot('cat-top')}
<div class="card-grid">${list.map(card).join('')}</div>
${cat.intro ? `<section class="section prose">${cat.intro}</section>` : ''}`;

  return layout({
    title: `${cat.name} – ${list.length} Free Online Tools | ${site.name}`,
    description: `${cat.blurb} ${list.length} free ${cat.name.toLowerCase()} that work instantly in your browser.`,
    canonical: seo.url(`/category/${cat.slug}/`),
    schema: seo.graph([seo.publisher(), seo.websiteSchema(), seo.breadcrumbSchema(trail), seo.itemListSchema(list, cat.name)]),
    content, currentPath: `/category/${cat.slug}/`, searchIndex: ctx.searchIndex,
  });
}

/* ------------------------------------------------------------------- blog */
export function renderBlogIndex(ctx) {
  const { posts } = ctx;
  const trail = [{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog/' }];

  const content = `${breadcrumbs(trail)}
<header class="page-head">
  <h1>The ${site.name} blog</h1>
  <p class="lede">Plain-English guides to the numbers behind everyday decisions — what they mean, how to work them out, and when they mislead you.</p>
</header>
${adSlot('blog-top')}
<div class="post-list">
  ${posts.map((p) => `<a class="post-item" href="${B}/blog/${p.slug}/">
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.description)}</p>
    <div class="post-meta"><span>${formatDate(p.date)}</span><span>${p.readingTime} min read</span>${p.tags?.length ? `<span>${esc([].concat(p.tags)[0])}</span>` : ''}</div>
  </a>`).join('')}
</div>`;

  return layout({
    title: `Blog – Guides to Everyday Numbers | ${site.name}`,
    description: `Practical guides from ${site.name}: how BMI, interest, tips, unit conversions and other everyday numbers really work.`,
    canonical: seo.url('/blog/'),
    schema: seo.graph([
      seo.publisher(), seo.websiteSchema(), seo.breadcrumbSchema(trail),
      { '@type': 'Blog', '@id': `${seo.url('/blog/')}#blog`, name: `${site.name} blog`, url: seo.url('/blog/'),
        blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: seo.url(`/blog/${p.slug}/`), datePublished: p.date })) },
    ]),
    content, currentPath: '/blog/', searchIndex: ctx.searchIndex,
  });
}

export function renderPost(post, ctx) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog/' }, { name: post.title, href: `/blog/${post.slug}/` }];
  const related = (post.tools || []).map((s) => ctx.bySlug[s]).filter(Boolean);

  const toc = post.headings.filter((h) => h.level === 2);

  const content = `${breadcrumbs(trail)}
<div class="tool-layout">
  <article>
    <header class="page-head">
      <h1>${esc(post.title)}</h1>
      <p class="lede">${esc(post.description)}</p>
      <div class="post-meta" style="margin-top:12px">
        <span>By ${esc(post.author || site.author)}</span>
        <span>${formatDate(post.date)}</span>
        <span>${post.readingTime} min read</span>
      </div>
    </header>
    ${adSlot('post-top')}
    <div class="prose">${post.html}</div>
    ${related.length ? `<section class="section">
      <h2>Tools mentioned in this post</h2>
      <div class="card-grid">${related.map(card).join('')}</div>
    </section>` : ''}
    ${adSlot('post-bottom')}
  </article>
  <aside class="side">
    ${toc.length > 2 ? `<nav aria-labelledby="toc-h">
      <h2 id="toc-h">On this page</h2>
      <ul class="side-list">${toc.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('')}</ul>
    </nav>` : ''}
    ${adSlot('sidebar', 'vertical')}
  </aside>
</div>`;

  return layout({
    title: `${post.title} | ${site.name}`,
    description: post.description,
    canonical: seo.url(`/blog/${post.slug}/`),
    ogType: 'article',
    published: post.date,
    modified: post.updated || post.date,
    schema: seo.graph([seo.publisher(), seo.websiteSchema(), seo.articleSchema(post), seo.breadcrumbSchema(trail), seo.faqSchema(post.faq)]),
    content, currentPath: '/blog/', searchIndex: ctx.searchIndex,
  });
}

/* ---------------------------------------------------------- static pages */
export function renderStaticPage(page, ctx) {
  const trail = [{ name: 'Home', href: '/' }, { name: page.title, href: `/${page.slug}/` }];
  const content = `${breadcrumbs(trail)}
<header class="page-head"><h1>${esc(page.title)}</h1>${page.lede ? `<p class="lede">${esc(page.lede)}</p>` : ''}</header>
<div class="prose">${page.html}</div>`;

  return layout({
    title: `${page.title} | ${site.name}`,
    description: page.description,
    canonical: seo.url(`/${page.slug}/`),
    schema: seo.graph([seo.publisher(), seo.websiteSchema(), seo.breadcrumbSchema(trail)]),
    content, currentPath: `/${page.slug}/`, searchIndex: ctx.searchIndex,
    noindex: page.noindex,
  });
}

/* ------------------------------------------------------------------- 404 */
export function render404(ctx) {
  const content = `<div style="text-align:center;padding-block:60px">
  <p style="font-size:3rem;font-weight:700;color:var(--ink-3)">404</p>
  <h1>We could not find that page</h1>
  <p class="lede" style="margin-inline:auto">The tool may have moved, or the link may have a typo. Try searching, or browse everything.</p>
  <div class="btn-row" style="justify-content:center;margin-top:22px">
    <a class="btn" href="${B}/tools/">Browse all tools</a>
    <a class="btn btn-ghost" href="${B}/">Go home</a>
  </div>
</div>`;
  return layout({
    title: `Page not found | ${site.name}`,
    description: 'That page could not be found. Browse all the free calculators, converters and everyday tools on CinchPad instead.',
    canonical: seo.url('/404.html'), noindex: true,
    content, searchIndex: ctx.searchIndex,
  });
}
