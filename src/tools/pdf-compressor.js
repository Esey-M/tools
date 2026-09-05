import fs from 'node:fs';
const pdfWriter = fs.readFileSync(new URL('../lib/pdf.js', import.meta.url), 'utf8');

const toolJs = `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var file = null, libPromise = null, output = null;

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

  var PRESETS = {
    high:   { scale: 2.0, quality: 0.82, label: 'High quality — best for text you still need to read closely' },
    medium: { scale: 1.4, quality: 0.72, label: 'Balanced — good for emailing scans and forms' },
    low:    { scale: 1.0, quality: 0.6,  label: 'Small — screen viewing only, text softens noticeably' }
  };

  function compress(){
    if (!file) return;
    $('err').hidden = true;
    $('done').hidden = true;
    $('go').disabled = true;
    $('go').textContent = 'Compressing…';

    var preset = PRESETS[$('level').value];
    var timeout = new Promise(function(_, reject){
      setTimeout(function(){ reject(new Error('the PDF engine did not respond within 60 seconds')); }, 60000);
    });

    Promise.race([loadLib().then(function(pdfjsLib){
      return file.arrayBuffer().then(function(buf){
        return pdfjsLib.getDocument({ data: buf }).promise;
      });
    }), timeout]).then(function(doc){
      var pages = [];
      var chain = Promise.resolve();
      for (var i = 1; i <= doc.numPages; i++) {
        (function(num){
          chain = chain.then(function(){
            $('go').textContent = 'Page ' + num + ' of ' + doc.numPages + '…';
            return doc.getPage(num).then(function(page){
              var viewport = page.getViewport({ scale: preset.scale });
              var canvas = document.createElement('canvas');
              canvas.width = Math.round(viewport.width);
              canvas.height = Math.round(viewport.height);
              var ctx = canvas.getContext('2d');
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function(){
                return new Promise(function(resolve){
                  canvas.toBlob(function(blob){
                    blob.arrayBuffer().then(function(ab){
                      // Page size in points is the viewport at scale 1.
                      var base = page.getViewport({ scale: 1 });
                      pages.push({
                        jpeg: new Uint8Array(ab),
                        width: canvas.width, height: canvas.height,
                        pageWidth: base.width, pageHeight: base.height,
                        x: 0, y: 0, drawWidth: base.width, drawHeight: base.height
                      });
                      resolve();
                    });
                  }, 'image/jpeg', preset.quality);
                });
              });
            });
          });
        })(i);
      }
      return chain.then(function(){ return pages; });
    }).then(function(pages){
      var bytes = SimplePDF.build(pages);
      output = new Blob([bytes], { type: 'application/pdf' });

      var saved = (1 - output.size / file.size) * 100;
      $('done').hidden = false;
      $('done').innerHTML = saved > 0
        ? '<strong>' + human(file.size) + ' → ' + human(output.size) + '</strong> — ' +
          saved.toFixed(0) + '% smaller, ' + pages.length + ' pages.'
        : '<strong>No saving on this file.</strong> It was already ' + human(file.size) +
          ' and the compressed version is ' + human(output.size) +
          '. Text-only PDFs are usually already smaller than any image version of them.';
      $('dl').hidden = false;
      $('go').disabled = false;
      $('go').textContent = 'Compress';
    }).catch(function(e){
      $('err').hidden = false;
      $('err').textContent = 'Could not compress: ' + e.message +
        '. Password-protected PDFs must have the password removed first.';
      $('go').disabled = false;
      $('go').textContent = 'Compress';
    });
  }

  function load(f){
    if (!(f.type === 'application/pdf' || /\\.pdf$/i.test(f.name))) {
      $('err').hidden = false;
      $('err').textContent = 'That is not a PDF file.';
      return;
    }
    $('err').hidden = true;
    file = f; output = null;
    $('panel').hidden = false;
    $('drop').hidden = true;
    $('dl').hidden = true;
    $('done').hidden = true;
    $('info').textContent = f.name + ' · ' + human(f.size);
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  $('level').addEventListener('change', function(){
    $('leveldesc').textContent = PRESETS[this.value].label;
  });
  $('go').addEventListener('click', compress);
  $('dl').addEventListener('click', function(){
    if (!output) return;
    var url = URL.createObjectURL(output);
    var a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\\.pdf$/i, '') + '-compressed.pdf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
  });
  $('change').addEventListener('click', function(){
    $('drop').hidden = false; $('panel').hidden = true;
    file = null; output = null;
  });

  $('leveldesc').textContent = PRESETS.medium.label;
})();`;

