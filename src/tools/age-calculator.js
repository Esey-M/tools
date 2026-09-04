export default {
  slug: 'age-calculator',
  category: 'calculators',
  title: 'Age Calculator – Your Exact Age in Years, Months and Days',
  h1: 'Age Calculator',
  cardText: 'Your exact age in years, months and days — plus a countdown to your next birthday.',
  description:
    'Free age calculator. Enter your date of birth for your exact age in years, months and days, your total days and hours, and a countdown to your next birthday.',
  keywords: ['age calculator', 'how old am i', 'date of birth calculator', 'exact age'],
  updated: '2026-09-04',
  lede: 'Enter your date of birth to see exactly how old you are today — down to the day — plus how long you have to wait for your next birthday.',

  form: `
<div class="row">
  <div class="field">
    <label for="dob">Date of birth</label>
    <input type="date" id="dob" max="2100-12-31" autocomplete="bday">
  </div>
  <div class="field">
    <label for="asof">Age at this date</label>
    <input type="date" id="asof">
    <span class="hint">Defaults to today. Change it to find your age on any date.</span>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">You are</div>
  <div class="result-value" id="main">—</div>
  <div class="result-note" id="bday"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Total months</dt><dd id="m">—</dd></div>
    <div class="stat"><dt>Total weeks</dt><dd id="w">—</dd></div>
    <div class="stat"><dt>Total days</dt><dd id="d">—</dd></div>
    <div class="stat"><dt>Total hours</dt><dd id="h">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Pick your date of birth to see your age.</p>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var dob = $('dob'), asof = $('asof'), out = $('out'), err = $('err'), prompt = $('prompt');
  var fmt = function(n){ return n.toLocaleString('en-US'); };

  // Local-midnight date from a yyyy-mm-dd value, avoiding UTC shift.
  function parse(v){
    var p = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return p ? new Date(+p[1], +p[2] - 1, +p[3]) : null;
  }
  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function todayStr(){ var t = new Date(); return t.getFullYear() + '-' + pad(t.getMonth()+1) + '-' + pad(t.getDate()); }

  asof.value = todayStr();
  dob.max = todayStr();

  function plural(n, word){ return n + ' ' + word + (n === 1 ? '' : 's'); }

  function calc(){
    var a = parse(dob.value), b = parse(asof.value);
    if (!a || !b) { out.hidden = true; prompt.hidden = false; err.hidden = true; return; }
    if (a > b) {
      out.hidden = true; prompt.hidden = true;
      err.hidden = false; err.textContent = 'The date of birth is after the comparison date — swap them around.';
      return;
    }
    err.hidden = true; prompt.hidden = true;

    // Calendar-accurate years/months/days, borrowing from the previous month.
    var y = b.getFullYear() - a.getFullYear();
    var mo = b.getMonth() - a.getMonth();
    var d = b.getDate() - a.getDate();
    if (d < 0) { mo--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (mo < 0) { mo += 12; y--; }

    var parts = [];
    if (y) parts.push(plural(y, 'year'));
    if (mo) parts.push(plural(mo, 'month'));
    parts.push(plural(d, 'day'));
    $('main').textContent = parts.join(', ');

    var ms = b - a;
    var days = Math.round(ms / 86400000);
    $('d').textContent = fmt(days);
    $('w').textContent = fmt(Math.floor(days / 7));
    $('m').textContent = fmt(y * 12 + mo);
    $('h').textContent = fmt(days * 24);

    // Next birthday relative to the comparison date.
    var next = new Date(b.getFullYear(), a.getMonth(), a.getDate());
    if (next < b) next = new Date(b.getFullYear() + 1, a.getMonth(), a.getDate());
    var until = Math.round((next - b) / 86400000);
    $('bday').textContent = until === 0
      ? 'Happy birthday — that is today!'
      : 'Next birthday in ' + plural(until, 'day') + ', turning ' + (y + 1) + '.';

    out.hidden = false;
  }

  dob.addEventListener('input', calc);
  asof.addEventListener('input', calc);
})();`,

  answerHeading: 'How your age is worked out',
  answer: `<p><strong>Your age is the number of complete years, then months, then days between your date of birth and today.</strong> The calculation is not simply days ÷ 365, because months have different lengths and leap years add an extra day roughly every four years. This calculator counts calendar months properly: if you were born on 15 March 1990, then on 10 September 2026 you are 36 years, 5 months and 26 days old — it borrows the 31 days of August to settle the day count.</p>`,

  steps: [
    'Pick your <strong>date of birth</strong> from the first field.',
    'Leave the second field on today’s date, or change it to find your age on any past or future date.',
    'Read your exact age in years, months and days, plus the totals underneath.',
  ],

  sections: [
    {
      id: 'method',
      h2: 'Why days ÷ 365 gives the wrong answer',
      html: `<p>A common shortcut is to count the days between two dates and divide by 365. That drifts, because a calendar year averages 365.2425 days once leap years are counted.</p>
<p>Over a lifetime the error is visible. Someone alive for 20,000 days is 54.79 years old by the naive method, but 54 years, 9 months and 5 days by proper calendar counting — and on some dates the naive method lands you on the wrong side of a birthday entirely.</p>
<p>This calculator works the way people actually count: increment the year on each birthday, then the months, then the leftover days.</p>`,
    },
    {
      id: 'leap',
      h2: 'What happens if you were born on 29 February',
      html: `<p>A leap day birthday only falls on the calendar once every four years. For age purposes, most countries treat 1 March as the legal birthday in common years, though some use 28 February.</p>
<p>This calculator uses the arithmetic convention: in a non-leap year, a 29 February birth date rolls into 1 March, so your age still increases exactly once per year.</p>`,
    },
  ],

  faq: [
    { q: 'How old am I exactly?', a: '<p>Enter your date of birth above and the answer appears immediately, expressed in years, months and days, along with your total days and hours alive.</p>' },
    { q: 'Can I calculate my age on a future date?', a: '<p>Yes. Change the second field to any future date and the tool tells you how old you will be then. This is handy for checking eligibility dates for school, retirement or licences.</p>' },
    { q: 'Does this account for leap years?', a: '<p>Yes. It counts real calendar dates rather than dividing by 365, so every leap day between your birth date and the comparison date is included automatically.</p>' },
    { q: 'How many days old am I?', a: '<p>The total days figure in the results shows exactly that — the number of complete days between your date of birth and the comparison date.</p>' },
    { q: 'Is my date of birth stored anywhere?', a: '<p>No. The whole calculation happens in your browser. Nothing is sent to a server and nothing is saved after you close the page.</p>' },
  ],

  related: ['date-difference-calculator', 'birthday-countdown', 'countdown-timer', 'bmi-calculator'],
};
