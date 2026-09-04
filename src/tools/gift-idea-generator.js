export default {
  slug: 'gift-idea-generator',
  category: 'random',
  title: 'Gift Idea Generator – Suggestions by Person and Budget',
  h1: 'Gift Idea Generator',
  cardText: 'Gift ideas filtered by who it is for, the occasion and your budget.',
  description:
    'Free gift idea generator. Get suggestions filtered by relationship, occasion, budget and interests, with a shortlist you can save and copy.',
  keywords: ['gift ideas', 'gift idea generator', 'what to buy someone', 'present ideas', 'christmas gift ideas'],
  updated: '2026-09-04',
  lede: 'Filter by who it is for and what you want to spend. Shortlist anything promising — the list saves in your browser.',

  form: `
<div class="row">
  <div class="field">
    <label for="who">Who is it for?</label>
    <select id="who">
      <option value="all" selected>Anyone</option>
      <option value="partner">Partner</option>
      <option value="parent">Parent</option>
      <option value="friend">Friend</option>
      <option value="colleague">Colleague</option>
      <option value="child">Child</option>
    </select>
  </div>
  <div class="field">
    <label for="budget">Budget</label>
    <select id="budget">
      <option value="all" selected>Any budget</option>
      <option value="1">Under $25</option>
      <option value="2">$25–75</option>
      <option value="3">$75–200</option>
      <option value="4">$200+</option>
    </select>
  </div>
  <div class="field">
    <label for="kind">Kind of gift</label>
    <select id="kind">
      <option value="all" selected>Anything</option>
      <option value="experience">Experience</option>
      <option value="practical">Practical</option>
      <option value="thoughtful">Thoughtful</option>
      <option value="consumable">Consumable</option>
      <option value="handmade">Handmade or free</option>
    </select>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Show ideas</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy shortlist</button>
  <button type="button" class="btn btn-ghost" id="clearlist">Clear shortlist</button>
</div>

<div id="out" class="gift-grid"></div>

<div id="short-wrap" hidden style="margin-top:24px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Shortlist</h2>
  <div id="shortlist" class="gift-grid"></div>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>`,

  css: `
.gift-grid{margin-top:20px;display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.gift-card{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:13px 15px;
  display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.gift-card b{font-size:.98rem;font-weight:620;display:block}
.gift-card span{font-size:.82rem;color:var(--ink-3);display:block;margin-top:3px;line-height:1.45}
.gift-card .tag{display:inline-block;margin-top:6px;font-size:.72rem;background:var(--bg-sunken);
  border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--ink-3)}
.gift-card button{border:1px solid var(--line-strong);background:var(--bg);border-radius:6px;cursor:pointer;
  color:var(--ink-3);font-size:1rem;width:28px;height:28px;flex:none;line-height:1}
.gift-card button:hover{border-color:var(--accent);color:var(--accent)}
.gift-card.saved button{background:var(--accent);border-color:var(--accent);color:#fff}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var KEY = 'cp-gifts';
  var saved = [];

  // [idea, who (array), budget 1-4, kind, note]
  var IDEAS = [
    ['A letter about a specific memory',['partner','parent','friend'],1,'thoughtful','Costs nothing and is kept for decades. Be specific — a particular day, not general sentiment.'],
    ['Their favourite meal, cooked properly',['partner','parent','friend'],1,'handmade','Time and attention rather than money. Do the washing up too.'],
    ['A book you have actually read',['friend','colleague','parent'],1,'thoughtful','Write inside the cover why you thought of them. That inscription is the gift.'],
    ['Good coffee or tea from a local roaster',['colleague','friend','parent'],1,'consumable','Consumable gifts leave no clutter, which matters more as people get older.'],
    ['A plant that is hard to kill',['friend','colleague','partner'],1,'practical','Snake plant or pothos. Avoid anything needing daily attention.'],
    ['A really good pair of socks',['parent','partner','friend'],1,'practical','Merino or thick cotton. Genuinely appreciated, universally underrated.'],
    ['A framed photo of the two of you',['partner','parent','friend'],1,'thoughtful','Printed, not digital. Nobody prints photos any more, which is exactly why it lands.'],
    ['Their childhood sweets',['friend','partner'],1,'consumable','Nostalgia is cheap and effective.'],
    ['A jigsaw of somewhere meaningful',['parent','partner'],2,'thoughtful','Custom-printed from a photo of a place they love.'],
    ['Tickets to something small and local',['partner','friend'],2,'experience','A gig, a comedy night, a match. Experiences outlast objects in memory.'],
    ['A good knife or chopping board',['partner','parent'],2,'practical','For anyone who cooks. One good tool beats a gadget set.'],
    ['A subscription to something they use',['parent','friend','colleague'],2,'practical','Audiobooks, a magazine, a coffee delivery. Check they do not already have it.'],
    ['A day out you plan entirely',['partner','parent'],2,'experience','You handle the booking, transport and timing. The planning is the present.'],
    ['A nice notebook and a pen that works',['colleague','friend'],2,'practical','Unglamorous and used daily.'],
    ['Cooking class for two',['partner','friend'],3,'experience','You both learn something and get dinner. Doubles as time together.'],
    ['A weighted blanket',['partner','parent'],3,'practical','Frequently loved by people who would never buy one themselves.'],
    ['Noise-cancelling headphones',['partner','colleague','friend'],3,'practical','Genuinely life-improving for commuters and open-plan workers.'],
    ['A commissioned illustration',['partner','parent'],3,'thoughtful','Of their house, pet or a photo. Independent illustrators are easy to find and reasonably priced.'],
    ['A skill lesson — pottery, climbing, sailing',['partner','friend','child'],3,'experience','Especially good for someone who says they want nothing.'],
    ['A weekend away, fully arranged',['partner','parent'],4,'experience','The gift is that they have to organise nothing.'],
    ['Something they mentioned once and forgot',['partner','friend','parent'],4,'thoughtful','Requires you to have been listening months ago. Unbeatable when it works.'],
    ['A quality version of something they use daily',['partner','parent'],4,'practical','The chair, the mattress, the pan. Boring, expensive, and used every single day.'],
    ['A savings account or premium bond',['child'],2,'practical','Deeply unexciting on the day, appreciated at eighteen.'],
    ['A proper art set',['child'],2,'practical','Real materials rather than a character-branded kit.'],
    ['A trip to somewhere they choose',['child'],2,'experience','Let them pick, within reason. The choosing is half of it.'],
    ['A book series they can grow into',['child'],1,'thoughtful','Something with sequels. One book ends; a series continues.'],
    ['A membership — zoo, museum, cinema',['child','parent','partner'],3,'experience','Value spread across a whole year rather than one afternoon.'],
    ['Home-made preserves or baking',['colleague','friend','parent'],1,'handmade','Effort is visible, cost is not, and it disappears rather than sitting on a shelf.'],
    ['A playlist with notes on each track',['partner','friend'],1,'handmade','Say why each one is there. That is what makes it a gift rather than a list.'],
    ['An offer of specific help, written down',['parent','friend'],1,'handmade','A voucher for a day of decorating, childcare or a lift to appointments. Redeemable, and meant.']
  ];

  function matches(g){
    var who = $('who').value, budget = $('budget').value, kind = $('kind').value;
    if (who !== 'all' && g[1].indexOf(who) === -1) return false;
    if (budget !== 'all' && String(g[2]) !== budget) return false;
    if (kind !== 'all' && g[3] !== kind) return false;
    return true;
  }

  var BUDGET_LABEL = { 1: 'Under $25', 2: '$25–75', 3: '$75–200', 4: '$200+' };

  function card(g){
    var isSaved = saved.indexOf(g[0]) > -1;
    return '<div class="gift-card' + (isSaved ? ' saved' : '') + '">' +
      '<span><b>' + g[0] + '</b><span>' + g[4] + '</span>' +
      '<span class="tag">' + BUDGET_LABEL[g[2]] + ' · ' + g[3] + '</span></span>' +
      '<button type="button" data-g="' + g[0].replace(/"/g, '') + '" aria-label="Shortlist">' +
      (isSaved ? '✓' : '+') + '</button></div>';
  }

  function render(){
    var list = IDEAS.filter(matches);
    $('out').innerHTML = list.length
      ? list.map(card).join('')
      : '<p class="hint">Nothing matches those filters. Try widening the budget or kind.</p>';

    $('short-wrap').hidden = saved.length === 0;
    $('shortlist').innerHTML = saved.map(function(name){
      var g = IDEAS.filter(function(x){ return x[0] === name; })[0];
      return g ? card(g) : '';
    }).join('');

    $('meta').textContent = list.length + ' of ' + IDEAS.length + ' ideas match' +
      (saved.length ? ' · ' + saved.length + ' shortlisted' : '');
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest('button[data-g]'); if (!b) return;
    var name = b.getAttribute('data-g');
    var i = saved.indexOf(name);
    if (i > -1) saved.splice(i, 1); else saved.push(name);
    render();
  });
  ['who','budget','kind'].forEach(function(id){ $(id).addEventListener('change', render); });
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

  answerHeading: 'What research says about good gifts',
  answer: `<p><strong>Givers and receivers reliably want different things.</strong> Studies find givers favour gifts that are impressive on the day, while recipients prefer gifts that are useful afterwards — which is why the practical thing they actually asked for beats the surprise. Two other findings hold up well: experiences produce more lasting happiness than objects, because they become memories and are less easily compared to what others got; and gifts from a wish list are appreciated more than surprises, even though givers assume the opposite.</p>`,

  steps: [
    'Filter by who it is for, your budget and the kind of gift.',
    'Press <strong>+</strong> to shortlist anything promising.',
    'Your shortlist saves in this browser.',
  ],

  sections: [
    {
      id: 'principles',
      h2: 'Rules that make gift-giving easier',
      html: `<ul>
<li><strong>If they asked for something, buy that.</strong> The wish list is not a failure of imagination; it is information.</li>
<li><strong>Consumable beats permanent</strong> for anyone with a full house. Food, drink and candles get used and vanish.</li>
<li><strong>Specific beats expensive.</strong> A £15 gift that proves you were listening lands harder than a £150 one that does not.</li>
<li><strong>Experiences shared beat objects owned</strong>, and they come with your company built in.</li>
<li><strong>Do not gift a hobby they have not started.</strong> A guitar for someone who once mentioned guitars becomes furniture and a small reproach.</li>
<li><strong>For a colleague, keep it small and consumable.</strong> Anything personal is awkward in both directions.</li>
</ul>`,
    },
    {
      id: 'hard',
      h2: 'When they genuinely want nothing',
      html: `<p>The people hardest to buy for usually have everything they need and dislike clutter. Three approaches work.</p>
<p><strong>Give time.</strong> A written offer of something specific — a day of help with the garden, a standing monthly dinner, childcare so they can go out — is a real gift and costs nothing but the thing they actually lack.</p>
<p><strong>Give something they use daily, but better.</strong> They will not upgrade their own pillow, socks or kitchen knife. Someone else doing it is the entire point.</p>
<p><strong>Give a memory instead of an object.</strong> A printed photo, a written account of a shared day, a playlist with notes. These outlast almost everything bought.</p>`,
    },
  ],

  faq: [
    { q: 'Is it bad to give cash?', a: '<p>Economically it is the most efficient gift, and for teenagers and weddings it is often genuinely preferred. It carries less signal of thought, which matters more in close relationships than distant ones.</p>' },
    { q: 'Are experiences really better than objects?', a: '<p>The research fairly consistently says yes for lasting satisfaction — experiences become part of your story and resist direct comparison with what other people received.</p>' },
    { q: 'What should I spend on a colleague?', a: '<p>Small. Under $25 unless your workplace has a set amount. Consumables avoid the awkwardness of something personal.</p>' },
    { q: 'Is my shortlist saved?', a: '<p>Yes, in your browser. It never leaves your device.</p>' },
  ],

  related: ['what-to-eat-picker', 'random-name-picker', 'budget-tracker', 'anniversary-calculator'],
};
