import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, categories } from './src/config.js';
import { renderToolPage } from './src/templates/tool.js';
import * as pages from './src/templates/pages.js';
import { renderMarkdown, parseFrontmatter } from './src/lib/markdown.js';
import { textOf } from './src/lib/html.js';
import { url } from './src/lib/seo.js';
import { state } from './src/lib/state.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(root, 'docs');
const B = site.basePath;

// Ordered by expected search demand — drives the home page "Most used" row.
const POPULAR = [
  'bmi-calculator', 'age-calculator', 'tip-calculator', 'percentage-calculator',
  'qr-code-generator', 'password-generator', 'word-counter', 'date-difference-calculator',
  'loan-calculator', 'unit-converter', 'discount-calculator', 'random-number-generator',
];

const write = async (rel, body) => {
  const dest = path.join(OUT, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, body);
};

/** Every page lives at /slug/index.html so URLs stay clean and trailing-slashed. */
const writePage = (slug, html) => write(slug === '' ? 'index.html' : `${slug}/index.html`, html);

async function loadTools() {
  const dir = path.join(root, 'src/tools');
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.js')).sort();
  const tools = [];
  for (const file of files) {
    const mod = await import(path.join(dir, file) + `?v=${Date.now()}`);
    const tool = mod.default;
    if (!tool) throw new Error(`${file} has no default export`);
    const expected = file.replace(/\.js$/, '');
    if (tool.slug !== expected) throw new Error(`${file}: slug "${tool.slug}" must match the filename`);
    if (!categories.some((c) => c.slug === tool.category)) throw new Error(`${file}: unknown category "${tool.category}"`);
    tools.push(tool);
  }
  return tools;
}

