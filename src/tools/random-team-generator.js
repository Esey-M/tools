export default {
  slug: 'random-team-generator',
  category: 'random',
  title: 'Random Team Generator – Split a Group Into Fair Teams',
  h1: 'Random Team Generator',
  cardText: 'Split any list of names into balanced random teams or groups.',
  description:
    'Free random team generator. Paste a list of names and split them into a set number of teams, or into groups of a fixed size, with even distribution.',
  keywords: ['random team generator', 'team picker', 'group generator', 'split into teams', 'random groups'],
  updated: '2026-09-04',
  lede: 'Paste your names, choose how many teams, and get an even random split. Useful for PE lessons, group projects and five-a-side.',

  form: `
<div class="field">
  <label for="names">Names, one per line</label>
  <textarea id="names" rows="8" style="min-height:170px">Alex
Blake
Casey
Devon
Emerson
Frankie
Harper
Jordan
Kai
Logan
Morgan
Riley</textarea>
  <span class="hint" id="count"></span>
</div>

<div class="row">
  <div class="field">
    <span class="field-label" id="mode-label">Split by</span>
    <div class="seg" role="group" aria-labelledby="mode-label" id="modes">
      <button type="button" data-mode="teams" aria-pressed="true">Number of teams</button>
      <button type="button" data-mode="size">Team size</button>
    </div>
  </div>
  <div class="field">
    <label for="n" id="nlabel">How many teams</label>
    <input type="number" id="n" inputmode="numeric" min="2" max="50" step="1" value="3">
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Generate teams</button>
  <button type="button" class="btn btn-ghost" id="reshuffle" hidden>Reshuffle</button>
</div>

<div id="teams" class="team-grid"></div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.team-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));margin-top:20px}
.team-card{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px}
.team-card h3{font-size:.82rem;text-transform:uppercase;letter-spacing:.07em;color:var(--accent);
  font-weight:660;margin-bottom:9px}
.team-card ol{list-style:none;padding:0;display:flex;flex-direction:column;gap:5px}
.team-card li{font-size:.94rem;padding-bottom:5px;border-bottom:1px solid var(--line)}
.team-card li:last-child{border-bottom:none;padding-bottom:0}
.team-card .n{color:var(--ink-3);font-size:.8rem;margin-right:7px;font-variant-numeric:tabular-nums}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var mode = 'teams';

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  function names(){
    return $('names').value.split('\\n').map(function(s){ return s.trim(); }).filter(Boolean);
  }

  function updateCount(){
    var n = names().length;
    $('count').textContent = n + (n === 1 ? ' name' : ' names');
  }

  function generate(){
    var list = names();
    if (list.length < 2) {
      $('err').hidden = false;
      $('err').textContent = 'Add at least two names.';
      $('teams').innerHTML = ''; $('reshuffle').hidden = true;
      return;
    }

    var v = Math.max(1, parseInt($('n').value, 10) || 2);
    var teamCount = mode === 'teams' ? Math.min(v, list.length) : Math.ceil(list.length / v);

    if (teamCount < 1) teamCount = 1;
    $('err').hidden = true;

    // Fisher-Yates, then deal round-robin so team sizes differ by at most one.
    var pool = list.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }

    var teams = [];
    for (var k = 0; k < teamCount; k++) teams.push([]);
    pool.forEach(function(name, idx){ teams[idx % teamCount].push(name); });

    $('teams').innerHTML = teams.map(function(team, idx){
      return '<div class="team-card"><h3>Team ' + (idx + 1) + ' · ' + team.length +
        (team.length === 1 ? ' player' : ' players') + '</h3><ol>' +
        team.map(function(n, i){
          return '<li><span class="n">' + (i + 1) + '</span>' + n.replace(/[<>&]/g, '') + '</li>';
        }).join('') + '</ol></div>';
    }).join('');
    $('reshuffle').hidden = false;
  }

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-mode]'); if (!b) return;
    mode = b.getAttribute('data-mode');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('nlabel').textContent = mode === 'teams' ? 'How many teams' : 'People per team';
    $('n').value = mode === 'teams' ? 3 : 4;
  });
  $('go').addEventListener('click', generate);
  $('reshuffle').addEventListener('click', generate);
  $('names').addEventListener('input', updateCount);
  updateCount();
})();`,

  answerHeading: 'How the split stays even',
  answer: `<p><strong>The names are shuffled once, then dealt round-robin — like dealing cards.</strong> That guarantees team sizes never differ by more than one person, and that every possible arrangement is equally likely. The naive alternative, slicing a shuffled list into consecutive chunks, is also fair but produces one undersized team at the end when the numbers do not divide evenly. Dealing spreads the remainder across teams instead, which is what people expect.</p>`,

  steps: [
    'Paste your names, one per line.',
    'Choose whether you are fixing the <strong>number of teams</strong> or the <strong>size of each team</strong>.',
    'Press generate. Use <strong>reshuffle</strong> if the split looks lopsided in some other way.',
  ],

  sections: [
    {
      id: 'fairness',
      h2: 'Random is not the same as balanced',
      html: `<p>This tool distributes people evenly by <em>count</em>. It knows nothing about ability, so a genuinely random split will sometimes put the four strongest players together — that is what randomness does.</p>
<p>If you need balanced teams rather than random ones, the usual approach is <strong>snake drafting</strong>: rank everyone by ability, then assign in the order 1-2-3-3-2-1-1-2-3, reversing each round. That spreads strength evenly and is far better than captains picking sides, which is both slower and unkind to whoever goes last.</p>
<p>For classrooms, random assignment has a specific virtue: it removes the social dynamics of self-selection, so nobody has to negotiate their way into a group.</p>`,
    },
    {
      id: 'uses',
      h2: 'Common uses',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Split by</th><th>Typical setting</th></tr></thead>
<tbody>
<tr><td>PE lesson</td><td>Number of teams</td><td>2 or 4</td></tr>
<tr><td>Group project</td><td>Team size</td><td>3–4 per group</td></tr>
<tr><td>Five-a-side</td><td>Team size</td><td>5</td></tr>
<tr><td>Quiz night</td><td>Number of teams</td><td>4–6</td></tr>
<tr><td>Secret Santa groups</td><td>Team size</td><td>5–8</td></tr>
<tr><td>Breakout rooms</td><td>Team size</td><td>4–5</td></tr>
</tbody></table></div>`,
    },
  ],

  faq: [
    { q: 'Are the teams evenly sized?', a: '<p>As even as the numbers allow. Names are dealt one at a time across the teams, so sizes never differ by more than one person.</p>' },
    { q: 'Can I split by team size instead of team count?', a: '<p>Yes. Switch to "team size" and enter how many people you want per team; the number of teams is worked out for you.</p>' },
    { q: 'Does it balance teams by ability?', a: '<p>No — the split is purely random. For balanced teams, rank players yourself and use a snake draft, as described above.</p>' },
    { q: 'Can I keep certain people apart or together?', a: '<p>Not automatically. Generate the teams, then swap two people manually if a particular pairing does not work.</p>' },
    { q: 'Are the names stored?', a: '<p>No. Everything runs in your browser and nothing is saved or transmitted.</p>' },
  ],

  related: ['random-name-picker', 'wheel-of-names', 'random-number-generator', 'coin-flip'],
};
