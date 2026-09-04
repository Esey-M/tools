export default {
  slug: 'dice-roller',
  category: 'random',
  title: 'Dice Roller – Roll D4, D6, D8, D10, D12 and D20 Online',
  h1: 'Dice Roller',
  cardText: 'Roll any number of dice, from a single D6 to a fistful of D20s.',
  description:
    'Free online dice roller for D4, D6, D8, D10, D12, D20 and D100. Roll several dice at once, add a modifier, and see every individual result plus the total.',
  keywords: ['dice roller', 'roll a dice', 'd20 roller', 'online dice', 'dnd dice roller'],
  updated: '2026-09-04',
  lede: 'Pick your die, choose how many, add a modifier if you need one, and roll. Every individual result is shown, not just the total.',

  form: `
<div class="field">
  <span class="field-label" id="die-label">Die</span>
  <div class="seg" role="group" aria-labelledby="die-label" id="dice" style="flex-wrap:wrap">
    <button type="button" data-d="4">D4</button>
    <button type="button" data-d="6" aria-pressed="true">D6</button>
    <button type="button" data-d="8">D8</button>
    <button type="button" data-d="10">D10</button>
    <button type="button" data-d="12">D12</button>
    <button type="button" data-d="20">D20</button>
    <button type="button" data-d="100">D100</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="count">How many dice</label>
    <input type="number" id="count" inputmode="numeric" min="1" max="50" step="1" value="2">
  </div>
  <div class="field">
    <label for="mod">Modifier</label>
    <input type="number" id="mod" inputmode="numeric" step="1" value="0" placeholder="+0">
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="roll">Roll</button>
  <button type="button" class="btn btn-ghost" id="reset">Clear history</button>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Total</div>
  <div class="result-value" id="total">—</div>
  <div class="dice-list" id="list"></div>
  <div class="result-note" id="note"></div>
</div>
<p class="hint" id="hist" style="margin-top:14px"></p>`,

  css: `
.dice-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.dice-list span{min-width:42px;height:42px;display:grid;place-items:center;padding:0 8px;
  background:var(--bg-raised);border:1px solid var(--line);border-radius:9px;
  font-weight:660;font-variant-numeric:tabular-nums;font-size:1.05rem}
.dice-list span.max{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)}
.dice-list span.min{border-color:color-mix(in srgb,var(--danger) 45%,transparent);color:var(--danger)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var sides = 6;
  var history = [];

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return 1 + (v % max);
  }

  function roll(){
    var n = Math.max(1, Math.min(50, parseInt($('count').value, 10) || 1));
    var mod = parseInt($('mod').value, 10) || 0;
    var rolls = [];
    for (var i = 0; i < n; i++) rolls.push(randInt(sides));
    var sum = rolls.reduce(function(a, b){ return a + b; }, 0);
    var total = sum + mod;

    $('total').textContent = total.toLocaleString('en-US');
    $('lbl').textContent = n + 'd' + sides + (mod ? (mod > 0 ? ' + ' + mod : ' − ' + Math.abs(mod)) : '');
    $('list').innerHTML = rolls.map(function(r){
      var cls = r === sides ? ' class="max"' : (r === 1 && sides > 1 ? ' class="min"' : '');
      return '<span' + cls + '>' + r + '</span>';
    }).join('');
    $('note').textContent = n > 1
      ? 'Dice total ' + sum + (mod ? ', modifier ' + (mod > 0 ? '+' : '') + mod : '') +
        '  ·  highest ' + Math.max.apply(null, rolls) + ', lowest ' + Math.min.apply(null, rolls)
      : (mod ? 'Rolled ' + rolls[0] + ', modifier ' + (mod > 0 ? '+' : '') + mod : 'Possible range 1–' + sides);
    $('out').hidden = false;

    history.unshift(n + 'd' + sides + (mod ? (mod > 0 ? '+' + mod : mod) : '') + ' → ' + total);
    $('hist').textContent = 'Recent rolls: ' + history.slice(0, 8).join('  ·  ');
  }

  $('dice').addEventListener('click', function(e){
    var b = e.target.closest('button[data-d]'); if (!b) return;
    sides = parseInt(b.getAttribute('data-d'), 10);
    var btns = $('dice').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    roll();
  });
  $('roll').addEventListener('click', roll);
  $('reset').addEventListener('click', function(){ history = []; $('hist').textContent = ''; });
})();`,

  answerHeading: 'How the rolls are generated',
  answer: `<p><strong>Each die is rolled independently using your browser's cryptographic random number generator</strong>, with rejection sampling so every face is exactly equally likely. There is no seed, no pattern, and no server involvement. A physical die is subtly biased by manufacturing tolerances — pipped dice are famously slightly weighted towards the six, because the drilled pips remove material from that face — so a digital roll is, if anything, fairer.</p>`,

  steps: [
    'Choose your die type, from D4 up to D100.',
    'Set how many dice to roll at once.',
    'Add a modifier if your game calls for one — it is added to the total, not to each die.',
    'Press Roll. Individual results are shown, with natural maximums and ones highlighted.',
  ],

  sections: [
    {
      id: 'probability',
      h2: 'Why 2d6 is not the same as 1d12',
      html: `<p>Both produce a range, but the shapes are completely different. One twelve-sided die is uniform — every result from 1 to 12 is equally likely. Two six-sided dice cluster hard around 7.</p>
<div class="table-scroll"><table>
<thead><tr><th>Total on 2d6</th><th>Ways to roll it</th><th>Probability</th></tr></thead>
<tbody>
<tr><td>2 or 12</td><td>1</td><td>2.8%</td></tr>
<tr><td>3 or 11</td><td>2</td><td>5.6%</td></tr>
<tr><td>4 or 10</td><td>3</td><td>8.3%</td></tr>
<tr><td>5 or 9</td><td>4</td><td>11.1%</td></tr>
<tr><td>6 or 8</td><td>5</td><td>13.9%</td></tr>
<tr><td>7</td><td>6</td><td>16.7%</td></tr>
</tbody></table></div>
<p>Seven comes up six times more often than two. This is why board games that use 2d6 feel predictable while a d12 feels wild, even though both span a similar range.</p>`,
    },
    {
      id: 'reference',
      h2: 'Common dice and their averages',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Die</th><th>Range</th><th>Average roll</th><th>Typically used for</th></tr></thead>
<tbody>
<tr><td>D4</td><td>1–4</td><td>2.5</td><td>Small damage rolls</td></tr>
<tr><td>D6</td><td>1–6</td><td>3.5</td><td>Board games, most damage rolls</td></tr>
<tr><td>D8</td><td>1–8</td><td>4.5</td><td>Weapon damage</td></tr>
<tr><td>D10</td><td>1–10</td><td>5.5</td><td>Percentile tens, damage</td></tr>
<tr><td>D12</td><td>1–12</td><td>6.5</td><td>Heavy weapon damage</td></tr>
<tr><td>D20</td><td>1–20</td><td>10.5</td><td>Attack rolls, skill checks</td></tr>
<tr><td>D100</td><td>1–100</td><td>50.5</td><td>Percentage outcomes, loot tables</td></tr>
</tbody></table></div>`,
    },
  ],

  faq: [
    { q: 'Is this dice roller fair?', a: '<p>Yes. It uses <code>crypto.getRandomValues</code> with rejection sampling, so each face has exactly equal probability with no modulo bias.</p>' },
    { q: 'Can I roll dice for Dungeons & Dragons?', a: '<p>Yes — every standard polyhedral die is here, along with a modifier field for adding your ability and proficiency bonuses. Natural 20s and natural 1s are highlighted automatically.</p>' },
    { q: 'How do I roll with advantage?', a: '<p>Roll 2d20 and take the higher of the two individual results shown. For disadvantage, take the lower. The total is not what you want in either case.</p>' },
    { q: 'How do I roll percentile dice?', a: '<p>Select D100 and roll one die. That is equivalent to the traditional d10 tens plus d10 units, giving a flat 1 to 100.</p>' },
    { q: 'Are physical dice biased?', a: '<p>Slightly. Standard pipped casino-grade dice are filled to compensate, but ordinary board game dice have drilled pips that remove a little material, marginally favouring the six. The effect is small, but a digital roll avoids it entirely.</p>' },
  ],

  related: ['coin-flip', 'random-number-generator', 'random-name-picker', 'yes-no-decision-maker'],
};
