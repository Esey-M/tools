export default {
  slug: 'body-fat-calculator',
  category: 'health',
  title: 'Body Fat Calculator – US Navy Tape Measure Method',
  h1: 'Body Fat Calculator',
  cardText: 'Estimate body fat percentage from tape measurements, no calipers needed.',
  description:
    'Free body fat calculator using the US Navy tape method. Estimate body fat percentage from height, neck, waist and hip measurements, with category ranges.',
  keywords: ['body fat calculator', 'body fat percentage', 'navy body fat', 'how to measure body fat', 'lean body mass'],
  updated: '2026-09-04',
  disclaimer: 'A tape estimate with roughly ±3–4% error. Not a substitute for a DEXA scan or medical assessment.',
  lede: 'Uses the US Navy circumference method — a tape measure and four numbers. More informative than BMI, and free.',

  form: `
<div class="field">
  <span class="field-label" id="unit-label">Units</span>
  <div class="seg" role="group" aria-labelledby="unit-label">
    <button type="button" id="u-metric" aria-pressed="true">Metric (cm)</button>
    <button type="button" id="u-imperial" aria-pressed="false">Imperial (in)</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="sex">Sex</label>
    <select id="sex"><option value="m">Male</option><option value="f">Female</option></select>
  </div>
  <div class="field">
    <label for="height">Height</label>
    <div class="input-group"><input type="number" id="height" inputmode="decimal" step="0.5" value="178"><span class="addon" id="u1">cm</span></div>
  </div>
  <div class="field">
    <label for="weight">Weight <span class="hint">(optional)</span></label>
    <div class="input-group"><input type="number" id="weight" inputmode="decimal" step="0.5" value="80"><span class="addon" id="u4">kg</span></div>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="neck">Neck</label>
    <div class="input-group"><input type="number" id="neck" inputmode="decimal" step="0.5" value="38"><span class="addon" id="u2">cm</span></div>
    <span class="hint">Just below the larynx, tape sloping slightly down at the front.</span>
  </div>
  <div class="field">
    <label for="waist">Waist</label>
    <div class="input-group"><input type="number" id="waist" inputmode="decimal" step="0.5" value="88"><span class="addon" id="u3">cm</span></div>
    <span class="hint" id="waist-hint">At the navel, relaxed, after breathing out.</span>
  </div>
  <div class="field" id="hip-field" hidden>
    <label for="hip">Hips</label>
    <div class="input-group"><input type="number" id="hip" inputmode="decimal" step="0.5" value="98"><span class="addon" id="u5">cm</span></div>
    <span class="hint">At the widest point.</span>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Estimated body fat</div>
  <div class="result-value" id="bf">—</div>
  <div class="result-note" id="cat"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Category</dt><dd id="catname" style="font-size:1.05rem">—</dd></div>
    <div class="stat"><dt>Fat mass</dt><dd id="fatmass">—</dd></div>
    <div class="stat"><dt>Lean mass</dt><dd id="leanmass">—</dd></div>
  </dl>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var metric = true;

  var CATS_M = [[6,'Essential fat'],[14,'Athletic'],[18,'Fitness'],[25,'Average'],[100,'Above average']];
  var CATS_F = [[14,'Essential fat'],[21,'Athletic'],[25,'Fitness'],[32,'Average'],[100,'Above average']];

  function cm(v){ return metric ? v : v * 2.54; }

  function calc(){
    var female = $('sex').value === 'f';
    var h = cm(parseFloat($('height').value));
    var neck = cm(parseFloat($('neck').value));
    var waist = cm(parseFloat($('waist').value));
    var hip = female ? cm(parseFloat($('hip').value)) : 0;

    if (!isFinite(h) || !isFinite(neck) || !isFinite(waist) || (female && !isFinite(hip))) return;

    // US Navy circumference method, metric form.
    var bf;
    if (female) {
      if (waist + hip - neck <= 0) { showErr('Check your measurements — waist plus hips must exceed neck.'); return; }
      bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
    } else {
      if (waist - neck <= 0) { showErr('Check your measurements — waist must be larger than neck.'); return; }
      bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
    }

    if (!isFinite(bf) || bf <= 0 || bf > 70) { showErr('Those measurements do not produce a sensible result. Check them and try again.'); return; }
    $('err').hidden = true;

    $('bf').textContent = bf.toFixed(1) + '%';

    var cats = female ? CATS_F : CATS_M;
    var name = cats[cats.length - 1][1];
    for (var i = 0; i < cats.length; i++) { if (bf < cats[i][0]) { name = cats[i][1]; break; } }
    $('catname').textContent = name;
    $('cat').textContent = 'Using the US Navy circumference method, accurate to roughly ±3–4%.';

    var w = parseFloat($('weight').value);
    if (isFinite(w) && w > 0) {
      var fat = w * bf / 100;
      var unit = metric ? ' kg' : ' lb';
      $('fatmass').textContent = fat.toFixed(1) + unit;
      $('leanmass').textContent = (w - fat).toFixed(1) + unit;
    } else {
      $('fatmass').textContent = '—';
      $('leanmass').textContent = '—';
    }
  }

  function showErr(msg){
    $('err').hidden = false; $('err').textContent = msg;
    $('bf').textContent = '—'; $('catname').textContent = '—';
  }

  function setUnits(m){
    if (m === metric) return;
    metric = m;
    $('u-metric').setAttribute('aria-pressed', String(m));
    $('u-imperial').setAttribute('aria-pressed', String(!m));
    ['u1','u2','u3','u5'].forEach(function(id){ $(id).textContent = m ? 'cm' : 'in'; });
    $('u4').textContent = m ? 'kg' : 'lb';
    ['height','neck','waist','hip'].forEach(function(id){
      var v = parseFloat($(id).value);
      if (isFinite(v)) $(id).value = (m ? v * 2.54 : v / 2.54).toFixed(1);
    });
    var w = parseFloat($('weight').value);
    if (isFinite(w)) $('weight').value = (m ? w * 0.45359237 : w / 0.45359237).toFixed(1);
    calc();
  }

  $('u-metric').addEventListener('click', function(){ setUnits(true); });
  $('u-imperial').addEventListener('click', function(){ setUnits(false); });
  $('sex').addEventListener('change', function(){
    var female = this.value === 'f';
    $('hip-field').hidden = !female;
    $('waist-hint').textContent = female
      ? 'At the narrowest point, usually just above the navel.'
      : 'At the navel, relaxed, after breathing out.';
    calc();
  });
  ['height','neck','waist','hip','weight'].forEach(function(id){ $(id).addEventListener('input', calc); });
  calc();
})();`,

  answerHeading: 'How the tape method works',
  answer: `<p><strong>The US Navy method estimates body fat from the difference between your waist and neck circumference, adjusted for height.</strong> The logic is that neck size tracks frame size while waist size tracks stored fat, so the gap between them is informative. For women the hip measurement is added, since fat distribution differs. It is accurate to roughly ±3–4% against a DEXA scan — considerably better than BMI, considerably worse than a proper scan, and free.</p>`,

  steps: [
    'Choose your units and enter your height.',
    'Measure your <strong>neck</strong> just below the larynx, with the tape sloping slightly downward at the front.',
    'Measure your <strong>waist</strong> at the navel, relaxed, after breathing out. Women measure at the narrowest point.',
    'Women also measure <strong>hips</strong> at the widest point. Add your weight for fat and lean mass figures.',
  ],

  sections: [
    {
      id: 'ranges',
      h2: 'Body fat ranges',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Category</th><th>Men</th><th>Women</th></tr></thead>
<tbody>
<tr><td>Essential fat</td><td>2–5%</td><td>10–13%</td></tr>
<tr><td>Athletes</td><td>6–13%</td><td>14–20%</td></tr>
<tr><td>Fitness</td><td>14–17%</td><td>21–24%</td></tr>
<tr><td>Average</td><td>18–24%</td><td>25–31%</td></tr>
<tr><td>Above average</td><td>25%+</td><td>32%+</td></tr>
</tbody></table></div>
<p>Women carry more essential fat than men — it is required for hormonal function, not surplus. Sustained very low body fat in women is associated with menstrual disruption and reduced bone density, which is why the female ranges sit roughly 10 points higher throughout.</p>`,
    },
    {
      id: 'measuring',
      h2: 'Getting consistent measurements',
      html: `<p>The method is far more useful for tracking change than for a single absolute number, and consistency is what makes tracking work.</p>
<ul>
<li><strong>Measure at the same time of day</strong>, ideally first thing in the morning before eating.</li>
<li><strong>Do not pull the tape tight.</strong> It should sit flat against the skin without compressing it.</li>
<li><strong>Breathe out normally</strong> and relax your stomach. Holding your breath or bracing invalidates the reading.</li>
<li><strong>Measure three times and average</strong> — a centimetre of tape placement changes the result by about a percentage point.</li>
<li><strong>Use the same tape</strong> each time. Cloth tapes stretch over months.</li>
</ul>`,
    },
    {
      id: 'methods',
      h2: 'How the methods compare',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Method</th><th>Typical error</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>DEXA scan</td><td>±1–2%</td><td>$50–150 per scan</td></tr>
<tr><td>Hydrostatic weighing</td><td>±2%</td><td>Specialist facility</td></tr>
<tr><td>Skinfold calipers, skilled operator</td><td>±3%</td><td>Cheap, needs practice</td></tr>
<tr><td>US Navy tape method</td><td>±3–4%</td><td>Free</td></tr>
<tr><td>Bathroom scale (bioimpedance)</td><td>±5–8%</td><td>Built into many scales</td></tr>
<tr><td>BMI as a fat proxy</td><td>Very poor for individuals</td><td>Free</td></tr>
</tbody></table></div>
<p>Bioimpedance scales are heavily affected by hydration, which is why the same scale can report a two-point change overnight. If you use one, weigh in under identical conditions every time and watch the trend rather than the number.</p>`,
    },
  ],

  faq: [
    { q: 'How accurate is the Navy body fat method?', a: '<p>Roughly ±3–4% compared with a DEXA scan for most people. It is less accurate at the extremes — very lean or very heavy — and most useful for tracking change over time rather than as an absolute figure.</p>' },
    { q: 'Why does it need my neck measurement?', a: '<p>Neck circumference correlates with frame size and stores relatively little fat, so it acts as a baseline. The difference between waist and neck is what carries the signal.</p>' },
    { q: 'What is a healthy body fat percentage?', a: '<p>Broadly 14–24% for men and 21–31% for women. Below the essential fat threshold — about 5% for men and 13% for women — is not sustainable or healthy.</p>' },
    { q: 'Why do women need a hip measurement?', a: '<p>Because women typically store more fat on the hips and thighs, which the waist measurement alone would miss. The female formula accounts for both.</p>' },
    { q: 'Is this better than BMI?', a: '<p>For estimating body fat, considerably. BMI cannot distinguish muscle from fat at all, whereas the tape method responds directly to where fat is actually stored.</p>' },
  ],

  related: ['bmi-calculator', 'ideal-weight-calculator', 'calorie-calculator', 'heart-rate-calculator'],
};
