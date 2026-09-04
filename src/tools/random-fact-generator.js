export default {
  slug: 'random-fact-generator',
  category: 'fun',
  title: 'Random Fact Generator – Something You Did Not Know',
  h1: 'Random Fact Generator',
  cardText: 'A genuinely interesting fact, with the reason it is true.',
  description:
    'Free random fact generator. Get an interesting, checkable fact about science, history, language, nature or space — each with a short explanation of why it is true.',
  keywords: ['random fact generator', 'interesting facts', 'fun facts', 'did you know', 'random trivia'],
  updated: '2026-09-04',
  lede: 'Facts that are actually true and actually interesting, each with a line explaining why — because a fact without a reason is just trivia.',

  form: `
<div class="field">
  <label for="topic">Topic</label>
  <select id="topic">
    <option value="all" selected>Anything</option>
    <option value="science">Science</option>
    <option value="space">Space</option>
    <option value="nature">Nature</option>
    <option value="history">History</option>
    <option value="language">Language</option>
    <option value="body">The human body</option>
  </select>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">Give me a fact</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy</button>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="topiclbl">Fact</div>
  <div class="fact-text" id="fact">—</div>
  <div class="result-note" id="why"></div>
</div>
<p class="hint" id="seen" style="margin-top:12px"></p>`,

  css: `
.fact-text{font-size:clamp(1.15rem,1rem+1vw,1.5rem);line-height:1.45;font-weight:600;
  letter-spacing:-.015em;color:var(--ink);margin:8px 0 12px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // [topic, fact, why it is true]
  var FACTS = [
    ['space','Venus has days longer than its years.','It rotates once every 243 Earth days but orbits the Sun in 225, so a Venusian day outlasts a Venusian year.'],
    ['space','There is a planet where it likely rains molten glass, sideways.','HD 189733b has silicate clouds and winds around 8,700 km/h, so the glass droplets travel almost horizontally.'],
    ['space','Saturn would float in a bathtub big enough to hold it.','Its mean density is about 0.69 g/cm³, less than water — it is mostly hydrogen and helium.'],
    ['space','The footprints on the Moon will last for millions of years.','With no atmosphere there is no wind or rain to erode them; only micrometeorites slowly wear them away.'],
    ['space','Light from the Sun takes 8 minutes to reach us, but escaping the Sun took far longer.','Photons scatter constantly in the dense interior, taking tens of thousands of years to random-walk to the surface.'],
    ['science','Hot water can freeze faster than cold water under some conditions.','Known as the Mpemba effect, it has been reproduced repeatedly, though the mechanism is still argued over — evaporation, convection and dissolved gases all contribute.'],
    ['science','Glass is not a slow-flowing liquid.','The myth comes from old windows being thicker at the bottom, which is actually an artefact of how crown glass was made and installed.'],
    ['science','A teaspoon of neutron star material would weigh about a billion tonnes.','Neutron stars are collapsed stellar cores where matter is packed to nuclear density.'],
    ['science','Bananas are slightly radioactive.','They are rich in potassium, and about 0.012% of natural potassium is the radioactive isotope potassium-40.'],
    ['science','Helium was discovered on the Sun before it was found on Earth.','It was identified in 1868 as an unexplained line in the solar spectrum, 27 years before being isolated terrestrially.'],
    ['nature','Octopuses have three hearts and blue blood.','Two hearts pump blood to the gills and one to the body; their oxygen carrier is copper-based haemocyanin rather than iron-based haemoglobin.'],
    ['nature','Wombats produce cube-shaped droppings.','Varying elasticity along the intestinal wall moulds the faeces into cubes, which stack without rolling away when used to mark territory.'],
    ['nature','A single honeybee makes about a twelfth of a teaspoon of honey in its entire life.','Foragers live roughly six weeks in summer, which is why a jar represents the work of thousands of bees.'],
    ['nature','Sharks predate trees.','Sharks appear in the fossil record around 400 million years ago; the earliest trees around 385 million.'],
    ['nature','Sloths can hold their breath longer than dolphins.','By slowing their heart rate to a third of normal, sloths manage around 40 minutes underwater against a dolphin\\'s 10.'],
    ['nature','Cows have best friends and get stressed when separated.','Studies measuring heart rate and cortisol found significantly lower stress when cattle were paired with a preferred partner.'],
    ['history','Oxford University is older than the Aztec Empire.','Teaching at Oxford is documented from 1096; Tenochtitlan was founded in 1325.'],
    ['history','Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.','The pyramid was built around 2560 BC, Cleopatra died in 30 BC, and Apollo 11 landed in 1969.'],
    ['history','The last execution by guillotine happened the same year Star Wars was released.','France carried out its final guillotining in September 1977.'],
    ['history','Fax machines were invented before the American Civil War.','Alexander Bain patented a working facsimile mechanism in 1843, eighteen years before the war began.'],
    ['history','Napoleon was not unusually short.','He was around 5 ft 7 in, average for the time. The confusion came from French inches being longer than English ones, plus British propaganda.'],
    ['language','The word "set" has more distinct definitions than any other English word.','The Oxford English Dictionary gives it over 400 senses, spanning verb, noun and adjective uses.'],
    ['language','English has no widely used word that rhymes with "month".','The consonant cluster at the end is unusually rare, as it is in "orange" and "silver".'],
    ['language','"Dreamt" is the only common English word ending in -mt.','Its variants — undreamt, daydreamt — are the only others.'],
    ['language','The dot over a lowercase i or j has a name.','It is called a tittle, from the Latin titulus, meaning a small mark.'],
    ['language','Iceland maintains a committee that invents Icelandic words for new technology.','Rather than borrowing, it coins native compounds — a computer is tölva, roughly "number prophetess".'],
    ['body','Your stomach lining replaces itself every few days.','Stomach acid would otherwise digest it, so the epithelium regenerates roughly every three to five days.'],
    ['body','You are measurably taller in the morning.','Spinal discs compress through the day under gravity, costing about 1 cm by evening and recovering overnight.'],
    ['body','The strongest muscle by weight is in your jaw.','The masseter can close the molars with a force of several hundred newtons relative to its small size.'],
    ['body','Your bones are about four times stronger than concrete by weight.','Bone is a composite of collagen and mineral, giving it both tensile and compressive strength that concrete lacks.'],
    ['body','Humans glow, very faintly.','The body emits visible light from metabolic reactions at roughly a thousandth of the intensity the eye can detect.'],
    ['body','You have more bacterial cells than human ones, but only just.','Current estimates put the ratio near 1.3 to 1, revising down the widely repeated figure of 10 to 1.']
  ];

  var recent = [];

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  function show(){
    var topic = $('topic').value;
    var pool = FACTS.filter(function(f){ return topic === 'all' || f[0] === topic; });
    // Avoid repeating anything from the last few draws.
    var fresh = pool.filter(function(f){ return recent.indexOf(f[1]) === -1; });
    if (!fresh.length) { recent = []; fresh = pool; }

    var f = fresh[randInt(fresh.length)];
    recent.push(f[1]);
    if (recent.length > Math.min(8, pool.length - 1)) recent.shift();

    $('fact').textContent = f[1];
    $('why').textContent = f[2];
    $('topiclbl').textContent = f[0].charAt(0).toUpperCase() + f[0].slice(1);
    $('out').dataset.text = f[1] + ' ' + f[2];
    $('seen').textContent = pool.length + ' facts in this topic.';
  }

  $('go').addEventListener('click', show);
  $('topic').addEventListener('change', function(){ recent = []; show(); });
  $('copy').addEventListener('click', function(){
    navigator.clipboard.writeText($('out').dataset.text || '').then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy'; }, 1400);
    });
  });

  show();
})();`,

  answerHeading: 'Why most "fun fact" lists are wrong',
  answer: `<p><strong>A large share of widely shared facts are false, and they spread precisely because they are satisfying.</strong> Goldfish do not have three-second memories — they can be trained on tasks weeks apart. We use far more than 10% of our brains. Glass is not a slow-flowing liquid. The Great Wall is not visible from space with the naked eye. Facts here each carry a short explanation of <em>why</em> they are true, which is the fastest available test: a claim nobody can explain the mechanism for is usually one that did not survive checking.</p>`,

  steps: [
    'Choose a topic, or leave it on anything.',
    'Press the button. Each fact comes with the reason it holds.',
    'Copy any you want to share.',
  ],

  sections: [
    {
      id: 'debunked',
      h2: 'Facts that are not facts',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Common claim</th><th>Reality</th></tr></thead>
<tbody>
<tr><td>Goldfish have three-second memories</td><td>They retain trained behaviours for months</td></tr>
<tr><td>We use 10% of our brains</td><td>Imaging shows essentially all of it is active over a day</td></tr>
<tr><td>The Great Wall is visible from space</td><td>Not with the naked eye — it is narrow and the same colour as its surroundings</td></tr>
<tr><td>Bulls are enraged by red</td><td>Cattle are red-green colourblind; it is the movement of the cape</td></tr>
<tr><td>Lightning never strikes twice</td><td>The Empire State Building is hit around 20 times a year</td></tr>
<tr><td>You swallow spiders in your sleep</td><td>No source, no plausible mechanism, invented to demonstrate how facts spread</td></tr>
<tr><td>Vikings wore horned helmets</td><td>A 19th-century opera costume design</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'checking',
      h2: 'How to check a fact in thirty seconds',
      html: `<ul>
<li><strong>Ask what the mechanism is.</strong> True facts have a because. If nobody can supply one, be suspicious.</li>
<li><strong>Look for the original source</strong> rather than the twentieth article repeating it. Chains of citation frequently lead to nothing.</li>
<li><strong>Be wary of very round numbers.</strong> "90% of people" is usually invented; real findings have awkward figures.</li>
<li><strong>Notice if it is too satisfying.</strong> Facts that perfectly confirm something you already believe deserve more scrutiny, not less.</li>
<li><strong>Check the date.</strong> Plenty of former facts were true when written — the human-to-bacteria cell ratio was revised from 10:1 to about 1.3:1 in 2016.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Are these facts verified?', a: '<p>Each is a well-documented claim with the mechanism stated, which is what lets you check it. Where a figure is contested or has been revised, the text says so rather than presenting it as settled.</p>' },
    { q: 'How many facts are there?', a: '<p>Around thirty across six topics. The generator avoids repeating anything from your recent draws.</p>' },
    { q: 'Can I suggest a fact?', a: '<p>Yes — send it through the <a href="/contact/">contact page</a>. Include a source, since a fact without one is not much use.</p>' },
    { q: 'Why does each fact have an explanation?', a: '<p>Because the explanation is what makes it worth knowing, and it is also the quickest way to tell a real fact from a well-travelled myth.</p>' },
  ],

  related: ['quote-generator', 'zodiac-sign-finder', 'coin-flip', 'typing-speed-test'],
};
