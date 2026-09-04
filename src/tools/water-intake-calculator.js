export default {
  slug: 'water-intake-calculator',
  category: 'health',
  title: 'Water Intake Calculator – How Much Should You Drink a Day',
  h1: 'Water Intake Calculator',
  cardText: 'A daily water target based on your weight, activity and climate.',
  description:
    'Free water intake calculator. Estimate how much water to drink each day based on your body weight, exercise and climate, and learn why the 8-glasses rule is a myth.',
  keywords: ['water intake calculator', 'how much water should i drink', 'daily water intake', 'hydration calculator'],
  updated: '2026-09-04',
  disclaimer: 'A general estimate. Kidney, heart and liver conditions change fluid needs significantly — follow medical advice.',
  lede: 'A rough daily target adjusted for your weight, how much you exercise, and the climate you live in.',

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
    <label for="weight">Body weight</label>
    <div class="input-group">
      <input type="number" id="weight" inputmode="decimal" min="20" max="400" step="0.5" value="70">
      <span class="addon" id="wunit">kg</span>
    </div>
  </div>
  <div class="field">
    <label for="exercise">Exercise per day</label>
    <div class="input-group">
      <input type="number" id="exercise" inputmode="numeric" min="0" max="360" step="15" value="30">
      <span class="addon">min</span>
    </div>
  </div>
  <div class="field">
    <label for="climate">Climate</label>
    <select id="climate">
      <option value="1">Temperate</option>
      <option value="1.1">Warm</option>
      <option value="1.2">Hot or humid</option>
      <option value="0.95">Cold</option>
    </select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Suggested daily fluid</div>
  <div class="result-value" id="total">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>From drinks</dt><dd id="drinks">—</dd></div>
    <div class="stat"><dt>From food</dt><dd id="food">—</dd></div>
    <div class="stat"><dt>Glasses (250 ml)</dt><dd id="glasses">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var metric = true;

  function calc(){
    var w = parseFloat($('weight').value);
    var ex = parseFloat($('exercise').value); if (!isFinite(ex) || ex < 0) ex = 0;
    var climate = parseFloat($('climate').value);
    if (!isFinite(w) || w <= 0) return;

    var kg = metric ? w : w * 0.45359237;

    // ~33 ml per kg is a widely used baseline, plus ~350 ml per 30 min of exercise.
    var base = kg * 33;
    var exercise = ex / 30 * 350;
    var total = (base + exercise) * climate;

    // Roughly 20% of daily fluid comes from food in a typical diet.
    var fromFood = total * 0.2;
    var fromDrinks = total - fromFood;

    if (metric) {
      $('total').textContent = (total / 1000).toFixed(1) + ' litres';
      $('drinks').textContent = (fromDrinks / 1000).toFixed(1) + ' L';
      $('food').textContent = (fromFood / 1000).toFixed(1) + ' L';
    } else {
      var oz = total / 29.5735295625;
      $('total').textContent = Math.round(oz) + ' fl oz';
      $('drinks').textContent = Math.round(oz * 0.8) + ' fl oz';
      $('food').textContent = Math.round(oz * 0.2) + ' fl oz';
    }
    $('glasses').textContent = Math.round(fromDrinks / 250);
    $('note').textContent = 'Baseline for your weight, plus ' + Math.round(exercise) +
      ' ml for exercise' + (climate !== 1 ? ', adjusted for climate' : '') +
      '. About a fifth of this normally comes from food.';
  }

  function setUnits(m){
    metric = m;
    $('u-metric').setAttribute('aria-pressed', String(m));
    $('u-imperial').setAttribute('aria-pressed', String(!m));
    $('wunit').textContent = m ? 'kg' : 'lb';
    $('weight').value = m
      ? (parseFloat($('weight').value) * 0.45359237).toFixed(0)
      : (parseFloat($('weight').value) / 0.45359237).toFixed(0);
    calc();
  }
  $('u-metric').addEventListener('click', function(){ if (!metric) setUnits(true); });
  $('u-imperial').addEventListener('click', function(){ if (metric) setUnits(false); });
  ['weight','exercise','climate'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'How much water do you actually need?',
  answer: `<p><strong>There is no single correct amount, and the "eight glasses a day" rule has no scientific origin.</strong> The US National Academies suggest a total daily fluid intake of about 3.7 litres for men and 2.7 litres for women — but that figure includes water from food and all other drinks, not eight extra glasses on top. Roughly 20% of most people's fluid comes from food. Thirst is a reliable guide for healthy adults, and pale straw-coloured urine is a better daily check than any calculation.</p>`,

  steps: [
    'Enter your body weight.',
    'Add how many minutes you typically exercise each day.',
    'Pick the climate you live in.',
    'Use the "from drinks" figure as your practical target — the rest comes from food.',
  ],

  sections: [
    {
      id: 'myth',
      h2: 'Where "8 glasses a day" came from',
      html: `<p>The rule appears to trace back to a 1945 US Food and Nutrition Board recommendation of about 2.5 litres of water a day. The very next sentence noted that <em>most of this quantity is contained in prepared foods</em> — and that sentence was steadily dropped as the advice was repeated.</p>
<p>A 2002 review in the <em>American Journal of Physiology</em> searched for evidence supporting the eight-glasses rule and found none. It has persisted because it is memorable, not because it is right.</p>
<p>This does not mean hydration is unimportant. It means the correct amount depends on your size, your activity, the temperature and what you eat — which is what the calculator above tries to reflect.</p>`,
    },
    {
      id: 'signs',
      h2: 'Better indicators than a number',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Sign</th><th>What it suggests</th></tr></thead>
<tbody>
<tr><td>Pale straw-coloured urine</td><td>Well hydrated</td></tr>
<tr><td>Dark yellow or amber urine</td><td>Drink more</td></tr>
<tr><td>Completely clear urine, frequently</td><td>Possibly drinking more than needed</td></tr>
<tr><td>Thirst</td><td>A normal, reliable prompt in healthy adults</td></tr>
<tr><td>Headache, fatigue, poor concentration</td><td>Can indicate mild dehydration, among many other causes</td></tr>
</tbody></table></div>
<p>Note that B vitamins and some medications turn urine bright yellow regardless of hydration, so use the colour test alongside how you feel rather than on its own.</p>`,
    },
    {
      id: 'sources',
      h2: 'It does not have to be water',
      html: `<p>All drinks contribute to hydration, including tea and coffee. The idea that caffeine dehydrates you is overstated: at habitual intakes the diuretic effect is mild and more than offset by the fluid in the drink itself.</p>
<p>Food contributes substantially too. Cucumber, lettuce and watermelon are over 90% water; soup, yoghurt and most fruit are well over half.</p>
<p>Two genuine cautions. Alcohol does have a meaningful diuretic effect, so alcoholic drinks are a net negative for hydration. And drinking far too much water too quickly can cause hyponatraemia — dangerously diluted blood sodium — which is rare but serious, and mostly affects endurance athletes.</p>`,
    },
  ],

  faq: [
    { q: 'How much water should I drink a day?', a: '<p>For most healthy adults, somewhere between 2 and 3.5 litres of total fluid, depending on body size, activity and climate. The calculator above gives a figure tailored to you, but thirst and urine colour are better day-to-day guides.</p>' },
    { q: 'Does coffee count towards hydration?', a: '<p>Yes. The diuretic effect of caffeine at normal intakes is small and does not offset the fluid in the drink. Tea and coffee both count.</p>' },
    { q: 'Can you drink too much water?', a: '<p>Yes, though it is rare. Consuming several litres in a short period can dilute blood sodium to dangerous levels, a condition called hyponatraemia. It mainly occurs in endurance events where people drink heavily without replacing electrolytes.</p>' },
    { q: 'Does drinking water help you lose weight?', a: '<p>Modestly. Water has no calories, so replacing sugary drinks helps considerably, and drinking before a meal slightly reduces intake in some studies. It is a useful habit, not a weight-loss mechanism in itself.</p>' },
    { q: 'How much extra should I drink when exercising?', a: '<p>Roughly 350–500 ml for every 30 minutes of activity, more in heat. For sessions over an hour, or heavy sweating, replacing electrolytes matters as well as fluid.</p>' },
  ],

  related: ['calorie-calculator', 'bmi-calculator', 'ideal-weight-calculator', 'sleep-calculator'],
};
