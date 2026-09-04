export default {
  slug: 'pdf-merger',
  category: 'file-tools',
  title: 'PDF Merger – Combine PDF Files Into One',
  h1: 'PDF Merger',
  cardText: 'Combine several PDFs into one document, in the order you choose.',
  description:
    'Free PDF merger. Combine multiple PDF files into one document, drag to reorder the files, and download. Runs in your browser — your files are never uploaded.',
  keywords: ['pdf merger', 'combine pdf', 'merge pdf files', 'join pdf', 'pdf combiner free'],
  updated: '2026-09-04',
  lede: 'Drop in your PDFs, drag them into the right order, and download one combined file. The merging happens on your device — nothing is uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose PDF files to merge">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/>
  </svg>
  <p><strong>Drop PDF files here</strong> or click to choose</p>
  <p class="hint">Add as many as you like · nothing is uploaded</p>
  <input type="file" id="file" accept="application/pdf,.pdf" multiple hidden>
</div>

<p class="hint" id="count" style="margin-top:12px"></p>
<div id="list" class="pdf-list"></div>

<div id="controls" hidden>
  <div class="btn-row" style="margin-top:18px">
    <button type="button" class="btn btn-lg" id="merge">Merge into one PDF</button>
    <button type="button" class="btn btn-ghost" id="clear">Clear</button>
  </div>
</div>

<p class="notice" id="done" hidden style="margin-top:16px;background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)"></p>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.pdf-list{display:flex;flex-direction:column;gap:8px}
.pdf-item{display:flex;align-items:center;gap:12px;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius);padding:11px 13px;cursor:grab}
.pdf-item.dragging{opacity:.45}
.pdf-item .grip{color:var(--ink-3);font-size:1.1rem;flex:none}
.pdf-item .ic{width:38px;height:38px;border-radius:8px;background:var(--bg-sunken);display:grid;place-items:center;
  flex:none;color:var(--ink-3);font-size:.68rem;font-weight:700;letter-spacing:.04em}
.pdf-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pdf-meta b{font-size:.92rem;font-weight:580;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pdf-meta span{font-size:.82rem;color:var(--ink-3)}
.pdf-item .pos{width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);
  display:grid;place-items:center;font-size:.8rem;font-weight:660;flex:none}
.pdf-item .rm{width:32px;height:32px;border:1px solid var(--line-strong);background:var(--bg);border-radius:var(--radius-sm);
  color:var(--ink-3);cursor:pointer;font-size:1.05rem;line-height:1;flex:none}
.pdf-item .rm:hover{border-color:var(--danger);color:var(--danger)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var items = [];
  var libPromise = null;

  function human(b){ return b < 1048576 ? (b/1024).toFixed(0) + ' KB' : (b/1048576).toFixed(2) + ' MB'; }

  /** Load pdf-lib on first use so the page itself stays light. */
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

  function render(){
    $('list').innerHTML = items.map(function(it, i){
      return '<div class="pdf-item" draggable="true" data-i="' + i + '">' +
        '<span class="grip" aria-hidden="true">⠿</span>' +
        '<span class="ic">PDF</span>' +
        '<span class="pdf-meta"><b>' + it.file.name.replace(/[<>&]/g,'') + '</b>' +
        '<span>' + human(it.file.size) + (it.pages ? ' · ' + it.pages + (it.pages === 1 ? ' page' : ' pages') : '') + '</span></span>' +
        '<span class="pos">' + (i + 1) + '</span>' +
        '<button type="button" class="rm" data-rm="' + i + '" aria-label="Remove">×</button></div>';
    }).join('');
    $('controls').hidden = items.length === 0;
    var totalPages = items.reduce(function(a, i){ return a + (i.pages || 0); }, 0);
    $('count').textContent = items.length
      ? items.length + (items.length === 1 ? ' file' : ' files') +
        (totalPages ? ', ' + totalPages + ' pages total' : '') + ' — drag to reorder'
      : '';
  }

  function addFiles(fileList){
    var accepted = [].slice.call(fileList).filter(function(f){
      return f.type === 'application/pdf' || /\\.pdf$/i.test(f.name);
    });
    var skipped = fileList.length - accepted.length;
    $('err').hidden = skipped === 0;
    if (skipped) $('err').textContent = skipped + ' file' + (skipped > 1 ? 's were' : ' was') + ' skipped — only PDFs can be merged.';
    if (!accepted.length) return;

    accepted.forEach(function(f){ items.push({ file: f, pages: 0 }); });
    render();

    // Read page counts in the background so the list is informative.
    loadLib().then(function(PDFLib){
      items.forEach(function(it){
        if (it.pages || it.counting) return;
        it.counting = true;
        it.file.arrayBuffer()
          .then(function(buf){ return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true }); })
          .then(function(doc){ it.pages = doc.getPageCount(); render(); })
          .catch(function(){ it.pages = 0; });
      });
    }).catch(function(){ /* page counts are optional */ });
  }

  function merge(){
    if (items.length < 2) {
      $('err').hidden = false;
      $('err').textContent = 'Add at least two PDFs to merge.';
      return;
    }
    $('err').hidden = true;
    $('merge').disabled = true;
    $('merge').textContent = 'Merging…';

    loadLib().then(function(PDFLib){
      return PDFLib.PDFDocument.create().then(function(out){
        var chain = Promise.resolve();
        items.forEach(function(it){
          chain = chain.then(function(){
            return it.file.arrayBuffer()
              .then(function(buf){ return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true }); })
              .then(function(src){ return out.copyPages(src, src.getPageIndices()); })
              .then(function(pages){ pages.forEach(function(p){ out.addPage(p); }); });
          });
        });
        return chain.then(function(){ return out.save(); }).then(function(bytes){
          return { bytes: bytes, pages: out.getPageCount() };
        });
      });
    }).then(function(result){
      var blob = new Blob([result.bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'merged.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);

      $('done').hidden = false;
      $('done').textContent = 'Merged ' + items.length + ' files into a ' + result.pages +
        '-page PDF (' + human(result.bytes.length) + ').';
      $('merge').disabled = false;
      $('merge').textContent = 'Merge into one PDF';
    }).catch(function(e){
      $('err').hidden = false;
      $('err').textContent = 'Could not merge: ' + e.message +
        '. Password-protected PDFs cannot be merged — remove the password first.';
      $('merge').disabled = false;
      $('merge').textContent = 'Merge into one PDF';
    });
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ addFiles(this.files); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ addFiles(e.dataTransfer.files); });

  $('list').addEventListener('click', function(e){
    var b = e.target.closest('button[data-rm]'); if (!b) return;
    items.splice(parseInt(b.getAttribute('data-rm'), 10), 1);
    render();
  });

  var dragIndex = null;
  $('list').addEventListener('dragstart', function(e){
    var item = e.target.closest('.pdf-item'); if (!item) return;
    dragIndex = parseInt(item.getAttribute('data-i'), 10);
    item.classList.add('dragging');
  });
  $('list').addEventListener('dragend', function(e){
    var item = e.target.closest('.pdf-item'); if (item) item.classList.remove('dragging');
  });
  $('list').addEventListener('dragover', function(e){ e.preventDefault(); });
  $('list').addEventListener('drop', function(e){
    e.preventDefault();
    var item = e.target.closest('.pdf-item');
    if (!item || dragIndex === null) return;
    var to = parseInt(item.getAttribute('data-i'), 10);
    if (to !== dragIndex) {
      var moved = items.splice(dragIndex, 1)[0];
      items.splice(to, 0, moved);
      render();
    }
    dragIndex = null;
  });

  $('merge').addEventListener('click', merge);
  $('clear').addEventListener('click', function(){
    items = []; render(); $('done').hidden = true; $('err').hidden = true;
  });
})();`,

  answerHeading: 'How merging works, and where your files go',
  answer: `<p><strong>Merging copies every page from each document into a new PDF, preserving the original page content exactly.</strong> Text stays selectable, links keep working, and quality is unchanged because nothing is re-rendered. This tool does that work in your browser: the PDF engine is a JavaScript library loaded from a CDN, but your actual files are read locally and never transmitted. Most free PDF sites upload your document to their servers instead — which matters when the document is a contract, a bank statement or a medical letter.</p>`,

  steps: [
    'Drop in the PDFs you want to combine, or click to choose them.',
    'Drag the rows to put them in the right order.',
    'Press <strong>Merge into one PDF</strong> and the combined file downloads.',
  ],

  sections: [
    {
      id: 'privacy',
      h2: 'What "runs in your browser" means here',
      html: `<p>Worth being precise, because this tool works slightly differently from the others on the site.</p>
