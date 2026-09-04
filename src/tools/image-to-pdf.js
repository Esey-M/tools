import fs from 'node:fs';
const pdfSource = fs.readFileSync(new URL('../lib/pdf.js', import.meta.url), 'utf8');

const toolJs = `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var items = [];

  function human(b){ return b < 1048576 ? (b/1024).toFixed(0) + ' KB' : (b/1048576).toFixed(2) + ' MB'; }

  function render(){
    $('list').innerHTML = items.map(function(it, i){
      return '<div class="pdf-item" draggable="true" data-i="' + i + '">' +
        '<span class="grip" aria-hidden="true">⠿</span>' +
        '<img alt="" src="' + it.thumb + '">' +
        '<span class="pdf-meta"><b>' + it.file.name.replace(/[<>&]/g,'') + '</b>' +
        '<span>' + it.w + '×' + it.h + ' · ' + human(it.file.size) + '</span></span>' +
        '<span class="pos">' + (i + 1) + '</span>' +
        '<button type="button" class="rm" data-rm="' + i + '" aria-label="Remove">×</button></div>';
    }).join('');
    $('controls').hidden = items.length === 0;
    $('count').textContent = items.length
      ? items.length + (items.length === 1 ? ' image' : ' images') + ' — drag to reorder'
      : '';
  }

  function addFiles(fileList){
    var accepted = [].slice.call(fileList).filter(function(f){ return /^image\\/(jpeg|png|webp)$/.test(f.type); });
    var skipped = fileList.length - accepted.length;
    $('err').hidden = skipped === 0;
    if (skipped) $('err').textContent = skipped + ' file' + (skipped > 1 ? 's were' : ' was') +
      ' skipped — only JPG, PNG and WebP images can be added.';

    var pending = accepted.length;
    if (!pending) return;
    accepted.forEach(function(f){
      var url = URL.createObjectURL(f);
      var img = new Image();
      img.onload = function(){
        items.push({ file: f, thumb: url, w: img.naturalWidth, h: img.naturalHeight, img: img });
        if (--pending === 0) render();
      };
      img.onerror = function(){ URL.revokeObjectURL(url); if (--pending === 0) render(); };
      img.src = url;
    });
  }

  // Re-encode every image as JPEG so it can be embedded with DCTDecode.
  function toJpeg(item, quality){
    return new Promise(function(resolve){
      var canvas = document.createElement('canvas');
      var maxDim = 2400;
      var w = item.w, h = item.h;
      if (Math.max(w, h) > maxDim) {
        var s = maxDim / Math.max(w, h);
        w = Math.round(w * s); h = Math.round(h * s);
      }
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(item.img, 0, 0, w, h);
      canvas.toBlob(function(blob){
        blob.arrayBuffer().then(function(buf){
          resolve({ jpeg: new Uint8Array(buf), width: w, height: h });
        });
      }, 'image/jpeg', quality);
    });
  }

  function buildPdf(){
    if (!items.length) return;
    $('make').disabled = true;
    $('make').textContent = 'Building…';

    var sizeKey = $('size').value;
    var orientation = $('orient').value;
    var margin = parseFloat($('margin').value);
    var quality = parseFloat($('quality').value) / 100;

    Promise.all(items.map(function(it){ return toJpeg(it, quality); })).then(function(encoded){
      var pages = encoded.map(function(e){
        var pw, ph;
        if (sizeKey === 'fit') {
          // Page matches the image, at 72 dpi-equivalent scaling.
          var scale = Math.min(1, 1000 / Math.max(e.width, e.height));
          pw = e.width * scale; ph = e.height * scale;
        } else {
          var dims = SimplePDF.SIZES[sizeKey];
          var portrait = orientation === 'portrait' ||
            (orientation === 'auto' && e.height >= e.width);
          pw = portrait ? dims[0] : dims[1];
          ph = portrait ? dims[1] : dims[0];
        }
        var box = SimplePDF.fit(e.width, e.height, pw, ph, sizeKey === 'fit' ? 0 : margin);
        return {
          jpeg: e.jpeg, width: e.width, height: e.height,
          pageWidth: pw, pageHeight: ph,
          x: box.x, y: box.y, drawWidth: box.drawWidth, drawHeight: box.drawHeight
        };
      });

      var bytes = SimplePDF.build(pages);
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'images.pdf';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);

      $('make').disabled = false;
      $('make').textContent = 'Create PDF';
      $('done').hidden = false;
      $('done').textContent = 'Created a ' + pages.length + '-page PDF (' + human(bytes.length) + ').';
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
    var i = parseInt(b.getAttribute('data-rm'), 10);
    URL.revokeObjectURL(items[i].thumb);
    items.splice(i, 1);
    render();
  });

  // Drag to reorder pages.
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
    if (to === dragIndex) return;
    var moved = items.splice(dragIndex, 1)[0];
    items.splice(to, 0, moved);
    dragIndex = null;
    render();
  });

  $('quality').addEventListener('input', function(){ $('qval').textContent = this.value; });
  $('size').addEventListener('change', function(){
    var fit = this.value === 'fit';
    $('orient').disabled = fit;
    $('margin').disabled = fit;
  });
  $('make').addEventListener('click', buildPdf);
  $('clear').addEventListener('click', function(){
    items.forEach(function(i){ URL.revokeObjectURL(i.thumb); });
    items = []; render(); $('done').hidden = true; $('err').hidden = true;
  });
})();`;

