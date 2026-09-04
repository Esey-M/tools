export default {
  slug: 'recipe-scaler',
  category: 'home',
  title: 'Recipe Scaler – Adjust Ingredient Quantities for Any Servings',
  h1: 'Recipe Scaler',
  cardText: 'Rescale a whole recipe by pasting it in — quantities adjust, fractions stay readable.',
  description:
    'Free recipe scaler. Paste a recipe and change the number of servings — every quantity is rescaled automatically, with fractions kept readable.',
  keywords: ['recipe scaler', 'recipe converter', 'halve a recipe', 'double a recipe', 'scale recipe servings'],
  updated: '2026-09-04',
  lede: 'Paste your ingredient list, set the servings you want, and every quantity rescales — including fractions like 1½ and ranges like 2–3.',

  form: `
<div class="row">
  <div class="field">
    <label for="from">Recipe serves</label>
    <input type="number" id="from" inputmode="decimal" min="0.5" max="200" step="0.5" value="4">
  </div>
  <div class="field">
    <label for="to">You want to serve</label>
    <input type="number" id="to" inputmode="decimal" min="0.5" max="200" step="0.5" value="6">
  </div>
  <div class="field">
    <span class="field-label">Quick scale</span>
    <div class="seg" id="quick" style="margin-top:2px;flex-wrap:wrap">
      <button type="button" data-f="0.5">Half</button>
      <button type="button" data-f="1.5">1.5×</button>
      <button type="button" data-f="2">Double</button>
      <button type="button" data-f="3">Triple</button>
    </div>
  </div>
</div>

<div class="scale-grid">
  <div class="field">
    <label for="input">Your ingredients</label>
    <textarea id="input" rows="12" style="min-height:290px;font-family:var(--font-num);font-size:.94rem">250g plain flour
2 eggs
1 1/2 cups milk
3 tbsp butter, melted
1/2 tsp salt
2-3 tablespoons sugar
1 pinch of nutmeg</textarea>
  </div>
  <div class="field">
    <label for="output">Scaled to <strong id="tolabel">6</strong> servings</label>
    <textarea id="output" rows="12" readonly style="min-height:290px;background:var(--bg-sunken);font-family:var(--font-num);font-size:.94rem"></textarea>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn" id="copy">Copy scaled recipe</button>
  <button type="button" class="btn btn-ghost" id="swap">Use result as input</button>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.scale-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
@media (max-width:680px){.scale-grid{grid-template-columns:1fr}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var VULGAR = { '½':0.5, '⅓':1/3, '⅔':2/3, '¼':0.25, '¾':0.75, '⅕':0.2, '⅖':0.4, '⅗':0.6, '⅘':0.8,
                 '⅙':1/6, '⅚':5/6, '⅛':0.125, '⅜':0.375, '⅝':0.625, '⅞':0.875 };

  // Rendering back to the fractions cooks actually use.
  var NICE = [[1,'1'],[0.875,'7/8'],[0.8,'4/5'],[0.75,'3/4'],[0.6667,'2/3'],[0.625,'5/8'],
              [0.5,'1/2'],[0.375,'3/8'],[0.3333,'1/3'],[0.25,'1/4'],[0.2,'1/5'],[0.125,'1/8']];

  function parseNumber(str){
    str = str.trim();
    // Unicode vulgar fractions, possibly after a whole number.
    var m = /^(\\d+)?\\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/.exec(str);
    if (m) return (m[1] ? parseInt(m[1], 10) : 0) + VULGAR[m[2]];
    // Mixed number, e.g. "1 1/2".
    m = /^(\\d+)\\s+(\\d+)\\/(\\d+)$/.exec(str);
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10) / parseInt(m[3], 10);
    // Plain fraction.
    m = /^(\\d+)\\/(\\d+)$/.exec(str);
    if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);
    var v = parseFloat(str);
    return isFinite(v) ? v : null;
  }

  function formatNumber(n){
    if (!isFinite(n)) return '';
    if (n >= 10) return String(Math.round(n));
    if (n >= 1 && Math.abs(n - Math.round(n)) < 0.02) return String(Math.round(n));

    var whole = Math.floor(n);
    var frac = n - whole;

    // Below a quarter teaspoon nothing useful is measurable; round to a decimal.
    if (frac < 0.06) return whole ? String(whole) : (Math.round(n * 100) / 100).toString();

    var best = null, bestDiff = 1;
    for (var i = 0; i < NICE.length; i++) {
      var d = Math.abs(frac - NICE[i][0]);
      if (d < bestDiff) { bestDiff = d; best = NICE[i][1]; }
    }
    // If nothing fits within 4%, a decimal is more honest than a wrong fraction.
    if (bestDiff > 0.04) return (Math.round(n * 100) / 100).toString();
    if (best === '1') return String(whole + 1);
    return whole ? whole + ' ' + best : best;
  }

  function scaleLine(line, factor){
    if (!line.trim()) return line;
    // Rewrite every leading quantity, including ranges like "2-3".
    return line.replace(
      /(^|\\s|\\()(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?\\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\\d+(?:\\.\\d+)?)(\\s*[-–]\\s*)?(\\d+(?:\\.\\d+)?)?/g,
      function(match, pre, first, dash, second){
        var a = parseNumber(first);
        if (a === null) return match;
        var out = pre + formatNumber(a * factor);
        if (dash && second) {
          var b = parseNumber(second);
          if (b !== null) out += dash.replace(/\\s+/g, '') === '-' ? '-' : '–';
          out += formatNumber(b * factor);
        }
        return out;
      }
    );
  }

  function run(){
    var from = parseFloat($('from').value);
    var to = parseFloat($('to').value);
    if (!(from > 0) || !(to > 0)) return;
    var factor = to / from;

    var lines = $('input').value.split('\\n');
    $('output').value = lines.map(function(l){ return scaleLine(l, factor); }).join('\\n');
    $('tolabel').textContent = to % 1 === 0 ? to : to.toFixed(1);
    $('meta').textContent = 'Scaling by ' + (Math.round(factor * 1000) / 1000) + '× — from ' +
      from + ' to ' + to + ' servings.' +
      (factor > 2.5 ? ' Large scale-ups often need a longer cooking time and a bigger pan.' : '');
  }

  ['from','to','input'].forEach(function(id){ $(id).addEventListener('input', run); });
  $('quick').addEventListener('click', function(e){
    var b = e.target.closest('button[data-f]'); if (!b) return;
    var from = parseFloat($('from').value) || 4;
    $('to').value = from * parseFloat(b.getAttribute('data-f'));
    run();
  });
  $('copy').addEventListener('click', function(){
    navigator.clipboard.writeText($('output').value).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy scaled recipe'; }, 1400);
    });
  });
  $('swap').addEventListener('click', function(){
    $('input').value = $('output').value;
    $('from').value = $('to').value;
    run();
  });

  run();
})();`,

  answerHeading: 'Scaling a recipe',
  answer: `<p><strong>Multiply every ingredient by the ratio of the servings you want to the servings the recipe makes.</strong> Going from 4 to 6 servings is a factor of 1.5, so 250 g of flour becomes 375 g and 2 eggs become 3. Most ingredients scale linearly and cause no trouble. The exceptions matter though: cooking time, pan size, salt and strong spices do not scale in a straight line, and doubling a cake recipe into the same tin is the most common way a scaled recipe fails.</p>`,

  steps: [
    'Paste your ingredient list into the left box, one ingredient per line.',
    'Set what the recipe currently serves and what you want.',
    'The scaled list appears on the right, with fractions kept readable.',
    'Copy the result, or press <strong>use result as input</strong> to scale again.',
  ],

  sections: [
    {
      id: 'not-linear',
      h2: 'What does not scale linearly',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Ingredient or factor</th><th>How it scales</th></tr></thead>
<tbody>
<tr><td>Flour, sugar, liquid, fat</td><td>Directly — no adjustment needed</td></tr>
<tr><td>Salt</td><td>Scale to about 75–80%, then taste. Salt is easy to add and impossible to remove</td></tr>
<tr><td>Strong spices, chilli, garlic</td><td>Scale to about 75%, then adjust</td></tr>
<tr><td>Yeast</td><td>Scale to about 75% for large batches — more dough ferments faster</td></tr>
<tr><td>Baking powder and soda</td><td>Directly up to 2×, then reduce slightly</td></tr>
<tr><td>Alcohol and vanilla extract</td><td>About 75% — flavour concentrates as volume grows</td></tr>
<tr><td>Cooking time</td><td>Does not scale. Same temperature, check earlier and often</td></tr>
<tr><td>Pan size</td><td>Scale by area, not by length. See below</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'pans',
      h2: 'The pan size trap',
      html: `<p>This catches almost everyone who doubles a cake recipe. A tin twice as wide holds <em>four</em> times as much, because area grows with the square of the dimension.</p>
<div class="table-scroll"><table>
<thead><tr><th>Round tin</th><th>Area</th><th>Relative capacity</th></tr></thead>
<tbody>
<tr><td>15 cm (6 in)</td><td>177 cm²</td><td>1×</td></tr>
<tr><td>20 cm (8 in)</td><td>314 cm²</td><td>1.8×</td></tr>
<tr><td>23 cm (9 in)</td><td>415 cm²</td><td>2.4×</td></tr>
<tr><td>25 cm (10 in)</td><td>491 cm²</td><td>2.8×</td></tr>
</tbody></table></div>
<p>So doubling a recipe made for a 20 cm tin does not mean moving to a 40 cm tin — it means a 28 cm tin, or simply two 20 cm tins. Two tins is usually the safer choice, since batter depth affects how evenly a cake bakes.</p>`,
    },
    {
      id: 'eggs',
      h2: 'Halving a recipe with three eggs',
      html: `<p>Awkward quantities are the other common problem, and eggs are the worst offender.</p>
<p>To use half an egg: beat one whole egg, weigh it (a large egg is about 50 g without the shell), and use half. Whisking and measuring by tablespoon works too — one large egg is roughly 3 tablespoons.</p>
<p>For anything below about a quarter teaspoon, measuring is not realistic. Use the smallest amount you can manage and taste. This tool switches from fractions to decimals when a quantity gets small, precisely so you can see when you have reached that point.</p>`,
    },
  ],

  faq: [
    { q: 'How do I halve a recipe?', a: '<p>Set "you want to serve" to half the original, or press the <strong>Half</strong> button. Every quantity is divided, with fractions rendered in cooking-friendly form.</p>' },
    { q: 'Does cooking time scale too?', a: '<p>No. Keep the same temperature and start checking early. A doubled tray bake in a bigger dish may need slightly longer, but doubling the time will burn it.</p>' },
    { q: 'What about salt and spices?', a: '<p>Scale them to around 75% of what the maths suggests, then taste and adjust. Seasoning perception does not grow linearly with volume.</p>' },
    { q: 'Can it handle fractions like 1½?', a: '<p>Yes. Unicode fractions (½, ¾, ⅓), written fractions (1 1/2) and decimals are all understood, and results come back as readable fractions.</p>' },
    { q: 'What if my recipe uses cups and I want grams?', a: '<p>Scale it here first, then use the <a href="/cooking-converter/">cooking converter</a>, which carries per-ingredient densities — a cup of flour and a cup of honey differ by nearly three times in weight.</p>' },
  ],

  related: ['cooking-converter', 'unit-converter', 'grocery-list-maker', 'percentage-calculator'],
};
