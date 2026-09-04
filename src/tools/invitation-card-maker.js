export default {
  slug: 'invitation-card-maker',
  category: 'text',
  title: 'Invitation Maker – Free Printable Invitations',
  h1: 'Invitation Maker',
  cardText: 'Make a printable invitation for a party, wedding or event.',
  description:
    'Free invitation maker. Design a printable invitation for a party, wedding or event, choose a style and colours, and download at print resolution.',
  keywords: ['invitation maker', 'free printable invitation', 'party invitation template', 'birthday invitation maker', 'digital invite'],
  updated: '2026-09-04',
  lede: 'Fill in the details, pick a style, and download something you can print or send. No watermark, no account.',

  form: `
<div class="row">
  <div class="field">
    <label for="occasion">Occasion</label>
    <select id="occasion">
      <option value="birthday" selected>Birthday party</option>
      <option value="wedding">Wedding</option>
      <option value="dinner">Dinner party</option>
      <option value="baby">Baby shower</option>
      <option value="christmas">Christmas party</option>
      <option value="custom">Something else</option>
    </select>
  </div>
  <div class="field">
    <label for="heading">Heading</label>
    <input type="text" id="heading" value="You are invited" maxlength="40" autocomplete="off">
  </div>
  <div class="field">
    <label for="who">Who or what for</label>
    <input type="text" id="who" value="Jamie's 30th" maxlength="50" autocomplete="off">
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="date">Date</label>
    <input type="date" id="date">
  </div>
  <div class="field">
    <label for="time">Time</label>
    <input type="time" id="time" value="19:30">
  </div>
  <div class="field">
    <label for="place">Place</label>
    <input type="text" id="place" value="The Old Chapel, Bristol" maxlength="60" autocomplete="off">
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="note">Extra line <span class="hint">(optional)</span></label>
    <input type="text" id="note" value="Drinks and dancing. Bring nothing but yourself." maxlength="80" autocomplete="off">
  </div>
  <div class="field">
    <label for="rsvp">RSVP</label>
    <input type="text" id="rsvp" value="RSVP by 1 October — jamie@example.com" maxlength="70" autocomplete="off">
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="style">Style</label>
    <select id="style">
      <option value="classic" selected>Classic — serif and rules</option>
      <option value="modern">Modern — bold and spaced</option>
      <option value="playful">Playful — colour block</option>
    </select>
  </div>
  <div class="field">
    <label for="size">Size</label>
    <select id="size">
      <option value="a6" selected>A6 — 105 × 148 mm</option>
      <option value="a5">A5 — 148 × 210 mm</option>
      <option value="us57">5 × 7 in</option>
      <option value="square">Square — 140 × 140 mm</option>
    </select>
  </div>
  <div class="field">
    <label for="ink">Text colour</label>
    <input type="color" id="ink" value="#1b1b1f" style="height:42px;padding:4px">
  </div>
  <div class="field">
    <label for="paper">Background</label>
    <input type="color" id="paper" value="#fbf7ef" style="height:42px;padding:4px">
  </div>
  <div class="field">
    <label for="accent">Accent</label>
    <input type="color" id="accent" value="#9a5b3f" style="height:42px;padding:4px">
  </div>
</div>

<div class="inv-stage"><canvas id="canvas"></canvas></div>

<div class="btn-row" style="margin-top:14px">
  <button type="button" class="btn" id="dl">Download for print</button>
  <button type="button" class="btn btn-ghost" id="dlweb">Download for sharing</button>
</div>
<p class="hint" id="meta" style="margin-top:10px"></p>`,

  css: `
.inv-stage{margin-top:20px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:20px;display:grid;place-items:center}
.inv-stage canvas{max-width:100%;max-height:520px;height:auto;box-shadow:0 4px 18px rgba(0,0,0,.2);border-radius:2px}
input[type=color]{width:100%;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--bg);cursor:pointer}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d');

  var SIZES = { a6: [105, 148], a5: [148, 210], us57: [127, 178], square: [140, 140] };
  var SERIF = 'Georgia, "Times New Roman", "Iowan Old Style", serif';
  var SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

  var PRESETS = {
    birthday:  { heading: 'You are invited', note: 'Drinks and dancing. Bring nothing but yourself.' },
    wedding:   { heading: 'Together with their families', note: 'Reception to follow' },
    dinner:    { heading: 'Come for dinner', note: 'Seven for seven thirty' },
    baby:      { heading: 'A baby is on the way', note: 'Cake, tea and terrible advice' },
    christmas: { heading: 'Christmas drinks', note: 'Mulled wine and mince pies' },
    custom:    null
  };

  function draw(dpi){
    var size = SIZES[$('size').value];
    var mm = function(v){ return Math.round(v / 25.4 * dpi); };
    var w = mm(size[0]), h = mm(size[1]);
    canvas.width = w; canvas.height = h;

    var ink = $('ink').value, paper = $('paper').value, accent = $('accent').value;
    var style = $('style').value;

    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);

    var pad = mm(12);
    var font = style === 'classic' ? SERIF : SANS;

    if (style === 'playful') {
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w, mm(26));
      ctx.fillRect(0, h - mm(10), w, mm(10));
    } else if (style === 'classic') {
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1, mm(0.5));
      ctx.strokeRect(mm(7), mm(7), w - mm(14), h - mm(14));
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    var cx = w / 2;
    var y = style === 'playful' ? mm(40) : mm(30);

    function line(text, sizeMm, weight, colour, family, spacing){
      if (!text) return;
      ctx.font = weight + ' ' + mm(sizeMm) + 'px ' + (family || font);
      ctx.fillStyle = colour;
      if (spacing) {
        // Manual letter-spacing for the small caps headings.
        var chars = text.split('');
        var gap = mm(spacing);
        var total = chars.reduce(function(a, c){ return a + ctx.measureText(c).width + gap; }, -gap);
        var x = cx - total / 2;
        chars.forEach(function(c){ ctx.fillText(c, x + ctx.measureText(c).width / 2, y); x += ctx.measureText(c).width + gap; });
      } else {
        ctx.fillText(text, cx, y);
      }
      y += mm(sizeMm * 1.25);
    }

    function rule(){
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(1, mm(0.4));
      ctx.beginPath();
      ctx.moveTo(cx - mm(14), y - mm(2));
      ctx.lineTo(cx + mm(14), y - mm(2));
      ctx.stroke();
      y += mm(6);
    }

    var heading = $('heading').value.toUpperCase();
    line(heading, style === 'modern' ? 4 : 3.6, '600', style === 'playful' ? paper : accent, SANS, 1.1);
    y += mm(3);

    line($('who').value, style === 'modern' ? 11 : 10, '700', ink);
    y += mm(2);
    rule();

    var d = $('date').value, t = $('time').value;
    if (d) {
      var p = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(d);
      if (p) {
        var dt = new Date(+p[1], +p[2] - 1, +p[3]);
        line(dt.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), 4.4, '500', ink);
      }
    }
    if (t) {
      var tm = /^(\\d{1,2}):(\\d{2})$/.exec(t);
      if (tm) {
        var hh = +tm[1], suffix = hh < 12 ? 'am' : 'pm';
        line(((hh % 12) || 12) + ':' + tm[2] + ' ' + suffix, 4.4, '500', ink);
      }
    }
    y += mm(2);
    line($('place').value, 4.6, '600', ink);

    y += mm(6);
    line($('note').value, 3.8, '400', ink);

    // RSVP always sits at the foot.
    var rsvp = $('rsvp').value;
    if (rsvp) {
      ctx.font = '500 ' + mm(3.4) + 'px ' + SANS;
      ctx.fillStyle = style === 'playful' ? paper : accent;
      ctx.fillText(rsvp, cx, h - (style === 'playful' ? mm(3.4) : mm(14)));
    }

    $('meta').textContent = size[0] + ' × ' + size[1] + ' mm · ' + w + ' × ' + h + ' px at ' + dpi + ' dpi';
  }

  function render(){ draw(150); }

  function download(dpi, name){
    draw(dpi);
    canvas.toBlob(function(blob){
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      render();
    }, 'image/png');
  }

  $('occasion').addEventListener('change', function(){
    var p = PRESETS[this.value];
    if (p) { $('heading').value = p.heading; $('note').value = p.note; }
    render();
  });
  ['heading','who','date','time','place','note','rsvp','style','size','ink','paper','accent'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', render);
  });
  $('dl').addEventListener('click', function(){ download(300, 'invitation-print.png'); });
  $('dlweb').addEventListener('click', function(){ download(120, 'invitation.png'); });

  var t = new Date(); t.setDate(t.getDate() + 42);
  var pad = function(n){ return n < 10 ? '0' + n : n; };
  $('date').value = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  render();
})();`,

  answerHeading: 'What an invitation has to tell people',
  answer: `<p><strong>Five things, and everything else is decoration: what it is, who it is for, when, where, and how to reply.</strong> The most commonly forgotten is the year — obvious to you in October, ambiguous to someone finding the card on their fridge in January. The second is an RSVP deadline, without which people simply do not reply. Everything else is style, and style matters far less than a guest being able to find the venue.</p>`,

  steps: [
    'Pick the occasion — heading and wording fill in automatically.',
    'Enter who it is for, the date, time and place.',
    'Choose a style and colours.',
    'Download for print at 300 dpi, or a smaller file to send in a message.',
  ],

  sections: [
    {
      id: 'wording',
      h2: 'Wording that works',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Occasion</th><th>Opening line</th></tr></thead>
<tbody>
<tr><td>Birthday</td><td>"You are invited" · "Come and celebrate"</td></tr>
<tr><td>Wedding</td><td>"Together with their families" · "Request the pleasure of your company"</td></tr>
<tr><td>Dinner</td><td>"Come for dinner" · "Please join us at the table"</td></tr>
<tr><td>Baby shower</td><td>"A baby is on the way" · "Let’s shower the parents-to-be"</td></tr>
<tr><td>Christmas</td><td>"Christmas drinks" · "Join us for mulled wine"</td></tr>
</tbody></table></div>
<p>A few things worth being explicit about, because guests will otherwise ask individually: whether children are invited, whether food is being served, what to wear if it is anything other than obvious, and whether to bring anything.</p>`,
    },
    {
      id: 'timing',
      h2: 'When to send',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Event</th><th>Send</th><th>RSVP deadline</th></tr></thead>
<tbody>
<tr><td>Casual gathering</td><td>2–3 weeks ahead</td><td>A few days before</td></tr>
<tr><td>Dinner party</td><td>3–4 weeks</td><td>1 week before</td></tr>
<tr><td>Big birthday</td><td>4–6 weeks</td><td>2 weeks before</td></tr>
<tr><td>Wedding</td><td>6–8 weeks, after a save-the-date</td><td>3–4 weeks before</td></tr>
<tr><td>Anything in December</td><td>6+ weeks — diaries fill early</td><td>2 weeks before</td></tr>
</tbody></table></div>
<p>Set the RSVP deadline earlier than you actually need it. A meaningful share of people reply on the deadline, and another share reply after it.</p>`,
    },
  ],

  faq: [
    { q: 'Is there a watermark?', a: '<p>No. The downloaded image contains only your invitation.</p>' },
    { q: 'What size should I print?', a: '<p>A6 (105 × 148 mm) is the standard postcard-style invitation and fits a C6 envelope. A5 is double that. 5 × 7 inches is the usual US size.</p>' },
    { q: 'Can I send it digitally?', a: '<p>Yes — use "download for sharing", which produces a smaller file suitable for messaging apps and email.</p>' },
    { q: 'Can I add a photo?', a: '<p>Not in this tool, which is text and colour only. For a photo invitation you need a design editor.</p>' },
    { q: 'Should I include the year?', a: '<p>Yes. It is the most commonly omitted detail and the one that causes actual confusion, especially for events booked months ahead.</p>' },
  ],

  related: ['greeting-card-maker', 'business-card-maker', 'countdown-timer', 'image-to-pdf'],
};
