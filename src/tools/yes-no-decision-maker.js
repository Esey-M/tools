export default {
  slug: 'yes-no-decision-maker',
  category: 'random',
  title: 'Yes or No – Random Decision Maker',
  h1: 'Yes or No Decision Maker',
  cardText: 'A random yes or no when you genuinely cannot decide.',
  description:
    'Free yes or no decision maker. Ask a question and get a random answer, with an option to weight the odds. Useful for breaking a deadlock, not for real decisions.',
  keywords: ['yes or no', 'decision maker', 'random yes no', 'should i', 'yes no generator'],
  updated: '2026-09-04',
  lede: 'Type your question, press the button, and notice how you feel about the answer. That reaction is usually more useful than the answer itself.',

  form: `
<div class="field">
  <label for="q">Your question</label>
  <input type="text" id="q" placeholder="Should I order the pizza?" maxlength="120" autocomplete="off">
</div>

<div class="field">
  <label for="odds">Odds of yes: <strong id="oddsval">50</strong>%</label>
  <input type="range" id="odds" min="5" max="95" step="5" value="50" style="width:100%;padding:0;border:none;background:transparent">
</div>

<div class="btn-row" style="justify-content:center">
  <button type="button" class="btn btn-lg" id="ask">Decide for me</button>
</div>

<div class="result" id="out" hidden aria-live="polite" style="text-align:center">
  <div class="result-label" id="qlbl"></div>
  <div class="verdict" id="verdict">—</div>
  <div class="result-note" id="note"></div>
</div>
<p class="hint" id="tally" style="margin-top:14px;text-align:center"></p>`,

  css: `
.verdict{font-size:clamp(3rem,2rem+5vw,4.6rem);font-weight:800;letter-spacing:-.04em;line-height:1.05;margin:6px 0}
.verdict.yes{color:var(--accent)}
.verdict.no{color:var(--danger)}
input[type=range]{accent-color:var(--accent);cursor:pointer}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var yes = 0, no = 0;

  var YES_NOTES = [
    'Go on then.', 'The universe says so.', 'Seems reasonable.',
    'No reason not to.', 'That settles it.', 'Do it.'
  ];
  var NO_NOTES = [
    'Maybe another time.', 'Best not.', 'Leave it.',
    'The answer is no, and that is fine.', 'Not today.', 'Give it a miss.'
  ];

  function randFloat(){
    var buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  function pick(arr){ return arr[Math.floor(randFloat() * arr.length)]; }

  $('odds').addEventListener('input', function(){ $('oddsval').textContent = this.value; });

  $('ask').addEventListener('click', function(){
    var threshold = parseInt($('odds').value, 10) / 100;
    var isYes = randFloat() < threshold;
    if (isYes) yes++; else no++;

    var q = $('q').value.trim();
    $('qlbl').textContent = q || 'The answer is';
    $('verdict').textContent = isYes ? 'YES' : 'NO';
    $('verdict').className = 'verdict ' + (isYes ? 'yes' : 'no');
    $('note').textContent = pick(isYes ? YES_NOTES : NO_NOTES) +
      (threshold !== 0.5 ? '  (odds were ' + $('odds').value + '% yes)' : '');
    $('out').hidden = false;
    $('tally').textContent = 'This session: ' + yes + ' yes · ' + no + ' no';
  });

  $('q').addEventListener('keydown', function(e){ if (e.key === 'Enter') $('ask').click(); });
})();`,

  answerHeading: 'Why flipping a coin actually helps',
  answer: `<p><strong>The value of a random answer is not the answer — it is your reaction to it.</strong> When the screen says NO and you feel a flash of disappointment, you have just learned that you wanted YES. Economist Steven Levitt ran a large experiment where people facing genuine dilemmas let a coin flip decide; those told to make the change reported being measurably happier six months later, suggesting most people are too cautious when they are stuck. Use this to surface your preference, not to replace it.</p>`,

  steps: [
    'Type the question you are stuck on. It is optional, but naming it helps.',
    'Adjust the odds if you want to weight it — 70% yes if you are looking for a push.',
    'Press the button, then pay attention to how the answer makes you feel.',
  ],

  sections: [
    {
      id: 'when',
      h2: 'When randomness is the right tool',
      html: `<p>A coin flip is genuinely useful in a narrow set of situations, and actively harmful outside them.</p>
<ul>
<li><strong>The options are near-equivalent.</strong> If you have thought it through and cannot separate them, further deliberation is just cost. Pick one and move on.</li>
<li><strong>The decision is reversible and cheap.</strong> Which restaurant, which film, which of two similar jackets.</li>
<li><strong>You are stuck in analysis.</strong> The random answer breaks the loop, and your gut reaction to it tells you what you actually wanted.</li>
<li><strong>The group is deadlocked.</strong> Randomness is at least visibly fair, which beats whoever argues longest winning.</li>
</ul>
<p>It is the wrong tool for anything expensive, irreversible, or affecting other people — jobs, money, relationships, health. For those, the reaction test still works, but the decision needs actual reasoning.</p>`,
    },
    {
      id: 'levitt',
      h2: 'The coin flip experiment',
      html: `<p>In 2013 the economist Steven Levitt set up a website where people facing real dilemmas — quit the job, end the relationship, move city — could have a coin flip decide, and agreed to be surveyed later.</p>
<p>More than 20,000 flips took place. Among people whose flip told them to make the change, the ones who followed it reported being significantly happier two and six months on than those who stayed put.</p>
<p>The obvious caveat is that participants self-selected and were not truly randomised in what they did afterwards. But the direction of the result is consistent with a well-documented bias: when a decision is genuinely close, people systematically over-weight the status quo.</p>`,
    },
  ],

  faq: [
    { q: 'Is the answer really random?', a: '<p>Yes. It uses your browser’s cryptographic random source, so at 50/50 each answer has exactly even odds and previous answers have no influence on the next one.</p>' },
    { q: 'Why would I weight the odds?', a: '<p>Because sometimes you want a nudge rather than a verdict. Setting 70% yes acknowledges that you are leaning one way while still leaving room to be told otherwise.</p>' },
    { q: 'Should I use this for important decisions?', a: '<p>Not for the decision itself. Use it to surface your instinct — press the button and notice whether you feel relief or disappointment — then decide properly.</p>' },
    { q: 'Why do I keep getting the same answer?', a: '<p>Randomness produces streaks far more often than intuition expects. Six identical results in a row will happen in a long session, and it does not mean the tool is stuck.</p>' },
    { q: 'Is my question saved?', a: '<p>No. It stays in your browser and disappears when you close the page.</p>' },
  ],

  related: ['coin-flip', 'random-name-picker', 'dice-roller', 'what-to-eat-picker'],
};
