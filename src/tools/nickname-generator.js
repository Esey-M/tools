export default {
  slug: 'nickname-generator',
  category: 'fun',
  title: 'Nickname Generator – Usernames and Gamertags',
  h1: 'Nickname Generator',
  cardText: 'Generate nicknames, gamertags and usernames from your name or a theme.',
  description:
    'Free nickname generator. Make usernames, gamertags and nicknames from your own name or a theme, in several styles, with availability tips.',
  keywords: ['nickname generator', 'username generator', 'gamertag generator', 'cool nicknames', 'random username'],
  updated: '2026-09-04',
  lede: 'Enter a name or word to build from, pick a style, and generate. Nothing is checked against any service — these are ideas, not reservations.',

  form: `
<div class="row">
  <div class="field">
    <label for="seed">Base word or name <span class="hint">(optional)</span></label>
    <input type="text" id="seed" placeholder="Alex" maxlength="24" autocomplete="off">
  </div>
  <div class="field">
    <label for="style">Style</label>
    <select id="style">
      <option value="gamer" selected>Gamertag</option>
      <option value="cute">Cute</option>
      <option value="cool">Cool and short</option>
      <option value="professional">Professional handle</option>
      <option value="fantasy">Fantasy</option>
    </select>
  </div>
  <div class="field">
    <label for="count">How many</label>
    <input type="number" id="count" inputmode="numeric" min="4" max="40" step="4" value="12">
  </div>
</div>

<div class="pw-opts" style="margin-bottom:16px">
  <label><input type="checkbox" id="numbers"> Allow numbers</label>
  <label><input type="checkbox" id="underscore"> Allow underscores</label>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Generate</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy all</button>
</div>

<div id="out" class="nick-list"></div>`,

  css: `
.pw-opts{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.pw-opts label{display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);cursor:pointer}
.pw-opts input{width:auto}
.nick-list{margin-top:22px;display:grid;gap:9px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.nick{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px;
  font-weight:600;font-size:1rem;display:flex;align-items:center;justify-content:space-between;gap:8px;
  overflow-wrap:anywhere}
.nick button{border:none;background:transparent;color:var(--ink-3);cursor:pointer;font-size:.78rem;flex:none;
  padding:3px 7px;border-radius:5px}
.nick button:hover{background:var(--accent-soft);color:var(--accent-ink)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var WORDS = {
    gamer: {
      pre: ['Shadow','Iron','Rapid','Silent','Frost','Blaze','Night','Rogue','Steel','Vortex','Grim','Nova','Cyber','Storm','Ghost','Turbo','Void','Crimson','Neon','Apex'],
      post: ['Wolf','Blade','Hunter','Strike','Fury','Reaper','Hawk','Viper','Fang','Sniper','Knight','Raven','Titan','Drift','Shot','Pulse','Rider','Claw','Bolt','Edge']
    },
    cute: {
      pre: ['Bubbly','Sunny','Fuzzy','Cosy','Peachy','Minty','Honey','Cloudy','Berry','Buttery','Marsh','Cocoa','Pebble','Waffle','Ginger','Jelly','Snugg','Pippin','Muffin','Nutmeg'],
      post: ['Bun','Paws','Bean','Puff','Toes','Cheeks','Bear','Muffin','Sprout','Bloom','Bug','Duck','Otter','Peach','Nook','Pip','Bounce','Whisk','Clover','Biscuit']
    },
    cool: {
      pre: ['Ash','Kai','Rex','Zed','Jax','Nyx','Orin','Vale','Wren','Cade','Rune','Sol','Onyx','Bane','Fen','Halo','Quinn','Rhys','Slate','Tor'],
      post: ['ex','on','ix','ar','en','os','yn','ur','el','an','or','is','ax','um','ov','ek','al','ir','us','yr']
    },
    professional: {
      pre: ['the','real','just','hey','ask','meet','with','by'],
      post: ['writes','works','builds','makes','codes','designs','studio','digital','online','hq','co','labs','media','words','ideas','notes','desk','room']
    },
    fantasy: {
      pre: ['Aer','Bran','Cael','Dorn','Eryn','Fael','Gwyn','Hald','Ith','Kael','Lyr','Mor','Nym','Orl','Pyth','Quor','Ryn','Syl','Thal','Ver'],
      post: ['wyn','dor','iel','ath','mir','ion','wen','ric','las','oth','var','ael','ith','oria','ander','eth','wick','moor','fell','holt']
    }
  };

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }
  function pick(arr){ return arr[randInt(arr.length)]; }
  function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  function generate(){
    var style = $('style').value;
    var set = WORDS[style];
    var seed = $('seed').value.trim().replace(/[^A-Za-z]/g, '');
    var n = Math.max(4, Math.min(40, parseInt($('count').value, 10) || 12));
    var useNumbers = $('numbers').checked;
    var useUnderscore = $('underscore').checked;

    var out = {};
    var guard = 0;
    while (Object.keys(out).length < n && guard++ < n * 30) {
      var name;
      if (style === 'cool') {
        // Short invented handles: a stem plus a terminal syllable.
        var stem = seed ? cap(seed.slice(0, 4)) : pick(set.pre);
        name = stem + pick(set.post);
      } else if (style === 'professional') {
        var base = seed ? seed.toLowerCase() : pick(['sam','alex','jo','riley','max']);
        name = randInt(2) ? pick(set.pre) + base : base + pick(set.post);
      } else if (seed && randInt(2)) {
        name = randInt(2) ? pick(set.pre) + cap(seed) : cap(seed) + pick(set.post);
      } else {
        name = pick(set.pre) + pick(set.post);
      }

      if (useUnderscore && randInt(3) === 0) {
        name = name.replace(/([a-z])([A-Z])/, '$1_$2');
        if (name.indexOf('_') === -1) name = name + '_';
      }
      if (useNumbers && randInt(2)) name = name + (randInt(90) + 10);

      out[name] = 1;
    }

    var list = Object.keys(out);
    $('out').innerHTML = list.map(function(nm){
      return '<div class="nick"><span>' + nm.replace(/[<>&]/g, '') + '</span>' +
        '<button type="button" data-n="' + nm.replace(/["<>&]/g, '') + '">copy</button></div>';
    }).join('');
    $('out').dataset.all = list.join('\\n');
  }

  $('out').addEventListener('click', function(e){
    var b = e.target.closest('button[data-n]'); if (!b) return;
    navigator.clipboard.writeText(b.getAttribute('data-n')).then(function(){
      b.textContent = 'copied';
      setTimeout(function(){ b.textContent = 'copy'; }, 1200);
    });
  });
  $('copy').addEventListener('click', function(){
    var all = $('out').dataset.all || '';
    if (!all) return;
    navigator.clipboard.writeText(all).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy all'; }, 1400);
    });
  });
  $('go').addEventListener('click', generate);
  ['style','numbers','underscore'].forEach(function(id){ $(id).addEventListener('change', generate); });
  $('seed').addEventListener('keydown', function(e){ if (e.key === 'Enter') generate(); });

  generate();
})();`,

  answerHeading: 'What makes a username last',
  answer: `<p><strong>The names people keep for years are short, sayable, and free of the year they made the account.</strong> Numbers appended to force availability — <code>xXShadowWolf2011Xx</code> — date badly and are hard to give someone verbally. A better approach is to combine two ordinary words that do not usually go together, which stays memorable and is far more likely to be free across platforms. If you want one handle everywhere, check availability on the platform that matters most first and work outwards.</p>`,

  steps: [
    'Optionally enter your name or a word to build around.',
    'Pick a style — gamertag, cute, short, professional or fantasy.',
    'Generate, then copy any you like.',
  ],

  sections: [
    {
      id: 'choosing',
      h2: 'Choosing one you will not regret',
      html: `<ul>
<li><strong>Say it out loud.</strong> You will have to spell it to people. If that takes more than a few seconds, pick another.</li>
<li><strong>Avoid the year.</strong> A handle with 2011 in it announces its own age forever.</li>
<li><strong>Keep it under about 15 characters.</strong> Longer names get truncated in feeds and leaderboards.</li>
<li><strong>Check it across platforms before committing.</strong> A consistent handle is genuinely valuable if you ever build an audience.</li>
<li><strong>Do not use your real full name for gaming.</strong> It links your account to your identity in places you may not want linked.</li>
<li><strong>Read it as one word.</strong> Joined words occasionally form something unintended — a well-known hazard of the format.</li>
</ul>`,
    },
    {
      id: 'availability',
      h2: 'When everything is taken',
      html: `<p>Popular two-word combinations went years ago on the large platforms. A few approaches that still work:</p>
<ul>
<li><strong>Use an uncommon word.</strong> Obscure nouns — <em>quarry</em>, <em>lantern</em>, <em>thistle</em> — are far less contested than <em>shadow</em> or <em>dragon</em>.</li>
<li><strong>Add a role, not a number.</strong> <code>lanternmade</code> reads better than <code>lantern4471</code>.</li>
<li><strong>Try a different word class.</strong> Verb plus noun beats adjective plus noun for availability.</li>
<li><strong>Accept a prefix.</strong> <code>thereal</code>, <code>hey</code> or <code>ask</code> in front of a taken name is a common and unobjectionable fix.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Does this check if the name is available?', a: '<p>No. Checking availability would mean querying each platform, which this tool does not do. Treat the results as ideas and check them yourself where it matters.</p>' },
    { q: 'Can I use my own name as the base?', a: '<p>Yes. Enter it and the generator will combine it with style words rather than inventing entirely from scratch.</p>' },
    { q: 'Are the names unique to me?', a: '<p>No. They are combinations from word lists, so someone else could generate the same one. Nothing is reserved by generating it.</p>' },
    { q: 'What makes a good gamertag?', a: '<p>Short, pronounceable, and no birth year. Two contrasting words usually beat a single word with numbers appended.</p>' },
    { q: 'Is anything I type stored?', a: '<p>No. Generation happens in your browser and nothing is transmitted or saved.</p>' },
  ],

  related: ['baby-name-generator', 'password-generator', 'random-name-picker', 'love-calculator'],
};
