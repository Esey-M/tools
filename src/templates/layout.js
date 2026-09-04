import { site, categories } from '../config.js';
import { state } from '../lib/state.js';
import { esc, jsonScript } from '../lib/html.js';
import { url } from '../lib/seo.js';

const B = site.basePath;

function head({ title, description, canonical, schema, noindex, extraCss, ogType = 'website', published, modified }) {
  const ogImage = `${site.origin}${B}/og-default.png`;
  return `<!doctype html>
<html lang="${site.lang}" data-theme-init>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">'}
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="light dark">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${published ? `<meta property="article:published_time" content="${published}">` : ''}
${modified ? `<meta property="article:modified_time" content="${modified}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" href="${B}/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${B}/icon-192.png">
<link rel="manifest" href="${B}/site.webmanifest">
<link rel="preload" href="${B}/style.css" as="style">
<link rel="stylesheet" href="${B}/style.css">
${extraCss ? `<style>${extraCss}</style>` : ''}
<script>
/* Apply the saved theme before first paint so there is no flash. */
(function(){try{var t=localStorage.getItem('cp-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
</script>
${schema ? `<script type="application/ld+json">${jsonScript(schema)}</script>` : ''}
${site.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}" crossorigin="anonymous"></script>` : ''}
</head>
<body>`;
}

function header(currentPath = '') {
  const isCurrent = (href) => (currentPath === href ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="${B}/">
      <span class="brand-mark" aria-hidden="true">C</span>
      <span>${esc(site.name)}</span>
    </a>
    <div class="search" role="search">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/></svg>
      <input type="search" id="site-search" placeholder="Search 100+ tools…" autocomplete="off"
             role="combobox" aria-expanded="false" aria-controls="search-results" aria-label="Search tools">
      <div class="search-results" id="search-results" role="listbox" hidden></div>
    </div>
    <nav class="nav" aria-label="Main">
      <a class="hide-sm" href="${B}/tools/"${isCurrent('/tools/')}>All tools</a>
      <a class="hide-sm" href="${B}/blog/"${isCurrent('/blog/')}>Blog</a>
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="Switch between light and dark theme">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z"/>
        </svg>
      </button>
    </nav>
  </div>
</header>`;
}

function footer() {
  const cols = [
    { title: 'Popular tools', links: [
      ['/bmi-calculator/', 'BMI calculator'],
      ['/age-calculator/', 'Age calculator'],
      ['/tip-calculator/', 'Tip calculator'],
      ['/percentage-calculator/', 'Percentage calculator'],
      ['/qr-code-generator/', 'QR code generator'],
    ]},
    { title: 'Categories', links: state.liveCategories.slice(0, 5).map((c) => [`/category/${c.slug}/`, c.name]) },
    { title: 'Site', links: [
      ['/tools/', 'All tools'],
      ['/blog/', 'Blog'],
      ['/about/', 'About'],
      ['/contact/', 'Contact'],
    ]},
  ];
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="${B}/" style="margin-bottom:10px">
          <span class="brand-mark" aria-hidden="true">C</span><span>${esc(site.name)}</span>
        </a>
        <p style="max-width:36ch;color:var(--ink-3);font-size:.88rem">
          Free, fast, private tools for everyday life. Everything runs in your browser — nothing you type is uploaded.
        </p>
      </div>
      ${cols.map((col) => `<div>
        <h2>${col.title}</h2>
        <ul>${col.links.map(([href, label]) => `<li><a href="${B}${href}">${esc(label)}</a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>
    <div class="foot-legal">
      <span>© ${new Date().getFullYear()} ${esc(site.name)}. Results are estimates — see our <a href="${B}/disclaimer/">disclaimer</a>.</span>
      <span><a href="${B}/privacy/">Privacy</a> · <a href="${B}/terms/">Terms</a> · <a href="${B}/sitemap.xml">Sitemap</a></span>
    </div>
  </div>
</footer>`;
}

function foot({ inlineJs, searchIndex }) {
  return `${searchIndex ? `<script id="tool-index" type="application/json">${jsonScript(searchIndex)}</script>` : ''}
<script src="${B}/app.js" defer></script>
${inlineJs ? `<script>${inlineJs}</script>` : ''}
</body>
</html>`;
}

/** Render a full page. `content` is the inner HTML of <main>. */
export function layout(opts) {
  return [
    head(opts),
    header(opts.currentPath),
    `<main id="main">${opts.fullBleed ? opts.content : `<div class="wrap">${opts.content}</div>`}</main>`,
    footer(),
    foot(opts),
  ].join('\n');
}

/** An ad slot that reserves no space until AdSense is configured. */
export function adSlot(slotId, format = 'auto') {
  if (!site.adsenseClient) return `<div class="ad" data-empty="true" data-slot="${slotId}"></div>`;
  return `<aside class="ad" aria-label="Advertisement">
  <div class="ad-label">Advertisement</div>
  <ins class="adsbygoogle" style="display:block"
       data-ad-client="${site.adsenseClient}" data-ad-slot="${slotId}"
       data-ad-format="${format}" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
</aside>`;
}

export function breadcrumbs(trail) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${trail
    .map((item, i) =>
      i === trail.length - 1
        ? `<li><span aria-current="page">${esc(item.name)}</span></li>`
        : `<li><a href="${B}${item.href}">${esc(item.name)}</a></li>`
    )
    .join('')}</ol></nav>`;
}
