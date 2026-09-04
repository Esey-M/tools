export default {
  slug: 'mortgage-calculator',
  category: 'calculators',
  title: 'Mortgage Calculator – Monthly Payment With Taxes and Insurance',
  h1: 'Mortgage Calculator',
  cardText: 'Full monthly payment including tax, insurance and PMI — not just principal and interest.',
  description:
    'Free mortgage calculator. Work out your full monthly payment including property tax, home insurance, PMI and HOA fees, plus total interest over the loan.',
  keywords: ['mortgage calculator', 'monthly mortgage payment', 'home loan calculator', 'house payment calculator', 'pmi calculator'],
  updated: '2026-09-04',
  disclaimer: 'An estimate. Your lender’s loan estimate is the figure that binds.',
  lede: 'Most mortgage calculators show only principal and interest, which understates the real payment by a third or more. This one includes the rest.',

  form: `
<div class="row">
  <div class="field">
    <label for="price">Home price</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="price" inputmode="decimal" min="0" step="5000" value="400000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field">
    <label for="down">Down payment</label>
    <div class="input-group">
      <input type="number" id="down" inputmode="decimal" min="0" max="100" step="1" value="20">
      <span class="addon">%</span>
    </div>
    <span class="hint" id="downamt"></span>
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="rate">Interest rate</label>
    <div class="input-group">
      <input type="number" id="rate" inputmode="decimal" min="0" max="25" step="0.01" value="6.5">
      <span class="addon">%</span>
    </div>
  </div>
  <div class="field">
    <label for="years">Term</label>
    <select id="years">
      <option value="30" selected>30 years</option>
      <option value="20">20 years</option>
      <option value="15">15 years</option>
      <option value="10">10 years</option>
    </select>
  </div>
</div>

<details style="margin-top:6px" open>
  <summary style="cursor:pointer;font-weight:560;font-size:.92rem;color:var(--ink-2);margin-bottom:12px">Taxes, insurance and fees</summary>
  <div class="row">
    <div class="field">
      <label for="tax">Property tax per year</label>
      <div class="input-group">
        <input type="number" id="tax" inputmode="decimal" min="0" max="10" step="0.01" value="1.1">
        <span class="addon">% of value</span>
      </div>
    </div>
    <div class="field">
      <label for="ins">Home insurance per year</label>
      <div class="input-group">
        <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
        <input type="number" id="ins" inputmode="decimal" min="0" step="100" value="1800" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
      </div>
    </div>
    <div class="field">
      <label for="hoa">HOA per month</label>
      <div class="input-group">
        <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
        <input type="number" id="hoa" inputmode="decimal" min="0" step="25" value="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
      </div>
    </div>
  </div>
</details>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Total monthly payment</div>
  <div class="result-value" id="total">—</div>
  <div class="result-note" id="note"></div>
  <div class="pay-breakdown" id="breakdown"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Loan amount</dt><dd id="loan">—</dd></div>
    <div class="stat"><dt>Total interest</dt><dd id="interest">—</dd></div>
    <div class="stat"><dt>Total paid</dt><dd id="paid">—</dd></div>
  </dl>
</div>`,

  css: `
.pay-breakdown{margin-top:14px;display:flex;flex-direction:column;gap:6px}
.pay-line{display:flex;align-items:center;gap:11px;font-size:.9rem}
.pay-line .sw{width:11px;height:11px;border-radius:3px;flex:none}
.pay-line .nm{flex:1;color:var(--ink-2)}
.pay-line b{font-variant-numeric:tabular-nums;font-weight:600}
.pay-bar{display:flex;height:11px;border-radius:999px;overflow:hidden;margin:12px 0 6px;border:1px solid var(--line)}
.pay-bar i{display:block}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  var money2 = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) ? v : d; };

  var COLORS = ['#0f7d6b', '#4f9ee8', '#e8a33d', '#9b7fd4', '#7a8794'];

  function calc(){
    var price = num('price', 0);
    var downPct = Math.min(100, Math.max(0, num('down', 0)));
    var rate = num('rate', 0);
    var years = parseInt($('years').value, 10);
    var taxPct = num('tax', 0);
    var insYear = num('ins', 0);
    var hoa = num('hoa', 0);

    var downAmt = price * downPct / 100;
    var loan = Math.max(0, price - downAmt);
    $('downamt').textContent = money(downAmt) + ' down';

    var n = years * 12;
    var r = rate / 100 / 12;
    var pi = loan === 0 ? 0 : (r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n)));

    var taxMonth = price * taxPct / 100 / 12;
    var insMonth = insYear / 12;

    // PMI is typically required below 20% equity; ~0.5%/yr of the loan is a common estimate.
    var pmiMonth = downPct < 20 ? loan * 0.005 / 12 : 0;

    var total = pi + taxMonth + insMonth + pmiMonth + hoa;

    $('total').textContent = money2(total);
    $('loan').textContent = money(loan);
    $('interest').textContent = money(pi * n - loan);
    $('paid').textContent = money(pi * n);
    $('note').textContent = money(loan) + ' borrowed at ' + rate + '% over ' + years + ' years' +
      (pmiMonth > 0 ? '. PMI is included because the down payment is under 20%.' : '.');

    var parts = [
      ['Principal & interest', pi],
      ['Property tax', taxMonth],
      ['Home insurance', insMonth],
      ['PMI', pmiMonth],
      ['HOA', hoa]
    ].filter(function(p){ return p[1] > 0; });

    $('breakdown').innerHTML =
      '<div class="pay-bar">' + parts.map(function(p, i){
        return '<i style="flex:' + p[1] + ';background:' + COLORS[i % COLORS.length] + '"></i>';
      }).join('') + '</div>' +
      parts.map(function(p, i){
        return '<div class="pay-line"><span class="sw" style="background:' + COLORS[i % COLORS.length] + '"></span>' +
          '<span class="nm">' + p[0] + '</span><b>' + money2(p[1]) + '</b></div>';
      }).join('');
  }

  ['price','down','rate','years','tax','ins','hoa'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'What your mortgage payment is actually made of',
  answer: `<p><strong>A mortgage payment is usually four things, not one — often abbreviated PITI: principal, interest, taxes and insurance.</strong> On a $400,000 home with 20% down at 6.5%, principal and interest come to about $2,023 a month, but property tax and home insurance add roughly $517 more, making the real payment closer to $2,539. That is 26% higher than the figure most mortgage calculators show. If your down payment is under 20%, private mortgage insurance adds more still.</p>`,

  steps: [
    'Enter the <strong>home price</strong> and your <strong>down payment</strong> as a percentage.',
    'Enter the interest rate you have been quoted and pick a term.',
    'Adjust property tax, insurance and any HOA fee — the defaults are US national averages.',
    'Read the total, and the breakdown showing where each dollar goes.',
  ],

  sections: [
    {
      id: 'piti',
      h2: 'The four parts, explained',
      html: `<ul>
<li><strong>Principal</strong> — the portion that actually reduces what you owe. Small at first, growing every month.</li>
<li><strong>Interest</strong> — the lender's charge on the outstanding balance. Large at first, shrinking every month.</li>
<li><strong>Property tax</strong> — set by your local authority as a percentage of assessed value. The US average is around 1.1%, but it ranges from about 0.3% in Hawaii to over 2% in New Jersey.</li>
<li><strong>Home insurance</strong> — required by every lender. National average is roughly $1,800 a year, far higher in coastal and wildfire-prone regions.</li>
</ul>
<p>Taxes and insurance are usually collected monthly into an escrow account and paid on your behalf, which is why they appear in your payment rather than as separate bills.</p>`,
    },
    {
      id: 'pmi',
      h2: 'Private mortgage insurance',
      html: `<p>Put down less than 20% and lenders generally require PMI, which protects <em>them</em>, not you, if you default. It typically costs 0.3% to 1.5% of the loan per year; this calculator estimates 0.5%.</p>
<p>PMI is not permanent. Under the US Homeowners Protection Act, you can request cancellation once your balance reaches 80% of the original value, and the lender must remove it automatically at 78%. Many people forget this and keep paying for years longer than necessary.</p>
<p>On a $360,000 loan, PMI at 0.5% is $150 a month — $1,800 a year for a policy that benefits the bank.</p>`,
    },
    {
      id: 'term',
      h2: '15-year versus 30-year',
      html: `<div class="table-scroll"><table>
<thead><tr><th>$320,000 at 6.5%</th><th>30 years</th><th>15 years</th></tr></thead>
<tbody>
<tr><td>Monthly principal &amp; interest</td><td>$2,023</td><td>$2,788</td></tr>
<tr><td>Total interest</td><td>$408,142</td><td>$181,758</td></tr>
</tbody></table></div>
<p>The 15-year term costs $765 more each month and saves about $226,000 in interest. Shorter terms also usually carry a lower rate, widening the gap further.</p>
<p>The counter-argument is flexibility: a 30-year mortgage with voluntary overpayments gets you most of the interest saving while leaving you free to pay the smaller amount in a difficult month. That optionality has real value.</p>`,
    },
  ],

  faq: [
    { q: 'How much house can I afford?', a: '<p>A common guideline is that housing costs stay under 28% of gross monthly income, and all debt payments under 36%. Those are rules of thumb, not rules — your other commitments, job stability and savings matter more than the ratio.</p>' },
    { q: 'Does this include closing costs?', a: '<p>No. Closing costs typically run 2–5% of the purchase price and are paid upfront, separately from the monthly payment.</p>' },
    { q: 'What is escrow?', a: '<p>An account your lender uses to collect property tax and insurance monthly alongside your payment, then pay those bills when due. It is why those costs appear in your monthly figure.</p>' },
    { q: 'How do I get rid of PMI?', a: '<p>Request cancellation once your loan balance reaches 80% of the home’s original value. It must be removed automatically at 78%. If your home has appreciated significantly, an appraisal may let you cancel sooner.</p>' },
    { q: 'Why is my payment higher than this estimate?', a: '<p>Common reasons are a higher local tax rate than the 1.1% default, flood or earthquake insurance, HOA fees not entered, or a rate quote that included points. Compare against your lender’s Loan Estimate, which itemises everything.</p>' },
  ],

  related: ['loan-calculator', 'compound-interest-calculator', 'car-loan-calculator', 'percentage-calculator'],
};
