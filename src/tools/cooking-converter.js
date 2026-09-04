export default {
  slug: 'cooking-converter',
  category: 'converters',
  title: 'Cooking Measurement Converter – Cups to Grams and Millilitres',
  h1: 'Cooking Converter',
  cardText: 'Cups to grams, ounces to millilitres, and oven temperatures.',
  description:
    'Free cooking measurement converter. Convert cups to grams for common ingredients, plus spoons, ounces, millilitres and oven temperatures including gas marks.',
  keywords: ['cups to grams', 'cooking converter', 'baking conversion', 'tablespoon to ml', 'oven temperature conversion'],
  updated: '2026-09-04',
  lede: 'Cups measure volume, grams measure weight — so the conversion depends entirely on the ingredient. Pick yours below.',

  form: `
<div class="field">
  <span class="field-label" id="mode-label">What are you converting?</span>
  <div class="seg" role="group" aria-labelledby="mode-label" id="modes" style="flex-wrap:wrap">
    <button type="button" data-mode="weight" aria-pressed="true">Cups to grams</button>
    <button type="button" data-mode="volume">Volume only</button>
    <button type="button" data-mode="oven">Oven temperature</button>
  </div>
</div>

<div id="pane-weight">
  <div class="row">
    <div class="field">
      <label for="amount">Amount</label>
      <input type="number" id="amount" inputmode="decimal" step="any" min="0" value="1">
    </div>
    <div class="field">
      <label for="unit">Unit</label>
      <select id="unit">
        <option value="236.5882365" selected>US cup</option>
        <option value="250">Metric cup (250 ml)</option>
        <option value="14.78676478125">Tablespoon (US)</option>
        <option value="4.92892159375">Teaspoon (US)</option>
        <option value="118.29411825">Half cup</option>
        <option value="59.147059125">Quarter cup</option>
      </select>
    </div>
    <div class="field">
      <label for="ing">Ingredient</label>
      <select id="ing"></select>
    </div>
  </div>
  <div class="result" id="wout" aria-live="polite">
    <div class="result-label" id="wlbl">Weight</div>
    <div class="result-value" id="grams">—</div>
    <div class="result-note" id="wnote"></div>
    <dl class="result-grid">
      <div class="stat"><dt>Ounces</dt><dd id="oz">—</dd></div>
      <div class="stat"><dt>Millilitres</dt><dd id="ml">—</dd></div>
      <div class="stat"><dt>Tablespoons</dt><dd id="tbsp">—</dd></div>
    </dl>
  </div>
</div>

<div id="pane-volume" hidden>
  <div class="row">
    <div class="field">
      <label for="vamt">Amount</label>
      <input type="number" id="vamt" inputmode="decimal" step="any" min="0" value="1">
    </div>
    <div class="field">
      <label for="vfrom">From</label>
      <select id="vfrom"></select>
    </div>
    <div class="field">
      <label for="vto">To</label>
      <select id="vto"></select>
    </div>
  </div>
  <div class="result" id="vout" aria-live="polite">
    <div class="result-label">Result</div>
    <div class="result-value" id="vres">—</div>
    <div class="result-note" id="vnote"></div>
  </div>
</div>

<div id="pane-oven" hidden>
  <div class="row">
    <div class="field">
      <label for="oc">Celsius</label>
      <div class="input-group"><input type="number" id="oc" inputmode="decimal" step="5" value="180"><span class="addon">°C</span></div>
    </div>
    <div class="field">
      <label for="of">Fahrenheit</label>
      <div class="input-group"><input type="number" id="of" inputmode="decimal" step="5"><span class="addon">°F</span></div>
    </div>
    <div class="field">
      <label for="og">Gas mark</label>
      <input type="text" id="og" readonly style="background:var(--bg-sunken)">
    </div>
  </div>
  <div class="result" aria-live="polite">
    <div class="result-label">Fan / convection oven</div>
    <div class="result-value" id="fan" style="font-size:2.1rem">—</div>
    <div class="result-note">Fan ovens run hotter, so recipes usually call for about 20 °C less than a conventional oven.</div>
  </div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var mode = 'weight';

  // Grams per millilitre for common ingredients, as packed in normal home cooking.
  var ING = [
    ['Water', 1.00], ['Milk', 1.03], ['Plain flour', 0.53], ['Bread flour', 0.55],
    ['Self-raising flour', 0.53], ['Wholemeal flour', 0.51], ['Granulated sugar', 0.85],
    ['Caster sugar', 0.87], ['Brown sugar, packed', 0.93], ['Icing sugar', 0.51],
    ['Butter', 0.96], ['Vegetable oil', 0.92], ['Honey', 1.42], ['Maple syrup', 1.32],
    ['Rice, uncooked', 0.80], ['Rolled oats', 0.40], ['Cocoa powder', 0.42],
    ['Salt, table', 1.22], ['Chocolate chips', 0.72], ['Ground almonds', 0.40],
    ['Breadcrumbs, dry', 0.44], ['Cornflour', 0.48], ['Yoghurt', 1.03], ['Cream', 1.01]
  ];

  var VOL = [
    ['Millilitre', 1], ['Litre', 1000], ['Teaspoon (US)', 4.92892159375],
    ['Tablespoon (US)', 14.78676478125], ['Fluid ounce (US)', 29.5735295625],
    ['US cup', 236.5882365], ['Metric cup', 250], ['US pint', 473.176473],
    ['Imperial pint', 568.26125], ['US quart', 946.352946], ['US gallon', 3785.411784]
  ];

  var GAS = [[135,1],[150,2],[165,3],[180,4],[190,5],[200,6],[220,7],[230,8],[245,9]];

  function round(n){
    if (!isFinite(n)) return '—';
    if (n >= 100) return Math.round(n).toLocaleString('en-US');
    if (n >= 10) return (Math.round(n * 10) / 10).toString();
    return (Math.round(n * 100) / 100).toString();
  }

  $('ing').innerHTML = ING.map(function(i, idx){
    return '<option value="' + i[1] + '"' + (i[0] === 'Plain flour' ? ' selected' : '') + '>' + i[0] + '</option>';
  }).join('');
  $('vfrom').innerHTML = VOL.map(function(v, i){
    return '<option value="' + v[1] + '"' + (i === 5 ? ' selected' : '') + '>' + v[0] + '</option>';
  }).join('');
  $('vto').innerHTML = VOL.map(function(v, i){
    return '<option value="' + v[1] + '"' + (i === 0 ? ' selected' : '') + '>' + v[0] + '</option>';
  }).join('');

  function calcWeight(){
    var amt = parseFloat($('amount').value);
    var mlPer = parseFloat($('unit').value);
    var density = parseFloat($('ing').value);
    if (!isFinite(amt) || amt < 0) { $('grams').textContent = '—'; return; }
    var ml = amt * mlPer;
    var g = ml * density;
    $('grams').textContent = round(g) + ' g';
    $('oz').textContent = round(g / 28.349523125) + ' oz';
    $('ml').textContent = round(ml) + ' ml';
    $('tbsp').textContent = round(ml / 14.78676478125);
    var name = $('ing').options[$('ing').selectedIndex].text;
    $('wnote').textContent = amt + ' × ' + $('unit').options[$('unit').selectedIndex].text.toLowerCase() +
      ' of ' + name.toLowerCase() + ' weighs about ' + round(g) + ' g.';
  }

  function calcVolume(){
    var amt = parseFloat($('vamt').value);
    var from = parseFloat($('vfrom').value);
    var to = parseFloat($('vto').value);
    if (!isFinite(amt)) { $('vres').textContent = '—'; return; }
    var res = amt * from / to;
    $('vres').textContent = round(res) + ' ' + $('vto').options[$('vto').selectedIndex].text.toLowerCase();
    $('vnote').textContent = amt + ' ' + $('vfrom').options[$('vfrom').selectedIndex].text.toLowerCase() +
      ' = ' + round(res) + ' ' + $('vto').options[$('vto').selectedIndex].text.toLowerCase() + '.';
  }

  var busyOven = false;
  function calcOven(from){
    if (busyOven) return;
    busyOven = true;
    var c;
    if (from === 'c') c = parseFloat($('oc').value);
    else c = (parseFloat($('of').value) - 32) * 5 / 9;

    if (isFinite(c)) {
      if (from !== 'c') $('oc').value = Math.round(c);
      if (from !== 'f') $('of').value = Math.round(c * 9 / 5 + 32);
      var gas = '—';
      for (var i = 0; i < GAS.length; i++) {
        if (Math.abs(c - GAS[i][0]) <= 7) { gas = 'Gas ' + GAS[i][1]; break; }
      }
      if (gas === '—') gas = c < 128 ? 'Below gas 1' : c > 252 ? 'Above gas 9' : 'Between marks';
      $('og').value = gas;
      $('fan').textContent = Math.round(c - 20) + ' °C  /  ' + Math.round((c - 20) * 9 / 5 + 32) + ' °F';
    }
    busyOven = false;
  }

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-mode]'); if (!b) return;
    mode = b.getAttribute('data-mode');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    ['weight','volume','oven'].forEach(function(m){ $('pane-' + m).hidden = m !== mode; });
  });
  ['amount','unit','ing'].forEach(function(id){ $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calcWeight); });
  ['vamt','vfrom','vto'].forEach(function(id){ $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calcVolume); });
  $('oc').addEventListener('input', function(){ calcOven('c'); });
  $('of').addEventListener('input', function(){ calcOven('f'); });

  calcWeight(); calcVolume(); calcOven('c');
})();`,

  answerHeading: 'Why one cup is not one weight',
  answer: `<p><strong>A cup measures volume, so its weight depends entirely on what you put in it.</strong> A US cup of water weighs 237 g, a cup of plain flour about 125 g, and a cup of honey about 336 g — the same space, nearly three times the weight. This is why serious baking recipes give grams: scooping flour compacts it, and two cooks measuring "one cup of flour" can differ by 20% or more. A digital scale removes the problem entirely.</p>`,

  steps: [
    'Choose <strong>cups to grams</strong> for ingredient weights, <strong>volume only</strong> for liquid measures, or <strong>oven temperature</strong>.',
    'Enter the amount and pick the unit.',
    'For weights, select the ingredient — the conversion changes with it.',
  ],

  sections: [
    {
      id: 'common',
      h2: 'One US cup of common ingredients',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Ingredient</th><th>Grams</th><th>Ounces</th></tr></thead>
<tbody>
<tr><td>Water</td><td>237 g</td><td>8.3 oz</td></tr>
<tr><td>Plain flour</td><td>125 g</td><td>4.4 oz</td></tr>
<tr><td>Granulated sugar</td><td>201 g</td><td>7.1 oz</td></tr>
<tr><td>Brown sugar, packed</td><td>220 g</td><td>7.8 oz</td></tr>
<tr><td>Icing sugar</td><td>121 g</td><td>4.3 oz</td></tr>
<tr><td>Butter</td><td>227 g</td><td>8.0 oz</td></tr>
<tr><td>Honey</td><td>336 g</td><td>11.9 oz</td></tr>
<tr><td>Rolled oats</td><td>95 g</td><td>3.3 oz</td></tr>
<tr><td>Cocoa powder</td><td>99 g</td><td>3.5 oz</td></tr>
<tr><td>Rice, uncooked</td><td>189 g</td><td>6.7 oz</td></tr>
</tbody></table></div>
<p>These assume the spoon-and-level method: spoon the ingredient into the cup and level the top with a knife. Scooping directly from the bag compacts flour and can add 20–25%.</p>`,
    },
    {
      id: 'cups-differ',
      h2: 'Not all cups are the same size',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Cup</th><th>Millilitres</th><th>Used in</th></tr></thead>
<tbody>
<tr><td>US legal cup</td><td>240 ml</td><td>US nutrition labelling</td></tr>
<tr><td>US customary cup</td><td>236.6 ml</td><td>US recipes</td></tr>
<tr><td>Metric cup</td><td>250 ml</td><td>UK, Australia, New Zealand</td></tr>
<tr><td>Japanese cup</td><td>200 ml</td><td>Japanese recipes</td></tr>
</tbody></table></div>
<p>The Australian tablespoon is another trap: it holds 20 ml against the US and UK 15 ml, a 33% difference that matters for raising agents and salt.</p>`,
    },
    {
      id: 'oven',
      h2: 'Oven temperature chart',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Celsius</th><th>Fahrenheit</th><th>Gas mark</th><th>Fan oven</th><th>Description</th></tr></thead>
<tbody>
<tr><td>135 °C</td><td>275 °F</td><td>1</td><td>115 °C</td><td>Very cool</td></tr>
<tr><td>150 °C</td><td>300 °F</td><td>2</td><td>130 °C</td><td>Cool</td></tr>
<tr><td>165 °C</td><td>325 °F</td><td>3</td><td>145 °C</td><td>Warm</td></tr>
<tr><td>180 °C</td><td>350 °F</td><td>4</td><td>160 °C</td><td>Moderate</td></tr>
<tr><td>190 °C</td><td>375 °F</td><td>5</td><td>170 °C</td><td>Fairly hot</td></tr>
<tr><td>200 °C</td><td>400 °F</td><td>6</td><td>180 °C</td><td>Fairly hot</td></tr>
<tr><td>220 °C</td><td>425 °F</td><td>7</td><td>200 °C</td><td>Hot</td></tr>
<tr><td>230 °C</td><td>450 °F</td><td>8</td><td>210 °C</td><td>Very hot</td></tr>
</tbody></table></div>`,
    },
  ],

  faq: [
    { q: 'How many grams is a cup of flour?', a: '<p>About 125 g for plain flour, using the spoon-and-level method. Scooping straight from the bag compacts it and can give 150 g or more, which is why bread and cake recipes go wrong when converted carelessly.</p>' },
    { q: 'How many tablespoons in a cup?', a: '<p>Sixteen US tablespoons make one US cup. Note that Australian tablespoons are 20 ml rather than 15 ml, so an Australian cup is about 12.5 tablespoons.</p>' },
    { q: 'Why do my baking results vary with cup measures?', a: '<p>Because volume measurement of dry ingredients is inherently imprecise — how you fill the cup changes the weight substantially. Weighing removes this variability, which is why professional recipes are written in grams.</p>' },
    { q: 'How much cooler should a fan oven be?', a: '<p>Usually 20 °C lower than a conventional oven, since circulating air transfers heat more efficiently. Some manufacturers suggest reducing the time by about 10% instead.</p>' },
    { q: 'Is a US cup the same as a UK cup?', a: '<p>No. A US customary cup is 236.6 ml and a metric cup used in the UK and Australia is 250 ml — about 6% larger. Both are in the converter above.</p>' },
  ],

  related: ['unit-converter', 'temperature-converter', 'recipe-scaler', 'percentage-calculator'],
};
