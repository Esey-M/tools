export default {
  slug: 'budget-tracker',
  category: 'home',
  title: 'Budget Tracker – Monthly Income and Expenses',
  h1: 'Budget Tracker',
  cardText: 'Track monthly income and spending, with the 50/30/20 split checked for you.',
  description:
    'Free monthly budget tracker. Enter income and expenses to see what is left over, how your spending splits across needs, wants and savings, and where it goes.',
  keywords: ['budget tracker', 'monthly budget calculator', 'expense tracker', '50 30 20 budget', 'budget planner'],
  updated: '2026-09-04',
  lede: 'Add your income and outgoings. Everything saves in your browser, so it is still here when you come back — and it never leaves your device.',

  form: `
<div class="budget-cols">
  <section>
    <h2 class="bud-h">Income</h2>
    <div id="income-rows" class="bud-rows"></div>
    <button type="button" class="btn btn-ghost bud-add" data-kind="income">+ Add income</button>
  </section>
  <section>
    <h2 class="bud-h">Expenses</h2>
    <div id="expense-rows" class="bud-rows"></div>
    <button type="button" class="btn btn-ghost bud-add" data-kind="expense">+ Add expense</button>
  </section>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="lbl">Left over each month</div>
  <div class="result-value" id="left">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Income</dt><dd id="inc">—</dd></div>
    <div class="stat"><dt>Expenses</dt><dd id="exp">—</dd></div>
    <div class="stat"><dt>Savings rate</dt><dd id="rate">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">The 50/30/20 check</h2>
  <div id="split" class="split-list"></div>
</div>

<div class="btn-row" style="margin-top:20px">
  <button type="button" class="btn btn-ghost" id="clear">Clear everything</button>
</div>`,

  css: `
.budget-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}
@media (max-width:680px){.budget-cols{grid-template-columns:1fr}}
.bud-h{font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);font-weight:640;margin-bottom:10px}
.bud-rows{display:flex;flex-direction:column;gap:7px}
.bud-row{display:grid;grid-template-columns:1fr 104px 36px;gap:7px;align-items:center}
.bud-row select{grid-column:1/-1;font-size:.85rem;padding:6px 10px}
.bud-row button{width:36px;height:38px;border:1px solid var(--line-strong);background:var(--bg);
  border-radius:var(--radius-sm);color:var(--ink-3);cursor:pointer;font-size:1.1rem;line-height:1}
.bud-row button:hover{border-color:var(--danger);color:var(--danger)}
.bud-add{margin-top:9px;font-size:.87rem;padding:8px 14px}
.split-list{display:flex;flex-direction:column;gap:8px}
.split-row{display:flex;align-items:center;gap:12px;font-size:.9rem}
.split-row .nm{flex:0 0 118px;color:var(--ink-2)}
.split-row .bar{flex:1;height:9px;border-radius:999px;background:var(--bg-sunken);overflow:hidden;border:1px solid var(--line)}
.split-row .bar i{display:block;height:100%;border-radius:999px;transition:width .3s}
.split-row b{flex:0 0 118px;text-align:right;font-variant-numeric:tabular-nums;font-size:.88rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-budget';

  var CATS = [
    ['needs', 'Need — rent, food, bills, transport'],
    ['wants', 'Want — eating out, subscriptions, hobbies'],
    ['savings', 'Saving or debt repayment']
  ];

  // Keep the sign in front of the currency symbol, not after it.
  var money = function(n){
    var sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  function addRow(kind, name, amount, cat){
    var wrap = $(kind + '-rows');
    var div = document.createElement('div');
    div.className = 'bud-row';
    div.innerHTML =
      '<input type="text" placeholder="' + (kind === 'income' ? 'Salary' : 'Rent') + '" value="' +
        String(name || '').replace(/"/g, '&quot;') + '" aria-label="Description">' +
      '<input type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="' +
        (amount == null ? '' : amount) + '" aria-label="Amount">' +
      '<button type="button" aria-label="Remove">×</button>' +
      (kind === 'expense'
        ? '<select aria-label="Category">' + CATS.map(function(c){
            return '<option value="' + c[0] + '"' + (c[0] === cat ? ' selected' : '') + '>' + c[1] + '</option>';
          }).join('') + '</select>'
        : '');
    div.querySelector('button').addEventListener('click', function(){ div.remove(); calc(); });
    div.querySelectorAll('input,select').forEach(function(el){
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', calc);
    });
    wrap.appendChild(div);
  }

  function readRows(kind){
    return [].slice.call($(kind + '-rows').children).map(function(r){
      var inputs = r.querySelectorAll('input');
      var sel = r.querySelector('select');
      return {
        name: inputs[0].value,
        amount: parseFloat(inputs[1].value) || 0,
        cat: sel ? sel.value : null
      };
    });
  }

  function save(){
    try {
      localStorage.setItem(KEY, JSON.stringify({ income: readRows('income'), expense: readRows('expense') }));
    } catch (e) {}
  }

  function calc(){
    var income = readRows('income');
    var expense = readRows('expense');
    var totalIn = income.reduce(function(a, r){ return a + r.amount; }, 0);
    var totalOut = expense.reduce(function(a, r){ return a + r.amount; }, 0);
    var left = totalIn - totalOut;

    $('inc').textContent = money(totalIn);
    $('exp').textContent = money(totalOut);
    $('left').textContent = money(left);
    $('left').style.color = left < 0 ? 'var(--danger)' : '';
    $('lbl').textContent = left < 0 ? 'Short each month' : 'Left over each month';
    $('rate').textContent = totalIn > 0 ? (left / totalIn * 100).toFixed(1) + '%' : '—';
    $('note').textContent = totalIn > 0
      ? (left < 0
          ? 'Spending exceeds income by ' + money(-left) + '. Something has to change.'
          : 'You are keeping ' + (left / totalIn * 100).toFixed(0) + '% of what you earn.')
      : 'Add your income to see the picture.';

    // 50/30/20: leftover counts as saving, since it is not being spent.
    var byCat = { needs: 0, wants: 0, savings: 0 };
    expense.forEach(function(r){ if (r.cat) byCat[r.cat] += r.amount; });
    byCat.savings += Math.max(0, left);

    var TARGETS = [['needs', 'Needs', 50, '#0f7d6b'], ['wants', 'Wants', 30, '#e8a33d'], ['savings', 'Savings', 20, '#4f9ee8']];
    $('split').innerHTML = TARGETS.map(function(t){
      var amt = byCat[t[0]];
      var pct = totalIn > 0 ? amt / totalIn * 100 : 0;
      var over = pct > t[2] + 0.5 && t[0] !== 'savings';
      return '<div class="split-row"><span class="nm">' + t[1] + ' <span style="color:var(--ink-3)">(' + t[2] + '%)</span></span>' +
        '<span class="bar"><i style="width:' + Math.min(100, pct) + '%;background:' + (over ? 'var(--danger)' : t[3]) + '"></i></span>' +
        '<b>' + money(amt) + ' · ' + pct.toFixed(0) + '%</b></div>';
    }).join('');

    save();
  }

  document.querySelectorAll('.bud-add').forEach(function(b){
    b.addEventListener('click', function(){ addRow(b.getAttribute('data-kind')); calc(); });
  });
  $('clear').addEventListener('click', function(){
    if (!confirm('Clear all budget entries?')) return;
    $('income-rows').innerHTML = ''; $('expense-rows').innerHTML = '';
    try { localStorage.removeItem(KEY); } catch (e) {}
    addRow('income', 'Salary'); addRow('expense', 'Rent', null, 'needs');
    calc();
  });

  // Restore whatever was here last time, or start with a sensible skeleton.
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (saved && (saved.income || {}).length) {
    saved.income.forEach(function(r){ addRow('income', r.name, r.amount); });
    saved.expense.forEach(function(r){ addRow('expense', r.name, r.amount, r.cat); });
  } else {
    addRow('income', 'Salary', 3200);
    addRow('expense', 'Rent', 1200, 'needs');
    addRow('expense', 'Groceries', 400, 'needs');
    addRow('expense', 'Transport', 150, 'needs');
    addRow('expense', 'Subscriptions', 60, 'wants');
    addRow('expense', 'Eating out', 200, 'wants');
  }
  calc();
})();`,

  answerHeading: 'The 50/30/20 rule',
  answer: `<p><strong>Put 50% of take-home pay towards needs, 30% towards wants, and 20% towards savings and debt repayment.</strong> Popularised by Elizabeth Warren, its value is not precision but simplicity — it takes about five minutes to check and immediately shows which of the three is out of proportion. Needs are things you cannot easily stop paying: housing, food, utilities, transport, minimum debt payments. Wants are everything discretionary. In expensive cities the 50% needs target is often unreachable, and that is useful information rather than a failure.</p>`,

  steps: [
    'Add your monthly income after tax.',
    'Add your expenses, tagging each as a need, a want, or saving.',
    'Read the leftover figure and check the three bars against their targets.',
    'Everything saves automatically in your browser and is here next time.',
  ],

  sections: [
    {
      id: 'categorise',
      h2: 'Needs and wants are harder to separate than they look',
      html: `<p>The categorisation is where most budgets go wrong, usually in the direction of generosity.</p>
<div class="table-scroll"><table>
<thead><tr><th>Expense</th><th>Need</th><th>Want</th></tr></thead>
<tbody>
<tr><td>Rent or mortgage payment</td><td>✓</td><td></td></tr>
<tr><td>Groceries</td><td>✓</td><td></td></tr>
<tr><td>Restaurant meals and takeaway</td><td></td><td>✓</td></tr>
<tr><td>Basic phone plan</td><td>✓</td><td></td></tr>
<tr><td>Streaming subscriptions</td><td></td><td>✓</td></tr>
<tr><td>Commuting costs</td><td>✓</td><td></td></tr>
<tr><td>Minimum debt payments</td><td>✓</td><td></td></tr>
<tr><td>Extra debt repayment</td><td></td><td>Counts as saving</td></tr>
<tr><td>Gym membership</td><td></td><td>✓</td></tr>
<tr><td>Insurance</td><td>✓</td><td></td></tr>
</tbody></table></div>
<p>A useful test: if you lost your income tomorrow, would you cancel it this week? If yes, it is a want.</p>`,
    },
    {
      id: 'why-fails',
      h2: 'Why budgets usually fail',
      html: `<ul>
<li><strong>Irregular costs are forgotten.</strong> Car repairs, Christmas, annual insurance renewals. Divide each by twelve and treat it as a monthly line — this is the single biggest cause of a budget that works on paper and not in life.</li>
<li><strong>They are too detailed.</strong> Twenty categories tracked to the cent gets abandoned in three weeks. Six categories you actually maintain beats a perfect system you do not.</li>
<li><strong>No room for anything enjoyable.</strong> A budget with zero discretionary spending fails for the same reason crash diets do.</li>
<li><strong>Nobody looks at it again.</strong> Fifteen minutes once a month is enough, and it is the part that matters most.</li>
</ul>`,
    },
    {
      id: 'order',
      h2: 'Where the 20% should go first',
      html: `<p>Not all saving is equally valuable, and the order matters more than the amount.</p>
<ol>
<li><strong>A small emergency buffer</strong> — around $1,000, or one month of essentials. Enough to stop a broken boiler becoming credit card debt.</li>
<li><strong>Any employer pension match.</strong> An instant 50–100% return that nothing else competes with.</li>
<li><strong>High-interest debt.</strong> Clearing a 22% credit card is a guaranteed 22% return.</li>
<li><strong>A full emergency fund</strong> — three to six months of essential spending.</li>
<li><strong>Long-term investing</strong>, in tax-sheltered accounts where available.</li>
</ol>`,
    },
  ],

  faq: [
    { q: 'Is my budget data private?', a: '<p>Yes. It is stored in your own browser using local storage and never sent anywhere. Clearing your browser data removes it, and it does not sync between devices.</p>' },
    { q: 'Should I budget on gross or net income?', a: '<p>Net — what actually reaches your account after tax and deductions. The 50/30/20 split is defined against take-home pay.</p>' },
    { q: 'What if my needs are more than 50%?', a: '<p>Extremely common in high-cost cities. Treat it as information: it means either housing costs need to come down or income needs to go up, since there is no way to save meaningfully when needs consume 70% of income.</p>' },
    { q: 'How do I handle irregular expenses?', a: '<p>Divide the annual cost by twelve and enter it as a monthly line. A $600 annual insurance premium becomes $50 a month, so it is never a surprise.</p>' },
    { q: 'Does leftover money count as savings?', a: '<p>In the 50/30/20 check above, yes — anything not spent counts towards the savings bar, since that is effectively what it is.</p>' },
  ],

  related: ['bill-split-calculator', 'compound-interest-calculator', 'loan-calculator', 'percentage-calculator'],
};
