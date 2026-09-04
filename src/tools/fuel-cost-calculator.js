export default {
  slug: 'fuel-cost-calculator',
  category: 'calculators',
  title: 'Fuel Cost Calculator – What a Trip Will Cost in Petrol',
  h1: 'Fuel Cost Calculator',
  cardText: 'Fuel cost for any journey, split between passengers if you like.',
  description:
    'Free fuel cost calculator. Work out what a trip costs in fuel from distance, fuel economy and price, in mpg or litres per 100 km, and split it between passengers.',
  keywords: ['fuel cost calculator', 'trip cost calculator', 'gas cost calculator', 'petrol cost', 'mpg calculator'],
  updated: '2026-09-04',
  lede: 'Enter the distance, your car’s economy and the fuel price. Works in US mpg, UK mpg or litres per 100 km.',

  form: `
<div class="field">
  <span class="field-label" id="sys-label">Measurement system</span>
  <div class="seg" role="group" aria-labelledby="sys-label" id="systems" style="flex-wrap:wrap">
    <button type="button" data-sys="us" aria-pressed="true">US — miles, mpg, $/gal</button>
    <button type="button" data-sys="uk">UK — miles, mpg, £/L</button>
    <button type="button" data-sys="metric">Metric — km, L/100km</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="dist">Distance</label>
    <div class="input-group">
      <input type="number" id="dist" inputmode="decimal" min="0" step="1" value="300">
      <span class="addon" id="distunit">miles</span>
    </div>
  </div>
  <div class="field">
    <label for="econ" id="econlabel">Fuel economy</label>
    <div class="input-group">
      <input type="number" id="econ" inputmode="decimal" min="0.1" step="0.1" value="30">
      <span class="addon" id="econunit">mpg</span>
    </div>
  </div>
  <div class="field">
    <label for="price" id="pricelabel">Fuel price</label>
    <div class="input-group">
      <span class="addon" id="cur" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="price" inputmode="decimal" min="0" step="0.01" value="3.40" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
      <span class="addon" id="priceunit">/gal</span>
    </div>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="people">Split between</label>
    <div class="input-group">
      <input type="number" id="people" inputmode="numeric" min="1" max="20" step="1" value="1">
      <span class="addon">people</span>
    </div>
  </div>
  <div class="field">
    <label for="ret">Journey</label>
    <select id="ret">
      <option value="1" selected>One way</option>
      <option value="2">Return trip</option>
    </select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Fuel cost</div>
  <div class="result-value" id="total">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Fuel used</dt><dd id="used">—</dd></div>
    <div class="stat"><dt>Cost per person</dt><dd id="each">—</dd></div>
    <div class="stat"><dt id="permile-label">Cost per mile</dt><dd id="permile">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var sys = 'us';

  var CONF = {
    us:     { dist: 'miles', econ: 'mpg', cur: '$', priceUnit: '/gal', econLabel: 'Fuel economy', per: 'Cost per mile' },
    uk:     { dist: 'miles', econ: 'mpg', cur: '£', priceUnit: '/litre', econLabel: 'Fuel economy (UK mpg)', per: 'Cost per mile' },
    metric: { dist: 'km',    econ: 'L/100km', cur: '€', priceUnit: '/litre', econLabel: 'Fuel consumption', per: 'Cost per km' }
  };

  function money(n){
    return CONF[sys].cur + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function calc(){
    var dist = parseFloat($('dist').value);
    var econ = parseFloat($('econ').value);
    var price = parseFloat($('price').value);
    var people = Math.max(1, parseInt($('people').value, 10) || 1);
    var trips = parseInt($('ret').value, 10);
    if (!(dist > 0) || !(econ > 0) || !(price >= 0)) { $('total').textContent = '—'; return; }

    var d = dist * trips;
    var litres, gallons, total;

    if (sys === 'us') {
      gallons = d / econ;                       // US gallons
      total = gallons * price;
      litres = gallons * 3.785411784;
      $('used').textContent = gallons.toFixed(1) + ' gal (' + litres.toFixed(0) + ' L)';
    } else if (sys === 'uk') {
      gallons = d / econ;                       // imperial gallons
      litres = gallons * 4.54609;
      total = litres * price;                   // UK prices are per litre
      $('used').textContent = litres.toFixed(1) + ' L (' + gallons.toFixed(1) + ' imp gal)';
    } else {
      litres = d / 100 * econ;
      total = litres * price;
      $('used').textContent = litres.toFixed(1) + ' L';
    }

    $('total').textContent = money(total);
    $('each').textContent = money(total / people);
    $('permile').textContent = CONF[sys].cur + (total / d).toFixed(3);
    $('note').textContent = d.toLocaleString('en-US') + ' ' + CONF[sys].dist +
      (trips === 2 ? ' (return trip)' : '') + ' at ' + econ + ' ' + CONF[sys].econ +
      (people > 1 ? ', split ' + people + ' ways' : '') + '.';
  }

  $('systems').addEventListener('click', function(e){
    var b = e.target.closest('button[data-sys]'); if (!b) return;
    sys = b.getAttribute('data-sys');
    var btns = $('systems').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    var c = CONF[sys];
    $('distunit').textContent = c.dist;
    $('econunit').textContent = c.econ;
    $('cur').textContent = c.cur;
    $('priceunit').textContent = c.priceUnit;
    $('econlabel').textContent = c.econLabel;
    $('permile-label').textContent = c.per;
    // Sensible defaults so the numbers are not nonsense after a switch.
    if (sys === 'metric') { $('econ').value = 7.8; $('price').value = 1.70; $('dist').value = 480; }
    else if (sys === 'uk') { $('econ').value = 45; $('price').value = 1.45; $('dist').value = 300; }
    else { $('econ').value = 30; $('price').value = 3.40; $('dist').value = 300; }
    calc();
  });
  ['dist','econ','price','people','ret'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'Working out what a drive costs',
  answer: `<p><strong>Fuel used is distance divided by economy; cost is fuel used times price.</strong> A 300-mile trip in a car doing 30 mpg uses 10 US gallons, which at $3.40 costs $34. The one thing to watch is that US and UK miles per gallon are not the same measure — an imperial gallon is 20% larger, so 40 UK mpg is only about 33 US mpg. Metric economy is inverted: litres per 100 km goes <em>down</em> as the car gets more efficient.</p>`,

  steps: [
    'Pick the measurement system your figures are in.',
    'Enter the distance, your car’s economy and the current fuel price.',
    'Set the number of people if you are sharing costs, and choose a return trip if relevant.',
  ],

  sections: [
    {
      id: 'mpg',
      h2: 'US mpg, UK mpg and L/100km',
      html: `<p>Three systems describe the same thing, and mixing them up produces errors of 20% or more.</p>
<div class="table-scroll"><table>
<thead><tr><th>US mpg</th><th>UK mpg</th><th>L/100 km</th></tr></thead>
<tbody>
<tr><td>20</td><td>24.0</td><td>11.8</td></tr>
<tr><td>30</td><td>36.0</td><td>7.8</td></tr>
<tr><td>40</td><td>48.0</td><td>5.9</td></tr>
<tr><td>50</td><td>60.0</td><td>4.7</td></tr>
</tbody></table></div>
<p>Note the direction change: higher mpg is better, but <em>lower</em> L/100 km is better. A car quoted at 5 L/100 km is more efficient than one at 8.</p>`,
    },
    {
      id: 'real-world',
      h2: 'Why you never get the quoted economy',
      html: `<p>Official figures come from standardised laboratory cycles, and real driving is not a laboratory. Expect to be 10–25% worse, more in some conditions.</p>
<ul>
<li><strong>Speed.</strong> Air resistance rises with the square of speed. Driving at 80 mph instead of 65 can cost 15–20% of your economy.</li>
<li><strong>Cold starts and short trips.</strong> An engine below operating temperature burns significantly more fuel, so a lot of short journeys is the worst case.</li>
<li><strong>Roof boxes and bike racks.</strong> A roof box can cost 10–25% at motorway speeds even when empty.</li>
<li><strong>Tyre pressure.</strong> Under-inflated tyres typically cost 2–3%, and are checked far less often than they should be.</li>
<li><strong>Air conditioning.</strong> Around 5–10% in hot weather, though still better than open windows at speed.</li>
</ul>
<p>For budgeting a real trip, take your car's official figure and knock 15% off it. You will be closer than the brochure.</p>`,
    },
  ],

  faq: [
    { q: 'How do I work out the fuel cost of a trip?', a: '<p>Divide the distance by your car’s economy to get the fuel used, then multiply by the price per unit. The calculator above handles the unit differences between US, UK and metric measures.</p>' },
    { q: 'Is UK mpg the same as US mpg?', a: '<p>No. An imperial gallon is 4.546 litres against the US 3.785, so UK mpg figures are about 20% higher for the same actual efficiency. 40 UK mpg equals roughly 33 US mpg.</p>' },
    { q: 'What is a good fuel economy?', a: '<p>For a modern petrol car, 35–45 US mpg (7.8–5.2 L/100 km) is efficient. Hybrids commonly exceed 50 US mpg. Large SUVs and pickups often sit in the low 20s.</p>' },
    { q: 'How much should passengers contribute?', a: '<p>Splitting the fuel cost evenly between everyone in the car, driver included, is the common convention. Set the number of people above to see the per-person figure.</p>' },
    { q: 'Does this include wear and tear?', a: '<p>No, only fuel. Total running cost including depreciation, tyres, servicing and insurance is typically two to three times the fuel cost alone.</p>' },
  ],

  related: ['unit-converter', 'speed-converter', 'bill-split-calculator', 'car-loan-calculator'],
};
