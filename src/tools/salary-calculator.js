export default {
  slug: 'salary-calculator',
  category: 'calculators',
  title: 'Salary Calculator – Hourly, Weekly, Monthly and Yearly',
  h1: 'Salary Calculator',
  cardText: 'Convert between hourly, weekly, monthly and annual pay in one step.',
  description:
    'Free salary calculator. Convert between hourly, daily, weekly, monthly and annual pay, adjust for holiday and part-time hours, and compare two offers.',
  keywords: ['salary calculator', 'hourly to salary', 'annual salary calculator', 'hourly wage calculator', 'salary converter'],
  updated: '2026-09-04',
  disclaimer: 'Figures are before tax and deductions.',
  lede: 'Type into any box and the rest follow. Adjust hours and holiday to match your actual contract.',

  form: `
<div class="row">
  <div class="field">
    <label for="hours">Hours per week</label>
    <input type="number" id="hours" inputmode="decimal" min="1" max="100" step="0.5" value="40">
  </div>
  <div class="field">
    <label for="weeks">Paid weeks per year</label>
    <input type="number" id="weeks" inputmode="decimal" min="1" max="52" step="1" value="52">
    <span class="hint">52 if holiday is paid, fewer if unpaid.</span>
  </div>
  <div class="field">
    <label for="days">Working days per week</label>
    <input type="number" id="days" inputmode="decimal" min="1" max="7" step="0.5" value="5">
  </div>
</div>

<div class="row" style="margin-top:8px">
  <div class="field">
    <label for="hourly">Hourly</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="hourly" inputmode="decimal" step="0.01" min="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="daily">Daily</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="daily" inputmode="decimal" step="0.01" min="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="weekly">Weekly</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="weekly" inputmode="decimal" step="0.01" min="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="monthly">Monthly</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="monthly" inputmode="decimal" step="0.01" min="0" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
  <div class="field">
    <label for="yearly">Yearly</label>
    <div class="input-group"><span class="addon" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">$</span>
      <input type="number" id="yearly" inputmode="decimal" step="1" min="0" value="52000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)"></div>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Annual salary</div>
  <div class="result-value" id="big">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Per hour</dt><dd id="s-hour">—</dd></div>
    <div class="stat"><dt>Per working day</dt><dd id="s-day">—</dd></div>
    <div class="stat"><dt>Every 2 weeks</dt><dd id="s-fort">—</dd></div>
    <div class="stat"><dt>Hours per year</dt><dd id="s-hours">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var busy = false;
  var money = function(n){
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  var num = function(id, d){ var v = parseFloat($(id).value); return isFinite(v) && v > 0 ? v : d; };

  function factors(){
    var hours = num('hours', 40);
    var weeks = num('weeks', 52);
    var days = num('days', 5);
    return {
      hoursPerYear: hours * weeks,
      hoursPerWeek: hours,
      weeksPerYear: weeks,
      hoursPerDay: hours / days,
      daysPerYear: days * weeks
    };
  }

  function setFrom(annual){
    var f = factors();
    busy = true;
    $('hourly').value  = (annual / f.hoursPerYear).toFixed(2);
    $('daily').value   = (annual / f.daysPerYear).toFixed(2);
    $('weekly').value  = (annual / f.weeksPerYear).toFixed(2);
    $('monthly').value = (annual / 12).toFixed(2);
    $('yearly').value  = Math.round(annual);
    busy = false;

    $('big').textContent = money(annual);
    $('s-hour').textContent = money(annual / f.hoursPerYear);
    $('s-day').textContent = money(annual / f.daysPerYear);
    $('s-fort').textContent = money(annual / 26);
    $('s-hours').textContent = Math.round(f.hoursPerYear).toLocaleString('en-US');
    $('note').textContent = f.hoursPerWeek + ' hours a week over ' + f.weeksPerYear +
      ' paid weeks — ' + Math.round(f.hoursPerYear).toLocaleString('en-US') + ' hours a year.';
  }

  function fromField(id){
    if (busy) return;
    var f = factors();
    var v = parseFloat($(id).value);
    if (!isFinite(v) || v < 0) return;
    var annual = id === 'hourly'  ? v * f.hoursPerYear
               : id === 'daily'   ? v * f.daysPerYear
               : id === 'weekly'  ? v * f.weeksPerYear
               : id === 'monthly' ? v * 12
               :                    v;
    setFrom(annual);
  }

  ['hourly','daily','weekly','monthly','yearly'].forEach(function(id){
    $(id).addEventListener('input', function(){ fromField(id); });
  });
  ['hours','weeks','days'].forEach(function(id){
    $(id).addEventListener('input', function(){
      var annual = parseFloat($('yearly').value);
      if (isFinite(annual)) setFrom(annual);
    });
  });

  setFrom(52000);
})();`,

  answerHeading: 'Converting between pay periods',
  answer: `<p><strong>Annual pay is hourly rate × hours per week × paid weeks per year.</strong> At 40 hours over 52 weeks that is 2,080 hours, so a $25 hourly rate is $52,000 a year — and the reverse shortcut is that annual salary in thousands, halved, gives roughly the hourly rate. Monthly pay is annual ÷ 12, which is <em>not</em> the same as four weekly payments: there are 4.33 weeks in an average month, so 4 weekly payments understates monthly pay by about 8%.</p>`,

  steps: [
    'Set your hours per week, paid weeks per year and working days per week.',
    'Type into whichever pay field you know.',
    'Every other period updates immediately.',
  ],

  sections: [
    {
      id: 'reference',
      h2: 'Quick reference at 40 hours a week',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Hourly</th><th>Weekly</th><th>Monthly</th><th>Yearly</th></tr></thead>
<tbody>
<tr><td>$15</td><td>$600</td><td>$2,600</td><td>$31,200</td></tr>
<tr><td>$20</td><td>$800</td><td>$3,467</td><td>$41,600</td></tr>
<tr><td>$25</td><td>$1,000</td><td>$4,333</td><td>$52,000</td></tr>
<tr><td>$30</td><td>$1,200</td><td>$5,200</td><td>$62,400</td></tr>
<tr><td>$40</td><td>$1,600</td><td>$6,933</td><td>$83,200</td></tr>
<tr><td>$50</td><td>$2,000</td><td>$8,667</td><td>$104,000</td></tr>
<tr><td>$75</td><td>$3,000</td><td>$13,000</td><td>$156,000</td></tr>
</tbody></table></div>
<p>All figures are gross, before tax, insurance and pension deductions.</p>`,
    },
    {
      id: 'paid-weeks',
      h2: 'Paid weeks, and why contractors need to change it',
      html: `<p>An employee with paid holiday works 52 paid weeks: you are paid whether or not you are at your desk. Leave the setting at 52.</p>
<p>A contractor or freelancer is paid only for weeks actually worked. Taking four weeks off and allowing a couple of weeks for public holidays and sick days means around 46 paid weeks — and that changes the arithmetic considerably.</p>
<p>A $50 hourly rate over 52 weeks looks like $104,000. Over 46 weeks it is $92,000, and that is before self-employment tax, unpaid admin time, insurance and pension contributions that an employer would otherwise cover. The usual rule of thumb is that a contract rate needs to be 25–35% above the equivalent salary to leave you level.</p>`,
    },
    {
      id: 'gross-net',
      h2: 'Gross is not what arrives',
      html: `<p>Every figure here is gross pay. What reaches your account is reduced by income tax, national insurance or FICA, pension contributions and often health insurance.</p>
<p>As a very rough guide, take-home in the US and UK is typically 70–80% of gross for middle incomes, falling as income rises. The only accurate figure comes from a tax calculator for your specific country, region and circumstances.</p>
<p>When comparing two offers, compare total compensation rather than salary alone: employer pension contribution, health cover, bonus, equity and holiday allowance routinely differ by more than the headline number does.</p>`,
    },
  ],

  faq: [
    { q: 'How do I convert hourly pay to an annual salary?', a: '<p>Multiply the hourly rate by hours per week, then by paid weeks per year. At 40 hours over 52 weeks, multiply by 2,080.</p>' },
    { q: 'How much is $25 an hour per year?', a: '<p>$52,000 at 40 hours a week over 52 weeks. Useful shortcut: double the hourly rate and add three zeros.</p>' },
    { q: 'Why is monthly pay not four times weekly pay?', a: '<p>Because a month averages 4.33 weeks, not 4. Multiplying weekly pay by four understates monthly pay by about 8% — always divide the annual figure by 12 instead.</p>' },
    { q: 'What should I set paid weeks to?', a: '<p>52 if you are an employee with paid holiday. If you are a contractor paid only for weeks worked, subtract your intended time off — around 46 is typical.</p>' },
    { q: 'Is this before or after tax?', a: '<p>Before. All figures are gross pay, since deductions vary enormously by country and personal circumstances.</p>' },
  ],

  related: ['overtime-pay-calculator', 'budget-tracker', 'percentage-calculator', 'compound-interest-calculator'],
};
