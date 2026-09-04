export default {
  slug: 'electricity-bill-estimator',
  category: 'home',
  title: 'Electricity Bill Estimator – What Your Appliances Cost',
  h1: 'Electricity Bill Estimator',
  cardText: 'What each appliance costs to run, per hour, month and year.',
  description:
    'Free electricity cost calculator. Work out what any appliance costs to run per hour, month and year from its wattage, usage and your unit rate.',
  keywords: ['electricity cost calculator', 'appliance running cost', 'kwh calculator', 'electricity bill estimator', 'energy cost calculator'],
  updated: '2026-09-04',
  lede: 'Pick an appliance or enter its wattage, say how long it runs, and see what it actually costs you.',

  form: `
<div class="row">
  <div class="field">
    <label for="preset">Appliance</label>
    <select id="preset"></select>
  </div>
  <div class="field">
    <label for="watts">Power</label>
    <div class="input-group"><input type="number" id="watts" inputmode="decimal" min="0" step="10" value="2000"><span class="addon">watts</span></div>
  </div>
  <div class="field">
    <label for="rate">Your unit rate</label>
    <div class="input-group">
      <input type="number" id="rate" inputmode="decimal" min="0" step="0.001" value="0.17">
      <span class="addon">per kWh</span>
    </div>
    <span class="hint">On your bill, usually in cents or pence per kWh.</span>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="hours">Used for</label>
    <div class="input-group"><input type="number" id="hours" inputmode="decimal" min="0" max="24" step="0.25" value="1"><span class="addon">hrs</span></div>
  </div>
  <div class="field">
    <label for="per">Per</label>
    <select id="per">
      <option value="day" selected>Day</option>
      <option value="week">Week</option>
      <option value="month">Month</option>
    </select>
  </div>
  <div class="field">
    <label for="count">How many</label>
    <input type="number" id="count" inputmode="numeric" min="1" max="50" step="1" value="1">
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Cost to run</div>
  <div class="result-value" id="year">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Per hour</dt><dd id="hour">—</dd></div>
    <div class="stat"><dt>Per day</dt><dd id="day">—</dd></div>
    <div class="stat"><dt>Per month</dt><dd id="month">—</dd></div>
    <div class="stat"><dt>kWh a year</dt><dd id="kwh">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">What common appliances cost at your rate</h2>
  <div class="table-scroll"><table id="table"><thead><tr><th>Appliance</th><th>Watts</th><th>Typical use</th><th>Cost a year</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // [name, watts, hours per day used for the comparison table]
  var APPLIANCES = [
    ['Electric heater', 2000, 4],
    ['Tumble dryer', 2500, 0.7],
    ['Electric shower', 8500, 0.2],
    ['Kettle', 3000, 0.3],
    ['Oven', 2100, 0.5],
    ['Air conditioner', 1500, 4],
    ['Washing machine', 700, 0.7],
    ['Dishwasher', 1400, 0.8],
    ['Fridge freezer', 150, 8],
    ['Desktop computer', 200, 6],
    ['Gaming console', 160, 2],
    ['Television, 55 inch LED', 90, 5],
    ['Laptop', 50, 6],
    ['Router (always on)', 10, 24],
    ['LED bulb', 9, 5],
    ['Phone charger', 5, 2],
    ['Standby devices (whole home)', 40, 24]
  ];

  function money(n){
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function num(id, d){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; }

  $('preset').innerHTML = '<option value="">Custom — enter watts below</option>' +
    APPLIANCES.map(function(a, i){ return '<option value="' + i + '">' + a[0] + ' (' + a[1] + 'W)</option>'; }).join('');

  function hoursPerYear(){
    var h = num('hours', 0);
    var per = $('per').value;
    return per === 'day' ? h * 365 : per === 'week' ? h * 52 : h * 12;
  }

  function calc(){
    var watts = num('watts', 0);
    var rate = num('rate', 0);
    var count = Math.max(1, Math.round(num('count', 1)));

    var kw = watts / 1000 * count;
    var perHour = kw * rate;
    var yearHours = hoursPerYear();
    var yearKwh = kw * yearHours;
    var yearCost = yearKwh * rate;

    $('year').textContent = money(yearCost) + ' a year';
    $('hour').textContent = money(perHour);
    $('day').textContent = money(yearCost / 365);
    $('month').textContent = money(yearCost / 12);
    $('kwh').textContent = Math.round(yearKwh).toLocaleString('en-US') + ' kWh';
    $('note').textContent = (count > 1 ? count + ' × ' : '') + watts + 'W for ' + num('hours', 0) +
      ' hours a ' + $('per').value + ' — ' + Math.round(yearHours).toLocaleString('en-US') +
      ' hours a year at ' + rate + ' per kWh.';

    $('table').querySelector('tbody').innerHTML = APPLIANCES.map(function(a){
      var cost = a[1] / 1000 * a[2] * 365 * rate;
      return '<tr><td>' + a[0] + '</td><td>' + a[1] + 'W</td><td>' + a[2] + ' hrs/day</td><td>' +
        money(cost) + '</td></tr>';
    }).join('');
  }

  $('preset').addEventListener('change', function(){
    if (this.value === '') return;
    var a = APPLIANCES[parseInt(this.value, 10)];
    $('watts').value = a[1];
    $('hours').value = a[2];
    $('per').value = 'day';
    calc();
  });
  ['watts','rate','hours','per','count'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'Working out what an appliance costs',
  answer: `<p><strong>Cost = watts ÷ 1000 × hours × your rate per kWh.</strong> A 2,000 W heater run for 4 hours uses 8 kWh, which at 17 cents costs $1.36 a day — about $496 a year if used daily. The number that matters is on your bill as the unit rate, usually 10–35 cents or pence per kWh depending on where you live. The useful insight is that <em>heating things</em> dominates: anything that makes heat draws kilowatts, while everything electronic draws watts.</p>`,

  steps: [
    'Pick an appliance from the list, or enter its wattage from the label or manual.',
    'Enter your unit rate — it is printed on your electricity bill.',
    'Say how long it runs and how often.',
    'The table underneath recalculates every common appliance at your rate.',
  ],

  sections: [
    {
      id: 'heat',
      h2: 'Heat is what costs money',
      html: `<p>The single most useful rule: appliances that produce heat use hundreds of times more electricity than appliances that produce information.</p>
<p>A 2,000 W heater uses as much in one hour as a 10 W router uses in over eight days. Leaving a laptop charging overnight costs a fraction of a cent. Running an electric shower for ten minutes costs more than the laptop does all week.</p>
<p>This is why energy-saving advice that focuses on unplugging phone chargers is mostly wasted effort. The things worth attention are heating, hot water, tumble drying, and air conditioning — in roughly that order.</p>`,
    },
    {
      id: 'standby',
      h2: 'Standby power, in proportion',
      html: `<p>Standby ("vampire") power is real but frequently overstated. A typical home draws 30–60 W continuously from devices in standby, which is around 350–520 kWh a year — perhaps $60–90.</p>
<p>Worth eliminating where it is easy: set-top boxes, games consoles left in instant-on mode, and old plasma-era equipment are the usual offenders. Modern devices are legally capped at 0.5 W standby in the EU and UK, so a new TV costs under a dollar a year in standby.</p>
<p>Not worth the effort: unplugging phone chargers, which draw close to nothing when nothing is attached.</p>`,
    },
    {
      id: 'reduce',
      h2: 'Changes that actually move the bill',
      html: `<ul>
<li><strong>Lower the thermostat by 1°C.</strong> Typically 6–10% off heating, which is usually the largest line on the bill.</li>
<li><strong>Dry clothes on a rack.</strong> A tumble dryer is among the most expensive appliances in the house to run.</li>
<li><strong>Only boil the water you need.</strong> A full kettle for one cup wastes most of the energy.</li>
<li><strong>Wash at 30°C.</strong> Most of a washing machine's energy goes to heating water, not turning the drum.</li>
<li><strong>Switch remaining bulbs to LED.</strong> A 60 W incandescent replaced by a 9 W LED saves around 85%.</li>
<li><strong>Check your tariff.</strong> Time-of-use tariffs can cut the cost of a dishwasher or EV charging substantially if you can shift them to off-peak.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Where do I find my electricity rate?', a: '<p>On your bill, listed as the unit rate or price per kWh. It may be split into day and night rates on a time-of-use tariff — use whichever applies to when the appliance actually runs.</p>' },
    { q: 'What is a kWh?', a: '<p>A kilowatt-hour: one kilowatt of power drawn for one hour. A 1,000 W appliance running for one hour uses exactly 1 kWh, and that is the unit your bill charges by.</p>' },
    { q: 'How much does it cost to leave a light on?', a: '<p>A 9 W LED left on for 24 hours uses 0.22 kWh — under 4 cents at 17 cents per kWh. An old 60 W incandescent would cost about 24 cents for the same period.</p>' },
    { q: 'Does standby power really matter?', a: '<p>Somewhat. A whole household typically draws 30–60 W in standby, costing perhaps $60–90 a year. Worth switching off the big offenders; not worth chasing phone chargers.</p>' },
    { q: 'Why is my bill higher than this suggests?', a: '<p>Because bills also include standing charges, taxes and every appliance in the house at once. This calculator covers one appliance in isolation — useful for comparison, not for predicting the total bill.</p>' },
  ],

  related: ['budget-tracker', 'percentage-calculator', 'unit-converter', 'paint-calculator'],
};
