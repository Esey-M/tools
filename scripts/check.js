/* ---------------------------------------------------------------------------
 * Post-build validation. Catches the SEO regressions that are easy to miss by
 * eye once there are a hundred pages: broken internal links, duplicate titles,
 * missing canonicals, malformed structured data.
 * ------------------------------------------------------------------------- */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/config.js';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');

const errors = [];
const warnings = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

async function walk(dir, base = '') {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...await walk(full, rel));
    else out.push({ full, rel });
  }
  return out;
}

const attr = (html, re) => { const m = html.match(re); return m ? m[1] : null; };

async function main() {
  const files = await walk(OUT);
  const htmlFiles = files.filter((f) => f.rel.endsWith('.html'));
  const assets = new Set(files.map((f) => '/' + f.rel));

  // Every URL the site can serve, in the trailing-slash form links use.
  const servable = new Set();
  for (const f of files) {
    servable.add('/' + f.rel);
    if (f.rel.endsWith('index.html')) {
      const dir = '/' + f.rel.replace(/index\.html$/, '');
      servable.add(dir);
      if (dir !== '/') servable.add(dir.replace(/\/$/, ''));
    }
  }

  const titles = new Map();
  const descriptions = new Map();

  for (const file of htmlFiles) {
    const html = await fs.readFile(file.full, 'utf8');
    const page = '/' + file.rel.replace(/index\.html$/, '');
    const noindex = /name="robots" content="noindex/.test(html);
    // Tool logic is inlined, so markup inside <script> and <style> is code, not
    // document structure. Strip it before checking headings, images and links.
    const markup = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

    // --- metadata -------------------------------------------------------
    const title = attr(html, /<title>([^<]*)<\/title>/);
    if (!title) fail(page, 'missing <title>');
    else {
      if (title.length > 65) warn(page, `title is ${title.length} chars, may be truncated in results`);
      if (title.length < 15) warn(page, `title is only ${title.length} chars`);
      if (!noindex) {
        if (titles.has(title)) fail(page, `duplicate title, also on ${titles.get(title)}`);
        else titles.set(title, page);
      }
    }

    const desc = attr(html, /<meta name="description" content="([^"]*)"/);
    if (!desc) fail(page, 'missing meta description');
    else {
      if (desc.length > 165) warn(page, `meta description is ${desc.length} chars, may be truncated`);
      if (desc.length < 60) warn(page, `meta description is only ${desc.length} chars`);
      if (!noindex) {
        if (descriptions.has(desc)) fail(page, `duplicate meta description, also on ${descriptions.get(desc)}`);
        else descriptions.set(desc, page);
      }
    }

    const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
    if (!canonical) fail(page, 'missing canonical');
    else if (!canonical.startsWith(site.origin)) fail(page, `canonical does not use the site origin: ${canonical}`);

    // --- headings -------------------------------------------------------
    const h1s = markup.match(/<h1[^>]*>/g) || [];
    if (h1s.length === 0) fail(page, 'no <h1>');
    if (h1s.length > 1) fail(page, `${h1s.length} <h1> elements, expected exactly 1`);

    // --- structured data ------------------------------------------------
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!blocks.length && !noindex) warn(page, 'no JSON-LD structured data');
    for (const [, json] of blocks) {
      try {
        const parsed = JSON.parse(json);
        const nodes = parsed['@graph'] || [parsed];
        for (const node of nodes) {
          if (!node['@type']) fail(page, 'JSON-LD node without @type');
        }
      } catch (e) {
        fail(page, `invalid JSON-LD: ${e.message}`);
      }
    }

    // --- WiFi QR escaping -------------------------------------------------
    // Backslashes inside a tool's inlined JS pass through a template literal,
    // so the WIFI: escape set has silently lost its backslash twice before.
    if (html.includes('WIFI:T:')) {
      const m = html.match(/replace\(\/\(\[([^\]]*)\]\)\/g/);
      if (!m) fail(page, 'builds a WIFI: payload but has no escaping regex');
      else if (!m[1].includes('\\\\')) {
        fail(page, `WIFI: escape set is missing the backslash -> [${m[1]}]`);
      }
    }

    // --- images ---------------------------------------------------------
    for (const [, tag] of markup.matchAll(/<img([^>]*)>/g)) {
      if (!/\salt=/.test(tag)) fail(page, 'an <img> has no alt attribute');
    }

    // --- internal links --------------------------------------------------
    for (const [, href] of markup.matchAll(/<a[^>]+href="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;
      const clean = href.split('#')[0].split('?')[0];
      if (!clean) continue;
      const target = clean.startsWith('/') ? clean : path.posix.join(page, clean);
      if (!servable.has(target) && !servable.has(target + '/') && !assets.has(target)) {
        fail(page, `broken internal link → ${href}`);
      }
    }

    // --- referenced assets ------------------------------------------------
    for (const [, src] of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:css|js|png|svg|webmanifest))"/g)) {
      if (!assets.has(src)) fail(page, `missing asset → ${src}`);
    }
  }

  // --- sitemap ------------------------------------------------------------
  const sitemap = await fs.readFile(path.join(OUT, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (new Set(locs).size !== locs.length) errors.push('sitemap.xml: duplicate <loc> entries');
  for (const loc of locs) {
    const p = loc.replace(site.origin + site.basePath, '') || '/';
    if (!servable.has(p)) errors.push(`sitemap.xml: lists a URL that is not built → ${p}`);
  }
  // Every indexable page should appear in the sitemap.
  for (const file of htmlFiles) {
    const html = await fs.readFile(file.full, 'utf8');
    if (/name="robots" content="noindex/.test(html)) continue;
    const page = '/' + file.rel.replace(/index\.html$/, '');
    const expected = site.origin + site.basePath + page;
    if (!locs.includes(expected)) warnings.push(`sitemap.xml: missing ${page}`);
  }

  // --- report -------------------------------------------------------------
  console.log(`checked ${htmlFiles.length} pages`);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log('  ! ' + w);
  }
  if (errors.length) {
    console.log(`\n${errors.length} error(s):`);
    for (const e of errors) console.log('  ✗ ' + e);
    process.exit(1);
  }
  console.log(errors.length ? '' : '\n✓ no errors');
}

main().catch((e) => { console.error(e); process.exit(1); });
