export default {
  slug: 'business-card-maker',
  category: 'text',
  title: 'Business Card Maker – Print-Ready, Free, No Watermark',
  h1: 'Business Card Maker',
  cardText: 'Design a business card and download it print-ready with bleed marks.',
  description:
    'Free business card maker. Design a card, choose a layout and colours, and download a print-ready PNG at 300 dpi with bleed. No watermark and no signup.',
  keywords: ['business card maker', 'free business card design', 'business card template', 'print business cards', 'make a business card'],
  updated: '2026-09-04',
  lede: 'Fill in your details, pick a layout, and download a 300 dpi file with proper bleed — the format printers actually want.',

  form: `
<div class="bc-layout">
  <div>
    <div class="row">
      <div class="field">
        <label for="name">Name</label>
        <input type="text" id="name" value="Alex Morgan" maxlength="40" autocomplete="off">
      </div>
      <div class="field">
        <label for="title">Job title</label>
        <input type="text" id="title" value="Landscape Architect" maxlength="50" autocomplete="off">
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label for="company">Company</label>
        <input type="text" id="company" value="Morgan Studio" maxlength="40" autocomplete="off">
      </div>
      <div class="field">
        <label for="phone">Phone</label>
        <input type="text" id="phone" value="+44 7700 900123" maxlength="30" autocomplete="off">
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label for="email">Email</label>
        <input type="text" id="email" value="alex@morganstudio.com" maxlength="50" autocomplete="off">
      </div>
      <div class="field">
        <label for="web">Website</label>
        <input type="text" id="web" value="morganstudio.com" maxlength="50" autocomplete="off">
      </div>
    </div>
    <div class="row">
      <div class="field">
        <label for="layout">Layout</label>
        <select id="layout">
          <option value="left" selected>Left aligned</option>
          <option value="centre">Centred</option>
          <option value="split">Name left, details right</option>
          <option value="band">Colour band</option>
        </select>
      </div>
      <div class="field">
        <label for="size">Card size</label>
        <select id="size">
          <option value="uk" selected>UK / EU — 85 × 55 mm</option>
          <option value="us">US — 3.5 × 2 in</option>
        </select>
      </div>
      <div class="field">
        <label for="ink">Text colour</label>
        <input type="color" id="ink" value="#16181c" style="height:42px;padding:4px">
      </div>
      <div class="field">
        <label for="accent">Accent</label>
        <input type="color" id="accent" value="#0f7d6b" style="height:42px;padding:4px">
      </div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2)">
      <input type="checkbox" id="marks" checked style="width:auto"> Show bleed and safe-area guides in the preview
    </label>
  </div>
</div>

<div class="bc-stage"><canvas id="canvas"></canvas></div>

<div class="btn-row" style="margin-top:14px">
  <button type="button" class="btn" id="dl">Download print-ready PNG</button>
  <button type="button" class="btn btn-ghost" id="dlweb">Download for screen</button>
</div>
<p class="hint" id="meta" style="margin-top:10px"></p>`,

  css: `
.bc-stage{margin-top:20px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:20px;display:grid;place-items:center}
.bc-stage canvas{max-width:100%;height:auto;box-shadow:0 3px 14px rgba(0,0,0,.18);border-radius:2px}
input[type=color]{width:100%;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--bg);cursor:pointer}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d');
  var DPI = 300;

  // [width mm, height mm] — bleed is 3mm on each edge, safe area 3mm inside the trim.
  var SIZES = { uk: [85, 55], us: [88.9, 50.8] };
  var BLEED = 3, SAFE = 3;

  function mm(v){ return Math.round(v / 25.4 * DPI); }
  var FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  function draw(forPrint, showGuides){
    var size = SIZES[$('size').value];
    var bleed = forPrint ? BLEED : 0;
    var w = mm(size[0] + bleed * 2), h = mm(size[1] + bleed * 2);
    canvas.width = w; canvas.height = h;

    var ink = $('ink').value, accent = $('accent').value;
    var layout = $('layout').value;
    var pad = mm(bleed + SAFE + 2);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    if (layout === 'band') {
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w, mm(bleed + 9));
    }

    var name = $('name').value, title = $('title').value, company = $('company').value;
    var contact = [$('phone').value, $('email').value, $('web').value].filter(Boolean);

    var nameSize = mm(6.2), titleSize = mm(3.1), bodySize = mm(2.9);

    function line(text, x, y, size, weight, colour, align){
      ctx.font = weight + ' ' + size + 'px ' + FONT;
      ctx.fillStyle = colour;
      ctx.textAlign = align || 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(text, x, y);
    }

    if (layout === 'centre') {
      var cx = w / 2, y = h / 2 - mm(7);
      if (name) { line(name, cx, y, nameSize, '700', ink, 'center'); y += mm(4.6); }
      if (title) { line(title, cx, y, titleSize, '500', accent, 'center'); y += mm(4.2); }
      if (company) { line(company, cx, y, bodySize, '600', ink, 'center'); y += mm(5); }
      ctx.fillStyle = accent;
      ctx.fillRect(cx - mm(6), y - mm(2.4), mm(12), mm(0.5));
      y += mm(3.4);
      contact.forEach(function(c){ line(c, cx, y, bodySize, '400', ink, 'center'); y += mm(3.9); });

    } else if (layout === 'split') {
      var yl = h / 2 - mm(2);
      if (name) line(name, pad, yl, nameSize, '700', ink);
      if (title) line(title, pad, yl + mm(4.6), titleSize, '500', accent);
      if (company) line(company, pad, yl + mm(9), bodySize, '600', ink);
      var yr = h / 2 - mm(4);
      contact.forEach(function(c){ line(c, w - pad, yr, bodySize, '400', ink, 'right'); yr += mm(3.9); });

    } else {
      var top = layout === 'band' ? mm(bleed + 16) : pad + mm(2);
      var yy = top + nameSize * 0.8;
      if (name) { line(name, pad, yy, nameSize, '700', ink); yy += mm(4.8); }
      if (title) { line(title, pad, yy, titleSize, '500', accent); yy += mm(4.4); }
      if (company) { line(company, pad, yy, bodySize, '600', ink); }
      var yb = h - pad - mm(1);
      contact.slice().reverse().forEach(function(c){ line(c, pad, yb, bodySize, '400', ink); yb -= mm(3.9); });
    }

    if (showGuides && forPrint) {
      ctx.save();
      ctx.setLineDash([mm(1.5), mm(1.5)]);
      ctx.lineWidth = Math.max(1, mm(0.2));
      ctx.strokeStyle = 'rgba(217,83,79,.8)';
      ctx.strokeRect(mm(bleed), mm(bleed), mm(size[0]), mm(size[1]));      // trim line
      ctx.strokeStyle = 'rgba(15,125,107,.7)';
      ctx.strokeRect(mm(bleed + SAFE), mm(bleed + SAFE), mm(size[0] - SAFE * 2), mm(size[1] - SAFE * 2));
      ctx.restore();
    }

    $('meta').textContent = forPrint
      ? (size[0] + bleed * 2) + ' × ' + (size[1] + bleed * 2) + ' mm with ' + BLEED +
        ' mm bleed · ' + w + ' × ' + h + ' px at ' + DPI + ' dpi'
      : size[0] + ' × ' + size[1] + ' mm · ' + w + ' × ' + h + ' px';
  }

  function render(){ draw(true, $('marks').checked); }

  function download(forPrint){
    draw(forPrint, false);
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = forPrint ? 'business-card-print.png' : 'business-card.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      render();
    }, 'image/png');
  }

  ['name','title','company','phone','email','web','layout','size','ink','accent','marks'].forEach(function(id){
    $(id).addEventListener($(id).type === 'checkbox' || $(id).tagName === 'SELECT' ? 'change' : 'input', render);
  });
  $('dl').addEventListener('click', function(){ download(true); });
  $('dlweb').addEventListener('click', function(){ download(false); });

  render();
})();`,

  answerHeading: 'Bleed, trim and safe area',
  answer: `<p><strong>Printers cut through a stack of cards, and the cut is never perfectly accurate — which is why artwork needs bleed.</strong> Bleed is 3 mm of extra artwork beyond the finished edge, so a slightly off cut still lands inside your design rather than leaving a white sliver. The trim line is where the card is meant to be cut. The safe area is 3 mm inside that, and nothing important should cross it. Download the print-ready file and your printer gets 91 × 61 mm for an 85 × 55 mm card, which is exactly what they ask for.</p>`,

  steps: [
    'Fill in your details. Leave anything blank that you do not want on the card.',
    'Choose a layout, size and your two colours.',
    'Check the guides — red is the trim line, green is the safe area.',
    'Download the <strong>print-ready</strong> file for a printer, or the screen version for email signatures.',
  ],

  sections: [
    {
      id: 'specs',
      h2: 'What printers actually want',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Requirement</th><th>This tool</th></tr></thead>
<tbody>
<tr><td>Resolution</td><td>300 dpi</td></tr>
<tr><td>Bleed</td><td>3 mm on all four edges</td></tr>
<tr><td>Safe area</td><td>3 mm inside the trim</td></tr>
<tr><td>UK / EU size</td><td>85 × 55 mm (91 × 61 with bleed)</td></tr>
<tr><td>US size</td><td>3.5 × 2 in (3.74 × 2.24 with bleed)</td></tr>
<tr><td>Colour</td><td>RGB — most online printers convert for you</td></tr>
</tbody></table></div>
<p>The one thing this cannot produce is CMYK. Online printers almost all accept RGB and convert it; traditional trade printers may ask for CMYK, in which case convert in an image editor first. Expect bright greens and blues to shift slightly, which is a property of the process rather than a fault.</p>`,
    },
    {
      id: 'design',
      h2: 'Making a card that works',
      html: `<ul>
<li><strong>Leave space.</strong> The most common mistake is filling every millimetre. White space reads as confidence.</li>
<li><strong>Keep text above 7pt.</strong> Anything smaller is unreadable in normal light, and email addresses get mistyped.</li>
<li><strong>Cut what nobody uses.</strong> A physical address and a fax number are usually dead weight. Name, role, one phone number, one email.</li>
<li><strong>Do not put anything important within 3 mm of the edge.</strong> That is what the green guide marks.</li>
<li><strong>Test print at 100%</strong> before ordering. Text always looks larger on screen than it is.</li>
<li><strong>Order a small batch first.</strong> Errors are far cheaper to find on 50 cards than 1,000.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'What size is a business card?', a: '<p>85 × 55 mm in the UK and most of Europe, 3.5 × 2 inches in the US and Canada. Both are here — 91 × 61 mm and 3.74 × 2.24 in once bleed is added.</p>' },
    { q: 'What is bleed and do I need it?', a: '<p>Extra artwork beyond the trim line so a slightly inaccurate cut does not leave a white edge. Almost every printer requires 3 mm, which the print-ready download includes.</p>' },
    { q: 'Is there a watermark?', a: '<p>No. The downloaded file contains only your design.</p>' },
    { q: 'Can I add a logo?', a: '<p>Not in this tool, which handles text layouts only. For a logo you need a design editor that can place images.</p>' },
    { q: 'Do the guide lines print?', a: '<p>No. They appear in the preview only and are removed from both downloads.</p>' },
    { q: 'RGB or CMYK?', a: '<p>This produces RGB, which almost all online printers accept and convert. If your printer insists on CMYK, convert the file in an image editor before sending it.</p>' },
  ],

  related: ['qr-code-generator', 'signature-maker', 'image-to-pdf', 'invitation-card-maker'],
};
