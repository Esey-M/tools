export default {
  slug: 'love-calculator',
  category: 'fun',
  title: 'Love Calculator – Name Compatibility, For Fun',
  h1: 'Love Calculator',
  cardText: 'A compatibility score from two names. Entertainment only, obviously.',
  description:
    'Free love calculator. Enter two names for a compatibility percentage using the classic FLAMES method. A bit of fun — not advice, and not a prediction.',
  keywords: ['love calculator', 'love test', 'name compatibility', 'flames game', 'compatibility calculator'],
  updated: '2026-09-04',
  lede: 'The classic playground game, done properly. Same names always give the same answer — and it means absolutely nothing.',

  form: `
<div class="row">
  <div class="field">
    <label for="a">First name</label>
    <input type="text" id="a" placeholder="Alex" maxlength="40" autocomplete="off">
  </div>
  <div class="field">
    <label for="b">Second name</label>
    <input type="text" id="b" placeholder="Sam" maxlength="40" autocomplete="off">
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Calculate</button>
</div>

<div class="result" id="out" hidden aria-live="polite" style="text-align:center">
  <div class="result-label" id="pair"></div>
  <div class="love-score" id="score">—</div>
  <div class="love-bar"><i id="bar"></i></div>
  <div class="result-note" id="note"></div>
  <p class="result-note" id="flames" style="margin-top:10px"></p>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.love-score{font-size:clamp(2.8rem,2rem+4vw,4.2rem);font-weight:800;letter-spacing:-.04em;
  line-height:1.05;color:var(--accent-ink);margin:4px 0 12px}
.love-bar{height:12px;border-radius:999px;background:var(--bg-raised);border:1px solid var(--line);overflow:hidden}
.love-bar i{display:block;height:100%;width:0;border-radius:999px;
  background:linear-gradient(90deg,#e8687f,#e8a33d,#4caf7d);transition:width .7s cubic-bezier(.3,.9,.4,1)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var FLAMES = {
    F: ['Friends', 'the sort of pair who stay in each other\\u2019s lives for decades'],
    L: ['Love', 'the classic outcome, according to a game invented by children'],
    A: ['Affection', 'warmth and easy company'],
    M: ['Marriage', 'the playground\\u2019s most dramatic verdict'],
    E: ['Enemies', 'the game is not always kind'],
    S: ['Siblings', 'bickering with genuine loyalty underneath']
  };

  function clean(s){ return s.toLowerCase().replace(/[^a-z]/g, ''); }

  /** The classic FLAMES elimination: strike matching letters, count what remains. */
  function flames(a, b){
    var x = clean(a).split(''), y = clean(b).split('');
    for (var i = 0; i < x.length; i++) {
      var j = y.indexOf(x[i]);
      if (j > -1) { y.splice(j, 1); x.splice(i, 1); i--; }
    }
    var count = x.length + y.length;
    if (count === 0) return 'L';
    var letters = ['F','L','A','M','E','S'];
    var idx = 0;
    while (letters.length > 1) {
      idx = (idx + count - 1) % letters.length;
      letters.splice(idx, 1);
      if (idx >= letters.length) idx = 0;
    }
    return letters[0];
  }

  /** A stable hash so the same pair always scores the same, in either order. */
  function score(a, b){
    var pair = [clean(a), clean(b)].sort().join('|');
    var h = 2166136261;
    for (var i = 0; i < pair.length; i++) {
      h ^= pair.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h % 61) + 40;   // 40-100, because nobody wants a 3%
  }

  function verdictFor(n){
    if (n >= 95) return 'Statistically improbable. Someone should write a film about this.';
    if (n >= 85) return 'The algorithm is quietly delighted.';
    if (n >= 70) return 'Promising, says a program that knows nothing about either of you.';
    if (n >= 55) return 'Perfectly respectable. Most things worth having take work.';
    return 'The letters are unconvinced. The letters are also just letters.';
  }

  $('go').addEventListener('click', function(){
    var a = $('a').value.trim(), b = $('b').value.trim();
    if (!clean(a) || !clean(b)) {
      $('err').hidden = false;
      $('err').textContent = 'Enter two names with at least one letter each.';
      $('out').hidden = true;
      return;
    }
    $('err').hidden = true;

    var n = score(a, b);
    var f = flames(a, b);

    $('pair').textContent = a + ' & ' + b;
    $('score').textContent = n + '%';
    $('note').textContent = verdictFor(n);
    $('flames').textContent = 'The FLAMES letters land on ' + FLAMES[f][0].toLowerCase() + ' — ' + FLAMES[f][1] + '.';
    $('out').hidden = false;
    setTimeout(function(){ $('bar').style.width = n + '%'; }, 40);
  });

  ['a','b'].forEach(function(id){
    $(id).addEventListener('keydown', function(e){ if (e.key === 'Enter') $('go').click(); });
  });
})();`,

  answerHeading: 'What this actually calculates',
  answer: `<p><strong>Nothing meaningful — and it is worth being clear about that.</strong> The percentage is a hash of the two names, so the same pair always produces the same number in either order, which makes it feel like a real result rather than a random one. It reflects the letters you typed and nothing else. There is no research linking name spelling to relationship outcomes, and none of the tools that claim otherwise are measuring anything. It is a playground game, and it is here as a playground game.</p>`,

  steps: [
    'Type two names.',
    'Press Calculate.',
    'Enjoy it, then disregard it entirely.',
  ],

  sections: [
    {
      id: 'flames',
      h2: 'How the FLAMES game works',
      html: `<p>FLAMES is the version most people played at school, and it has an actual procedure — which is why the same names always give the same answer.</p>
<ol>
<li>Write both names out and cross off every letter that appears in both.</li>
<li>Count the letters left over across both names.</li>
<li>Write out F-L-A-M-E-S: Friends, Love, Affection, Marriage, Enemies, Siblings.</li>
<li>Count round the letters repeatedly, striking out the one you land on, until only one remains.</li>
</ol>
<p>That surviving letter is the verdict. This tool runs the same elimination faithfully, which is why the FLAMES result is shown alongside the percentage.</p>`,
    },
    {
      id: 'real',
      h2: 'What actually predicts relationship success',
      html: `<p>Since you are here: the research on this is genuinely interesting, and none of it involves names.</p>
<p>John Gottman's longitudinal work identified four communication patterns that predict separation with striking accuracy — criticism, contempt, defensiveness and stonewalling. Contempt is the strongest single signal.</p>
<p>On the positive side, the findings are unromantic but robust: responding to each other's small everyday attempts at connection, maintaining a high ratio of positive to negative interactions during conflict, and being able to accept influence from your partner.</p>
<p>None of that fits in a percentage, which is presumably why the letter-counting version survived.</p>`,
    },
  ],

  faq: [
    { q: 'Is the love calculator accurate?', a: '<p>No, and it does not claim to be. It hashes the letters of two names into a number. It has no information about either person and no predictive value whatsoever.</p>' },
    { q: 'Why do I get the same result every time?', a: '<p>Because the score is derived deterministically from the names rather than randomly. Sorting the two names first means the order you type them does not matter either.</p>' },
    { q: 'What does FLAMES stand for?', a: '<p>Friends, Love, Affection, Marriage, Enemies, Siblings — the six possible outcomes in the letter-elimination game.</p>' },
    { q: 'Can I use nicknames or full names?', a: '<p>You can use either, and you will get different answers, which is a fairly good illustration of how much the result means.</p>' },
    { q: 'Are the names stored anywhere?', a: '<p>No. Everything happens in your browser and nothing is sent to a server.</p>' },
  ],

  related: ['zodiac-sign-finder', 'yes-no-decision-maker', 'coin-flip', 'nickname-generator'],
};
