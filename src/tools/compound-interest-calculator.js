export default {
  slug: 'compound-interest-calculator',
  category: 'calculators',
  title: 'Compound Interest Calculator – See Your Savings Grow',
  h1: 'Compound Interest Calculator',
  cardText: 'How savings grow over time with regular contributions and compounding.',
  description:
    'Free compound interest calculator. See how savings grow with regular contributions, any compounding frequency, and a year-by-year breakdown of interest earned.',
  keywords: ['compound interest calculator', 'savings calculator', 'investment growth', 'interest calculator'],
  updated: '2026-09-04',
  disclaimer: 'Projections assume a constant rate of return. Real investments fluctuate.',
  lede: 'Enter a starting amount, what you add each month, and an expected rate. The table shows exactly how much of the final figure is your money and how much the interest earned.',

  form: `
<div class="row">
  <div class="field">
    <label for="p">Starting amount</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="p" inputmode="decimal" min="0" step="100" value="1000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field">
    <label for="add">Added each month</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="add" inputmode="decimal" min="0" step="25" value="200" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="rate">Annual return</label>
    <div class="input-group">
      <input type="number" id="rate" inputmode="decimal" min="0" max="100" step="0.1" value="7">
      <span class="addon">%</span>
    </div>
  </div>
  <div class="field">
    <label for="years">Years</label>
    <input type="number" id="years" inputmode="numeric" min="1" max="70" step="1" value="20">
  </div>
  <div class="field">
    <label for="freq">Compounding</label>
    <select id="freq">
      <option value="12" selected>Monthly</option>
      <option value="4">Quarterly</option>
      <option value="1">Yearly</option>
      <option value="365">Daily</option>
    </select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Final balance</div>
  <div class="result-value" id="total">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>You put in</dt><dd id="contrib">—</dd></div>
    <div class="stat"><dt>Interest earned</dt><dd id="int">—</dd></div>
    <div class="stat"><dt>Interest share</dt><dd id="share">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:9px">Year by year</h2>
  <div class="table-scroll"><table id="tbl"><thead><tr><th>Year</th><th>You put in</th><th>Interest</th><th>Balance</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) ? v : d; };

  function calc(){
    var P = num('p', 0), add = num('add', 0), rate = num('rate', 0);
    var years = Math.max(1, Math.min(70, Math.round(num('years', 1))));
    var n = parseInt($('freq').value, 10);

    var r = rate / 100 / n;
    var balance = P;
    var contributed = P;
    var rows = [];

    // Step period by period; monthly deposits are added at each month boundary.
    var periodsPerYear = n;
    var monthsPerPeriod = 12 / n;
    for (var y = 1; y <= years; y++) {
      var startBalance = balance;
      var yearContrib = 0;
      for (var i = 0; i < periodsPerYear; i++) {
        var deposit = add * monthsPerPeriod;
        balance += deposit;
        contributed += deposit;
        yearContrib += deposit;
        balance *= (1 + r);
      }
      rows.push([y, yearContrib, balance - startBalance - yearContrib, balance]);
    }

    var interest = balance - contributed;
    $('total').textContent = money(balance);
    $('contrib').textContent = money(contributed);
    $('int').textContent = money(interest);
    $('share').textContent = balance > 0 ? (interest / balance * 100).toFixed(1) + '%' : '—';
    $('note').textContent = 'After ' + years + (years === 1 ? ' year' : ' years') + ' at ' + rate + '%, compounded ' +
      $('freq').options[$('freq').selectedIndex].text.toLowerCase() + '.';

    $('tbl').querySelector('tbody').innerHTML = rows.map(function(row){
      return '<tr><td>' + row[0] + '</td><td>' + money(row[1]) + '</td><td>' + money(row[2]) + '</td><td><strong>' + money(row[3]) + '</strong></td></tr>';
    }).join('');
  }

  ['p','add','rate','years','freq'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'What compound interest actually does',
  answer: `<p><strong>Compound interest is interest earned on interest already earned.</strong> The formula is <code>A = P(1 + r/n)^(nt)</code>, where P is the starting amount, r the annual rate, n the number of compounding periods a year, and t the years. The effect is unremarkable at first and dramatic later: $1,000 growing at 7% becomes $1,967 after ten years, but $7,612 after thirty. The extra twenty years produce nearly six times as much growth as the first ten, because the later years compound on a much larger balance.</p>`,

  steps: [
    'Enter what you already have saved as the <strong>starting amount</strong>.',
    'Enter what you plan to add each month — this usually matters more than the starting balance.',
    'Set an expected annual return and the number of years.',
    'Read the year-by-year table to see when interest starts outpacing your contributions.',
  ],

  sections: [
    {
      id: 'time',
      h2: 'Why starting early beats saving more',
      html: `<p>The single most valuable input to compounding is time, and it is the one input you cannot buy back.</p>
<div class="table-scroll"><table>
<thead><tr><th>Saver</th><th>Monthly</th><th>From age</th><th>Total paid in</th><th>Value at 65 (7%)</th></tr></thead>
<tbody>
<tr><td>Starts early, stops</td><td>$200</td><td>25–35 only</td><td>$24,000</td><td>$282,600</td></tr>
<tr><td>Starts later, never stops</td><td>$200</td><td>35–65</td><td>$72,000</td><td>$245,400</td></tr>
</tbody></table></div>
<p>The first saver contributes for ten years and stops. The second contributes three times as much across thirty years — and ends up with less. The difference is that the early saver's money spent an extra decade compounding.</p>`,
    },
    {
      id: 'rule72',
      h2: 'The rule of 72',
      html: `<p>To estimate how long money takes to double, divide 72 by the annual return.</p>
<div class="table-scroll"><table>
<thead><tr><th>Annual return</th><th>72 ÷ rate</th><th>Actual doubling time</th></tr></thead>
<tbody>
<tr><td>3%</td><td>24 years</td><td>23.4 years</td></tr>
<tr><td>6%</td><td>12 years</td><td>11.9 years</td></tr>
<tr><td>9%</td><td>8 years</td><td>8.0 years</td></tr>
<tr><td>12%</td><td>6 years</td><td>6.1 years</td></tr>
</tbody></table></div>
<p>It is accurate to within a few months for rates between about 4% and 12%, which covers most realistic savings and investment returns. It works in reverse too: at 3% inflation, prices double roughly every 24 years.</p>`,
    },
    {
      id: 'inflation',
      h2: 'The number this calculator does not show',
      html: `<p>Everything above is in nominal terms. If your investment returns 7% while inflation runs at 3%, your <strong>real</strong> return is about 4% — that is the figure that determines what your money will actually buy.</p>
<p>A simple way to plan in today's money: enter your real return rather than the nominal one. Instead of 7%, enter 4%. The final balance then represents purchasing power in today's terms, which is far more meaningful than a large nominal figure decades away.</p>`,
    },
  ],

  faq: [
    { q: 'What is the difference between simple and compound interest?', a: '<p>Simple interest is calculated only on the original amount. Compound interest is calculated on the original amount plus all interest already added. Over one year they are nearly identical; over thirty years compound interest produces several times more.</p>' },
    { q: 'Does compounding frequency make much difference?', a: '<p>Less than people expect. On $10,000 at 7% for ten years, annual compounding gives $19,672, monthly gives $20,097 and daily gives $20,136 — about 2% more overall. Moving from annual to monthly captures almost all of the benefit; beyond that the gains are negligible.</p>' },
    { q: 'What return rate should I assume?', a: '<p>There is no correct answer, only a defensible one. Historically, a globally diversified stock portfolio has returned roughly 7% a year after inflation over long periods, with severe year-to-year variation. Savings accounts return far less. Use a conservative figure and treat the result as a projection, not a promise.</p>' },
    { q: 'Is the monthly contribution added before or after interest?', a: '<p>Before. Each period the deposit is added first and the whole balance then earns interest, which matches how most savings accounts and pension contributions actually work.</p>' },
    { q: 'Does this account for tax?', a: '<p>No. Returns in a taxable account are reduced by tax on interest, dividends and gains, which varies enormously by country and account type. Tax-sheltered accounts avoid much of this, which is a large part of why they are worth using.</p>' },
  ],

  related: ['loan-calculator', 'percentage-calculator', 'retirement-calculator', 'mortgage-calculator'],
};
