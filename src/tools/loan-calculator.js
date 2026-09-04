export default {
  slug: 'loan-calculator',
  category: 'calculators',
  title: 'Loan Calculator – Monthly Payment, Interest and Total Cost',
  h1: 'Loan Calculator',
  cardText: 'Monthly repayment, total interest and full cost for any loan amount and rate.',
  description:
    'Free loan and EMI calculator. Enter the amount, interest rate and term to see your monthly payment, the total interest you will pay, and the full cost of the loan.',
  keywords: ['loan calculator', 'emi calculator', 'monthly payment calculator', 'loan repayment', 'interest calculator'],
  updated: '2026-09-04',
  disclaimer: 'Figures are estimates. Your lender’s quote is the one that counts.',
  lede: 'Enter what you want to borrow, the interest rate and how long you need. You will see the monthly payment and, just as importantly, what the loan costs you in total.',

  form: `
<div class="row">
  <div class="field">
    <label for="amt">Loan amount</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="amt" inputmode="decimal" min="0" step="100" placeholder="25000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field">
    <label for="rate">Annual interest rate</label>
    <div class="input-group">
      <input type="number" id="rate" inputmode="decimal" min="0" max="100" step="0.01" placeholder="7.5">
      <span class="addon">% APR</span>
    </div>
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="years">Loan term</label>
    <div class="input-group">
      <input type="number" id="years" inputmode="decimal" min="0" max="60" step="1" placeholder="5">
      <span class="addon">years</span>
    </div>
  </div>
  <div class="field">
    <label for="extra">Extra monthly payment <span class="hint">(optional)</span></label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="extra" inputmode="decimal" min="0" step="10" placeholder="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Monthly payment</div>
  <div class="result-value" id="pay">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Total interest</dt><dd id="int">—</dd></div>
    <div class="stat"><dt>Total repaid</dt><dd id="tot">—</dd></div>
    <div class="stat"><dt>Payments</dt><dd id="n">—</dd></div>
  </dl>
  <div id="saved" hidden style="margin-top:14px" class="notice notice-warn"></div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter an amount, a rate and a term.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var out = $('out'), prompt = $('prompt');
  var money = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function(id){ var v = parseFloat($(id).value); return isFinite(v) ? v : NaN; };

  // Amortise month by month so an extra payment can shorten the term.
  function amortise(principal, monthlyRate, payment, cap){
    var balance = principal, interest = 0, months = 0;
    while (balance > 0.005 && months < cap) {
      var i = balance * monthlyRate;
      var principalPart = payment - i;
      if (principalPart <= 0) return null;   // payment never clears the interest
      if (principalPart > balance) { payment = balance + i; principalPart = balance; }
      interest += i;
      balance -= principalPart;
      months++;
    }
    return { interest: interest, months: months };
  }

  function calc(){
    var P = num('amt'), annual = num('rate'), years = num('years');
    var extra = num('extra'); if (!isFinite(extra) || extra < 0) extra = 0;
    if (!(P > 0) || !(years > 0) || isNaN(annual) || annual < 0) { out.hidden = true; prompt.hidden = false; return; }

    var n = Math.round(years * 12);
    var r = annual / 100 / 12;

    // Standard amortising payment; the zero-rate case is a plain division.
    var base = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));
    if (!isFinite(base)) { out.hidden = true; return; }

    var scheduled = amortise(P, r, base + extra, 1200);
    var interest = scheduled ? scheduled.interest : base * n - P;
    var months = scheduled ? scheduled.months : n;

    $('pay').textContent = money(base + extra);
    $('int').textContent = money(interest);
    $('tot').textContent = money(P + interest);
    $('n').textContent = months + ' months';
    $('note').textContent = 'Borrowing ' + money(P) + ' at ' + annual + '% over ' +
      (months === n ? years + (years === 1 ? ' year' : ' years') : (months / 12).toFixed(1) + ' years');

    if (extra > 0) {
      var plain = amortise(P, r, base, 1200);
      var savedInt = (plain ? plain.interest : 0) - interest;
      var savedMonths = (plain ? plain.months : n) - months;
      $('saved').hidden = false;
      $('saved').textContent = 'Paying ' + money(extra) + ' extra each month clears the loan ' +
        savedMonths + ' months early and saves ' + money(Math.max(0, savedInt)) + ' in interest.';
    } else {
      $('saved').hidden = true;
    }

    out.hidden = false; prompt.hidden = true;
  }

  ['amt','rate','years','extra'].forEach(function(id){ $(id).addEventListener('input', calc); });
})();`,

  answerHeading: 'How a loan payment is calculated',
  answer: `<p><strong>A fixed loan payment is the amount that clears both the principal and all the interest by the final month.</strong> It comes from the amortisation formula: <code>payment = P × r ÷ (1 − (1 + r)⁻ⁿ)</code>, where P is the amount borrowed, r is the monthly interest rate (annual rate ÷ 12) and n is the number of monthly payments. Borrow $25,000 at 7.5% over 5 years and the payment is $500.95 a month, which means you repay $30,057 in total — $5,057 of it interest.</p>`,

  steps: [
    'Enter the <strong>loan amount</strong> you want to borrow.',
    'Enter the <strong>annual interest rate</strong> your lender quoted, as an APR.',
    'Enter the <strong>term</strong> in years.',
    'Optionally add an <strong>extra monthly payment</strong> to see how much interest and time it saves.',
  ],

  sections: [
    {
      id: 'total-cost',
      h2: 'Look at the total cost, not just the monthly payment',
      html: `<p>Lenders advertise the monthly payment because it is the number that feels affordable. Stretching the term lowers it — and quietly raises what you pay overall.</p>
<div class="table-scroll"><table>
<thead><tr><th>Term on $25,000 at 7.5%</th><th>Monthly</th><th>Total interest</th></tr></thead>
<tbody>
<tr><td>3 years</td><td>$777.66</td><td>$2,996</td></tr>
<tr><td>5 years</td><td>$500.95</td><td>$5,057</td></tr>
<tr><td>7 years</td><td>$383.46</td><td>$7,210</td></tr>
</tbody></table></div>
<p>Going from three years to seven cuts the monthly payment by half, and more than doubles the interest. Whenever you can carry the higher payment comfortably, the shorter term is cheaper.</p>`,
    },
    {
      id: 'apr',
      h2: 'APR and interest rate are not the same thing',
      html: `<p>The <strong>interest rate</strong> is what you pay for borrowing the money. The <strong>APR</strong> folds in compulsory fees — origination charges, broker fees, some insurance — and expresses the lot as a yearly percentage.</p>
<p>APR is the number to compare between lenders, because a low headline rate with a 3% origination fee can cost more than a higher rate with none. Enter the APR above for the most realistic estimate.</p>`,
    },
    {
      id: 'extra',
      h2: 'Why overpaying works so well early on',
      html: `<p>In the first months of a loan, most of your payment goes to interest and only a little touches the balance. Every extra dollar you pay skips straight to the principal, so it removes all the future interest that dollar would have generated.</p>
<p>On the $25,000 example, an extra $100 a month clears the loan 11 months early and saves about $1,014 in interest. The same $100 added in the final year would save almost nothing.</p>
<p>Before overpaying, check your agreement for early repayment charges — they are uncommon on personal loans but routine on some mortgages.</p>`,
    },
  ],

  faq: [
    { q: 'What is EMI?', a: '<p>EMI stands for Equated Monthly Instalment — the fixed amount you pay each month until a loan is cleared. It is the same figure this calculator produces, and the same amortisation formula is used worldwide.</p>' },
    { q: 'Why does so much of my early payment go to interest?', a: '<p>Interest is charged on the balance you still owe, which is largest at the start. As the balance falls, the interest portion shrinks and more of each identical payment attacks the principal.</p>' },
    { q: 'Does this calculator include fees and insurance?', a: '<p>Only if you build them into the rate by entering the APR rather than the headline interest rate. Fees paid separately at closing are not included in the loan amount unless you add them yourself.</p>' },
    { q: 'Can I use this for a car loan or a mortgage?', a: '<p>Yes. Any fixed-rate amortising loan uses this same maths. For a mortgage, remember that property taxes, buildings insurance and any HOA fees sit on top of the payment shown here.</p>' },
    { q: 'What happens if the rate is 0%?', a: '<p>The calculator handles it: the payment is simply the amount divided by the number of months, and total interest is zero. This is how many promotional finance offers work.</p>' },
  ],

  related: ['compound-interest-calculator', 'mortgage-calculator', 'car-loan-calculator', 'percentage-calculator'],
};
