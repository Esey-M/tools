export default {
  slug: 'lottery-number-picker',
  category: 'random',
  title: 'Lottery Number Picker – Random Numbers for Any Draw',
  h1: 'Lottery Number Picker',
  cardText: 'Random picks for Powerball, EuroMillions, Lotto and custom draws.',
  description:
    'Free lottery number generator. Get random picks for Powerball, Mega Millions, EuroMillions, UK Lotto or any custom format, with honest odds shown.',
  keywords: ['lottery number generator', 'random lottery numbers', 'powerball numbers', 'lucky dip', 'euromillions generator'],
  updated: '2026-09-04',
  disclaimer: 'Random numbers do not improve your odds. Play only what you can afford to lose.',
  lede: 'Pick a game or set your own format. The numbers are drawn with the same uniform randomness as the machine — which is to say, they will almost certainly not win.',

  form: `
<div class="field">
  <label for="game">Game</label>
  <select id="game"></select>
</div>

<div class="row" id="custom" hidden>
  <div class="field">
    <label for="pick">Numbers to pick</label>
    <input type="number" id="pick" inputmode="numeric" min="1" max="20" step="1" value="6">
  </div>
  <div class="field">
    <label for="from">From 1 to</label>
    <input type="number" id="from" inputmode="numeric" min="2" max="100" step="1" value="49">
  </div>
  <div class="field">
    <label for="bonus">Bonus balls</label>
    <input type="number" id="bonus" inputmode="numeric" min="0" max="5" step="1" value="0">
  </div>
  <div class="field">
    <label for="bonusmax">Bonus from 1 to</label>
    <input type="number" id="bonusmax" inputmode="numeric" min="2" max="100" step="1" value="10">
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="lines">Lines to generate</label>
    <input type="number" id="lines" inputmode="numeric" min="1" max="20" step="1" value="1">
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Generate numbers</button>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Your numbers</div>
  <div id="lines-out" class="lotto-lines"></div>
  <div class="result-note" id="odds"></div>
</div>`,

  css: `
.lotto-lines{display:flex;flex-direction:column;gap:11px;margin-top:12px}
.lotto-line{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ball{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;
  background:var(--bg-raised);border:2px solid var(--accent);color:var(--accent-ink);
  font-weight:700;font-variant-numeric:tabular-nums;font-size:1.02rem;flex:none}
.ball.bonus{border-color:var(--warn);color:var(--warn);border-style:dashed}
.lotto-line .lb{font-size:.78rem;color:var(--ink-3);margin-right:4px;min-width:44px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // [name, pick, from, bonusCount, bonusFrom]
  var GAMES = [
    ['Powerball (US)', 5, 69, 1, 26],
    ['Mega Millions (US)', 5, 70, 1, 25],
    ['EuroMillions', 5, 50, 2, 12],
    ['UK Lotto', 6, 59, 0, 0],
    ['UK Thunderball', 5, 39, 1, 14],
    ['Lotto 6/49 (Canada)', 6, 49, 0, 0],
    ['Oz Lotto (Australia)', 7, 47, 0, 0],
    ['Custom…', 6, 49, 0, 0]
  ];

  $('game').innerHTML = GAMES.map(function(g, i){
    return '<option value="' + i + '">' + g[0] + '</option>';
  }).join('');

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  /** Unbiased selection without replacement via a partial Fisher-Yates. */
  function draw(count, max){
    var pool = [];
    for (var i = 1; i <= max; i++) pool.push(i);
    var out = [];
    for (var k = 0; k < count && pool.length; k++) {
      var j = k + randInt(pool.length - k);
      var t = pool[k]; pool[k] = pool[j]; pool[j] = t;
      out.push(pool[k]);
    }
    return out.sort(function(a, b){ return a - b; });
  }

  function combinations(n, k){
    if (k > n) return Infinity;
    var r = 1;
    for (var i = 0; i < k; i++) r = r * (n - i) / (i + 1);
    return Math.round(r);
  }

  function config(){
    var idx = parseInt($('game').value, 10);
    var g = GAMES[idx];
    if (g[0] === 'Custom…') {
      return {
        name: 'Custom draw',
        pick: Math.max(1, parseInt($('pick').value, 10) || 1),
        from: Math.max(2, parseInt($('from').value, 10) || 2),
        bonus: Math.max(0, parseInt($('bonus').value, 10) || 0),
        bonusFrom: Math.max(2, parseInt($('bonusmax').value, 10) || 2)
      };
    }
    return { name: g[0], pick: g[1], from: g[2], bonus: g[3], bonusFrom: g[4] };
  }

  function generate(){
    var c = config();
    if (c.pick > c.from) c.pick = c.from;
    var lines = Math.max(1, Math.min(20, parseInt($('lines').value, 10) || 1));

    var html = '';
    for (var i = 0; i < lines; i++) {
      var main = draw(c.pick, c.from);
      var extra = c.bonus > 0 ? draw(c.bonus, c.bonusFrom) : [];
      html += '<div class="lotto-line">' +
        (lines > 1 ? '<span class="lb">Line ' + (i + 1) + '</span>' : '') +
        main.map(function(n){ return '<span class="ball">' + n + '</span>'; }).join('') +
        extra.map(function(n){ return '<span class="ball bonus">' + n + '</span>'; }).join('') +
        '</div>';
    }
    $('lines-out').innerHTML = html;
    $('lbl').textContent = c.name + (lines > 1 ? ' — ' + lines + ' lines' : '');

    var odds = combinations(c.from, c.pick);
    if (c.bonus > 0) odds *= combinations(c.bonusFrom, c.bonus);
    $('odds').textContent = 'Odds of matching everything: 1 in ' + odds.toLocaleString('en-US') + '.';
    $('out').hidden = false;
  }

  $('game').addEventListener('change', function(){
    $('custom').hidden = GAMES[parseInt(this.value, 10)][0] !== 'Custom…';
  });
  $('go').addEventListener('click', generate);
})();`,

  answerHeading: 'Do random numbers improve your odds?',
  answer: `<p><strong>No — but they do change what happens if you win.</strong> Every combination has identical odds, so no set of numbers is luckier than another. What differs is how many <em>other people</em> chose the same line. Birthdays confine picks to 1–31, and patterns like 1-2-3-4-5-6 are chosen by thousands of players each draw. Picking randomly across the full range makes a shared jackpot less likely, which raises your expected payout without changing your chance of winning at all.</p>`,

  steps: [
    'Choose your game, or select Custom to set your own format.',
    'Set how many lines you want.',
    'Press generate. The odds of matching everything are shown underneath.',
  ],

  sections: [
    {
      id: 'odds',
      h2: 'The odds, plainly',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Game</th><th>Format</th><th>Jackpot odds</th></tr></thead>
<tbody>
<tr><td>Powerball</td><td>5 from 69 + 1 from 26</td><td>1 in 292,201,338</td></tr>
<tr><td>Mega Millions</td><td>5 from 70 + 1 from 25</td><td>1 in 302,575,350</td></tr>
<tr><td>EuroMillions</td><td>5 from 50 + 2 from 12</td><td>1 in 139,838,160</td></tr>
<tr><td>UK Lotto</td><td>6 from 59</td><td>1 in 45,057,474</td></tr>
<tr><td>Lotto 6/49</td><td>6 from 49</td><td>1 in 13,983,816</td></tr>
</tbody></table></div>
<p>To put 1 in 292 million in perspective: you are considerably more likely to be struck by lightning this year, and if you bought one ticket a week you would expect to win roughly once every 5.6 million years.</p>`,
    },
    {
      id: 'sharing',
      h2: 'The one thing you can actually control',
      html: `<p>You cannot improve your chance of winning. You can improve what a win is worth, by avoiding combinations that lots of other people pick.</p>
<ul>
<li><strong>Avoid 1–31.</strong> Birthday-based picks cluster heavily in this range, so lines using only low numbers are shared far more often.</li>
<li><strong>Avoid obvious patterns.</strong> Straight lines, diagonals and neat sequences on the play slip are chosen by thousands of people every draw.</li>
<li><strong>Avoid last week's winning numbers.</strong> A surprising number of people play them.</li>
<li><strong>Avoid "unlucky" number avoidance.</strong> Because so many people skip 13, lines containing it are shared slightly less.</li>
</ul>
<p>There is a well-known illustration of the risk: in a 1980s Irish draw, a syndicate that bought a large share of all combinations still had to split the prize. Sharing is the failure mode you can actually influence.</p>`,
    },
    {
      id: 'sense',
      h2: 'A note on playing sensibly',
      html: `<p>Lotteries are a form of entertainment with a negative expected value — typically you get back around 50 cents in prizes for every dollar staked, across all players.</p>
<p>That is fine if the ticket buys you a few days of pleasant daydreaming and the cost is genuinely trivial to you. It is not fine as a financial plan, and the "systems" sold to improve your odds are all, without exception, mathematically worthless.</p>
<p>If gambling has stopped being fun, organisations like <a href="https://www.begambleaware.org" rel="noopener" target="_blank">GambleAware</a> and the National Council on Problem Gambling offer free, confidential help.</p>`,
    },
  ],

  faq: [
    { q: 'Are randomly generated numbers better than my own?', a: '<p>Not for your chance of winning, which is identical either way. They are better for your expected payout, because random picks across the full range are less likely to be duplicated by other players.</p>' },
    { q: 'Are these numbers truly random?', a: '<p>They come from your browser’s cryptographically secure random source, with rejection sampling to avoid modulo bias. Each combination is equally likely.</p>' },
    { q: 'Can I use these for an official ticket?', a: '<p>Yes — write them on your slip or type them into your operator’s app. There is nothing special about numbers generated here versus the operator’s own lucky dip.</p>' },
    { q: 'Do some numbers come up more often?', a: '<p>Over enough draws small differences appear, exactly as randomness predicts. They have no predictive value: the machine has no memory, and past frequency tells you nothing about the next draw.</p>' },
    { q: 'Why does the same number appear in several lines?', a: '<p>Each line is drawn independently, so overlaps between lines are expected. Within a single line, numbers are never repeated.</p>' },
  ],

  related: ['random-number-generator', 'coin-flip', 'dice-roller', 'random-name-picker'],
};
