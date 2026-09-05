export default {
  slug: 'image-to-text',
  category: 'text',
  title: 'Image to Text – Free OCR, No Upload',
  h1: 'Image to Text (OCR)',
  cardText: 'Pull the text out of a photo or screenshot so you can copy it.',
  description:
    'Free OCR tool. Extract text from a photo, scan or screenshot so you can copy and edit it, in over a dozen languages. Runs in your browser with no upload.',
  keywords: ['image to text', 'ocr online free', 'extract text from image', 'photo to text', 'screenshot to text'],
  updated: '2026-09-04',
  lede: 'Reads printed text from photos and screenshots. Handwriting is a different problem — the page explains why it rarely works.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
  </svg>
  <p><strong>Drop an image here</strong> or click to choose</p>
  <p class="hint">Photo, scan or screenshot · nothing is uploaded</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp,image/bmp" hidden>
</div>

<div id="panel" hidden>
  <div class="row" style="margin-top:16px">
    <div class="field">
      <label for="lang">Language</label>
      <select id="lang">
        <option value="eng" selected>English</option>
        <option value="fra">French</option>
        <option value="deu">German</option>
        <option value="spa">Spanish</option>
        <option value="ita">Italian</option>
        <option value="por">Portuguese</option>
        <option value="nld">Dutch</option>
        <option value="pol">Polish</option>
        <option value="rus">Russian</option>
        <option value="tur">Turkish</option>
        <option value="ara">Arabic</option>
        <option value="hin">Hindi</option>
        <option value="jpn">Japanese</option>
        <option value="kor">Korean</option>
        <option value="chi_sim">Chinese (simplified)</option>
      </select>
    </div>
    <div class="field">
      <span class="field-label">Preprocessing</span>
      <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);padding-top:8px">
        <input type="checkbox" id="enhance" checked style="width:auto"> Boost contrast before reading
      </label>
    </div>
  </div>

  <div class="ocr-preview"><img id="preview" alt="Image being read"></div>

  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn btn-lg" id="go">Read the text</button>
    <button type="button" class="btn btn-ghost" id="change">Choose another image</button>
  </div>
  <div class="ocr-progress" id="progress" hidden><span id="bar"></span></div>
  <p class="hint" id="status" style="margin-top:10px"></p>
</div>

<div class="field" id="out-field" hidden style="margin-top:18px">
  <label for="text">Extracted text <span class="hint">(editable)</span></label>
  <textarea id="text" rows="10" style="min-height:220px"></textarea>
  <span class="hint" id="meta"></span>
</div>
<div class="btn-row" id="out-actions" hidden>
  <button type="button" class="btn" id="copy">Copy text</button>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.ocr-preview{margin-top:14px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:12px;display:grid;place-items:center}
.ocr-preview img{max-width:100%;max-height:320px;height:auto;border-radius:4px}
.ocr-progress{height:8px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:999px;
  overflow:hidden;margin-top:12px}
