export default {
  slug: 'watermark-photo',
  category: 'file-tools',
  title: 'Add Watermark to Photo – Text or Tiled, Free',
  h1: 'Photo Watermark',
  cardText: 'Add a text watermark to a photo, in a corner or tiled across it.',
  description:
    'Free photo watermark tool. Add your name or website across an image, choose position, opacity, size and rotation, and download. No upload, no watermark of ours.',
  keywords: ['add watermark to photo', 'watermark tool', 'photo watermark free', 'watermark image online', 'copyright photo'],
  updated: '2026-09-04',
  lede: 'Add your name, website or a copyright line to a photo. Place it in a corner or tile it across the whole image.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 15h8M8 11h8"/>
  </svg>
  <p><strong>Drop an image here</strong> or click to choose</p>
  <p class="hint">JPG, PNG or WebP · nothing is uploaded</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="editor" hidden>
  <div class="row" style="margin-top:18px">
    <div class="field">
      <label for="text">Watermark text</label>
      <input type="text" id="text" value="© Your Name" maxlength="80" autocomplete="off">
    </div>
    <div class="field">
      <label for="position">Placement</label>
      <select id="position">
        <option value="br" selected>Bottom right</option>
        <option value="bl">Bottom left</option>
        <option value="tr">Top right</option>
        <option value="tl">Top left</option>
        <option value="center">Centre</option>
        <option value="tile">Tiled across</option>
      </select>
    </div>
  </div>

  <div class="row">
    <div class="field">
      <label for="size">Size: <strong id="sval">4</strong>%</label>
      <input type="range" id="size" min="1.5" max="14" step="0.5" value="4" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="opacity">Opacity: <strong id="oval">45</strong>%</label>
      <input type="range" id="opacity" min="5" max="100" step="5" value="45" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="rotate">Rotation: <strong id="rval">0</strong>°</label>
      <input type="range" id="rotate" min="-60" max="60" step="5" value="0" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="colour">Colour</label>
      <input type="color" id="colour" value="#ffffff" style="height:42px;padding:4px">
    </div>
  </div>

  <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);margin-bottom:6px">
    <input type="checkbox" id="shadow" checked style="width:auto"> Add a shadow so it reads on light backgrounds
  </label>

  <div class="wm-stage"><canvas id="canvas" role="img" aria-label="Watermarked preview"></canvas></div>

  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn" id="dl">Download</button>
    <button type="button" class="btn btn-ghost" id="change">Choose another image</button>
  </div>
  <p class="hint" id="meta" style="margin-top:10px"></p>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.wm-stage{margin-top:16px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px;display:grid;place-items:center}
