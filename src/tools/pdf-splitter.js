export default {
  slug: 'pdf-splitter',
  category: 'file-tools',
  title: 'PDF Splitter – Extract or Remove Pages From a PDF',
  h1: 'PDF Splitter',
  cardText: 'Pull out the pages you want, or split a PDF into separate files.',
  description:
    'Free PDF splitter. Extract a page range, remove unwanted pages, or split a PDF into single files. Runs in your browser — your document is never uploaded.',
  keywords: ['pdf splitter', 'split pdf', 'extract pages from pdf', 'delete pdf pages', 'separate pdf pages'],
  updated: '2026-09-04',
  lede: 'Choose the pages you want and download just those. Everything happens on your device.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose a PDF">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/>
  </svg>
  <p><strong>Drop a PDF here</strong> or click to choose</p>
  <p class="hint">Nothing is uploaded</p>
  <input type="file" id="file" accept="application/pdf,.pdf" hidden>
</div>

<div id="panel" hidden>
  <p class="hint" id="info" style="margin-top:14px"></p>

  <div class="field" style="margin-top:14px">
    <span class="field-label" id="mode-label">What do you want to do?</span>
    <div class="seg" role="group" aria-labelledby="mode-label" id="modes" style="flex-wrap:wrap">
      <button type="button" data-m="keep" aria-pressed="true">Keep these pages</button>
      <button type="button" data-m="remove">Remove these pages</button>
      <button type="button" data-m="each">Split into single pages</button>
    </div>
  </div>

  <div class="field" id="range-field">
    <label for="range">Pages</label>
    <input type="text" id="range" placeholder="1-3, 5, 8-10" autocomplete="off" style="font-family:var(--font-num)">
    <span class="hint" id="rangehint">Use commas and dashes, for example <code>1-3, 5, 8-10</code>.</span>
  </div>

  <div class="btn-row">
    <button type="button" class="btn btn-lg" id="go">Create PDF</button>
    <button type="button" class="btn btn-ghost" id="change">Choose another file</button>
  </div>
</div>

<p class="notice" id="done" hidden style="margin-top:16px;background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)"></p>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var file = null, pageCount = 0, mode = 'keep';
  var libPromise = null;

  function human(b){ return b < 1048576 ? (b/1024).toFixed(0) + ' KB' : (b/1048576).toFixed(2) + ' MB'; }

  function loadLib(){
    if (libPromise) return libPromise;
    libPromise = new Promise(function(resolve, reject){
      if (window.PDFLib) return resolve(window.PDFLib);
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = function(){ window.PDFLib ? resolve(window.PDFLib) : reject(new Error('library failed to initialise')); };
      s.onerror = function(){ reject(new Error('could not load the PDF library')); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  /** Parse "1-3, 5, 8-10" into zero-based page indices, deduplicated and sorted. */
  function parseRange(text, max){
    var out = {};
    text.split(',').forEach(function(part){
      part = part.trim();
      if (!part) return;
      var m = /^(\\d+)\\s*[-–]\\s*(\\d+)$/.exec(part);
      if (m) {
        var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
        if (a > b) { var t = a; a = b; b = t; }
        for (var i = a; i <= b; i++) if (i >= 1 && i <= max) out[i - 1] = 1;
        return;
      }
      var n = parseInt(part, 10);
      if (isFinite(n) && n >= 1 && n <= max) out[n - 1] = 1;
    });
    return Object.keys(out).map(Number).sort(function(a, b){ return a - b; });
  }

  function download(bytes, name){
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
    return blob.size;
  }

  function run(){
    if (!file) return;
    $('err').hidden = true;
    $('done').hidden = true;
    $('go').disabled = true;
    $('go').textContent = 'Working…';

    var baseName = file.name.replace(/\\.pdf$/i, '');

    loadLib().then(function(PDFLib){
      return file.arrayBuffer().then(function(buf){
        return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true }).then(function(src){
          var total = src.getPageCount();

          if (mode === 'each') {
            // One file per page, staggered so browsers do not block the downloads.
            var chain = Promise.resolve();
            for (var i = 0; i < total; i++) {
              (function(index){
                chain = chain.then(function(){
                  return PDFLib.PDFDocument.create().then(function(out){
                    return out.copyPages(src, [index]).then(function(pages){
                      out.addPage(pages[0]);
                      return out.save();
                    });
                  }).then(function(bytes){
                    download(bytes, baseName + '-page-' + (index + 1) + '.pdf');
                    return new Promise(function(r){ setTimeout(r, 250); });
                  });
                });
              })(i);
            }
            return chain.then(function(){ return { count: total, single: true }; });
          }

          var selected = parseRange($('range').value, total);
          if (!selected.length) throw new Error('No valid pages in that range. This PDF has ' + total + ' pages.');

          var indices;
          if (mode === 'keep') indices = selected;
          else {
            var drop = {};
            selected.forEach(function(i){ drop[i] = 1; });
            indices = [];
            for (var i = 0; i < total; i++) if (!drop[i]) indices.push(i);
            if (!indices.length) throw new Error('That would remove every page.');
          }

          return PDFLib.PDFDocument.create().then(function(out){
            return out.copyPages(src, indices).then(function(pages){
              pages.forEach(function(p){ out.addPage(p); });
              return out.save();
            });
          }).then(function(bytes){
            var size = download(bytes, baseName + (mode === 'keep' ? '-extracted.pdf' : '-trimmed.pdf'));
            return { count: indices.length, size: size };
          });
        });
      });
    }).then(function(result){
      $('done').hidden = false;
      $('done').textContent = result.single
        ? 'Split into ' + result.count + ' single-page files.'
        : 'Created a ' + result.count + '-page PDF (' + human(result.size) + ').';
      $('go').disabled = false;
      $('go').textContent = 'Create PDF';
    }).catch(function(e){
      $('err').hidden = false;
      $('err').textContent = e.message + (/password|encrypt/i.test(e.message)
        ? '' : ' Password-protected PDFs cannot be split — remove the password first.');
      $('go').disabled = false;
      $('go').textContent = 'Create PDF';
    });
  }

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
    $('info').textContent = f.name + ' · ' + human(f.size) + ' · reading…';

    loadLib().then(function(PDFLib){
      return f.arrayBuffer().then(function(buf){
        return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      });
    }).then(function(doc){
      pageCount = doc.getPageCount();
      $('info').textContent = f.name + ' · ' + human(f.size) + ' · ' + pageCount +
        (pageCount === 1 ? ' page' : ' pages');
      $('range').placeholder = '1-' + Math.min(3, pageCount) + (pageCount > 4 ? ', ' + pageCount : '');
      $('rangehint').innerHTML = 'This PDF has ' + pageCount + ' pages. Use commas and dashes, for example <code>1-3, 5</code>.';
    }).catch(function(e){
      $('info').textContent = f.name + ' · ' + human(f.size);
      $('err').hidden = false;
      $('err').textContent = 'Could not read that PDF: ' + e.message;
    });
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-m]'); if (!b) return;
    mode = b.getAttribute('data-m');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('range-field').hidden = mode === 'each';
  });
  $('go').addEventListener('click', run);
  $('change').addEventListener('click', function(){
    $('drop').hidden = false; $('panel').hidden = true;
    $('done').hidden = true; $('err').hidden = true;
    file = null;
  });
})();`,

  answerHeading: 'Extracting pages from a PDF',
  answer: `<p><strong>Splitting copies the pages you choose into a new document, leaving the original untouched.</strong> Page content is copied rather than re-rendered, so text stays selectable and images keep their original quality. Three things people usually want: pull out a range to send just the relevant section, remove pages that should not be shared, and break a scanned batch into individual files. All three are here, and all three run on your device.</p>`,

  steps: [
    'Drop in your PDF. The page count appears once it has been read.',
    'Choose whether to <strong>keep</strong> a range, <strong>remove</strong> one, or split every page into its own file.',
    'Enter the pages, using commas and dashes — <code>1-3, 5, 8-10</code>.',
    'Press <strong>Create PDF</strong> and the result downloads.',
  ],

  sections: [
    {
      id: 'ranges',
      h2: 'Writing page ranges',
      html: `<div class="table-scroll"><table>