export default {
  slug: 'image-to-pdf',
  category: 'file-tools',
  title: 'Image to PDF – Combine Photos Into One PDF',
  h1: 'Image to PDF',
  cardText: 'Turn photos into a PDF, several to a document, in the order you choose.',
  description:
    'Free image to PDF converter. Combine JPG, PNG and WebP images into a single PDF, reorder the pages by dragging, and choose page size and margins. No upload.',
  keywords: ['image to pdf', 'jpg to pdf', 'photos to pdf', 'combine images into pdf', 'png to pdf'],
  updated: '2026-09-04',
  lede: 'Drop in your photos, drag them into order, and download a single PDF. Built entirely in your browser — the images are never uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose images to convert">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>
  </svg>
  <p><strong>Drop images here</strong> or click to choose</p>
  <p class="hint">JPG, PNG or WebP · add as many as you like · nothing is uploaded</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
</div>

<p class="hint" id="count" style="margin-top:12px"></p>
<div id="list" class="pdf-list"></div>

<div id="controls" hidden>
  <div class="row" style="margin-top:18px">
    <div class="field">
      <label for="size">Page size</label>
      <select id="size">
        <option value="a4" selected>A4</option>
        <option value="letter">US Letter</option>
        <option value="legal">US Legal</option>
        <option value="a5">A5</option>
        <option value="fit">Fit page to image</option>
      </select>
    </div>
    <div class="field">
      <label for="orient">Orientation</label>
      <select id="orient">
        <option value="auto" selected>Match each image</option>
        <option value="portrait">Portrait</option>
        <option value="landscape">Landscape</option>
      </select>
    </div>
    <div class="field">
      <label for="margin">Margin</label>
      <select id="margin">
        <option value="0">None</option>
        <option value="18">Small</option>
        <option value="36" selected>Normal</option>
        <option value="72">Wide</option>
      </select>
    </div>
    <div class="field">
      <label for="quality">Image quality: <strong id="qval">85</strong>%</label>
      <input type="range" id="quality" min="40" max="100" step="5" value="85" style="width:100%;padding:0;border:none;background:transparent">
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-lg" id="make">Create PDF</button>
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
  border-radius:var(--radius);padding:9px 12px;cursor:grab}
.pdf-item.dragging{opacity:.45}
.pdf-item .grip{color:var(--ink-3);font-size:1.1rem;flex:none;cursor:grab}
.pdf-item img{width:48px;height:48px;object-fit:cover;border-radius:6px;flex:none;background:var(--bg-sunken)}
.pdf-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pdf-meta b{font-size:.9rem;font-weight:580;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pdf-meta span{font-size:.82rem;color:var(--ink-3)}
.pdf-item .pos{width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);
  display:grid;place-items:center;font-size:.8rem;font-weight:660;flex:none}
.pdf-item .rm{width:32px;height:32px;border:1px solid var(--line-strong);background:var(--bg);border-radius:var(--radius-sm);
  color:var(--ink-3);cursor:pointer;font-size:1.05rem;line-height:1;flex:none}
