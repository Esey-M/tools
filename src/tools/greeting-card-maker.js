export default {
  slug: 'greeting-card-maker',
  category: 'text',
  title: 'Greeting Card Maker – Printable Folded Cards, Free',
  h1: 'Greeting Card Maker',
  cardText: 'Make a folded greeting card with a front and an inside message.',
  description:
    'Free greeting card maker. Design a folded card with a front design and an inside message, then download a print-ready sheet that folds into a card.',
  keywords: ['greeting card maker', 'printable card', 'birthday card maker', 'make a card online', 'diy greeting card'],
  updated: '2026-09-04',
  lede: 'Design the front and the inside, then print one A4 sheet and fold it twice. No watermark and nothing to sign up for.',

  form: `
<div class="row">
  <div class="field">
    <label for="occasion">Occasion</label>
    <select id="occasion">
      <option value="birthday" selected>Birthday</option>
      <option value="thanks">Thank you</option>
      <option value="congrats">Congratulations</option>
      <option value="christmas">Christmas</option>
      <option value="sympathy">Sympathy</option>
      <option value="newhome">New home</option>
      <option value="custom">Something else</option>
    </select>
  </div>
  <div class="field">
    <label for="front">Front text</label>
    <input type="text" id="front" value="Happy Birthday" maxlength="34" autocomplete="off">
  </div>
  <div class="field">
    <label for="sub">Front subtitle <span class="hint">(optional)</span></label>
    <input type="text" id="sub" value="" maxlength="40" autocomplete="off">
  </div>
</div>

<div class="field">
  <label for="inside">Inside message</label>
  <textarea id="inside" rows="4" maxlength="400" style="min-height:100px">Hope your day is full of the good kind of chaos.

With love,
Sam</textarea>
</div>

<div class="row">
  <div class="field">
    <label for="style">Style</label>
    <select id="style">
      <option value="simple" selected>Simple</option>
      <option value="band">Colour band</option>
      <option value="frame">Framed</option>
      <option value="bold">Bold block</option>
    </select>
  </div>
  <div class="field">
    <label for="ink">Text colour</label>
    <input type="color" id="ink" value="#1b1b1f" style="height:42px;padding:4px">
  </div>
  <div class="field">
    <label for="paper">Card colour</label>
    <input type="color" id="paper" value="#fdfaf4" style="height:42px;padding:4px">
  </div>
  <div class="field">
    <label for="accent">Accent</label>
    <input type="color" id="accent" value="#b0453f" style="height:42px;padding:4px">
  </div>
</div>

<div class="field">
  <span class="field-label" id="view-label">Preview</span>
  <div class="seg" role="group" aria-labelledby="view-label" id="views">
    <button type="button" data-v="front" aria-pressed="true">Front</button>
    <button type="button" data-v="inside">Inside</button>
    <button type="button" data-v="sheet">Print sheet</button>
  </div>
</div>

<div class="gc-stage"><canvas id="canvas"></canvas></div>

<div class="btn-row" style="margin-top:14px">
  <button type="button" class="btn" id="dl">Download A4 print sheet</button>
  <button type="button" class="btn btn-ghost" id="dlfront">Download front only</button>
</div>
<p class="hint" id="meta" style="margin-top:10px"></p>`,

  css: `
.gc-stage{margin-top:16px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:20px;display:grid;place-items:center}
.gc-stage canvas{max-width:100%;max-height:500px;height:auto;box-shadow:0 4px 18px rgba(0,0,0,.2);border-radius:2px}
input[type=color]{width:100%;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--bg);cursor:pointer}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d');
  var view = 'front';

  var SERIF = 'Georgia, "Times New Roman", serif';
  var SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  // A4 folded twice gives four A6 panels of 105 x 148 mm.
  var A4 = [210, 297], PANEL = [105, 148];

  var PRESETS = {
    birthday:  ['Happy Birthday', '', 'Hope your day is full of the good kind of chaos.\\n\\nWith love,\\nSam'],
    thanks:    ['Thank You', '', 'For everything — it genuinely made a difference.\\n\\nWith thanks,\\nSam'],
    congrats:  ['Congratulations', '', 'Thoroughly deserved, and nobody is surprised.\\n\\nWell done,\\nSam'],
    christmas: ['Merry Christmas', 'and a happy new year', 'Wishing you a peaceful Christmas and a good year ahead.\\n\\nWith love,\\nSam'],
    sympathy:  ['With Sympathy', '', 'Thinking of you, and here whenever you need anything at all.\\n\\nWith love,\\nSam'],
    newhome:   ['Congratulations on your new home', '', 'Wishing you every happiness there.\\n\\nWith love,\\nSam'],
    custom:    null
  };

  function wrap(text, maxWidth){
    var lines = [];
    text.split('\\n').forEach(function(para){
      if (!para.trim()) { lines.push(''); return; }
      var words = para.split(/\\s+/), line = words[0];
      for (var i = 1; i < words.length; i++) {
        var test = line + ' ' + words[i];
        if (ctx.measureText(test).width <= maxWidth) line = test;
        else { lines.push(line); line = words[i]; }
      }
      lines.push(line);
    });
    return lines;
  }

  function drawPanel(x, y, wPx, hPx, which, mm){
    var ink = $('ink').value, paper = $('paper').value, accent = $('accent').value;
    var style = $('style').value;

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, wPx, hPx);

    if (which === 'front') {
      if (style === 'band') {
        ctx.fillStyle = accent;
        ctx.fillRect(0, hPx * 0.42, wPx, mm(16));
      } else if (style === 'frame') {
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1, mm(0.8));
        ctx.strokeRect(mm(9), mm(9), wPx - mm(18), hPx - mm(18));
      } else if (style === 'bold') {
        ctx.fillStyle = accent;
        ctx.fillRect(0, 0, wPx, hPx * 0.55);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var onAccent = style === 'band' || style === 'bold';
      var titleY = style === 'bold' ? hPx * 0.30 : (style === 'band' ? hPx * 0.42 + mm(8) : hPx * 0.44);

      var text = $('front').value;
      var fontFamily = style === 'bold' ? SANS : SERIF;
      var fs = mm(text.length > 20 ? 8 : text.length > 13 ? 11 : 14);
      ctx.font = (style === 'bold' ? '800 ' : '600 ') + fs + 'px ' + fontFamily;
      ctx.fillStyle = onAccent ? paper : ink;
      var lines = wrap(text, wPx - mm(22));
      lines.forEach(function(l, i){
        ctx.fillText(l, wPx / 2, titleY + (i - (lines.length - 1) / 2) * fs * 1.2);
      });

      var sub = $('sub').value;
      if (sub) {
        ctx.font = '400 ' + mm(4.4) + 'px ' + fontFamily;
        ctx.fillStyle = onAccent && style === 'bold' ? paper : (style === 'bold' ? ink : accent);
        ctx.fillText(sub, wPx / 2, titleY + lines.length * fs * 0.75 + mm(7));
      }

    } else if (which === 'inside') {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = '400 ' + mm(4.6) + 'px ' + SERIF;
      ctx.fillStyle = ink;
      var lh = mm(7);
      var msg = wrap($('inside').value, wPx - mm(30));
      var startY = Math.max(mm(24), (hPx - msg.length * lh) / 2.4);
      msg.forEach(function(l, i){ ctx.fillText(l, mm(15), startY + i * lh); });
    }

    ctx.restore();
  }

  function draw(dpi){
    var mm = function(v){ return Math.round(v / 25.4 * dpi); };

    if (view === 'sheet') {
      canvas.width = mm(A4[0]); canvas.height = mm(A4[1]);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var pw = mm(PANEL[0]), ph = mm(PANEL[1]);
      // Fold once vertically, once horizontally. Front is bottom-right so it
      // lands on the outside when folded; inside message is top-left, rotated.
      drawPanel(pw, ph, pw, ph, 'front', mm);

      ctx.save();
      ctx.translate(pw, ph);
      ctx.rotate(Math.PI);
      drawPanel(0, 0, pw, ph, 'inside', mm);
      ctx.restore();

      // Fold guides.
      ctx.save();
      ctx.setLineDash([mm(3), mm(3)]);
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      ctx.lineWidth = Math.max(1, mm(0.25));
      ctx.beginPath(); ctx.moveTo(pw, 0); ctx.lineTo(pw, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, ph); ctx.lineTo(canvas.width, ph); ctx.stroke();
      ctx.restore();

      $('meta').textContent = 'A4 sheet · fold along the dashed lines to make a ' +
        PANEL[0] + ' × ' + PANEL[1] + ' mm card · ' + canvas.width + ' × ' + canvas.height + ' px';
    } else {
      canvas.width = mm(PANEL[0]); canvas.height = mm(PANEL[1]);
      drawPanel(0, 0, canvas.width, canvas.height, view, mm);
      $('meta').textContent = PANEL[0] + ' × ' + PANEL[1] + ' mm · ' +
        canvas.width + ' × ' + canvas.height + ' px at ' + dpi + ' dpi';
    }
  }

  function render(){ draw(150); }

  function download(dpi, forceView, name){
    var prev = view;
    if (forceView) view = forceView;
    draw(dpi);
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      view = prev;
      render();
    }, 'image/png');
  }

  $('views').addEventListener('click', function(e){
    var b = e.target.closest('button[data-v]'); if (!b) return;
    view = b.getAttribute('data-v');
    var btns = $('views').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    render();
  });
  $('occasion').addEventListener('change', function(){
    var p = PRESETS[this.value];
    if (p) { $('front').value = p[0]; $('sub').value = p[1]; $('inside').value = p[2]; }
    render();
  });
  ['front','sub','inside','style','ink','paper','accent'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', render);
  });
  $('dl').addEventListener('click', function(){ download(300, 'sheet', 'greeting-card-a4.png'); });
  $('dlfront').addEventListener('click', function(){ download(300, 'front', 'card-front.png'); });

  render();
})();`,

  answerHeading: 'How the folded card works',
  answer: `<p><strong>One A4 sheet, folded twice, makes a standard A6 greeting card.</strong> The print sheet places the front design on the bottom-right quarter and the inside message rotated on the top-left, which is what puts each panel the right way up once the paper is folded in half twice. Fold along the long edge first, then the short one. The dashed guides on the preview show where. Print on the heaviest paper your printer takes — 200 gsm or more feels like a card rather than a leaflet.</p>`,

  steps: [
    'Pick an occasion — the wording fills in and you can edit it.',
    'Write the inside message.',
    'Choose a style and colours, and preview each panel.',
    'Download the A4 sheet, print it, and fold twice along the guides.',
  ],

  sections: [
    {
      id: 'printing',
      h2: 'Printing and folding',
      html: `<ol>
<li><strong>Print at 100%</strong> — turn off "fit to page", which shrinks the artwork and puts the fold lines in the wrong place.</li>
<li><strong>Use heavy paper.</strong> 160 gsm is the minimum for something that stands up; 200–250 gsm feels properly like a card. Check your printer's maximum first.</li>
<li><strong>Fold the long way first</strong>, bringing the short edges together, then fold again.</li>
<li><strong>Score before folding</strong> if the paper is heavy — run an empty ballpoint along a ruler on the fold line. It gives a clean edge instead of a cracked one.</li>
<li><strong>A6 fits a C6 envelope</strong>, which is the standard size sold everywhere.</li>
</ol>`,
    },
    {
      id: 'writing',
      h2: 'Writing something worth reading',
      html: `<p>The message matters more than the design, and specificity is what separates a card people keep from one they recycle.</p>
<ul>
<li><strong>Name one specific thing.</strong> "Thank you for driving me to the hospital in February" beats "thanks for everything" by a wide margin.</li>
<li><strong>Short is fine.</strong> Two honest sentences beat a page of filler.</li>
<li><strong>For sympathy, do not try to fix it.</strong> Acknowledge the loss, offer something concrete, and avoid anything beginning "at least". Naming the person who died is almost always welcome.</li>
<li><strong>Write it by hand if you can.</strong> Print the card, leave the inside blank, and write in it. That is the part that gets kept.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'What paper should I use?', a: '<p>At least 160 gsm, ideally 200–250 gsm. Check your printer’s maximum weight — many home printers stop around 200 gsm.</p>' },
    { q: 'How do I fold it?', a: '<p>Fold in half along the long edge first, then in half again. The dashed lines on the print sheet show both folds.</p>' },
    { q: 'What envelope size fits?', a: '<p>C6, which is 114 × 162 mm and fits an A6 card with room to spare. It is the standard greeting card envelope.</p>' },
    { q: 'Can I leave the inside blank to handwrite?', a: '<p>Yes — clear the inside message box and the panel prints blank. Handwriting is usually the better choice anyway.</p>' },
    { q: 'Is there a watermark?', a: '<p>No. The download contains only your card.</p>' },
  ],

  related: ['invitation-card-maker', 'business-card-maker', 'signature-maker', 'image-to-pdf'],
};
