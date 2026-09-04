export default {
  slug: 'photo-cropper',
  category: 'file-tools',
  title: 'Photo Cropper – Crop Images to Any Aspect Ratio',
  h1: 'Photo Cropper',
  cardText: 'Crop a photo by dragging, with locked ratios for profiles and posts.',
  description:
    'Free photo cropper. Drag to crop any image, lock to common aspect ratios for social profiles and posts, and download. Runs in your browser with no upload.',
  keywords: ['photo cropper', 'crop image online', 'image cropper', 'crop picture', 'square crop tool'],
  updated: '2026-09-04',
  lede: 'Drag the box to choose your crop, or lock an aspect ratio for a profile picture or post. Nothing is uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image to crop">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>
  </svg>
  <p><strong>Drop an image here</strong> or click to choose</p>
  <p class="hint">JPG, PNG or WebP · processed on your device</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="editor" hidden>
  <div class="field" style="margin-top:18px">
    <span class="field-label" id="ratio-label">Aspect ratio</span>
    <div class="seg" role="group" aria-labelledby="ratio-label" id="ratios" style="flex-wrap:wrap">
      <button type="button" data-r="0" aria-pressed="true">Free</button>
      <button type="button" data-r="1">1:1 square</button>
      <button type="button" data-r="0.8">4:5 portrait</button>
      <button type="button" data-r="1.7778">16:9</button>
      <button type="button" data-r="1.5">3:2</button>
      <button type="button" data-r="0.5625">9:16 story</button>
    </div>
  </div>

  <div class="crop-stage" id="stage">
    <img id="img" alt="Image being cropped">
    <div class="crop-box" id="box">
      <span class="h" data-h="nw"></span><span class="h" data-h="ne"></span>
      <span class="h" data-h="sw"></span><span class="h" data-h="se"></span>
    </div>
  </div>

  <div class="row" style="margin-top:16px">
    <div class="field">
      <label for="format">Save as</label>
      <select id="format">
        <option value="image/jpeg" selected>JPEG</option>
        <option value="image/png">PNG</option>
        <option value="image/webp">WebP</option>
      </select>
    </div>
    <div class="field">
      <label for="quality">Quality: <strong id="qval">90</strong>%</label>
      <input type="range" id="quality" min="50" max="100" step="5" value="90" style="width:100%;padding:0;border:none;background:transparent">
    </div>
  </div>

  <div class="btn-row">
    <button type="button" class="btn" id="dl">Download crop</button>
    <button type="button" class="btn btn-ghost" id="reset">Reset crop</button>
    <button type="button" class="btn btn-ghost" id="change">Choose another image</button>
  </div>
  <p class="hint" id="meta" style="margin-top:12px"></p>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.crop-stage{position:relative;margin-top:16px;background:var(--bg-sunken);border:1px solid var(--line);
  border-radius:var(--radius);overflow:hidden;display:grid;place-items:center;user-select:none;touch-action:none}
.crop-stage img{display:block;max-width:100%;max-height:460px;pointer-events:none}
.crop-box{position:absolute;border:2px solid #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.48);cursor:move}
.crop-box .h{position:absolute;width:15px;height:15px;background:#fff;border:2px solid var(--accent);border-radius:3px}
.crop-box .h[data-h=nw]{left:-8px;top:-8px;cursor:nwse-resize}
.crop-box .h[data-h=ne]{right:-8px;top:-8px;cursor:nesw-resize}
.crop-box .h[data-h=sw]{left:-8px;bottom:-8px;cursor:nesw-resize}
.crop-box .h[data-h=se]{right:-8px;bottom:-8px;cursor:nwse-resize}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var img = $('img'), box = $('box'), stage = $('stage');
  var natural = { w: 0, h: 0 };
  var ratio = 0;                       // 0 means free
  var crop = { x: 0, y: 0, w: 0, h: 0 };   // in displayed pixels
  var drag = null;

  function displayRect(){ return img.getBoundingClientRect(); }

  function clamp(){
    var r = displayRect();
    crop.w = Math.max(24, Math.min(crop.w, r.width));
    crop.h = Math.max(24, Math.min(crop.h, r.height));
    crop.x = Math.max(0, Math.min(crop.x, r.width - crop.w));
    crop.y = Math.max(0, Math.min(crop.y, r.height - crop.h));
  }

  function paint(){
    clamp();
    var r = displayRect();
    var s = stage.getBoundingClientRect();
    box.style.left = (r.left - s.left + crop.x) + 'px';
    box.style.top = (r.top - s.top + crop.y) + 'px';
    box.style.width = crop.w + 'px';
    box.style.height = crop.h + 'px';

    var scale = natural.w / r.width;
    $('meta').textContent = 'Crop ' + Math.round(crop.w * scale) + ' × ' + Math.round(crop.h * scale) +
      ' px  ·  original ' + natural.w + ' × ' + natural.h + ' px';
  }

  function resetCrop(){
    var r = displayRect();
    if (ratio > 0) {
      // Largest box of this ratio that fits, centred.
      var w = r.width, h = w / ratio;
      if (h > r.height) { h = r.height; w = h * ratio; }
      crop = { x: (r.width - w) / 2, y: (r.height - h) / 2, w: w * 0.9, h: h * 0.9 };
      crop.x = (r.width - crop.w) / 2;
      crop.y = (r.height - crop.h) / 2;
    } else {
      crop = { x: r.width * 0.1, y: r.height * 0.1, w: r.width * 0.8, h: r.height * 0.8 };
    }
    paint();
  }

  function applyRatio(anchor){
    if (ratio <= 0) return;
    // Keep width, derive height, then correct if it overflows.
    var r = displayRect();
    crop.h = crop.w / ratio;
    if (crop.y + crop.h > r.height) {
      crop.h = r.height - crop.y;
      crop.w = crop.h * ratio;
    }
  }

  stage.addEventListener('pointerdown', function(e){
    var handle = e.target.closest('.h');
    var inBox = e.target === box || handle;
    if (!inBox) return;
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    drag = {
      handle: handle ? handle.getAttribute('data-h') : null,
      startX: e.clientX, startY: e.clientY,
      orig: { x: crop.x, y: crop.y, w: crop.w, h: crop.h }
    };
  });

  stage.addEventListener('pointermove', function(e){
    if (!drag) return;
    e.preventDefault();
    var dx = e.clientX - drag.startX;
    var dy = e.clientY - drag.startY;
    var o = drag.orig;

    if (!drag.handle) {
      crop.x = o.x + dx;
      crop.y = o.y + dy;
    } else {
      if (drag.handle === 'se') { crop.w = o.w + dx; crop.h = o.h + dy; }
      if (drag.handle === 'sw') { crop.x = o.x + dx; crop.w = o.w - dx; crop.h = o.h + dy; }
      if (drag.handle === 'ne') { crop.y = o.y + dy; crop.w = o.w + dx; crop.h = o.h - dy; }
      if (drag.handle === 'nw') { crop.x = o.x + dx; crop.y = o.y + dy; crop.w = o.w - dx; crop.h = o.h - dy; }
      if (ratio > 0) {
        crop.h = crop.w / ratio;
        if (drag.handle === 'nw' || drag.handle === 'ne') crop.y = o.y + o.h - crop.h;
      }
    }
    paint();
  });

  ['pointerup','pointercancel'].forEach(function(ev){
    stage.addEventListener(ev, function(){ drag = null; });
  });

  $('ratios').addEventListener('click', function(e){
    var b = e.target.closest('button[data-r]'); if (!b) return;
    ratio = parseFloat(b.getAttribute('data-r'));
    var btns = $('ratios').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    resetCrop();
  });

  function load(file){
    if (!/^image\\/(jpeg|png|webp)$/.test(file.type)) {
      $('err').hidden = false;
      $('err').textContent = 'That file type is not supported. Choose a JPG, PNG or WebP image.';
      return;
    }
    $('err').hidden = true;
    var url = URL.createObjectURL(file);
    img.onload = function(){
      natural = { w: img.naturalWidth, h: img.naturalHeight };
      $('editor').hidden = false;
      $('drop').hidden = true;
      requestAnimationFrame(resetCrop);
    };
    img.src = url;
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  $('change').addEventListener('click', function(){ $('drop').hidden = false; $('editor').hidden = true; });
  $('reset').addEventListener('click', resetCrop);
  $('quality').addEventListener('input', function(){ $('qval').textContent = this.value; });
  window.addEventListener('resize', function(){ if (!$('editor').hidden) paint(); });

  $('dl').addEventListener('click', function(){
    var r = displayRect();
    var scale = natural.w / r.width;
    var sx = Math.round(crop.x * scale), sy = Math.round(crop.y * scale);
    var sw = Math.round(crop.w * scale), sh = Math.round(crop.h * scale);

    var canvas = document.createElement('canvas');
    canvas.width = sw; canvas.height = sh;
    var ctx = canvas.getContext('2d');
    if ($('format').value === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, sw, sh); }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    var ext = $('format').value === 'image/png' ? 'png' : $('format').value === 'image/webp' ? 'webp' : 'jpg';
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'cropped-' + sw + 'x' + sh + '.' + ext;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }, $('format').value, parseInt($('quality').value, 10) / 100);
  });
})();`,

  answerHeading: 'Cropping without losing quality',
  answer: `<p><strong>Cropping never reduces quality in the part you keep — it simply discards the rest.</strong> The pixels inside your crop box are copied across untouched, so a crop from a 4000-pixel photo is as sharp as the original. What you lose is resolution: crop to a quarter of the frame and you have a quarter of the pixels, which matters if you then need to print or display it large. The rule is to crop from the largest original you have, and only once.</p>`,

  steps: [
    'Drop in an image, or click to choose one.',
    'Drag inside the box to move it, or drag a corner to resize.',
    'Lock an aspect ratio if you are cropping for a specific platform.',
    'Choose a format and download.',
  ],

  sections: [
    {
      id: 'ratios',
      h2: 'Which aspect ratio to use',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Ratio</th><th>Shape</th><th>Used for</th></tr></thead>
<tbody>
<tr><td>1:1</td><td>Square</td><td>Profile pictures, Instagram grid posts</td></tr>
<tr><td>4:5</td><td>Portrait</td><td>Instagram portrait — the largest feed format</td></tr>
<tr><td>9:16</td><td>Tall</td><td>Stories, Reels, TikTok, phone wallpapers</td></tr>
<tr><td>16:9</td><td>Widescreen</td><td>YouTube thumbnails, video, presentations</td></tr>
<tr><td>3:2</td><td>Classic photo</td><td>Standard camera output, 6×4 prints</td></tr>
<tr><td>1.91:1</td><td>Wide</td><td>Link preview cards on social platforms</td></tr>
</tbody></table></div>
<p>Profile pictures are almost always displayed as circles even when you upload a square, so keep the subject well inside the middle and leave margin at the edges.</p>`,
    },
    {
      id: 'composition',
      h2: 'Cropping well',
      html: `<ul>
<li><strong>Rule of thirds.</strong> Place the subject a third of the way in rather than dead centre. Eyes on the upper third line is the standard for portraits.</li>
<li><strong>Do not crop at a joint.</strong> Cutting a person at the wrist, elbow, knee or ankle looks like an accident. Crop mid-limb instead.</li>
<li><strong>Leave room in the direction of movement or gaze.</strong> A subject looking left wants space on the left.</li>
<li><strong>Straighten before cropping.</strong> A tilted horizon is much more noticeable than a slightly loose crop.</li>
<li><strong>Crop once, from the original.</strong> Repeatedly cropping and re-saving a JPEG compounds compression loss each time.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Does cropping reduce image quality?', a: '<p>Not in the retained area — those pixels are copied unchanged. You do lose total resolution, since you are keeping fewer pixels overall. Save as PNG if you want no re-compression at all.</p>' },
    { q: 'Are my photos uploaded?', a: '<p>No. Cropping happens entirely in your browser using the canvas API, and the page works with no internet connection.</p>' },
    { q: 'How do I crop to an exact size in pixels?', a: '<p>Crop to the right shape here, then use the <a href="/image-resizer/">image resizer</a> to set exact dimensions. Doing it in that order avoids distortion.</p>' },
    { q: 'What size should a profile picture be?', a: '<p>Square, at least 400 × 400 px, and larger is better since platforms downscale. Remember the image will usually be displayed as a circle.</p>' },
    { q: 'Can I crop a photo to passport size?', a: '<p>Crop to the right ratio here — 35 × 45 mm is roughly 0.78:1 and US 2 × 2 in is square — then resize to the exact pixel dimensions. Check your country’s rules on head size and background separately.</p>' },
  ],

  related: ['image-resizer', 'image-compressor', 'image-to-pdf', 'signature-maker'],
};
