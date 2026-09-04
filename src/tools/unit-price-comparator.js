export default {
  slug: 'unit-price-comparator',
  category: 'home',
  title: 'Unit Price Calculator – Which Pack Is Actually Cheaper',
  h1: 'Unit Price Calculator',
  cardText: 'Compare pack sizes properly — the bigger box is not always cheaper.',
  description:
    'Free unit price calculator. Compare products of different sizes by price per kilo, litre or item, and see which pack is genuinely the better value.',
  keywords: ['unit price calculator', 'price per kg calculator', 'compare pack sizes', 'cost per unit', 'best value calculator'],
  updated: '2026-09-04',
  lede: 'Enter two or more options and see the real price per unit. The big pack is cheaper surprisingly often — but not always.',

  form: `
<div class="field">
  <label for="unit">Compare by</label>
  <select id="unit">
    <option value="g" selected>Weight (g / kg)</option>
    <option value="ml">Volume (ml / litre)</option>
    <option value="item">Number of items</option>
  </select>
</div>

<div class="field">
  <span class="field-label">Options</span>
  <div class="up-head"><span>Label</span><span>Price</span><span id="qtyhead">Size (g)</span><span></span></div>
  <div id="rows" class="up-rows"></div>
  <button type="button" class="btn btn-ghost" id="addrow" style="margin-top:9px">+ Add another</button>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Best value</div>
  <div class="result-value" id="best" style="font-size:1.7rem">—</div>
  <div class="result-note" id="note"></div>
</div>

<div id="table-wrap" hidden style="margin-top:20px">
  <div class="table-scroll"><table id="table"><thead><tr><th>Option</th><th>Price</th><th>Size</th><th id="uh">Per kg</th><th>vs best</th></tr></thead><tbody></tbody></table></div>
</div>`,

  css: `
.up-head,.up-row{display:grid;grid-template-columns:1fr 110px 120px 38px;gap:8px;align-items:center}
.up-head{font-size:.76rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3);font-weight:640;
  margin-bottom:7px;padding:0 2px}
.up-rows{display:flex;flex-direction:column;gap:8px}
.up-row button{width:36px;height:38px;border:1px solid var(--line-strong);background:var(--bg);
  border-radius:var(--radius-sm);color:var(--ink-3);cursor:pointer;font-size:1.1rem;line-height:1}
.up-row button:hover{border-color:var(--danger);color:var(--danger)}
@media (max-width:560px){.up-head{display:none}.up-row{grid-template-columns:1fr 1fr}.up-row input[type=text]{grid-column:1/-1}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var UNITS = {
    g:    { qty: 'Size (g)',   per: 'Per kg',    factor: 1000, label: 'kg' },
    ml:   { qty: 'Size (ml)',  per: 'Per litre', factor: 1000, label: 'litre' },
    item: { qty: 'Items',      per: 'Per item',  factor: 1,    label: 'item' }
  };

  function money(n){
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: n < 1 ? 3 : 2 });
  }

  function addRow(label, price, qty){
    var div = document.createElement('div');
    div.className = 'up-row';
    div.innerHTML =
      '<input type="text" placeholder="Own brand 500g" value="' + (label || '') + '" aria-label="Label">' +
      '<input type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="' +
        (price == null ? '' : price) + '" aria-label="Price">' +
      '<input type="number" inputmode="decimal" min="0" step="1" placeholder="500" value="' +
        (qty == null ? '' : qty) + '" aria-label="Size">' +
      '<button type="button" aria-label="Remove">×</button>';
    div.querySelector('button').addEventListener('click', function(){ div.remove(); calc(); });
    div.querySelectorAll('input').forEach(function(i){ i.addEventListener('input', calc); });
    $('rows').appendChild(div);
  }

  function calc(){
    var u = UNITS[$('unit').value];
    $('qtyhead').textContent = u.qty;
    $('uh').textContent = u.per;

    var rows = [].slice.call($('rows').children).map(function(r, i){
      var inputs = r.querySelectorAll('input');
      var price = parseFloat(inputs[1].value);
      var qty = parseFloat(inputs[2].value);
      return {
        label: inputs[0].value.trim() || ('Option ' + (i + 1)),
        price: price, qty: qty,
        unit: (isFinite(price) && isFinite(qty) && qty > 0) ? price / qty * u.factor : NaN
      };
    }).filter(function(r){ return isFinite(r.unit); });

    if (rows.length < 1) { $('out').hidden = true; $('table-wrap').hidden = true; return; }

    var best = rows.reduce(function(a, b){ return b.unit < a.unit ? b : a; });
    $('best').textContent = best.label + ' — ' + money(best.unit) + ' per ' + u.label;

    if (rows.length > 1) {
      var worst = rows.reduce(function(a, b){ return b.unit > a.unit ? b : a; });
      var saving = (worst.unit - best.unit) / worst.unit * 100;
      $('note').textContent = saving > 0.5
        ? 'That is ' + saving.toFixed(0) + '% cheaper per ' + u.label + ' than ' + worst.label + '.'
        : 'All the options are priced within half a percent of each other — buy whichever suits.';
    } else {
      $('note').textContent = 'Add another option to compare.';
    }

    $('table').querySelector('tbody').innerHTML = rows
      .slice().sort(function(a, b){ return a.unit - b.unit; })
      .map(function(r){
        var diff = (r.unit - best.unit) / best.unit * 100;
        return '<tr' + (r === best ? ' style="background:var(--accent-soft);font-weight:600"' : '') + '>' +
          '<td>' + r.label.replace(/[<>&]/g, '') + '</td><td>' + money(r.price) + '</td><td>' + r.qty + '</td>' +
          '<td>' + money(r.unit) + '</td><td>' + (diff < 0.05 ? 'best' : '+' + diff.toFixed(0) + '%') + '</td></tr>';
      }).join('');

    $('out').hidden = false; $('table-wrap').hidden = false;
  }

  $('addrow').addEventListener('click', function(){ addRow(); calc(); });
  $('unit').addEventListener('change', calc);

  addRow('Small pack', 2.50, 400);
  addRow('Large pack', 4.20, 750);
  addRow('', null, null);
  calc();
})();`,

  answerHeading: 'Why the big pack is not always cheaper',
  answer: `<p><strong>Unit price is total price divided by size, and it is the only number that lets you compare packs honestly.</strong> A 400 g pack at $2.50 is $6.25 per kilo; a 750 g pack at $4.20 is $5.60 per kilo — so the big one wins by 10%. But this reverses more often than people assume. Studies of supermarket shelves repeatedly find larger packs priced <em>above</em> smaller ones per unit, particularly on promoted lines, because shoppers assume bigger means better value and stop checking.</p>`,

  steps: [
    'Choose whether you are comparing by weight, volume or item count.',
    'Enter the price and size of each option.',
    'The cheapest per unit is highlighted, with the percentage gap to the others.',
  ],

  sections: [
    {
      id: 'traps',
      h2: 'Shelf pricing traps',
      html: `<ul>
<li><strong>Different units on adjacent labels.</strong> One shows price per 100 g, the next per kilo. They are not comparable at a glance, which is the point.</li>
<li><strong>Multibuys that are not savings.</strong> "3 for $5" is only a deal if $1.67 beats the single price — sometimes it does not.</li>
<li><strong>Shrinkflation.</strong> The pack looks the same but holds 10% less. Only the unit price catches it.</li>
<li><strong>Bigger pack, higher unit price.</strong> Common on promoted lines and premium brands, precisely because shoppers assume otherwise.</li>
<li><strong>Waste is a real cost.</strong> The larger pack is not cheaper if a third of it goes off before you use it.</li>
</ul>`,
    },
    {
      id: 'labels',
      h2: 'Reading the shelf label',
      html: `<p>In the UK, EU and most of Australia, retailers are legally required to display a unit price on the shelf edge. In the US it varies by state, though most large chains show it voluntarily.</p>
<p>It is almost always in small print beneath the headline price, and it is the number worth looking at. The catch is that stores are not always required to use consistent units across similar products, which is exactly when a calculator earns its keep.</p>`,
    },
  ],

  faq: [
    { q: 'How do I work out price per kilo?', a: '<p>Divide the price by the weight in grams, then multiply by 1,000. A $2.50 pack of 400 g is 2.50 ÷ 400 × 1000 = $6.25 per kilo.</p>' },
    { q: 'Is the bigger pack usually cheaper?', a: '<p>Usually but not reliably. Shelf surveys regularly find larger packs priced higher per unit, especially on promotions, so it is worth checking rather than assuming.</p>' },
    { q: 'Can I compare different units, like grams and kilos?', a: '<p>Convert to the same unit first — 1 kg is 1,000 g. The calculator expects all options in the same unit.</p>' },
    { q: 'Does this account for offers like 3 for 2?', a: '<p>Not automatically. Enter the total price you would actually pay and the total quantity you would get, and the comparison works.</p>' },
  ],

  related: ['grocery-list-maker', 'discount-calculator', 'percentage-calculator', 'budget-tracker'],
};
