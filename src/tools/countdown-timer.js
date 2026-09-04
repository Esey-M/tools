export default {
  slug: 'countdown-timer',
  category: 'fun',
  title: 'Countdown Timer – Days, Hours and Minutes to Any Date',
  h1: 'Countdown Timer',
  cardText: 'A live countdown to any date and time, with shareable links.',
  description:
    'Free countdown timer to any date. See days, hours, minutes and seconds ticking down to a wedding, exam, holiday or launch, and share the countdown by link.',
  keywords: ['countdown timer', 'days until', 'countdown to date', 'event countdown', 'how many days until'],
  updated: '2026-09-04',
  lede: 'Pick a date and the countdown starts immediately. Copy the link to share the same countdown with anyone.',

  form: `
<div class="row">
  <div class="field">
    <label for="name">What are you counting down to?</label>
    <input type="text" id="name" placeholder="My birthday" maxlength="60" autocomplete="off">
  </div>
  <div class="field">
    <label for="date">Date</label>
    <input type="date" id="date">
  </div>
  <div class="field">
    <label for="time">Time</label>
    <input type="time" id="time" value="00:00">
  </div>
</div>

<div class="pills" id="presets" style="justify-content:flex-start;margin-bottom:16px"></div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Counting down</div>
  <div class="cd-grid">
    <div class="cd-unit"><span id="d">0</span><small>days</small></div>
    <div class="cd-unit"><span id="h">0</span><small>hours</small></div>
    <div class="cd-unit"><span id="m">0</span><small>minutes</small></div>
    <div class="cd-unit"><span id="s">0</span><small>seconds</small></div>
  </div>
  <div class="result-note" id="note"></div>
  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn btn-ghost" id="share">Copy shareable link</button>
  </div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Choose a date to start the countdown.</p>`,

  css: `
.cd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}
.cd-unit{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px 6px;text-align:center}
.cd-unit span{display:block;font-size:clamp(1.6rem,1rem+2.4vw,2.5rem);font-weight:720;line-height:1;
  letter-spacing:-.03em;font-variant-numeric:tabular-nums;color:var(--accent-ink)}
.cd-unit small{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.08em;
  color:var(--ink-3);margin-top:6px;font-weight:600}
@media (max-width:460px){.cd-grid{grid-template-columns:repeat(2,1fr)}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var target = null, timer = null;

  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  function parseTarget(){
    var d = $('date').value, t = $('time').value || '00:00';
    var dm = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(d);
    var tm = /^(\\d{1,2}):(\\d{2})$/.exec(t);
    if (!dm) return null;
    return new Date(+dm[1], +dm[2] - 1, +dm[3], tm ? +tm[1] : 0, tm ? +tm[2] : 0, 0);
  }

  function tick(){
    if (!target) return;
    var diff = target - new Date();
    var past = diff < 0;
    if (past) diff = -diff;

    var total = Math.floor(diff / 1000);
    var days = Math.floor(total / 86400);
    var hours = Math.floor(total % 86400 / 3600);
    var mins = Math.floor(total % 3600 / 60);
    var secs = total % 60;

    $('d').textContent = days.toLocaleString('en-US');
    $('h').textContent = pad(hours);
    $('m').textContent = pad(mins);
    $('s').textContent = pad(secs);

    var label = $('name').value.trim();
    $('lbl').textContent = past
      ? (label ? label + ' was' : 'That was')
      : (label ? 'Until ' + label : 'Counting down');
    $('note').textContent = target.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }) + (past ? ' — already passed.' : '');
  }

  function start(){
    target = parseTarget();
    if (!target) { $('out').hidden = true; $('prompt').hidden = false; clearInterval(timer); return; }
    $('out').hidden = false; $('prompt').hidden = true;
    tick();
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    updateUrl();
  }

  function updateUrl(){
    if (!target) return;
    var params = new URLSearchParams();
    params.set('d', $('date').value);
    if ($('time').value && $('time').value !== '00:00') params.set('t', $('time').value);
    if ($('name').value.trim()) params.set('n', $('name').value.trim());
    history.replaceState(null, '', location.pathname + '?' + params.toString());
  }

  ['date','time','name'].forEach(function(id){ $(id).addEventListener('input', start); });

  $('share').addEventListener('click', function(){
    navigator.clipboard.writeText(location.href).then(function(){
      var b = $('share'); b.textContent = 'Link copied'; setTimeout(function(){ b.textContent = 'Copy shareable link'; }, 1500);
    });
  });

  // Quick presets for the dates people actually count down to.
  var now = new Date();
  var year = now.getFullYear();
  function iso(y, m, d){ return y + '-' + pad(m) + '-' + pad(d); }
  function future(m, d){ var y = (new Date(year, m - 1, d) < now) ? year + 1 : year; return iso(y, m, d); }
  var PRESETS = [
    ['New Year', future(1, 1)],
    ['Christmas', future(12, 25)],
    ['Halloween', future(10, 31)],
    ['Next Friday', (function(){
      var t = new Date(now); t.setDate(t.getDate() + ((5 - t.getDay() + 7) % 7 || 7));
      return iso(t.getFullYear(), t.getMonth() + 1, t.getDate());
    })()]
  ];
  $('presets').innerHTML = PRESETS.map(function(p){
    return '<button type="button" class="pill" data-d="' + p[1] + '" data-n="' + p[0] + '">' + p[0] + '</button>';
  }).join('');
  $('presets').addEventListener('click', function(e){
    var b = e.target.closest('button[data-d]'); if (!b) return;
    $('date').value = b.getAttribute('data-d');
    $('name').value = b.getAttribute('data-n');
    $('time').value = '00:00';
    start();
  });

  // Restore a shared countdown from the URL.
  var q = new URLSearchParams(location.search);
  if (q.get('d')) {
    $('date').value = q.get('d');
    if (q.get('t')) $('time').value = q.get('t');
    if (q.get('n')) $('name').value = q.get('n');
    start();
  }
})();`,

  answerHeading: 'How the countdown is calculated',
  answer: `<p><strong>The countdown measures the real elapsed time between now and your target moment, in your own time zone.</strong> It updates every second and handles the awkward cases automatically: leap years, months of different lengths, and daylight saving changes are all absorbed because the calculation works on actual timestamps rather than counting calendar squares. If the date has already passed, it counts up instead of showing a negative number.</p>`,

  steps: [
    'Give your countdown a name — this appears in the label and in the shared link.',
    'Pick the date, and a time if it matters.',
    'The countdown starts immediately and ticks every second.',
    'Use <strong>Copy shareable link</strong> to send the same countdown to someone else.',
  ],

  sections: [
    {
      id: 'timezone',
      h2: 'A note on time zones',
      html: `<p>The countdown runs in the time zone of the device viewing it. That is usually what you want — a countdown to midnight on New Year's Eve should hit zero at midnight wherever you are.</p>
<p>It does mean that a shared link behaves slightly differently for someone in another country. If you are counting down to a specific global moment, such as a product launch or a live broadcast, say the time zone in the countdown's name so there is no ambiguity.</p>`,
    },
    {
      id: 'uses',
      h2: 'What people count down to',
      html: `<p>The most-searched countdowns follow a predictable rhythm through the year, but the useful ones tend to be personal.</p>
<ul>
<li><strong>Exams and deadlines</strong> — seeing days rather than weeks tends to concentrate the mind usefully.</li>
<li><strong>Weddings and holidays</strong> — a shared link is an easy thing to send round a group.</li>
<li><strong>Launches and go-lives</strong> — pair the countdown name with an explicit time zone.</li>
<li><strong>Milestones</strong> — a due date, a retirement, the end of a contract.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Does the countdown keep running if I close the page?', a: '<p>The display stops, but nothing is lost. Reopening the shared link recreates the same countdown, because the date is stored in the link rather than on a server.</p>' },
    { q: 'Can I share a countdown with someone?', a: '<p>Yes. Press "Copy shareable link" and send it. The date, time and name travel in the URL, so anyone who opens it sees the same countdown running in their own time zone.</p>' },
    { q: 'What happens after the date passes?', a: '<p>It counts up instead, showing how long ago the moment was. This is handy for anniversaries and "days since" milestones.</p>' },
    { q: 'Does it handle leap years and daylight saving?', a: '<p>Yes. The countdown works on real timestamps rather than calendar arithmetic, so leap days and clock changes are accounted for automatically.</p>' },
    { q: 'Is my countdown stored anywhere?', a: '<p>No. Everything lives in the page URL and in your browser. Nothing is sent to a server.</p>' },
  ],

  related: ['birthday-countdown', 'date-difference-calculator', 'age-calculator', 'sleep-calculator'],
};
