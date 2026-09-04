export default {
  slug: 'background-remover',
  category: 'file-tools',
  title: 'Background Remover – Cut Out a Plain Background',
  h1: 'Background Remover',
  cardText: 'Removes a plain, even background from a photo. Best on product and passport shots.',
  description:
    'Free background remover. Click the background to remove it and get a transparent PNG. Works on plain, evenly lit backgrounds — no upload, no account.',
  keywords: ['background remover', 'remove background from image', 'transparent png maker', 'cut out background free'],
  updated: '2026-09-04',
  lede: 'Click the background colour to remove it. This is a colour-based tool, so it works well on plain backdrops and poorly on busy ones — the page is honest about which is which.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/>
  </svg>
  <p><strong>Drop an image here</strong> or click to choose</p>
  <p class="hint">Works best on plain, evenly lit backgrounds</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="editor" hidden>
  <p class="hint" style="margin-top:16px">Click the background in the image to remove that colour. Click again elsewhere to remove another shade.</p>
  <div class="bgr-stage"><canvas id="canvas"></canvas></div>

  <div class="row" style="margin-top:16px">
    <div class="field">
      <label for="tol">Tolerance: <strong id="tval">32</strong></label>
      <input type="range" id="tol" min="5" max="120" step="1" value="32" style="width:100%;padding:0;border:none;background:transparent">
      <span class="hint">Higher removes more shades. Too high eats the subject.</span>
    </div>
    <div class="field">
      <label for="feather">Edge softness: <strong id="fval">2</strong></label>
      <input type="range" id="feather" min="0" max="6" step="1" value="2" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="bg">Preview against</label>
      <select id="bg">
        <option value="checker" selected>Transparency checker</option>
        <option value="#ffffff">White</option>
        <option value="#111827">Dark</option>
      </select>
    </div>
  </div>

  <div class="btn-row">
    <button type="button" class="btn" id="dl">Download PNG</button>
    <button type="button" class="btn btn-ghost" id="undo">Undo last</button>
    <button type="button" class="btn btn-ghost" id="reset">Start over</button>
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
.bgr-stage{margin-top:12px;border:1px solid var(--line);border-radius:var(--radius);padding:14px;
  display:grid;place-items:center;
  background-image:linear-gradient(45deg,#d8d4cc 25%,transparent 25%),linear-gradient(-45deg,#d8d4cc 25%,transparent 25%),
    linear-gradient(45deg,transparent 75%,#d8d4cc 75%),linear-gradient(-45deg,transparent 75%,#d8d4cc 75%);
  background-size:18px 18px;background-position:0 0,0 9px,9px -9px,-9px 0}
.bgr-stage canvas{max-width:100%;max-height:440px;height:auto;cursor:crosshair;border-radius:4px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
  var original = null;       // pristine ImageData
  var history = [];          // stack of removed key colours

  function load(file){
    if (!/^image\\/(jpeg|png|webp)$/.test(file.type)) {
      $('err').hidden = false;
      $('err').textContent = 'That file type is not supported. Choose a JPG, PNG or WebP image.';
      return;
    }
    $('err').hidden = true;
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function(){
      var maxW = 1200;
      var scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history = [];
      $('editor').hidden = false;
      $('drop').hidden = true;
      updateMeta();
      URL.revokeObjectURL(url);
    };
    img.onerror = function(){ URL.revokeObjectURL(url); };
    img.src = url;
  }

  /**
   * Remove every pixel within the tolerance of each key colour, measured in
   * plain RGB distance. Pixels near the boundary get partial alpha so edges
   * are not a hard staircase.
   */
  function apply(){
    if (!original) return;
    var src = original.data;
    var out = ctx.createImageData(canvas.width, canvas.height);
    var dst = out.data;
    var tol = parseInt($('tol').value, 10);
    var feather = parseInt($('feather').value, 10);
    var soft = tol * (1 + feather * 0.35);

    for (var i = 0; i < src.length; i += 4) {
      dst[i] = src[i]; dst[i + 1] = src[i + 1]; dst[i + 2] = src[i + 2];
      var alpha = src[i + 3];

      for (var k = 0; k < history.length; k++) {
        var key = history[k];
        var dr = src[i] - key[0], dg = src[i + 1] - key[1], db = src[i + 2] - key[2];
        var dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist <= tol) { alpha = 0; break; }
        if (feather > 0 && dist < soft) {
          var partial = Math.round(255 * (dist - tol) / (soft - tol));
          if (partial < alpha) alpha = partial;
        }
      }
      dst[i + 3] = alpha;
    }
    ctx.putImageData(out, 0, 0);
    updateMeta();
  }

  function updateMeta(){
    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var clear = 0;
    for (var i = 3; i < data.length; i += 4) if (data[i] < 20) clear++;
    var total = canvas.width * canvas.height;
    $('meta').textContent = canvas.width + ' × ' + canvas.height + ' px · ' +
      Math.round(clear / total * 100) + '% removed · ' +
      history.length + (history.length === 1 ? ' colour' : ' colours') + ' taken out';
  }

  canvas.addEventListener('click', function(e){
    if (!original) return;
    var rect = canvas.getBoundingClientRect();
    var x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    var y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    var idx = (y * canvas.width + x) * 4;
    history.push([original.data[idx], original.data[idx + 1], original.data[idx + 2]]);
    apply();
  });

  $('tol').addEventListener('input', function(){ $('tval').textContent = this.value; apply(); });
  $('feather').addEventListener('input', function(){ $('fval').textContent = this.value; apply(); });
  $('bg').addEventListener('change', function(){
    var stage = document.querySelector('.bgr-stage');
    if (this.value === 'checker') {
      stage.style.background = '';
      stage.style.backgroundImage = 'linear-gradient(45deg,#d8d4cc 25%,transparent 25%),linear-gradient(-45deg,#d8d4cc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d8d4cc 75%),linear-gradient(-45deg,transparent 75%,#d8d4cc 75%)';
      stage.style.backgroundSize = '18px 18px';
      stage.style.backgroundPosition = '0 0,0 9px,9px -9px,-9px 0';
    } else {
      stage.style.backgroundImage = 'none';
      stage.style.background = this.value;
    }
  });
  $('undo').addEventListener('click', function(){ history.pop(); apply(); });
  $('reset').addEventListener('click', function(){ history = []; apply(); });
  $('change').addEventListener('click', function(){ $('drop').hidden = false; $('editor').hidden = true; });

  $('dl').addEventListener('click', function(){
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'no-background.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }, 'image/png');
  });

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
})();`,

  answerHeading: 'What this tool can and cannot do',
  answer: `<p><strong>This removes a background by colour, not by understanding what is in the picture — and that distinction decides whether it will work for you.</strong> Click a background pixel and every pixel of a similar colour becomes transparent. On a product shot against a white sweep, a passport photo against a plain wall, or a logo on a solid field, that is exactly right and takes seconds. On a person in a park, it will fail, because the AI-style removers that handle those run a trained segmentation model — something this page deliberately does not download or upload your photo to.</p>`,

  steps: [
    'Drop in an image with a plain background.',
    'Click the background to remove that colour.',
    'Adjust <strong>tolerance</strong> until the background goes but the subject stays.',
    'Add a little <strong>edge softness</strong> to avoid a hard jagged outline, then download the PNG.',
  ],

  sections: [
    {
      id: 'works',
      h2: 'When it works, and when it does not',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Image</th><th>Result</th></tr></thead>
<tbody>
<tr><td>Product on a white sweep</td><td>Excellent</td></tr>
<tr><td>Passport photo on a plain wall</td><td>Good, with tolerance tuning</td></tr>
<tr><td>Logo or graphic on solid colour</td><td>Excellent</td></tr>
<tr><td>Screenshot with a flat background</td><td>Excellent</td></tr>
<tr><td>Person against a green screen</td><td>Good</td></tr>
<tr><td>Anyone photographed outdoors</td><td>Poor — too many background colours</td></tr>
<tr><td>Hair, fur or anything wispy</td><td>Poor — the edge is semi-transparent by nature</td></tr>
<tr><td>Subject a similar colour to the background</td><td>Poor — they cannot be told apart</td></tr>
</tbody></table></div>
<p>If the subject and background share a colour, no colour-based method can separate them. That is a limit of the approach, not of the settings.</p>`,
    },
    {
      id: 'tips',
      h2: 'Getting a clean cut-out',
      html: `<ul>
<li><strong>Start with low tolerance and raise it.</strong> Going too high first eats into the subject and you lose the reference for what "too far" looks like.</li>
<li><strong>Click several times.</strong> Even a "plain" wall has shadow and gradient. Removing three or four related shades usually beats one huge tolerance.</li>
<li><strong>Preview against dark.</strong> White fringes around the subject are invisible against white and obvious against a dark background — which is where they will end up.</li>
<li><strong>Use a little edge softness.</strong> One or two removes the staircase edge without blurring the subject.</li>
<li><strong>Shoot for it if you can.</strong> A plain wall, subject a metre away from it, even front lighting. Two minutes of setup beats an hour of correction.</li>
</ul>`,
    },
    {
      id: 'privacy',
      h2: 'Why there is no AI model here',
      html: `<p>Background removal services that handle complicated photos work by running a trained segmentation model. That model has to be either downloaded to your device — typically tens of megabytes — or, far more commonly, run on the provider's servers, which means uploading your photo.</p>
<p>For the photos people most often want cut out — product shots, ID photos, headshots — uploading is a real cost, and colour-based removal handles those cases perfectly well.</p>
<p>So this tool does what can be done honestly on your own machine, in a few kilobytes of JavaScript, and tells you plainly where that stops. For a photograph with a complex background, an AI service will do a better job, and you should decide knowingly whether the upload is a fair trade.</p>`,
    },
  ],

  faq: [
    { q: 'Is my photo uploaded?', a: '<p>No. Everything happens on a canvas in your browser. There is no server and no model download.</p>' },
    { q: 'Why is it leaving a coloured fringe around my subject?', a: '<p>Because edge pixels blend subject and background, so they are neither colour exactly. Raise tolerance slightly and add edge softness. A fringe against a dark preview is the clearest way to see it.</p>' },
    { q: 'Can it remove a busy background?', a: '<p>No. It matches colours, so a background with many colours cannot be selected. Use an AI-based service for those, accepting that it means uploading the photo.</p>' },
    { q: 'Why did it delete part of my subject?', a: '<p>Tolerance is too high, or the subject contains the background colour. Lower the tolerance and click several background shades individually instead.</p>' },
    { q: 'What format is the download?', a: '<p>PNG, which supports transparency. JPEG cannot store an alpha channel, so a transparent background would come out white.</p>' },
    { q: 'Does it work on hair?', a: '<p>Poorly. Hair edges are semi-transparent and fine, which colour thresholding cannot handle. This is the main case where a trained model genuinely outperforms.</p>' },
  ],

  related: ['photo-cropper', 'image-resizer', 'passport-photo-maker', 'watermark-photo'],
};
