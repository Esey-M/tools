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
  lede: 'Enter your date of birth for a live countdown to your next birthday — plus the weekday it lands on and a few numbers about how long you have been here.',

  form: `
<div class="field">
  <label for="dob">Your date of birth</label>
  <input type="date" id="dob" autocomplete="bday">
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
    <div class="stat"><dt>You are</dt><dd id="age">—</dd></div>
    <div class="stat"><dt>Turning</dt><dd id="turning">—</dd></div>
    <div class="stat"><dt>Falls on a</dt><dd id="weekday">—</dd></div>
    <div class="stat"><dt>Days alive</dt><dd id="alive">—</dd></div>
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
  var dob = null, timer = null;

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function parse(v){
    var m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(v || '');
    return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
  }

  function tick(){
    if (!dob) return;
    var now = new Date();

    // Next occurrence of the birth day-and-month, at midnight.
    var next = new Date(now.getFullYear(), dob.m, dob.d, 0, 0, 0);
    var isToday = next.getDate() === now.getDate() && next.getMonth() === now.getMonth();
    if (next < now && !isToday) next = new Date(now.getFullYear() + 1, dob.m, dob.d, 0, 0, 0);

    var diff = Math.max(0, next - now);
    var total = Math.floor(diff / 1000);
    $('d').textContent = Math.floor(total / 86400);
    $('h').textContent = pad(Math.floor(total % 86400 / 3600));
    $('m').textContent = pad(Math.floor(total % 3600 / 60));
    $('s').textContent = pad(total % 60);

    var birth = new Date(dob.y, dob.m, dob.d);
    var years = now.getFullYear() - dob.y;
    var hadBirthday = (now.getMonth() > dob.m) || (now.getMonth() === dob.m && now.getDate() >= dob.d);
    if (!hadBirthday) years--;

    $('age').textContent = years + (years === 1 ? ' year' : ' years');
    $('turning').textContent = (isToday ? years : years + 1);
    $('weekday').textContent = next.toLocaleDateString('en-US', { weekday: 'long' });
    $('alive').textContent = Math.floor((now - birth) / 86400000).toLocaleString('en-US');

    $('lbl').textContent = isToday ? 'Happy birthday!' : 'Until your birthday';
    $('note').textContent = isToday
      ? 'Today is the day — you turned ' + years + '.'
      : 'Your next birthday is ' + next.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + '.';
  }

  $('dob').addEventListener('input', function(){
    dob = parse(this.value);
    if (!dob) { $('out').hidden = true; $('prompt').hidden = false; clearInterval(timer); return; }
    $('out').hidden = false; $('prompt').hidden = true;
    tick();
    clearInterval(timer);
    timer = setInterval(tick, 1000);
  });

  var t = new Date();
  $('dob').max = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
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
    { q: 'What day of the week is my birthday this year?', a: '<p>It is shown in the "falls on a" box once you enter your date of birth.</p>' },
    { q: 'Does this handle leap years?', a: '<p>Yes. The countdown works on real calendar dates, so 29 February is counted whenever it falls inside the period.</p>' },
    { q: 'What if my birthday is today?', a: '<p>The tool recognises it and says so, showing the age you have just turned rather than counting down to next year.</p>' },
    { q: 'Is my date of birth stored?', a: '<p>No. It stays in your browser and is discarded when you close the page. Nothing is uploaded.</p>' },
  ],

  related: ['age-calculator', 'countdown-timer', 'date-difference-calculator', 'zodiac-sign-finder'],
};
