export default {
  slug: 'rent-vs-buy-calculator',
  category: 'home',
  title: 'Rent vs Buy Calculator – Which Is Better Over Time',
  h1: 'Rent vs Buy Calculator',
  cardText: 'Compares renting and buying properly, including the costs nobody mentions.',
  description:
    'Free rent vs buy calculator. Compare the true cost of renting against buying over any period, including maintenance, fees, and what a deposit would earn invested.',
  keywords: ['rent vs buy calculator', 'should i buy a house', 'renting vs buying', 'break even point house', 'is buying cheaper than renting'],
  updated: '2026-09-04',
  disclaimer: 'A projection under fixed assumptions. Property and market returns are uncertain.',
  lede: 'Most comparisons pit rent against a mortgage payment, which is not the comparison. This one includes maintenance, fees, and what your deposit would have earned if invested instead.',

  form: `
<div class="row">
  <div class="field">
    <label for="price">Property price</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="price" inputmode="decimal" min="0" step="5000" value="400000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="deposit">Deposit</label>
    <div class="input-group"><input type="number" id="deposit" inputmode="decimal" min="0" max="100" step="1" value="20"><span class="addon">%</span></div>
  </div>
  <div class="field">
    <label for="rate">Mortgage rate</label>
    <div class="input-group"><input type="number" id="rate" inputmode="decimal" min="0" max="20" step="0.01" value="6"><span class="addon">%</span></div>
  </div>
  <div class="field">
    <label for="years">Comparing over</label>
    <div class="input-group"><input type="number" id="years" inputmode="numeric" min="1" max="40" step="1" value="10"><span class="addon">years</span></div>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="rent">Monthly rent for an equivalent home</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="rent" inputmode="decimal" min="0" step="50" value="1800" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="growth">Property growth</label>
    <div class="input-group"><input type="number" id="growth" inputmode="decimal" min="-5" max="20" step="0.1" value="3"><span class="addon">% a year</span></div>
  </div>
  <div class="field">
    <label for="invest">Investment return</label>
    <div class="input-group"><input type="number" id="invest" inputmode="decimal" min="0" max="20" step="0.1" value="6"><span class="addon">% a year</span></div>
    <span class="hint">What your deposit would earn instead.</span>
  </div>
  <div class="field">
    <label for="rentgrowth">Rent increases</label>
    <div class="input-group"><input type="number" id="rentgrowth" inputmode="decimal" min="0" max="15" step="0.1" value="3"><span class="addon">% a year</span></div>
  </div>
</div>

<details style="margin-top:6px">
  <summary style="cursor:pointer;font-weight:560;font-size:.92rem;color:var(--ink-2);margin-bottom:12px">Ownership costs and fees</summary>
  <div class="row">
    <div class="field">
      <label for="tax">Property tax</label>
      <div class="input-group"><input type="number" id="tax" inputmode="decimal" min="0" max="5" step="0.05" value="1.1"><span class="addon">% a year</span></div>
    </div>
    <div class="field">
      <label for="maint">Maintenance and insurance</label>
      <div class="input-group"><input type="number" id="maint" inputmode="decimal" min="0" max="5" step="0.1" value="1.5"><span class="addon">% a year</span></div>
    </div>
    <div class="field">
      <label for="buycost">Buying costs</label>
      <div class="input-group"><input type="number" id="buycost" inputmode="decimal" min="0" max="15" step="0.1" value="3"><span class="addon">% of price</span></div>
    </div>
    <div class="field">
      <label for="sellcost">Selling costs</label>
      <div class="input-group"><input type="number" id="sellcost" inputmode="decimal" min="0" max="15" step="0.1" value="5"><span class="addon">% of price</span></div>
    </div>
  </div>
</details>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="lbl">Over this period</div>
  <div class="result-value" id="verdict" style="font-size:1.9rem">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Cost of buying</dt><dd id="buycostv">—</dd></div>
    <div class="stat"><dt>Cost of renting</dt><dd id="rentcostv">—</dd></div>
    <div class="stat"><dt>Break-even</dt><dd id="breakeven">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Year by year</h2>
  <div class="table-scroll"><table id="table"><thead><tr><th>Year</th><th>Buying costs</th><th>Renting costs</th><th>Difference</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) ? v : d; };

  function simulate(years){
    var price = num('price', 0);
    var depositPct = num('deposit', 20) / 100;
    var rate = num('rate', 6) / 100;
    var rent0 = num('rent', 0);
    var growth = num('growth', 3) / 100;
    var invest = num('invest', 6) / 100;
    var rentGrowth = num('rentgrowth', 3) / 100;
    var taxRate = num('tax', 1.1) / 100;
    var maintRate = num('maint', 1.5) / 100;
    var buyCostRate = num('buycost', 3) / 100;
    var sellCostRate = num('sellcost', 5) / 100;

    var deposit = price * depositPct;
    var loan = price - deposit;
    var n = 30 * 12;                       // assume a 30-year mortgage
    var r = rate / 12;
    var payment = r === 0 ? loan / n : loan * r / (1 - Math.pow(1 + r, -n));

    var rows = [];
    var balance = loan;
    var value = price;
    var buyOutlay = deposit + price * buyCostRate;    // cash spent to buy
    var rentOutlay = 0;
    // The renter invests the deposit and any monthly saving.
    var portfolio = deposit + price * buyCostRate;
    var rent = rent0;

    for (var y = 1; y <= years; y++) {
      var yearInterest = 0, yearPrincipal = 0;
      for (var m = 0; m < 12; m++) {
        var i = balance * r;
        var p = Math.min(payment - i, balance);
        yearInterest += i; yearPrincipal += p;
        balance -= p;
      }
      var tax = value * taxRate;
      var maint = value * maintRate;
      var ownerAnnual = payment * 12 + tax + maint;
      buyOutlay += ownerAnnual;

      var renterAnnual = rent * 12;
      rentOutlay += renterAnnual;

      // The renter invests whatever the owner pays above their rent.
      var surplus = ownerAnnual - renterAnnual;
      portfolio = portfolio * (1 + invest) + Math.max(0, surplus);

      value *= (1 + growth);
      rent *= (1 + rentGrowth);

      // Net position: what you would have if you sold or cashed out today.
      var buyerNet = buyOutlay - (value * (1 - sellCostRate) - balance);
      var renterNet = rentOutlay - portfolio + (deposit + price * buyCostRate);

      rows.push({ year: y, buy: buyerNet, rent: renterNet });
    }
    return rows;
  }

  function calc(){
    var years = Math.max(1, Math.min(40, Math.round(num('years', 10))));
    var rows = simulate(Math.max(years, 30));
    var atYear = rows[years - 1];

    $('buycostv').textContent = money(atYear.buy);
    $('rentcostv').textContent = money(atYear.rent);

    var diff = atYear.rent - atYear.buy;
    $('verdict').textContent = diff > 0
      ? 'Buying is ahead by ' + money(diff)
      : 'Renting is ahead by ' + money(-diff);
    $('lbl').textContent = 'After ' + years + (years === 1 ? ' year' : ' years');

    var be = null;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].buy < rows[i].rent) { be = rows[i].year; break; }
    }
    $('breakeven').textContent = be ? 'Year ' + be : 'Not within 30 years';
    $('note').textContent = be
      ? 'Buying overtakes renting in year ' + be + '. Before that, selling costs and early interest mean renting comes out ahead.'
      : 'On these assumptions renting stays ahead for at least 30 years — usually a sign the price-to-rent ratio is high.';

    $('table').querySelector('tbody').innerHTML = rows.slice(0, Math.max(years, 12)).map(function(row){
      var d = row.rent - row.buy;
      return '<tr' + (row.year === years ? ' style="background:var(--accent-soft);font-weight:600"' : '') + '>' +
        '<td>' + row.year + '</td><td>' + money(row.buy) + '</td><td>' + money(row.rent) + '</td><td>' +
        (d > 0 ? 'buying +' : 'renting +') + money(Math.abs(d)).replace('$', '$') + '</td></tr>';
    }).join('');
  }

  ['price','deposit','rate','years','rent','growth','invest','rentgrowth','tax','maint','buycost','sellcost']
    .forEach(function(id){ $(id).addEventListener('input', calc); });
  calc();
})();`,

  answerHeading: 'The comparison people usually get wrong',
  answer: `<p><strong>Comparing rent to a mortgage payment is not the comparison — it leaves out most of the cost on both sides.</strong> Owning adds property tax, maintenance, insurance, and the 3% buying and 5% selling costs that make short stays expensive. Renting has a hidden advantage: the deposit stays invested. This calculator counts both, and finds a break-even year — the point where buying overtakes renting. In most markets that is somewhere between year 4 and year 8, which is why the honest answer to "should I buy?" usually starts with "how long are you staying?"</p>`,

  steps: [
    'Enter the property price, your deposit and the mortgage rate.',
    'Enter what an equivalent home would cost to rent.',
    'Adjust growth and investment assumptions — the gap between them drives the result.',
    'Open the fees section to match your local costs.',
  ],

  sections: [
    {
      id: 'breakeven',
      h2: 'Why there is a break-even year',
      html: `<p>Buying front-loads its costs. You pay 3% or so in fees to buy, another 5% to sell, and in the early years almost all of the mortgage payment is interest rather than equity.</p>
<p>Sell after two years and those costs dominate: you have paid roughly 8% of the price in transaction fees while building very little equity. Stay ten years and the same fees are spread thinner, the loan balance has fallen meaningfully, and any price growth is working on the whole property rather than just your deposit.</p>
<p>This is why the standard guidance is not to buy unless you expect to stay at least five years — and why a job that might move you in two makes renting the sensible choice regardless of what the market does.</p>`,
    },
    {
      id: 'ratio',
      h2: 'The price-to-rent ratio',
      html: `<p>A quick sanity check before running any calculator: divide the purchase price by the annual rent for an equivalent home.</p>
<div class="table-scroll"><table>
<thead><tr><th>Price ÷ annual rent</th><th>Generally suggests</th></tr></thead>
<tbody>
<tr><td>Under 15</td><td>Buying is usually favourable</td></tr>
<tr><td>15–20</td><td>Depends on how long you stay and local costs</td></tr>
<tr><td>Over 20</td><td>Renting is often better financially</td></tr>
</tbody></table></div>
<p>A $400,000 home renting for $1,800 a month gives 400,000 ÷ 21,600 = 18.5 — the ambiguous middle, where the answer genuinely depends on your time horizon.</p>`,
    },
    {
      id: 'beyond',
      h2: 'What the numbers cannot tell you',
      html: `<p>The financial comparison is only part of the decision, and for many people not the deciding part.</p>
<ul>
<li><strong>Security.</strong> Owning means nobody can end your tenancy. In markets with weak tenant protection this is worth a great deal.</li>
<li><strong>Flexibility.</strong> Renting means leaving in a month rather than four, for a job, a relationship or a change of mind.</li>
<li><strong>Forced saving.</strong> A mortgage builds equity whether or not you are disciplined. The renter-invests-the-difference scenario assumes discipline most people do not have — and that assumption is doing a lot of work in every calculator like this one.</li>
<li><strong>Maintenance is your problem.</strong> When the boiler fails as an owner, it is your weekend and your money.</li>
<li><strong>Concentration risk.</strong> Buying puts most of your net worth into one asset in one street.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'How long do I need to stay for buying to make sense?', a: '<p>Usually five years or more, though it depends on price-to-rent ratio, transaction costs and growth. The calculator finds your specific break-even year.</p>' },
    { q: 'Why does the renter get investment returns?', a: '<p>Because a fair comparison assumes the deposit and fees are invested rather than sitting idle. Leaving that out is the single most common flaw in rent-vs-buy comparisons.</p>' },
    { q: 'Is buying always better long term?', a: '<p>Not always. Where price-to-rent ratios are high, renting and investing the difference can stay ahead for decades. Where they are low, buying wins quickly.</p>' },
    { q: 'What maintenance figure should I use?', a: '<p>Around 1–2% of property value a year is the usual planning figure, covering repairs, insurance and periodic replacement of major items. Older properties run higher.</p>' },
    { q: 'Does this include tax relief on mortgage interest?', a: '<p>No, since it varies enormously by country and has been reduced or removed in many. If it applies to you, reduce the mortgage rate slightly to approximate it.</p>' },
  ],

  related: ['mortgage-calculator', 'compound-interest-calculator', 'budget-tracker', 'loan-calculator'],
};
