export default {
  slug: 'period-tracker',
  category: 'health',
  title: 'Period Tracker – Predict Your Next Cycle, Privately',
  h1: 'Period Tracker',
  cardText: 'Predicts your next few periods and fertile window, stored only on your device.',
  description:
    'Free period tracker and calculator. Predict your next periods and fertile window from your last period and cycle length. Stored in your browser, never uploaded.',
  keywords: ['period tracker', 'period calculator', 'menstrual cycle calculator', 'ovulation calculator', 'next period date'],
  updated: '2026-09-04',
  disclaimer: 'Predictions from averages, not medical advice, and not a contraceptive method.',
  lede: 'Enter your last period and typical cycle length. Nothing is uploaded — period data is among the most sensitive information there is, and this tool never sees it.',

  form: `
<div class="row">
  <div class="field">
    <label for="last">First day of your last period</label>
    <input type="date" id="last">
  </div>
  <div class="field">
    <label for="cycle">Average cycle length</label>
    <div class="input-group"><input type="number" id="cycle" inputmode="numeric" min="20" max="45" step="1" value="28"><span class="addon">days</span></div>
    <span class="hint">First day of one period to the first day of the next.</span>
  </div>
  <div class="field">
    <label for="length">Period length</label>
    <div class="input-group"><input type="number" id="length" inputmode="numeric" min="1" max="10" step="1" value="5"><span class="addon">days</span></div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Next period expected</div>
  <div class="result-value" id="next">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Days until</dt><dd id="until">—</dd></div>
    <div class="stat"><dt>Cycle day today</dt><dd id="today">—</dd></div>
    <div class="stat"><dt>Fertile window</dt><dd id="fertile" style="font-size:1.02rem">—</dd></div>
    <div class="stat"><dt>Estimated ovulation</dt><dd id="ovulation" style="font-size:1.02rem">—</dd></div>
  </dl>
</div>

<div id="upcoming" hidden style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Next six cycles</h2>
  <div class="table-scroll"><table id="table"><thead><tr><th>Cycle</th><th>Period starts</th><th>Period ends</th><th>Fertile window</th></tr></thead><tbody></tbody></table></div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter the first day of your last period.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-period';

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function parse(v){
    var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function addDays(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmt(d){ return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function fmtLong(d){ return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }

  function calc(){
    var last = parse($('last').value);
    var cycle = parseInt($('cycle').value, 10);
    var length = parseInt($('length').value, 10);
    if (!last || !isFinite(cycle) || cycle < 20 || !isFinite(length) || length < 1) {
      $('out').hidden = true; $('upcoming').hidden = true; $('prompt').hidden = false;
      return;
    }

    var today = new Date(); today.setHours(0, 0, 0, 0);

    // Roll forward to the next start date that has not yet passed.
    var start = new Date(last);
    while (addDays(start, cycle) <= today) start = addDays(start, cycle);
    var next = addDays(start, cycle);

    var cycleDay = Math.round((today - start) / 86400000) + 1;
    var untilDays = Math.round((next - today) / 86400000);

    // Ovulation is about 14 days before the next period; sperm survive ~5 days.
    var ovulation = addDays(next, -14);
    var fertileStart = addDays(ovulation, -5);
    var fertileEnd = addDays(ovulation, 1);

    $('next').textContent = fmtLong(next);
    $('until').textContent = untilDays === 0 ? 'Today' : untilDays;
    $('today').textContent = cycleDay > 0 && cycleDay <= cycle ? 'Day ' + cycleDay : '—';
    $('fertile').textContent = fmt(fertileStart) + ' – ' + fmt(fertileEnd);
    $('ovulation').textContent = fmt(ovulation);
    $('note').textContent = 'Based on a ' + cycle + '-day cycle lasting ' + length +
      ' days. Predictions drift if your cycles vary — this is an average, not a guarantee.';

    var rows = [];
    var s = new Date(next);
    for (var i = 0; i < 6; i++) {
      var end = addDays(s, length - 1);
      var ov = addDays(addDays(s, cycle), -14);
      rows.push('<tr><td>' + (i + 1) + '</td><td>' + fmt(s) + '</td><td>' + fmt(end) + '</td><td>' +
        fmt(addDays(ov, -5)) + ' – ' + fmt(addDays(ov, 1)) + '</td></tr>');
      s = addDays(s, cycle);
    }
    $('table').querySelector('tbody').innerHTML = rows.join('');

    $('out').hidden = false; $('upcoming').hidden = false; $('prompt').hidden = true;

    try {
      localStorage.setItem(KEY, JSON.stringify({ last: $('last').value, cycle: cycle, length: length }));
    } catch (e) {}
  }

  ['last','cycle','length'].forEach(function(id){ $(id).addEventListener('input', calc); });

  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved) {
      $('last').value = saved.last || '';
      $('cycle').value = saved.cycle || 28;
      $('length').value = saved.length || 5;
    }
  } catch (e) {}

  var t = new Date();
  $('last').max = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  calc();
})();`,

  answerHeading: 'How the prediction works',
  answer: `<p><strong>Your next period is predicted by adding your cycle length to the first day of the last one.</strong> Ovulation is estimated at roughly 14 days <em>before</em> the next period rather than 14 days after the last, because the second half of the cycle — the luteal phase — is far more consistent in length than the first. The fertile window covers the five days before ovulation plus the day itself, since sperm can survive several days in the reproductive tract while an egg lives around 24 hours.</p>`,

  steps: [
    'Enter the first day of your last period.',
    'Set your typical cycle length — the gap from one period starting to the next.',
    'Set how many days your period usually lasts.',
    'Everything saves in your browser, so it is still here next time.',
  ],

  sections: [
    {
      id: 'privacy',
      h2: 'Why this one stores nothing',
      html: `<p>Period tracking apps have a documented history of sharing data with advertisers and analytics companies, and in some jurisdictions cycle data has become legally sensitive in ways it was not a few years ago.</p>
<p>This tool has no account, no server and no analytics on your inputs. The three values you enter are written to your browser's local storage and nothing else. There is no database that could be subpoenaed, breached or sold, because there is no database.</p>
<p>The trade-off is real: no syncing between devices, no logging of symptoms over time, and clearing your browser data clears it. If you want richer tracking, choose an app that stores data locally and says so specifically.</p>`,
    },
    {
      id: 'normal',
      h2: 'What counts as a normal cycle',
      html: `<div class="table-scroll"><table>
<thead><tr><th></th><th>Typical range</th></tr></thead>
<tbody>
<tr><td>Cycle length, adults</td><td>21–35 days</td></tr>
<tr><td>Cycle length, teenagers</td><td>21–45 days</td></tr>
<tr><td>Period length</td><td>2–7 days</td></tr>
<tr><td>Variation between cycles</td><td>Up to 7–9 days is common</td></tr>
<tr><td>Luteal phase, after ovulation</td><td>12–14 days, fairly fixed</td></tr>
</tbody></table></div>
<p>Only around 13% of cycles are exactly 28 days. Variation is normal, and cycles are often irregular for the first couple of years after periods begin and again approaching menopause.</p>
<p>Worth discussing with a doctor: cycles consistently shorter than 21 or longer than 35 days, bleeding longer than 7 days, soaking through a pad or tampon hourly, bleeding between periods, or pain that stops you doing normal things.</p>`,
    },
    {
      id: 'contraception',
      h2: 'This is not a contraceptive method',
      html: `<p>Stating this plainly because it matters. Calendar-based prediction is among the least reliable forms of contraception — typical-use failure rates are around 12–24% per year, meaning up to roughly one in four people relying on it become pregnant within a year.</p>
<p>The reason is that ovulation timing varies, including in people with regular cycles, and illness, stress, travel and sleep disruption can all shift it. A prediction based on averages cannot account for the cycle you are actually in.</p>
<p>Fertility awareness methods that <em>do</em> work reasonably well combine basal body temperature, cervical mucus observation and cycle length, with proper training — that is a different practice from reading dates off a calendar.</p>`,
    },
  ],

  faq: [
    { q: 'Is my period data private?', a: '<p>Yes, completely. The dates you enter stay in your browser’s local storage and are never transmitted. There is no account and no server, so there is nothing to leak or share.</p>' },
    { q: 'How accurate is the prediction?', a: '<p>It is only as regular as your cycles are. For someone with consistent cycles it is usually within a day or two; for irregular cycles it can be out by a week or more.</p>' },
    { q: 'When am I most fertile?', a: '<p>The five days before ovulation and the day of ovulation itself. Ovulation is estimated at 14 days before your next period, so the window is shown above.</p>' },
    { q: 'Can I use this as birth control?', a: '<p>No. Calendar prediction has a typical-use failure rate of roughly 12–24% a year. Use a proper contraceptive method.</p>' },
    { q: 'My cycle length varies — what should I enter?', a: '<p>Your average over the last few months. If cycles vary by more than about a week, treat the prediction as a rough guide rather than a date.</p>' },
    { q: 'Why is ovulation counted back from the next period?', a: '<p>Because the luteal phase — the time between ovulation and the next period — is consistently 12–14 days, whereas the first half of the cycle varies considerably. Counting backwards is the more reliable estimate.</p>' },
  ],

  related: ['pregnancy-due-date-calculator', 'age-calculator', 'date-difference-calculator', 'water-intake-calculator'],
};
