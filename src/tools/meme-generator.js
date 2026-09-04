export default {
  slug: 'meme-generator',
  category: 'fun',
  title: 'Meme Generator – Add Top and Bottom Text to Any Image',
  h1: 'Meme Generator',
  cardText: 'Add classic meme text to your own image and download it.',
  description:
    'Free meme generator with no watermark. Upload any image, add top and bottom text in the classic Impact style, adjust size and download. No signup.',
  keywords: ['meme generator', 'meme maker', 'add text to image', 'caption generator', 'free meme maker'],
  updated: '2026-09-04',
  lede: 'Drop in any image, type your caption, download. No watermark, no account, and your image is never uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 15 5-5 4 4 3-3 6 6"/><circle cx="8.5" cy="8.5" r="1.5"/>
  </svg>
  <p><strong>Drop an image here</strong> or click to choose</p>
  <p class="hint">Any JPG, PNG or WebP · nothing is uploaded</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="editor" hidden>
  <div class="row" style="margin-top:18px">
    <div class="field">
      <label for="top">Top text</label>
      <input type="text" id="top" value="ONE DOES NOT SIMPLY" maxlength="120" autocomplete="off">
    </div>
    <div class="field">
      <label for="bottom">Bottom text</label>
      <input type="text" id="bottom" value="BUILD 100 TOOLS IN AN AFTERNOON" maxlength="120" autocomplete="off">
    </div>
  </div>

  <div class="row">
    <div class="field">
      <label for="size">Text size: <strong id="sval">10</strong>%</label>
      <input type="range" id="size" min="4" max="18" step="1" value="10" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="stroke">Outline: <strong id="oval">6</strong></label>
      <input type="range" id="stroke" min="0" max="14" step="1" value="6" style="width:100%;padding:0;border:none;background:transparent">
    </div>
    <div class="field">
      <label for="colour">Text colour</label>
      <input type="color" id="colour" value="#ffffff" style="height:42px;padding:4px">
    </div>
    <div class="field">
      <label for="caps">Style</label>
      <select id="caps">
        <option value="upper" selected>ALL CAPS (classic)</option>
        <option value="as">As typed</option>
      </select>
    </div>
  </div>

  <div class="meme-stage"><canvas id="canvas" role="img" aria-label="Meme preview"></canvas></div>

  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn" id="dl">Download meme</button>
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
.meme-stage{margin-top:16px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px;display:grid;place-items:center}
.meme-stage canvas{max-width:100%;height:auto;border-radius:5px}
input[type=color]{width:100%;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--bg);cursor:pointer}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d');
  var img = null;

  // Impact is the traditional meme face; the fallbacks keep it condensed and bold.
  var FONT = '"Impact", "Haettenschweiler", "Arial Narrow Bold", "Anton", sans-serif';

  /** Wrap text to the canvas width, returning the lines. */
  function wrap(text, maxWidth){
    var words = text.split(/\\s+/).filter(Boolean);
    if (!words.length) return [];
    var lines = [], line = words[0];
    for (var i = 1; i < words.length; i++) {
      var test = line + ' ' + words[i];
      if (ctx.measureText(test).width <= maxWidth) line = test;
      else { lines.push(line); line = words[i]; }
    }
    lines.push(line);
    return lines;
  }

  function drawText(text, position){
    if (!text) return;
    var fontSize = canvas.height * parseInt($('size').value, 10) / 100;
    ctx.font = '700 ' + fontSize + 'px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillStyle = $('colour').value;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = canvas.height * parseInt($('stroke').value, 10) / 1000;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    var margin = canvas.width * 0.05;
    var lines = wrap(text, canvas.width - margin * 2);
    var lineHeight = fontSize * 1.08;

    lines.forEach(function(line, i){
      var y;
      if (position === 'top') {
        ctx.textBaseline = 'top';
        y = margin * 0.6 + i * lineHeight;
      } else {
        ctx.textBaseline = 'bottom';
        y = canvas.height - margin * 0.6 - (lines.length - 1 - i) * lineHeight;
      }
      var x = canvas.width / 2;
      if (ctx.lineWidth > 0) ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);
    });
  }

  function render(){
    if (!img) return;
    // Cap the working size so very large photos stay responsive.
    var maxW = 1200;
    var scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    var caps = $('caps').value === 'upper';
    var top = $('top').value, bottom = $('bottom').value;
    drawText(caps ? top.toUpperCase() : top, 'top');
    drawText(caps ? bottom.toUpperCase() : bottom, 'bottom');

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
    i.onload = function(){
      img = i;
      $('editor').hidden = false;
      $('drop').hidden = true;
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

  ['top','bottom','size','stroke','colour','caps'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', render);
  });
  $('size').addEventListener('input', function(){ $('sval').textContent = this.value; });
  $('stroke').addEventListener('input', function(){ $('oval').textContent = this.value; });
  $('change').addEventListener('click', function(){ $('drop').hidden = false; $('editor').hidden = true; });

  $('dl').addEventListener('click', function(){
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'meme.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }, 'image/png');
  });
})();`,

  answerHeading: 'Why memes use that particular font',
  answer: `<p><strong>The white-on-black Impact style is an accident of history, not a design choice.</strong> Impact shipped with Windows 95 and every Mac from the late 1990s, so it was the one heavy condensed font that existed on essentially every computer. Early image macro tools defaulted to it, the look became the convention, and it stuck. The black outline exists for a practical reason — white text alone disappears against light parts of a photo, and a thick stroke makes it readable over anything.</p>`,

  steps: [
    'Drop in any image.',
    'Type your top and bottom text.',
    'Adjust the size and outline until it reads clearly against the image.',
    'Download. No watermark is added.',
  ],

  sections: [
    {
      id: 'making',
      h2: 'Making one that reads well',
      html: `<ul>