<p>Parsing an arbitrary PDF is genuinely hard — cross-reference tables, object streams, several compression formats and decades of edge cases. Rather than reimplement that, this page loads <a href="https://pdf-lib.js.org" rel="noopener" target="_blank">pdf-lib</a>, an open-source library, from a public CDN.</p>
<p>That means one request to <code>cdnjs.cloudflare.com</code> for the library code. <strong>Your PDFs are not part of that request.</strong> They are read from your disk by your browser, merged in memory, and written back out as a download. No file content leaves your device at any point, which you can confirm in your browser's network tab.</p>`,
    },
    {
      id: 'limits',
      h2: 'What it can and cannot do',
      html: `<div class="table-scroll"><table>
<thead><tr><th></th><th>Handled</th></tr></thead>
<tbody>
<tr><td>Text, images and vector graphics</td><td>Yes, copied exactly</td></tr>
<tr><td>Mixed page sizes and orientations</td><td>Yes, each page keeps its own</td></tr>
<tr><td>Links within a page</td><td>Yes</td></tr>
<tr><td>Bookmarks and outlines</td><td>No — these are dropped</td></tr>
<tr><td>Form fields</td><td>Usually flattened or lost</td></tr>
<tr><td>Digital signatures</td><td>Invalidated, as with any editing</td></tr>
<tr><td>Password-protected files</td><td>No — remove the password first</td></tr>
</tbody></table></div>
<p>Digital signatures are worth understanding: a signature certifies a specific document, so any modification, including merging, necessarily breaks it. That is the signature working correctly rather than a bug.</p>`,
    },
  ],

  faq: [
    { q: 'Are my PDFs uploaded?', a: '<p>No. Only the library code is fetched from a CDN. Your files are read locally, merged in memory and downloaded — no file content is transmitted.</p>' },
    { q: 'Is there a file size or page limit?', a: '<p>No fixed limit, but everything is held in memory, so very large documents can slow the browser. Several hundred pages is comfortable on a typical machine.</p>' },
    { q: 'Can I merge password-protected PDFs?', a: '<p>No. Encrypted files must have the password removed first, usually in the program that created them or in Acrobat.</p>' },
    { q: 'Does merging reduce quality?', a: '<p>No. Pages are copied rather than re-rendered, so text remains selectable and images are unchanged. File size is roughly the sum of the inputs.</p>' },
    { q: 'How do I reorder the files?', a: '<p>Drag any row up or down. The number on the right shows where that file will land in the output.</p>' },
    { q: 'Why did my form fields disappear?', a: '<p>Interactive form fields belong to their original document’s structure and generally do not survive a merge. Flatten the form first if you need the filled-in values preserved as visible text.</p>' },
  ],

  related: ['image-to-pdf', 'image-compressor', 'photo-cropper', 'signature-maker'],
};
