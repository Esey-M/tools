export default {
  slug: 'date-difference-calculator',
  category: 'calculators',
  title: 'Date Difference Calculator – Days Between Two Dates',
  h1: 'Date Difference Calculator',
  cardText: 'How many days, weeks, months or working days lie between any two dates.',
  description:
    'Free date difference calculator. Find the number of days, weeks, months and years between two dates, plus the count of working days excluding weekends.',
  keywords: ['days between dates', 'date difference calculator', 'date duration', 'business days calculator'],
  updated: '2026-09-04',
  lede: 'Pick two dates to see exactly how far apart they are — in days, weeks, months and years, plus working days with weekends removed.',

  form: `
<div class="row">
  <div class="field">
    <label for="d1">Start date</label>
    <input type="date" id="d1">
  </div>
  <div class="field">
    <label for="d2">End date</label>
    <input type="date" id="d2">
  </div>
</div>
<label style="display:flex;align-items:center;gap:9px;font-size:.9rem;color:var(--ink-2);margin-bottom:6px">
  <input type="checkbox" id="inclusive" style="width:auto"> Count both the start and end day
</label>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Difference</div>
  <div class="result-value" id="days">—</div>
  <div class="result-note" id="cal"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Weeks</dt><dd id="w">—</dd></div>
    <div class="stat"><dt>Months</dt><dd id="m">—</dd></div>
    <div class="stat"><dt>Working days</dt><dd id="b">—</dd></div>
    <div class="stat"><dt>Hours</dt><dd id="h">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Choose both dates to see the difference.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var d1 = $('d1'), d2 = $('d2'), inc = $('inclusive'), out = $('out'), prompt = $('prompt');
  var fmt = function(n){ return n.toLocaleString('en-US'); };

  function parse(v){
    var p = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return p ? new Date(+p[1], +p[2] - 1, +p[3]) : null;
  }
  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  var t = new Date();
  d1.value = t.getFullYear() + '-' + pad(t.getMonth()+1) + '-' + pad(t.getDate());

  // Counts weekdays over the same span the day total covers: when both end days
  // are not being counted, the start day is the one dropped.
  function workingDays(a, b, inclusive){
    var start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    if (!inclusive) start.setDate(start.getDate() + 1);
    var total = Math.round((b - start) / 86400000) + 1;
    if (total <= 0) return 0;
    var whole = Math.floor(total / 7);
    var count = whole * 5;
    var rest = total - whole * 7;
    var dow = (start.getDay() + whole * 7) % 7;
    for (var i = 0; i < rest; i++) {
      var d = (dow + i) % 7;
      if (d !== 0 && d !== 6) count++;
    }
    return count;
  }

  function calc(){
    var a = parse(d1.value), b = parse(d2.value);
    if (!a || !b) { out.hidden = true; prompt.hidden = false; return; }
    if (a > b) { var tmp = a; a = b; b = tmp; }

    var days = Math.round((b - a) / 86400000);
    if (inc.checked) days += 1;

    $('days').textContent = fmt(days) + (days === 1 ? ' day' : ' days');
    $('w').textContent = fmt(Math.floor(days / 7)) + (days % 7 ? ' + ' + (days % 7) + 'd' : '');
    $('h').textContent = fmt(days * 24);
    $('b').textContent = fmt(workingDays(a, b, inc.checked));

    var y = b.getFullYear() - a.getFullYear();
    var mo = b.getMonth() - a.getMonth();
    var dd = b.getDate() - a.getDate();
    if (dd < 0) { mo--; dd += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (mo < 0) { mo += 12; y--; }
    $('m').textContent = fmt(y * 12 + mo);

    var parts = [];
    if (y) parts.push(y + (y === 1 ? ' year' : ' years'));
    if (mo) parts.push(mo + (mo === 1 ? ' month' : ' months'));
    if (dd) parts.push(dd + (dd === 1 ? ' day' : ' days'));
    $('cal').textContent = parts.length ? 'That is ' + parts.join(', ') + ' on the calendar.' : 'Same day.';

    out.hidden = false; prompt.hidden = true;
  }

  d1.addEventListener('input', calc);
  d2.addEventListener('input', calc);
  inc.addEventListener('change', calc);
})();`,

  answerHeading: 'How the day count is worked out',
  answer: `<p><strong>The difference between two dates is the number of midnights that pass between them.</strong> From 1 March to 8 March is 7 days, because seven midnights separate the two dates — even though eight dates are involved. Whether you want 7 or 8 depends on the question: a 7-day gap is right for "how long until", while 8 is right for "how many days am I on holiday", which is why this tool has a switch to count both end days.</p>`,

  steps: [
    'Pick the <strong>start date</strong>. It defaults to today.',
    'Pick the <strong>end date</strong>. The order does not matter — the tool always reports a positive difference.',
    'Tick <strong>count both days</strong> if the first and last day should each be included, as with holiday bookings.',
  ],

  sections: [
    {
      id: 'business',
      h2: 'What counts as a working day',
      html: `<p>The working-days figure removes every Saturday and Sunday from the range. It does <strong>not</strong> remove public holidays, because those differ by country, state and sometimes by employer.</p>
<p>If you need a strict business-day count for a contract or a shipping estimate, take the number here and subtract the public holidays that fall inside the range. In the United States there are 11 federal holidays a year; the UK has 8 bank holidays in England and Wales.</p>`,
    },
    {
      id: 'months',
      h2: 'Why the month count can look wrong',
      html: `<p>Months are not a fixed length, so "months between two dates" has more than one defensible answer.</p>
<p>This tool counts <strong>complete calendar months</strong>. From 31 January to 28 February is 0 complete months and 28 days, because the 31st has not come round again. From 15 January to 15 March is exactly 2 months regardless of how many days that spans.</p>
<p>Dividing total days by 30 gives a different figure, which is why loan schedules and rental agreements always specify which convention they use.</p>`,
    },
  ],

  faq: [
    { q: 'How many days are between two dates?', a: '<p>Enter both dates above. The tool counts the midnights between them, and you can tick the box to include both the first and last day if your situation calls for it.</p>' },
    { q: 'Does this include leap days?', a: '<p>Yes. The calculation works on real calendar dates, so 29 February is counted whenever it falls inside the range.</p>' },
    { q: 'How do I count working days only?', a: '<p>The working days figure in the results already excludes Saturdays and Sundays. Subtract any public holidays yourself, since those vary by location.</p>' },
    { q: 'Why does it say 7 days when I count 8 dates?', a: '<p>Because the gap between dates and the number of dates are different things. 1 to 8 March spans 8 dates but only 7 nights. Tick "count both days" if you want the 8.</p>' },
    { q: 'Can I use dates in the past?', a: '<p>Yes, and in any order. The tool sorts them for you and always reports a positive difference.</p>' },
  ],

  related: ['age-calculator', 'countdown-timer', 'birthday-countdown', 'time-zone-converter'],
};
