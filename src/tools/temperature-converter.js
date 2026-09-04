export default {
  slug: 'temperature-converter',
  category: 'converters',
  title: 'Temperature Converter – Celsius, Fahrenheit and Kelvin',
  h1: 'Temperature Converter',
  cardText: 'Celsius, Fahrenheit and Kelvin converted together, with a reference chart.',
  description:
    'Free temperature converter for Celsius, Fahrenheit and Kelvin. Type any one value and see all three at once, with a reference chart of everyday temperatures.',
  keywords: ['temperature converter', 'celsius to fahrenheit', 'fahrenheit to celsius', 'c to f', 'kelvin converter'],
  updated: '2026-09-04',
  lede: 'Type into any box and the other two update instantly. All three scales, always visible.',

  form: `
<div class="row">
  <div class="field">
    <label for="c">Celsius</label>
    <div class="input-group">
      <input type="number" id="c" inputmode="decimal" step="any" placeholder="20">
      <span class="addon">°C</span>
    </div>
  </div>
  <div class="field">
    <label for="f">Fahrenheit</label>
    <div class="input-group">
      <input type="number" id="f" inputmode="decimal" step="any" placeholder="68">
      <span class="addon">°F</span>
    </div>
  </div>
  <div class="field">
    <label for="k">Kelvin</label>
    <div class="input-group">
      <input type="number" id="k" inputmode="decimal" step="any" placeholder="293.15">
      <span class="addon">K</span>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">In plain terms</div>
  <div class="result-value" id="desc" style="font-size:1.9rem">—</div>
  <div class="result-note" id="work"></div>
</div>

<div style="margin-top:18px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:8px">Jump to</h2>
  <div class="pills" id="quick" style="justify-content:flex-start"></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var c = $('c'), f = $('f'), k = $('k');
  var busy = false;

  var round = function(n){ return Math.round(n * 100) / 100; };

  var PRESETS = [
    ['Freezing', 0], ['Room temp', 20], ['Body temp', 37], ['Fever', 38.5],
    ['Hot day', 35], ['Oven, low', 150], ['Oven, hot', 220], ['Boiling', 100]
  ];

  function describe(celsius){
    if (celsius <= -273.15) return 'Absolute zero — nothing can be colder';
    if (celsius < -20) return 'Severely cold';
    if (celsius < 0)  return 'Below freezing';
    if (celsius < 10) return 'Cold';
    if (celsius < 18) return 'Cool';
    if (celsius < 24) return 'Comfortable room temperature';
    if (celsius < 30) return 'Warm';
    if (celsius < 40) return 'Hot';
    if (celsius < 100) return 'Very hot — well above body temperature';
    return 'Above the boiling point of water';
  }

  function sync(from){
    if (busy) return;
    busy = true;
    var celsius;
    if (from === 'c') celsius = parseFloat(c.value);
    else if (from === 'f') celsius = (parseFloat(f.value) - 32) * 5 / 9;
    else celsius = parseFloat(k.value) - 273.15;

    if (!isFinite(celsius)) {
      if (from !== 'c') c.value = '';
      if (from !== 'f') f.value = '';
      if (from !== 'k') k.value = '';
      $('out').hidden = true;
      busy = false; return;
    }

    if (from !== 'c') c.value = round(celsius);
    if (from !== 'f') f.value = round(celsius * 9 / 5 + 32);
    if (from !== 'k') k.value = round(celsius + 273.15);

    $('desc').textContent = describe(celsius);
    $('work').textContent = round(celsius) + '°C  ·  ' + round(celsius * 9 / 5 + 32) + '°F  ·  ' + round(celsius + 273.15) + ' K' +
      (celsius < -273.15 ? '  — below absolute zero, physically impossible' : '');
    $('out').hidden = false;
    busy = false;
  }

  c.addEventListener('input', function(){ sync('c'); });
  f.addEventListener('input', function(){ sync('f'); });
  k.addEventListener('input', function(){ sync('k'); });

  $('quick').innerHTML = PRESETS.map(function(p){
    return '<button type="button" class="pill" data-c="' + p[1] + '">' + p[0] + ' (' + p[1] + '°C)</button>';
  }).join('');
  $('quick').addEventListener('click', function(e){
    var b = e.target.closest('button[data-c]'); if (!b) return;
    c.value = b.getAttribute('data-c'); sync('c');
  });

  c.value = 20; sync('c');
})();`,

  answerHeading: 'Converting between the scales',
  answer: `<p><strong>To convert Celsius to Fahrenheit, multiply by 9/5 and add 32. To go back, subtract 32 and multiply by 5/9.</strong> Kelvin is simpler: it uses the same size degree as Celsius, just shifted, so add 273.15 to go from Celsius to Kelvin. The offset exists because the scales put zero in different places — Celsius at water's freezing point, Fahrenheit at the freezing point of a salt-and-water mixture, and Kelvin at absolute zero, the coldest temperature physically possible.</p>`,

  steps: [
    'Type a value into whichever scale you already know.',
    'The other two update instantly as you type.',
    'Tap a preset below for a common reference temperature.',
  ],

  sections: [
    {
      id: 'chart',
      h2: 'Everyday temperature reference',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Celsius</th><th>Fahrenheit</th><th>What it is</th></tr></thead>
<tbody>
<tr><td>−273.15 °C</td><td>−459.67 °F</td><td>Absolute zero</td></tr>
<tr><td>−40 °C</td><td>−40 °F</td><td>Where the two scales meet</td></tr>
<tr><td>−18 °C</td><td>0 °F</td><td>Typical home freezer</td></tr>
<tr><td>0 °C</td><td>32 °F</td><td>Water freezes</td></tr>
<tr><td>4 °C</td><td>39 °F</td><td>Fridge, correct setting</td></tr>
<tr><td>20 °C</td><td>68 °F</td><td>Comfortable room temperature</td></tr>
<tr><td>37 °C</td><td>98.6 °F</td><td>Normal body temperature</td></tr>
<tr><td>38 °C</td><td>100.4 °F</td><td>Fever threshold</td></tr>
<tr><td>100 °C</td><td>212 °F</td><td>Water boils at sea level</td></tr>
<tr><td>180 °C</td><td>356 °F</td><td>Moderate oven (gas mark 4)</td></tr>
<tr><td>220 °C</td><td>428 °F</td><td>Hot oven (gas mark 7)</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'mental',
      h2: 'Converting in your head',
      html: `<p>For everyday weather, <strong>double the Celsius and add 30</strong>. It is close enough to be useful across normal temperatures.</p>
<div class="table-scroll"><table>
<thead><tr><th>Celsius</th><th>Quick estimate</th><th>Exact</th><th>Error</th></tr></thead>
<tbody>
<tr><td>10 °C</td><td>50 °F</td><td>50.0 °F</td><td>0</td></tr>
<tr><td>20 °C</td><td>70 °F</td><td>68.0 °F</td><td>2 °F</td></tr>
<tr><td>30 °C</td><td>90 °F</td><td>86.0 °F</td><td>4 °F</td></tr>
</tbody></table></div>
<p>The estimate drifts about 2 °F for every 10 °C, so it is fine for deciding what to wear and wrong for cooking. Two anchors are worth memorising outright: <strong>−40 is the same in both scales</strong>, and <strong>28 °C is about 82 °F</strong>, which brackets most warm weather.</p>`,
    },
  ],

  faq: [
    { q: 'What is 100°F in Celsius?', a: '<p>37.8 °C. Subtract 32 to get 68, then multiply by 5/9. That is just above normal body temperature, which is why 100 °F is often treated as a fever in the US.</p>' },
    { q: 'At what temperature are Celsius and Fahrenheit the same?', a: '<p>−40. It is the single point where the two scales cross, which makes it a handy anchor for checking any conversion you do by hand.</p>' },
    { q: 'Why does Kelvin not use the degree symbol?', a: '<p>Because Kelvin is an absolute scale rather than a relative one. Since 1967 the unit is simply "kelvin", written as K with no degree sign — 300 K, not 300 °K.</p>' },
    { q: 'What is normal body temperature?', a: '<p>Around 37 °C or 98.6 °F, though healthy individuals range roughly from 36.1 to 37.2 °C. Recent research suggests the modern average is slightly lower than the classic 37 °C figure.</p>' },
    { q: 'Why is Fahrenheit still used in the US?', a: '<p>Largely inertia. The US began a metric transition in the 1970s but made it voluntary, and Fahrenheit remained embedded in weather reporting, cooking and medicine. Its finer degree increments are sometimes argued to suit weather description well.</p>' },
  ],

  related: ['unit-converter', 'cooking-converter', 'speed-converter', 'oven-temperature-converter'],
};
