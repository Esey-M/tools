export default {
  slug: 'quote-generator',
  category: 'fun',
  title: 'Quote Generator – Quotes That Are Actually Attributed',
  h1: 'Quote Generator',
  cardText: 'A quote with the right attribution — and a note when the famous version is wrong.',
  description:
    'Free quote generator. Get a quote on work, resilience, creativity or life, correctly attributed, with a flag when the popular version is misquoted.',
  keywords: ['quote generator', 'random quote', 'inspirational quotes', 'famous quotes', 'quote of the day'],
  updated: '2026-09-04',
  lede: 'Every quote here has been checked to a real source. Where the internet version is misattributed, it says so.',

  form: `
<div class="row">
  <div class="field">
    <label for="theme">Theme</label>
    <select id="theme">
      <option value="all" selected>Anything</option>
      <option value="work">Work and craft</option>
      <option value="resilience">Resilience</option>
      <option value="thinking">Thinking clearly</option>
      <option value="life">Life</option>
      <option value="creativity">Creativity</option>
    </select>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="go">New quote</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy</button>
</div>

<div class="result" id="out" aria-live="polite">
  <blockquote class="quote-text" id="quote">—</blockquote>
  <div class="quote-by" id="author"></div>
  <div class="result-note" id="src"></div>
</div>
<p class="notice notice-warn" id="myth" hidden style="margin-top:14px"></p>`,

  css: `
.quote-text{font-size:clamp(1.2rem,1rem+1.2vw,1.6rem);line-height:1.42;font-weight:600;letter-spacing:-.015em;
  color:var(--ink);margin:6px 0 14px;border:none;padding:0;font-style:normal}
.quote-by{font-size:1rem;font-weight:600;color:var(--accent-ink)}
.quote-by::before{content:"— "}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // [theme, quote, author, source, correction or null]
  var QUOTES = [
    ['work','It is not enough to be busy. So are the ants. The question is: what are we busy about?','Henry David Thoreau','Letter to H. G. O. Blake, 1856',null],
    ['work','The secret of getting ahead is getting started.','Mark Twain','Widely attributed','This is very likely not Twain. It appears in print only from the 1970s, long after his death.'],
    ['work','Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.','Antoine de Saint-Exupéry','Terre des Hommes, 1939',null],
    ['work','Simplicity is prerequisite for reliability.','Edsger W. Dijkstra','EWD498, 1975',null],
    ['work','If you want to build a ship, do not drum up people to collect wood. Teach them to long for the endless immensity of the sea.','Antoine de Saint-Exupéry','Paraphrased from Citadelle, 1948','Usually quoted more neatly than he wrote it; the sentiment is his, the phrasing is a translator\\'s.'],
    ['resilience','Fall seven times, stand up eight.','Japanese proverb','七転び八起き (nana korobi ya oki)',null],
    ['resilience','It does not matter how slowly you go as long as you do not stop.','Attributed to Confucius','No known source in the Analects','No Chinese original has ever been found. It is a 20th-century English invention.'],
    ['resilience','I have not failed. I have just found 10,000 ways that will not work.','Thomas Edison','Paraphrase of a remark recorded by his associates','Edison said something close to this, but the famous 10,000 figure grew in the retelling.'],
    ['resilience','Nothing in the world can take the place of persistence.','Calvin Coolidge','Attributed, printed posthumously',null],
    ['thinking','It is the mark of an educated mind to be able to entertain a thought without accepting it.','Attributed to Aristotle','Not found in his works','A 20th-century paraphrase. Aristotle wrote nothing resembling this sentence.'],
    ['thinking','The first principle is that you must not fool yourself, and you are the easiest person to fool.','Richard Feynman','Caltech commencement address, 1974',null],
    ['thinking','It ain\\'t what you don\\'t know that gets you into trouble. It\\'s what you know for sure that just ain\\'t so.','Attributed to Mark Twain','Traced to Josh Billings, 1874','Twain almost certainly never said it. The humourist Josh Billings wrote a close version first.'],
    ['thinking','When the facts change, I change my mind. What do you do, sir?','Attributed to John Maynard Keynes','No contemporary record','Widely quoted, never sourced to anything Keynes actually wrote or was recorded saying.'],
    ['thinking','Extraordinary claims require extraordinary evidence.','Carl Sagan','Cosmos, 1980 — building on Laplace',null],
    ['life','The unexamined life is not worth living.','Socrates, via Plato','Apology, 38a',null],
    ['life','We suffer more often in imagination than in reality.','Seneca','Letters to Lucilius, XIII',null],
    ['life','Everything you have ever wanted is on the other side of fear.','Attributed to George Addair','No verifiable source','Nobody has established who George Addair was, or that he said this.'],
    ['life','Comparison is the thief of joy.','Attributed to Theodore Roosevelt','No record in his papers','Frequently attributed to Roosevelt; no source has ever been produced.'],
    ['life','Tell me, what is it you plan to do with your one wild and precious life?','Mary Oliver','The Summer Day, 1990',null],
    ['creativity','Art is never finished, only abandoned.','Attributed to Leonardo da Vinci','Popularised by Paul Valéry','Valéry wrote it of poems in 1933. The attribution to Leonardo came later.'],
    ['creativity','Steal like an artist.','Austin Kleon','Steal Like an Artist, 2012',null],
    ['creativity','You can\\'t use up creativity. The more you use, the more you have.','Maya Angelou','Interview, 1982',null],
    ['creativity','Have no fear of perfection — you will never reach it.','Salvador Dalí','Attributed, widely printed',null],
    ['work','Anything that is worth doing is worth doing badly at first.','Adapted from G. K. Chesterton','What\\'s Wrong with the World, 1910','Chesterton wrote "worth doing badly", meaning worth doing even imperfectly — often quoted without that context.']
  ];

  var recent = [];

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  function show(){
    var theme = $('theme').value;
    var pool = QUOTES.filter(function(q){ return theme === 'all' || q[0] === theme; });
    var fresh = pool.filter(function(q){ return recent.indexOf(q[1]) === -1; });
    if (!fresh.length) { recent = []; fresh = pool; }

    var q = fresh[randInt(fresh.length)];
    recent.push(q[1]);
    if (recent.length > Math.min(6, pool.length - 1)) recent.shift();

    $('quote').textContent = q[1];
    $('author').textContent = q[2];
    $('src').textContent = q[3];
    $('myth').hidden = !q[4];
    if (q[4]) $('myth').textContent = q[4];
    $('out').dataset.text = '"' + q[1] + '" — ' + q[2];
  }

  $('go').addEventListener('click', show);
  $('theme').addEventListener('change', function(){ recent = []; show(); });
  $('copy').addEventListener('click', function(){
    navigator.clipboard.writeText($('out').dataset.text || '').then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy'; }, 1400);
    });
  });

  show();
})();`,

  answerHeading: 'Most famous quotes are misattributed',
  answer: `<p><strong>A striking share of the quotes circulating online were never said by the person credited.</strong> Einstein, Twain, Churchill, Gandhi and Confucius attract quotations the way lint attracts to a jumper — the quote investigator Garson O'Toole calls this process "reputational drift", where sayings migrate from obscure originators to famous ones because a famous name makes them sound more authoritative. This tool shows the source for each quote, and flags the ones where the popular attribution is known to be wrong.</p>`,

  steps: [
    'Pick a theme, or leave it on anything.',
    'Press for a new quote. The source appears underneath.',
    'A warning appears if the popular attribution is wrong.',
  ],

  sections: [
    {
      id: 'famous-fakes',
      h2: 'Quotes that are not what you think',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Quote</th><th>Usually credited to</th><th>Actually</th></tr></thead>
<tbody>
<tr><td>Be the change you wish to see in the world</td><td>Gandhi</td><td>A paraphrase; he wrote something longer and less catchy</td></tr>
<tr><td>The definition of insanity is doing the same thing twice…</td><td>Einstein</td><td>First appears in 1980s recovery literature</td></tr>
<tr><td>Well-behaved women seldom make history</td><td>Marilyn Monroe</td><td>Historian Laurel Thatcher Ulrich, 1976</td></tr>
<tr><td>Let them eat cake</td><td>Marie Antoinette</td><td>Rousseau, written when she was a child</td></tr>
<tr><td>Elementary, my dear Watson</td><td>Sherlock Holmes</td><td>Never appears in Conan Doyle’s stories</td></tr>
<tr><td>Play it again, Sam</td><td>Casablanca</td><td>The line is “Play it, Sam”</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'checking',
      h2: 'How to check an attribution',
      html: `<p>Three quick tests catch most fakes.</p>
<ul>
<li><strong>Search the exact wording alongside a date range.</strong> If the earliest appearance is decades after the person died, it is not theirs.</li>
<li><strong>Look for the work, not just the name.</strong> A real quote has a book, letter, speech or interview attached. "Attributed to" is a red flag.</li>
<li><strong>Check Quote Investigator or Wikiquote.</strong> Both trace origins properly, and Wikiquote separates sourced quotes from disputed ones.</li>
</ul>
<p>The tell is often the language itself: quotes that sound like modern self-help usually are modern self-help, regardless of whose name is attached.</p>`,
    },
  ],

  faq: [
    { q: 'Are these quotes accurate?', a: '<p>Each shows its source. Where the popular attribution is disputed or wrong, the tool says so rather than repeating it silently.</p>' },
    { q: 'Why include misattributed quotes at all?', a: '<p>Because they are the ones people actually encounter, and knowing the real origin is more interesting than the myth. They are shown with a correction rather than as fact.</p>' },
    { q: 'Can I use these commercially?', a: '<p>Short quotations with attribution are generally fine, but copyright still applies to modern works. For anything commercial involving a living or recently deceased author, check the position.</p>' },
    { q: 'Why do so many quotes get attributed to Einstein?', a: '<p>Because a famous name lends authority. Sayings drift toward well-known figures over time — a pattern documented across Twain, Churchill, Gandhi and Confucius too.</p>' },
  ],

  related: ['random-fact-generator', 'word-counter', 'text-case-converter', 'zodiac-sign-finder'],
};
