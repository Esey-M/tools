export default {
  slug: 'signature-maker',
  category: 'text',
  title: 'Signature Maker – Draw and Download a Transparent Signature',
  h1: 'Signature Maker',
  cardText: 'Draw your signature and download it as a transparent PNG.',
  description:
    'Free signature maker. Draw your signature with a mouse, trackpad or finger and download it as a transparent PNG to drop into documents and PDFs.',
  keywords: ['signature maker', 'draw signature online', 'electronic signature', 'signature generator', 'transparent signature png'],
  updated: '2026-09-04',
  lede: 'Draw in the box below with a mouse, trackpad or your finger. Download a transparent PNG you can place over any document.',

  form: `
<div class="sig-wrap">
  <canvas id="pad" width="1000" height="330" role="img" aria-label="Signature drawing area"></canvas>
  <div class="sig-baseline" aria-hidden="true"></div>
  <span class="sig-hint" id="sighint">Sign here</span>
</div>

<div class="row" style="margin-top:16px">
  <div class="field">
    <label for="width">Pen thickness: <strong id="wval">3</strong></label>
    <input type="range" id="width" min="1" max="10" step="1" value="3" style="width:100%;padding:0;border:none;background:transparent">
  </div>
  <div class="field">
    <label for="colour">Ink colour</label>
    <div class="seg" role="group" id="colours" style="margin-top:2px">
      <button type="button" data-c="#111827" aria-pressed="true">Black</button>
      <button type="button" data-c="#1d3f8f">Blue</button>
      <button type="button" data-c="#8f1d1d">Red</button>
    </div>
  </div>
  <div class="field">
    <label for="trim">Output</label>
    <select id="trim">
      <option value="trim" selected>Trimmed to the signature</option>
      <option value="full">Full drawing area</option>
    </select>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn" id="dl" disabled>Download transparent PNG</button>
  <button type="button" class="btn btn-ghost" id="undo" disabled>Undo stroke</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.sig-wrap{position:relative;background:var(--bg-raised);border:2px dashed var(--line-strong);
  border-radius:var(--radius);overflow:hidden}
.sig-wrap canvas{display:block;width:100%;height:auto;touch-action:none;cursor:crosshair}
.sig-baseline{position:absolute;left:7%;right:7%;bottom:24%;border-bottom:1px solid var(--line-strong);pointer-events:none}
.sig-hint{position:absolute;left:7%;bottom:calc(24% + 6px);color:var(--ink-3);font-size:.85rem;
  pointer-events:none;letter-spacing:.04em}
.sig-hint.gone{display:none}
.seg button[aria-pressed="true"]{background:var(--bg-raised);color:var(--ink);box-shadow:var(--shadow-sm)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('pad'), ctx = canvas.getContext('2d');
  var drawing = false, strokes = [], currentStroke = null;
  var colour = '#111827';

  function penWidth(){ return parseInt($('width').value, 10); }

  function redraw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach(function(s){
      if (s.points.length < 2) {
        // A single tap still deserves a dot.
        ctx.beginPath();
        ctx.arc(s.points[0].x, s.points[0].y, s.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = s.colour;
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.strokeStyle = s.colour;
      ctx.lineWidth = s.width;
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (var i = 1; i < s.points.length - 1; i++) {
        // Quadratic smoothing through the midpoints removes the jaggedness
        // of raw pointer samples.
        var mid = { x: (s.points[i].x + s.points[i + 1].x) / 2, y: (s.points[i].y + s.points[i + 1].y) / 2 };
        ctx.quadraticCurveTo(s.points[i].x, s.points[i].y, mid.x, mid.y);
      }
      ctx.lineTo(s.points[s.points.length - 1].x, s.points[s.points.length - 1].y);
      ctx.stroke();
    });

    var has = strokes.length > 0;
    $('dl').disabled = !has;
    $('undo').disabled = !has;
    $('sighint').classList.toggle('gone', has);
    $('meta').textContent = has
      ? strokes.length + (strokes.length === 1 ? ' stroke' : ' strokes') + ' drawn'
      : '';
  }

  function pos(e){
    var rect = canvas.getBoundingClientRect();
    var scale = canvas.width / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  }

  canvas.addEventListener('pointerdown', function(e){
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    drawing = true;
    currentStroke = { colour: colour, width: penWidth() * (canvas.width / canvas.getBoundingClientRect().width) * 0.6, points: [pos(e)] };
    strokes.push(currentStroke);
    redraw();
  });

  canvas.addEventListener('pointermove', function(e){
    if (!drawing) return;
    e.preventDefault();
    currentStroke.points.push(pos(e));
    redraw();
  });

  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
    canvas.addEventListener(ev, function(){ drawing = false; });
  });

  $('undo').addEventListener('click', function(){ strokes.pop(); redraw(); });
  $('clear').addEventListener('click', function(){ strokes = []; redraw(); });
  $('width').addEventListener('input', function(){ $('wval').textContent = this.value; });
  $('colours').addEventListener('click', function(e){
    var b = e.target.closest('button[data-c]'); if (!b) return;
    colour = b.getAttribute('data-c');
    var btns = $('colours').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
  });

  /** Find the drawn area so the exported PNG has no dead space. */
  function bounds(){
    var minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    strokes.forEach(function(s){
      s.points.forEach(function(p){
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      });
    });
    var pad = 14;
    return {
      x: Math.max(0, minX - pad), y: Math.max(0, minY - pad),
      w: Math.min(canvas.width, maxX + pad) - Math.max(0, minX - pad),
      h: Math.min(canvas.height, maxY + pad) - Math.max(0, minY - pad)
    };
  }

  $('dl').addEventListener('click', function(){
    if (!strokes.length) return;
    var out = document.createElement('canvas');
    var octx = out.getContext('2d');
    if ($('trim').value === 'trim') {
      var b = bounds();
      out.width = Math.max(1, Math.round(b.w));
      out.height = Math.max(1, Math.round(b.h));
      octx.drawImage(canvas, b.x, b.y, b.w, b.h, 0, 0, out.width, out.height);
    } else {
      out.width = canvas.width; out.height = canvas.height;
      octx.drawImage(canvas, 0, 0);
    }
    var a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'signature.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });

  redraw();
})();`,

  answerHeading: 'What a drawn signature is worth legally',
  answer: `<p><strong>A drawn signature image is usually legally valid, but it is the weakest form of electronic signature.</strong> Under the US ESIGN Act and the EU's eIDAS regulation, an electronic signature is generally as enforceable as ink for most everyday agreements. What a PNG lacks is <em>evidence</em>: no record of who drew it, when, or that the document has not changed since. For a rental agreement or a permission slip that is fine. For anything contested or high-value, a service that records an audit trail is the right tool.</p>`,

  steps: [
    'Draw your signature in the box using a mouse, trackpad or finger.',
    'Adjust the pen thickness and colour if you want.',
    'Use <strong>undo stroke</strong> to remove your last attempt without starting over.',
    'Download the transparent PNG and place it over your document.',
  ],

  sections: [
    {
      id: 'using',
      h2: 'Putting the signature into a document',
      html: `<p>The PNG has a transparent background, so it sits over existing text without a white box around it.</p>
<ul>
<li><strong>Word or Google Docs</strong> — Insert → Image, then set text wrapping to "in front of text" so you can position it freely.</li>
<li><strong>Preview on Mac</strong> — Markup toolbar → Signature → Create from file.</li>
<li><strong>Adobe Acrobat</strong> — Fill &amp; Sign → Sign → Add signature → Image.</li>
<li><strong>Apple Pages or Keynote</strong> — drag the PNG straight in and resize.</li>
</ul>
<p>Draw larger than you need. A signature drawn small and scaled up looks pixelated; drawn large and scaled down it stays crisp, which is why the canvas here is 1000 pixels wide.</p>`,
    },
    {
      id: 'better',
      h2: 'Drawing a signature that looks like yours',
      html: `<p>Mouse signatures famously look nothing like the real thing. A few things help considerably.</p>
<ul>
<li><strong>Use a trackpad or touchscreen</strong> rather than a mouse. A finger on a phone beats a mouse on a desktop every time.</li>
<li><strong>Draw fast.</strong> Signatures are ballistic movements — slow careful tracing produces a wobbly line that looks forged. One quick confident sweep is better than three careful attempts.</li>
<li><strong>Use the whole width.</strong> Big movements are smoother than small ones, and the export trims the empty space anyway.</li>
<li><strong>Accept the third attempt.</strong> Perfectionism here produces worse results, not better.</li>
</ul>`,
    },
    {
      id: 'security',
      h2: 'Where to keep it, and where not to',
      html: `<p>A signature image is a credential. Anyone who has the file can apply your signature to any document.</p>
<ul>
<li><strong>Do not email it</strong> as a loose attachment, and do not store it in shared cloud folders.</li>
<li><strong>Do not post signed documents publicly.</strong> A signature is easily cropped out of a PDF.</li>
<li><strong>Prefer flattened output.</strong> Export the finished document as a flat PDF so the signature cannot be lifted out as a separate layer.</li>
<li><strong>For anything important</strong>, use a proper e-signature service. The audit trail — timestamps, IP address, email verification, document hash — is the part that actually holds up if a signature is disputed.</li>
</ul>
<p>Nothing you draw here is uploaded. The signature exists only in your browser until you download it.</p>`,
    },
  ],

  faq: [
    { q: 'Is a drawn signature legally binding?', a: '<p>In most jurisdictions, for most everyday agreements, yes — the US ESIGN Act and EU eIDAS both give electronic signatures legal effect. Some documents, such as wills and certain property deeds, still require wet ink. Check local requirements for anything significant.</p>' },
    { q: 'Is the background really transparent?', a: '<p>Yes. The PNG has an alpha channel, so it drops over existing text without a white rectangle behind it.</p>' },
    { q: 'Is my signature uploaded anywhere?', a: '<p>No. It is drawn on a canvas in your browser and downloaded directly. Nothing is transmitted or stored.</p>' },
    { q: 'Can I use my finger on a phone?', a: '<p>Yes, and it usually gives a much better result than a mouse. The canvas supports touch and stylus input directly.</p>' },
    { q: 'How do I make the signature bigger or smaller?', a: '<p>Resize it in whatever program you place it into. Because it is drawn at 1000 pixels wide, it stays sharp when scaled down.</p>' },
    { q: 'Why does my signature look wrong?', a: '<p>Mouse control is the usual culprit. Draw quickly rather than carefully, use the full width of the box, and try a trackpad or phone if you have one.</p>' },
  ],

  related: ['image-to-pdf', 'image-resizer', 'image-compressor', 'business-card-maker'],
};