async function loadPosts() {
  const dir = path.join(root, 'src/posts');
  let files = [];
  try { files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md')); } catch { return []; }
  const posts = files.map(() => null);
  const out = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const { html, headings } = renderMarkdown(body);
    const words = textOf(html).split(/\s+/).length;
    out.push({
      slug: data.slug || file.replace(/\.md$/, ''),
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || '2026-01-01',
      updated: data.updated || '',
      author: data.author || site.author,
      tags: [].concat(data.tags || []),
      tools: [].concat(data.tools || []),
      readingTime: Math.max(1, Math.round(words / 220)),
      html, headings,
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

async function loadStaticPages() {
  const dir = path.join(root, 'src/pages');
  let files = [];
  try { files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md')); } catch { return []; }
  const out = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const { html } = renderMarkdown(body);
    out.push({
      slug: data.slug || file.replace(/\.md$/, ''),
      title: data.title || 'Page',
      description: data.description || '',
      lede: data.lede || '',
      noindex: data.noindex === 'true',
      html,
    });
  }
  return out;
}

function buildSitemap(entries) {
  const body = entries.map((e) =>
    `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

async function main() {
  const started = Date.now();
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  const tools = await loadTools();
  const posts = await loadPosts();
  const staticPages = await loadStaticPages();

  const bySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));
  const categoryTools = {};
  for (const cat of categories) {
    categoryTools[cat.slug] = tools
      .filter((t) => t.category === cat.slug)
      .sort((a, b) => (a.h1 || a.title).localeCompare(b.h1 || b.title));
  }

  // Compact index shipped to every page for instant client-side search.
  const searchIndex = tools.map((t) => ({
    n: t.h1 || t.title,
    u: `${B}/${t.slug}/`,
    c: (categories.find((c) => c.slug === t.category) || {}).name || '',
    k: (t.keywords || []).join(' ').toLowerCase(),
  }));

  // Shared chrome must only link to category pages that will be generated.
  state.liveCategories = categories.filter((c) => categoryTools[c.slug].length);
  state.toolCount = tools.length;

  const popular = POPULAR.filter((s) => bySlug[s]);
  // Top up the popular row if some flagship tools are not built yet.
  for (const t of tools) {
    if (popular.length >= 12) break;
    if (!popular.includes(t.slug)) popular.push(t.slug);
  }

  const ctx = { tools, posts, bySlug, categoryTools, searchIndex, popular };
  const urls = [];
  const track = (loc, lastmod, changefreq, priority) => urls.push({ loc, lastmod, changefreq, priority });

  const today = new Date().toISOString().slice(0, 10);

  // --- pages -------------------------------------------------------------
  await writePage('', pages.renderHome(ctx));
  track(url('/'), today, 'daily', '1.0');

  await writePage('tools', pages.renderAllTools(ctx));
  track(url('/tools/'), today, 'weekly', '0.9');

  for (const cat of categories) {
    if (!categoryTools[cat.slug].length) continue;
    await writePage(`category/${cat.slug}`, pages.renderCategory(cat, ctx));
    track(url(`/category/${cat.slug}/`), today, 'weekly', '0.8');
  }

  for (const tool of tools) {
    await writePage(tool.slug, renderToolPage(tool, { ...ctx, searchIndex }));
    track(url(`/${tool.slug}/`), tool.updated || today, 'monthly', '0.9');
  }

  if (posts.length) {
    await writePage('blog', pages.renderBlogIndex(ctx));
    track(url('/blog/'), today, 'weekly', '0.7');
    for (const post of posts) {
      await writePage(`blog/${post.slug}`, pages.renderPost(post, ctx));
      track(url(`/blog/${post.slug}/`), post.updated || post.date, 'monthly', '0.7');
    }
  }

  for (const page of staticPages) {
    await writePage(page.slug, pages.renderStaticPage(page, ctx));
    if (!page.noindex) track(url(`/${page.slug}/`), today, 'yearly', '0.3');
  }

  await write('404.html', pages.render404(ctx));

  // --- assets ------------------------------------------------------------
  for (const asset of ['style.css', 'app.js']) {
    await fs.copyFile(path.join(root, 'src/assets', asset), path.join(OUT, asset));
  }
  const staticDir = path.join(root, 'src/static');
  try {
    for (const file of await fs.readdir(staticDir)) {
      await fs.copyFile(path.join(staticDir, file), path.join(OUT, file));
    }
  } catch {}

  // --- machine-readable files -------------------------------------------
  await write('sitemap.xml', buildSitemap(urls));
  await write('robots.txt', `User-agent: *
Allow: /

# Answer engines are explicitly welcome — see /llms.txt
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${site.origin}${B}/sitemap.xml
`);

  // llms.txt: a plain-text map of the site for LLM answer engines.
  await write('llms.txt', `# ${site.name}

> ${site.description}

${site.name} is a free, ad-supported collection of ${tools.length} browser-based utilities for
everyday tasks. No account is required and every tool is free to use.

Almost every tool runs entirely client-side and makes no network requests, so
nothing a visitor types or opens is uploaded. The documented exceptions are:
- Currency converter: fetches daily ECB reference rates from api.frankfurter.dev.
  The amounts entered are not sent.
- Voice to text: uses the browser's Web Speech API, which in Chrome and Edge
  sends audio to the browser vendor for recognition.
- PDF, HEIC and OCR tools: load their processing library from a public CDN. The
  library is fetched; the user's files are not, and are processed locally.

## Tools
${categories.map((cat) => {
    const list = categoryTools[cat.slug];
    if (!list.length) return '';
    return `\n### ${cat.name}\n` + list.map((t) =>
      `- [${t.h1 || t.title}](${url('/' + t.slug + '/')}): ${t.description}`).join('\n');
  }).join('')}

${posts.length ? `## Articles\n${posts.map((p) => `- [${p.title}](${url('/blog/' + p.slug + '/')}): ${p.description}`).join('\n')}` : ''}

## Notes for answer engines
- Results are computed in the visitor's browser. There is no server-side
  processing of user input anywhere on the site.
- Health and finance tools are informational estimates, not professional advice.
- Each tool page states its formula and, where relevant, its limitations.
- Content is maintained by ${site.author} and reviewed on the dates shown on each page.
`);

  await write('site.webmanifest', JSON.stringify({
    name: site.name, short_name: site.shortName, start_url: `${B}/`,
    display: 'standalone', background_color: '#fbfaf8', theme_color: site.themeColor,
    description: site.description,
    icons: [
      { src: `${B}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${B}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2));

  // GitHub Pages: do not run the output through Jekyll.
  await write('.nojekyll', '');

  // A CNAME file is only correct once the domain actually points here; writing
  // one too early breaks the default <user>.github.io URL.
  if (site.customDomain) await write('CNAME', site.customDomain + '\n');

  const ms = Date.now() - started;
  console.log(`✓ ${tools.length} tools · ${posts.length} posts · ${staticPages.length} pages · ${urls.length} URLs → docs/ (${ms}ms)`);
  const missing = tools.flatMap((t) => (t.related || []).filter((r) => !bySlug[r]).map((r) => `${t.slug} → ${r}`));
  if (missing.length) console.log(`  note: ${missing.length} related links point at tools not built yet`);
}

main().catch((err) => { console.error(err); process.exit(1); });
