export default {
  slug: 'ideal-weight-calculator',
  category: 'health',
  title: 'Ideal Weight Calculator – Four Formulas Compared',
  h1: 'Ideal Weight Calculator',
  cardText: 'A healthy weight range for your height, from four established formulas.',
  description:
    'Free ideal weight calculator. See your target weight from the Devine, Robinson, Miller and Hamwi formulas plus the healthy BMI range, and why they disagree.',
  keywords: ['ideal weight calculator', 'healthy weight for height', 'ideal body weight', 'target weight'],
  updated: '2026-09-04',
  disclaimer: 'These are population formulas, not personal targets. A doctor can advise on what is right for you.',
  lede: 'Enter your height and the tool shows what four widely used formulas suggest, alongside the healthy BMI range — which is usually the most useful of the five.',

  form: `
<div class="field">
  <span class="field-label" id="unit-label">Units</span>
  <div class="seg" role="group" aria-labelledby="unit-label">
    <button type="button" id="u-metric" aria-pressed="true">Metric</button>
    <button type="button" id="u-imperial" aria-pressed="false">Imperial</button>
  </div>
</div>

<div class="row">
  <div class="field" id="f-metric">
    <label for="cm">Height</label>
    <div class="input-group">
      <input type="number" id="cm" inputmode="decimal" min="120" max="230" step="0.5" placeholder="170">
      <span class="addon">cm</span>
    </div>
  </div>
  <div class="field" id="f-imperial" hidden>
    <label for="ft">Height</label>
    <div class="input-group">
      <input type="number" id="ft" inputmode="numeric" min="3" max="8" step="1" placeholder="5" aria-label="Feet">
      <span class="addon">ft</span>
      <input type="number" id="inch" inputmode="decimal" min="0" max="11.9" step="0.5" placeholder="7" aria-label="Inches" style="border-radius:0;border-left:none">
      <span class="addon">in</span>
    </div>
  </div>
  <div class="field">
    <label for="sex">Sex</label>
    <select id="sex">
      <option value="f">Female</option>
      <option value="m">Male</option>
    </select>
    <span class="hint">Most of these formulas were defined separately for men and women.</span>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Healthy weight range for your height</div>
  <div class="result-value" id="range">—</div>
  <div class="result-note">Based on a BMI of 18.5 to 24.9 — the range most clinicians actually use.</div>
  <dl class="result-grid">
    <div class="stat"><dt>Devine</dt><dd id="devine">—</dd></div>
    <div class="stat"><dt>Robinson</dt><dd id="robinson">—</dd></div>
    <div class="stat"><dt>Miller</dt><dd id="miller">—</dd></div>
    <div class="stat"><dt>Hamwi</dt><dd id="hamwi">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter your height to see the results.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var metric = true;

  function heightCm(){
    if (metric) return parseFloat($('cm').value);
    var ft = parseFloat($('ft').value);
    var inch = parseFloat($('inch').value); if (!isFinite(inch)) inch = 0;
    if (!isFinite(ft)) return NaN;
    return (ft * 12 + inch) * 2.54;
  }

  function fmt(kg){
    return metric
      ? kg.toFixed(1) + ' kg'
      : (kg / 0.45359237).toFixed(0) + ' lb';
  }

  function calc(){
    var cm = heightCm();
    if (!isFinite(cm) || cm < 100 || cm > 250) { $('out').hidden = true; $('prompt').hidden = false; return; }

    var male = $('sex').value === 'm';
    var inchesOver5ft = Math.max(0, (cm / 2.54) - 60);

    // The four classic ideal-body-weight formulas, all in kilograms.
    var devine   = (male ? 50   : 45.5) + 2.3   * inchesOver5ft;
    var robinson = (male ? 52   : 49)   + 1.9   * inchesOver5ft;
    var miller   = (male ? 56.2 : 53.1) + 1.41  * inchesOver5ft;
    var hamwi    = (male ? 48   : 45.5) + (male ? 2.7 : 2.2) * inchesOver5ft;

    $('devine').textContent = fmt(devine);
    $('robinson').textContent = fmt(robinson);
    $('miller').textContent = fmt(miller);
    $('hamwi').textContent = fmt(hamwi);

    var m = cm / 100;
    var lo = 18.5 * m * m, hi = 24.9 * m * m;
    $('range').textContent = metric
      ? lo.toFixed(1) + '–' + hi.toFixed(1) + ' kg'
      : (lo / 0.45359237).toFixed(0) + '–' + (hi / 0.45359237).toFixed(0) + ' lb';

    $('out').hidden = false; $('prompt').hidden = true;
  }

  function setUnits(useMetric){
    metric = useMetric;
    $('u-metric').setAttribute('aria-pressed', String(useMetric));
    $('u-imperial').setAttribute('aria-pressed', String(!useMetric));
    $('f-metric').hidden = !useMetric;
    $('f-imperial').hidden = useMetric;
    calc();
  }

  $('u-metric').addEventListener('click', function(){ setUnits(true); });
  $('u-imperial').addEventListener('click', function(){ setUnits(false); });
  ['cm','ft','inch','sex'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
})();`,

  answerHeading: 'Is there really an ideal weight?',
  answer: `<p><strong>No single number is "ideal" — which is why this tool shows a range and four competing formulas that disagree with each other.</strong> The classic formulas (Devine, Robinson, Miller, Hamwi) were not designed to define health at all. Devine's, the most cited, was published in 1974 to calculate drug dosages, and its numbers were chosen for pharmacological convenience rather than derived from outcome data. The healthy BMI range shown at the top is broader, better evidenced, and closer to what a clinician would actually use.</p>`,

  steps: [
    'Choose metric or imperial units.',
    'Enter your height.',
    'Select the sex the formulas should use — most were defined separately for men and women.',
    'Read the BMI-based range first; treat the four formulas as historical context.',
  ],

  sections: [
    {
      id: 'formulas',
      h2: 'Where the four formulas came from',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Formula</th><th>Year</th><th>Originally for</th><th>Base + per inch over 5 ft</th></tr></thead>
<tbody>
<tr><td>Hamwi</td><td>1964</td><td>Diabetes diet planning</td><td>48 kg / 45.5 kg + 2.7 / 2.2 kg</td></tr>
<tr><td>Devine</td><td>1974</td><td>Drug dosage calculation</td><td>50 kg / 45.5 kg + 2.3 kg</td></tr>
<tr><td>Robinson</td><td>1983</td><td>Revision of Devine</td><td>52 kg / 49 kg + 1.9 kg</td></tr>
<tr><td>Miller</td><td>1983</td><td>Revision of Devine</td><td>56.2 kg / 53.1 kg + 1.41 kg</td></tr>
</tbody></table></div>
<p>All four share a structure — a base weight at five feet, plus a fixed amount per additional inch — and none was derived from mortality or morbidity data. They diverge most at the extremes of height, which is exactly where they are least reliable.</p>`,
    },
    {
      id: 'better',
      h2: 'Measures that tell you more',
      html: `<ul>
<li><strong>Waist-to-height ratio.</strong> Keep your waist under half your height. It is a single measurement, needs no formula, and predicts metabolic risk better than any weight-for-height figure because it captures where fat is stored.</li>
<li><strong>Body composition.</strong> Two people at identical weights can have very different proportions of muscle and fat. A DEXA scan or even calipers say more than the scale.</li>
<li><strong>How your weight has changed.</strong> A stable weight with good fitness markers is a better sign than hitting a target number after rapid loss or gain.</li>
<li><strong>Blood pressure, fasting glucose, lipids.</strong> These measure what weight is only a proxy for.</li>
</ul>
<p>If you take one thing from this page: a range is more honest than a number, and the tape measure around your waist is more informative than any of the four formulas above.</p>`,
    },
  ],

  faq: [
    { q: 'Which ideal weight formula is most accurate?', a: '<p>None of them is validated against health outcomes, so "accurate" does not really apply. The healthy BMI range is better evidenced and is what most clinicians work from. Devine is the most widely cited, but only because of its role in drug dosing.</p>' },
    { q: 'Why do the formulas give different answers?', a: '<p>Because they were written for different purposes, by different authors, decades apart. Miller assumes a higher base weight but adds less per inch, so it diverges sharply from Devine for tall people.</p>' },
    { q: 'Does frame size matter?', a: '<p>Some older charts adjusted by wrist or elbow width, typically by around 10% either way. The evidence base is weak, and modern guidance has largely dropped it in favour of waist measurement.</p>' },
    { q: 'Do these apply to athletes?', a: '<p>Poorly. Formulas based only on height cannot account for muscle mass, so a well-trained athlete will often exceed every figure shown here while carrying very little fat.</p>' },
    { q: 'What about children?', a: '<p>These formulas are for adults only. Children are assessed against age- and sex-specific growth percentiles, which a paediatrician can interpret.</p>' },
  ],

  related: ['bmi-calculator', 'body-fat-calculator', 'calorie-calculator', 'water-intake-calculator'],
};
