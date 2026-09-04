export default {
  slug: 'image-compressor',
  category: 'file-tools',
  title: 'Image Compressor – Shrink Photos Without Uploading Them',
  h1: 'Image Compressor',
  cardText: 'Make photos smaller for email or uploads. Nothing leaves your device.',
  description:
    'Free image compressor. Reduce JPG, PNG and WebP file sizes for email or web uploads, with a live quality preview. Runs in your browser — no upload, no waiting.',
  keywords: ['image compressor', 'compress image', 'reduce photo size', 'compress jpeg', 'shrink image file size'],
  updated: '2026-09-04',
  lede: 'Drop in photos, choose how much quality to trade away, and download the smaller versions. Your images are processed by your own browser and never uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose images to compress">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M3 15v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/>
  </svg>
  <p><strong>Drop images here</strong> or click to choose</p>
  <p class="hint">JPG, PNG or WebP · several at once · nothing is uploaded</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" multiple hidden>
</div>

<div id="controls" hidden>
  <div class="row" style="margin-top:18px">
    <div class="field">
      <label for="quality">Quality: <strong id="qval">75</strong>%</label>
      <input type="range" id="quality" min="20" max="100" step="5" value="75" style="width:100%;padding:0;border:none;background:transparent">
      <span class="hint">Lower means a smaller file. Around 75% is usually indistinguishable.</span>
    </div>
    <div class="field">
      <label for="format">Output format</label>
      <select id="format">
        <option value="image/jpeg" selected>JPEG — best for photos</option>
        <option value="image/webp">WebP — smaller still</option>
        <option value="image/png">PNG — lossless, larger</option>
      </select>
    </div>
    <div class="field">
      <label for="maxw">Limit width</label>
      <select id="maxw">
        <option value="0" selected>Keep original size</option>
        <option value="2560">2560 px</option>
        <option value="1920">1920 px — plenty for screens</option>
        <option value="1280">1280 px</option>
        <option value="800">800 px — email friendly</option>
      </select>
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn" id="dlall">Download all</button>
    <button type="button" class="btn btn-ghost" id="clear">Clear</button>
  </div>
</div>

<div id="list" class="img-list"></div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}
.drop svg{color:var(--ink-3)}
.img-list{display:flex;flex-direction:column;gap:11px;margin-top:20px}
.img-item{display:flex;gap:14px;align-items:center;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius);padding:11px 13px}
.img-item img{width:62px;height:62px;object-fit:cover;border-radius:8px;flex:none;background:var(--bg-sunken)}
.img-meta{flex:1;min-width:0}
.img-meta .nm{font-weight:580;font-size:.92rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.img-meta .sz{font-size:.85rem;color:var(--ink-3);margin-top:3px}
.img-meta .sz b{color:var(--accent);font-weight:640}
.img-item .btn{flex:none;padding:7px 13px;font-size:.85rem}
.saving{display:inline-block;background:var(--accent-soft);color:var(--accent-ink);border-radius:999px;
  padding:1px 8px;font-size:.78rem;font-weight:640;margin-left:6px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var items = [];

  function human(bytes){
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function extFor(type){
    return type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  }

  function render(){
    $('list').innerHTML = '';
    items.forEach(function(item, i){
      var div = document.createElement('div');
      div.className = 'img-item';
      var saved = item.out ? (1 - item.out.size / item.file.size) * 100 : 0;
      div.innerHTML =
        '<img alt="" src="' + item.thumb + '">' +
        '<div class="img-meta">' +
          '<div class="nm">' + item.file.name.replace(/[<>&]/g, '') + '</div>' +
          '<div class="sz">' + human(item.file.size) +
            (item.out ? ' → <b>' + human(item.out.size) + '</b>' +
              (saved > 0 ? '<span class="saving">' + saved.toFixed(0) + '% smaller</span>'
                         : '<span class="saving" style="background:var(--warn-soft);color:var(--warn)">no gain</span>')
                       : ' · working…') +
            (item.dims ? '  ·  ' + item.dims : '') +
          '</div>' +
        '</div>' +
        (item.out ? '<button type="button" class="btn" data-i="' + i + '">Download</button>' : '');
      $('list').appendChild(div);
    });
  }

  function compressOne(item, done){
    var url = URL.createObjectURL(item.file);
    var img = new Image();
    img.onload = function(){
      var maxw = parseInt($('maxw').value, 10);
      var w = img.naturalWidth, h = img.naturalHeight;
      if (maxw && w > maxw) { h = Math.round(h * maxw / w); w = maxw; }

      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      // JPEG has no alpha channel, so flatten onto white first.
      var type = $('format').value;
      if (type === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);

      item.dims = img.naturalWidth + '×' + img.naturalHeight +
        (w !== img.naturalWidth ? ' → ' + w + '×' + h : '');

      canvas.toBlob(function(blob){
        URL.revokeObjectURL(url);
        item.out = blob;
        item.outName = item.file.name.replace(/\\.[^.]+$/, '') + '-compressed.' + extFor(type);
        done();
      }, type, parseInt($('quality').value, 10) / 100);
    };
    img.onerror = function(){
      URL.revokeObjectURL(url);
      item.out = null; item.failed = true; done();
    };
    img.src = url;
  }

  function processAll(){
    if (!items.length) return;
    var pending = items.length;
    items.forEach(function(item){
      item.out = null;
      compressOne(item, function(){ if (--pending === 0) render(); });
    });
    render();
  }

  function addFiles(fileList){
    var accepted = [].slice.call(fileList).filter(function(f){ return /^image\\/(jpeg|png|webp)$/.test(f.type); });
    var rejected = fileList.length - accepted.length;
    $('err').hidden = rejected === 0;
    if (rejected) $('err').textContent = rejected + ' file' + (rejected > 1 ? 's were' : ' was') + ' skipped — only JPG, PNG and WebP are supported.';
    if (!accepted.length) return;

    accepted.forEach(function(f){
      items.push({ file: f, thumb: URL.createObjectURL(f) });
    });
    $('controls').hidden = false;
    processAll();
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ addFiles(this.files); this.value = ''; });

  ['dragenter','dragover'].forEach(function(ev){
    drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave','drop'].forEach(function(ev){
    drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function(e){ addFiles(e.dataTransfer.files); });

  $('quality').addEventListener('input', function(){ $('qval').textContent = this.value; });
  $('quality').addEventListener('change', processAll);
  $('format').addEventListener('change', processAll);
  $('maxw').addEventListener('change', processAll);

  function download(item){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(item.out);
    a.download = item.outName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
  }

  $('list').addEventListener('click', function(e){
    var b = e.target.closest('button[data-i]'); if (!b) return;
    download(items[parseInt(b.getAttribute('data-i'), 10)]);
  });
  $('dlall').addEventListener('click', function(){
    items.forEach(function(item, i){ if (item.out) setTimeout(function(){ download(item); }, i * 260); });
  });
  $('clear').addEventListener('click', function(){
    items.forEach(function(i){ URL.revokeObjectURL(i.thumb); });
    items = []; render(); $('controls').hidden = true; $('err').hidden = true;
  });
})();`,

  answerHeading: 'How image compression works',
  answer: `<p><strong>JPEG and WebP compression works by discarding detail your eye is bad at noticing</strong> — mostly fine colour variation, which human vision resolves far less precisely than brightness. Dropping a photo from 100% to 75% quality typically cuts the file by 60–80% while looking essentially identical on screen. The other lever is dimensions: a 4000-pixel-wide phone photo displayed in an email at 800 pixels is carrying 25 times more pixels than anyone will ever see, so limiting the width often saves more than the quality slider does.</p>`,

  steps: [
    'Drop your images onto the box, or click to choose them. You can add several at once.',
    'Set the <strong>quality</strong>. 75% is a good default; drop to 60% if you need a much smaller file.',
    'Optionally <strong>limit the width</strong> — this usually saves more than quality alone.',
    'Download each file, or use <strong>Download all</strong>.',
  ],

  sections: [
    {
      id: 'settings',
      h2: 'What settings to use',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Purpose</th><th>Width limit</th><th>Quality</th><th>Format</th></tr></thead>
<tbody>
<tr><td>Email attachment</td><td>1280 px</td><td>70%</td><td>JPEG</td></tr>
<tr><td>Website or blog image</td><td>1920 px</td><td>75%</td><td>WebP</td></tr>
<tr><td>Social media post</td><td>1080–2048 px</td><td>80%</td><td>JPEG</td></tr>
<tr><td>Online form upload</td><td>1280 px</td><td>65%</td><td>JPEG</td></tr>
<tr><td>Printing at 6×4 in</td><td>1800 px</td><td>90%</td><td>JPEG</td></tr>
<tr><td>Screenshot with text</td><td>Original</td><td>—</td><td>PNG</td></tr>
</tbody></table></div>
<p>Screenshots, diagrams and anything with sharp text should stay PNG. JPEG compression puts visible fuzz around hard edges, which is exactly what text is made of.</p>`,
    },
    {
      id: 'formats',
      h2: 'Choosing a format',
      html: `<ul>
<li><strong>JPEG</strong> — the right default for photographs. Universally supported, no transparency, and lossy compression that suits continuous tones.</li>
<li><strong>WebP</strong> — typically 25–35% smaller than JPEG at the same visual quality, with transparency support. Supported by every current browser, but some older desktop software still cannot open it.</li>
<li><strong>PNG</strong> — lossless, so it never degrades, and it handles transparency. Much larger for photos, but the only sensible choice for screenshots, logos and line art.</li>
</ul>
<p>Note that re-compressing an already-compressed JPEG loses a little more each time. Always compress from the original if you have it.</p>`,
    },
    {
      id: 'privacy',
      h2: 'Why this one does not upload',
      html: `<p>Most online image compressors upload your file to a server, process it there, and hand back a download link. That means your photograph — which may show your home, your family, your documents — sits on someone else's machine, subject to their retention policy.</p>
<p>This tool uses the browser's own canvas API to decode and re-encode the image on your device. Nothing is transmitted. You can open your browser's network tab and watch that no request is made, or disconnect from the internet entirely and it will still work.</p>
<p>One useful side effect: because the image is redrawn from scratch, EXIF metadata — including GPS coordinates recorded by your phone — is stripped from the output.</p>`,
    },
  ],

  faq: [
    { q: 'Are my photos uploaded anywhere?', a: '<p>No. Compression happens entirely in your browser using the canvas API. Your images never leave your device, and the page works offline.</p>' },
    { q: 'How do I get a photo under 1 MB?', a: '<p>Start by limiting the width to 1920 or 1280 pixels, then lower the quality until the size shown is under your limit. Reducing dimensions is usually far more effective than reducing quality alone.</p>' },
    { q: 'Will compressing lose quality?', a: '<p>JPEG and WebP are lossy, so technically yes — but at 75% quality the difference is invisible at normal viewing sizes. PNG output is lossless and loses nothing, though it produces much larger photo files.</p>' },
    { q: 'Why did my PNG get bigger?', a: '<p>PNG uses lossless compression optimised for flat colour. Saving a photograph as PNG frequently produces a larger file than the JPEG you started with. For photos, choose JPEG or WebP.</p>' },
    { q: 'Does this remove EXIF and location data?', a: '<p>Yes, as a side effect of redrawing the image. The output contains no camera metadata and no GPS coordinates, which is useful before sharing photos publicly.</p>' },
    { q: 'How many images can I do at once?', a: '<p>As many as your device’s memory allows. Very large batches of high-resolution photos may slow the browser, so work in groups of ten or twenty if you notice lag.</p>' },
  ],

  related: ['image-resizer', 'image-to-pdf', 'photo-cropper', 'heic-to-jpg'],
};
