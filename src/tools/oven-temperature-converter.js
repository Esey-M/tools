export default {
  slug: 'oven-temperature-converter',
  category: 'converters',
  title: 'Oven Temperature Converter – °C, °F, Gas Mark and Fan',
  h1: 'Oven Temperature Converter',
  cardText: 'Celsius, Fahrenheit, gas mark and fan oven temperatures, all at once.',
  description:
    'Free oven temperature converter. Convert between Celsius, Fahrenheit, gas mark and fan oven settings, with a full chart and the fan oven adjustment explained.',
  keywords: ['oven temperature conversion', 'gas mark to celsius', 'fan oven conversion', '180c to f', 'oven temp chart'],
  updated: '2026-09-04',
  lede: 'Type into any box. Fan oven temperatures are worked out for you, since almost every recipe is written for a conventional oven.',

  form: `
<div class="row">
  <div class="field">
    <label for="c">Conventional °C</label>
    <div class="input-group"><input type="number" id="c" inputmode="decimal" step="5" value="180"><span class="addon">°C</span></div>
  </div>
  <div class="field">
    <label for="f">Fahrenheit</label>
    <div class="input-group"><input type="number" id="f" inputmode="decimal" step="5"><span class="addon">°F</span></div>
  </div>
  <div class="field">
    <label for="fan">Fan / convection °C</label>
    <div class="input-group"><input type="number" id="fan" inputmode="decimal" step="5"><span class="addon">°C</span></div>
  </div>
  <div class="field">
    <label for="gas">Gas mark</label>
    <input type="text" id="gas" readonly style="background:var(--bg-sunken)">
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="lbl">Equivalent settings</div>
  <div class="result-value" id="main" style="font-size:1.55rem">—</div>
  <div class="result-note" id="note"></div>
</div>

<div style="margin-top:20px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:9px">Common settings</h2>
  <div class="pills" id="quick" style="justify-content:flex-start"></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var busy = false;

  // [conventional °C, °F, gas mark, description]
  var TABLE = [
    [110, 225, '1/4', 'Very cool — meringues, slow drying'],
    [120, 250, '1/2', 'Very cool'],
    [140, 275, '1', 'Cool — slow casseroles'],
    [150, 300, '2', 'Cool'],
    [160, 325, '3', 'Warm — rich fruit cakes'],
    [180, 350, '4', 'Moderate — most cakes and biscuits'],
    [190, 375, '5', 'Moderately hot'],
    [200, 400, '6', 'Fairly hot — roasting'],
    [220, 425, '7', 'Hot — pastry, roast potatoes'],
    [230, 450, '8', 'Very hot'],
    [240, 475, '9', 'Very hot — pizza, bread'],
    [260, 500, '10', 'Maximum on most domestic ovens']
  ];

  function gasFor(c){
    var best = null, diff = Infinity;
    TABLE.forEach(function(r){
      var d = Math.abs(c - r[0]);
      if (d < diff) { diff = d; best = r; }
    });
    return diff <= 8 ? best : null;
  }

  function sync(from){
    if (busy) return;
    busy = true;
    var c;
    if (from === 'c') c = parseFloat($('c').value);
    else if (from === 'f') c = (parseFloat($('f').value) - 32) * 5 / 9;
    else c = parseFloat($('fan').value) + 20;

    if (!isFinite(c)) {
      ['c','f','fan'].forEach(function(id){ if (id !== from) $(id).value = ''; });
      $('gas').value = ''; $('main').textContent = '—'; $('note').textContent = '';
      busy = false; return;
    }

    if (from !== 'c') $('c').value = Math.round(c);
    if (from !== 'f') $('f').value = Math.round(c * 9 / 5 + 32);
    if (from !== 'fan') $('fan').value = Math.round(c - 20);

    var match = gasFor(c);
    $('gas').value = match ? 'Gas ' + match[2] : (c < 105 ? 'Below gas ¼' : c > 268 ? 'Above gas 10' : 'Between marks');

    $('main').textContent = Math.round(c) + '°C  ·  ' + Math.round(c * 9 / 5 + 32) + '°F  ·  fan ' +
      Math.round(c - 20) + '°C  ·  ' + (match ? 'gas ' + match[2] : 'no exact gas mark');
    $('note').textContent = match ? match[3] : 'Between the standard gas marks — round to the nearer one.';
    busy = false;
  }

  ['c','f','fan'].forEach(function(id){ $(id).addEventListener('input', function(){ sync(id); }); });

  $('quick').innerHTML = TABLE.filter(function(r){ return r[0] >= 140; }).map(function(r){
    return '<button type="button" class="pill" data-c="' + r[0] + '">' + r[0] + '°C · gas ' + r[2] + '</button>';
  }).join('');
  $('quick').addEventListener('click', function(e){
    var b = e.target.closest('button[data-c]'); if (!b) return;
    $('c').value = b.getAttribute('data-c'); sync('c');
  });

  sync('c');
})();`,

  answerHeading: 'The fan oven adjustment',
  answer: `<p><strong>A fan oven should be set about 20 °C lower than a recipe written for a conventional oven.</strong> Circulating air transfers heat to food considerably faster, so 180 °C in a fan oven cooks roughly like 200 °C conventional. Almost every recipe and cookbook quotes conventional temperatures unless it says otherwise, which is why cakes brown too quickly and edges dry out when the number is followed literally in a fan oven. Some manufacturers suggest reducing the time by around 10% instead — do one or the other, not both.</p>`,

  steps: [
    'Type the temperature your recipe gives into the matching box.',
    'Read across for the other scales.',
    'If your oven has a fan, use the fan figure.',
  ],

  sections: [
    {
      id: 'chart',
      h2: 'Full oven temperature chart',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Conventional °C</th><th>Fan °C</th><th>°F</th><th>Gas mark</th><th>Description</th></tr></thead>
<tbody>
<tr><td>110</td><td>90</td><td>225</td><td>¼</td><td>Very cool — meringues</td></tr>
<tr><td>140</td><td>120</td><td>275</td><td>1</td><td>Cool — slow casseroles</td></tr>
<tr><td>150</td><td>130</td><td>300</td><td>2</td><td>Cool</td></tr>
<tr><td>160</td><td>140</td><td>325</td><td>3</td><td>Warm — rich fruit cakes</td></tr>
<tr><td>180</td><td>160</td><td>350</td><td>4</td><td>Moderate — most baking</td></tr>
<tr><td>190</td><td>170</td><td>375</td><td>5</td><td>Moderately hot</td></tr>
<tr><td>200</td><td>180</td><td>400</td><td>6</td><td>Fairly hot — roasting</td></tr>
<tr><td>220</td><td>200</td><td>425</td><td>7</td><td>Hot — pastry, roast potatoes</td></tr>
<tr><td>230</td><td>210</td><td>450</td><td>8</td><td>Very hot</td></tr>
<tr><td>240</td><td>220</td><td>475</td><td>9</td><td>Very hot — pizza, bread</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'accuracy',
      h2: 'Your oven is probably lying',
      html: `<p>Domestic ovens are routinely out by 10–20 °C, and some by considerably more. The thermostat measures air near the sensor, not the temperature where your food sits.</p>
<p>A cheap oven thermometer, left on the middle shelf, is the single most useful piece of baking equipment most people do not own. Preheat to 180 °C, wait twenty minutes, and see what it actually reads. If it runs 15 °C cool, you now know to set 195 °C — which explains a great deal about cakes that never quite bake through.</p>
<p>Other things worth knowing: ovens have hot spots, so rotate trays halfway through; opening the door drops the temperature by 20–30 °C and it takes minutes to recover; and the top shelf runs hotter than the bottom in a conventional oven, while a fan oven is much more even, which is its real advantage.</p>`,
    },
  ],

  faq: [
    { q: 'What is 180°C in Fahrenheit?', a: '<p>350 °F, which is gas mark 4 — the single most common baking temperature. In a fan oven, use 160 °C.</p>' },
    { q: 'What is gas mark 6?', a: '<p>200 °C conventional, 180 °C fan, or 400 °F. It is the usual roasting temperature.</p>' },
    { q: 'Should I lower the temperature or the time for a fan oven?', a: '<p>Lower the temperature by 20 °C, which is what almost all recipes assume. Reducing the time by about 10% instead also works. Doing both will undercook the dish.</p>' },
    { q: 'Why do my cakes brown too fast?', a: '<p>Most often a fan oven set to the conventional temperature. Failing that, an oven running hot — check with a thermometer — or a tin placed too high in the oven.</p>' },
    { q: 'Are gas marks the same everywhere?', a: '<p>The scale is standard in the UK and Ireland. Gas mark 1 is 140 °C and each mark up adds roughly 14 °C, with quarter and half marks below 1 for very low settings.</p>' },
  ],

  related: ['cooking-converter', 'temperature-converter', 'recipe-scaler', 'unit-converter'],
};
