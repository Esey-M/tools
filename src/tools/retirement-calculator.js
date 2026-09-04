export default {
  slug: 'retirement-calculator',
  category: 'calculators',
  title: 'Retirement Calculator – Will Your Savings Last?',
  h1: 'Retirement Calculator',
  cardText: 'Projects your pot at retirement and how long it lasts in today’s money.',
  description:
    'Free retirement calculator. Project your savings to retirement, see the income it supports, and how long the pot lasts — all adjusted for inflation.',
  keywords: ['retirement calculator', 'pension calculator', 'retirement savings', 'how much do i need to retire', '4 percent rule'],
  updated: '2026-09-04',
  disclaimer: 'A projection under fixed assumptions, not financial advice. Real returns vary enormously.',
  lede: 'Everything below is shown in today’s money, so the numbers mean something. A £1m pot in 30 years is not £1m of spending power.',

  form: `
<div class="row">
  <div class="field">
    <label for="age">Current age</label>
    <input type="number" id="age" inputmode="numeric" min="16" max="80" step="1" value="35">
  </div>
  <div class="field">
    <label for="retire">Retirement age</label>
    <input type="number" id="retire" inputmode="numeric" min="40" max="85" step="1" value="67">
  </div>
  <div class="field">
    <label for="until">Plan until age</label>
    <input type="number" id="until" inputmode="numeric" min="60" max="110" step="1" value="95">
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="pot">Saved so far</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="pot" inputmode="decimal" min="0" step="1000" value="60000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="monthly">Saving each month</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="monthly" inputmode="decimal" min="0" step="50" value="600" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="income">Income you want in retirement</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="income" inputmode="decimal" min="0" step="1000" value="40000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
    <span class="hint">A year, in today’s money, before state pension.</span>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="growth">Investment return</label>
    <div class="input-group"><input type="number" id="growth" inputmode="decimal" min="0" max="20" step="0.1" value="6.5"><span class="addon">% a year</span></div>
  </div>
  <div class="field">
    <label for="inflation">Inflation</label>
    <div class="input-group"><input type="number" id="inflation" inputmode="decimal" min="0" max="15" step="0.1" value="2.5"><span class="addon">% a year</span></div>
  </div>
  <div class="field">
    <label for="statepension">Other income from retirement</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="statepension" inputmode="decimal" min="0" step="500" value="18000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
    <span class="hint">State pension, social security, rental income.</span>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Pot at retirement, in today’s money</div>
  <div class="result-value" id="pot-at">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Lasts until age</dt><dd id="lasts">—</dd></div>
    <div class="stat"><dt>You need about</dt><dd id="needed">—</dd></div>
    <div class="stat"><dt>Gap</dt><dd id="gap">—</dd></div>
    <div class="stat"><dt>Nominal pot</dt><dd id="nominal">—</dd></div>
  </dl>
</div>
<p class="notice" id="verdict" hidden style="margin-top:16px"></p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; };

  function calc(){
    var age = num('age', 35), retire = num('retire', 67), until = num('until', 95);
    var pot = num('pot', 0), monthly = num('monthly', 0);
    var income = num('income', 0), other = num('statepension', 0);
    var growth = num('growth', 6) / 100, inflation = num('inflation', 2.5) / 100;

    if (retire <= age) { $('note').textContent = 'Retirement age must be after your current age.'; return; }

    // Work entirely in real terms so every figure is in today's money.
    var realReturn = (1 + growth) / (1 + inflation) - 1;
    var years = retire - age;
    var months = Math.round(years * 12);
    var rMonthly = Math.pow(1 + realReturn, 1 / 12) - 1;

    var balance = pot;
    for (var m = 0; m < months; m++) {
      balance += monthly;
      balance *= (1 + rMonthly);
    }

    var nominal = balance * Math.pow(1 + inflation, years);
    var shortfall = Math.max(0, income - other);

    // Drawdown: withdraw the shortfall each year, pot keeps growing in real terms.
    var draw = balance;
    var lastsTo = retire;
    var plannedYears = until - retire;
    for (var y = 0; y < 60; y++) {
      draw -= shortfall;
      if (draw <= 0) break;
      draw *= (1 + realReturn);
      lastsTo++;
    }

    // Capital needed to sustain the shortfall for the planned period.
    var needed;
    if (realReturn <= 0) needed = shortfall * plannedYears;
    else needed = shortfall * (1 - Math.pow(1 + realReturn, -plannedYears)) / realReturn;

    $('pot-at').textContent = money(balance);
    $('nominal').textContent = money(nominal);
    $('needed').textContent = money(needed);
    $('lasts').textContent = shortfall <= 0 ? 'Indefinitely' : (lastsTo >= retire + 60 ? '95+' : lastsTo);
    var gap = needed - balance;
    $('gap').textContent = gap > 0 ? money(gap) + ' short' : money(-gap) + ' spare';

    $('note').textContent = 'Real return ' + (realReturn * 100).toFixed(1) + '% a year after ' +
      (inflation * 100).toFixed(1) + '% inflation, over ' + years + ' years of saving. ' +
      'Nominal pot would be ' + money(nominal) + ', but that buys what ' + money(balance) + ' buys today.';

    var v = $('verdict');
    v.hidden = false;
    if (shortfall <= 0) {
      v.className = 'notice';
      v.style.cssText = 'margin-top:16px;background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)';
      v.textContent = 'Your other income already covers the target, so the pot is spare capacity.';
    } else if (gap <= 0) {
      v.className = 'notice';
      v.style.cssText = 'margin-top:16px;background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)';
      v.textContent = 'On these assumptions you are on track, with ' + money(-gap) + ' more than the plan requires.';
    } else {
      v.className = 'notice notice-warn';
      v.style.cssText = 'margin-top:16px';
      var extraMonthly = gap / (months > 0 ? months : 1);
      v.textContent = 'On these assumptions you are ' + money(gap) + ' short. Saving roughly ' +
        money(monthly + extraMonthly) + ' a month instead of ' + money(monthly) + ' would close the gap.';
    }
  }

  ['age','retire','until','pot','monthly','income','growth','inflation','statepension'].forEach(function(id){
    $(id).addEventListener('input', calc);
  });
  calc();
})();`,

  answerHeading: 'How much do you need to retire?',
  answer: `<p><strong>A common starting point is 25 times the annual income you want the pot to provide.</strong> That comes from the 4% rule: withdraw 4% of the pot in the first year, adjust for inflation each year after, and historically it survived 30 years in almost every US market period tested. If you want $40,000 a year and expect $18,000 from a state pension, the pot only needs to cover the $22,000 gap — around $550,000. Every figure on this page is in today's money, because a projection in nominal terms tells you almost nothing useful.</p>`,

  steps: [
    'Enter your age, target retirement age, and how long to plan for.',
    'Add what you have saved and what you save each month.',
    'Enter the annual income you want, and any state pension or other income you expect.',
    'Adjust the return and inflation assumptions — the gap between them is what actually matters.',
  ],

  sections: [
    {
      id: 'real-terms',
      h2: 'Why everything here is in today’s money',
      html: `<p>Most retirement calculators show a large nominal figure — "you will have $1.4 million" — which is misleading, because those dollars will buy far less than today's.</p>
<p>At 2.5% inflation over 32 years, prices roughly double. A $1.4m nominal pot has the spending power of about $635,000 today. Planning against the nominal number leads people to badly overestimate what they will have.</p>
<p>This calculator uses the <strong>real return</strong> — return minus inflation, compounded properly — so every figure shown is in current spending power. The nominal figure is included as a footnote, because that is the number you will actually see on a statement.</p>`,
    },
    {
      id: 'four-percent',
      h2: 'The 4% rule, and its limits',
      html: `<p>The rule comes from the 1998 Trinity Study, which tested historical US market returns and found a 4% initial withdrawal, inflation-adjusted, survived 30 years in the large majority of periods.</p>
<p>It is a useful anchor, not a law. Four caveats matter:</p>
<ul>
<li><strong>It assumed 30 years.</strong> Retiring at 55 and planning to 95 is 40 years, where a 3.3–3.5% rate is safer.</li>
<li><strong>It used US market history</strong>, which was unusually good. International data gives lower safe rates.</li>
<li><strong>Sequence of returns matters enormously.</strong> A market fall in the first few years of drawdown does far more damage than the same fall later, because you are selling into it.</li>
<li><strong>Real spending is not flat.</strong> It typically falls through the sixties and seventies, then rises again with care costs.</li>
</ul>
<p>The practical version: be willing to reduce withdrawals in bad years. Flexibility is worth more than precision in the starting number.</p>`,
    },
    {
      id: 'assumptions',
      h2: 'Choosing sensible assumptions',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Input</th><th>A defensible figure</th></tr></thead>
<tbody>
<tr><td>Return, mostly equities, long horizon</td><td>6–7% nominal</td></tr>
<tr><td>Return, balanced portfolio</td><td>5–6% nominal</td></tr>
<tr><td>Return, near or in retirement</td><td>4–5% nominal</td></tr>
<tr><td>Inflation</td><td>2–3%</td></tr>
<tr><td>Income needed</td><td>Often 60–75% of pre-retirement income</td></tr>
</tbody></table></div>
<p>Fees deserve a mention because they are invisible and enormous. A 1% annual charge on a 6.5% return removes roughly a fifth of your final pot over 30 years. If you want to model that, subtract your fund charges from the return figure.</p>`,
    },
  ],

  faq: [
    { q: 'How much do I need to retire?', a: '<p>A rough anchor is 25 times the annual income you need the pot to provide, after any state pension. The calculator works out the precise figure for your planned retirement length and assumptions.</p>' },
    { q: 'What is the 4% rule?', a: '<p>Withdraw 4% of the pot in year one, then increase that amount with inflation each year. It held up over 30-year periods in historical US data. For longer retirements, 3.3–3.5% is safer.</p>' },
    { q: 'Why is the figure lower than other calculators show?', a: '<p>Because this one shows today’s money. Calculators quoting large nominal figures are not wrong, but those dollars buy less. The nominal pot is shown as a separate figure.</p>' },
    { q: 'Should I include my house?', a: '<p>Generally not. A home you live in produces no income, and you cannot sell part of it to buy groceries. Include it only if you genuinely intend to downsize or release equity.</p>' },
    { q: 'What return should I assume?', a: '<p>Historically, a globally diversified equity portfolio has returned roughly 6–7% nominal over long periods. Be more conservative as you approach retirement, and subtract your fund fees.</p>' },
    { q: 'Does this account for tax?', a: '<p>No. Retirement income is usually taxable, and the treatment varies enormously by country and account type. Treat the income figure as gross unless you enter a post-tax target.</p>' },
  ],

  related: ['compound-interest-calculator', 'budget-tracker', 'salary-calculator', 'mortgage-calculator'],
};
