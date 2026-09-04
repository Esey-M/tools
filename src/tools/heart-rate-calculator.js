export default {
  slug: 'heart-rate-calculator',
  category: 'health',
  title: 'Heart Rate Zone Calculator – Training Zones by Age',
  h1: 'Heart Rate Zone Calculator',
  cardText: 'Your five training zones, from maximum heart rate or resting heart rate.',
  description:
    'Free heart rate zone calculator. Get your maximum heart rate and five training zones by age, plus the more accurate Karvonen method.',
  keywords: ['heart rate zones', 'max heart rate calculator', 'target heart rate', 'karvonen formula', 'training zones'],
  updated: '2026-09-04',
  disclaimer: 'Estimates from population formulas. If you have a heart condition or take medication affecting heart rate, ask your doctor.',
  lede: 'Enter your age for a quick estimate, or add your resting heart rate for the more accurate Karvonen calculation.',

  form: `
<div class="row">
  <div class="field">
    <label for="age">Age</label>
    <div class="input-group"><input type="number" id="age" inputmode="numeric" min="10" max="100" step="1" value="35"><span class="addon">years</span></div>
  </div>
  <div class="field">
    <label for="rest">Resting heart rate <span class="hint">(optional)</span></label>
    <div class="input-group"><input type="number" id="rest" inputmode="numeric" min="30" max="120" step="1" placeholder="60"><span class="addon">bpm</span></div>
    <span class="hint">Measure first thing in the morning, before getting up.</span>
  </div>
  <div class="field">
    <label for="formula">Max HR formula</label>
    <select id="formula">
      <option value="tanaka" selected>Tanaka — 208 − 0.7 × age</option>
      <option value="haskell">Haskell — 220 − age</option>
      <option value="gulati">Gulati — 206 − 0.88 × age (women)</option>
    </select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Estimated maximum heart rate</div>
  <div class="result-value" id="max">—</div>
  <div class="result-note" id="note"></div>
</div>

<div style="margin-top:20px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Your training zones</h2>
  <div id="zones" class="zone-list"></div>
</div>`,

  css: `
.zone-list{display:flex;flex-direction:column;gap:8px}
.zone{display:flex;align-items:center;gap:13px;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius);padding:12px 15px}
.zone .sw{width:5px;align-self:stretch;border-radius:3px;flex:none;min-height:38px}
.zone .z{flex:1;min-width:0}
.zone .z b{display:block;font-size:.95rem;font-weight:620}
.zone .z span{display:block;font-size:.83rem;color:var(--ink-3);margin-top:2px}
.zone .bpm{font-variant-numeric:tabular-nums;font-weight:660;font-size:1.02rem;white-space:nowrap}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var ZONES = [
    ['Zone 1 — Very light', 50, 60, 'Warm-up and recovery. You can hold a full conversation.', '#7a9e4f'],
    ['Zone 2 — Light', 60, 70, 'Builds aerobic base and fat oxidation. Most training should live here.', '#4caf7d'],
    ['Zone 3 — Moderate', 70, 80, 'Improves aerobic fitness. Talking becomes short sentences.', '#e8a33d'],
    ['Zone 4 — Hard', 80, 90, 'Raises lactate threshold. A few words at a time.', '#e07a4a'],
    ['Zone 5 — Maximum', 90, 100, 'Short intervals only. No talking at all.', '#d9534f']
  ];

  function calc(){
    var age = parseInt($('age').value, 10);
    var rest = parseInt($('rest').value, 10);
    if (!isFinite(age) || age < 10 || age > 100) return;

    var f = $('formula').value;
    var max = f === 'haskell' ? 220 - age
            : f === 'gulati'  ? 206 - 0.88 * age
            :                   208 - 0.7 * age;   // Tanaka
    max = Math.round(max);

    var useKarvonen = isFinite(rest) && rest >= 30 && rest < max;
    var reserve = useKarvonen ? max - rest : 0;

    $('max').textContent = max + ' bpm';
    $('note').textContent = useKarvonen
      ? 'Heart rate reserve is ' + reserve + ' bpm. Zones below use the Karvonen method, which accounts for your resting rate.'
      : 'Zones below are simple percentages of maximum. Add your resting heart rate for a more accurate calculation.';

    $('zones').innerHTML = ZONES.map(function(z){
      var lo = useKarvonen ? Math.round(reserve * z[1] / 100 + rest) : Math.round(max * z[1] / 100);
      var hi = useKarvonen ? Math.round(reserve * z[2] / 100 + rest) : Math.round(max * z[2] / 100);
      return '<div class="zone"><span class="sw" style="background:' + z[4] + '"></span>' +
        '<span class="z"><b>' + z[0] + '</b><span>' + z[3] + '</span></span>' +
        '<span class="bpm">' + lo + '–' + hi + '</span></div>';
    }).join('');
  }

  ['age','rest','formula'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'Why "220 minus your age" is not the best formula',
  answer: `<p><strong>The familiar 220 − age formula was never derived from research; it was an approximation noted in passing in 1970 and has a standard deviation of about 10–12 beats per minute.</strong> That means it can be 20 bpm out for a given individual. The Tanaka formula, <code>208 − 0.7 × age</code>, comes from a 2001 meta-analysis and predicts more accurately, particularly for people over 40 — where 220 − age systematically underestimates. For women specifically, the Gulati formula performs better still.</p>`,

  steps: [
    'Enter your age.',
    'If you know your resting heart rate, add it — this switches to the more accurate Karvonen method.',
    'Choose a formula. Tanaka is the sensible default.',
  ],

  sections: [
    {
      id: 'karvonen',
      h2: 'Why resting heart rate matters',
      html: `<p>Simple percentage zones ignore how fit you already are. Two people with the same maximum heart rate but resting rates of 45 and 75 bpm are in genuinely different physiological states at the same absolute heart rate.</p>
<p>The Karvonen method works from <strong>heart rate reserve</strong> — the gap between resting and maximum — and adds the resting rate back:</p>
<p><code>Target = ((Max − Resting) × intensity) + Resting</code></p>
<p>For a 35-year-old with a maximum of 184 and a resting rate of 60, Zone 2 (60–70%) works out to 134–147 bpm, rather than the 110–129 a plain percentage would suggest. That is a substantial difference, and the Karvonen figure is the one to train by.</p>`,
    },
    {
      id: 'zone2',
      h2: 'The case for training slower',
      html: `<p>Most recreational athletes train too hard on easy days and not hard enough on hard days, ending up in a mediocre middle. Endurance coaching has converged on the opposite: roughly 80% of training in Zone 2, 20% in Zones 4 and 5, and very little in between.</p>
<p>Zone 2 feels almost too easy — you should be able to hold a conversation in full sentences. It builds mitochondrial density and capillary networks, the adaptations that raise your ceiling, and it does so with far less fatigue than harder work.</p>
<p>If you are new to this, the honest sign you have it right is mild boredom.</p>`,
    },
    {
      id: 'resting',
      h2: 'What your resting heart rate says',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Resting heart rate</th><th>Typically indicates</th></tr></thead>
<tbody>
<tr><td>40–50 bpm</td><td>Well-trained endurance athlete</td></tr>
<tr><td>50–60 bpm</td><td>Good cardiovascular fitness</td></tr>
<tr><td>60–75 bpm</td><td>Normal for most adults</td></tr>
<tr><td>75–90 bpm</td><td>Higher end of normal; often improves with training</td></tr>
<tr><td>Over 100 bpm at rest</td><td>Tachycardia — worth discussing with a doctor</td></tr>
</tbody></table></div>
<p>Measure it before getting out of bed, over three mornings, and take the average. A resting rate that rises 5–10 bpm above your normal is a well-established early sign of overtraining, poor sleep or illness.</p>`,
    },
  ],

  faq: [
    { q: 'What is my maximum heart rate?', a: '<p>The calculator estimates it from your age. The only accurate way to know is a supervised maximal exercise test — individual variation around any formula is roughly ±10–12 bpm.</p>' },
    { q: 'Which max heart rate formula should I use?', a: '<p>Tanaka (208 − 0.7 × age) for most people, as it predicts better than 220 − age especially over 40. Women may find Gulati (206 − 0.88 × age) closer still.</p>' },
    { q: 'What is the fat burning zone?', a: '<p>At low intensities a higher <em>proportion</em> of energy comes from fat, but total calories burned is lower. For fat loss, total energy expenditure and diet matter far more than which zone you train in.</p>' },
    { q: 'Is it dangerous to exceed my maximum heart rate?', a: '<p>Reading above your estimated maximum usually means the estimate is low for you, not that something is wrong. That said, chest pain, dizziness or unusual breathlessness during exercise warrant stopping and seeing a doctor.</p>' },
    { q: 'Why does my watch give different zones?', a: '<p>Devices use different formulas and some estimate your maximum from your own recorded data, which is often better than any age formula. If your watch has seen you work genuinely hard, trust it over this calculator.</p>' },
  ],

  related: ['calorie-calculator', 'bmi-calculator', 'sleep-calculator', 'water-intake-calculator'],
};
