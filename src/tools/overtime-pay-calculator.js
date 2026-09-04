export default {
  slug: 'overtime-pay-calculator',
  category: 'calculators',
  title: 'Overtime Pay Calculator – Time and a Half, Double Time',
  h1: 'Overtime Pay Calculator',
  cardText: 'Work out overtime pay at any rate and your total for the week.',
  description:
    'Free overtime pay calculator. Work out time and a half, double time and total weekly pay from your hourly rate and hours worked, including a daily breakdown.',
  keywords: ['overtime calculator', 'time and a half calculator', 'overtime pay', 'double time calculator', 'weekly pay calculator'],
  updated: '2026-09-04',
  disclaimer: 'Overtime rules vary by country, state and contract. Check your own before relying on this.',
  lede: 'Enter your hourly rate and hours worked. Overtime above the threshold is paid at your chosen multiplier.',

  form: `
<div class="row">
  <div class="field">
    <label for="rate">Hourly rate</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="rate" inputmode="decimal" min="0" step="0.25" value="22" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="hours">Hours worked this week</label>
    <input type="number" id="hours" inputmode="decimal" min="0" max="168" step="0.5" value="47">
  </div>
  <div class="field">
    <label for="threshold">Overtime starts after</label>
    <div class="input-group"><input type="number" id="threshold" inputmode="decimal" min="0" max="80" step="1" value="40"><span class="addon">hrs</span></div>
  </div>
</div>

<div class="row">
  <div class="field">
    <span class="field-label" id="mult-label">Overtime rate</span>
    <div class="seg" role="group" aria-labelledby="mult-label" id="mults" style="flex-wrap:wrap">
      <button type="button" data-m="1.5" aria-pressed="true">Time and a half</button>
      <button type="button" data-m="2">Double time</button>
      <button type="button" data-m="1.25">1.25×</button>
    </div>
  </div>
  <div class="field">
    <label for="custom">Or a custom multiplier</label>
    <div class="input-group"><input type="number" id="custom" inputmode="decimal" min="1" max="5" step="0.05" value="1.5"><span class="addon">×</span></div>
  </div>
  <div class="field">
    <label for="double">Hours at double time <span class="hint">(optional)</span></label>
    <input type="number" id="double" inputmode="decimal" min="0" max="80" step="0.5" value="0">
    <span class="hint">Sundays or holidays, where your contract pays 2×.</span>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Total pay this week</div>
  <div class="result-value" id="total">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Regular pay</dt><dd id="reg">—</dd></div>
    <div class="stat"><dt>Overtime pay</dt><dd id="ot">—</dd></div>
    <div class="stat"><dt>Overtime hours</dt><dd id="oth">—</dd></div>
    <div class="stat"><dt>Effective hourly</dt><dd id="eff">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var money = function(n){ return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; };

  function calc(){
    var rate = num('rate', 0);
    var hours = num('hours', 0);
    var threshold = num('threshold', 40);
    var mult = num('custom', 1.5);
    var doubleHours = Math.min(num('double', 0), hours);

    // Double-time hours are paid separately and do not also count as overtime.
    var remaining = hours - doubleHours;
    var regularHours = Math.min(remaining, threshold);
    var otHours = Math.max(0, remaining - threshold);

    var regularPay = regularHours * rate;
    var otPay = otHours * rate * mult;
    var doublePay = doubleHours * rate * 2;
    var total = regularPay + otPay + doublePay;

    $('total').textContent = money(total);
    $('reg').textContent = money(regularPay);
    $('ot').textContent = money(otPay + doublePay);
    $('oth').textContent = (otHours + doubleHours) % 1 === 0
      ? (otHours + doubleHours) + ' hrs'
      : (otHours + doubleHours).toFixed(1) + ' hrs';
    $('eff').textContent = hours > 0 ? money(total / hours) : '—';

    var parts = [regularHours + ' hours at ' + money(rate)];
    if (otHours > 0) parts.push(otHours + ' at ' + mult + '× (' + money(rate * mult) + ')');
    if (doubleHours > 0) parts.push(doubleHours + ' at 2× (' + money(rate * 2) + ')');
    $('note').textContent = parts.join(', ') + '.';
  }

  $('mults').addEventListener('click', function(e){
    var b = e.target.closest('button[data-m]'); if (!b) return;
    $('custom').value = b.getAttribute('data-m');
    var btns = $('mults').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    calc();
  });
  ['rate','hours','threshold','custom','double'].forEach(function(id){ $(id).addEventListener('input', calc); });
  calc();
})();`,

  answerHeading: 'How overtime pay is calculated',
  answer: `<p><strong>Overtime is your regular hourly rate multiplied by the overtime rate, applied only to hours above the threshold.</strong> "Time and a half" means 1.5×, so at $22 an hour overtime pays $33. Working 47 hours in a week with a 40-hour threshold gives 40 regular hours at $22 ($880) plus 7 overtime hours at $33 ($231), totalling $1,111. Note that overtime applies to the <em>extra</em> hours only — a common mistake is applying the multiplier to the whole week.</p>`,

  steps: [
    'Enter your hourly rate and total hours worked this week.',
    'Set the threshold at which overtime begins — 40 hours in the US, often 48 in the UK and EU.',
    'Choose the overtime multiplier, or type a custom one from your contract.',
    'Add any hours paid at double time separately.',
  ],

  sections: [
    {
      id: 'rules',
      h2: 'Overtime rules vary a lot',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Typical rule</th></tr></thead>
<tbody>
<tr><td>United States (federal)</td><td>1.5× over 40 hours a week for non-exempt employees, under the FLSA</td></tr>
<tr><td>California</td><td>1.5× over 8 hours a day or 40 a week; 2× over 12 hours a day</td></tr>
<tr><td>United Kingdom</td><td>No statutory overtime rate — it is whatever your contract says, provided average pay meets minimum wage</td></tr>
<tr><td>European Union</td><td>Working time capped at 48 hours a week on average; rates set nationally or by contract</td></tr>
<tr><td>Australia</td><td>Usually 1.5× for the first 2–3 hours then 2×, set by the relevant award</td></tr>
<tr><td>Canada</td><td>1.5× over 40–44 hours depending on province</td></tr>
</tbody></table></div>
<p>The biggest single misconception is that overtime pay is automatic everywhere. In the UK there is no legal right to an enhanced rate at all — it depends entirely on your contract.</p>`,
    },
    {
      id: 'exempt',
      h2: 'Exempt and non-exempt in the US',
      html: `<p>Under the Fair Labor Standards Act, only <strong>non-exempt</strong> employees are entitled to overtime. Exempt status requires meeting all three of a salary basis test, a salary threshold, and a duties test covering genuine executive, administrative or professional work.</p>
<p>Being paid a salary does not by itself make you exempt — this is misapplied often enough that it is a common source of wage claims. Job title is irrelevant; what matters is what you actually do day to day.</p>
<p>If you are unsure, your country's labour department is the authority. In the US that is the Department of Labor's Wage and Hour Division.</p>`,
    },
  ],

  faq: [
    { q: 'What is time and a half?', a: '<p>1.5 times your normal hourly rate. At $20 an hour, time and a half is $30 an hour for the qualifying hours.</p>' },
    { q: 'Is overtime paid on all hours or just the extra ones?', a: '<p>Only the hours above the threshold. Working 45 hours with a 40-hour threshold means 40 at normal rate and 5 at the overtime rate.</p>' },
    { q: 'Is overtime taxed at a higher rate?', a: '<p>No. Overtime is ordinary income taxed at the same rates. It can look higher on a payslip because withholding is sometimes calculated as if that pay period were typical, but this evens out over the year.</p>' },
    { q: 'Does paid holiday count towards the overtime threshold?', a: '<p>Under US federal law, no — only hours actually worked count. Some contracts and collective agreements are more generous, so check yours.</p>' },
    { q: 'Can my employer give time off instead of overtime pay?', a: '<p>In the US private sector, generally not for non-exempt employees; compensatory time is mainly a public sector arrangement. Elsewhere, time off in lieu is common and depends on your contract.</p>' },
  ],

  related: ['salary-calculator', 'budget-tracker', 'percentage-calculator', 'date-difference-calculator'],
};
