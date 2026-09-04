export default {
  slug: 'step-counter',
  category: 'health',
  title: 'Step Counter – Log Steps and Convert to Distance',
  h1: 'Step Counter',
  cardText: 'Log daily steps, convert to distance and calories, and track a weekly goal.',
  description:
    'Free step tracker and converter. Log daily steps, convert them to distance and calories from your height and weight, and track progress against a goal.',
  keywords: ['step counter', 'steps to miles', 'steps to km', 'how many steps a day', 'step tracker'],
  updated: '2026-09-04',
  disclaimer: 'Distance and calorie figures are estimates from stride and weight, not measurements.',
  lede: 'Enter today’s steps to see the distance and rough calories. Log each day to track a weekly goal — everything stays in your browser.',

  form: `
<div class="row">
  <div class="field">
    <label for="steps">Steps today</label>
    <input type="number" id="steps" inputmode="numeric" min="0" max="100000" step="100" value="7500">
  </div>
  <div class="field">
    <label for="height">Your height</label>
    <div class="input-group"><input type="number" id="height" inputmode="decimal" min="120" max="230" step="1" value="170"><span class="addon">cm</span></div>
  </div>
  <div class="field">
    <label for="weight">Your weight</label>
    <div class="input-group"><input type="number" id="weight" inputmode="decimal" min="30" max="300" step="1" value="70"><span class="addon">kg</span></div>
  </div>
  <div class="field">
    <label for="goal">Daily goal</label>
    <input type="number" id="goal" inputmode="numeric" min="1000" max="50000" step="500" value="8000">
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Distance today</div>
  <div class="result-value" id="dist">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Calories burned</dt><dd id="cals">—</dd></div>
    <div class="stat"><dt>Stride length</dt><dd id="stride">—</dd></div>
    <div class="stat"><dt>Active minutes</dt><dd id="mins">—</dd></div>
    <div class="stat"><dt>Goal</dt><dd id="pct">—</dd></div>
  </dl>
</div>

<div class="btn-row" style="margin-top:18px">
  <button type="button" class="btn" id="log">Log today</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear history</button>
</div>

<div id="history" style="margin-top:22px"></div>`,

  css: `
.sc-week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:10px}
.sc-day{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius-sm);padding:9px 4px;
  text-align:center}
.sc-day.met{border-color:var(--accent);background:var(--accent-soft)}
.sc-day b{display:block;font-size:.95rem;font-weight:660;font-variant-numeric:tabular-nums}
.sc-day span{display:block;font-size:.68rem;color:var(--ink-3);margin-top:2px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-steps';
  var log = {};

  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function iso(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function calc(){
    var steps = parseFloat($('steps').value) || 0;
    var height = parseFloat($('height').value) || 170;
    var weight = parseFloat($('weight').value) || 70;
    var goal = parseFloat($('goal').value) || 8000;

    // Stride is about 41.5% of height for women and 41.5-43% for men; 0.415 is a
    // widely used unisex approximation.
    var stride = height * 0.415 / 100;          // metres
    var km = steps * stride / 1000;

    // ~0.5 kcal per kg per km walked at a moderate pace.
    var cals = km * weight * 0.5;
    // Around 100 steps a minute is the usual definition of moderate intensity.
    var mins = steps / 100;

    $('dist').textContent = km.toFixed(2) + ' km  ·  ' + (km / 1.609344).toFixed(2) + ' miles';
    $('cals').textContent = Math.round(cals) + ' kcal';
    $('stride').textContent = (stride * 100).toFixed(0) + ' cm';
    $('mins').textContent = Math.round(mins) + ' min';
    $('pct').textContent = Math.round(steps / goal * 100) + '%';
    $('note').textContent = steps >= goal
      ? 'Goal met — ' + (steps - goal).toLocaleString('en-US') + ' steps over.'
      : (goal - steps).toLocaleString('en-US') + ' steps to go, about ' +
        ((goal - steps) * stride / 1000).toFixed(1) + ' km.';
  }

  function renderHistory(){
    var days = [];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    for (var i = 6; i >= 0; i--) {
      var d = new Date(today); d.setDate(d.getDate() - i);
      days.push(d);
    }
    var goal = parseFloat($('goal').value) || 8000;
    var logged = days.filter(function(d){ return log[iso(d)]; });

    $('history').innerHTML = '<h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3)">Last 7 days</h2>' +
      '<div class="sc-week">' + days.map(function(d){
        var v = log[iso(d)] || 0;
        return '<div class="sc-day' + (v >= goal ? ' met' : '') + '">' +
          '<b>' + (v ? (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v) : '–') + '</b>' +
          '<span>' + d.toLocaleDateString('en-US', { weekday: 'narrow' }) + '</span></div>';
      }).join('') + '</div>' +
      '<p class="hint" style="margin-top:9px">' +
      (logged.length
        ? logged.length + ' of 7 days logged · average ' +
          Math.round(logged.reduce(function(a, d){ return a + log[iso(d)]; }, 0) / logged.length).toLocaleString('en-US') + ' steps'
        : 'Nothing logged yet — press “Log today” to start.') + '</p>';
  }

  $('log').addEventListener('click', function(){
    log[iso(new Date())] = parseFloat($('steps').value) || 0;
    try { localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) {}
    renderHistory();
    var b = $('log'); b.textContent = 'Logged'; setTimeout(function(){ b.textContent = 'Log today'; }, 1400);
  });
  $('clear').addEventListener('click', function(){
    if (!confirm('Clear your step history?')) return;
    log = {};
    try { localStorage.removeItem(KEY); } catch (e) {}
    renderHistory();
  });
  ['steps','height','weight','goal'].forEach(function(id){
    $(id).addEventListener('input', function(){ calc(); renderHistory(); });
  });

  try { log = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { log = {}; }
  calc(); renderHistory();
})();`,

  answerHeading: 'How many steps a day do you actually need?',
  answer: `<p><strong>The 10,000 figure came from a 1965 Japanese pedometer marketing campaign, not from research.</strong> The device was called <em>manpo-kei</em> — literally "10,000 step meter" — and the number was chosen because the character for 10,000 resembles a walking person. Actual studies find most of the mortality benefit arrives well before that: a large 2019 study of older women found risk levelled off around 7,500 steps, and analyses in younger adults show gains continuing to roughly 8,000–10,000 before flattening. Going from 3,000 to 6,000 helps far more than going from 9,000 to 12,000.</p>`,

  steps: [
    'Enter today’s step count from your phone or watch.',
    'Add your height and weight so stride and calories are personalised.',
    'Press <strong>Log today</strong> to record it against the week.',
  ],

  sections: [
    {
      id: 'conversion',
      h2: 'Steps to distance',
      html: `<p>Stride length is roughly 41.5% of your height, which is what this calculator uses. Actual stride varies with speed and terrain, so treat the distance as an estimate rather than a measurement.</p>
<div class="table-scroll"><table>
<thead><tr><th>Height</th><th>Stride</th><th>Steps per km</th><th>Steps per mile</th></tr></thead>
<tbody>
<tr><td>155 cm</td><td>64 cm</td><td>1,555</td><td>2,502</td></tr>
<tr><td>165 cm</td><td>68 cm</td><td>1,460</td><td>2,350</td></tr>
<tr><td>175 cm</td><td>73 cm</td><td>1,377</td><td>2,216</td></tr>
<tr><td>185 cm</td><td>77 cm</td><td>1,303</td><td>2,096</td></tr>
</tbody></table></div>
<p>The common rule of thumb — 2,000 steps to a mile — is close enough for most people of average height.</p>`,
    },
    {
      id: 'counts',
      h2: 'Why your phone and watch disagree',
      html: `<p>Step counters infer steps from acceleration patterns, and they infer differently.</p>
<ul>
<li><strong>A phone in your pocket</strong> misses steps when you leave it on a desk, and adds phantom ones when you shake a bag.</li>
<li><strong>A wrist device</strong> counts arm movement, so pushing a trolley or holding a rail undercounts badly, while chopping vegetables overcounts.</li>
<li><strong>Neither is calibrated.</strong> Validation studies find consumer devices commonly out by 5–15% in either direction.</li>
</ul>
<p>Consistency matters more than accuracy. If you always use the same device, the trend is meaningful even if the absolute number is not.</p>`,
    },
  ],

  faq: [
    { q: 'How many steps are in a mile?', a: '<p>Roughly 2,000 for a person of average height, though it ranges from about 2,100 for a tall person to 2,500 for a shorter one. The table above shows it by height.</p>' },
    { q: 'Is 10,000 steps a day necessary?', a: '<p>No. The figure came from a 1965 pedometer marketing campaign. Research suggests most of the health benefit accrues by around 7,500–8,000 steps, with gains flattening after that.</p>' },
    { q: 'How many calories does walking burn?', a: '<p>Around 0.5 kcal per kilogram of body weight per kilometre. A 70 kg person walking 5 km burns roughly 175 kcal — considerably less than most people assume.</p>' },
    { q: 'Is my step history private?', a: '<p>Yes. It is stored in your browser and never uploaded. Clearing your browser data clears it.</p>' },
    { q: 'Does this connect to my fitness tracker?', a: '<p>No. Enter the number manually from whatever device you use. Connecting would require accounts and API access, which this deliberately avoids.</p>' },
  ],

  related: ['calorie-calculator', 'heart-rate-calculator', 'bmi-calculator', 'habit-tracker'],
};
