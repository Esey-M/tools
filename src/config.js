// ---------------------------------------------------------------------------
// Single source of truth for site-wide identity. Renaming the brand or moving
// to a custom domain is a change to this file only.
// ---------------------------------------------------------------------------
export const site = {
  name: 'CinchPad',
  shortName: 'CinchPad',
  tagline: 'Everyday math, made a cinch',
  // No trailing slash. Used for canonicals, sitemap, OG tags, JSON-LD.
  origin: 'https://cinchpad.com',
  // GitHub Pages project sites live under /<repo>. Empty string for a custom
  // domain or a <user>.github.io repo.
  basePath: '',
  // Set this once the domain is bought and pointed at GitHub Pages. While it is
  // empty no CNAME file is written, so the default *.github.io URL keeps working.
  customDomain: '',
  locale: 'en_US',
  lang: 'en',
  description:
    'Free online calculators, converters and everyday tools. No signup, no downloads, no ads in your way. Works instantly in your browser on any device.',
  author: 'CinchPad',
  twitter: '',
  // Leave empty until AdSense is approved; ad slots render as inert
  // placeholders and take up no layout space when this is blank.
  adsenseClient: '',
  themeColor: '#0f7d6b',
};

export const categories = [
  { slug: 'calculators', name: 'Calculators', blurb: 'Money, health, dates and school maths worked out in one tap.', icon: 'calculator' },
  { slug: 'converters', name: 'Converters', blurb: 'Units, sizes, temperatures and time zones translated instantly.', icon: 'swap' },
  { slug: 'file-tools', name: 'File & Image Tools', blurb: 'Merge, compress, resize and convert files right in your browser.', icon: 'file' },
  { slug: 'random', name: 'Random Pickers', blurb: 'Flip, roll, spin and draw a fair winner when you cannot decide.', icon: 'dice' },
  { slug: 'health', name: 'Health & Body', blurb: 'Understand the numbers your body and your doctor care about.', icon: 'heart' },
  { slug: 'home', name: 'Home & Daily Life', blurb: 'Lists, budgets and household maths for real life.', icon: 'home' },
  { slug: 'fun', name: 'Fun & Social', blurb: 'Countdowns, quizzes and light-hearted things to share.', icon: 'sparkle' },
  { slug: 'text', name: 'Text & Documents', blurb: 'Count, convert and create text and simple documents.', icon: 'text' },
  { slug: 'generators', name: 'Generators', blurb: 'QR codes, passwords, barcodes and other things made to order.', icon: 'qr' },
];

export const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
