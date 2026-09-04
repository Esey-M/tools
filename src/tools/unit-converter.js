export default {
  slug: 'unit-converter',
  category: 'converters',
  title: 'Unit Converter – Length, Weight, Volume, Area, Speed and More',
  h1: 'Unit Converter',
  cardText: 'Convert length, weight, volume, area, speed, temperature and data in one place.',
  description:
    'Free unit converter for length, weight, volume, area, speed, temperature, time and digital storage. Metric to imperial and back, with exact conversion factors.',
  keywords: ['unit converter', 'cm to inches', 'kg to lbs', 'metric to imperial', 'measurement converter'],
  updated: '2026-09-04',
  lede: 'Pick a category, type a number, and read the answer. Every factor below is the exact internationally agreed definition, not a rounded approximation.',

  form: `
<div class="field">
  <label for="cat">Category</label>
  <select id="cat">
    <option value="length">Length &amp; distance</option>
    <option value="mass">Weight &amp; mass</option>
    <option value="volume">Volume &amp; capacity</option>
    <option value="area">Area</option>
    <option value="speed">Speed</option>
    <option value="temp">Temperature</option>
    <option value="time">Time</option>
    <option value="data">Digital storage</option>
  </select>
</div>

<div class="row" style="align-items:end">
  <div class="field">
    <label for="from">From</label>
    <input type="number" id="fromval" inputmode="decimal" step="any" placeholder="1" value="1" style="margin-bottom:8px">
    <select id="from"></select>
  </div>
  <div class="field">
    <label for="to">To</label>
    <input type="text" id="toval" readonly aria-live="polite" style="margin-bottom:8px;background:var(--accent-soft);font-weight:640;color:var(--accent-ink)">
    <select id="to"></select>
  </div>
</div>
<div class="btn-row">
  <button type="button" class="btn btn-ghost" id="swap">⇄ Swap units</button>
</div>

<div class="result" id="out" aria-live="polite" style="margin-top:18px">
  <div class="result-label">Result</div>
  <div class="result-value" id="big">—</div>
  <div class="result-note" id="formula"></div>
</div>

<div style="margin-top:18px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:8px">Common conversions</h2>
  <div class="pills" id="quick" style="justify-content:flex-start"></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // Every unit is defined against one SI base unit per category.
  var UNITS = {
    length: { base: 'm', list: [
      ['mm','Millimetre (mm)',0.001], ['cm','Centimetre (cm)',0.01], ['m','Metre (m)',1],
      ['km','Kilometre (km)',1000], ['in','Inch (in)',0.0254], ['ft','Foot (ft)',0.3048],
      ['yd','Yard (yd)',0.9144], ['mi','Mile (mi)',1609.344], ['nmi','Nautical mile',1852]
    ]},
    mass: { base: 'kg', list: [
      ['mg','Milligram (mg)',0.000001], ['g','Gram (g)',0.001], ['kg','Kilogram (kg)',1],
      ['t','Tonne (t)',1000], ['oz','Ounce (oz)',0.028349523125], ['lb','Pound (lb)',0.45359237],
      ['st','Stone (st)',6.35029318], ['ton','US ton',907.18474]
    ]},
    volume: { base: 'l', list: [
      ['ml','Millilitre (ml)',0.001], ['l','Litre (l)',1], ['m3','Cubic metre (m³)',1000],
      ['tsp','US teaspoon',0.00492892159375], ['tbsp','US tablespoon',0.01478676478125],
      ['floz','US fluid ounce',0.0295735295625], ['cup','US cup',0.2365882365],
      ['pt','US pint',0.473176473], ['qt','US quart',0.946352946],
      ['gal','US gallon',3.785411784], ['impgal','Imperial gallon',4.54609]
    ]},
    area: { base: 'm2', list: [
      ['cm2','Square centimetre',0.0001], ['m2','Square metre (m²)',1], ['ha','Hectare',10000],
      ['km2','Square kilometre',1000000], ['in2','Square inch',0.00064516], ['ft2','Square foot',0.09290304],
      ['yd2','Square yard',0.83612736], ['ac','Acre',4046.8564224], ['mi2','Square mile',2589988.110336]
    ]},
    speed: { base: 'ms', list: [
      ['ms','Metres per second',1], ['kmh','Kilometres per hour',0.277777777777778],
      ['mph','Miles per hour',0.44704], ['fts','Feet per second',0.3048], ['kn','Knot',0.514444444444444]
    ]},
    time: { base: 's', list: [
      ['ms','Millisecond',0.001], ['s','Second',1], ['min','Minute',60], ['h','Hour',3600],
      ['d','Day',86400], ['wk','Week',604800], ['mo','Month (30 days)',2592000], ['yr','Year (365 days)',31536000]
    ]},
    data: { base: 'B', list: [
      ['b','Bit',0.125], ['B','Byte',1], ['KB','Kilobyte (1000 B)',1000], ['KiB','Kibibyte (1024 B)',1024],
      ['MB','Megabyte',1000000], ['MiB','Mebibyte',1048576], ['GB','Gigabyte',1000000000],
      ['GiB','Gibibyte',1073741824], ['TB','Terabyte',1000000000000], ['TiB','Tebibyte',1099511627776]
    ]},
    temp: { base: 'C', list: [['C','Celsius (°C)',1], ['F','Fahrenheit (°F)',1], ['K','Kelvin (K)',1]] }
  };

  // Popular pairs surfaced as one-tap shortcuts.
  var QUICK = {
    length: [['cm','in'],['in','cm'],['km','mi'],['mi','km'],['ft','m'],['m','ft']],
    mass:   [['kg','lb'],['lb','kg'],['g','oz'],['oz','g'],['st','kg']],
    volume: [['l','gal'],['gal','l'],['ml','floz'],['cup','ml']],
    area:   [['m2','ft2'],['ac','ha'],['ha','ac']],
    speed:  [['kmh','mph'],['mph','kmh'],['kn','kmh']],
    temp:   [['C','F'],['F','C'],['C','K']],
    time:   [['h','min'],['d','h'],['wk','d']],
    data:   [['MB','KB'],['GB','MB'],['TB','GB'],['GiB','MiB']]
  };

  function toBase(cat, unit, v){
    if (cat !== 'temp') return v * factor(cat, unit);
    if (unit === 'C') return v;
    if (unit === 'F') return (v - 32) * 5 / 9;
    return v - 273.15;                       // Kelvin
  }
  function fromBase(cat, unit, v){
    if (cat !== 'temp') return v / factor(cat, unit);
    if (unit === 'C') return v;
    if (unit === 'F') return v * 9 / 5 + 32;
    return v + 273.15;
  }
  function factor(cat, unit){
    var list = UNITS[cat].list;
    for (var i = 0; i < list.length; i++) if (list[i][0] === unit) return list[i][2];
    return 1;
  }
  function label(cat, unit){
    var list = UNITS[cat].list;
    for (var i = 0; i < list.length; i++) if (list[i][0] === unit) return list[i][1];
    return unit;
  }

  function fmt(n){
    if (!isFinite(n)) return '—';
    var a = Math.abs(n);
    if (a !== 0 && (a < 1e-4 || a >= 1e12)) return n.toExponential(6).replace(/e([+-])(\\d)$/, 'e$10$2');
    var decimals = a >= 100 ? 4 : a >= 1 ? 6 : 8;
    return parseFloat(n.toFixed(decimals)).toLocaleString('en-US', { maximumFractionDigits: decimals });
  }

  function fill(sel, cat, chosen){
    sel.innerHTML = UNITS[cat].list.map(function(u){
      return '<option value="' + u[0] + '"' + (u[0] === chosen ? ' selected' : '') + '>' + u[1] + '</option>';
    }).join('');
  }

  function renderQuick(cat){
    $('quick').innerHTML = (QUICK[cat] || []).map(function(p){
      return '<button type="button" class="pill" data-f="' + p[0] + '" data-t="' + p[1] + '">' +
        p[0].replace('2','²') + ' → ' + p[1].replace('2','²') + '</button>';
    }).join('');
  }

  function convert(){
    var cat = $('cat').value;
    var v = parseFloat($('fromval').value);
    if (!isFinite(v)) { $('toval').value = ''; $('big').textContent = '—'; $('formula').textContent = ''; return; }
    var f = $('from').value, t = $('to').value;
    var result = fromBase(cat, t, toBase(cat, f, v));
    $('toval').value = fmt(result);
    $('big').textContent = fmt(v) + ' ' + f.replace('2','²') + ' = ' + fmt(result) + ' ' + t.replace('2','²');
    $('formula').textContent = label(cat, f) + ' → ' + label(cat, t) +
      (cat === 'temp' ? '' : '  ·  1 ' + f.replace('2','²') + ' = ' + fmt(fromBase(cat, t, toBase(cat, f, 1))) + ' ' + t.replace('2','²'));
  }

  function setCategory(cat){
    var q = (QUICK[cat] || [[UNITS[cat].list[0][0], UNITS[cat].list[1][0]]])[0];
    fill($('from'), cat, q[0]);
    fill($('to'), cat, q[1]);
    renderQuick(cat);
    convert();
  }

  $('cat').addEventListener('change', function(){ setCategory($('cat').value); });
  $('from').addEventListener('change', convert);
  $('to').addEventListener('change', convert);
  $('fromval').addEventListener('input', convert);
  $('swap').addEventListener('click', function(){
    var f = $('from').value; $('from').value = $('to').value; $('to').value = f;
    convert();
  });
  $('quick').addEventListener('click', function(e){
    var b = e.target.closest('button[data-f]'); if (!b) return;
    $('from').value = b.getAttribute('data-f');
    $('to').value = b.getAttribute('data-t');
    convert();
  });

  setCategory('length');
})();`,

  answerHeading: 'How unit conversion works',
  answer: `<p><strong>Every conversion is a single multiplication by a fixed factor.</strong> To convert centimetres to inches, divide by 2.54, because an inch is defined as exactly 2.54 cm. To convert kilograms to pounds, divide by 0.45359237. These are not measurements — since 1959 they are exact definitions agreed internationally, so the conversion is precise rather than approximate. Temperature is the exception: Celsius and Fahrenheit have different zero points, so converting needs both a multiplication and an offset.</p>`,

  steps: [
    'Choose the <strong>category</strong> you are working in — length, weight, volume and so on.',
    'Type the number you want to convert in the left box and pick its unit underneath.',
    'Pick the unit you want on the right. The answer updates as you type.',
    'Tap a <strong>common conversion</strong> chip to jump straight to a popular pair.',
  ],

  sections: [
    {
      id: 'factors',
      h2: 'Exact conversion factors',
      html: `<p>These are the defined values this converter uses. Anything marked exact is a definition rather than a measurement.</p>
<div class="table-scroll"><table>
<thead><tr><th>Conversion</th><th>Factor</th><th>Status</th></tr></thead>
<tbody>
<tr><td>1 inch</td><td>2.54 cm</td><td>Exact</td></tr>
<tr><td>1 foot</td><td>0.3048 m</td><td>Exact</td></tr>
<tr><td>1 mile</td><td>1,609.344 m</td><td>Exact</td></tr>
<tr><td>1 pound</td><td>0.45359237 kg</td><td>Exact</td></tr>
<tr><td>1 ounce</td><td>28.349523125 g</td><td>Exact</td></tr>
<tr><td>1 US gallon</td><td>3.785411784 L</td><td>Exact</td></tr>
<tr><td>1 imperial gallon</td><td>4.54609 L</td><td>Exact</td></tr>
<tr><td>1 acre</td><td>4,046.8564224 m²</td><td>Exact</td></tr>
<tr><td>1 knot</td><td>1.852 km/h</td><td>Exact</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'gallons',
      h2: 'The US and imperial units that share a name',
      html: `<p>Several units have the same name on both sides of the Atlantic but different sizes, which is a common source of ruined recipes and wrong fuel economy figures.</p>
<div class="table-scroll"><table>
<thead><tr><th>Unit</th><th>US</th><th>Imperial (UK)</th><th>Difference</th></tr></thead>
<tbody>
<tr><td>Gallon</td><td>3.785 L</td><td>4.546 L</td><td>UK is 20% larger</td></tr>
<tr><td>Pint</td><td>473 ml</td><td>568 ml</td><td>UK is 20% larger</td></tr>
<tr><td>Fluid ounce</td><td>29.57 ml</td><td>28.41 ml</td><td>US is 4% larger</td></tr>
<tr><td>Ton</td><td>907 kg</td><td>1,016 kg</td><td>UK long ton is heavier</td></tr>
</tbody></table></div>
<p>Curiously, the US fluid ounce is the larger of the two while the US pint is smaller — because a US pint is 16 fl oz and an imperial pint is 20.</p>`,
    },
    {
      id: 'data',
      h2: 'Why your 1 TB drive shows as 931 GB',
      html: `<p>Storage manufacturers use decimal units where 1 TB is 1,000,000,000,000 bytes. Windows reports capacity in binary units but labels them with decimal names, so it divides by 1,099,511,627,776 and shows 931.</p>
<p>Nothing is missing — the same bytes are being described in two different counting systems. The unambiguous binary names are kibibyte, mebibyte, gibibyte and tebibyte (KiB, MiB, GiB, TiB), all available in the data category above.</p>`,
    },
  ],

  faq: [
    { q: 'How many centimetres are in an inch?', a: '<p>Exactly 2.54 cm. To convert inches to centimetres multiply by 2.54; to go the other way, divide by 2.54.</p>' },
    { q: 'How many pounds is a kilogram?', a: '<p>One kilogram is about 2.2046 pounds. For mental maths, doubling the kilograms and adding 10% gets you very close: 70 kg → 140 + 14 = 154 lb, against an exact 154.3 lb.</p>' },
    { q: 'Is a US gallon the same as a UK gallon?', a: '<p>No. A US gallon is 3.785 litres and an imperial gallon is 4.546 litres — about 20% larger. Both are listed separately in the volume category.</p>' },
    { q: 'How do I convert Celsius to Fahrenheit?', a: '<p>Multiply by 9/5 and add 32. A quick approximation is to double the Celsius figure and add 30, which is within a couple of degrees over normal weather temperatures.</p>' },
    { q: 'Are these conversion factors exact?', a: '<p>Yes, for length, mass, volume and area. Since 1959 the inch, pound and related units have been defined in terms of metric units by international agreement, so the factors are definitions rather than measurements.</p>' },
  ],

  related: ['temperature-converter', 'cooking-converter', 'speed-converter', 'shoe-size-converter'],
};