export default {
  slug: 'pdf-compressor',
  category: 'file-tools',
  title: 'PDF Compressor – Shrink a PDF for Email',
  h1: 'PDF Compressor',
  cardText: 'Reduce a PDF to fit an email limit. Best on scans and image-heavy files.',
  description:
    'Free PDF compressor. Shrink a PDF to fit an email attachment limit, with three quality levels. Runs in your browser — your document is never uploaded.',
  keywords: ['pdf compressor', 'compress pdf', 'reduce pdf size', 'shrink pdf for email', 'make pdf smaller'],
  updated: '2026-09-04',
  lede: 'Best on scanned documents and image-heavy PDFs. It works by re-rendering each page as an image, so read the trade-off below before using it on a text document.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose a PDF">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15l3 3 3-3"/>
  </svg>
  <p><strong>Drop a PDF here</strong> or click to choose</p>
  <p class="hint">Nothing is uploaded</p>
  <input type="file" id="file" accept="application/pdf,.pdf" hidden>
</div>

<div id="panel" hidden>
  <p class="hint" id="info" style="margin-top:14px"></p>
  <div class="field" style="margin-top:12px">
    <label for="level">Compression level</label>
    <select id="level">
      <option value="high">High quality — larger file</option>
      <option value="medium" selected>Balanced</option>
      <option value="low">Small — lowest quality</option>
    </select>
    <span class="hint" id="leveldesc"></span>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-lg" id="go">Compress</button>
    <button type="button" class="btn" id="dl" hidden>Download</button>
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

  js: pdfWriter + '\n' + toolJs,

  answerHeading: 'Read this before compressing a text PDF',
  answer: `<p><strong>This works by rendering each page to an image and rebuilding the PDF from those images — which makes scans much smaller and text documents worse.</strong> A scanned document is already pictures, so re-encoding them at lower quality genuinely shrinks the file, often by 60–90%. A text-based PDF stores letters as compact instructions, and turning those into pixels usually makes the file <em>bigger</em> while destroying the searchable, selectable text. If your PDF is text you generated from a document, do not compress it here.</p>`,

  steps: [
    'Drop in your PDF.',
    'Pick a level — balanced suits most scans.',
    'Press compress. Progress is shown page by page.',
    'Check the size shown before downloading; if there is no saving, the tool says so.',
  ],

  sections: [
    {
      id: 'when',
      h2: 'When this helps and when it hurts',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Your PDF</th><th>Result</th></tr></thead>
<tbody>
<tr><td>Scanned document or photographed pages</td><td>Big saving — often 60–90%</td></tr>
<tr><td>Presentation with large photos</td><td>Good saving</td></tr>
<tr><td>Brochure or magazine export</td><td>Good saving</td></tr>
<tr><td>Text document exported from Word or LaTeX</td><td>Usually larger, and text stops being selectable</td></tr>
<tr><td>Form you need to keep fillable</td><td>Do not — the fields are lost</td></tr>
<tr><td>Anything needing to stay searchable</td><td>Do not — the text layer is discarded</td></tr>
</tbody></table></div>
<p>The tool reports honestly when the compressed version is not smaller, rather than handing you a worse file and calling it a saving.</p>`,
    },
    {
      id: 'alternatives',
      h2: 'Other ways to get under an email limit',
      html: `<ul>
<li><strong>Re-export at lower quality.</strong> Most programs offer a "smallest file size" or "web" PDF export, which compresses images while keeping text as text. Always try this first.</li>
<li><strong>Split the document.</strong> Two emails of 15 MB beat one of 30 MB. The <a href="/pdf-splitter/">PDF splitter</a> does this without re-rendering anything.</li>
<li><strong>Compress the images first.</strong> If you are building the PDF from photos, run them through the <a href="/image-compressor/">image compressor</a> and then use <a href="/image-to-pdf/">image to PDF</a>.</li>
<li><strong>Scan at a lower dpi.</strong> Documents scanned at 600 dpi are four times the size of 300 dpi with no readable benefit for plain text.</li>
<li><strong>Use a link instead.</strong> Cloud storage sidesteps attachment limits entirely, and most workplaces prefer it.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Is my PDF uploaded?', a: '<p>No. The rendering library is fetched from a CDN; your document is read, rendered and rebuilt entirely on your device.</p>' },
    { q: 'Why did my file get bigger?', a: '<p>Because it was a text PDF. Text is stored very compactly as drawing instructions, and converting it to images is almost always larger. The tool tells you when this happens rather than pretending otherwise.</p>' },
    { q: 'Will the text still be selectable?', a: '<p>No. Pages become images, so text cannot be selected, searched or copied. That is the fundamental trade-off of this approach.</p>' },
    { q: 'What email attachment limit should I aim for?', a: '<p>Gmail and Outlook both cap around 20–25 MB, and many corporate systems are stricter at 10 MB. Aim under 10 MB to be safe.</p>' },
    { q: 'Can it compress a password-protected PDF?', a: '<p>No. Remove the password first in the program that created it or in Acrobat.</p>' },
    { q: 'Does it keep bookmarks and links?', a: '<p>No. Rebuilding from images discards bookmarks, links, form fields and any text layer.</p>' },
  ],

  related: ['pdf-splitter', 'pdf-merger', 'image-compressor', 'image-to-pdf'],
};
