export default {
  slug: 'tip-calculator',
  category: 'calculators',
  title: 'Tip Calculator – Work Out the Tip and Split the Bill',
  h1: 'Tip Calculator',
  cardText: 'Tip amount, total, and what each person owes when you split the bill.',
  description:
    'Free tip calculator and bill splitter. Enter the bill and tip percentage to see the tip, the total, and exactly what each person owes.',
  keywords: ['tip calculator', 'bill splitter', 'how much to tip', 'gratuity calculator', 'split the bill'],
  updated: '2026-09-04',
  lede: 'Enter the bill, pick a tip percentage, and see the tip, the total, and what each person owes if you are splitting it.',

  form: `
<div class="row">
  <div class="field">
    <label for="bill">Bill amount</label>
    <div class="input-group">
      <span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="bill" inputmode="decimal" min="0" step="0.01" placeholder="60.00" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field">
    <label for="people">Split between</label>
    <div class="input-group">
      <input type="number" id="people" inputmode="numeric" min="1" max="100" step="1" value="1">
      <span class="addon">people</span>
    </div>
  </div>
</div>

<div class="field">
  <span class="field-label" id="tip-label">Tip percentage</span>
  <div class="seg" role="group" aria-labelledby="tip-label" id="presets" style="flex-wrap:wrap">
    <button type="button" data-pct="10">10%</button>
    <button type="button" data-pct="15">15%</button>
    <button type="button" data-pct="18" aria-pressed="true">18%</button>
    <button type="button" data-pct="20">20%</button>
    <button type="button" data-pct="25">25%</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="pct">Custom tip</label>
    <div class="input-group">
      <input type="number" id="pct" inputmode="decimal" min="0" max="100" step="0.5" value="18">
      <span class="addon">%</span>
    </div>
  </div>
  <div class="field">
    <span class="field-label" id="round-label">Rounding</span>
    <div class="seg" role="group" aria-labelledby="round-label" id="rounding">
      <button type="button" data-round="none" aria-pressed="true">Exact</button>
      <button type="button" data-round="up">Round up</button>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="perlabel">Total to pay</div>
  <div class="result-value" id="total">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Tip</dt><dd id="tip">—</dd></div>
    <div class="stat"><dt>Bill</dt><dd id="base">—</dd></div>
    <div class="stat"><dt>Each person</dt><dd id="each">—</dd></div>
  </dl>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Enter a bill amount to see the tip.</p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var bill = $('bill'), people = $('people'), pct = $('pct'), out = $('out'), prompt = $('prompt');
  var roundMode = 'none';
  var money = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  function press(container, attr, value){
    var btns = container.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute(attr) === value));
    }
  }

  function calc(){
    var b = parseFloat(bill.value);
    var p = parseFloat(pct.value);
    var n = parseInt(people.value, 10);
    if (!isFinite(b) || b < 0) { out.hidden = true; prompt.hidden = false; return; }
    if (!isFinite(p) || p < 0) p = 0;
    if (!isFinite(n) || n < 1) n = 1;

    var tip = b * p / 100;
    var total = b + tip;

    if (roundMode === 'up') {
      // Round the grand total up to the next whole unit, tip absorbs the difference.
      var rounded = Math.ceil(total);
      tip += rounded - total;
      total = rounded;
    }

    $('total').textContent = money(total);
    $('tip').textContent = money(tip);
    $('base').textContent = money(b);
    $('each').textContent = money(total / n);
    $('perlabel').textContent = n > 1 ? 'Total for the table' : 'Total to pay';
    $('note').textContent = n > 1
      ? 'Split ' + n + ' ways, that is ' + money(total / n) + ' each.'
      : 'A ' + (Math.round(p * 10) / 10) + '% tip on ' + money(b) + '.';
    out.hidden = false; prompt.hidden = true;
  }

  $('presets').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-pct]'); if (!btn) return;
    pct.value = btn.getAttribute('data-pct');
    press($('presets'), 'data-pct', btn.getAttribute('data-pct'));
    calc();
  });
  $('rounding').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-round]'); if (!btn) return;
    roundMode = btn.getAttribute('data-round');
    press($('rounding'), 'data-round', roundMode);
    calc();
  });
  pct.addEventListener('input', function(){ press($('presets'), 'data-pct', pct.value); calc(); });
  bill.addEventListener('input', calc);
  people.addEventListener('input', calc);
})();`,

  answerHeading: 'How much should you tip?',
  answer: `<p><strong>In the United States, the standard restaurant tip is 18–20% of the pre-tax bill for sit-down table service.</strong> 15% signals that something was off, 20% is the common default for good service, and 25% is generous. For counter service, coffee or takeaway, tipping is optional and $1–2 or 10% is normal. Outside the US the expectation drops sharply: 5–10% is typical in most of Europe, and in Japan and South Korea tipping is not customary at all and can cause confusion.</p>`,

  steps: [
    'Type the <strong>bill amount</strong> exactly as printed on the check.',
    'Tap a tip percentage, or type your own in the custom field.',
    'If you are sharing the bill, set <strong>split between</strong> to the number of people.',
    'Optionally switch on <strong>round up</strong> to bring the total to a whole dollar.',
  ],

  sections: [
    {
      id: 'guide',
      h2: 'Tipping guide by situation (United States)',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Customary tip</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Restaurant, table service</td><td>18–20%</td><td>On the pre-tax total; 25% for exceptional service</td></tr>
<tr><td>Bar, per drink</td><td>$1–2 per drink</td><td>Or 20% if running a tab</td></tr>
<tr><td>Coffee shop / counter</td><td>Optional, $0–1</td><td>The tablet prompt is not an obligation</td></tr>
<tr><td>Food delivery</td><td>15–20%, minimum $5</td><td>More in bad weather or for long distances</td></tr>
<tr><td>Taxi / rideshare</td><td>10–15%</td><td>Round up for short trips</td></tr>
<tr><td>Hairdresser / barber</td><td>15–20%</td><td>Tip the person who did the work</td></tr>
<tr><td>Hotel housekeeping</td><td>$3–5 per night</td><td>Leave it daily, not at the end</td></tr>
<tr><td>Large group (6+)</td><td>Check the bill</td><td>An 18–20% service charge is often added already</td></tr>
</tbody></table></div>
<p>If a service charge or "gratuity included" line already appears on your bill, you are not expected to tip again on top.</p>`,
    },
    {
      id: 'pretax',
      h2: 'Tip on the pre-tax or post-tax total?',
      html: `<p>Etiquette says the tip is calculated on the pre-tax subtotal, since sales tax is money the restaurant never sees. In practice most people tip on the total because it is easier, and the difference is small.</p>
<p>On a $60 meal with 8% sales tax, tipping 20% pre-tax gives $12.00 and post-tax gives $12.96 — a 96 cent gap. Enter whichever figure you prefer in the bill field above.</p>`,
    },
    {
      id: 'world',
      h2: 'Tipping around the world',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Country</th><th>Restaurant tip</th></tr></thead>
<tbody>
<tr><td>United States, Canada</td><td>18–20% expected</td></tr>
<tr><td>United Kingdom, Ireland</td><td>10–12.5%, often added as a service charge</td></tr>
<tr><td>France, Italy, Spain</td><td>Service usually included; round up or leave 5%</td></tr>
<tr><td>Germany, Netherlands</td><td>5–10%, round up to a convenient number</td></tr>
<tr><td>Australia, New Zealand</td><td>Not expected; 10% for excellent service</td></tr>
<tr><td>Japan, South Korea, China</td><td>Not customary and can be refused</td></tr>
<tr><td>UAE, Middle East</td><td>10–15% if no service charge</td></tr>
</tbody></table></div>`,
    },
  ],

  faq: [
    { q: 'How much do you tip on a $100 bill?', a: '<p>At the common US rates: 15% is $15 (total $115), 18% is $18 (total $118), and 20% is $20 (total $120). For a $100 bill the tip percentage and the dollar amount are the same number, which makes it an easy benchmark to reason from.</p>' },
    { q: 'What is the easiest way to work out a 20% tip in your head?', a: '<p>Move the decimal point one place left to get 10%, then double it. For a $46.80 bill: 10% is $4.68, so 20% is about $9.36. For 15%, take the 10% figure and add half of it again.</p>' },
    { q: 'Do I tip on takeaway orders?', a: '<p>It is optional. Many people leave 10% or a couple of dollars if staff assembled a large order, but there is no expectation for simply collecting food at a counter.</p>' },
    { q: 'Should I still tip if the service was poor?', a: '<p>In the US, servers are often paid a reduced base wage that assumes tips, so leaving nothing is a strong statement. Most guidance suggests dropping to 10–15% and, more usefully, telling the manager what went wrong.</p>' },
    { q: 'How does the round-up option work?', a: '<p>It rounds the grand total up to the next whole dollar and adds the difference to the tip, which makes cash payment and mental checking easier.</p>' },
  ],

  related: ['bill-split-calculator', 'percentage-calculator', 'discount-calculator', 'sales-tax-calculator'],
};
