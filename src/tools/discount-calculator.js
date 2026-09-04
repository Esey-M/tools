export default {
  slug: 'discount-calculator',
  category: 'calculators',
  title: 'Discount Calculator – Sale Price and How Much You Save',
  h1: 'Discount Calculator',
  cardText: 'Final sale price and your saving, including stacked and double discounts.',
  description:
    'Free discount calculator. Enter a price and percentage off to see the sale price and what you save. Handles stacked discounts and sales tax too.',
  keywords: ['discount calculator', 'sale price calculator', 'percent off calculator', 'how much do i save'],
  updated: '2026-09-04',
  lede: 'Enter the original price and the discount to see what you actually pay — including a second discount if the sale stacks one on top of another.',

  form: `
<div class="row">
  <div class="field">
    <label for="price">Original price</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="price" inputmode="decimal" min="0" step="0.01" placeholder="80.00" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field">
    <label for="off">Discount</label>
    <div class="input-group">
      <input type="number" id="off" inputmode="decimal" min="0" max="100" step="1" placeholder="25">
      <span class="addon">% off</span>
    </div>
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="off2">Extra discount at checkout <span class="hint">(optional)</span></label>
    <div class="input-group">
      <input type="number" id="off2" inputmode="decimal" min="0" max="100" step="1" placeholder="0">
      <span class="addon">% off</span>
    </div>
  </div>
  <div class="field">
    <label for="tax">Sales tax <span class="hint">(optional)</span></label>
    <div class="input-group">
      <input type="number" id="tax" inputmode="decimal" min="0" max="50" step="0.01" placeholder="0">
      <span class="addon">%</span>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">You pay</div>
  <div class="result-value" id="final">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>You save</dt><dd id="save">—</dd></div>
    <div class="stat"><dt>Effective discount</dt><dd id="eff">—</dd></div>
    <div class="stat"><dt>Before tax</dt><dd id="pre">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter a price and a discount.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var out = $('out'), prompt = $('prompt');
  var money = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function(id, dflt){ var v = parseFloat($(id).value); return isFinite(v) ? v : dflt; };

  function calc(){
    var p = num('price', NaN);
    var d1 = num('off', 0), d2 = num('off2', 0), tax = num('tax', 0);
    if (!(p >= 0) || isNaN(p)) { out.hidden = true; prompt.hidden = false; return; }
    d1 = Math.min(Math.max(d1, 0), 100);
    d2 = Math.min(Math.max(d2, 0), 100);

    // Stacked discounts apply in sequence, not by addition.
    var afterFirst = p * (1 - d1 / 100);
    var pre = afterFirst * (1 - d2 / 100);
    var final = pre * (1 + tax / 100);
    var saved = p - pre;
    var eff = p > 0 ? saved / p * 100 : 0;

    $('final').textContent = money(final);
    $('save').textContent = money(saved);
    $('eff').textContent = (Math.round(eff * 10) / 10) + '%';
    $('pre').textContent = money(pre);
    $('note').textContent = d2 > 0
      ? d1 + '% off then a further ' + d2 + '% is ' + (Math.round(eff * 10) / 10) + '% off in total — not ' + (d1 + d2) + '%.'
      : (tax > 0 ? 'Sale price ' + money(pre) + ', plus ' + tax + '% tax.' : 'Down from ' + money(p) + '.');
    out.hidden = false; prompt.hidden = true;
  }

  ['price','off','off2','tax'].forEach(function(id){ $(id).addEventListener('input', calc); });
})();`,

  answerHeading: 'Working out a sale price',
  answer: `<p><strong>To find a sale price, multiply the original by (100 − discount) ÷ 100.</strong> A $80 jacket at 25% off costs 80 × 0.75 = $60, saving $20. The quickest mental route is to find 10% by moving the decimal one place left, then build from there: 10% of $80 is $8, so 25% is $8 + $8 + $4 = $20 off. Note that stacked discounts multiply rather than add — 20% off followed by another 20% off is 36% off in total, not 40%.</p>`,

  steps: [
    'Enter the <strong>original price</strong> on the tag.',
    'Enter the advertised <strong>percentage off</strong>.',
    'If a coupon takes a further percentage off at checkout, enter it in the second discount field.',
    'Add your local <strong>sales tax</strong> if you want the true till total.',
  ],

  sections: [
    {
      id: 'stacking',
      h2: 'Why "20% off plus an extra 20%" is not 40% off',
      html: `<p>Stacked discounts apply one after another, each to a smaller number, so they never add up to the sum of their parts.</p>
<p>On a $100 item: the first 20% takes it to $80, and the second 20% comes off the $80, removing $16 rather than $20. You pay $64 — a 36% discount, not 40%.</p>
<div class="table-scroll"><table>
<thead><tr><th>Stacked offer</th><th>Sounds like</th><th>Actually is</th></tr></thead>
<tbody>
<tr><td>20% + 20%</td><td>40% off</td><td>36% off</td></tr>
<tr><td>30% + 20%</td><td>50% off</td><td>44% off</td></tr>
<tr><td>50% + 20%</td><td>70% off</td><td>60% off</td></tr>
<tr><td>50% + 50%</td><td>100% off</td><td>75% off</td></tr>
</tbody></table></div>
<p>The general rule: the combined discount is <code>1 − (1 − d₁)(1 − d₂)</code>.</p>`,
    },
    {
      id: 'reverse',
      h2: 'Working backwards from the sale price',
      html: `<p>If you know the sale price and the discount but not the original, divide rather than multiply.</p>
<p>A jacket is $60 after 25% off. The $60 represents 75% of the original, so the original is 60 ÷ 0.75 = <strong>$80</strong>. Adding 25% to $60 would wrongly give $75.</p>
<p>The same logic strips tax: a $108 total including 8% tax has a pre-tax price of 108 ÷ 1.08 = $100.</p>`,
    },
    {
      id: 'deals',
      h2: 'What common offers are really worth',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Offer</th><th>Effective discount</th></tr></thead>
<tbody>
<tr><td>Buy one get one free (BOGO)</td><td>50% off, if you want both</td></tr>
<tr><td>Buy one get one half price</td><td>25% off across the two</td></tr>
<tr><td>Buy 2 get 1 free (3 for 2)</td><td>33.3% off</td></tr>
<tr><td>"Half price" then 20% off</td><td>60% off</td></tr>
<tr><td>Tax-free day at 8% tax</td><td>7.4% off the total</td></tr>
</tbody></table></div>
<p>Multi-buy offers are only genuine savings when you would have bought the extra item anyway.</p>`,
    },
  ],

  faq: [
    { q: 'How do I calculate 25% off?', a: '<p>Multiply the price by 0.75. For $80: 80 × 0.75 = $60. Or find a quarter of the price and subtract it — a quarter of $80 is $20, leaving $60.</p>' },
    { q: 'How do I find the original price from a sale price?', a: '<p>Divide the sale price by (100 − discount) ÷ 100. A $60 item after 25% off was 60 ÷ 0.75 = $80 originally.</p>' },
    { q: 'Do two discounts add together?', a: '<p>No. They apply in sequence, each to the reduced price. 20% then 20% gives 36% off overall. Use the second discount field above to get the exact figure.</p>' },
    { q: 'Is tax charged before or after the discount?', a: '<p>After. Sales tax is calculated on what you actually pay, so a discount reduces the tax too. This calculator applies tax to the discounted price.</p>' },
    { q: 'What is a 30% discount on $50?', a: '<p>$15 off, leaving $35. Ten percent of $50 is $5, so 30% is $15.</p>' },
  ],

  related: ['percentage-calculator', 'sales-tax-calculator', 'tip-calculator', 'budget-tracker'],
};