<thead><tr><th>You type</th><th>You get</th></tr></thead>
<tbody>
<tr><td><code>1-5</code></td><td>Pages 1 to 5</td></tr>
<tr><td><code>3</code></td><td>Just page 3</td></tr>
<tr><td><code>1-3, 7, 10-12</code></td><td>Pages 1, 2, 3, 7, 10, 11, 12</td></tr>
<tr><td><code>5-1</code></td><td>Pages 1 to 5 — reversed ranges are corrected</td></tr>
<tr><td><code>2, 2, 3</code></td><td>Pages 2 and 3 — duplicates are ignored</td></tr>
</tbody></table></div>
<p>Pages always come out in document order, so listing them out of sequence does not reorder them. Numbers beyond the end of the document are ignored rather than causing an error.</p>`,
    },
    {
      id: 'redaction',
      h2: 'Removing a page is not redaction',
      html: `<p>Worth stating plainly, because it catches people out with real consequences.</p>
<p>Removing a page from a PDF does remove that page's content from the new file — that part is genuine. But <strong>drawing a black box over text does not remove it</strong>. The text remains underneath the rectangle and can be selected, copied or extracted by anyone. Government departments and law firms have repeatedly published documents redacted this way and had the hidden text recovered within hours.</p>
<p>If information must be removed, delete the whole page here, or use a tool with a true redaction feature that deletes the underlying content. Never rely on a shape drawn on top.</p>`,
    },
  ],

  faq: [
    { q: 'Is my PDF uploaded?', a: '<p>No. Only the PDF library code is fetched from a CDN; your document is read locally, processed in memory and downloaded. No file content is transmitted.</p>' },
    { q: 'How do I extract one page?', a: '<p>Choose "keep these pages" and type the single page number, such as <code>7</code>.</p>' },
    { q: 'Can I split a PDF into separate files for every page?', a: '<p>Yes — choose "split into single pages". Each page downloads as its own file, staggered slightly so your browser does not block them. Allow multiple downloads if prompted.</p>' },
    { q: 'Does splitting reduce quality?', a: '<p>No. Pages are copied rather than re-rendered, so text stays selectable and images are unchanged.</p>' },
    { q: 'Why will it not open my file?', a: '<p>The usual cause is password protection, which must be removed first. Badly damaged or non-standard PDFs can also fail to parse.</p>' },
    { q: 'Are bookmarks kept?', a: '<p>No. Bookmarks and outlines belong to the original document structure and are not carried across.</p>' },
  ],

  related: ['pdf-merger', 'image-to-pdf', 'image-compressor', 'signature-maker'],
};