.wm-stage canvas{max-width:100%;height:auto;border-radius:5px}
input[type=color]{width:100%;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--bg);cursor:pointer}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d');
  var img = null;

  function render(){
    if (!img) return;
    var maxW = 1400;
    var scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    var text = $('text').value;
    if (!text) { $('meta').textContent = canvas.width + ' × ' + canvas.height + ' px'; return; }

    var fontSize = canvas.height * parseFloat($('size').value) / 100;
    ctx.font = '600 ' + fontSize + 'px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = $('colour').value;
    ctx.globalAlpha = parseInt($('opacity').value, 10) / 100;

    if ($('shadow').checked) {
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = fontSize * 0.18;
      ctx.shadowOffsetY = fontSize * 0.04;
    } else {
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    }

    var angle = parseInt($('rotate').value, 10) * Math.PI / 180;
    var pos = $('position').value;
    var pad = canvas.width * 0.03;
    var w = ctx.measureText(text).width;

    if (pos === 'tile') {
      // Tile on a diagonal grid so cropping cannot remove every instance.
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(angle || -Math.PI / 9);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var stepX = w + fontSize * 2.2;
      var stepY = fontSize * 3.4;
      var reach = Math.max(canvas.width, canvas.height);
      for (var y = -reach; y <= reach; y += stepY) {
        var offset = (Math.round(y / stepY) % 2) ? stepX / 2 : 0;
        for (var x = -reach; x <= reach; x += stepX) {
          ctx.fillText(text, x + offset, y);
        }
      }
      ctx.restore();
    } else {
      var x, y;
      ctx.textBaseline = 'alphabetic';
      if (pos === 'center') { ctx.textAlign = 'center'; x = canvas.width / 2; y = canvas.height / 2; }
      else {
        var right = pos === 'br' || pos === 'tr';
        var bottom = pos === 'br' || pos === 'bl';
        ctx.textAlign = right ? 'right' : 'left';
        x = right ? canvas.width - pad : pad;
        y = bottom ? canvas.height - pad : pad + fontSize;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    $('meta').textContent = canvas.width + ' × ' + canvas.height + ' px';
  }

  function load(file){
    if (!/^image\\/(jpeg|png|webp)$/.test(file.type)) {
      $('err').hidden = false;
      $('err').textContent = 'That file type is not supported. Choose a JPG, PNG or WebP image.';
      return;
    }
    $('err').hidden = true;
    var url = URL.createObjectURL(file);
    var i = new Image();
    i.onload = function(){ img = i; $('editor').hidden = false; $('drop').hidden = true; render(); };
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

  ['text','position','size','opacity','rotate','colour','shadow'].forEach(function(id){
    $(id).addEventListener($(id).type === 'checkbox' || $(id).tagName === 'SELECT' ? 'change' : 'input', render);
  });
  $('size').addEventListener('input', function(){ $('sval').textContent = this.value; });
  $('opacity').addEventListener('input', function(){ $('oval').textContent = this.value; });
  $('rotate').addEventListener('input', function(){ $('rval').textContent = this.value; });
  $('change').addEventListener('click', function(){ $('drop').hidden = false; $('editor').hidden = true; });

  $('dl').addEventListener('click', function(){
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'watermarked.jpg';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }, 'image/jpeg', 0.92);
  });
})();`,

  answerHeading: 'What a watermark actually protects',
  answer: `<p><strong>A watermark deters casual reuse and identifies the source — it does not prevent theft.</strong> Anyone determined enough can crop a corner mark or clone it out, and modern tools make that easy. What a watermark reliably does is stop an image being passed off as someone else's by accident, keep your name attached as it spreads, and signal that the photographer is paying attention. For the small share of uses where that matters, a tiled watermark across the middle is far harder to remove than a discreet corner one — at the cost of the image looking worse.</p>`,

  steps: [
    'Drop in your image.',
    'Type your name, website or copyright line.',
    'Choose a corner for something subtle, or <strong>tiled</strong> for something hard to remove.',
    'Adjust size, opacity and rotation, then download.',
  ],

  sections: [
    {
      id: 'placement',
      h2: 'Corner or tiled?',
      html: `<div class="table-scroll"><table>
<thead><tr><th></th><th>Corner</th><th>Tiled</th></tr></thead>
<tbody>
<tr><td>Looks like</td><td>A discreet signature</td><td>A proof or preview copy</td></tr>
<tr><td>Removal difficulty</td><td>Easy — crop it</td><td>Hard — covers the subject</td></tr>
<tr><td>Best for</td><td>Portfolio, social posts</td><td>Client proofs, stock previews</td></tr>
<tr><td>Recommended opacity</td><td>35–55%</td><td>15–30%</td></tr>
</tbody></table></div>
<p>The usual approach is to use both, at different stages: a corner mark on anything you are happy to have shared, and a tiled mark on proofs sent to a client before payment.</p>`,
    },
    {
      id: 'copyright',
      h2: 'Copyright, briefly',
      html: `<p>In every country signed up to the Berne Convention — which is nearly all of them — you own the copyright in a photograph from the moment you take it. No watermark, notice or registration is required for the right to exist.</p>
<p>What a © notice does is remove the "I didn't know it was protected" defence, and in the United States it can matter for damages. US registration with the Copyright Office, done before an infringement or within three months of publication, is what unlocks statutory damages and legal costs — and that, rather than the watermark, is what gives a claim teeth.</p>
<p>A watermark's practical value is attribution: when an image is reposted without credit, your name travels with it.</p>`,
    },
  ],

  faq: [
    { q: 'Does a watermark stop people stealing my photos?', a: '<p>It deters casual reuse and keeps your name attached, but a determined person can crop or edit it out. Tiled watermarks across the subject are much harder to remove than corner ones.</p>' },
    { q: 'Is my photo uploaded?', a: '<p>No. The watermark is drawn on a canvas in your browser and the result downloads directly. Your image never leaves your device.</p>' },
    { q: 'What opacity should I use?', a: '<p>Around 40–50% for a corner mark — visible but not distracting. For tiled watermarks, 15–30% is enough, since repetition does the work.</p>' },
    { q: 'Can I use a logo image instead of text?', a: '<p>Not in this tool, which handles text only. For a logo watermark you need an editor that can composite one image over another.</p>' },
    { q: 'Does watermarking reduce quality?', a: '<p>The output is re-encoded as JPEG at high quality, so the loss is negligible. Very large images are capped at 1400 pixels wide, which is ample for online use.</p>' },
  ],

  related: ['image-compressor', 'image-resizer', 'photo-cropper', 'meme-generator'],
};
