export default {
  slug: 'percentage-calculator',
  category: 'calculators',
  title: 'Percentage Calculator – Three Ways to Work Out a Percent',
  h1: 'Percentage Calculator',
  cardText: 'Find a percentage of a number, what percent one number is of another, or a percent change.',
  description:
    'Free percentage calculator. Work out what X% of a number is, what percentage one number is of another, and the percentage increase or decrease between two values.',
  keywords: ['percentage calculator', 'percent calculator', 'percentage increase', 'percentage change', 'what percent'],
  updated: '2026-09-04',
  lede: 'Three percentage questions, one tool. Pick the one you are asking and fill in the two numbers you know.',

  form: `
<div class="field">
  <span class="field-label" id="mode-label">What are you working out?</span>
  <div class="seg" role="group" aria-labelledby="mode-label" id="modes" style="flex-wrap:wrap">
    <button type="button" data-mode="of" aria-pressed="true">X% of Y</button>
    <button type="button" data-mode="is">X is what % of Y</button>
    <button type="button" data-mode="change">% change</button>
  </div>
</div>

<div class="pc-line" id="line-of">
  <span>What is</span>
  <input type="number" id="of-a" inputmode="decimal" step="any" placeholder="15" aria-label="Percentage">
  <span>% of</span>
  <input type="number" id="of-b" inputmode="decimal" step="any" placeholder="200" aria-label="Number">
  <span>?</span>
</div>

<div class="pc-line" id="line-is" hidden>
  <input type="number" id="is-a" inputmode="decimal" step="any" placeholder="30" aria-label="Part">
  <span>is what percent of</span>
  <input type="number" id="is-b" inputmode="decimal" step="any" placeholder="200" aria-label="Whole">
  <span>?</span>
</div>

<div class="pc-line" id="line-change" hidden>
  <span>From</span>
  <input type="number" id="ch-a" inputmode="decimal" step="any" placeholder="200" aria-label="Starting value">
  <span>to</span>
  <input type="number" id="ch-b" inputmode="decimal" step="any" placeholder="250" aria-label="Ending value">
  <span>?</span>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="rlabel">Answer</div>
  <div class="result-value" id="ans">—</div>
  <div class="result-note" id="work"></div>
</div>
<p class="hint" id="prompt" style="margin-top:14px">Fill in both numbers to see the answer.</p>`,

  css: `
.pc-line{display:flex;flex-wrap:wrap;align-items:center;gap:9px;font-size:1.05rem;color:var(--ink-2);margin-top:6px}
.pc-line input{width:auto;flex:0 1 130px;min-width:96px;font-size:1.05rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var mode = 'of';
  var out = $('out'), prompt = $('prompt');
  var fmt = function(n){
    if (!isFinite(n)) return '—';
    var r = Math.round(n * 1e6) / 1e6;
    return r.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };
  var num = function(id){ var v = parseFloat($(id).value); return isFinite(v) ? v : NaN; };

  function show(a, label, work){
    $('ans').textContent = a;
    $('rlabel').textContent = label;
    $('work').textContent = work;
    out.hidden = false; prompt.hidden = true;
  }
  function hide(){ out.hidden = true; prompt.hidden = false; }

  function calc(){
    if (mode === 'of') {
      var p = num('of-a'), n = num('of-b');
      if (isNaN(p) || isNaN(n)) return hide();
      var r = p * n / 100;
      show(fmt(r), fmt(p) + '% of ' + fmt(n) + ' is', fmt(p) + ' ÷ 100 × ' + fmt(n) + ' = ' + fmt(r));
    } else if (mode === 'is') {
      var a = num('is-a'), b = num('is-b');
      if (isNaN(a) || isNaN(b)) return hide();
      if (b === 0) return show('—', 'Undefined', 'You cannot express a number as a percentage of zero.');
      var pc = a / b * 100;
      show(fmt(pc) + '%', fmt(a) + ' as a percentage of ' + fmt(b), fmt(a) + ' ÷ ' + fmt(b) + ' × 100 = ' + fmt(pc) + '%');
    } else {
      var x = num('ch-a'), y = num('ch-b');
      if (isNaN(x) || isNaN(y)) return hide();
      if (x === 0) return show('—', 'Undefined', 'Percentage change from zero is undefined — any increase is infinite.');
      var ch = (y - x) / Math.abs(x) * 100;
      var word = ch > 0 ? 'increase' : ch < 0 ? 'decrease' : 'change';
      show((ch > 0 ? '+' : '') + fmt(ch) + '%', 'Percentage ' + word,
        '(' + fmt(y) + ' − ' + fmt(x) + ') ÷ ' + fmt(Math.abs(x)) + ' × 100 = ' + fmt(ch) + '%');
    }
  }

  $('modes').addEventListener('click', function(e){
    var btn = e.target.closest('button[data-mode]'); if (!btn) return;
    mode = btn.getAttribute('data-mode');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === btn));
    $('line-of').hidden = mode !== 'of';
    $('line-is').hidden = mode !== 'is';
    $('line-change').hidden = mode !== 'change';
    calc();
  });
  ['of-a','of-b','is-a','is-b','ch-a','ch-b'].forEach(function(id){ $(id).addEventListener('input', calc); });
})();`,

  answerHeading: 'The three percentage questions',
  answer: `<p><strong>Almost every percentage problem is one of three questions.</strong> To find a percentage of a number, multiply and divide by 100: 15% of 200 is 15 ÷ 100 × 200 = 30. To find what percentage one number is of another, divide and multiply by 100: 30 out of 200 is 30 ÷ 200 × 100 = 15%. To find percentage change, subtract, divide by the original, and multiply by 100: going from 200 to 250 is (250 − 200) ÷ 200 × 100 = a 25% increase.</p>`,

  steps: [
    'Choose which of the three questions you are asking using the buttons at the top.',
    'Type the two numbers you already know into the sentence.',
    'The answer and the full working appear underneath as you type.',
  ],

  sections: [
    {
      id: 'formulas',
      h2: 'The three formulas',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Question</th><th>Formula</th><th>Example</th></tr></thead>
<tbody>
<tr><td>What is X% of Y?</td><td><code>X ÷ 100 × Y</code></td><td>15% of 200 = 30</td></tr>
<tr><td>X is what % of Y?</td><td><code>X ÷ Y × 100</code></td><td>30 of 200 = 15%</td></tr>
<tr><td>% change from X to Y</td><td><code>(Y − X) ÷ X × 100</code></td><td>200 → 250 = +25%</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'mental',
      h2: 'Doing percentages in your head',
      html: `<p>A few shortcuts cover most everyday cases.</p>
<ul>
<li><strong>10%</strong> — move the decimal point one place left. 10% of 84 is 8.4.</li>
<li><strong>5%</strong> — take 10% and halve it. 5% of 84 is 4.2.</li>
<li><strong>20%</strong> — take 10% and double it. 20% of 84 is 16.8.</li>
<li><strong>15%</strong> — 10% plus half of that. 8.4 + 4.2 = 12.6.</li>
<li><strong>1%</strong> — move the decimal two places left. 1% of 84 is 0.84.</li>
</ul>
<p>The reversal trick is also worth knowing: <strong>X% of Y always equals Y% of X.</strong> 4% of 75 is awkward, but 75% of 4 is obviously 3. Same answer, far less effort.</p>`,
    },
    {
      id: 'gotcha',
      h2: 'The trap: a 50% rise then a 50% fall is not zero',
      html: `<p>Percentage changes do not cancel out, because each one is measured against a different starting point.</p>
<p>Take $100. A 50% increase brings it to $150. A 50% decrease from $150 removes $75, leaving <strong>$75</strong> — not the $100 you started with. To undo a 50% rise you need a 33.3% fall.</p>
<p>The same trap appears with discounts and taxes. If a price rises 20% and later drops 20%, you end up 4% below where you began.</p>
<p>Note too the difference between <strong>percent</strong> and <strong>percentage point</strong>. If an interest rate moves from 4% to 5%, that is a rise of one percentage point but a 25% increase in the rate itself.</p>`,
    },
  ],

  faq: [
    { q: 'How do I calculate a percentage of a number?', a: '<p>Divide the percentage by 100 and multiply by the number. For 15% of 200: 15 ÷ 100 = 0.15, then 0.15 × 200 = 30.</p>' },
    { q: 'How do I work out percentage increase?', a: '<p>Subtract the old value from the new one, divide by the old value, then multiply by 100. From 200 to 250: (250 − 200) ÷ 200 × 100 = 25% increase.</p>' },
    { q: 'What is the difference between percent and percentage point?', a: '<p>A percentage point is the plain arithmetic difference between two percentages. Moving from 4% to 5% is a rise of one percentage point, but a 25% relative increase. News reports often blur the two.</p>' },
    { q: 'How do I remove a percentage that has already been added?', a: '<p>Divide rather than subtract. To strip 20% VAT from a $120 price, divide by 1.2 to get $100. Subtracting 20% of $120 would wrongly give $96.</p>' },
    { q: 'Why does the calculator show the working?', a: '<p>So you can check the result and reuse the method by hand later. The line underneath the answer shows the exact arithmetic performed.</p>' },
  ],

  related: ['discount-calculator', 'tip-calculator', 'compound-interest-calculator', 'sales-tax-calculator'],
};
