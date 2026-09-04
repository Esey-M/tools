export default {
  slug: 'anniversary-calculator',
  category: 'fun',
  title: 'Anniversary Calculator – How Long You Have Been Together',
  h1: 'Anniversary Calculator',
  cardText: 'How long since a date, the next milestone, and the traditional gift.',
  description:
    'Free anniversary calculator. See exactly how long since your wedding or first date, when the next milestone falls, and the traditional and modern gifts.',
  keywords: ['anniversary calculator', 'how long have we been together', 'wedding anniversary gifts by year', 'anniversary countdown'],
  updated: '2026-09-04',
  lede: 'Enter the date and see how long it has been, when the next milestone lands, and what the traditional gift for it is.',

  form: `
<div class="row">
  <div class="field">
    <label for="date">The date</label>
    <input type="date" id="date">
  </div>
  <div class="field">
    <label for="kind">Occasion</label>
    <select id="kind">
      <option value="wedding" selected>Wedding anniversary</option>
      <option value="together">First date or getting together</option>
      <option value="other">Something else</option>
    </select>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Together for</div>
  <div class="result-value" id="main">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Total days</dt><dd id="days">—</dd></div>
    <div class="stat"><dt>Total weeks</dt><dd id="weeks">—</dd></div>
    <div class="stat"><dt>Next anniversary</dt><dd id="next" style="font-size:1.05rem">—</dd></div>
    <div class="stat"><dt>Days until</dt><dd id="until">—</dd></div>
  </dl>
  <div id="gift" class="anniv-gift"></div>
</div>

<div id="milestones" hidden style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Milestones ahead</h2>
  <div class="table-scroll"><table id="mtable"><thead><tr><th>Milestone</th><th>Date</th><th>Traditional gift</th></tr></thead><tbody></tbody></table></div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Pick a date to see the details.</p>`,

  css: `
.anniv-gift{margin-top:16px;padding:14px 16px;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius);font-size:.95rem}
.anniv-gift b{color:var(--accent-ink)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // year: [traditional, modern]
  var GIFTS = {
    1:['Paper','Clocks'], 2:['Cotton','China'], 3:['Leather','Crystal or glass'], 4:['Fruit or flowers','Appliances'],
    5:['Wood','Silverware'], 6:['Iron or candy','Wood'], 7:['Wool or copper','Desk sets'], 8:['Bronze or pottery','Linens or lace'],
    9:['Pottery or willow','Leather'], 10:['Tin or aluminium','Diamond jewellery'], 11:['Steel','Fashion jewellery'],
    12:['Silk or linen','Pearls'], 13:['Lace','Textiles or furs'], 14:['Ivory','Gold jewellery'], 15:['Crystal','Watches'],
    20:['China','Platinum'], 25:['Silver','Silver'], 30:['Pearl','Diamond'], 35:['Coral','Jade'],
    40:['Ruby','Ruby'], 45:['Sapphire','Sapphire'], 50:['Gold','Gold'], 55:['Emerald','Emerald'],
    60:['Diamond','Diamond'], 65:['Blue sapphire','Blue sapphire'], 70:['Platinum','Platinum'], 75:['Diamond or gold','Diamond']
  };

  function giftFor(year){
    if (GIFTS[year]) return GIFTS[year];
    // Beyond 15, the traditional list runs in five-year steps.
    if (year > 15 && year < 75) {
      var step = Math.floor(year / 5) * 5;
      if (GIFTS[step]) return null;
    }
    return null;
  }

  function parse(v){
    var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function fmt(d){ return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function fmtShort(d){ return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }

  function calc(){
    var start = parse($('date').value);
    if (!start) { $('out').hidden = true; $('milestones').hidden = true; $('prompt').hidden = false; return; }

    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (start > today) {
      $('out').hidden = true; $('milestones').hidden = true;
      $('prompt').hidden = false;
      $('prompt').textContent = 'That date is in the future — pick a date that has already happened.';
      return;
    }

    // Calendar-accurate years, months and days.
    var y = today.getFullYear() - start.getFullYear();
    var mo = today.getMonth() - start.getMonth();
    var d = today.getDate() - start.getDate();
    if (d < 0) { mo--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (mo < 0) { mo += 12; y--; }

    var parts = [];
    if (y) parts.push(y + (y === 1 ? ' year' : ' years'));
    if (mo) parts.push(mo + (mo === 1 ? ' month' : ' months'));
    parts.push(d + (d === 1 ? ' day' : ' days'));

    var totalDays = Math.round((today - start) / 86400000);
    $('main').textContent = parts.join(', ');
    $('days').textContent = totalDays.toLocaleString('en-US');
    $('weeks').textContent = Math.floor(totalDays / 7).toLocaleString('en-US');
    $('lbl').textContent = $('kind').value === 'wedding' ? 'Married for' :
                            $('kind').value === 'together' ? 'Together for' : 'It has been';

    var next = new Date(today.getFullYear(), start.getMonth(), start.getDate());
    if (next < today) next = new Date(today.getFullYear() + 1, start.getMonth(), start.getDate());
    var untilDays = Math.round((next - today) / 86400000);
    var nextYear = next.getFullYear() - start.getFullYear();

    $('next').textContent = fmtShort(next);
    $('until').textContent = untilDays === 0 ? 'Today' : untilDays;
    $('note').textContent = untilDays === 0
      ? 'Happy ' + nextYear + (nextYear === 1 ? 'st' : ordinalSuffix(nextYear)) + ' anniversary — it is today.'
      : 'Your ' + nextYear + ordinalSuffix(nextYear) + ' anniversary is ' + fmt(next) + ', ' + untilDays + ' days away.';

    var g = giftFor(nextYear);
    $('gift').innerHTML = g
      ? 'For the <b>' + nextYear + ordinalSuffix(nextYear) + '</b>: the traditional gift is <b>' + g[0].toLowerCase() +
        '</b> and the modern one is <b>' + g[1].toLowerCase() + '</b>.'
      : 'The <b>' + nextYear + ordinalSuffix(nextYear) + '</b> has no widely agreed traditional gift — the lists cover years 1 to 15, then every fifth year.';

    // Upcoming milestone years that have a named gift.
    var upcoming = Object.keys(GIFTS).map(Number).filter(function(n){ return n >= nextYear; })
      .sort(function(a, b){ return a - b; }).slice(0, 6);
    $('mtable').querySelector('tbody').innerHTML = upcoming.map(function(n){
      var date = new Date(start.getFullYear() + n, start.getMonth(), start.getDate());
      return '<tr><td>' + n + ordinalSuffix(n) + ' anniversary</td><td>' + fmtShort(date) + '</td><td>' + GIFTS[n][0] + '</td></tr>';
    }).join('');

    $('out').hidden = false; $('milestones').hidden = false; $('prompt').hidden = true;
  }

  function ordinalSuffix(n){
    var v = n % 100;
    if (v >= 11 && v <= 13) return 'th';
    return ['th','st','nd','rd'][Math.min(n % 10, 4)] || 'th';
  }

  $('date').addEventListener('input', calc);
  $('kind').addEventListener('change', calc);
  var t = new Date();
  var pad = function(n){ return n < 10 ? '0' + n : n; };
  $('date').max = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
})();`,

  answerHeading: 'Where anniversary gifts come from',
  answer: `<p><strong>The traditional list is older and shorter than most people assume, and the modern one was written by a trade association.</strong> Silver for 25 years and gold for 50 date back to medieval Germany, where a wife received a silver or gold wreath. The full year-by-year list was assembled much later, and the "modern" alternatives — clocks, appliances, china — were published by the American National Retail Jeweler Association in 1937, for reasons you can probably guess. Both lists cover years 1 to 15, then every fifth year.</p>`,

  steps: [
    'Enter your wedding date, first date, or any other date that matters.',
    'Pick what kind of occasion it is — this only changes the wording.',
    'Read how long it has been, when the next one falls, and the gift for it.',
  ],

  sections: [
    {
      id: 'gifts',
      h2: 'Anniversary gifts by year',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Year</th><th>Traditional</th><th>Modern</th></tr></thead>
<tbody>
<tr><td>1st</td><td>Paper</td><td>Clocks</td></tr>
<tr><td>2nd</td><td>Cotton</td><td>China</td></tr>
<tr><td>3rd</td><td>Leather</td><td>Crystal or glass</td></tr>
<tr><td>4th</td><td>Fruit or flowers</td><td>Appliances</td></tr>
<tr><td>5th</td><td>Wood</td><td>Silverware</td></tr>
<tr><td>10th</td><td>Tin or aluminium</td><td>Diamond jewellery</td></tr>
<tr><td>15th</td><td>Crystal</td><td>Watches</td></tr>
<tr><td>20th</td><td>China</td><td>Platinum</td></tr>
<tr><td>25th</td><td>Silver</td><td>Silver</td></tr>
<tr><td>30th</td><td>Pearl</td><td>Diamond</td></tr>
<tr><td>40th</td><td>Ruby</td><td>Ruby</td></tr>
<tr><td>50th</td><td>Gold</td><td>Gold</td></tr>
<tr><td>60th</td><td>Diamond</td><td>Diamond</td></tr>
</tbody></table></div>
<p>The lists vary slightly between countries — the UK and US disagree on several years — so treat any of them as a prompt rather than an instruction.</p>`,
    },
    {
      id: 'ideas',
      h2: 'Using the theme without buying something literal',
      html: `<p>The traditional materials work better as a hook than as a shopping list. Nobody wants a tin object for their tenth.</p>
<ul>
<li><strong>Paper (1st)</strong> — tickets to something, a handwritten letter, a printed photo book.</li>
<li><strong>Cotton (2nd)</strong> — good bedding, a shirt they would not buy themselves.</li>
<li><strong>Wood (5th)</strong> — a tree planted somewhere meaningful, a chopping board, a piece of furniture.</li>
<li><strong>Tin (10th)</strong> — a tin of something they love, or take the "durable and flexible" reading and do something experiential.</li>
<li><strong>Crystal (15th)</strong> — glassware, or a trip somewhere with clear water.</li>
</ul>
<p>The genuinely reliable answer, across every year on the list: an experience together tends to be remembered longer than an object.</p>`,
    },
  ],

  faq: [
    { q: 'What is the traditional gift for each anniversary?', a: '<p>Paper for the first, cotton for the second, leather for the third, and so on. The table above covers the main years; the calculator shows the gift for your next one specifically.</p>' },
    { q: 'What is the difference between traditional and modern lists?', a: '<p>The traditional list evolved over centuries in Europe. The modern list was published in 1937 by an American jewellers’ association, and unsurprisingly features rather more jewellery.</p>' },
    { q: 'Which anniversaries are considered milestones?', a: '<p>Years 1 to 15 individually, then every fifth year. The 25th (silver), 50th (gold) and 60th (diamond) are the ones most widely marked.</p>' },
    { q: 'What is the 60th anniversary called?', a: '<p>Diamond. In the UK it is also associated with the monarch’s Diamond Jubilee, which is why it carries particular weight there.</p>' },
    { q: 'Can I use this for something other than a wedding?', a: '<p>Yes. Choose "something else" and it works for a first date, a job start, a sobriety date, or anything else worth counting from.</p>' },
  ],

  related: ['date-difference-calculator', 'age-calculator', 'countdown-timer', 'birthday-countdown'],
};
