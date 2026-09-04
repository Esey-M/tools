// ---------------------------------------------------------------------------
// Structured data. Search engines use this for rich results; LLM answer
// engines use it to identify what the page *is* and to quote it accurately.
// ---------------------------------------------------------------------------
import { site } from '../config.js';
import { textOf } from './html.js';

// Canonical URLs must match exactly what the server serves. Pages live at
// /slug/index.html, so the canonical form keeps its trailing slash.
export const url = (path = '/') => {
  const base = `${site.origin}${site.basePath}`;
  if (!path || path === '/') return `${base}/`;
  return base + (path.startsWith('/') ? path : `/${path}`);
};

export const publisher = () => ({
  '@type': 'Organization',
  '@id': `${site.origin}/#organization`,
  name: site.name,
  url: site.origin,
  logo: { '@type': 'ImageObject', url: `${site.origin}/icon-512.png`, width: 512, height: 512 },
});

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${site.origin}/#website`,
    name: site.name,
    url: site.origin,
    description: site.description,
    inLanguage: site.lang,
    publisher: { '@id': `${site.origin}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.origin}/search/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: url(item.href),
    })),
  };
}

export function faqSchema(faq = []) {
  if (!faq.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((entry) => ({
      '@type': 'Question',
      name: entry.q,
      acceptedAnswer: { '@type': 'Answer', text: textOf(entry.a) },
    })),
  };
}

/** A tool page is a free, browser-based WebApplication. */
export function toolSchema(tool) {
  return {
    '@type': 'WebApplication',
    '@id': `${url('/' + tool.slug + '/')}#app`,
    name: tool.h1 || tool.title,
    url: url('/' + tool.slug + '/'),
    description: tool.description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires JavaScript.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${site.origin}/#organization` },
    inLanguage: site.lang,
  };
}

/** Step-by-step usage instructions — eligible for HowTo rich results. */
export function howToSchema(tool) {
  if (!tool.steps || tool.steps.length < 2) return null;
  return {
    '@type': 'HowTo',
    name: `How to use the ${tool.h1 || tool.title}`,
    description: tool.description,
    totalTime: 'PT1M',
    step: tool.steps.map((text, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `Step ${index + 1}`,
      text: textOf(text),
      url: `${url('/' + tool.slug + '/')}#how-to`,
    })),
  };
}

export function articleSchema(post) {
  return {
    '@type': 'BlogPosting',
    '@id': `${url('/blog/' + post.slug + '/')}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: site.lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url('/blog/' + post.slug + '/') },
    author: { '@type': 'Organization', name: post.author || site.author, url: site.origin },
    publisher: { '@id': `${site.origin}/#organization` },
  };
}

export function itemListSchema(items, name) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.h1 || item.title,
      url: url('/' + item.slug + '/'),
    })),
  };
}

/** Wrap graph nodes into a single @graph document. */
export function graph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}