<li><strong>Keep it short.</strong> Two short lines beat one long one — a caption that wraps to four lines has already lost the joke.</li>
<li><strong>Turn up the outline over busy images.</strong> A thick black stroke is what keeps white text legible over a detailed photo.</li>
<li><strong>Put the setup on top and the punchline underneath.</strong> That structure is the entire grammar of the format.</li>
<li><strong>Check it at thumbnail size.</strong> Most people will see it small in a feed, so if it is unreadable at 300 pixels wide it is unreadable.</li>
<li><strong>All caps is the convention</strong>, and conventions carry meaning here. Sentence case reads as a different, more earnest kind of post.</li>
</ul>`,
    },
    {
      id: 'rights',
      h2: 'A note on the images you use',
      html: `<p>This tool adds text to an image you supply, so what you may legally do with the result depends on the image.</p>
<p>Photographs are protected by copyright from the moment they are taken. Widely shared meme templates are used so ubiquitously that enforcement is rare, but "everyone does it" is not a legal defence — and using someone's photograph commercially, or in a way that mocks an identifiable private person, carries real risk.</p>
<p>Safe ground: your own photographs, public domain images, and anything under a permissive Creative Commons licence. If you are making something for a business, use a licensed stock image.</p>`,
    },
  ],

  faq: [
    { q: 'Is there a watermark?', a: '<p>No. The downloaded image contains only your picture and your text.</p>' },
    { q: 'Is my image uploaded?', a: '<p>No. Everything is drawn on a canvas in your browser and downloaded directly. The image never leaves your device.</p>' },
    { q: 'Why does the font look different on my computer?', a: '<p>Because Impact is a system font rather than a web font. If your device does not have it, the browser falls back to the closest heavy condensed font available, which looks similar but not identical.</p>' },
    { q: 'Can I add text somewhere other than top and bottom?', a: '<p>Not in this tool — it does the classic two-line format. For free placement you need a general image editor.</p>' },
    { q: 'What size should a meme be?', a: '<p>Anything from about 600 to 1200 pixels wide works well. This tool caps output at 1200 px wide, which keeps files small enough to share easily while staying sharp.</p>' },
  ],

  related: ['image-resizer', 'photo-cropper', 'image-compressor', 'text-case-converter'],
};
