export default {
  slug: 'pregnancy-due-date-calculator',
  category: 'calculators',
  title: 'Pregnancy Due Date Calculator – Your Estimated Due Date',
  h1: 'Pregnancy Due Date Calculator',
  cardText: 'Estimated due date, current week, and what each trimester covers.',
  description:
    'Free pregnancy due date calculator. Work out your estimated due date from your last period, conception date or IVF transfer, with trimester dates and milestones.',
  keywords: ['due date calculator', 'pregnancy calculator', 'how many weeks pregnant', 'edd calculator', 'conception date calculator'],
  updated: '2026-09-04',
  disclaimer: 'An estimate only. Your midwife or doctor’s dating scan is more accurate and takes precedence.',
  lede: 'Work out an estimated due date from your last period, a known conception date, or an IVF transfer — with your current week and trimester dates.',

  form: `
<div class="field">
  <span class="field-label" id="method-label">Calculate from</span>
  <div class="seg" role="group" aria-labelledby="method-label" id="methods" style="flex-wrap:wrap">
    <button type="button" data-m="lmp" aria-pressed="true">Last period</button>
    <button type="button" data-m="conception">Conception date</button>
    <button type="button" data-m="ivf">IVF transfer</button>
    <button type="button" data-m="due">I know my due date</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="date" id="datelabel">First day of your last period</label>
    <input type="date" id="date">
  </div>
  <div class="field" id="cycle-field">
    <label for="cycle">Average cycle length</label>
    <div class="input-group"><input type="number" id="cycle" inputmode="numeric" min="20" max="45" step="1" value="28"><span class="addon">days</span></div>
    <span class="hint">28 is the default. Adjust if your cycles are longer or shorter.</span>
  </div>
  <div class="field" id="ivf-field" hidden>
    <label for="ivfday">Embryo age at transfer</label>
    <select id="ivfday">
      <option value="3">Day 3 embryo</option>
      <option value="5" selected>Day 5 blastocyst</option>
      <option value="6">Day 6 blastocyst</option>
    </select>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Estimated due date</div>
  <div class="result-value" id="due">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>You are</dt><dd id="weeks" style="font-size:1.15rem">—</dd></div>
    <div class="stat"><dt>Trimester</dt><dd id="tri" style="font-size:1.15rem">—</dd></div>
    <div class="stat"><dt>Days to go</dt><dd id="togo">—</dd></div>
    <div class="stat"><dt>Conceived around</dt><dd id="conceived" style="font-size:1.05rem">—</dd></div>
  </dl>
</div>

<div id="milestones" hidden style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Key dates</h2>
  <div class="table-scroll"><table id="mtable"><thead><tr><th>Milestone</th><th>Week</th><th>Date</th></tr></thead><tbody></tbody></table></div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Choose a date to see your estimate.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var method = 'lmp';

  function parse(v){
    var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function addDays(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmt(d){
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function fmtShort(d){
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  var MILESTONES = [
    ['End of first trimester', 13],
    ['Anatomy scan window opens', 18],
    ['Halfway point', 20],
    ['Viability milestone', 24],
    ['End of second trimester', 27],
    ['Third trimester begins', 28],
    ['Considered full term', 37],
    ['Due date', 40],
    ['Post-term', 42]
  ];

  function calc(){
    var d = parse($('date').value);
    if (!d) { $('out').hidden = true; $('milestones').hidden = true; $('prompt').hidden = false; return; }

    var cycle = parseInt($('cycle').value, 10);
    if (!isFinite(cycle) || cycle < 20 || cycle > 45) cycle = 28;

    // Everything is normalised to a notional LMP so one calculation serves all methods.
    var lmp;
    if (method === 'lmp') {
      // Naegele's rule, adjusted when cycles are not 28 days.
      lmp = addDays(d, cycle - 28);
    } else if (method === 'conception') {
      lmp = addDays(d, -14);
    } else if (method === 'ivf') {
      var embryoAge = parseInt($('ivfday').value, 10);
      lmp = addDays(d, -(14 + embryoAge));
    } else {
      lmp = addDays(d, -280);
    }

    var due = addDays(lmp, 280);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var daysPregnant = Math.floor((today - lmp) / 86400000);
    var weeks = Math.floor(daysPregnant / 7);
    var days = daysPregnant % 7;
    var toGo = Math.round((due - today) / 86400000);

    $('due').textContent = fmt(due);
    $('conceived').textContent = fmtShort(addDays(lmp, 14));

    if (daysPregnant < 0) {
      $('weeks').textContent = 'Not yet';
      $('tri').textContent = '—';
      $('note').textContent = 'Based on a 280-day pregnancy from ' + fmtShort(lmp) + '.';
    } else if (weeks > 45) {
      $('weeks').textContent = '—';
      $('tri').textContent = '—';
      $('note').textContent = 'That date is more than 45 weeks ago — check it is right.';
    } else {
      $('weeks').textContent = weeks + 'w ' + days + 'd';
      $('tri').textContent = weeks < 13 ? 'First' : weeks < 28 ? 'Second' : 'Third';
      $('note').textContent = toGo > 0
        ? toGo + ' days to go, from an estimated ' + weeks + ' weeks and ' + days + ' days.'
        : 'Estimated due date has passed by ' + Math.abs(toGo) + ' days.';
    }
    $('togo').textContent = toGo > 0 ? toGo : (toGo === 0 ? 'Today' : Math.abs(toGo) + ' overdue');

    $('mtable').querySelector('tbody').innerHTML = MILESTONES.map(function(m){
      var date = addDays(lmp, m[1] * 7);
      var past = date < today;
      return '<tr' + (past ? ' style="color:var(--ink-3)"' : '') + '><td>' + m[0] + '</td><td>' +
        m[1] + '</td><td>' + fmtShort(date) + (past ? ' ✓' : '') + '</td></tr>';
    }).join('');

    $('out').hidden = false;
    $('milestones').hidden = false;
    $('prompt').hidden = true;
  }

  $('methods').addEventListener('click', function(e){
    var b = e.target.closest('button[data-m]'); if (!b) return;
    method = b.getAttribute('data-m');
    var btns = $('methods').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('datelabel').textContent =
      method === 'lmp' ? 'First day of your last period' :
      method === 'conception' ? 'Date of conception' :
      method === 'ivf' ? 'Date of embryo transfer' : 'Your due date';
    $('cycle-field').hidden = method !== 'lmp';
    $('ivf-field').hidden = method !== 'ivf';
    calc();
  });
  ['date','cycle','ivfday'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
})();`,

  answerHeading: 'How a due date is worked out',
  answer: `<p><strong>The standard method, Naegele's rule, counts 280 days — 40 weeks — from the first day of your last period.</strong> That deliberately starts about two weeks before conception actually happened, because the date of your last period is something you can know and the date of conception usually is not. It assumes a 28-day cycle with ovulation on day 14, so this calculator adjusts if your cycles are longer or shorter. Only about 4% of babies arrive on the estimated date; roughly 90% arrive within two weeks either side.</p>`,

  steps: [
    'Choose what you are calculating from — your last period is the usual starting point.',
    'Enter the date. For a last period, this is the <strong>first</strong> day of bleeding.',
    'Adjust your average cycle length if it is not 28 days.',
    'Read your due date, current week, and the key dates table.',
  ],

  sections: [
    {
      id: 'accuracy',
      h2: 'How accurate is a due date?',
      html: `<p>Less than the confident single date suggests. The due date is the midpoint of a distribution, not a prediction.</p>
<div class="table-scroll"><table>
<thead><tr><th>Arrival</th><th>Roughly</th></tr></thead>
<tbody>
<tr><td>On the estimated due date</td><td>4%</td></tr>
<tr><td>Within 1 week either side</td><td>~70%</td></tr>
<tr><td>Within 2 weeks either side</td><td>~90%</td></tr>
<tr><td>Before 37 weeks (preterm)</td><td>~10%</td></tr>
<tr><td>After 42 weeks</td><td>Under 1% with modern monitoring</td></tr>
</tbody></table></div>
<p>First pregnancies tend to run slightly longer than subsequent ones. An early dating scan, usually between 8 and 14 weeks, measures the baby directly and is more accurate than any date-based calculation — if it disagrees with this by more than about five days, the scan date is the one clinicians use.</p>`,
    },
    {
      id: 'cycle',
      h2: 'Why cycle length matters',
      html: `<p>Naegele's rule assumes ovulation on day 14 of a 28-day cycle. If your cycles are consistently 35 days, you likely ovulate around day 21 — a week later — and the standard calculation would place your due date a week early.</p>
<p>This calculator shifts the due date by the difference between your cycle length and 28 days. With a 35-day cycle the due date moves seven days later; with a 24-day cycle it moves four days earlier.</p>
<p>If your cycles are irregular, date-based estimates are unreliable and a dating scan matters considerably more.</p>`,
    },
    {
      id: 'ivf',
      h2: 'IVF dates are the precise ones',
      html: `<p>IVF is the one case where conception timing is known exactly, which makes these due dates the most reliable of all.</p>
<p>The calculation works backwards from the transfer: a day-5 blastocyst is already five days past fertilisation, and fertilisation is treated as day 14 of the notional cycle. So the notional last period is 19 days before a day-5 transfer, and 17 days before a day-3 transfer.</p>`,
    },
  ],

  faq: [
    { q: 'How many weeks pregnant am I?', a: '<p>Enter the first day of your last period and the calculator shows your current week and day. Pregnancy is counted from that date, so you are considered about two weeks pregnant at conception.</p>' },
    { q: 'Why is pregnancy dated from my last period?', a: '<p>Because it is a date you can actually identify. Conception typically occurs around two weeks later, which is why 40 weeks of pregnancy is really about 38 weeks of foetal development.</p>' },
    { q: 'What if my cycle is not 28 days?', a: '<p>Enter your average length and the due date is adjusted. Longer cycles mean later ovulation and a later due date.</p>' },
    { q: 'Which is more accurate, this or my scan?', a: '<p>The scan. An early dating scan measures the baby directly, and clinicians will re-date a pregnancy if the scan differs from the period-based estimate by more than about five days.</p>' },
    { q: 'When does each trimester start and end?', a: '<p>First trimester is weeks 1–12, second is 13–27, third is 28 to birth. The exact boundaries vary slightly between sources, and the key dates table above shows them for your pregnancy.</p>' },
  ],

  related: ['age-calculator', 'date-difference-calculator', 'countdown-timer', 'bmi-calculator'],
};
