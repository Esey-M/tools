# CinchPad

Free, fast, browser-only tools for everyday tasks — calculators, converters, file utilities and generators. Static HTML, no framework, no tracking, no backend.

**Live site:** https://cinchpad.com

## How it works

Source lives in `src/`. A small Node script renders it to fully static HTML in `docs/`, which is what GitHub Pages serves.

```
src/
  config.js          brand, origin, ad client, categories — the only file a rebrand touches
  tools/<slug>.js    one file per tool: metadata, form HTML, logic, and page content
  posts/<slug>.md    blog posts (markdown + frontmatter)
  pages/<slug>.md    static pages (about, privacy, terms…)
  templates/         layout, tool page, home/category/blog templates
  lib/               markdown renderer, structured-data helpers, QR encoder
  assets/            style.css and app.js, copied verbatim
  static/            favicon, icons, OG image, copied verbatim
build.js             renders everything into docs/
scripts/check.js     post-build validation (run by CI)
scripts/serve.js     local preview server
```

## Commands

```bash
npm run build     # render src/ into docs/
npm run check     # build, then validate the output
npm test          # validate an existing build (used by CI)
npm run serve     # build and preview on http://localhost:4173
```

## Adding a tool

Create `src/tools/my-tool.js` exporting a default object. The filename must match the `slug`.

```js
export default {
  slug: 'my-tool',              // must equal the filename
  category: 'calculators',      // must exist in config.js
  title: 'My Tool – What It Does',   // <title>, aim for 50–60 chars
  h1: 'My Tool',
  cardText: 'One line shown on category and related-tool cards.',
  description: 'Meta description, 120–160 characters.',
  keywords: ['my tool', 'related phrase'],
  updated: '2026-09-04',
  lede: 'One or two sentences under the H1.',

  form: `<div class="field">…</div>`,   // the interactive UI
  css: `.my-tool { }`,                  // optional, inlined into <head>
  js: `(function(){ … })();`,           // optional, inlined before </body>

  answerHeading: 'What this tool tells you',
  answer: '<p>A direct 40–80 word answer…</p>',   // the block AI engines quote
  steps: ['Do this.', 'Then this.'],              // becomes HowTo schema
  sections: [{ id: 'formula', h2: 'The formula', html: '<p>…</p>' }],
  faq: [{ q: 'A real question?', a: '<p>A direct answer.</p>' }],  // FAQPage schema
  related: ['other-tool-slug'],
};
```

`npm run check` then verifies the page has a single H1, a unique title and description, a canonical URL, valid JSON-LD, and no broken links.

### Conventions worth keeping

- **State the formula on the page.** Every calculator shows its maths and a worked example.
- **Check the numbers in the prose against the code.** Figures quoted in the explanatory text should be computed, not remembered.
- **Say where the tool misleads.** Limitations sections are a large part of why these pages rank and get cited.
- **Keep everything client-side.** No tool should ever upload what a visitor types.

## Structured data and answer engines

Each page emits a single JSON-LD `@graph`: `Organization`, `WebSite`, plus `WebApplication`, `BreadcrumbList`, `HowTo` and `FAQPage` as applicable. Blog posts emit `BlogPosting`.

The build also writes `sitemap.xml`, `robots.txt` (explicitly allowing GPTBot, ClaudeBot, PerplexityBot and Google-Extended) and `llms.txt`, a plain-text map of every tool for LLM answer engines.

## Advertising

`site.adsenseClient` in `src/config.js` is empty by default, and ad slots render as zero-height placeholders. Set it to your `ca-pub-…` ID after AdSense approval and the slots activate with no layout shift. Slot IDs are the first argument to `adSlot()` in the templates.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds, validates and publishes `docs/` to GitHub Pages. Enable Pages with source **GitHub Actions** in repository settings.

For a custom domain: point the DNS at GitHub Pages, then set `customDomain` in `src/config.js`. The build writes the `CNAME` file only when that value is non-empty, so the default `*.github.io` URL keeps working until you are ready.

If you deploy to a project path instead (`user.github.io/repo`), set `basePath: '/repo'` in the same file.

## Licence

MIT.
