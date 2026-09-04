export default {
  slug: 'passport-photo-maker',
  category: 'file-tools',
  title: 'Passport Photo Maker – Correct Size for Any Country',
  h1: 'Passport Photo Maker',
  cardText: 'Crop a photo to official passport dimensions and print several per sheet.',
  description:
    'Free passport photo maker. Crop a photo to the official size for your country, check head proportions, and download a single photo or a printable sheet.',
  keywords: ['passport photo maker', 'passport photo size', 'passport photo online free', 'id photo maker', 'visa photo'],
  updated: '2026-09-04',
  disclaimer: 'Sizing follows published specifications, but acceptance is at the discretion of the issuing authority.',
  lede: 'Position your face inside the guides, pick your country, and download either one photo or a 6×4 sheet ready to print.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose a photo">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <circle cx="12" cy="9" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/><rect x="2" y="2" width="20" height="20" rx="2"/>
  </svg>
  <p><strong>Drop a photo here</strong> or click to choose</p>
  <p class="hint">A plain background and even lighting give the best result</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="editor" hidden>
  <div class="row" style="margin-top:18px">
    <div class="field">
      <label for="country">Country or document</label>
      <select id="country"></select>
    </div>
    <div class="field">
      <label for="zoom">Zoom: <strong id="zval">100</strong>%</label>
      <input type="range" id="zoom" min="50" max="300" step="5" value="100" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="bg">Background</label>
      <select id="bg">
        <option value="keep" selected>Keep original</option>
        <option value="#ffffff">Force white</option>
        <option value="#f2f2f2">Force off-white</option>
      </select>
      <span class="hint">Forcing a colour only fills gaps, it does not cut you out.</span>
    </div>
  </div>

  <p class="hint">Drag the photo to position it. Line your eyes up with the horizontal guide.</p>
  <div class="pp-stage" id="stage">
    <canvas id="canvas" role="img" aria-label="Passport photo preview"></canvas>
  </div>

  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn" id="dl">Download photo</button>
    <button type="button" class="btn btn-ghost" id="sheet">Download 6×4 print sheet</button>
    <button type="button" class="btn btn-ghost" id="change">Choose another</button>
  </div>
  <p class="hint" id="meta" style="margin-top:10px"></p>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.pp-stage{margin-top:12px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:16px;display:grid;place-items:center;touch-action:none}
.pp-stage canvas{max-height:430px;max-width:100%;height:auto;cursor:move;border-radius:4px;
  box-shadow:0 2px 10px rgba(0,0,0,.15)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d');
  var img = null, offset = { x: 0, y: 0 }, drag = null;

  // [name, width mm, height mm, head height as fraction, eye line from top as fraction]
  var SPECS = [
    ['US passport & visa — 2×2 in', 51, 51, 0.62, 0.42],
    ['UK passport — 35×45 mm', 35, 45, 0.72, 0.40],
    ['EU / Schengen visa — 35×45 mm', 35, 45, 0.75, 0.40],
    ['Canada passport — 50×70 mm', 50, 70, 0.44, 0.38],
    ['Australia passport — 35×45 mm', 35, 45, 0.72, 0.40],
    ['India passport — 51×51 mm', 51, 51, 0.68, 0.42],
    ['China visa — 33×48 mm', 33, 48, 0.65, 0.40],
    ['Japan passport — 35×45 mm', 35, 45, 0.75, 0.38]
  ];
  var DPI = 300;

  $('country').innerHTML = SPECS.map(function(s, i){
    return '<option value="' + i + '">' + s[0] + '</option>';
  }).join('');

  function spec(){ return SPECS[parseInt($('country').value, 10)]; }
  function mmToPx(mm){ return Math.round(mm / 25.4 * DPI); }

  function render(){
    if (!img) return;
    var s = spec();
    var w = mmToPx(s[1]), h = mmToPx(s[2]);
    canvas.width = w; canvas.height = h;

    if ($('bg').value !== 'keep') { ctx.fillStyle = $('bg').value; }
    else { ctx.fillStyle = '#ffffff'; }
    ctx.fillRect(0, 0, w, h);

    // Cover the frame at the chosen zoom, then apply the drag offset.
    var zoom = parseInt($('zoom').value, 10) / 100;
    var base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var scale = base * zoom;
    var dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    var dx = (w - dw) / 2 + offset.x, dy = (h - dh) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, dw, dh);

    drawGuides(w, h, s);
    $('meta').textContent = s[1] + ' × ' + s[2] + ' mm at ' + DPI + ' dpi = ' + w + ' × ' + h + ' px';
  }

  function drawGuides(w, h, s){
    // Head-height band and eye line, per the published specification.
    var headTop = h * (s[4] - s[3] * 0.42);
    var headBottom = headTop + h * s[3];
    var eyeY = h * s[4];

    ctx.save();
    ctx.strokeStyle = 'rgba(15,125,107,.85)';
    ctx.setLineDash([9, 7]);
    ctx.lineWidth = Math.max(2, w / 260);

    ctx.beginPath(); ctx.moveTo(0, eyeY); ctx.lineTo(w, eyeY); ctx.stroke();

    ctx.strokeStyle = 'rgba(15,125,107,.5)';
    ctx.beginPath(); ctx.moveTo(0, headTop); ctx.lineTo(w, headTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, headBottom); ctx.lineTo(w, headBottom); ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(15,125,107,.9)';
    ctx.font = '600 ' + Math.round(w / 22) + 'px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('eyes', w * 0.03, eyeY - w / 45);
    ctx.fillText('top of head', w * 0.03, headTop - w / 45);
    ctx.fillText('chin', w * 0.03, headBottom - w / 45);
    ctx.restore();
  }

  function renderClean(){
    // Same drawing without the guides, for export.
    var s = spec();
    var w = mmToPx(s[1]), h = mmToPx(s[2]);
    var out = document.createElement('canvas');
    out.width = w; out.height = h;
    var c = out.getContext('2d');
    c.fillStyle = $('bg').value !== 'keep' ? $('bg').value : '#ffffff';
    c.fillRect(0, 0, w, h);
    var zoom = parseInt($('zoom').value, 10) / 100;
    var base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var scale = base * zoom;
    var dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    c.drawImage(img, (w - dw) / 2 + offset.x, (h - dh) / 2 + offset.y, dw, dh);
    return out;
  }

  function download(cv, name){
    cv.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }, 'image/jpeg', 0.95);
  }

  // Drag to reposition, in canvas pixels rather than screen pixels.
  canvas.addEventListener('pointerdown', function(e){
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    var rect = canvas.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, k: canvas.width / rect.width };
  });
  canvas.addEventListener('pointermove', function(e){
    if (!drag) return;
    e.preventDefault();
    offset.x = drag.ox + (e.clientX - drag.x) * drag.k;
    offset.y = drag.oy + (e.clientY - drag.y) * drag.k;
    render();
  });
  ['pointerup','pointercancel'].forEach(function(ev){
    canvas.addEventListener(ev, function(){ drag = null; });
  });

  function load(file){
    if (!/^image\\/(jpeg|png|webp)$/.test(file.type)) {
      $('err').hidden = false;
      $('err').textContent = 'That file type is not supported. Choose a JPG, PNG or WebP image.';
      return;
    }
    $('err').hidden = true;
    var url = URL.createObjectURL(file);
    var i = new Image();
    i.onload = function(){
      img = i; offset = { x: 0, y: 0 };
      $('zoom').value = 100; $('zval').textContent = '100';
      $('editor').hidden = false; $('drop').hidden = true;
      render();
    };
    i.onerror = function(){ URL.revokeObjectURL(url); };
    i.src = url;
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  ['country','bg'].forEach(function(id){ $(id).addEventListener('change', render); });
  $('zoom').addEventListener('input', function(){ $('zval').textContent = this.value; render(); });
  $('change').addEventListener('click', function(){ $('drop').hidden = false; $('editor').hidden = true; });

  $('dl').addEventListener('click', function(){ download(renderClean(), 'passport-photo.jpg'); });

  $('sheet').addEventListener('click', function(){
    // Lay repeats onto a standard 6x4 inch print at 300 dpi.
    var photo = renderClean();
    var sheetW = 6 * DPI, sheetH = 4 * DPI;
    var out = document.createElement('canvas');
    out.width = sheetW; out.height = sheetH;
    var c = out.getContext('2d');
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, sheetW, sheetH);

    var gap = Math.round(DPI * 0.08);
    var cols = Math.floor((sheetW + gap) / (photo.width + gap));
    var rows = Math.floor((sheetH + gap) / (photo.height + gap));
    var totalW = cols * photo.width + (cols - 1) * gap;
    var totalH = rows * photo.height + (rows - 1) * gap;
    var startX = (sheetW - totalW) / 2, startY = (sheetH - totalH) / 2;

    c.strokeStyle = '#cccccc'; c.lineWidth = 2;
    for (var r = 0; r < rows; r++) {
      for (var col = 0; col < cols; col++) {
        var x = startX + col * (photo.width + gap);
        var y = startY + r * (photo.height + gap);
        c.drawImage(photo, x, y);
        c.strokeRect(x, y, photo.width, photo.height);
      }
    }
    download(out, 'passport-photos-6x4.jpg');
  });
})();`,

  answerHeading: 'What makes a passport photo acceptable',
  answer: `<p><strong>Two things get photos rejected far more than anything else: head size and background.</strong> Most authorities require your head to occupy a specific proportion of the frame — around 50–69% of the height for a US photo, and 29–34 mm of a 45 mm UK photo — with your eyes on a defined line. The background must be plain, light and shadow-free. This tool handles the dimensions and shows guides for the head band and eye line; you still need a neutral expression, no glasses glare, and even lighting.</p>`,

  steps: [
    'Take or choose a photo against a plain light wall, lit evenly from the front.',
    'Pick your country. The frame resizes to the official dimensions at 300 dpi.',
    'Drag the photo so your eyes sit on the dashed line and your head fills the marked band.',
    'Download a single photo, or the 6×4 sheet to print at any photo counter.',
  ],

  sections: [
    {
      id: 'specs',
      h2: 'Official sizes',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Document</th><th>Photo size</th><th>Head height</th></tr></thead>
<tbody>
<tr><td>US passport and visa</td><td>2 × 2 in (51 × 51 mm)</td><td>25–35 mm (1–1⅜ in)</td></tr>
<tr><td>UK passport</td><td>35 × 45 mm</td><td>29–34 mm</td></tr>
<tr><td>Schengen visa</td><td>35 × 45 mm</td><td>32–36 mm</td></tr>
<tr><td>Canada passport</td><td>50 × 70 mm</td><td>31–36 mm</td></tr>
<tr><td>Australia passport</td><td>35 × 45 mm</td><td>32–36 mm</td></tr>
<tr><td>India passport</td><td>51 × 51 mm</td><td>25–35 mm</td></tr>
</tbody></table></div>
<p>Print at 300 dpi or better. A photo printed from a low-resolution file will be rejected for lacking detail even when the dimensions are right.</p>`,
    },
    {
      id: 'rejected',
      h2: 'Why photos get rejected',
      html: `<ul>
<li><strong>Shadows on the face or behind the head.</strong> Stand a metre or so from the wall and face a window.</li>
<li><strong>Head too large or too small.</strong> The most common single failure, and what the guides here are for.</li>
<li><strong>Smiling or an open mouth.</strong> Neutral expression, mouth closed, both eyes open.</li>
<li><strong>Glasses.</strong> The US no longer permits them at all; the UK and EU allow them only with no glare and the eyes fully visible. Taking them off is safer.</li>
<li><strong>Hair across the eyes or face.</strong></li>
<li><strong>Anything covering the head</strong>, except for religious or medical reasons, and the full face must still be visible.</li>
<li><strong>Filters, retouching or beauty modes.</strong> Turn them off; several authorities now reject digitally altered photos outright.</li>
<li><strong>An old photo.</strong> Most require one taken within the last six months.</li>
</ul>
<p>Children have relaxed rules on expression and gaze, but the background and framing requirements still apply.</p>`,
    },
  ],

  faq: [
    { q: 'Can I take a passport photo at home?', a: '<p>Yes, and most authorities accept them provided the specification is met. Use a plain light wall, face a window for even light, and have someone else take it from about two metres away rather than using a selfie — arm’s length distorts facial proportions.</p>' },
    { q: 'Is my photo uploaded?', a: '<p>No. Everything is done on a canvas in your browser and the result downloads directly.</p>' },
    { q: 'Can I wear glasses?', a: '<p>Not for a US passport, which prohibits them entirely. The UK and EU allow them if there is no glare and your eyes are clearly visible. Removing them avoids the risk.</p>' },
    { q: 'What background colour should I use?', a: '<p>Plain white or light grey for most countries, with no pattern, texture or shadow. The background option here only fills empty space; it cannot cut you out of a busy scene.</p>' },
    { q: 'How do I print these?', a: '<p>Download the 6×4 sheet and order a standard 6×4 print at any photo counter or kiosk, then cut along the guide lines. It costs a fraction of a photo booth.</p>' },
    { q: 'Will the guide lines appear in my download?', a: '<p>No. They are drawn on the preview only — the downloaded photo and print sheet are clean.</p>' },
  ],

  related: ['photo-cropper', 'image-resizer', 'image-compressor', 'image-to-pdf'],
};
