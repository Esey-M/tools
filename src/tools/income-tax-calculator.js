export default {
  slug: 'income-tax-calculator',
  category: 'calculators',
  title: 'Income Tax Calculator – US and UK Take-Home Estimate',
  h1: 'Income Tax Calculator',
  cardText: 'Estimate take-home pay after income tax and national insurance or FICA.',
  description:
    'Free income tax calculator for the US and UK. Estimate take-home pay after income tax, national insurance or FICA, with the marginal rate and a band breakdown.',
  keywords: ['income tax calculator', 'take home pay calculator', 'salary after tax', 'net pay calculator', 'tax bracket calculator'],
  updated: '2026-09-04',
  disclaimer: 'A simplified estimate using headline rates. Your actual liability depends on circumstances a calculator cannot see — get advice for anything that matters.',
  lede: 'A simplified estimate of what reaches your account. It uses headline rates only, and the page is explicit about what it leaves out.',

  form: `
<div class="row">
  <div class="field">
    <label for="country">Country</label>
    <select id="country">
      <option value="uk" selected>United Kingdom</option>
      <option value="us">United States (federal only)</option>
    </select>
  </div>
  <div class="field">
    <label for="income">Gross annual income</label>
    <div class="input-group">
      <span class="addon" id="cur" style="border-radius:var(--radius-sm) 0 0 var(--radius-sm);border-right:none">£</span>
      <input type="number" id="income" inputmode="decimal" min="0" step="1000" value="45000" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none;border-right:1px solid var(--line-strong)">
    </div>
  </div>
  <div class="field" id="filing-field" hidden>
    <label for="filing">Filing status</label>
    <select id="filing">
      <option value="single" selected>Single</option>
      <option value="joint">Married filing jointly</option>
    </select>
  </div>
  <div class="field">
    <label for="pension" id="pensionlabel">Pension contribution</label>
    <div class="input-group"><input type="number" id="pension" inputmode="decimal" min="0" max="60" step="1" value="5"><span class="addon">%</span></div>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Take-home pay</div>
  <div class="result-value" id="net">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>Per month</dt><dd id="monthly">—</dd></div>
    <div class="stat"><dt>Income tax</dt><dd id="tax">—</dd></div>
    <div class="stat"><dt id="nilabel">National insurance</dt><dd id="ni">—</dd></div>
    <div class="stat"><dt>Marginal rate</dt><dd id="marginal">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Band by band</h2>
  <div class="table-scroll"><table id="bands"><thead><tr><th>Band</th><th>Rate</th><th>Income in band</th><th>Tax</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // Headline rates. Thresholds change annually — update these each tax year.
  var UK = {
    personalAllowance: 12570,
    taperStart: 100000,               // allowance tapers away above this
    bands: [
      ['Basic rate', 12570, 50270, 0.20],
      ['Higher rate', 50270, 125140, 0.40],
      ['Additional rate', 125140, Infinity, 0.45]
    ],
    ni: [[12570, 50270, 0.08], [50270, Infinity, 0.02]]
  };

  var US = {
    standardDeduction: { single: 14600, joint: 29200 },
    bands: {
      single: [
        ['10%', 0, 11600, 0.10], ['12%', 11600, 47150, 0.12], ['22%', 47150, 100525, 0.22],
        ['24%', 100525, 191950, 0.24], ['32%', 191950, 243725, 0.32],
        ['35%', 243725, 609350, 0.35], ['37%', 609350, Infinity, 0.37]
      ],
      joint: [
        ['10%', 0, 23200, 0.10], ['12%', 23200, 94300, 0.12], ['22%', 94300, 201050, 0.22],
        ['24%', 201050, 383900, 0.24], ['32%', 383900, 487450, 0.32],
        ['35%', 487450, 731200, 0.35], ['37%', 731200, Infinity, 0.37]
      ]
    },
    // Social Security 6.2% to the wage base, Medicare 1.45% with no cap.
    ssRate: 0.062, ssCap: 168600, medicareRate: 0.0145,
    medicareExtra: 0.009, medicareExtraFrom: { single: 200000, joint: 250000 }
  };

  function money(n, cur){ return cur + Math.round(n).toLocaleString('en-US'); }

  function calc(){
    var country = $('country').value;
    var gross = parseFloat($('income').value);
    var pensionPct = parseFloat($('pension').value);
    if (!isFinite(gross) || gross < 0) return;
    if (!isFinite(pensionPct) || pensionPct < 0) pensionPct = 0;

    var cur = country === 'uk' ? '£' : '$';
    $('cur').textContent = cur;
    $('filing-field').hidden = country !== 'us';
    $('nilabel').textContent = country === 'uk' ? 'National insurance' : 'FICA';
    $('pensionlabel').textContent = country === 'uk' ? 'Pension contribution' : '401(k) contribution';

    var pension = gross * pensionPct / 100;
    var rows = [], tax = 0, social = 0, taxable, marginal = 0;

    if (country === 'uk') {
      // Pension contributions are relieved, so they reduce taxable pay.
      var afterPension = gross - pension;
      var allowance = UK.personalAllowance;
      if (afterPension > UK.taperStart) {
        allowance = Math.max(0, allowance - (afterPension - UK.taperStart) / 2);
      }
      taxable = Math.max(0, afterPension - allowance);

      rows.push(['Personal allowance', '0%', Math.min(afterPension, allowance), 0]);
      var lower = allowance;
      UK.bands.forEach(function(b){
        var from = Math.max(b[1], lower);
        var amount = Math.max(0, Math.min(afterPension, b[2]) - from);
        if (amount > 0) {
          var t = amount * b[3];
          tax += t;
          rows.push([b[0], (b[3] * 100) + '%', amount, t]);
          marginal = b[3];
        }
      });
      if (afterPension <= allowance) marginal = 0;

      // NI is charged on gross pay, not after pension, for most schemes.
      UK.ni.forEach(function(b){
        var amount = Math.max(0, Math.min(gross, b[1]) - b[0]);
        if (amount > 0) social += amount * b[2];
      });
      if (gross > UK.taperStart && gross < 125140) marginal = 0.60;   // the 60% trap

    } else {
      var filing = $('filing').value;
      var afterPension2 = gross - pension;
      var deduction = US.standardDeduction[filing];
      taxable = Math.max(0, afterPension2 - deduction);

      rows.push(['Standard deduction', '0%', Math.min(afterPension2, deduction), 0]);
      US.bands[filing].forEach(function(b){
        var amount = Math.max(0, Math.min(taxable, b[2]) - b[1]);
        if (amount > 0) {
          var t = amount * b[3];
          tax += t;
          rows.push([b[0] + ' bracket', b[0], amount, t]);
          marginal = b[3];
        }
      });

      // FICA applies to gross wages; 401(k) does not reduce it.
      social += Math.min(gross, US.ssCap) * US.ssRate;
      social += gross * US.medicareRate;
      var extraFrom = US.medicareExtraFrom[filing];
      if (gross > extraFrom) social += (gross - extraFrom) * US.medicareExtra;
    }

    var net = gross - tax - social - pension;

    $('net').textContent = money(net, cur) + ' a year';
    $('monthly').textContent = money(net / 12, cur);
    $('tax').textContent = money(tax, cur);
    $('ni').textContent = money(social, cur);
    $('marginal').textContent = Math.round(marginal * 100) + '%';
    $('note').textContent = 'From ' + money(gross, cur) + ' gross: ' + money(tax, cur) + ' tax, ' +
      money(social, cur) + (country === 'uk' ? ' national insurance' : ' FICA') +
      (pension > 0 ? ', ' + money(pension, cur) + ' into your pension' : '') +
      '. Effective rate ' + ((tax + social) / gross * 100).toFixed(1) + '%.';

    $('bands').querySelector('tbody').innerHTML = rows.map(function(r){
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + money(r[2], cur) + '</td><td>' + money(r[3], cur) + '</td></tr>';
    }).join('');
  }

  ['country','income','filing','pension'].forEach(function(id){
    $(id).addEventListener($(id).tagName === 'SELECT' ? 'change' : 'input', calc);
  });
  calc();
})();`,

  answerHeading: 'How income tax bands actually work',
  answer: `<p><strong>A higher tax band applies only to the income above its threshold, never to all of it.</strong> This is the single most common misunderstanding about tax. In the UK, earning £50,300 does not mean paying 40% on everything — it means 40% on the £30 above the £50,270 threshold, and 20% on the band below. Moving into a higher bracket can never leave you worse off overall. The one genuine exception in the UK is the £100,000–£125,140 range, where the personal allowance is withdrawn and the effective marginal rate reaches 60%.</p>`,

  steps: [
    'Choose your country.',
    'Enter your gross annual income before any deductions.',
    'Add your pension or 401(k) contribution as a percentage.',
    'Read the take-home figure and the band-by-band breakdown.',
  ],

  sections: [
    {
      id: 'uk-bands',
      h2: 'UK rates used here',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Band</th><th>Income</th><th>Rate</th></tr></thead>
<tbody>
<tr><td>Personal allowance</td><td>Up to £12,570</td><td>0%</td></tr>
<tr><td>Basic rate</td><td>£12,571 – £50,270</td><td>20%</td></tr>
<tr><td>Higher rate</td><td>£50,271 – £125,140</td><td>40%</td></tr>
<tr><td>Additional rate</td><td>Over £125,140</td><td>45%</td></tr>
</tbody></table></div>
<p>National insurance is charged at 8% between £12,570 and £50,270, then 2% above. Scotland has its own income tax bands, which this calculator does not model.</p>
<p><strong>The 60% trap:</strong> above £100,000 the personal allowance is withdrawn at £1 for every £2 earned. Between £100,000 and £125,140 that produces an effective marginal rate of 60%, which is why pension contributions in that band are unusually efficient.</p>`,
    },
    {
      id: 'us-bands',
      h2: 'US rates used here',
      html: `<p>Federal income tax only, using the standard deduction. FICA is 6.2% Social Security up to the wage base plus 1.45% Medicare with no cap, and an extra 0.9% Medicare above $200,000 single or $250,000 joint.</p>
<div class="table-scroll"><table>
<thead><tr><th>Rate</th><th>Single</th><th>Married filing jointly</th></tr></thead>
<tbody>
<tr><td>10%</td><td>Up to $11,600</td><td>Up to $23,200</td></tr>
<tr><td>12%</td><td>$11,601 – $47,150</td><td>$23,201 – $94,300</td></tr>
<tr><td>22%</td><td>$47,151 – $100,525</td><td>$94,301 – $201,050</td></tr>
<tr><td>24%</td><td>$100,526 – $191,950</td><td>$201,051 – $383,900</td></tr>
<tr><td>32%</td><td>$191,951 – $243,725</td><td>$383,901 – $487,450</td></tr>
<tr><td>35%</td><td>$243,726 – $609,350</td><td>$487,451 – $731,200</td></tr>
<tr><td>37%</td><td>Over $609,350</td><td>Over $731,200</td></tr>
</tbody></table></div>
<p><strong>State tax is not included</strong>, and it ranges from nothing in nine states to over 13% in California. Add your state rate separately.</p>`,
    },
    {
      id: 'limits',
      h2: 'What this leaves out',
      html: `<p>Real tax is far more individual than any calculator. This one does not model:</p>
<ul>
<li><strong>US state and local taxes</strong>, which can add 0–13%.</li>
<li><strong>Scottish income tax bands</strong>, which differ from the rest of the UK.</li>
<li><strong>Student loan repayments</strong>, which behave like an additional marginal rate.</li>
<li><strong>Itemised deductions, credits and allowances</strong> — child benefit, marriage allowance, mortgage interest, dependent credits.</li>
<li><strong>Self-employment</strong>, where both halves of FICA or Class 2 and 4 NI apply.</li>
<li><strong>Salary sacrifice</strong>, which reduces NI as well as income tax and is materially better than a standard pension contribution.</li>
<li><strong>Any income that is not employment income</strong> — dividends, capital gains and rental income are all taxed differently.</li>
</ul>
<p>Use it to understand the shape of your tax, not to file anything.</p>`,
    },
  ],

  faq: [
    { q: 'Will earning more push me into a higher bracket and leave me worse off?', a: '<p>No. Higher rates apply only to the income above the threshold, so an extra pound always leaves you with more. The UK £100,000–£125,140 band is the closest thing to an exception, where the marginal rate hits 60% — you still keep 40p in the pound.</p>' },
    { q: 'Does a pension contribution reduce my tax?', a: '<p>In the UK, yes — contributions get income tax relief, which is why the calculator applies them before tax. In the US, traditional 401(k) contributions reduce federal income tax but not FICA.</p>' },
    { q: 'Why is my payslip different from this?', a: '<p>Because payroll applies your specific tax code, student loan plan, salary sacrifice arrangements, benefits in kind, and any mid-year adjustments. This is a headline-rate estimate.</p>' },
    { q: 'Does it include US state tax?', a: '<p>No, federal only. State income tax ranges from zero in nine states to over 13% in California, so add yours separately.</p>' },
    { q: 'What is the 60% tax trap?', a: '<p>Between £100,000 and £125,140 in the UK, the personal allowance is withdrawn at £1 for every £2 earned. Combined with 40% tax that produces a 60% effective marginal rate, making pension contributions in that band unusually valuable.</p>' },
    { q: 'How often do these rates change?', a: '<p>Annually. The figures here are headline rates and thresholds that should be checked against the current tax year before relying on them.</p>' },
  ],

  related: ['salary-calculator', 'budget-tracker', 'overtime-pay-calculator', 'retirement-calculator'],
};
