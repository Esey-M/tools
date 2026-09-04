export default {
  slug: 'bill-split-calculator',
  category: 'home',
  title: 'Bill Split Calculator – Divide a Bill Fairly, Even Unevenly',
  h1: 'Bill Split Calculator',
  cardText: 'Split a bill evenly, or by what each person actually ordered.',
  description:
    'Free bill splitter. Divide a bill evenly between any number of people, or itemise what each person had, with tip and tax shared proportionally.',
  keywords: ['bill split calculator', 'split the bill', 'bill splitter', 'divide bill between friends', 'who owes what'],
  updated: '2026-09-04',
  lede: 'Split evenly in two taps, or switch to itemised mode when everyone ordered something different and the even split is not fair.',

  form: `
<div class="field">
  <span class="field-label" id="mode-label">How are you splitting?</span>
  <div class="seg" role="group" aria-labelledby="mode-label" id="modes">
    <button type="button" data-mode="even" aria-pressed="true">Evenly</button>
    <button type="button" data-mode="items">By what each person had</button>
  </div>
</div>

<div id="pane-even">
  <div class="row">
    <div class="field">
      <label for="bill">Bill total</label>
      <div class="input-group">
        <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
        <input type="number" id="bill" inputmode="decimal" min="0" step="0.01" placeholder="120.00" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
      </div>
    </div>
    <div class="field">
      <label for="people">People</label>
      <input type="number" id="people" inputmode="numeric" min="1" max="100" step="1" value="4">
    </div>
  </div>
</div>

<div id="pane-items" hidden>
  <div class="field">
    <span class="field-label">Who had what</span>
    <div id="rows" class="split-rows"></div>
    <button type="button" class="btn btn-ghost" id="addrow" style="margin-top:9px">+ Add a person</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="tip">Tip</label>
    <div class="input-group">
      <input type="number" id="tip" inputmode="decimal" min="0" max="100" step="1" value="18">
      <span class="addon">%</span>
    </div>
  </div>
  <div class="field">
    <label for="tax">Tax already on the bill</label>
    <div class="input-group">
      <input type="number" id="tax" inputmode="decimal" min="0" max="50" step="0.01" value="0">
      <span class="addon">%</span>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Each person pays</div>
  <div class="result-value" id="each">—</div>
  <div class="result-note" id="note"></div>
  <div id="breakdown" class="split-out"></div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter the bill to see who owes what.</p>`,

  css: `
.split-rows{display:flex;flex-direction:column;gap:8px}
.split-row{display:flex;gap:8px;align-items:center}
.split-row input[type=text]{flex:1 1 auto;min-width:0}
.split-row input[type=number]{flex:0 0 116px}
.split-row button{flex:none;width:36px;height:38px;border:1px solid var(--line-strong);background:var(--bg);
  border-radius:var(--radius-sm);color:var(--ink-3);cursor:pointer;font-size:1.1rem;line-height:1}
.split-row button:hover{border-color:var(--danger);color:var(--danger)}
.split-out{margin-top:14px;display:flex;flex-direction:column;gap:6px}
.split-line{display:flex;justify-content:space-between;gap:14px;padding:9px 12px;background:var(--bg-raised);
  border:1px solid var(--line);border-radius:var(--radius-sm);font-size:.94rem}
.split-line b{font-variant-numeric:tabular-nums}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var mode = 'even';
  var money = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function(el, d){ var v = parseFloat(el.value); return isFinite(v) ? v : d; };

  function addRow(name, amount){
    var div = document.createElement('div');
    div.className = 'split-row';
    div.innerHTML =
      '<input type="text" placeholder="Name" value="' + (name || '') + '" aria-label="Name">' +
      '<input type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00" value="' + (amount || '') + '" aria-label="Amount">' +
      '<button type="button" aria-label="Remove this person">×</button>';
    div.querySelector('button').addEventListener('click', function(){ div.remove(); calc(); });
    div.querySelectorAll('input').forEach(function(i){ i.addEventListener('input', calc); });
    $('rows').appendChild(div);
  }

  function calc(){
    var tip = num($('tip'), 0) / 100;
    var taxRate = num($('tax'), 0) / 100;

    if (mode === 'even') {
      var bill = num($('bill'), NaN);
      var n = Math.max(1, Math.round(num($('people'), 1)));
      if (!isFinite(bill) || bill < 0) { $('out').hidden = true; $('prompt').hidden = false; return; }

      // The bill already includes tax; tip is calculated on the pre-tax subtotal.
      var subtotal = taxRate > 0 ? bill / (1 + taxRate) : bill;
      var tipAmount = subtotal * tip;
      var total = bill + tipAmount;
      var each = total / n;

      $('lbl').textContent = 'Each person pays';
      $('each').textContent = money(each);
      $('note').textContent = money(bill) + ' bill + ' + money(tipAmount) + ' tip = ' + money(total) + ', split ' + n + ' ways.';
      $('breakdown').innerHTML =
        '<div class="split-line"><span>Bill</span><b>' + money(bill) + '</b></div>' +
        (taxRate > 0 ? '<div class="split-line"><span>of which tax</span><b>' + money(bill - subtotal) + '</b></div>' : '') +
        '<div class="split-line"><span>Tip at ' + (tip * 100).toFixed(0) + '%</span><b>' + money(tipAmount) + '</b></div>' +
        '<div class="split-line"><span><strong>Total</strong></span><b>' + money(total) + '</b></div>';
      $('out').hidden = false; $('prompt').hidden = true;
      return;
    }

    // Itemised: tip and tax are shared in proportion to what each person ordered.
    var rows = [].slice.call($('rows').children);
    var people = rows.map(function(r, i){
      var inputs = r.querySelectorAll('input');
      return { name: inputs[0].value.trim() || ('Person ' + (i + 1)), amount: num(inputs[1], 0) };
    }).filter(function(p){ return p.amount > 0; });

    if (!people.length) { $('out').hidden = true; $('prompt').hidden = false; return; }

    var sub = people.reduce(function(a, p){ return a + p.amount; }, 0);
    var tipTotal = sub * tip;
    var taxTotal = sub * taxRate;
    var grand = sub + tipTotal + taxTotal;

    $('lbl').textContent = 'Total for the table';
    $('each').textContent = money(grand);
    $('note').textContent = money(sub) + ' of food and drink, plus ' +
      (taxRate > 0 ? money(taxTotal) + ' tax and ' : '') + money(tipTotal) + ' tip, shared in proportion.';
    $('breakdown').innerHTML = people.map(function(p){
      var share = p.amount / sub;
      return '<div class="split-line"><span>' + p.name.replace(/[<>&]/g, '') + '</span><b>' +
        money(p.amount + (tipTotal + taxTotal) * share) + '</b></div>';
    }).join('');
    $('out').hidden = false; $('prompt').hidden = true;
  }

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-mode]'); if (!b) return;
    mode = b.getAttribute('data-mode');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('pane-even').hidden = mode !== 'even';
    $('pane-items').hidden = mode === 'even';
    calc();
  });
  $('addrow').addEventListener('click', function(){ addRow(); calc(); });
  ['bill','people','tip','tax'].forEach(function(id){ $(id).addEventListener('input', calc); });

  addRow(); addRow(); addRow();
  calc();
})();`,

  answerHeading: 'Splitting a bill fairly',
  answer: `<p><strong>An even split is fair only when everyone ordered similarly.</strong> Divide the total, including tip and tax, by the number of people. When orders differ significantly — one person had a steak and two glasses of wine, another had soup — the fairer method is to charge each person for what they ordered, then share the tip and tax <em>in proportion</em> to their share of the bill. Splitting the tip evenly while itemising the food quietly penalises whoever ate least.</p>`,

  steps: [
    'For a straightforward meal, leave it on <strong>Evenly</strong>, enter the total and the number of people.',
    'If orders were very different, switch to <strong>by what each person had</strong> and enter names and amounts.',
    'Set the tip percentage. If the bill already includes tax, enter the rate so the tip is calculated on the pre-tax subtotal.',
  ],

  sections: [
    {
      id: 'etiquette',
      h2: 'When to split evenly and when not to',
      html: `<p>The awkwardness of bill-splitting is nearly always about mismatched expectations rather than money.</p>
<ul>
<li><strong>Split evenly</strong> when orders are broadly comparable, when the group is close and the difference is a few dollars, or when someone has already offered.</li>
<li><strong>Itemise</strong> when there is a large gap — non-drinkers subsidising a bar tab is the classic case — when the group is large, or when anyone has said they are on a budget.</li>
<li><strong>Decide before ordering.</strong> Announcing "shall we just split it?" after the bill arrives puts pressure on whoever ordered least. Agreeing at the start lets people order accordingly.</li>
</ul>
<p>The drinks question is worth naming explicitly. Alcohol is often the largest single distortion on a restaurant bill, and separating drinks from food is a common middle ground.</p>`,
    },
    {
      id: 'proportional',
      h2: 'Why the tip should be proportional',
      html: `<p>Consider a $100 food bill where one person ordered $40 and three ordered $20 each, with a 20% tip of $20.</p>
<div class="table-scroll"><table>
<thead><tr><th>Method</th><th>Big orderer pays</th><th>Each other person pays</th></tr></thead>
<tbody>
<tr><td>Everything split evenly</td><td>$30.00</td><td>$30.00</td></tr>
<tr><td>Food itemised, tip split evenly</td><td>$45.00</td><td>$25.00</td></tr>
<tr><td>Food itemised, tip proportional</td><td>$48.00</td><td>$24.00</td></tr>
</tbody></table></div>
<p>Splitting the tip evenly while itemising the food is a halfway house that nobody actually intends: it charges the light eaters a larger tip relative to what they ordered. This calculator uses the proportional method.</p>`,
    },
  ],

  faq: [
    { q: 'How do I split a bill with different amounts?', a: '<p>Switch to itemised mode, enter what each person ordered, and the tool adds each person’s proportional share of the tip and tax. Everyone pays for their own food plus their fair slice of the extras.</p>' },
    { q: 'Should the tip be split evenly or proportionally?', a: '<p>Proportionally, if you are itemising the food. Splitting the tip evenly while itemising the meal charges lighter eaters a disproportionate share of it.</p>' },
    { q: 'What about someone who did not drink?', a: '<p>The cleanest approach is to treat drinks as itemised even when the food is split evenly. Say so before ordering and it stops being awkward.</p>' },
    { q: 'How do I handle a bill that will not divide evenly?', a: '<p>Round each person up to the nearest dollar and let the small surplus go to the tip. It avoids a debate over cents and slightly improves the server’s night.</p>' },
    { q: 'Is the tip calculated on the pre-tax amount?', a: '<p>Yes, when you tell the tool what tax rate is included. Etiquette calculates the tip on the food and drink, not on the tax.</p>' },
  ],

  related: ['tip-calculator', 'percentage-calculator', 'budget-tracker', 'sales-tax-calculator'],
};
