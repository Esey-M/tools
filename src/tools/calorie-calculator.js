export default {
  slug: 'calorie-calculator',
  category: 'health',
  title: 'Calorie Calculator – Daily Needs to Maintain, Lose or Gain',
  h1: 'Calorie Calculator',
  cardText: 'Daily calories to maintain, lose or gain weight, from the Mifflin-St Jeor equation.',
  description:
    'Free calorie calculator. Work out your BMR and daily calorie needs from height, weight, age and activity level, with targets for losing or gaining weight.',
  keywords: ['calorie calculator', 'daily calorie needs', 'tdee calculator', 'bmr calculator', 'how many calories'],
  updated: '2026-09-04',
  disclaimer: 'An estimate from population equations. Individual metabolism varies by 10–15% either way.',
  lede: 'Enter your details to see your resting metabolic rate, your total daily burn, and what to eat to maintain, lose or gain weight.',

  form: `
<div class="field">
  <span class="field-label" id="unit-label">Units</span>
  <div class="seg" role="group" aria-labelledby="unit-label">
    <button type="button" id="u-metric" aria-pressed="true">Metric</button>
    <button type="button" id="u-imperial" aria-pressed="false">Imperial</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="sex">Sex</label>
    <select id="sex"><option value="f">Female</option><option value="m">Male</option></select>
  </div>
  <div class="field">
    <label for="age">Age</label>
    <div class="input-group"><input type="number" id="age" inputmode="numeric" min="15" max="100" step="1" value="30"><span class="addon">yrs</span></div>
  </div>
</div>

<div class="row" id="metric-in">
  <div class="field">
    <label for="cm">Height</label>
    <div class="input-group"><input type="number" id="cm" inputmode="decimal" min="120" max="230" step="0.5" value="170"><span class="addon">cm</span></div>
  </div>
  <div class="field">
    <label for="kg">Weight</label>
    <div class="input-group"><input type="number" id="kg" inputmode="decimal" min="30" max="300" step="0.5" value="70"><span class="addon">kg</span></div>
  </div>
</div>

<div class="row" id="imperial-in" hidden>
  <div class="field">
    <label for="ft">Height</label>
    <div class="input-group">
      <input type="number" id="ft" inputmode="numeric" min="3" max="8" value="5" aria-label="Feet"><span class="addon">ft</span>
      <input type="number" id="inch" inputmode="decimal" min="0" max="11.9" step="0.5" value="7" aria-label="Inches" style="border-radius:0;border-left:none"><span class="addon">in</span>
    </div>
  </div>
  <div class="field">
    <label for="lb">Weight</label>
    <div class="input-group"><input type="number" id="lb" inputmode="decimal" min="60" max="700" step="1" value="154"><span class="addon">lb</span></div>
  </div>
</div>

<div class="field">
  <label for="act">Activity level</label>
  <select id="act">
    <option value="1.2">Sedentary — desk job, little exercise</option>
    <option value="1.375" selected>Lightly active — exercise 1–3 days a week</option>
    <option value="1.55">Moderately active — exercise 3–5 days a week</option>
    <option value="1.725">Very active — hard exercise 6–7 days a week</option>
    <option value="1.9">Extremely active — physical job or twice-daily training</option>
  </select>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">To maintain your weight</div>
  <div class="result-value" id="maintain">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Lose 0.5 kg/wk</dt><dd id="lose1">—</dd></div>
    <div class="stat"><dt>Lose 1 kg/wk</dt><dd id="lose2">—</dd></div>
    <div class="stat"><dt>Gain 0.5 kg/wk</dt><dd id="gain1">—</dd></div>
    <div class="stat"><dt>BMR at rest</dt><dd id="bmr">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var metric = true;
  var kcal = function(n){ return Math.round(n).toLocaleString('en-US') + ' kcal'; };

  function values(){
    var age = parseFloat($('age').value);
    var cm, kg;
    if (metric) { cm = parseFloat($('cm').value); kg = parseFloat($('kg').value); }
    else {
      var ft = parseFloat($('ft').value), inch = parseFloat($('inch').value);
      if (!isFinite(inch)) inch = 0;
      cm = (ft * 12 + inch) * 2.54;
      kg = parseFloat($('lb').value) * 0.45359237;
    }
    return { age: age, cm: cm, kg: kg, male: $('sex').value === 'm', act: parseFloat($('act').value) };
  }

  function calc(){
    var v = values();
    if (!isFinite(v.age) || !isFinite(v.cm) || !isFinite(v.kg) || v.cm < 100 || v.kg < 20) return;

    // Mifflin-St Jeor: the equation most dietetic bodies now recommend.
    var bmr = 10 * v.kg + 6.25 * v.cm - 5 * v.age + (v.male ? 5 : -161);
    var tdee = bmr * v.act;

    // 1 kg of body fat is roughly 7,700 kcal, so 0.5 kg/week is ~550 kcal/day.
    $('maintain').textContent = kcal(tdee);
    $('bmr').textContent = kcal(bmr);
    $('lose1').textContent = kcal(Math.max(bmr * 0.85, tdee - 550));
    $('lose2').textContent = kcal(Math.max(bmr * 0.85, tdee - 1100));
    $('gain1').textContent = kcal(tdee + 550);
    $('note').textContent = 'Resting burn ' + kcal(bmr) + ', multiplied by ' + v.act + ' for your activity level.' +
      ((tdee - 1100) < bmr * 0.85 ? ' The faster loss target is capped — going below about 85% of your resting rate is not advisable.' : '');
  }

  function setUnits(m){
    metric = m;
    $('u-metric').setAttribute('aria-pressed', String(m));
    $('u-imperial').setAttribute('aria-pressed', String(!m));
    $('metric-in').hidden = !m;
    $('imperial-in').hidden = m;
    calc();
  }
  $('u-metric').addEventListener('click', function(){ setUnits(true); });
  $('u-imperial').addEventListener('click', function(){ setUnits(false); });
  ['sex','age','cm','kg','ft','inch','lb','act'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'How daily calorie needs are estimated',
  answer: `<p><strong>Your daily need is your resting metabolic rate multiplied by an activity factor.</strong> This tool uses the Mifflin–St Jeor equation, which most dietetic bodies now prefer over the older Harris–Benedict formula because it predicts resting energy expenditure more accurately in modern populations. For men: <code>10 × kg + 6.25 × cm − 5 × age + 5</code>. For women the final term is −161. That gives BMR, which is then multiplied by 1.2 to 1.9 depending on how much you move.</p>`,

  steps: [
    'Choose your units and enter age, height and weight.',
    'Pick the activity level that honestly matches a typical week — most people overestimate this.',
    'Read the maintenance figure, then the targets for losing or gaining.',
  ],

  sections: [
    {
      id: 'activity',
      h2: 'Choosing an activity level honestly',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Level</th><th>Multiplier</th><th>What it actually means</th></tr></thead>
<tbody>
<tr><td>Sedentary</td><td>1.2</td><td>Desk job, no deliberate exercise, under 5,000 steps a day</td></tr>
<tr><td>Lightly active</td><td>1.375</td><td>Light exercise 1–3 days a week, or a job on your feet</td></tr>
<tr><td>Moderately active</td><td>1.55</td><td>Moderate exercise 3–5 days a week</td></tr>
<tr><td>Very active</td><td>1.725</td><td>Hard exercise 6–7 days a week</td></tr>
<tr><td>Extremely active</td><td>1.9</td><td>Manual labour, or serious twice-daily training</td></tr>
</tbody></table></div>
<p>Overstating activity is the most common source of error, and it is easy to do: three gym sessions a week does not make someone "very active" if the other 165 hours are spent sitting. If your weight is not moving as this calculator predicts after three or four weeks, drop a level rather than doubting the arithmetic.</p>`,
    },
    {
      id: 'deficit',
      h2: 'What a sustainable deficit looks like',
      html: `<p>A kilogram of body fat stores roughly 7,700 kcal, so a deficit of 550 kcal a day predicts about 0.5 kg of loss per week. That prediction holds reasonably well in the short term and drifts over months, because a lighter body burns fewer calories and metabolic adaptation reduces expenditure further.</p>
<ul>
<li><strong>0.5–1% of body weight per week</strong> is the range most guidance considers sustainable.</li>
<li><strong>Do not go below about 85% of your BMR.</strong> Very low intakes cost you muscle as well as fat and are hard to maintain.</li>
<li><strong>Recalculate every 5 kg or so.</strong> Your maintenance figure falls as you lose weight, which is why plateaus appear.</li>
<li><strong>Protein protects muscle</strong> during a deficit. Around 1.6 g per kg of body weight is a common recommendation.</li>
</ul>`,
    },
    {
      id: 'limits',
      h2: 'Why the number is an estimate',
      html: `<p>Mifflin–St Jeor predicts measured resting energy expenditure within about 10% for roughly 80% of people. That means a genuine range of a few hundred calories either side of the figure shown.</p>
<p>The equation uses total body weight, so it overestimates for people carrying a lot of fat and underestimates for the very muscular — fat tissue is far less metabolically active than muscle. Thyroid function, medication, sleep and genetics all shift the real number too.</p>
<p>The practical approach: treat this as a starting point, eat at that level for two or three weeks while tracking honestly, and adjust based on what the scale actually does. Your own data beats any equation.</p>`,
    },
  ],

  faq: [
    { q: 'How many calories should I eat to lose weight?', a: '<p>Roughly 500–550 fewer than your maintenance figure for about 0.5 kg a week. The calculator shows this above. Larger deficits work faster but are harder to sustain and cost more muscle.</p>' },
    { q: 'What is the difference between BMR and TDEE?', a: '<p>BMR is what you would burn lying still all day. TDEE is that plus everything else — moving, digesting, exercising. TDEE is the number that matters for planning what to eat.</p>' },
    { q: 'Is 1,200 calories a day safe?', a: '<p>For most adults it is below BMR and too low to sustain. It is sometimes prescribed under medical supervision, but it is not an appropriate default and often backfires through muscle loss and rebound eating.</p>' },
    { q: 'Why am I not losing weight in a deficit?', a: '<p>Usually because intake is underestimated, activity is overestimated, or both — food logging routinely misses 20–30% of actual calories. Water retention can also mask fat loss for weeks. Give any change three to four weeks before judging it.</p>' },
    { q: 'Which formula is most accurate?', a: '<p>Mifflin–St Jeor for most people. Katch–McArdle can be better if you know your body fat percentage accurately, since it works from lean mass rather than total weight.</p>' },
  ],

  related: ['bmi-calculator', 'ideal-weight-calculator', 'body-fat-calculator', 'water-intake-calculator'],
};
