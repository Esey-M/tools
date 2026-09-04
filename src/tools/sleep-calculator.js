export default {
  slug: 'sleep-calculator',
  category: 'health',
  title: 'Sleep Calculator – Best Times to Sleep and Wake Up',
  h1: 'Sleep Calculator',
  cardText: 'Bedtimes and wake times that land between sleep cycles, not in the middle of one.',
  description:
    'Free sleep calculator. Work out when to go to bed for a given wake-up time, or when to wake if you sleep now, based on 90-minute sleep cycles.',
  keywords: ['sleep calculator', 'what time should i go to bed', 'sleep cycle calculator', 'best time to wake up'],
  updated: '2026-09-04',
  disclaimer: 'Cycle lengths vary between people and between nights. Treat these as guides, not schedules.',
  lede: 'Waking at the end of a cycle feels far better than waking in the middle of one. Pick a wake time and the tool works backwards.',

  form: `
<div class="field">
  <span class="field-label" id="mode-label">What do you want to know?</span>
  <div class="seg" role="group" aria-labelledby="mode-label" id="modes" style="flex-wrap:wrap">
    <button type="button" data-mode="wake" aria-pressed="true">When to go to bed</button>
    <button type="button" data-mode="bed">When to wake up</button>
  </div>
</div>

<div class="field" id="f-wake">
  <label for="waketime">I need to wake up at</label>
  <input type="time" id="waketime" value="07:00">
</div>

<div class="field" id="f-bed" hidden>
  <label for="bedtime">I am going to bed at</label>
  <input type="time" id="bedtime">
  <span class="hint">Defaults to now.</span>
</div>

<div class="field">
  <label for="latency">Time it takes you to fall asleep</label>
  <div class="input-group">
    <input type="number" id="latency" inputmode="numeric" min="0" max="90" step="5" value="15">
    <span class="addon">min</span>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="lbl">Best times to go to bed</div>
  <div class="sleep-times" id="times"></div>
  <div class="result-note" id="note"></div>
</div>`,

  css: `
.sleep-times{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));margin-top:10px}
.sleep-slot{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:13px 15px}
.sleep-slot.best{border-color:var(--accent);background:var(--accent-soft)}
.sleep-slot .t{font-size:1.42rem;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.sleep-slot .d{font-size:.8rem;color:var(--ink-3);margin-top:3px}
.sleep-slot.best .d{color:var(--accent-ink)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var mode = 'wake';
  var CYCLE = 90;   // minutes

  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  function parseTime(v){
    var m = /^(\\d{1,2}):(\\d{2})$/.exec(v || '');
    if (!m) return null;
    return { h: +m[1], m: +m[2] };
  }

  function fmt(mins){
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h < 12 ? 'am' : 'pm';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + pad(m) + ' ' + suffix;
  }

  function hoursLabel(cycles){
    var h = cycles * 1.5;
    return cycles + (cycles === 1 ? ' cycle' : ' cycles') + ' · ' + (h % 1 === 0 ? h : h.toFixed(1)) + ' hours';
  }

  function calc(){
    var latency = parseInt($('latency').value, 10);
    if (!isFinite(latency) || latency < 0) latency = 0;

    var slots = [];
    if (mode === 'wake') {
      var w = parseTime($('waketime').value);
      if (!w) return;
      var wakeMins = w.h * 60 + w.m;
      // Six cycles first — it is the most commonly recommended amount.
      [6, 5, 4, 3].forEach(function(c){
        slots.push({ mins: wakeMins - c * CYCLE - latency, cycles: c });
      });
      $('lbl').textContent = 'Go to bed at one of these times';
      $('note').textContent = 'To wake at ' + fmt(wakeMins) + ', allowing ' + latency +
        ' minutes to fall asleep. Five or six cycles suits most adults.';
    } else {
      var b = parseTime($('bedtime').value);
      if (!b) return;
      var bedMins = b.h * 60 + b.m;
      [4, 5, 6].forEach(function(c){
        slots.push({ mins: bedMins + latency + c * CYCLE, cycles: c });
      });
      $('lbl').textContent = 'Wake up at one of these times';
      $('note').textContent = 'Going to bed at ' + fmt(bedMins) + ' and taking ' + latency +
        ' minutes to fall asleep.';
    }

    $('times').innerHTML = slots.map(function(s){
      var best = s.cycles === 5 || s.cycles === 6;
      return '<div class="sleep-slot' + (best ? ' best' : '') + '">' +
        '<div class="t">' + fmt(s.mins) + '</div>' +
        '<div class="d">' + hoursLabel(s.cycles) + '</div></div>';
    }).join('');
  }

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-mode]'); if (!b) return;
    mode = b.getAttribute('data-mode');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('f-wake').hidden = mode !== 'wake';
    $('f-bed').hidden = mode === 'wake';
    calc();
  });
  ['waketime','bedtime','latency'].forEach(function(id){ $(id).addEventListener('input', calc); });

  var now = new Date();
  $('bedtime').value = pad(now.getHours()) + ':' + pad(now.getMinutes());
  calc();
})();`,

  answerHeading: 'Why sleep cycles matter more than hours',
  answer: `<p><strong>Sleep runs in cycles of roughly 90 minutes, and waking at the end of one feels dramatically better than waking in the middle.</strong> Each cycle moves from light sleep through deep sleep and into REM. Being woken during deep sleep produces sleep inertia — that heavy, disoriented grogginess that can take half an hour to shake off. Six cycles is nine hours, five is seven and a half; both usually feel better than an awkward eight hours that interrupts a cycle partway through.</p>`,

  steps: [
    'Choose whether you know your <strong>wake-up time</strong> or your <strong>bedtime</strong>.',
    'Enter the time.',
    'Adjust how long you take to fall asleep — fifteen minutes is typical for adults.',
    'Pick one of the suggested times. The highlighted options are the five and six cycle nights.',
  ],

  sections: [
    {
      id: 'cycle',
      h2: 'What happens in a sleep cycle',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Stage</th><th>Share of the night</th><th>What it does</th></tr></thead>
<tbody>
<tr><td>N1 — light</td><td>~5%</td><td>The transition into sleep; easily woken</td></tr>
<tr><td>N2 — light</td><td>~45%</td><td>Body temperature drops, heart rate slows</td></tr>
<tr><td>N3 — deep</td><td>~25%</td><td>Physical repair, immune function, growth hormone</td></tr>
<tr><td>REM</td><td>~25%</td><td>Dreaming, memory consolidation, emotional processing</td></tr>
</tbody></table></div>
<p>The composition shifts across the night. Deep sleep dominates the early cycles, while REM periods lengthen towards morning — which is why cutting sleep short costs you disproportionately more REM, and why a late night followed by an early alarm affects mood so noticeably.</p>`,
    },
    {
      id: 'how-much',
      h2: 'How much sleep you actually need',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Age</th><th>Recommended</th><th>Cycles</th></tr></thead>
<tbody>
<tr><td>Teenagers (14–17)</td><td>8–10 hours</td><td>6–7</td></tr>
<tr><td>Adults (18–64)</td><td>7–9 hours</td><td>5–6</td></tr>
<tr><td>Older adults (65+)</td><td>7–8 hours</td><td>5</td></tr>
</tbody></table></div>
<p>The 90-minute cycle is an average, not a constant. Individual cycles range from about 70 to 120 minutes and vary across the night and between people, so treat these times as a good starting guess rather than a precise schedule.</p>
<p>If you consistently wake before your alarm feeling rested, you have found your natural rhythm — that is a better signal than any calculator.</p>`,
    },
    {
      id: 'better-sleep',
      h2: 'Things that help more than timing',
      html: `<ul>
<li><strong>A consistent wake time</strong>, including weekends. Regularity anchors your body clock more effectively than any single night's duration.</li>
<li><strong>Light in the morning, dim light at night.</strong> Daylight within an hour of waking is one of the strongest available cues for your circadian rhythm.</li>
<li><strong>No caffeine after early afternoon.</strong> Caffeine has a half-life of around five hours, so a 4pm coffee still has a quarter of its dose active at midnight.</li>
<li><strong>A cool, dark room.</strong> Core temperature needs to fall for sleep to begin; around 18 °C suits most people.</li>
<li><strong>Get up if you cannot sleep.</strong> Lying awake trains your brain to associate bed with wakefulness. Leave, do something dull in dim light, return when drowsy.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'How long is a sleep cycle?', a: '<p>About 90 minutes on average, though real cycles range from roughly 70 to 120 minutes and vary through the night. The first cycles tend to be shorter and richer in deep sleep.</p>' },
    { q: 'Is it better to sleep 6 hours or 7.5?', a: '<p>Seven and a half, for most adults — it is five complete cycles and sits inside the recommended range. Six hours is four cycles and is below what most people need, even if it feels manageable.</p>' },
    { q: 'Why do I feel worse after a long sleep?', a: '<p>Usually because the alarm landed in the middle of a deep sleep stage rather than at the end of a cycle. Sleep inertia after deep sleep can last 15 to 30 minutes regardless of total duration.</p>' },
    { q: 'How long should it take to fall asleep?', a: '<p>Ten to twenty minutes is typical. Falling asleep in under five minutes consistently can indicate significant sleep deprivation; regularly taking more than thirty is worth discussing with a doctor.</p>' },
    { q: 'Can I catch up on sleep at the weekend?', a: '<p>Partially. A long weekend lie-in recovers some of the deficit, but it also shifts your body clock later and makes Monday harder. A consistent schedule beats catching up.</p>' },
  ],

  related: ['age-calculator', 'countdown-timer', 'water-intake-calculator', 'calorie-calculator'],
};
