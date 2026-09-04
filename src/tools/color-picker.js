export default {
  slug: 'color-picker',
  category: 'generators',
  title: 'Colour Picker – Pick Colours From an Image, Get HEX and RGB',
  h1: 'Colour Picker',
  cardText: 'Pick a colour from any image and get HEX, RGB and HSL, plus a palette.',
  description:
    'Free colour picker. Pick any colour from an image to get HEX, RGB and HSL codes, extract a palette, and check contrast against white and black.',
  keywords: ['color picker', 'hex color from image', 'rgb to hex', 'colour picker online', 'get color from picture'],
  updated: '2026-09-04',
  lede: 'Drop in an image and click anywhere to read the colour. Or type a colour in any format to convert it.',

  form: `
<div class="row">
  <div class="field">
    <label for="input">Type a colour</label>
    <input type="text" id="input" value="#0f7d6b" autocomplete="off" spellcheck="false" style="font-family:var(--font-num)">
    <span class="hint">HEX, rgb(), hsl() or a CSS colour name.</span>
  </div>
  <div class="field">
    <label for="swatchpick">Or use the picker</label>
    <input type="color" id="swatchpick" value="#0f7d6b" style="height:42px;padding:4px">
  </div>
</div>

<div class="cp-readout">
  <div class="cp-swatch" id="swatch"></div>
  <div class="cp-codes">
    <div class="cp-code"><span>HEX</span><output id="hex">—</output><button type="button" data-c="hex">copy</button></div>
    <div class="cp-code"><span>RGB</span><output id="rgb">—</output><button type="button" data-c="rgb">copy</button></div>
    <div class="cp-code"><span>HSL</span><output id="hsl">—</output><button type="button" data-c="hsl">copy</button></div>
    <div class="cp-code"><span>Contrast</span><output id="contrast">—</output><span></span></div>
  </div>
</div>

<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose an image to pick colours from" style="margin-top:22px">
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 15 5-5 4 4 3-3 6 6"/><circle cx="8.5" cy="8.5" r="1.5"/>
  </svg>
  <p><strong>Drop an image</strong> to pick colours from it</p>
  <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
</div>

<div id="stage-wrap" hidden style="margin-top:16px">
  <canvas id="canvas" style="max-width:100%;height:auto;cursor:crosshair;border-radius:var(--radius);border:1px solid var(--line)"></canvas>
  <p class="hint" style="margin-top:8px">Click anywhere on the image to read that colour.</p>
  <div style="margin-top:18px">
    <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:9px">Palette from this image</h2>
    <div id="palette" class="cp-palette"></div>
  </div>
</div>`,

  css: `
.cp-readout{display:grid;grid-template-columns:130px 1fr;gap:16px;margin-top:18px;align-items:stretch}
@media (max-width:560px){.cp-readout{grid-template-columns:1fr}}
.cp-swatch{border-radius:var(--radius);border:1px solid var(--line);min-height:130px}
.cp-codes{display:flex;flex-direction:column;gap:7px}
.cp-code{display:flex;align-items:center;gap:11px;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius-sm);padding:9px 12px}
.cp-code span:first-child{font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);
  font-weight:640;flex:0 0 62px}
.cp-code output{flex:1;font-family:var(--font-num);font-size:.94rem;overflow-wrap:anywhere}
.cp-code button{border:none;background:transparent;color:var(--ink-3);cursor:pointer;font-size:.78rem;
  padding:3px 8px;border-radius:5px;flex:none}
.cp-code button:hover{background:var(--accent-soft);color:var(--accent-ink)}
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:24px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:6px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.cp-palette{display:flex;flex-wrap:wrap;gap:8px}
.cp-palette button{width:74px;height:60px;border:1px solid var(--line);border-radius:var(--radius-sm);cursor:pointer;
  display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;font-size:.66rem;font-family:var(--font-num)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });

  function clamp(v){ return Math.max(0, Math.min(255, Math.round(v))); }
  function toHex(r, g, b){
    return '#' + [r, g, b].map(function(v){ return ('0' + clamp(v).toString(16)).slice(-2); }).join('');
  }

  function rgbToHsl(r, g, b){
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }

  /** Relative luminance per WCAG, for contrast ratios. */
  function luminance(r, g, b){
    var a = [r, g, b].map(function(v){
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function ratio(l1, l2){
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  /** Parse HEX, rgb(), hsl() or a named colour via the browser. */
  function parse(text){
    text = text.trim();
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    m = /^rgba?\\(([^)]+)\\)$/i.exec(text);
    if (m) {
      var p = m[1].split(/[,\\s\\/]+/).filter(Boolean).map(parseFloat);
      if (p.length >= 3) return [clamp(p[0]), clamp(p[1]), clamp(p[2])];
    }
    // Let the browser resolve names and hsl() by painting onto a 1x1 canvas.
    var probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    var c = probe.getContext('2d', { willReadFrequently: true });
    c.fillStyle = '#000';
    c.fillStyle = text;
    var resolved = c.fillStyle;
    if (resolved === '#000000' && !/^(black|#000|#000000|rgb\\(0,\\s*0,\\s*0\\))$/i.test(text)) return null;
    c.fillRect(0, 0, 1, 1);
    var d = c.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }

  function show(rgb){
    if (!rgb) return;
    var hex = toHex(rgb[0], rgb[1], rgb[2]);
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var lum = luminance(rgb[0], rgb[1], rgb[2]);
    var onWhite = ratio(lum, 1);
    var onBlack = ratio(lum, 0);

    $('swatch').style.background = hex;
    $('hex').textContent = hex.toUpperCase();
    $('rgb').textContent = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    $('hsl').textContent = 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)';
    $('contrast').textContent = onWhite.toFixed(2) + ':1 on white · ' + onBlack.toFixed(2) + ':1 on black · ' +
      (Math.max(onWhite, onBlack) >= 4.5 ? 'passes AA for text' : 'fails AA for body text');
    $('swatchpick').value = hex;
  }

  function fromInput(){
    var rgb = parse($('input').value);
    if (rgb) show(rgb);
  }

  $('input').addEventListener('input', fromInput);
  $('swatchpick').addEventListener('input', function(){
    $('input').value = this.value;
    fromInput();
  });

  document.addEventListener('click', function(e){
    var b = e.target.closest('button[data-c]'); if (!b) return;
    var text = $(b.getAttribute('data-c')).textContent;
    navigator.clipboard.writeText(text).then(function(){
      b.textContent = 'copied'; setTimeout(function(){ b.textContent = 'copy'; }, 1200);
    });
  });

  /** Bucket colours coarsely and take the most common, for a rough palette. */
  function palette(){
    var w = canvas.width, h = canvas.height;
    var data = ctx.getImageData(0, 0, w, h).data;
    var buckets = {};
    for (var i = 0; i < data.length; i += 4 * 7) {          // sample every 7th pixel
      if (data[i + 3] < 128) continue;
      var r = data[i] >> 4, g = data[i + 1] >> 4, b = data[i + 2] >> 4;
      var key = r + ',' + g + ',' + b;
      if (!buckets[key]) buckets[key] = { n: 0, r: 0, g: 0, b: 0 };
      var q = buckets[key];
      q.n++; q.r += data[i]; q.g += data[i + 1]; q.b += data[i + 2];
    }
    var top = Object.keys(buckets).map(function(k){ return buckets[k]; })
      .sort(function(a, b){ return b.n - a.n; }).slice(0, 8);

    $('palette').innerHTML = top.map(function(q){
      var hex = toHex(q.r / q.n, q.g / q.n, q.b / q.n);
      var lum = luminance(q.r / q.n, q.g / q.n, q.b / q.n);
      return '<button type="button" data-hex="' + hex + '" style="background:' + hex +
        ';color:' + (lum > 0.45 ? '#000' : '#fff') + '">' + hex.toUpperCase() + '</button>';
    }).join('');
  }

  $('palette').addEventListener('click', function(e){
    var b = e.target.closest('button[data-hex]'); if (!b) return;
    $('input').value = b.getAttribute('data-hex');
    fromInput();
  });

  canvas.addEventListener('click', function(e){
    var rect = canvas.getBoundingClientRect();
    var x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    var y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    var d = ctx.getImageData(x, y, 1, 1).data;
    var hex = toHex(d[0], d[1], d[2]);
    $('input').value = hex;
    show([d[0], d[1], d[2]]);
  });

  function load(file){
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function(){
      var maxW = 900;
      var scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      $('stage-wrap').hidden = false;
      palette();
      URL.revokeObjectURL(url);
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

  fromInput();
})();`,

  answerHeading: 'HEX, RGB and HSL are the same colour',
  answer: `<p><strong>All three describe identical colours in different notations.</strong> HEX is two hexadecimal digits each for red, green and blue — <code>#0F7D6B</code> is 15 red, 125 green, 107 blue. RGB says the same thing in decimal. HSL is the useful one for design work: hue as an angle on the colour wheel, saturation and lightness as percentages, which means you can make a colour lighter by changing one number instead of guessing three. The contrast figure shown is the WCAG ratio against white and black, which determines whether text will actually be readable.</p>`,

  steps: [
    'Type a colour in any format, or use the swatch picker.',
    'Or drop in an image and click anywhere on it to read that pixel.',
    'Copy the HEX, RGB or HSL code, or pick from the extracted palette.',
  ],

  sections: [
    {
      id: 'contrast',
      h2: 'Contrast ratios, and why they matter',
      html: `<p>The contrast ratio between text and its background determines whether people can actually read it. WCAG sets thresholds that are also, in many places, a legal requirement for public-facing sites.</p>
<div class="table-scroll"><table>
<thead><tr><th>Ratio</th><th>Meets</th><th>Applies to</th></tr></thead>
<tbody>
<tr><td>3:1</td><td>AA</td><td>Large text (18pt+, or 14pt bold) and UI components</td></tr>
<tr><td>4.5:1</td><td>AA</td><td>Body text — the usual target</td></tr>
<tr><td>7:1</td><td>AAA</td><td>Body text, enhanced</td></tr>
</tbody></table></div>
<p>Mid-tone colours are the trap: a medium grey or a mid-saturation brand colour often fails against both white and black, which means it cannot carry text on either. The readout above shows both ratios so you can see that immediately.</p>`,
    },
    {
      id: 'hsl',
      h2: 'Why designers work in HSL',
      html: `<p>Take <code>#0F7D6B</code>. To make a lighter version in HEX you would have to guess at three values and check. In HSL it is <code>hsl(170, 79%, 27%)</code> — raise the lightness to 40% and you have a lighter version of exactly the same colour.</p>
<p>That is why HSL is how palettes are usually built: fix the hue, vary lightness for a tint scale, and vary hue by 30° steps for related colours. It makes systematic palettes possible rather than accidental.</p>`,
    },
  ],

  faq: [
    { q: 'How do I get the colour code from an image?', a: '<p>Drop the image in and click anywhere on it. The HEX, RGB and HSL values for that exact pixel appear immediately.</p>' },
    { q: 'Is my image uploaded?', a: '<p>No. It is drawn to a canvas in your browser and read locally. Nothing is transmitted.</p>' },
    { q: 'What is a good contrast ratio?', a: '<p>At least 4.5:1 for body text and 3:1 for large text, to meet WCAG AA. The readout shows the ratio against both white and black.</p>' },
    { q: 'What is the difference between HEX and RGB?', a: '<p>Only notation. HEX writes each channel as two hexadecimal digits; RGB writes them as decimal numbers. They describe exactly the same colours.</p>' },
    { q: 'How is the palette chosen?', a: '<p>Pixels are grouped into coarse colour buckets and the eight most common are averaged and shown. It reflects what actually dominates the image rather than what looks most striking.</p>' },
  ],

  related: ['image-compressor', 'meme-generator', 'qr-code-generator', 'photo-cropper'],
};
