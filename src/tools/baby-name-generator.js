export default {
  slug: 'baby-name-generator',
  category: 'random',
  title: 'Baby Name Generator – Filter by Style, Length and Letter',
  h1: 'Baby Name Generator',
  cardText: 'Baby names filtered by style, length, first letter and origin.',
  description:
    'Free baby name generator. Filter names by style, length, starting letter and origin, shortlist the ones you like, and see meanings and popularity notes.',
  keywords: ['baby name generator', 'baby names', 'name ideas', 'unique baby names', 'baby name list'],
  updated: '2026-09-04',
  lede: 'Filter by the things that actually narrow it down — style, length, first letter — and shortlist as you go.',

  form: `
<div class="row">
  <div class="field">
    <label for="sex">For</label>
    <select id="sex">
      <option value="all" selected>Any</option>
      <option value="g">Girls</option>
      <option value="b">Boys</option>
      <option value="n">Gender neutral</option>
    </select>
  </div>
  <div class="field">
    <label for="style">Style</label>
    <select id="style">
      <option value="all" selected>Any style</option>
      <option value="classic">Classic</option>
      <option value="modern">Modern</option>
      <option value="nature">Nature</option>
      <option value="vintage">Vintage revival</option>
      <option value="short">Short and punchy</option>
    </select>
  </div>
  <div class="field">
    <label for="letter">Starts with</label>
    <select id="letter"></select>
  </div>
  <div class="field">
    <label for="len">Length</label>
    <select id="len">
      <option value="all" selected>Any</option>
      <option value="short">3–4 letters</option>
      <option value="mid">5–6 letters</option>
      <option value="long">7+ letters</option>
    </select>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Show names</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy shortlist</button>
  <button type="button" class="btn btn-ghost" id="clearlist">Clear shortlist</button>
</div>

<div id="out" class="name-grid"></div>

<div id="shortlist-wrap" hidden style="margin-top:24px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Your shortlist</h2>
  <div id="shortlist" class="name-grid"></div>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.name-grid{margin-top:20px;display:grid;gap:9px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.name-card{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px;
  display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.name-card b{font-size:1.02rem;font-weight:640;display:block}
.name-card span{font-size:.8rem;color:var(--ink-3);display:block;margin-top:2px}
.name-card button{border:1px solid var(--line-strong);background:var(--bg);border-radius:6px;cursor:pointer;
  color:var(--ink-3);font-size:1rem;width:28px;height:28px;flex:none;line-height:1}
.name-card button:hover{border-color:var(--accent);color:var(--accent)}
.name-card.saved button{background:var(--accent);border-color:var(--accent);color:#fff}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-babynames';
  var saved = [];

  // [name, sex, style, origin/meaning]
  var NAMES = [
    ['Amelia','g','classic','Germanic — industrious'],['Olivia','g','classic','Latin — olive tree'],
    ['Isla','g','short','Scottish — after the river Islay'],['Ava','g','short','Uncertain — possibly Germanic'],
    ['Freya','g','vintage','Norse — the goddess Freyja'],['Willow','g','nature','English — the tree'],
    ['Ivy','g','nature','English — the plant'],['Hazel','g','nature','English — the tree'],
    ['Beatrice','g','vintage','Latin — she who brings happiness'],['Eleanor','g','classic','Provençal — origin uncertain'],
    ['Nova','g','modern','Latin — new'],['Luna','g','modern','Latin — moon'],
    ['Maeve','g','vintage','Irish — she who intoxicates'],['Clara','g','vintage','Latin — bright, clear'],
    ['Sienna','g','modern','Italian — the earth pigment'],['Aurora','g','classic','Latin — dawn'],
    ['Wren','n','nature','English — the bird'],['River','n','nature','English — the watercourse'],
    ['Sage','n','nature','Latin — wise, also the herb'],['Rowan','n','nature','Gaelic — the tree'],
    ['Quinn','n','short','Irish — descendant of Conn'],['Avery','n','modern','Old English — elf counsel'],
    ['Ellis','n','vintage','Welsh — benevolent'],['Frankie','n','vintage','Diminutive of Frances or Francis'],
    ['Reese','n','short','Welsh — ardent'],['Blake','n','short','Old English — either dark or pale'],
    ['Arthur','b','vintage','Celtic — bear, possibly'],['Theodore','b','classic','Greek — gift of God'],
    ['Oliver','b','classic','Latin — olive tree'],['Noah','b','classic','Hebrew — rest, comfort'],
    ['Felix','b','vintage','Latin — fortunate'],['Rafferty','b','modern','Irish — prosperity wielder'],
    ['Ezra','b','vintage','Hebrew — help'],['Milo','b','short','Germanic — merciful'],
    ['Otto','b','short','Germanic — wealth'],['Caspian','b','modern','After the sea'],
    ['Alfie','b','vintage','Diminutive of Alfred — elf counsel'],['Jasper','b','nature','Persian — treasurer, also the stone'],
    ['Rory','n','short','Gaelic — red king'],['Aspen','n','nature','English — the tree'],
    ['Juniper','g','nature','Latin — the shrub'],['Linden','n','nature','English — the lime tree'],
    ['Cassius','b','vintage','Latin — hollow'],['Elowen','g','modern','Cornish — elm'],
    ['Fern','g','nature','English — the plant'],['Bram','b','short','Dutch diminutive of Abraham'],
    ['Iris','g','nature','Greek — rainbow, also the flower'],['Vera','g','vintage','Russian — faith'],
    ['Emrys','b','vintage','Welsh — immortal'],['Marlowe','n','modern','Old English — driftwood'],
    ['Sonny','n','short','English — endearment'],['Thea','g','short','Greek — goddess'],
    ['Rex','b','short','Latin — king'],['Bo','n','short','Scandinavian — to live'],
    ['Seraphina','g','vintage','Hebrew — fiery ones'],['Atticus','b','vintage','Greek — from Attica'],
    ['Indigo','n','nature','Greek — the dye and colour'],['Clementine','g','vintage','Latin — merciful']
  ];

  var letters = ['all'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
  $('letter').innerHTML = letters.map(function(l){
    return '<option value="' + l + '">' + (l === 'all' ? 'Any letter' : l) + '</option>';
  }).join('');

  function matches(n){
    var sex = $('sex').value, style = $('style').value, letter = $('letter').value, len = $('len').value;
    if (sex !== 'all' && n[1] !== sex) return false;
    if (style !== 'all' && n[2] !== style) return false;
    if (letter !== 'all' && n[0][0].toUpperCase() !== letter) return false;
    var L = n[0].length;
    if (len === 'short' && L > 4) return false;
    if (len === 'mid' && (L < 5 || L > 6)) return false;
    if (len === 'long' && L < 7) return false;
    return true;
  }

  function card(n, inList){
    var isSaved = saved.indexOf(n[0]) > -1;
    return '<div class="name-card' + (isSaved ? ' saved' : '') + '">' +
      '<span><b>' + n[0] + '</b><span>' + n[3] + '</span></span>' +
      '<button type="button" data-n="' + n[0] + '" aria-label="' + (isSaved ? 'Remove from' : 'Add to') +
      ' shortlist">' + (isSaved ? '✓' : '+') + '</button></div>';
  }

  function render(){
    var list = NAMES.filter(matches);
    $('out').innerHTML = list.length
      ? list.map(function(n){ return card(n); }).join('')
      : '<p class="hint">No names match those filters. Try loosening one.</p>';

    $('shortlist-wrap').hidden = saved.length === 0;
    $('shortlist').innerHTML = saved.map(function(name){
      var n = NAMES.filter(function(x){ return x[0] === name; })[0];
      return n ? card(n) : '';
    }).join('');

    $('meta').textContent = list.length + ' of ' + NAMES.length + ' names match' +
      (saved.length ? ' · ' + saved.length + ' shortlisted, saved in this browser' : '');
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest('button[data-n]'); if (!b) return;
    var name = b.getAttribute('data-n');
    var i = saved.indexOf(name);
    if (i > -1) saved.splice(i, 1); else saved.push(name);
    render();
  });

  ['sex','style','letter','len'].forEach(function(id){ $(id).addEventListener('change', render); });
  $('go').addEventListener('click', render);
  $('clearlist').addEventListener('click', function(){ saved = []; render(); });
  $('copy').addEventListener('click', function(){
    if (!saved.length) return;
    navigator.clipboard.writeText(saved.join('\\n')).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy shortlist'; }, 1400);
    });
  });

  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { saved = []; }
  render();
})();`,

  answerHeading: 'Narrowing down a name',
  answer: `<p><strong>Most people find a name by elimination rather than inspiration.</strong> Filtering by length, first letter and style narrows thousands of options to a few dozen you can actually consider — and the constraints usually already exist: a surname that clashes with certain endings, an initial you want to avoid, a length that suits a long family name. Shortlist generously at first and cut later; almost nobody picks the first name they like.</p>`,

  steps: [
    'Set any filters that already apply — style, letter, length.',
    'Press <strong>+</strong> on names you like to shortlist them.',
    'Your shortlist saves in this browser, so you can come back to it.',
  ],

  sections: [
    {
      id: 'tests',
      h2: 'Tests worth running on a shortlist',
      html: `<ul>
<li><strong>Say it with the surname, out loud, ten times.</strong> Clashes only show up aloud — a name ending in the sound the surname begins with runs together.</li>
<li><strong>Check the initials.</strong> Every parent who has produced an unfortunate monogram wishes they had.</li>
<li><strong>Shout it across a park.</strong> If it does not carry, you will end up using a nickname anyway.</li>
<li><strong>Imagine it on a CV and on a toddler.</strong> It has to work at both ends of a life.</li>
<li><strong>Search it.</strong> Once, to check you are not naming a child after something regrettable.</li>
<li><strong>Sit with it for a week</strong> before deciding. Enthusiasm for a name fades much faster than you expect.</li>
</ul>`,
    },
    {
      id: 'popularity',
      h2: 'The popularity trade-off',
      html: `<p>Names run in cycles of roughly a century — the "hundred-year rule" — which is why Ada, Arthur, Ivy and Alfie sound fresh again while Karen and Gary do not yet.</p>
<p>Worth knowing: national top-ten lists lag reality. A name climbing fast is often already common in playgroups by the time it appears in an annual chart. If you want to avoid three of them in a class, check current lists rather than the ones you remember from your own childhood.</p>
<p>Equally, a very unusual name means a lifetime of spelling it out. Neither choice is wrong; both have a cost, and it is worth choosing which cost you prefer.</p>`,
    },
  ],

  faq: [
    { q: 'Is my shortlist saved?', a: '<p>Yes, in your browser’s local storage. It stays on that device and is never uploaded.</p>' },
    { q: 'How many names are in the list?', a: '<p>Around sixty, chosen for range across style and origin rather than to be exhaustive. National registry lists are the place for full coverage.</p>' },
    { q: 'Do you show name popularity rankings?', a: '<p>No, because rankings differ by country and change yearly. Your national statistics office publishes current lists — those are the authoritative source.</p>' },
    { q: 'What counts as a gender neutral name?', a: '<p>Names used broadly for any child. Usage shifts over time and varies by country, so the categories here are a guide rather than a rule.</p>' },
  ],

  related: ['nickname-generator', 'random-name-picker', 'pregnancy-due-date-calculator', 'zodiac-sign-finder'],
};
