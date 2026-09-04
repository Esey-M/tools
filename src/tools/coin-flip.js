export default {
  slug: 'coin-flip',
  category: 'random',
  title: 'Coin Flip – Heads or Tails Online',
  h1: 'Coin Flip',
  cardText: 'Flip a fair virtual coin, one at a time or hundreds at once.',
  description:
    'Free online coin flip. Get heads or tails instantly with a fair 50/50 result, flip many coins at once, and see the running tally of your results.',
  keywords: ['coin flip', 'heads or tails', 'flip a coin', 'coin toss', 'random coin flip'],
  updated: '2026-09-04',
  lede: 'A fair 50/50 flip, decided by your browser’s secure random number generator. No coin required.',

  form: `
<div class="coin-stage">
  <div class="coin" id="coin" data-face="heads" aria-hidden="true">
    <span class="coin-face coin-h">H</span>
    <span class="coin-face coin-t">T</span>
  </div>
  <p class="coin-result" id="result" aria-live="polite">Ready to flip</p>
</div>

<div class="btn-row" style="justify-content:center">
  <button type="button" class="btn btn-lg" id="flip">Flip the coin</button>
  <button type="button" class="btn btn-ghost" id="flip10">Flip 10</button>
  <button type="button" class="btn btn-ghost" id="reset">Reset tally</button>
</div>

<dl class="result-grid" style="margin-top:22px">
  <div class="stat"><dt>Heads</dt><dd id="h">0</dd></div>
  <div class="stat"><dt>Tails</dt><dd id="t">0</dd></div>
  <div class="stat"><dt>Flips</dt><dd id="n">0</dd></div>
  <div class="stat"><dt>Heads share</dt><dd id="pct">—</dd></div>
</dl>
<p class="hint" id="hist" style="margin-top:12px"></p>`,

  css: `
.coin-stage{display:grid;place-items:center;gap:14px;padding:14px 0 6px}
.coin{width:118px;height:118px;position:relative;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.3,.8,.4,1)}
.coin-face{position:absolute;inset:0;display:grid;place-items:center;border-radius:50%;
  font-size:2.9rem;font-weight:750;color:#6b4f12;backface-visibility:hidden;
  background:radial-gradient(circle at 32% 28%,#fbe9a8,#e6c25c 55%,#c99a2e);
  box-shadow:inset 0 0 0 5px rgba(255,255,255,.35),0 6px 16px -6px rgba(0,0,0,.4)}
.coin-t{transform:rotateY(180deg)}
.coin.is-tails{transform:rotateY(180deg)}
.coin.spin{transition:transform 1s cubic-bezier(.3,.9,.35,1)}
.coin-result{font-size:1.5rem;font-weight:660;letter-spacing:-.02em;min-height:1.4em}
@media (prefers-reduced-motion: reduce){.coin{transition:none}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var heads = 0, tails = 0, turns = 0;
  var recent = [];
  var coin = $('coin');

  function flipOnce(){
    var buf = new Uint8Array(1);
    crypto.getRandomValues(buf);
    return (buf[0] & 1) === 0 ? 'heads' : 'tails';
  }

  function updateStats(){
    $('h').textContent = heads;
    $('t').textContent = tails;
    $('n').textContent = heads + tails;
    $('pct').textContent = (heads + tails) ? (heads / (heads + tails) * 100).toFixed(1) + '%' : '—';
    $('hist').textContent = recent.length
      ? 'Recent: ' + recent.slice(-24).map(function(r){ return r === 'heads' ? 'H' : 'T'; }).join(' ')
      : '';
  }

  function show(face, spins){
    turns += spins;
    coin.style.transform = 'rotateY(' + (turns * 180) + 'deg)';
    // Land on the correct face: even half-turns show heads, odd show tails.
    if ((turns % 2 === 0) !== (face === 'heads')) {
      turns += 1;
      coin.style.transform = 'rotateY(' + (turns * 180) + 'deg)';
    }
    $('result').textContent = face === 'heads' ? 'Heads' : 'Tails';
  }

  $('flip').addEventListener('click', function(){
    var face = flipOnce();
    if (face === 'heads') heads++; else tails++;
    recent.push(face);
    show(face, 5);
    updateStats();
  });

  $('flip10').addEventListener('click', function(){
    var last = 'heads';
    for (var i = 0; i < 10; i++) {
      last = flipOnce();
      if (last === 'heads') heads++; else tails++;
      recent.push(last);
    }
    show(last, 7);
    $('result').textContent = 'Flipped 10 — last was ' + (last === 'heads' ? 'heads' : 'tails');
    updateStats();
  });

  $('reset').addEventListener('click', function(){
    heads = tails = 0; recent = [];
    $('result').textContent = 'Ready to flip';
    updateStats();
  });

  updateStats();
})();`,

  answerHeading: 'Is a virtual coin flip actually fair?',
  answer: `<p><strong>Yes — arguably fairer than a real coin.</strong> This flip reads a random byte from your browser's cryptographic random source and checks whether it is even or odd, giving exactly 50% for each outcome. A physical coin is very slightly biased: a well-known Stanford analysis found that a coin caught in the hand lands on the same face it started about 51% of the time, because of the way it precesses in flight. A digital flip has no such wobble.</p>`,

  steps: [
    'Press <strong>Flip the coin</strong> for a single heads-or-tails result.',
    'Use <strong>Flip 10</strong> to run ten flips at once and watch the tally.',
    'The running count and heads percentage update as you go.',
  ],

  sections: [
    {
      id: 'streaks',
      h2: 'Why long streaks are normal',
      html: `<p>People assume a fair coin should alternate. It does not, and streaks appear far more often than intuition suggests.</p>
<div class="table-scroll"><table>
<thead><tr><th>In 100 flips</th><th>Probability of seeing it</th></tr></thead>
<tbody>
<tr><td>A run of 5 in a row</td><td>~97%</td></tr>
<tr><td>A run of 6 in a row</td><td>~80%</td></tr>
<tr><td>A run of 7 in a row</td><td>~54%</td></tr>
<tr><td>A run of 10 in a row</td><td>~5%</td></tr>
</tbody></table></div>
<p>A run of six identical results in a hundred flips is more likely than not. If a sequence of coin flips looks suspiciously "random" — neatly alternating, no long runs — that is usually a sign it was made up by a human rather than generated.</p>`,
    },
    {
      id: 'gamblers-fallacy',
      h2: 'The coin has no memory',
      html: `<p>After five heads in a row, tails is <strong>not</strong> more likely. The next flip is still exactly 50/50, because the coin carries no record of what came before. Believing otherwise is the gambler's fallacy, and it is one of the most persistent errors in everyday probability reasoning.</p>
<p>What confuses people is <em>regression to the mean</em>, which is real but different. Over thousands of flips the overall proportion does drift towards 50%, not because past results get corrected, but because they get diluted by the sheer volume of new flips.</p>
<p>Flip 10 times and landing 7 heads is unremarkable. Flip 10,000 times and 7,000 heads would be extraordinary — not because the coin evened itself out, but because the early imbalance became statistically insignificant.</p>`,
    },
  ],

  faq: [
    { q: 'Is this coin flip really 50/50?', a: '<p>Yes. It reads a cryptographically secure random byte and tests a single bit, which is exactly even. There is no weighting and no hidden pattern.</p>' },
    { q: 'Can I use it to settle a bet?', a: '<p>For anything informal, absolutely. Because the result is generated on your own device, both parties should be watching the same screen — a flip you report from another room proves nothing.</p>' },
    { q: 'Are real coins actually biased?', a: '<p>Slightly. Research led by Persi Diaconis found that a spinning coin caught in the hand favours its starting face about 51% of the time. Spinning a coin on a table can be much more biased still, depending on the coin’s edge.</p>' },
    { q: 'Does the tally reset when I reload?', a: '<p>Yes. Nothing is stored — reloading or closing the page clears the count entirely.</p>' },
    { q: 'Why did I get eight heads in a row?', a: '<p>Because that happens. In a long session, runs of six, seven or eight are expected rather than surprising. See the streak table above.</p>' },
  ],

  related: ['dice-roller', 'random-number-generator', 'yes-no-decision-maker', 'random-name-picker'],
};
