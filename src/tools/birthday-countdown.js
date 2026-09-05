export default {
  slug: 'birthday-countdown',
  category: 'fun',
  title: 'Birthday Countdown – How Many Days Until Your Birthday',
  h1: 'Birthday Countdown',
  cardText: 'Days until your next birthday, your exact age, and the day of the week.',
  description:
    'Free birthday countdown. Enter your date of birth to see how many days until your next birthday, how old you will turn, and what day of the week it falls on.',
  keywords: ['birthday countdown', 'days until my birthday', 'how many days until my birthday', 'birthday calculator'],
  updated: '2026-09-04',
  lede: 'Enter a date of birth for a live countdown to the next birthday, the weekday it lands on, and how long you have been here. Only know the day and month? Switch mode and skip the year.',

  form: `
<div class="field">
  <span class="field-label" id="mode-label">What do you know?</span>
  <div class="seg" role="group" aria-labelledby="mode-label" id="modes">
    <button type="button" data-m="dob" aria-pressed="true">Full date of birth</button>
    <button type="button" data-m="dm">Just the day and month</button>
  </div>
</div>

<div class="field" id="f-dob">
  <label for="dob">Date of birth</label>
  <input type="date" id="dob" autocomplete="bday">
  <span class="hint">Dates after today are greyed out because this is the <em>birth</em> date, not the birthday you are counting to. If you only know the day and month, switch above.</span>
</div>

<div class="row" id="f-dm" hidden>
  <div class="field">
    <label for="day">Day</label>
    <select id="day"></select>
  </div>
  <div class="field">
    <label for="month">Month</label>
    <select id="month"></select>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Until your birthday</div>
  <div class="cd-grid">
    <div class="cd-unit"><span id="d">0</span><small>days</small></div>
    <div class="cd-unit"><span id="h">0</span><small>hours</small></div>
    <div class="cd-unit"><span id="m">0</span><small>minutes</small></div>
    <div class="cd-unit"><span id="s">0</span><small>seconds</small></div>
  </div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat" data-needs-year><dt>You are</dt><dd id="age">—</dd></div>
    <div class="stat" data-needs-year><dt>Turning</dt><dd id="turning">—</dd></div>
    <div class="stat"><dt>Falls on a</dt><dd id="weekday">—</dd></div>
    <div class="stat" data-needs-year><dt>Days alive</dt><dd id="alive">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Pick your date of birth to start the countdown.</p>`,

  css: `
.cd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.cd-unit{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:14px 6px;text-align:center}
.cd-unit span{display:block;font-size:clamp(1.6rem,1rem+2.4vw,2.5rem);font-weight:720;line-height:1;
  letter-spacing:-.03em;font-variant-numeric:tabular-nums;color:var(--accent-ink)}
.cd-unit small{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);margin-top:6px;font-weight:600}
@media (max-width:460px){.cd-grid{grid-template-columns:repeat(2,1fr)}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var dob = null, timer = null, mode = 'dob';

  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function parse(v){
    var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return m ? { y: +m[1], m: +m[2] - 1, d: +m[3], hasYear: true } : null;
  }

  // Populate the day and month selects for the year-less mode.
  $('month').innerHTML = MONTHS.map(function(name, i){
    return '<option value="' + i + '">' + name + '</option>';
  }).join('');
  function fillDays(){
    var monthIndex = parseInt($('month').value, 10);
    // Use a leap year so 29 February stays available.
    var count = new Date(2024, monthIndex + 1, 0).getDate();
    var current = parseInt($('day').value, 10) || 1;
    $('day').innerHTML = '';
    for (var d = 1; d <= count; d++) {
      $('day').innerHTML += '<option value="' + d + '"' + (d === current ? ' selected' : '') + '>' + d + '</option>';
    }
  }

  function read(){
    if (mode === 'dob') return parse($('dob').value);
    var d = parseInt($('day').value, 10), m = parseInt($('month').value, 10);
    if (!isFinite(d) || !isFinite(m)) return null;
    return { y: null, m: m, d: d, hasYear: false };
  }

  function tick(){
    if (!dob) return;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    var next = new Date(now.getFullYear(), dob.m, dob.d, 0, 0, 0);
    var isToday = next.getDate() === now.getDate() && next.getMonth() === now.getMonth();
    if (next < today && !isToday) next = new Date(now.getFullYear() + 1, dob.m, dob.d, 0, 0, 0);

    var diff = Math.max(0, next - now);
    var total = Math.floor(diff / 1000);
    $('d').textContent = Math.floor(total / 86400);
    $('h').textContent = pad(Math.floor(total % 86400 / 3600));
    $('m').textContent = pad(Math.floor(total % 3600 / 60));
    $('s').textContent = pad(total % 60);

    $('weekday').textContent = next.toLocaleDateString('en-US', { weekday: 'long' });

    if (dob.hasYear) {
      var birth = new Date(dob.y, dob.m, dob.d);
      var years = now.getFullYear() - dob.y;
      var hadBirthday = (now.getMonth() > dob.m) ||
        (now.getMonth() === dob.m && now.getDate() >= dob.d);
      if (!hadBirthday) years--;

      $('age').textContent = years + (years === 1 ? ' year' : ' years');
      $('turning').textContent = (isToday ? years : years + 1);
      $('alive').textContent = Math.floor((now - birth) / 86400000).toLocaleString('en-US');
      $('lbl').textContent = isToday ? 'Happy birthday!' : 'Until your birthday';
      $('note').textContent = isToday
        ? 'Today is the day — you turned ' + years + '.'
        : 'Your next birthday is ' + next.toLocaleDateString('en-US',
            { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + '.';
    } else {
      $('lbl').textContent = isToday ? 'It is today!' : 'Until the birthday';
      $('note').textContent = 'Counting down to ' + next.toLocaleDateString('en-US',
        { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
        '. Add the birth year above to also see the age.';
    }
  }

  function start(){
    dob = read();
    var showYearStats = !!(dob && dob.hasYear);
    document.querySelectorAll('[data-needs-year]').forEach(function(el){ el.hidden = !showYearStats; });

    if (!dob) {
      $('out').hidden = true; $('prompt').hidden = false;
      clearInterval(timer);
      return;
    }
    $('out').hidden = false; $('prompt').hidden = true;
    tick();
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  }

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-m]'); if (!b) return;
    mode = b.getAttribute('data-m');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('f-dob').hidden = mode !== 'dob';
    $('f-dm').hidden = mode === 'dob';
    $('prompt').textContent = mode === 'dob'
      ? 'Pick your date of birth to start the countdown.'
      : 'Pick the day and month to start the countdown.';
    start();
  });

  $('dob').addEventListener('input', start);
  $('day').addEventListener('change', start);
  $('month').addEventListener('change', function(){ fillDays(); start(); });

  var t = new Date();
  $('dob').max = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  $('month').value = t.getMonth();
  fillDays();
  $('day').value = t.getDate();
})();`,

  answerHeading: 'How the countdown works',
  answer: `<p><strong>The countdown runs to midnight at the start of your next birthday, in your own time zone.</strong> It finds the next occurrence of your birth day and month — this year if it is still ahead, next year if it has passed — and counts down in real time. Because it works from actual dates rather than adding 365 days, leap years are handled correctly, so the count stays accurate across February in any year.</p>`,

  steps: [
    'Pick your date of birth.',
    'The countdown starts immediately and updates every second.',
    'The weekday shown tells you which day to book off.',
  ],

  sections: [
    {
      id: 'weekday',
      h2: 'Why your birthday moves through the week',
      html: `<p>A common year is 365 days, which is 52 weeks plus one day. So your birthday normally advances one weekday each year — Monday this year, Tuesday next.</p>
<p>Leap years add a second day, so if 29 February falls between your birthday and the next one, it jumps two weekdays instead. The pattern repeats every 28 years, which is why your birthday falls on the same weekday as it did when you were 28.</p>`,
    },
    {
      id: 'leap',
      h2: 'Born on 29 February?',
      html: `<p>Roughly one person in 1,461 is a "leapling". Your actual birth date exists only once every four years, so in common years the convention has to be chosen.</p>
<p>Most legal systems treat 1 March as the birthday in common years — that is the position in England and Wales, and in most US states. Some jurisdictions, including New Zealand and Taiwan, use 28 February instead. This countdown follows the arithmetic convention and rolls to 1 March, so your age still increases exactly once a year.</p>`,
    },
  ],

  faq: [
    { q: 'How many days until my birthday?', a: '<p>Enter your date of birth above and the answer appears immediately, updating every second along with hours, minutes and seconds.</p>' },
    { q: 'Why can I not pick a future date?', a: '<p>The default mode asks for your date of birth, which cannot be in the future, so later dates are greyed out. If you want to count down to a birthday without knowing the birth year, switch to <strong>Just the day and month</strong> at the top. For a countdown to any other future date, use the <a href="/countdown-timer/">countdown timer</a>.</p>' },
    { q: 'What day of the week is my birthday this year?', a: '<p>It is shown in the "falls on a" box once you enter your date of birth.</p>' },
    { q: 'Does this handle leap years?', a: '<p>Yes. The countdown works on real calendar dates, so 29 February is counted whenever it falls inside the period.</p>' },
    { q: 'What if my birthday is today?', a: '<p>The tool recognises it and says so, showing the age you have just turned rather than counting down to next year.</p>' },
    { q: 'Is my date of birth stored?', a: '<p>No. It stays in your browser and is discarded when you close the page. Nothing is uploaded.</p>' },
  ],

  related: ['age-calculator', 'countdown-timer', 'date-difference-calculator', 'zodiac-sign-finder'],
};
