export default {
  slug: 'image-resizer',
  category: 'file-tools',
  title: 'Image Resizer – Change Photo Dimensions in Your Browser',
  h1: 'Image Resizer',
  cardText: 'Resize a photo to exact pixels, a percentage, or a preset size.',
  description:
    'Free image resizer. Change a photo to exact pixel dimensions, scale by percentage, or use presets for social media and passport photos. No upload required.',
  keywords: ['image resizer', 'resize image', 'change photo size', 'resize picture online', 'photo dimensions'],
  updated: '2026-09-04',
  lede: 'Set exact dimensions or pick a preset. The aspect ratio is locked by default so nothing gets stretched.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image to resize">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 15 5-5 4 4 3-3 6 6"/><circle cx="8.5" cy="8.5" r="1.5"/>
  </svg>
  <p><strong>Drop an image here</strong> or click to choose</p>
  <p class="hint">JPG, PNG or WebP · processed on your device</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="panel" hidden>
  <div class="resize-grid">
    <div>
      <div class="preview-box"><img id="preview" alt="Preview of the resized image"></div>
      <p class="hint" id="info" style="margin-top:9px"></p>
    </div>
    <div>
      <div class="row">
        <div class="field">
          <label for="w">Width</label>
          <div class="input-group">
            <input type="number" id="w" inputmode="numeric" min="1" max="12000" step="1">
            <span class="addon">px</span>
          </div>
        </div>
        <div class="field">
          <label for="h">Height</label>
          <div class="input-group">
            <input type="number" id="h" inputmode="numeric" min="1" max="12000" step="1">
            <span class="addon">px</span>
          </div>
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);margin-bottom:14px">
        <input type="checkbox" id="lock" checked style="width:auto"> Keep the original proportions
      </label>

      <div class="field">
        <label for="scale">Or scale by percentage: <strong id="sval">100</strong>%</label>
        <input type="range" id="scale" min="5" max="200" step="5" value="100" style="width:100%;padding:0;border:none;background:transparent">
      </div>

      <div class="field">
        <label for="preset">Presets</label>
        <select id="preset">
          <option value="">Choose a preset…</option>
          <option value="1080x1080">Instagram square — 1080×1080</option>
          <option value="1080x1350">Instagram portrait — 1080×1350</option>
          <option value="1080x1920">Story / Reel — 1080×1920</option>
          <option value="1200x630">Link preview card — 1200×630</option>
          <option value="1280x720">HD video — 1280×720</option>
          <option value="1920x1080">Full HD — 1920×1080</option>
          <option value="413x531">Passport, EU — 35×45 mm at 300 dpi</option>
          <option value="600x600">Passport, US — 2×2 in at 300 dpi</option>
        </select>
      </div>

      <div class="field">
        <label for="format">Save as</label>
        <select id="format">
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
        </select>
      </div>

      <div class="btn-row">
        <button type="button" class="btn" id="dl">Download</button>
        <button type="button" class="btn btn-ghost" id="reset">Reset</button>
      </div>
    </div>
  </div>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.resize-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;margin-top:20px;align-items:start}
