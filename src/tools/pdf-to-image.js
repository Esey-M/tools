export default {
  slug: 'pdf-to-image',
  category: 'file-tools',
  title: 'PDF to Image – Convert PDF Pages to PNG or JPG',
  h1: 'PDF to Image',
  cardText: 'Turn PDF pages into PNG or JPG images at the resolution you choose.',
  description:
    'Free PDF to image converter. Turn PDF pages into PNG or JPG at your chosen resolution, preview them, and download individually. Runs in your browser.',
  keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf to picture', 'extract pdf pages as images'],
  updated: '2026-09-04',
  lede: 'Renders each page to an image at whatever resolution you need. Your file is read locally and never uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose a PDF">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="10" cy="13" r="1.6"/><path d="m8 18 3-3 2 2 2-2 2 3"/>
  </svg>
  <p><strong>Drop a PDF here</strong> or click to choose</p>
  <p class="hint">Nothing is uploaded</p>
  <input type="file" id="file" accept="application/pdf,.pdf" hidden>
</div>

<div id="panel" hidden>
  <div class="row" style="margin-top:16px">
    <div class="field">
      <label for="format">Format</label>
      <select id="format">
        <option value="image/png" selected>PNG — sharp text, larger files</option>
        <option value="image/jpeg">JPEG — smaller files</option>
      </select>
    </div>
    <div class="field">
      <label for="dpi">Resolution</label>
      <select id="dpi">
        <option value="1">Screen — 72 dpi</option>
        <option value="2" selected>Good — 144 dpi</option>
        <option value="3">High — 216 dpi</option>
        <option value="4">Print — 288 dpi</option>
      </select>
    </div>
    <div class="field">
      <label for="range">Pages <span class="hint">(optional)</span></label>
      <input type="text" id="range" placeholder="all, or 1-3, 5" autocomplete="off" style="font-family:var(--font-num)">
    </div>
  </div>

  <div class="btn-row">
    <button type="button" class="btn btn-lg" id="go">Convert</button>
    <button type="button" class="btn btn-ghost" id="dlall" hidden>Download all</button>
    <button type="button" class="btn btn-ghost" id="change">Choose another file</button>
  </div>
  <p class="hint" id="info" style="margin-top:12px"></p>
</div>

<div id="pages" class="p2i-grid"></div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.p2i-grid{margin-top:22px;display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.p2i-card{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:10px;
  display:flex;flex-direction:column;gap:9px}
.p2i-card img{width:100%;height:auto;border:1px solid var(--line);border-radius:4px;background:#fff}
.p2i-card .row2{display:flex;align-items:center;justify-content:space-between;gap:8px}
.p2i-card small{font-size:.78rem;color:var(--ink-3)}
.p2i-card button{padding:6px 12px;font-size:.82rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var file = null, libPromise = null, results = [];

  function human(b){ return b < 1048576 ? (b/1024).toFixed(0) + ' KB' : (b/1048576).toFixed(2) + ' MB'; }

  function loadLib(){
    if (libPromise) return libPromise;
    libPromise = new Promise(function(resolve, reject){
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = function(){
        if (!window.pdfjsLib) return reject(new Error('library failed to initialise'));
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      s.onerror = function(){ reject(new Error('could not load the PDF library')); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function parseRange(text, max){
    if (!text.trim() || /^all$/i.test(text.trim())) {
      var all = [];
      for (var i = 1; i <= max; i++) all.push(i);
      return all;
    }
    var out = {};
    text.split(',').forEach(function(part){
      part = part.trim(); if (!part) return;
      var m = /^(\\d+)\\s*[-–]\\s*(\\d+)$/.exec(part);
      if (m) {
        var a = +m[1], b = +m[2];
        if (a > b) { var t = a; a = b; b = t; }
        for (var i = a; i <= b; i++) if (i >= 1 && i <= max) out[i] = 1;
        return;
      }
      var n = parseInt(part, 10);
      if (isFinite(n) && n >= 1 && n <= max) out[n] = 1;
    });
    return Object.keys(out).map(Number).sort(function(a, b){ return a - b; });
  }

  function convert(){
    if (!file) return;
    $('err').hidden = true;
    $('go').disabled = true;
    $('go').textContent = 'Converting…';
    $('pages').innerHTML = '';
    results = [];

    var type = $('format').value;
    var scale = parseFloat($('dpi').value);
    var ext = type === 'image/png' ? 'png' : 'jpg';

    // A blocked worker script can leave the load pending forever, so fail loudly
    // rather than sitting on a spinner.
    var timeout = new Promise(function(_, reject){
      setTimeout(function(){
        reject(new Error('the PDF engine did not respond within 30 seconds'));
      }, 30000);
    });

    Promise.race([loadLib().then(function(pdfjsLib){
      return file.arrayBuffer().then(function(buf){
        return pdfjsLib.getDocument({ data: buf }).promise;
      });
    }), timeout]).then(function(doc){
      var wanted = parseRange($('range').value, doc.numPages);
      if (!wanted.length) throw new Error('No valid pages in that range. This PDF has ' + doc.numPages + ' pages.');

      var chain = Promise.resolve();
      wanted.forEach(function(pageNum){
        chain = chain.then(function(){
          return doc.getPage(pageNum).then(function(page){
            var viewport = page.getViewport({ scale: scale });
            var canvas = document.createElement('canvas');
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            var ctx = canvas.getContext('2d');
            // JPEG has no alpha, so flatten onto white.
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function(){
              return new Promise(function(resolve){
                canvas.toBlob(function(blob){
                  var url = URL.createObjectURL(blob);
                  results.push({ page: pageNum, url: url, size: blob.size, w: canvas.width, h: canvas.height, ext: ext });
                  addCard(results[results.length - 1]);
                  resolve();
                }, type, 0.92);
              });
            });
          });
        });
      });
      return chain.then(function(){ return { pages: wanted.length, total: doc.numPages }; });
    }).then(function(r){
      $('info').textContent = 'Converted ' + r.pages + ' of ' + r.total + ' pages at ' +
        Math.round(72 * scale) + ' dpi.';
      $('go').disabled = false;
      $('go').textContent = 'Convert';
      $('dlall').hidden = results.length < 2;
    }).catch(function(e){
      $('err').hidden = false;
      $('err').textContent = 'Could not convert: ' + e.message +
        '. Password-protected PDFs cannot be converted — remove the password first.';
      $('go').disabled = false;
      $('go').textContent = 'Convert';
    });
  }

  function addCard(r){
    var div = document.createElement('div');
    div.className = 'p2i-card';
    div.innerHTML = '<img alt="Page ' + r.page + '" src="' + r.url + '">' +
      '<div class="row2"><small>Page ' + r.page + ' · ' + r.w + '×' + r.h + ' · ' + human(r.size) + '</small>' +
      '<button type="button" class="btn" data-p="' + r.page + '">Save</button></div>';
    $('pages').appendChild(div);
  }

  function download(r){
    var a = document.createElement('a');
    a.href = r.url;
    a.download = (file.name.replace(/\\.pdf$/i, '') || 'page') + '-' + r.page + '.' + r.ext;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  $('pages').addEventListener('click', function(e){
    var b = e.target.closest('button[data-p]'); if (!b) return;
    var page = parseInt(b.getAttribute('data-p'), 10);
    var r = results.filter(function(x){ return x.page === page; })[0];
    if (r) download(r);
  });
  $('dlall').addEventListener('click', function(){
    results.forEach(function(r, i){ setTimeout(function(){ download(r); }, i * 260); });
  });

  function load(f){
    if (!(f.type === 'application/pdf' || /\\.pdf$/i.test(f.name))) {
      $('err').hidden = false;
      $('err').textContent = 'That is not a PDF file.';
      return;
    }
    $('err').hidden = true;
    file = f;
    $('panel').hidden = false;
    $('drop').hidden = true;
    $('info').textContent = f.name + ' · ' + human(f.size);
    $('pages').innerHTML = '';
    $('dlall').hidden = true;
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  $('go').addEventListener('click', convert);
  $('change').addEventListener('click', function(){
    $('drop').hidden = false; $('panel').hidden = true;
    $('pages').innerHTML = ''; file = null;
  });
})();`,

  answerHeading: 'What converting to an image costs you',
  answer: `<p><strong>Rendering a PDF page to an image turns text into pixels, and that is permanent.</strong> The result is no longer selectable, searchable or scalable — it is a photograph of a document. That is exactly what you want for a thumbnail, a slide, or embedding a page in a design. It is exactly what you do not want if anyone needs to copy text from it. Choose the resolution deliberately: 144 dpi is fine on screen, 288 dpi is the minimum for print.</p>`,

  steps: [
    'Drop in your PDF.',
    'Choose PNG for sharp text or JPEG for smaller files.',
    'Pick a resolution, and a page range if you do not want all of them.',
    'Convert, then save individual pages or all of them.',
  ],

  sections: [
    {
      id: 'settings',
      h2: 'Choosing format and resolution',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Purpose</th><th>Format</th><th>Resolution</th></tr></thead>
<tbody>
<tr><td>Thumbnail or preview</td><td>JPEG</td><td>72 dpi</td></tr>
<tr><td>Embedding in a document or slide</td><td>PNG</td><td>144 dpi</td></tr>
<tr><td>Posting online</td><td>PNG for text, JPEG for photos</td><td>144 dpi</td></tr>
<tr><td>Printing</td><td>PNG</td><td>288 dpi</td></tr>
<tr><td>Archiving a scan</td><td>PNG</td><td>216–288 dpi</td></tr>
</tbody></table></div>
<p>PNG is lossless and keeps text edges crisp, which matters because JPEG compression puts visible fuzz around sharp lines — and a page of text is nothing but sharp lines. Use JPEG only when the page is mostly photographic or the file size genuinely matters.</p>`,
    },
    {
      id: 'privacy',
      h2: 'Where the file goes',
      html: `<p>As with the other PDF tools here, the rendering engine — Mozilla's pdf.js — is fetched from a public CDN, and your document is not. The PDF is read from your disk by your browser, rendered to a canvas in memory, and turned into image files locally.</p>
<p>You can confirm this in your browser's network tab: one request for the library, none carrying your file.</p>`,
    },
  ],

  faq: [
    { q: 'Is my PDF uploaded?', a: '<p>No. Only the rendering library is fetched from a CDN. Your document is read and rendered locally.</p>' },
    { q: 'PNG or JPG?', a: '<p>PNG for anything with text — it is lossless and keeps edges sharp. JPEG for photographic pages where file size matters more than crispness.</p>' },
    { q: 'What resolution should I choose?', a: '<p>144 dpi for screen use, 288 dpi for printing. Higher resolutions produce much larger files and take longer to render.</p>' },
    { q: 'Can I still select the text afterwards?', a: '<p>No. Converting to an image discards the text layer permanently. Keep the original PDF if you need the text.</p>' },
    { q: 'Why did nothing happen with my file?', a: '<p>Usually password protection, which must be removed first. Very large or unusually structured PDFs can also fail to render.</p>' },
    { q: 'Can I convert only some pages?', a: '<p>Yes — enter a range like <code>1-3, 7</code> in the pages field. Leave it blank or type "all" for the whole document.</p>' },
  ],

  related: ['pdf-merger', 'pdf-splitter', 'image-to-pdf', 'image-compressor'],
};
