export default {
  slug: 'sales-tax-calculator',
  category: 'calculators',
  title: 'Sales Tax Calculator – Add or Remove Tax From a Price',
  h1: 'Sales Tax Calculator',
  cardText: 'Add tax to a price, or work backwards to strip it out of a total.',
  description:
    'Free sales tax calculator. Add tax to a net price or remove it from a gross total, with the correct reverse calculation and a table of US state rates.',
  keywords: ['sales tax calculator', 'vat calculator', 'reverse sales tax', 'add tax to price', 'tax calculator'],
  updated: '2026-09-04',
  disclaimer: 'Rates change and local surcharges vary. Check your jurisdiction for the exact figure.',
  lede: 'Enter a price and a rate. Switch direction to work backwards from a total that already includes tax.',

  form: `
<div class="field">
  <span class="field-label" id="dir-label">Direction</span>
  <div class="seg" role="group" aria-labelledby="dir-label" id="dirs">
    <button type="button" data-dir="add" aria-pressed="true">Add tax to a price</button>
    <button type="button" data-dir="remove">Remove tax from a total</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="amt" id="amtlabel">Price before tax</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="amt" inputmode="decimal" min="0" step="0.01" placeholder="100.00" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field">
    <label for="rate">Tax rate</label>
    <div class="input-group">
      <input type="number" id="rate" inputmode="decimal" min="0" max="50" step="0.001" value="8.25">
      <span class="addon">%</span>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Total including tax</div>
  <div class="result-value" id="main">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Before tax</dt><dd id="net">—</dd></div>
    <div class="stat"><dt>Tax</dt><dd id="tax">—</dd></div>
    <div class="stat"><dt>Total</dt><dd id="gross">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter an amount to see the tax.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var dir = 'add';
  var money = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  function calc(){
    var a = parseFloat($('amt').value);
    var r = parseFloat($('rate').value);
    if (!isFinite(a) || a < 0) { $('out').hidden = true; $('prompt').hidden = false; return; }
    if (!isFinite(r) || r < 0) r = 0;

    var net, tax, gross;
    if (dir === 'add') {
      net = a; tax = a * r / 100; gross = net + tax;
      $('lbl').textContent = 'Total including tax';
      $('main').textContent = money(gross);
      $('note').textContent = money(net) + ' plus ' + r + '% tax.';
    } else {
      // Divide, never subtract: the total already contains the tax.
      gross = a; net = a / (1 + r / 100); tax = gross - net;
      $('lbl').textContent = 'Price before tax';
      $('main').textContent = money(net);
      $('note').textContent = money(gross) + ' includes ' + money(tax) + ' of tax at ' + r + '%.';
    }

    $('net').textContent = money(net);
    $('tax').textContent = money(tax);
    $('gross').textContent = money(gross);
    $('out').hidden = false; $('prompt').hidden = true;
  }

  $('dirs').addEventListener('click', function(e){
    var b = e.target.closest('button[data-dir]'); if (!b) return;
    dir = b.getAttribute('data-dir');
    var btns = $('dirs').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('amtlabel').textContent = dir === 'add' ? 'Price before tax' : 'Total including tax';
    calc();
  });
  $('amt').addEventListener('input', calc);
  $('rate').addEventListener('input', calc);
})();`,

  answerHeading: 'Adding and removing sales tax',
  answer: `<p><strong>To add tax, multiply by (1 + rate). To remove it, divide by (1 + rate) — never subtract.</strong> A $100 item at 8.25% tax costs $108.25. Working backwards from that $108.25, dividing by 1.0825 correctly returns $100. Subtracting 8.25% of $108.25 would give $99.32, which is wrong by 68 cents, because the tax was charged on the smaller pre-tax figure rather than on the total.</p>`,

  steps: [
    'Choose whether you are <strong>adding</strong> tax to a net price or <strong>removing</strong> it from a total.',
    'Enter the amount.',
    'Enter your tax rate — combined state and local, if that applies where you are.',
  ],

  sections: [
    {
      id: 'reverse',
      h2: 'The reverse-tax mistake',
      html: `<p>This is the single most common error in sales tax arithmetic, and it always runs the same way — subtracting the percentage from the gross figure instead of dividing it out.</p>
<div class="table-scroll"><table>
<thead><tr><th>Total paid</th><th>Rate</th><th>Wrong (subtract)</th><th>Right (divide)</th></tr></thead>
<tbody>
<tr><td>$108.25</td><td>8.25%</td><td>$99.32</td><td>$100.00</td></tr>
<tr><td>$120.00</td><td>20%</td><td>$96.00</td><td>$100.00</td></tr>
<tr><td>$215.00</td><td>7.5%</td><td>$198.88</td><td>$200.00</td></tr>
</tbody></table></div>
<p>The gap widens as the rate rises. At 20% VAT the subtraction method is out by 4% of the whole invoice, which matters if you are reclaiming tax or filing accounts.</p>`,
    },
    {
      id: 'us-rates',
      h2: 'US sales tax basics',
      html: `<p>The United States has no national sales tax. Each state sets its own rate, and counties and cities frequently add their own on top, so the rate you actually pay is a combined figure that can vary between neighbouring towns.</p>
<div class="table-scroll"><table>
<thead><tr><th>State</th><th>State rate</th><th>Typical combined</th></tr></thead>
<tbody>
<tr><td>California</td><td>7.25%</td><td>8.85%</td></tr>
<tr><td>Texas</td><td>6.25%</td><td>8.20%</td></tr>
<tr><td>New York</td><td>4.00%</td><td>8.53%</td></tr>
<tr><td>Florida</td><td>6.00%</td><td>7.00%</td></tr>
<tr><td>Illinois</td><td>6.25%</td><td>8.86%</td></tr>
<tr><td>Tennessee</td><td>7.00%</td><td>9.55%</td></tr>
<tr><td>Delaware, Montana, New Hampshire, Oregon</td><td>None</td><td>None</td></tr>
</tbody></table></div>
<p>Combined rates are approximate averages and change regularly. Many states also exempt groceries, prescription medicine and clothing, either entirely or at a reduced rate.</p>`,
    },
    {
      id: 'vat',
      h2: 'Sales tax and VAT are not the same',
      html: `<p>Both end up taxing the consumer, but they are collected differently, and the difference shows up on the price tag.</p>
<ul>
<li><strong>US sales tax</strong> is charged once, at the final sale, and is usually <em>excluded</em> from the displayed price. The number on the shelf is not what you pay.</li>
<li><strong>VAT and GST</strong> are charged at every stage of production, with businesses reclaiming what they paid. In most countries consumer prices must be shown <em>including</em> VAT, so the shelf price is the final price.</li>
</ul>
<p>This is why visitors to the US are routinely surprised at the till, and why "remove tax from a total" is the more useful direction in Europe while "add tax to a price" is the common one in America.</p>`,
    },
  ],

  faq: [
    { q: 'How do I calculate sales tax on a purchase?', a: '<p>Multiply the pre-tax price by the tax rate as a decimal. At 8.25%, a $100 item incurs $100 × 0.0825 = $8.25 of tax, for a total of $108.25.</p>' },
    { q: 'How do I find the pre-tax price from a total?', a: '<p>Divide the total by 1 plus the rate as a decimal. From $108.25 at 8.25%: 108.25 ÷ 1.0825 = $100.00.</p>' },
    { q: 'Is sales tax charged before or after a discount?', a: '<p>After. Tax applies to the amount you actually pay, so a discount reduces the tax with it. Manufacturer coupons are sometimes treated differently, as the retailer is reimbursed for their value.</p>' },
    { q: 'Which US states have no sales tax?', a: '<p>Delaware, Montana, New Hampshire and Oregon charge no statewide sales tax. Alaska has none at state level but allows local ones, so some Alaskan towns do charge it.</p>' },
    { q: 'Do I pay sales tax on online orders?', a: '<p>Usually yes. Since the 2018 <em>South Dakota v. Wayfair</em> decision, states can require online sellers to collect tax based on where the buyer lives, so most large retailers now charge it everywhere.</p>' },
  ],

  related: ['discount-calculator', 'percentage-calculator', 'tip-calculator', 'salary-calculator'],
};