@media (max-width:660px){.resize-grid{grid-template-columns:1fr}}
.preview-box{background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:12px;display:grid;place-items:center;min-height:190px}
.preview-box img{max-width:100%;max-height:280px;border-radius:6px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var img = null, natW = 0, natH = 0, srcName = 'image';
  var busy = false;

  function human(b){ return b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(2) + ' MB'; }

  function draw(){
    if (!img) return;
    var w = Math.max(1, Math.min(12000, parseInt($('w').value, 10) || 1));
    var h = Math.max(1, Math.min(12000, parseInt($('h').value, 10) || 1));
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    if ($('format').value === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);

    canvas.toBlob(function(blob){
      if ($('preview').dataset.url) URL.revokeObjectURL($('preview').dataset.url);
      var url = URL.createObjectURL(blob);
      $('preview').src = url;
      $('preview').dataset.url = url;
      $('preview').dataset.name = srcName.replace(/\\.[^.]+$/, '') + '-' + w + 'x' + h + '.' +
        ($('format').value === 'image/png' ? 'png' : $('format').value === 'image/webp' ? 'webp' : 'jpg');
      $('info').textContent = 'Original ' + natW + '×' + natH + '  ·  new ' + w + '×' + h + '  ·  ' + human(blob.size);
    }, $('format').value, 0.9);
  }

  function setW(v){ busy = true; $('w').value = v; busy = false; }
  function setH(v){ busy = true; $('h').value = v; busy = false; }

  $('w').addEventListener('input', function(){
    if (busy || !img) return;
    if ($('lock').checked) {
      var w = parseInt(this.value, 10);
      if (w > 0) setH(Math.max(1, Math.round(w * natH / natW)));
    }
    draw();
  });
  $('h').addEventListener('input', function(){
    if (busy || !img) return;
    if ($('lock').checked) {
      var h = parseInt(this.value, 10);
      if (h > 0) setW(Math.max(1, Math.round(h * natW / natH)));
    }
    draw();
  });
  $('scale').addEventListener('input', function(){
    $('sval').textContent = this.value;
    if (!img) return;
    var f = parseInt(this.value, 10) / 100;
    setW(Math.max(1, Math.round(natW * f)));
    setH(Math.max(1, Math.round(natH * f)));
    draw();
  });
  $('preset').addEventListener('change', function(){
    if (!this.value || !img) return;
    var p = this.value.split('x');
    $('lock').checked = false;
    setW(p[0]); setH(p[1]);
    draw();
  });
  $('format').addEventListener('change', draw);
  $('reset').addEventListener('click', function(){
    if (!img) return;
    setW(natW); setH(natH);
    $('scale').value = 100; $('sval').textContent = '100';
    $('preset').value = ''; $('lock').checked = true;
    draw();
  });

  function load(file){
    if (!/^image\\/(jpeg|png|webp)$/.test(file.type)) {
      $('err').hidden = false;
      $('err').textContent = 'That file type is not supported. Choose a JPG, PNG or WebP image.';
      return;
    }
    $('err').hidden = true;
    srcName = file.name;
    var url = URL.createObjectURL(file);
    var i = new Image();
    i.onload = function(){
      img = i; natW = i.naturalWidth; natH = i.naturalHeight;
      setW(natW); setH(natH);
      $('scale').value = 100; $('sval').textContent = '100';
      $('panel').hidden = false;
      draw();
    };
    i.onerror = function(){
      $('err').hidden = false;
      $('err').textContent = 'That image could not be opened.';
      URL.revokeObjectURL(url);
    };
    i.src = url;
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  $('dl').addEventListener('click', function(){
    var p = $('preview');
    if (!p.dataset.url) return;
    var a = document.createElement('a');
    a.href = p.dataset.url; a.download = p.dataset.name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });
})();`,

  answerHeading: 'Resizing without ruining the image',
  answer: `<p><strong>Two rules cover almost every resize: keep the aspect ratio, and shrink rather than enlarge.</strong> Changing width and height independently stretches the picture, which is instantly obvious on faces. Enlarging invents pixels that were never captured, so a 500-pixel image blown up to 2000 looks soft no matter what tool you use. Shrinking, by contrast, is essentially lossless in appearance — you are throwing away detail that is genuinely surplus.</p>`,

  steps: [
    'Drop in an image or click to choose one.',
    'Type a new <strong>width</strong> — the height follows automatically while the lock is on.',
    'Or drag the percentage slider, or pick a preset for a specific platform.',
    'Choose an output format and download.',
  ],

  sections: [
    {
      id: 'presets',
      h2: 'Common sizes',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Pixels</th><th>Ratio</th></tr></thead>
<tbody>
<tr><td>Instagram square</td><td>1080 × 1080</td><td>1:1</td></tr>
<tr><td>Instagram portrait</td><td>1080 × 1350</td><td>4:5</td></tr>
<tr><td>Story or Reel</td><td>1080 × 1920</td><td>9:16</td></tr>
<tr><td>Link preview card</td><td>1200 × 630</td><td>1.91:1</td></tr>
<tr><td>YouTube thumbnail</td><td>1280 × 720</td><td>16:9</td></tr>
<tr><td>Passport photo, EU/UK</td><td>413 × 531</td><td>35 × 45 mm at 300 dpi</td></tr>
<tr><td>Passport photo, US</td><td>600 × 600</td><td>2 × 2 in at 300 dpi</td></tr>
</tbody></table></div>
<p>Preset sizes turn the aspect lock off, because most of them force a specific ratio. If the result looks squashed, crop the image to the right shape first, then resize.</p>`,
    },
    {
      id: 'dpi',
      h2: 'Pixels, inches and the DPI confusion',
      html: `<p>DPI is meaningless on a screen. An image is a grid of pixels; DPI only enters the picture when those pixels are mapped onto a physical size in print.</p>
<p>The arithmetic is simply <code>pixels = inches × dpi</code>. A 6 × 4 inch print at 300 dpi needs 1800 × 1200 pixels. If your file is 900 × 600, you can still print it — at 150 dpi, which is noticeably softer but often acceptable.</p>
<div class="table-scroll"><table>
<thead><tr><th>Print size</th><th>At 300 dpi</th><th>At 150 dpi</th></tr></thead>
<tbody>
<tr><td>6 × 4 in</td><td>1800 × 1200</td><td>900 × 600</td></tr>
<tr><td>A4</td><td>2480 × 3508</td><td>1240 × 1754</td></tr>
<tr><td>8 × 10 in</td><td>2400 × 3000</td><td>1200 × 1500</td></tr>
</tbody></table></div>
<p>Changing the DPI number stored in a file without changing the pixels does nothing to image quality. Only the pixel count matters.</p>`,
    },
  ],

  faq: [
    { q: 'Does resizing reduce quality?', a: '<p>Making an image smaller barely affects perceived quality — you are discarding detail that would not be visible at the new size anyway. Making it larger does reduce quality, because the extra pixels have to be invented.</p>' },
    { q: 'How do I resize without stretching?', a: '<p>Leave "keep the original proportions" ticked. Enter one dimension and the other adjusts automatically to preserve the aspect ratio.</p>' },
    { q: 'Can I make a small image bigger?', a: '<p>You can, but it will look soft. Enlarging beyond about 150% of the original rarely looks good, because no detail exists to fill the new pixels.</p>' },
    { q: 'Are my images uploaded?', a: '<p>No. Everything happens in your browser using the canvas API. The image never leaves your device and the page works offline.</p>' },
    { q: 'How do I make a passport photo?', a: '<p>Crop the photo to the right shape first, then use the EU (413 × 531) or US (600 × 600) preset. Check your country’s specific requirements for head size and background, which vary.</p>' },
  ],

  related: ['image-compressor', 'photo-cropper', 'image-to-pdf', 'heic-to-jpg'],
};