.pdf-item .rm:hover{border-color:var(--danger);color:var(--danger)}`,

  js: pdfSource + '\n' + toolJs,

  answerHeading: 'Turning images into a PDF',
  answer: `<p><strong>A PDF is a container: each image becomes one page, placed inside a page of your chosen size.</strong> This matters because PDFs are what forms, schools and offices actually accept — a single document that opens identically everywhere beats a folder of photos attached to an email. This tool builds the PDF file structure directly in your browser and embeds each photo as a JPEG, so nothing is uploaded and no external service ever sees your documents.</p>`,

  steps: [
    'Drop in your images, or click to choose them.',
    'Drag the rows to put the pages in the right order.',
    'Pick a page size and margin. <strong>Fit page to image</strong> makes each page exactly the shape of its photo.',
    'Press <strong>Create PDF</strong> and the file downloads.',
  ],

  sections: [
    {
      id: 'settings',
      h2: 'Choosing page size and margins',
      html: `<div class="table-scroll"><table>
<thead><tr><th>What you are making</th><th>Page size</th><th>Margin</th></tr></thead>
<tbody>
<tr><td>Scanned documents or receipts</td><td>A4 or Letter</td><td>Small</td></tr>
<tr><td>A photo album to print</td><td>A4 landscape</td><td>Normal</td></tr>
<tr><td>Anything to be printed and signed</td><td>A4 or Letter</td><td>Normal</td></tr>
<tr><td>Screenshots for a report</td><td>Fit page to image</td><td>None</td></tr>
<tr><td>Sending photos as one file</td><td>Fit page to image</td><td>None</td></tr>
</tbody></table></div>
<p>Use A4 outside the United States and Letter inside it — printing an A4 document on Letter paper crops the edges slightly, which matters for anything with a signature line near the bottom.</p>`,
    },
    {
      id: 'size',
      h2: 'Keeping the file small enough to email',
      html: `<p>Most email systems reject attachments over 20–25 MB, and many organisations set lower limits. Three things control the size of the result.</p>
<ul>
<li><strong>Image quality.</strong> Dropping from 100% to 85% typically halves the file with no visible difference. 70% is fine for text documents.</li>
<li><strong>Number of pages.</strong> Each photo carries its own weight; twenty phone photos will always make a large PDF.</li>
<li><strong>Source resolution.</strong> Images are capped at 2,400 pixels on the long edge, which is more than enough for printing at A4 and keeps files manageable.</li>
</ul>
<p>If the result is still too large, run the photos through the <a href="/image-compressor/">image compressor</a> first and then build the PDF from the smaller versions.</p>`,
    },
    {
      id: 'privacy',
      h2: 'Why not uploading matters here',
      html: `<p>The images people convert to PDF are rarely holiday snaps. They are passports, bank statements, medical letters, signed contracts and utility bills — exactly the documents used to commit identity fraud.</p>
<p>Most free online converters upload your files to a server, process them there, and promise to delete them within some number of hours. That promise may well be kept. But the file has still travelled across the internet and sat on a machine you do not control.</p>
<p>This tool writes the PDF file format directly in your browser. There is no server component to receive the file, which you can confirm in your browser's network tab or by disconnecting from the internet and watching it still work.</p>`,
    },
  ],

  faq: [
    { q: 'Are my images uploaded anywhere?', a: '<p>No. The PDF is assembled in your browser and downloads straight to your device. Nothing is transmitted, and the page keeps working with the internet disconnected.</p>' },
    { q: 'Can I change the page order?', a: '<p>Yes. Drag any row up or down in the list. The number on the right shows the page each image will become.</p>' },
    { q: 'How do I make a PDF small enough to email?', a: '<p>Lower the image quality slider to around 70% and use a smaller page size. For scanned text this is usually indistinguishable and cuts the file substantially.</p>' },
    { q: 'What is "fit page to image"?', a: '<p>Each page is made exactly the shape of its image, with no margins or letterboxing. It is the right choice for screenshots and photo collections, and the wrong one for anything that will be printed on paper.</p>' },
    { q: 'Does it keep transparency from PNG images?', a: '<p>No. PDF pages here are flattened onto white, since transparent regions print unpredictably. Anything transparent becomes white.</p>' },
    { q: 'Is there a limit on how many images?', a: '<p>No fixed limit, though very large batches use a lot of memory. If the browser slows noticeably, build the PDF in two parts.</p>' },
  ],

  related: ['image-compressor', 'image-resizer', 'photo-cropper', 'qr-code-generator'],
};
