export default {
  slug: 'what-to-eat-picker',
  category: 'random',
  title: 'What Should I Eat? – Random Meal Picker',
  h1: 'What Should I Eat?',
  cardText: 'Breaks the "I don’t mind, you choose" deadlock in one tap.',
  description:
    'Free random meal picker. Get a suggestion for what to eat by cuisine and meal type, or add your own options and let the tool decide for you.',
  keywords: ['what should i eat', 'random food picker', 'meal decider', 'what to eat tonight', 'food randomizer'],
  updated: '2026-09-04',
  lede: 'Filter by meal and cuisine, or paste in your own shortlist. Either way, something gets decided.',

  form: `
<div class="field">
  <span class="field-label" id="src-label">Choose from</span>
  <div class="seg" role="group" aria-labelledby="src-label" id="sources">
    <button type="button" data-src="built" aria-pressed="true">Our list</button>
    <button type="button" data-src="own">My own options</button>
  </div>
</div>

<div id="pane-built">
  <div class="row">
    <div class="field">
      <label for="meal">Meal</label>
      <select id="meal">
        <option value="any" selected>Any</option>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
      </select>
    </div>
    <div class="field">
      <label for="cuisine">Cuisine</label>
      <select id="cuisine"><option value="any" selected>Any</option></select>
    </div>
    <div class="field">
      <label for="effort">Effort</label>
      <select id="effort">
        <option value="any" selected>Any</option>
        <option value="1">Barely cooking</option>
        <option value="2">A bit of work</option>
        <option value="3">A proper project</option>
      </select>
    </div>
  </div>
</div>

<div id="pane-own" hidden>
  <div class="field">
    <label for="own">Your options, one per line</label>
    <textarea id="own" rows="6" placeholder="Leftovers&#10;That noodle place&#10;Beans on toast" style="min-height:130px"></textarea>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="pick">Decide for me</button>
  <button type="button" class="btn btn-ghost" id="again" hidden>Something else</button>
</div>

<div class="result" id="out" hidden aria-live="polite" style="text-align:center">
  <div class="result-label" id="lbl">Tonight you are having</div>
  <div class="result-value" id="dish" style="font-size:clamp(1.7rem,1.2rem+2.4vw,2.6rem)">—</div>
  <div class="result-note" id="note"></div>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var src = 'built';
  var last = '';

  // [dish, meal, cuisine, effort 1-3]
  var DISHES = [
    ['Scrambled eggs on toast','breakfast','British',1],
    ['Porridge with honey and banana','breakfast','British',1],
    ['Greek yoghurt with granola','breakfast','Greek',1],
    ['Full English breakfast','breakfast','British',3],
    ['Shakshuka','breakfast','Middle Eastern',2],
    ['Pancakes with maple syrup','breakfast','American',2],
    ['Avocado toast with chilli flakes','breakfast','American',1],
    ['Congee with spring onion','breakfast','Chinese',2],
    ['Breakfast burrito','breakfast','Mexican',2],
    ['Croissant and coffee','breakfast','French',1],
    ['Toasted cheese sandwich','lunch','British',1],
    ['Caesar salad','lunch','American',2],
    ['Pho','lunch','Vietnamese',3],
    ['Banh mi','lunch','Vietnamese',2],
    ['Falafel wrap','lunch','Middle Eastern',2],
    ['Ramen','lunch','Japanese',3],
    ['Margherita pizza','lunch','Italian',2],
    ['Jacket potato with beans','lunch','British',1],
    ['Chicken katsu curry','lunch','Japanese',3],
    ['Greek salad with feta','lunch','Greek',1],
    ['Tomato soup and bread','lunch','British',1],
    ['Sushi','lunch','Japanese',3],
    ['Spaghetti carbonara','dinner','Italian',2],
    ['Thai green curry','dinner','Thai',2],
    ['Beef tacos','dinner','Mexican',2],
    ['Roast chicken with potatoes','dinner','British',3],
    ['Butter chicken with rice','dinner','Indian',3],
    ['Pad thai','dinner','Thai',2],
    ['Mushroom risotto','dinner','Italian',3],
    ['Fish and chips','dinner','British',3],
    ['Chilli con carne','dinner','Mexican',2],
    ['Lasagne','dinner','Italian',3],
    ['Stir-fried noodles with vegetables','dinner','Chinese',1],
    ['Dal and rice','dinner','Indian',2],
    ['Moussaka','dinner','Greek',3],
    ['Bibimbap','dinner','Korean',3],
    ['Paella','dinner','Spanish',3],
    ['Tagine with couscous','dinner','Moroccan',3],
    ['Sausage and mash','dinner','British',2],
    ['Pesto pasta','dinner','Italian',1],
    ['Beef stew','dinner','French',3],
    ['Katsu sando','dinner','Japanese',2],
    ['Quesadillas','dinner','Mexican',1],
    ['Omelette and salad','dinner','French',1],
    ['Fried rice with whatever is in the fridge','dinner','Chinese',1]
  ];

  var cuisines = [];
  DISHES.forEach(function(d){ if (cuisines.indexOf(d[2]) === -1) cuisines.push(d[2]); });
  cuisines.sort();
  $('cuisine').innerHTML = '<option value="any" selected>Any</option>' +
    cuisines.map(function(c){ return '<option value="' + c + '">' + c + '</option>'; }).join('');

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  function candidates(){
    if (src === 'own') {
      return $('own').value.split('\\n').map(function(s){ return s.trim(); }).filter(Boolean);
    }
    var meal = $('meal').value, cuisine = $('cuisine').value, effort = $('effort').value;
    return DISHES.filter(function(d){
      return (meal === 'any' || d[1] === meal) &&
             (cuisine === 'any' || d[2] === cuisine) &&
             (effort === 'any' || String(d[3]) === effort);
    }).map(function(d){ return d[0] + '||' + d[2] + '||' + d[3]; });
  }

  function pick(){
    var list = candidates();
    if (!list.length) {
      $('err').hidden = false;
      $('err').textContent = src === 'own'
        ? 'Add a few options first, one per line.'
        : 'Nothing matches those filters. Try loosening one of them.';
      $('out').hidden = true; $('again').hidden = true;
      return;
    }
    $('err').hidden = true;

    // Avoid repeating the previous suggestion when there is an alternative.
    var choice, tries = 0;
    do { choice = list[randInt(list.length)]; tries++; } while (choice === last && list.length > 1 && tries < 12);
    last = choice;

    var parts = choice.split('||');
    $('dish').textContent = parts[0];
    $('note').textContent = parts.length > 1
      ? parts[1] + '  ·  ' + ['barely cooking', 'a bit of work', 'a proper project'][parts[2] - 1] +
        '  ·  chosen from ' + list.length + ' options'
      : 'Chosen from ' + list.length + ' of your options.';
    $('lbl').textContent = $('meal').value === 'breakfast' ? 'Breakfast is' :
                           $('meal').value === 'lunch' ? 'Lunch is' : 'You are having';
    $('out').hidden = false;
    $('again').hidden = false;
  }

  $('sources').addEventListener('click', function(e){
    var b = e.target.closest('button[data-src]'); if (!b) return;
    src = b.getAttribute('data-src');
    var btns = $('sources').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('pane-built').hidden = src !== 'built';
    $('pane-own').hidden = src === 'built';
  });
  $('pick').addEventListener('click', pick);
  $('again').addEventListener('click', pick);
})();`,

  answerHeading: 'Why deciding what to eat is so hard',
  answer: `<p><strong>The problem is not lack of options — it is too many of them.</strong> Psychologists call this choice overload: past a certain point, adding options makes deciding harder and satisfaction lower, because every choice now carries the cost of everything you did not pick. Food is a particularly bad case because it recurs daily, the options are near-infinite, and it is usually a negotiation with someone else. Removing the choice entirely, by handing it to something arbitrary, is a genuinely effective fix.</p>`,

  steps: [
    'Filter by meal, cuisine and how much effort you are willing to spend.',
    'Or switch to <strong>my own options</strong> and paste the shortlist you are actually arguing about.',
    'Press decide. If you feel disappointed, you have learned what you wanted.',
  ],

  sections: [
    {
      id: 'deadlock',
      h2: 'Breaking the "I don’t mind" deadlock',
      html: `<p>The stalemate has a predictable shape: both people genuinely have a preference, neither wants to impose it, and so both say they do not mind. Twenty minutes later nobody has eaten.</p>
<p>Two things break it reliably.</p>
<p><strong>Narrow before you randomise.</strong> Each person names two options they would be happy with. Put those four into the box and let it choose. The result is now guaranteed acceptable to both, and nobody had to be the one who decided.</p>
<p><strong>Use the disappointment test.</strong> When the answer appears, notice your reaction. Relief means take it. A small sinking feeling means you had a preference all along — and now you can just say what it was.</p>`,
    },
    {
      id: 'overload',
      h2: 'The paradox of choice, briefly',
      html: `<p>The best-known study is Iyengar and Lepper's supermarket jam experiment. A tasting table with 24 varieties attracted more passers-by than one with 6 — but shoppers who saw the 6 were roughly ten times more likely to actually buy.</p>
<p>Later work has found the effect is smaller and more conditional than the popular version suggests; it depends on time pressure, familiarity and how hard the options are to compare. But the everyday lesson survives: when a decision does not matter much, spending effort on it is pure cost.</p>
<p>Dinner on a Tuesday is exactly that kind of decision.</p>`,
    },
  ],

  faq: [
    { q: 'Can I add my own options?', a: '<p>Yes. Switch to "my own options" and paste your list, one per line. Useful when the real argument is between three specific takeaways.</p>' },
    { q: 'Will it suggest the same thing twice?', a: '<p>It avoids repeating the previous suggestion whenever there is an alternative available, so pressing "something else" always gives you something else.</p>' },
    { q: 'How many dishes are in the list?', a: '<p>Around 45, spread across breakfast, lunch and dinner and a dozen cuisines, each tagged by how much effort it takes.</p>' },
    { q: 'Does it account for dietary requirements?', a: '<p>Not directly. For anything specific — vegetarian, gluten-free, allergies — use your own options list, which gives you full control.</p>' },
  ],

  related: ['yes-no-decision-maker', 'random-name-picker', 'coin-flip', 'grocery-list-maker'],
};
