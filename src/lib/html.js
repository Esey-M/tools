/** Escape a string for safe interpolation into HTML text or attributes. */
export function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape for embedding inside a <script> block (prevents </script> breakout). */
export function jsonScript(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Strip HTML tags and collapse whitespace — used to derive plain-text excerpts. */
export function textOf(html) {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}
