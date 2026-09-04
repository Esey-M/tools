export default {
  slug: 'paint-calculator',
  category: 'home',
  title: 'Paint Calculator – How Much Paint to Buy for a Room',
  h1: 'Paint Calculator',
  cardText: 'How many litres or gallons you need, after subtracting doors and windows.',
  description:
    'Free paint calculator. Work out how much paint a room needs from its dimensions, allowing for doors, windows, coats and ceiling, in litres or gallons.',
  keywords: ['paint calculator', 'how much paint do i need', 'paint coverage calculator', 'room paint calculator'],
  updated: '2026-09-04',
  lede: 'Enter the room dimensions and how many doors and windows. The calculator subtracts them and works out the paint for your chosen number of coats.',

  form: `
<div class="field">
  <span class="field-label" id="unit-label">Units</span>
  <div class="seg" role="group" aria-labelledby="unit-label">
    <button type="button" id="u-metric" aria-pressed="true">Metres &amp; litres</button>
    <button type="button" id="u-imperial">Feet &amp; gallons</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="length">Room length</label>
    <div class="input-group"><input type="number" id="length" inputmode="decimal" min="0" step="0.1" value="4.5"><span class="addon" id="d1">m</span></div>
  </div>
  <div class="field">
    <label for="width">Room width</label>
    <div class="input-group"><input type="number" id="width" inputmode="decimal" min="0" step="0.1" value="3.6"><span class="addon" id="d2">m</span></div>
  </div>
  <div class="field">
    <label for="height">Wall height</label>
    <div class="input-group"><input type="number" id="height" inputmode="decimal" min="0" step="0.1" value="2.4"><span class="addon" id="d3">m</span></div>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="doors">Doors</label>
    <input type="number" id="doors" inputmode="numeric" min="0" max="20" step="1" value="1">
  </div>
  <div class="field">
    <label for="windows">Windows</label>
    <input type="number" id="windows" inputmode="numeric" min="0" max="20" step="1" value="2">
  </div>
  <div class="field">
    <label for="coats">Coats</label>
    <select id="coats">
      <option value="1">1 coat</option>
      <option value="2" selected>2 coats</option>
      <option value="3">3 coats</option>
    </select>
  </div>
  <div class="field">
    <label for="ceiling">Include ceiling</label>
    <select id="ceiling">
      <option value="0" selected>Walls only</option>
      <option value="1">Walls and ceiling</option>
    </select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Paint needed</div>
  <div class="result-value" id="paint">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Area to paint</dt><dd id="area">—</dd></div>
    <div class="stat"><dt>Openings subtracted</dt><dd id="minus">—</dd></div>
    <div class="stat"><dt>Buy</dt><dd id="buy" style="font-size:1.1rem">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var metric = true;

  // Typical coverage: 12 m² per litre, or 375 sq ft per US gallon, for one coat.
  var COVER_M2_PER_L = 12;
  var COVER_SQFT_PER_GAL = 375;

  // Standard opening sizes.
  var DOOR_M2 = 1.9;      // ~2.0 x 0.95 m
  var WINDOW_M2 = 1.4;    // ~1.2 x 1.2 m average
  var DOOR_SQFT = 20;
  var WINDOW_SQFT = 15;

  function num(id, d){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; }

  function calc(){
    var L = num('length', 0), W = num('width', 0), H = num('height', 0);
    var doors = Math.round(num('doors', 0)), windows = Math.round(num('windows', 0));
    var coats = parseInt($('coats').value, 10);
    var ceiling = $('ceiling').value === '1';

    if (!(L > 0) || !(W > 0) || !(H > 0)) return;

    var wallArea = 2 * (L + W) * H;
    if (ceiling) wallArea += L * W;

    var openings = metric
      ? doors * DOOR_M2 + windows * WINDOW_M2
      : doors * DOOR_SQFT + windows * WINDOW_SQFT;

    var paintable = Math.max(0, wallArea - openings);
    var perCoat = metric ? paintable / COVER_M2_PER_L : paintable / COVER_SQFT_PER_GAL;
    var total = perCoat * coats;

    var unit = metric ? 'litres' : 'gallons';
    $('paint').textContent = (Math.round(total * 10) / 10) + ' ' + unit;
    $('area').textContent = Math.round(paintable) + (metric ? ' m²' : ' sq ft');
    $('minus').textContent = Math.round(openings) + (metric ? ' m²' : ' sq ft');

    // Round up to tins people can actually buy.
    var tins;
    if (metric) {
      var sizes = [10, 5, 2.5, 1];
      tins = packFor(total, sizes, 'L');
    } else {
      tins = packFor(total, [5, 1, 0.25], 'gal');
    }
    $('buy').textContent = tins;
    $('note').textContent = Math.round(paintable) + (metric ? ' m²' : ' sq ft') + ' over ' + coats +
      (coats === 1 ? ' coat' : ' coats') + ', at ' +
      (metric ? COVER_M2_PER_L + ' m² per litre' : COVER_SQFT_PER_GAL + ' sq ft per gallon') + '.';
  }

  /** Greedy tin selection, largest first, always rounding up. */
  function packFor(amount, sizes, unit){
    var remaining = amount;
    var parts = [];
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i];
      var isLast = i === sizes.length - 1;
      var n = isLast ? Math.ceil(remaining / s) : Math.floor(remaining / s);
      if (n > 0) { parts.push(n + ' × ' + s + unit); remaining -= n * s; }
      if (remaining <= 0.001) break;
    }
    return parts.length ? parts.join(' + ') : '1 × ' + sizes[sizes.length - 1] + unit;
  }

  function setUnits(m){
    if (m === metric) return;
    metric = m;
    $('u-metric').setAttribute('aria-pressed', String(m));
    $('u-imperial').setAttribute('aria-pressed', String(!m));
    ['d1','d2','d3'].forEach(function(id){ $(id).textContent = m ? 'm' : 'ft'; });
    ['length','width','height'].forEach(function(id){
      var v = parseFloat($(id).value);
      if (isFinite(v)) $(id).value = (m ? v * 0.3048 : v / 0.3048).toFixed(1);
    });
    calc();
  }

  $('u-metric').addEventListener('click', function(){ setUnits(true); });
  $('u-imperial').addEventListener('click', function(){ setUnits(false); });
  ['length','width','height','doors','windows','coats','ceiling'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'How much paint a room needs',
  answer: `<p><strong>Work out the wall area, subtract the doors and windows, then divide by the paint's coverage and multiply by the number of coats.</strong> Wall area is the room's perimeter times its height: a 4.5 × 3.6 m room with 2.4 m walls has 38.9 m² of wall. Subtract about 1.9 m² per door and 1.4 m² per window, and at 12 m² per litre two coats need roughly 5.7 litres. Most emulsion covers 10–14 m² per litre, so check the tin — dark colours and textured walls cover less.</p>`,

  steps: [
    'Enter the room’s length, width and wall height.',
    'Say how many doors and windows there are — standard sizes are subtracted automatically.',
    'Choose the number of coats. Two is standard.',
    'Read the amount needed and the suggested tin sizes.',
  ],

  sections: [
    {
      id: 'coats',
      h2: 'How many coats you actually need',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Coats</th></tr></thead>
<tbody>
<tr><td>Same colour, refreshing</td><td>1</td></tr>
<tr><td>Similar shade, previously painted</td><td>2</td></tr>
<tr><td>Light over dark</td><td>2–3, plus primer</td></tr>
<tr><td>Strong colour, especially red or yellow</td><td>3, over a tinted primer</td></tr>
<tr><td>New plaster</td><td>Mist coat (thinned paint) plus 2</td></tr>
<tr><td>Covering stains or smoke</td><td>Stain-blocking primer plus 2</td></tr>
</tbody></table></div>
<p>Reds and yellows genuinely need more coats than other colours, because the pigments used are less opaque. A grey-tinted primer underneath saves a coat and is cheaper than the topcoat.</p>`,
    },
    {
      id: 'buying',
      h2: 'Buying without over- or under-ordering',
      html: `<ul>
<li><strong>Round up, and buy it all at once.</strong> Paint is mixed in batches and two tins of the same colour bought weeks apart can differ subtly. If you need 5.7 litres, buy 10 rather than topping up later.</li>
<li><strong>Add 10% for cutting in.</strong> Edges, corners and around fittings use more than flat area suggests.</li>
<li><strong>Textured or bare surfaces drink paint.</strong> Bare plaster, artex and rough render can cut coverage by a third.</li>
<li><strong>Keep the leftovers labelled</strong> with the room and date. Touch-ups are much easier than rematching.</li>
<li><strong>Ceilings need less than you think</strong> but are harder to keep even — a full roller and steady overlaps beat trying to stretch it.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'How much does a litre of paint cover?', a: '<p>Typically 10–14 m² for one coat on a smooth, previously painted wall. This calculator uses 12 m² per litre. Bare plaster, textured surfaces and dark colours all reduce it.</p>' },
    { q: 'How many gallons for a 12x12 room?', a: '<p>A 12 × 12 ft room with 8 ft walls has 384 sq ft of wall. After a door and two windows, roughly 334 sq ft — about 0.9 gallons per coat, so 2 gallons covers two coats with some left over.</p>' },
    { q: 'Do I subtract windows and doors?', a: '<p>Yes, and this calculator does it for you at about 1.9 m² per door and 1.4 m² per window. For unusually large windows or patio doors, measure them and reduce the room dimensions accordingly.</p>' },
    { q: 'Do I need primer?', a: '<p>On bare plaster, wood, metal or over a dramatic colour change, yes. On a previously painted wall in a similar shade, no — two coats of emulsion is enough.</p>' },
    { q: 'Why does the tin claim more coverage than this?', a: '<p>Manufacturer figures assume ideal conditions: smooth, sealed, previously painted surfaces and an even application. Real walls, cutting in and roller loss all reduce it, which is why this calculator uses a slightly conservative figure.</p>' },
  ],

  related: ['unit-converter', 'budget-tracker', 'percentage-calculator', 'electricity-bill-estimator'],
};