.ocr-progress span{display:block;height:100%;width:0;background:var(--accent);border-radius:999px;transition:width .2s}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var file = null, libPromise = null;

  function loadLib(){
    if (libPromise) return libPromise;
    libPromise = new Promise(function(resolve, reject){
      if (window.Tesseract) return resolve(window.Tesseract);
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/7.0.0/tesseract.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = function(){ window.Tesseract ? resolve(window.Tesseract) : reject(new Error('OCR engine failed to initialise')); };
      s.onerror = function(){ reject(new Error('could not load the OCR engine')); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  /** Grayscale and stretch contrast — OCR is markedly better on clean black on white. */
  function preprocess(img){
    var canvas = document.createElement('canvas');
    // Upscale small images; OCR needs roughly 30px of character height.
    var scale = Math.min(3, Math.max(1, 1400 / img.naturalWidth));
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (!$('enhance').checked) return canvas;

    var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = data.data;
    var min = 255, max = 0, i;
    for (i = 0; i < d.length; i += 4) {
      var g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
      d[i] = d[i + 1] = d[i + 2] = g;
      if (g < min) min = g;
      if (g > max) max = g;
    }
    var range = Math.max(1, max - min);
    for (i = 0; i < d.length; i += 4) {
      var v = (d[i] - min) / range * 255;
      v = Math.max(0, Math.min(255, (v - 128) * 1.35 + 128));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
  }

  function run(){
    if (!file) return;
    $('err').hidden = true;
    $('go').disabled = true;
    $('go').textContent = 'Reading…';
    $('progress').hidden = false;
    $('bar').style.width = '4%';
    $('status').textContent = 'Loading the OCR engine and language data (a few MB, once per language)…';

    var img = $('preview');
    var canvas = preprocess(img);

    loadLib().then(function(Tesseract){
      return Tesseract.recognize(canvas, $('lang').value, {
        logger: function(m){
          if (m.status === 'recognizing text') {
            $('bar').style.width = Math.round(10 + m.progress * 90) + '%';
            $('status').textContent = 'Reading text… ' + Math.round(m.progress * 100) + '%';
          } else if (m.status) {
            $('status').textContent = m.status.charAt(0).toUpperCase() + m.status.slice(1) + '…';
          }
        }
      });
    }).then(function(result){
      var text = (result.data.text || '').replace(/\\n{3,}/g, '\\n\\n').trim();
      $('text').value = text;
      $('out-field').hidden = false;
      $('out-actions').hidden = false;
      $('progress').hidden = true;
      $('go').disabled = false;
      $('go').textContent = 'Read the text';

      var conf = Math.round(result.data.confidence || 0);
      var words = text ? text.split(/\\s+/).length : 0;
      $('meta').textContent = words + ' words · confidence ' + conf + '%' +
        (conf < 70 ? ' — low, so expect errors. Try a sharper, straighter image.' : '');
      $('status').textContent = text ? 'Done. Check the text — OCR always needs proofreading.'
                                     : 'No text found. Try a clearer image with more contrast.';
    }).catch(function(e){
      $('err').hidden = false;
      $('err').textContent = 'Could not read the image: ' + e.message + '.';
      $('progress').hidden = true;
      $('status').textContent = '';
      $('go').disabled = false;
      $('go').textContent = 'Read the text';
    });
  }

  function load(f){
    if (!/^image\\//.test(f.type)) {
      $('err').hidden = false;
      $('err').textContent = 'That is not an image file.';
      return;
    }
    $('err').hidden = true;
    file = f;
    var url = URL.createObjectURL(f);
    $('preview').onload = function(){ URL.revokeObjectURL(url); };
    $('preview').src = url;
    $('panel').hidden = false;
    $('drop').hidden = true;
    $('out-field').hidden = true;
    $('out-actions').hidden = true;
    $('status').textContent = '';
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ if (this.files[0]) load(this.files[0]); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });

  // Paste a screenshot straight in.
  document.addEventListener('paste', function(e){
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) { load(items[i].getAsFile()); break; }
    }
  });

  $('go').addEventListener('click', run);
  $('change').addEventListener('click', function(){
    $('drop').hidden = false; $('panel').hidden = true;
    $('out-field').hidden = true; $('out-actions').hidden = true;
    file = null;
  });
  $('copy').addEventListener('click', function(){
    navigator.clipboard.writeText($('text').value).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy text'; }, 1400);
    });
  });
})();`,

  answerHeading: 'Why handwriting usually fails',
  answer: `<p><strong>OCR recognises letter shapes it has been trained on, and printed type is consistent in a way handwriting is not.</strong> Tesseract, the open-source engine this uses, is trained overwhelmingly on printed text and typically manages 95%+ accuracy on a clean scan. On handwriting it usually produces nonsense, because every writer forms letters differently and cursive joins them into shapes with no clear boundaries. Handwriting recognition is a genuinely harder problem needing different models — so if that is what you need, this is not the tool.</p>`,

  steps: [
    'Drop in an image, or just paste a screenshot with Ctrl+V.',
    'Pick the language of the text — this matters more than you would expect.',
    'Press <strong>Read the text</strong>. The engine downloads once per language.',
    'Proofread and edit the result, then copy it.',
  ],

  sections: [
    {
      id: 'accuracy',
      h2: 'Getting a usable result',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Image</th><th>Typical accuracy</th></tr></thead>
<tbody>
<tr><td>Screenshot of on-screen text</td><td>Near perfect</td></tr>
<tr><td>Flatbed scan at 300 dpi</td><td>Very good</td></tr>
<tr><td>Straight, well-lit phone photo of a page</td><td>Good</td></tr>
<tr><td>Angled or shadowed photo</td><td>Patchy</td></tr>
<tr><td>Text over a photograph or pattern</td><td>Poor</td></tr>
<tr><td>Handwriting</td><td>Usually unusable</td></tr>
</tbody></table></div>
<p>Four things help most: <strong>square on</strong> rather than angled, <strong>even light</strong> with no shadow across the page, <strong>in focus</strong>, and <strong>large enough</strong> — characters need roughly 30 pixels of height, so fill the frame with the text rather than the whole desk.</p>`,
    },
    {
      id: 'privacy',
      h2: 'What is downloaded, and what is not',
      html: `<p>OCR needs a recognition engine and trained language data. This page fetches Tesseract.js and the language file you select from public CDNs the first time you use them — several megabytes, cached afterwards.</p>
<p><strong>Your image is not part of that.</strong> Recognition runs in WebAssembly on your own device. The picture never leaves your machine, which matters given that the things people most often run OCR on are documents, receipts, letters and ID.</p>
<p>Most free OCR websites upload your image to a server instead.</p>`,
    },
  ],

  faq: [
    { q: 'Is my image uploaded?', a: '<p>No. The OCR engine and language data are downloaded to your browser, and recognition runs locally in WebAssembly. Your image is never transmitted.</p>' },
    { q: 'Does it read handwriting?', a: '<p>Rarely well. The engine is trained on printed text; handwriting needs different models entirely. Neat block capitals sometimes work; cursive essentially never does.</p>' },
    { q: 'Why is the first run slow?', a: '<p>The engine and the language data download on first use, a few megabytes. After that they are cached and subsequent runs are much faster.</p>' },
    { q: 'Can it read a PDF?', a: '<p>Not directly. Use the <a href="/pdf-to-image/">PDF to image</a> tool first, then run the resulting page image through here.</p>' },
    { q: 'Why is the text full of mistakes?', a: '<p>Usually a low-resolution, angled or shadowed image. Retake it square on with even light, filling the frame with the text. The confidence figure tells you how much to trust the output.</p>' },
    { q: 'Does it keep the layout?', a: '<p>Roughly. Line breaks are preserved but columns, tables and complex layouts come out as running text, which usually needs rearranging by hand.</p>' },
  ],

  related: ['pdf-to-image', 'word-counter', 'text-case-converter', 'text-to-speech'],
};
