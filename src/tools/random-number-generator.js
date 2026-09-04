export default {
  slug: 'random-number-generator',
  category: 'random',
  title: 'Random Number Generator – Pick Numbers in Any Range',
  h1: 'Random Number Generator',
  cardText: 'Generate one number or many, in any range, with or without duplicates.',
  description:
    'Free random number generator. Pick one number or many from any range, with optional no-repeats and sorting. Uses secure browser randomness.',
  keywords: ['random number generator', 'pick a random number', 'number picker', 'rng', 'random number 1 to 100'],
  updated: '2026-09-04',
  lede: 'Set a range, choose how many numbers you need, and generate. Uses the browser’s cryptographic random source, not a predictable seed.',

  form: `
<div class="row">
  <div class="field">
    <label for="min">From</label>
    <input type="number" id="min" step="1" value="1">
  </div>
  <div class="field">
    <label for="max">To</label>
    <input type="number" id="max" step="1" value="100">
  </div>
  <div class="field">
    <label for="count">How many</label>
    <input type="number" id="count" min="1" max="1000" step="1" value="1">
  </div>
</div>
<div class="pw-opts" style="margin-bottom:16px">
  <label><input type="checkbox" id="unique"> No repeats</label>
  <label><input type="checkbox" id="sorted"> Sort results</label>
</div>
<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Generate</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy</button>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Your number</div>
  <div class="result-value" id="single">—</div>
  <div class="rng-list" id="list" hidden></div>
  <div class="result-note" id="note"></div>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.pw-opts{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
.pw-opts label{display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);cursor:pointer}
.pw-opts input{width:auto}
.rng-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:6px}
.rng-list span{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius-sm);
  padding:6px 11px;font-variant-numeric:tabular-nums;font-weight:580;font-size:1rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // Rejection sampling gives a uniform distribution; a plain modulo does not.
  function randInt(min, max){
    var range = max - min + 1;
    if (range <= 0) return min;
    var limit = Math.floor(4294967296 / range) * range;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return min + (v % range);
  }

  function generate(){
    var min = parseInt($('min').value, 10);
    var max = parseInt($('max').value, 10);
    var n = parseInt($('count').value, 10);
    var unique = $('unique').checked;
    var err = $('err');

    if (!isFinite(min) || !isFinite(max) || !isFinite(n)) return;
    if (min > max) { var t = min; min = max; max = t; }
    n = Math.max(1, Math.min(1000, n));

    var range = max - min + 1;
    if (unique && n > range) {
      err.hidden = false;
      err.textContent = 'You asked for ' + n + ' numbers with no repeats, but the range only holds ' + range + '. Widen the range or allow repeats.';
      $('out').hidden = true;
      return;
    }
    err.hidden = true;

    var results = [];
    if (unique) {
      // Partial Fisher-Yates over a sparse map: works even for huge ranges.
      var used = {};
      for (var i = 0; i < n; i++) {
        var j = randInt(0, range - 1 - i);
        var pick = (used[j] === undefined ? j : used[j]);
        var last = range - 1 - i;
        used[j] = (used[last] === undefined ? last : used[last]);
        results.push(min + pick);
      }
    } else {
      for (var k = 0; k < n; k++) results.push(randInt(min, max));
    }

    if ($('sorted').checked) results.sort(function(a, b){ return a - b; });

    if (results.length === 1) {
      $('single').textContent = results[0].toLocaleString('en-US');
      $('single').hidden = false; $('list').hidden = true;
      $('lbl').textContent = 'Your number';
      $('note').textContent = 'Between ' + min.toLocaleString('en-US') + ' and ' + max.toLocaleString('en-US') + '.';
    } else {
      $('single').hidden = true; $('list').hidden = false;
      $('list').innerHTML = results.map(function(r){ return '<span>' + r.toLocaleString('en-US') + '</span>'; }).join('');
      $('lbl').textContent = results.length + ' numbers';
      $('note').textContent = 'Between ' + min.toLocaleString('en-US') + ' and ' + max.toLocaleString('en-US') +
        (unique ? ', no repeats.' : '.');
    }
    $('out').hidden = false;
    $('out').dataset.values = results.join(', ');
  }

  $('go').addEventListener('click', generate);
  $('copy').addEventListener('click', function(){
    var v = $('out').dataset.values || '';
    if (v) navigator.clipboard.writeText(v).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy'; }, 1300);
    });
  });
  ['min','max','count','unique','sorted'].forEach(function(id){
    $(id).addEventListener('keydown', function(e){ if (e.key === 'Enter') generate(); });
  });
  generate();
})();`,

  answerHeading: 'Where the randomness comes from',
  answer: `<p><strong>This generator uses <code>crypto.getRandomValues</code>, your browser's cryptographically secure random source</strong> — the same one used to generate encryption keys. It draws entropy from the operating system rather than from a seed, so the sequence is not predictable and not reproducible. It also uses rejection sampling rather than a simple modulo, which matters: taking <code>random % 100</code> makes low numbers very slightly more likely, and this tool avoids that bias entirely.</p>`,

  steps: [
    'Set the <strong>from</strong> and <strong>to</strong> values for your range. Both ends are included.',
    'Choose how many numbers you need.',
    'Tick <strong>no repeats</strong> for things like raffle draws where each number can only come up once.',
    'Press Generate, and Copy if you need the numbers elsewhere.',
  ],

  sections: [
    {
      id: 'bias',
      h2: 'Why "random % 100" is subtly wrong',
      html: `<p>The obvious way to get a number from 1 to 100 is to take a large random integer and use the remainder. It is very slightly biased, and understanding why is worth a minute.</p>
<p>A 32-bit random integer has 4,294,967,296 possible values. Divide that by 100 and you get 42,949,672.96 — not a whole number. The remainders do not distribute evenly: some values occur 42,949,673 times and others 42,949,672 times. Low numbers come up marginally more often.</p>
<p>The bias here is about one part in 43 million, far too small to notice in a raffle. But the fix is easy: discard any draw that falls in the uneven tail and try again. That is what this tool does, and it makes the distribution exactly uniform.</p>`,
    },
    {
      id: 'uses',
      h2: 'Common ranges',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Use</th><th>Range</th><th>Settings</th></tr></thead>
<tbody>
<tr><td>Coin flip</td><td>1 to 2</td><td>One number</td></tr>
<tr><td>Dice roll</td><td>1 to 6</td><td>One per die</td></tr>
<tr><td>Percentage</td><td>1 to 100</td><td>One number</td></tr>
<tr><td>Raffle draw</td><td>1 to number of tickets</td><td>No repeats</td></tr>
<tr><td>Lottery, 6 from 49</td><td>1 to 49</td><td>Six numbers, no repeats, sorted</td></tr>
<tr><td>PIN digits</td><td>0 to 9</td><td>Four numbers, repeats allowed</td></tr>
</tbody></table></div>`,
    },
  ],

  faq: [
    { q: 'Are the numbers truly random?', a: '<p>They come from your operating system’s cryptographically secure random source, seeded from genuine physical entropy such as hardware timing noise. That is not "true" randomness in a quantum sense, but it is unpredictable in every practical way and is the standard used for encryption keys.</p>' },
    { q: 'Can two people get the same numbers?', a: '<p>Only by coincidence at the odds you would expect. Nothing is seeded from the time or shared between visitors, and results are never sent anywhere.</p>' },
    { q: 'Is the range inclusive of both ends?', a: '<p>Yes. A range of 1 to 100 can produce both 1 and 100.</p>' },
    { q: 'Can I use this for a legal prize draw?', a: '<p>For informal giveaways, yes. For regulated lotteries or gambling, no — those require certified, auditable random number generators with documented procedures.</p>' },
    { q: 'Can I generate negative numbers?', a: '<p>Yes. Enter a negative value in the "from" field, such as −50 to 50. If you enter the range backwards the tool sorts it out for you.</p>' },
  ],

  related: ['coin-flip', 'dice-roller', 'random-name-picker', 'password-generator'],
};
