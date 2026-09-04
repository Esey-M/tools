export default {
  slug: 'bmi-calculator',
  category: 'health',
  title: 'BMI Calculator – Body Mass Index in Metric or Imperial',
  h1: 'BMI Calculator',
  cardText: 'Body mass index from your height and weight, with your healthy weight range.',
  description:
    'Free BMI calculator. Enter your height and weight in metric or imperial units to get your body mass index instantly, plus the healthy weight range for your height.',
  keywords: ['bmi calculator', 'body mass index', 'bmi chart', 'healthy weight calculator'],
  updated: '2026-09-04',
  disclaimer: 'BMI is a screening tool, not a diagnosis. Talk to a doctor about your individual health.',
  lede: 'Enter your height and weight to get your body mass index, what category it falls in, and the weight range considered healthy for your height.',

  form: `
<div class="field">
  <span class="field-label" id="unit-label">Units</span>
  <div class="seg" role="group" aria-labelledby="unit-label">
    <button type="button" id="u-metric" aria-pressed="true">Metric (cm / kg)</button>
    <button type="button" id="u-imperial" aria-pressed="false">Imperial (ft / lb)</button>
  </div>
</div>

<div id="metric-inputs">
  <div class="row">
    <div class="field">
      <label for="cm">Height</label>
      <div class="input-group">
        <input type="number" id="cm" inputmode="decimal" min="50" max="260" step="0.1" placeholder="170" autocomplete="off">
        <span class="addon">cm</span>
      </div>
    </div>
    <div class="field">
      <label for="kg">Weight</label>
      <div class="input-group">
        <input type="number" id="kg" inputmode="decimal" min="10" max="400" step="0.1" placeholder="68" autocomplete="off">
        <span class="addon">kg</span>
      </div>
    </div>
  </div>
</div>

<div id="imperial-inputs" hidden>
  <div class="row">
    <div class="field">
      <label for="ft">Height</label>
      <div class="input-group">
        <input type="number" id="ft" inputmode="numeric" min="1" max="8" step="1" placeholder="5" autocomplete="off" aria-label="Height, feet">
        <span class="addon">ft</span>
        <input type="number" id="inch" inputmode="decimal" min="0" max="11.9" step="0.1" placeholder="7" autocomplete="off" aria-label="Height, inches" style="border-radius:0;border-left:none">
        <span class="addon">in</span>
      </div>
    </div>
    <div class="field">
      <label for="lb">Weight</label>
      <div class="input-group">
        <input type="number" id="lb" inputmode="decimal" min="20" max="900" step="0.1" placeholder="150" autocomplete="off">
        <span class="addon">lb</span>
      </div>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Your BMI</div>
  <div class="result-value" id="bmi">—</div>
  <div class="result-note" id="cat"></div>
  <div class="bmi-scale" aria-hidden="true">
    <div class="bmi-bar">
      <span style="background:#5b9bd5;flex:18.5"></span>
      <span style="background:#4caf7d;flex:6.5"></span>
      <span style="background:#e8a33d;flex:5"></span>
      <span style="background:#d9534f;flex:10"></span>
    </div>
    <div class="bmi-pin" id="pin"><span></span></div>
    <div class="bmi-ticks"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>
  </div>
  <dl class="result-grid">
    <div class="stat"><dt>Healthy range</dt><dd id="range">—</dd></div>
    <div class="stat"><dt>Category</dt><dd id="cat2" style="font-size:1.05rem">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Fill in both fields to see your result.</p>`,

  css: `
.bmi-scale{margin-top:18px;position:relative}
.bmi-bar{display:flex;height:9px;border-radius:999px;overflow:hidden}
.bmi-bar span{display:block}
.bmi-ticks{display:flex;justify-content:space-between;font-size:.72rem;color:var(--ink-3);margin-top:5px;font-variant-numeric:tabular-nums}
.bmi-pin{position:absolute;top:-5px;left:0;transition:left .25s ease}
.bmi-pin span{display:block;width:3px;height:19px;border-radius:2px;background:var(--ink);box-shadow:0 0 0 2px var(--bg-raised)}`,

  js: `(function(){
  var metric = true;
  var $ = function(id){ return document.getElementById(id); };
  var els = { out:$('out'), bmi:$('bmi'), cat:$('cat'), cat2:$('cat2'), range:$('range'), pin:$('pin'), prompt:$('prompt') };

  function categoryOf(b){
    if (b < 18.5)  return ['Underweight', 'below the healthy range'];
    if (b < 25)    return ['Healthy weight', 'within the healthy range'];
    if (b < 30)    return ['Overweight', 'above the healthy range'];
    if (b < 35)    return ['Obesity class I', 'well above the healthy range'];
    if (b < 40)    return ['Obesity class II', 'well above the healthy range'];
    return ['Obesity class III', 'far above the healthy range'];
  }

  function num(id){ var v = parseFloat($(id).value); return isFinite(v) ? v : NaN; }

  function calc(){
    var m, kg;
    if (metric) {
      var cm = num('cm'); kg = num('kg');
      m = cm / 100;
    } else {
      var ft = num('ft'), inch = num('inch'); if (isNaN(inch)) inch = 0;
      var lb = num('lb');
      m = ((ft * 12) + inch) * 0.0254;
      kg = lb * 0.45359237;
    }
    if (!(m > 0.5) || !(kg > 0)) { els.out.hidden = true; els.prompt.hidden = false; return; }

    var bmi = kg / (m * m);
    if (!isFinite(bmi) || bmi > 200) { els.out.hidden = true; return; }

    var c = categoryOf(bmi);
    els.bmi.textContent = bmi.toFixed(1);
    els.cat.textContent = 'That is ' + c[1] + ' for your height.';
    els.cat2.textContent = c[0];

    // Healthy weight range = BMI 18.5–24.9 at this height.
    var lo = 18.5 * m * m, hi = 24.9 * m * m;
    els.range.textContent = metric
      ? lo.toFixed(1) + '–' + hi.toFixed(1) + ' kg'
      : (lo / 0.45359237).toFixed(0) + '–' + (hi / 0.45359237).toFixed(0) + ' lb';

    // Pin position across a 15–40 scale.
    var pct = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));
    els.pin.style.left = 'calc(' + pct.toFixed(1) + '% - 1.5px)';

    els.out.hidden = false; els.prompt.hidden = true;
  }

  function setUnits(useMetric){
    metric = useMetric;
    $('u-metric').setAttribute('aria-pressed', String(useMetric));
    $('u-imperial').setAttribute('aria-pressed', String(!useMetric));
    $('metric-inputs').hidden = !useMetric;
    $('imperial-inputs').hidden = useMetric;
    try { localStorage.setItem('cp-units', useMetric ? 'metric' : 'imperial'); } catch(e){}
    calc();
  }

  $('u-metric').addEventListener('click', function(){ setUnits(true); });
  $('u-imperial').addEventListener('click', function(){ setUnits(false); });
  ['cm','kg','ft','inch','lb'].forEach(function(id){ $(id).addEventListener('input', calc); });

  try { if (localStorage.getItem('cp-units') === 'imperial') setUnits(false); } catch(e){}
})();`,

  answerHeading: 'What BMI actually measures',
  answer: `<p><strong>Body mass index (BMI) is your weight divided by the square of your height</strong> — a single number that estimates whether your weight is in a healthy range for someone of your height. A BMI between 18.5 and 24.9 is classed as healthy weight, 25 to 29.9 as overweight, and 30 or above as obesity. BMI does not measure body fat directly and does not account for muscle, bone density, or where fat is stored, so it is a starting point for a conversation with a doctor rather than a verdict on your health.</p>`,

  steps: [
    'Choose <strong>Metric</strong> if you know your height in centimetres and weight in kilograms, or <strong>Imperial</strong> for feet, inches and pounds.',
    'Type your height. In imperial, fill in feet and inches separately.',
    'Type your weight. Your BMI appears as soon as both fields have a value.',
    'Read the category and the healthy weight range shown for your height.',
  ],

  sections: [
    {
      id: 'chart',
      h2: 'BMI categories chart',
      html: `<p>These are the World Health Organization cut-offs used for adults aged 20 and over, and they are the same ones this calculator applies.</p>
<div class="table-scroll"><table>
<thead><tr><th>BMI</th><th>Category</th><th>What it generally suggests</th></tr></thead>
<tbody>
<tr><td>Below 18.5</td><td>Underweight</td><td>May indicate undernutrition; worth discussing with a doctor</td></tr>
<tr><td>18.5 – 24.9</td><td>Healthy weight</td><td>Lowest average risk of weight-related conditions</td></tr>
<tr><td>25.0 – 29.9</td><td>Overweight</td><td>Somewhat raised risk of type 2 diabetes and heart disease</td></tr>
<tr><td>30.0 – 34.9</td><td>Obesity class I</td><td>Moderately raised risk</td></tr>
<tr><td>35.0 – 39.9</td><td>Obesity class II</td><td>High risk</td></tr>
<tr><td>40.0 and above</td><td>Obesity class III</td><td>Very high risk</td></tr>
</tbody></table></div>
<p>Children and teenagers are assessed differently, using age- and sex-specific percentiles rather than these fixed numbers.</p>`,
    },
    {
      id: 'formula',
      h2: 'The BMI formula',
      html: `<p>There is one formula, expressed two ways depending on your units.</p>
<p><strong>Metric:</strong> <code>BMI = weight in kg ÷ (height in metres)²</code></p>
<p><strong>Imperial:</strong> <code>BMI = (weight in lb ÷ (height in inches)²) × 703</code></p>
<p>Worked example: someone 170 cm tall weighing 68 kg has a height of 1.70 m. Squaring that gives 2.89. Then 68 ÷ 2.89 = <strong>23.5</strong>, which falls in the healthy weight category.</p>
<p>The 703 in the imperial version is just the conversion factor that makes pounds and inches produce the same number as kilograms and metres.</p>`,
    },
    {
      id: 'limitations',
      h2: 'Where BMI gets it wrong',
      html: `<p>BMI is popular because it needs only two easily measured numbers, but that simplicity is also its weakness.</p>
<ul>
<li><strong>It cannot tell muscle from fat.</strong> Athletes and heavily muscled people often land in the overweight or obese range while carrying very little fat.</li>
<li><strong>It ignores fat distribution.</strong> Fat around the abdomen carries more health risk than fat on the hips and thighs, and BMI treats them identically. Waist circumference or waist-to-height ratio captures this better.</li>
<li><strong>It shifts with age.</strong> Older adults lose muscle and bone, so the same BMI can mean more body fat at 70 than at 30.</li>
<li><strong>The cut-offs were derived largely from European populations.</strong> Several health bodies recommend lower thresholds for people of South Asian, Chinese and other Asian descent, where risk rises at a lower BMI.</li>
<li><strong>It does not apply during pregnancy</strong> or to children, who need growth-chart percentiles instead.</li>
</ul>
<p>A useful rule: treat BMI as one reading among several, alongside waist measurement, blood pressure, blood sugar and how you actually feel.</p>`,
    },
  ],

  faq: [
    { q: 'What is a good BMI?', a: '<p>For most adults, a BMI between 18.5 and 24.9 is considered the healthy range. That said, "good" depends on the person — a muscular athlete at BMI 27 and a sedentary person at BMI 27 have very different health profiles.</p>' },
    { q: 'Is BMI different for men and women?', a: '<p>No. The formula and the category thresholds are identical for adult men and women. Women do carry more body fat than men at the same BMI on average, which is one reason BMI alone is an incomplete picture.</p>' },
    { q: 'How do I calculate BMI by hand?', a: '<p>In metric, divide your weight in kilograms by your height in metres squared. In imperial, divide your weight in pounds by your height in inches squared, then multiply by 703.</p>' },
    { q: 'Does BMI work for children?', a: '<p>Not in this form. Children and teenagers are compared against age- and sex-specific percentile charts, because healthy body composition changes rapidly during growth. Ask a paediatrician or use a dedicated child BMI percentile tool.</p>' },
    { q: 'Should I use a lower BMI threshold if I am of Asian descent?', a: '<p>Several health authorities, including the WHO, suggest that health risks rise at a lower BMI in many Asian populations, with overweight sometimes set at 23 rather than 25. Your doctor can advise which thresholds apply to you.</p>' },
    { q: 'Is my data sent anywhere?', a: '<p>No. The calculation runs entirely in your browser. Your height and weight are never uploaded, stored on a server, or shared.</p>' },
  ],

  related: ['ideal-weight-calculator', 'body-fat-calculator', 'calorie-calculator', 'age-calculator'],
};
