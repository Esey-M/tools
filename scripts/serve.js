import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const PORT = Number(process.env.PORT) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};

http.createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, clean);
  // Block traversal outside the output directory.
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  if (clean.endsWith('/')) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const withIndex = path.join(file, 'index.html');
    if (fs.existsSync(withIndex)) file = withIndex;
    else {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(ROOT, '404.html')));
      return;
    }
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`serving docs/ on http://localhost:${PORT}`));
