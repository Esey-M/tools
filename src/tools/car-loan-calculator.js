export default {
  slug: 'car-loan-calculator',
  category: 'calculators',
  title: 'Car Loan Calculator – Payment With Tax, Trade-In and Fees',
  h1: 'Car Loan Calculator',
  cardText: 'Real monthly payment on a car, including tax, trade-in and dealer fees.',
  description:
    'Free car loan calculator. Work out the monthly payment including sales tax, trade-in value, down payment and dealer fees, plus total interest over the term.',
  keywords: ['car loan calculator', 'auto loan calculator', 'car payment calculator', 'car finance calculator'],
  updated: '2026-09-04',
  disclaimer: 'An estimate. The dealer’s finance agreement is the binding figure.',
  lede: 'Dealers quote the monthly payment. This shows what the car actually costs once tax, fees and interest are all counted.',

  form: `
<div class="row">
  <div class="field">
    <label for="price">Vehicle price</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="price" inputmode="decimal" min="0" step="500" value="28000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="down">Down payment</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="down" inputmode="decimal" min="0" step="500" value="4000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="trade">Trade-in value</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="trade" inputmode="decimal" min="0" step="500" value="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="rate">Interest rate (APR)</label>
    <div class="input-group"><input type="number" id="rate" inputmode="decimal" min="0" max="40" step="0.01" value="7.2"><span class="addon">%</span></div>
  </div>
  <div class="field">
    <label for="term">Term</label>
    <select id="term">
      <option value="36">36 months</option>
      <option value="48">48 months</option>
      <option value="60" selected>60 months</option>
      <option value="72">72 months</option>
      <option value="84">84 months</option>
    </select>
  </div>
  <div class="field">
    <label for="tax">Sales tax</label>
    <div class="input-group"><input type="number" id="tax" inputmode="decimal" min="0" max="25" step="0.01" value="6"><span class="addon">%</span></div>
  </div>
  <div class="field">
    <label for="fees">Dealer fees</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="fees" inputmode="decimal" min="0" step="50" value="700" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Monthly payment</div>
  <div class="result-value" id="payment">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Amount financed</dt><dd id="financed">—</dd></div>
    <div class="stat"><dt>Total interest</dt><dd id="interest">—</dd></div>
    <div class="stat"><dt>Total cost of the car</dt><dd id="total">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Same car, different terms</h2>
  <div class="table-scroll"><table id="terms"><thead><tr><th>Term</th><th>Monthly</th><th>Total interest</th><th>Total paid</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  var money2 = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; };

  function payment(principal, annualRate, months){
    if (principal <= 0) return 0;
    var r = annualRate / 100 / 12;
    return r === 0 ? principal / months : principal * r / (1 - Math.pow(1 + r, -months));
  }

  function financedAmount(){
    var price = num('price', 0);
    var down = num('down', 0);
    var trade = num('trade', 0);
    var taxRate = num('tax', 0);
    var fees = num('fees', 0);

    // Most US states tax the price after the trade-in is deducted.
    var taxable = Math.max(0, price - trade);
    var tax = taxable * taxRate / 100;
    return { financed: Math.max(0, price + tax + fees - down - trade), tax: tax, price: price, down: down, trade: trade, fees: fees };
  }

  function calc(){
    var f = financedAmount();
    var rate = num('rate', 0);
    var months = parseInt($('term').value, 10);

    var pay = payment(f.financed, rate, months);
    var totalPaid = pay * months;
    var interest = totalPaid - f.financed;

    $('payment').textContent = money2(pay);
    $('financed').textContent = money(f.financed);
    $('interest').textContent = money(interest);
    $('total').textContent = money(f.down + f.trade + totalPaid);
    $('note').textContent = money(f.price) + ' vehicle + ' + money(f.tax) + ' tax + ' + money(f.fees) +
      ' fees − ' + money(f.down + f.trade) + ' down and trade-in = ' + money(f.financed) + ' financed at ' + rate + '%.';

    var rows = [36, 48, 60, 72, 84].map(function(m){
      var p = payment(f.financed, rate, m);
      var t = p * m;
      return '<tr' + (m === months ? ' style="background:var(--accent-soft)"' : '') + '><td>' + m + ' months</td><td>' +
        money2(p) + '</td><td>' + money(t - f.financed) + '</td><td>' + money(t) + '</td></tr>';
    }).join('');
    $('terms').querySelector('tbody').innerHTML = rows;
  }

  ['price','down','trade','rate','term','tax','fees'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'What a car actually costs to finance',
  answer: `<p><strong>The amount you finance is the price plus sales tax and dealer fees, minus your down payment and trade-in.</strong> On a $28,000 car with $4,000 down, 6% tax and $700 in fees, you finance $26,380 — not $24,000, because tax and fees get rolled in. At 7.2% over 60 months that is a $524.85 monthly payment and $5,111 of interest. The single most useful habit when buying a car is to negotiate the total price, never the monthly payment.</p>`,

  steps: [
    'Enter the vehicle price you have agreed.',
    'Add your down payment and any trade-in value.',
    'Enter the APR and choose a term.',
    'Set your local sales tax and the dealer fees from the quote.',
  ],

  sections: [
    {
      id: 'monthly-trap',
      h2: 'Why dealers ask what payment you want',
      html: `<p>"What monthly payment are you looking for?" is the most consequential question in a car showroom, and answering it directly hands over most of your negotiating position.</p>
<p>Once a target payment is known, the price, the term, the trade-in value and the rate can all be adjusted to hit it — and a longer term hides a higher price completely. The table above shows the same financed amount across five terms: the monthly figure drops steadily while total interest climbs.</p>
<p>Negotiate the out-the-door price first, as a single number including tax and fees. Only once that is fixed should financing be discussed, and arriving with a pre-approved rate from your own bank gives you something concrete to beat.</p>`,
    },
    {
      id: 'long-terms',
      h2: 'The trouble with 72 and 84 month loans',
      html: `<p>Long car loans have become normal, and they carry a specific risk that mortgages do not: the asset falls in value much faster than the loan balance.</p>
<p>A new car typically loses 20% in its first year and around 60% over five. On an 84-month loan with a small down payment, you can spend three or four years owing more than the car is worth — <em>negative equity</em>. If the car is written off or you need to sell, you must find the difference in cash.</p>
<p>The conventional guideline is 20/4/10: put 20% down, borrow for no more than 4 years, and keep total transport costs under 10% of gross income. It is stricter than most people follow, and it reliably keeps you the right side of the depreciation curve.</p>`,
    },
    {
      id: 'fees',
      h2: 'Which dealer fees are real',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Fee</th><th>Legitimate?</th></tr></thead>
<tbody>
<tr><td>Sales tax</td><td>Yes — set by your state</td></tr>
<tr><td>Title and registration</td><td>Yes — government charge, passed through</td></tr>
<tr><td>Documentation fee</td><td>Partly — real but often inflated; capped in some states</td></tr>
<tr><td>Destination charge</td><td>Yes — on new cars, set by the manufacturer</td></tr>
<tr><td>Dealer preparation</td><td>Usually not — often already covered by the destination charge</td></tr>
<tr><td>VIN etching, paint protection, fabric guard</td><td>Rarely worth it — high margin add-ons</td></tr>
<tr><td>Advertising fee</td><td>Negotiable — this is the dealer’s marketing cost</td></tr>
</tbody></table></div>
<p>Ask for the out-the-door price in writing before agreeing anything. Fees that appear only at signing are the ones worth challenging.</p>`,
    },
  ],

  faq: [
    { q: 'Is sales tax charged on the trade-in value?', a: '<p>In most US states, no — tax applies to the price after the trade-in is deducted, which is a genuine saving over selling privately. A handful of states tax the full price. This calculator uses the more common rule.</p>' },
    { q: 'What is a good car loan rate?', a: '<p>It depends heavily on credit score and whether the car is new or used. Used-car rates typically run two to four percentage points above new. Getting pre-approved by a bank or credit union before visiting the dealer gives you a benchmark.</p>' },
    { q: 'Should I take the 0% finance offer or the cash rebate?', a: '<p>Compare properly: work out the total paid under 0% at full price, against the rebated price financed at your own bank’s rate. On lower-priced cars the rebate often wins.</p>' },
    { q: 'How much should I put down?', a: '<p>20% on a new car is the common guideline. It offsets first-year depreciation and keeps you from going underwater, which matters most in the first two years.</p>' },
    { q: 'Does this include insurance and running costs?', a: '<p>No — only the loan. Insurance, fuel, tax, servicing and tyres typically add substantially to the true monthly cost of running a car.</p>' },
  ],

  related: ['loan-calculator', 'fuel-cost-calculator', 'mortgage-calculator', 'sales-tax-calculator'],
};
