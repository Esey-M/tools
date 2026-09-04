export default {
  slug: 'random-name-picker',
  category: 'random',
  title: 'Random Name Picker – Pick a Winner From a List',
  h1: 'Random Name Picker',
  cardText: 'Paste a list and draw a fair winner, or several, with no repeats.',
  description:
    'Free random name picker for giveaways, classrooms and team draws. Paste a list of names and pick one winner or several, with duplicate handling and no signup.',
  keywords: ['random name picker', 'random winner generator', 'giveaway picker', 'pick a name', 'raffle picker'],
  updated: '2026-09-04',
  lede: 'Paste your list — one name per line — and draw. Uses your browser’s secure random source, so every name has an equal chance.',

  form: `
<div class="field">
  <label for="names">Names, one per line</label>
  <textarea id="names" rows="8" placeholder="Alex&#10;Blake&#10;Casey&#10;Devon&#10;Emerson" style="min-height:165px"></textarea>
  <span class="hint" id="count">0 names</span>
</div>

<div class="row">
  <div class="field">
    <label for="winners">How many to pick</label>
    <input type="number" id="winners" inputmode="numeric" min="1" max="100" step="1" value="1">
  </div>
  <div class="field">
    <span class="field-label">Options</span>
    <div class="pw-opts">
      <label><input type="checkbox" id="dedupe" checked> Ignore duplicate names</label>
      <label><input type="checkbox" id="remove"> Remove winners from the list</label>
    </div>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="draw">Pick a winner</button>
  <button type="button" class="btn btn-ghost" id="shuffle">Shuffle whole list</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear</button>
</div>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label" id="lbl">Winner</div>
  <div class="result-value" id="winner">—</div>
  <div class="win-list" id="list"></div>
  <div class="result-note" id="note"></div>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.pw-opts{display:grid;gap:8px}
.pw-opts label{display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);cursor:pointer}
.pw-opts input{width:auto}
.win-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.win-list span{background:var(--bg-raised);border:1px solid var(--line);border-radius:999px;
  padding:6px 14px;font-weight:580;font-size:.95rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  function getNames(){
    var raw = $('names').value.split('\\n')
      .map(function(s){ return s.trim(); })
      .filter(function(s){ return s.length; });
    if ($('dedupe').checked) {
      var seen = {}, out = [];
      raw.forEach(function(n){
        var key = n.toLowerCase();
        if (!seen[key]) { seen[key] = 1; out.push(n); }
      });
      return out;
    }
    return raw;
  }

  function updateCount(){
    var n = getNames().length;
    $('count').textContent = n + (n === 1 ? ' name' : ' names') +
      ($('dedupe').checked ? ' after removing duplicates' : '');
  }

  function draw(){
    var names = getNames();
    var want = Math.max(1, Math.min(100, parseInt($('winners').value, 10) || 1));
    var err = $('err');

    if (names.length === 0) {
      err.hidden = false; err.textContent = 'Add some names first — one per line.';
      $('out').hidden = true; return;
    }
    if (want > names.length) {
      err.hidden = false;
      err.textContent = 'You asked for ' + want + ' winners but there are only ' + names.length + ' names.';
      $('out').hidden = true; return;
    }
    err.hidden = true;

    // Partial Fisher-Yates: unbiased selection without replacement.
    var pool = names.slice();
    var picked = [];
    for (var i = 0; i < want; i++) {
      var j = i + randInt(pool.length - i);
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      picked.push(pool[i]);
    }

    if (picked.length === 1) {
      $('winner').textContent = picked[0];
      $('winner').hidden = false; $('list').hidden = true;
      $('lbl').textContent = 'Winner';
    } else {
      $('winner').hidden = true; $('list').hidden = false;
      $('list').innerHTML = picked.map(function(p){
        return '<span>' + p.replace(/[<>&]/g, '') + '</span>';
      }).join('');
      $('lbl').textContent = picked.length + ' winners';
    }
    $('note').textContent = 'Drawn from ' + names.length + ' names. Each had a 1 in ' + names.length + ' chance.';
    $('out').hidden = false;

    if ($('remove').checked) {
      var remaining = names.filter(function(n){ return picked.indexOf(n) === -1; });
      $('names').value = remaining.join('\\n');
      updateCount();
    }
  }

  $('draw').addEventListener('click', draw);
  $('shuffle').addEventListener('click', function(){
    var names = getNames();
    if (names.length < 2) return;
    for (var i = names.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var t = names[i]; names[i] = names[j]; names[j] = t;
    }
    $('names').value = names.join('\\n');
    $('winner').hidden = true; $('list').hidden = false;
    $('list').innerHTML = names.map(function(p, i){
      return '<span>' + (i + 1) + '. ' + p.replace(/[<>&]/g, '') + '</span>';
    }).join('');
    $('lbl').textContent = 'Shuffled order';
    $('note').textContent = 'Every ordering was equally likely.';
    $('out').hidden = false;
    $('err').hidden = true;
  });
  $('clear').addEventListener('click', function(){
    $('names').value = ''; updateCount(); $('out').hidden = true; $('err').hidden = true;
  });
  $('names').addEventListener('input', updateCount);
  $('dedupe').addEventListener('change', updateCount);
  updateCount();
})();`,

  answerHeading: 'How the draw stays fair',
  answer: `<p><strong>Every name has exactly the same chance, and picking several never favours the top of your list.</strong> The tool uses a partial Fisher–Yates shuffle driven by <code>crypto.getRandomValues</code>, which is the standard way to select without replacement without introducing bias. A common naive approach — sorting the list by a random number, or repeatedly picking an index and splicing it out — subtly favours certain positions. This does not. Nothing is uploaded, so the draw happens entirely on your device.</p>`,

  steps: [
    'Paste your names into the box, one per line.',
    'Set how many winners you need.',
    'Tick <strong>remove winners</strong> if you are drawing several prizes in sequence.',
    'Press <strong>Pick a winner</strong>.',
  ],

  sections: [
    {
      id: 'giveaway',
      h2: 'Running a giveaway people will trust',
      html: `<p>Because the draw happens on your device, nobody else can verify it after the fact. If the prize matters, make the process visible instead.</p>
<ul>
<li><strong>Publish the entry list first</strong>, or its length, before drawing.</li>
<li><strong>Record the screen</strong> while you paste the list and press the button. A continuous recording is far more convincing than a screenshot of the result.</li>
<li><strong>Draw live</strong> if you can — a stream removes the question entirely.</li>
<li><strong>State the rules in advance</strong>: how duplicates are handled, whether one person can win twice, and what happens if a winner does not respond.</li>
</ul>
<p>For anything with legal or regulatory weight — a prize promotion with significant value, or anything classed as a lottery — use a service that provides an audit trail. This tool is designed for informal draws.</p>`,
    },
    {
      id: 'classroom',
      h2: 'Using it in a classroom',
      html: `<p>Cold-calling from a random picker is a well-established technique for spreading participation, but two adjustments make it work much better in practice.</p>
<p>First, turn <strong>remove winners</strong> on. Without it, the same few students get picked repeatedly by chance, which feels arbitrary and lets the rest disengage. Removing each name as it comes up guarantees everyone is asked once before anyone is asked twice.</p>
<p>Second, give thinking time before revealing the name. Asking the question, pausing, and only then drawing means the whole class prepares an answer rather than only the person selected.</p>`,
    },
  ],

  faq: [
    { q: 'Is the picker actually random?', a: '<p>Yes. It draws from your browser’s cryptographically secure random source and uses an unbiased shuffle algorithm, so every name and every ordering is equally likely.</p>' },
    { q: 'Can the same name win twice?', a: '<p>Not within a single draw — picking three winners always gives three different entries. Across separate draws it can, unless you tick "remove winners from the list".</p>' },
    { q: 'How do I handle duplicate entries?', a: '<p>Leave "ignore duplicate names" ticked to give each person one chance regardless of how many times they appear. Untick it if repeated entries are meant to improve someone’s odds, as with earned raffle tickets.</p>' },
    { q: 'Is there a limit on list size?', a: '<p>No practical limit. Lists of many thousands of names work fine, since everything runs locally.</p>' },
    { q: 'Are the names uploaded anywhere?', a: '<p>No. The list stays in your browser and is discarded when you close the page.</p>' },
  ],

  related: ['random-number-generator', 'coin-flip', 'dice-roller', 'random-team-generator'],
};
