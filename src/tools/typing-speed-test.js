export default {
  slug: 'typing-speed-test',
  category: 'fun',
  title: 'Typing Speed Test – Words Per Minute and Accuracy',
  h1: 'Typing Speed Test',
  cardText: 'Measure your words per minute and accuracy in one minute.',
  description:
    'Free typing speed test. Measure your words per minute and accuracy on a one-minute test, with results compared against average typing speeds.',
  keywords: ['typing speed test', 'wpm test', 'typing test', 'words per minute', 'how fast do i type'],
  updated: '2026-09-04',
  lede: 'Start typing the passage below and the timer begins. Your speed and accuracy update live.',

  form: `
<div class="row" style="margin-bottom:14px">
  <div class="field">
    <label for="dur">Test length</label>
    <select id="dur">
      <option value="30">30 seconds</option>
      <option value="60" selected>1 minute</option>
      <option value="120">2 minutes</option>
    </select>
  </div>
  <div class="field">
    <label for="diff">Difficulty</label>
    <select id="diff">
      <option value="easy">Easy — common words</option>
      <option value="normal" selected>Normal — plain prose</option>
      <option value="hard">Hard — punctuation and numbers</option>
    </select>
  </div>
</div>

<div class="type-box" id="passage" aria-hidden="true"></div>
<label for="input" class="vh">Type the passage shown above</label>
<textarea id="input" rows="3" placeholder="Click here and start typing…" autocomplete="off"
  autocorrect="off" autocapitalize="off" spellcheck="false" style="min-height:78px"></textarea>

<div class="btn-row" style="margin-top:12px">
  <button type="button" class="btn btn-ghost" id="restart">Restart</button>
</div>

<dl class="result-grid" style="margin-top:18px">
  <div class="stat"><dt>Words per minute</dt><dd id="wpm">0</dd></div>
  <div class="stat"><dt>Accuracy</dt><dd id="acc">100%</dd></div>
  <div class="stat"><dt>Time left</dt><dd id="left">60s</dd></div>
  <div class="stat"><dt>Characters</dt><dd id="chars">0</dd></div>
</dl>

<div class="result" id="out" hidden aria-live="polite">
  <div class="result-label">Final result</div>
  <div class="result-value" id="final">—</div>
  <div class="result-note" id="verdict"></div>
</div>`,

  css: `
.type-box{background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:16px 18px;font-size:1.08rem;line-height:1.75;margin-bottom:12px;
  font-family:var(--font-num);letter-spacing:.01em;max-height:190px;overflow-y:auto}
.type-box span.ok{color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,transparent)}
.type-box span.bad{color:var(--danger);background:color-mix(in srgb,var(--danger) 15%,transparent);border-radius:2px}
.type-box span.cur{border-bottom:2px solid var(--accent);animation:blink 1s step-end infinite}
@keyframes blink{50%{border-color:transparent}}
@media (prefers-reduced-motion: reduce){.type-box span.cur{animation:none}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  var TEXTS = {
    easy: 'the quick brown fox jumps over the lazy dog while a small bird sings in the old oak tree near the river where children play on warm summer days and the sun sets behind the hills in a soft orange glow that fades to night',
    normal: 'Good writing is mostly rewriting. The first draft exists to get the idea out of your head and onto the page, where you can see whether it holds together. Almost nobody produces clear prose on the first attempt, and the ones who appear to have simply learned to revise quickly. The work is in the cutting.',
    hard: 'In 2024, roughly 68% of the 1,250 respondents said they preferred the "quiet" option — a result that surprised the researchers, who had expected closer to 40%. The study (published in Vol. 12, No. 3) cost $84,000 and took 18 months; its authors note that self-reported data is, as ever, imperfect.'
  };

  var text = '', started = false, startTime = 0, timer = null, finished = false;

  function render(){
    var typed = $('input').value;
    var html = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i] === ' ' ? '&nbsp;' : text[i].replace(/[<>&]/g, function(c){
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c];
      });
      if (i < typed.length) html += '<span class="' + (typed[i] === text[i] ? 'ok' : 'bad') + '">' + ch + '</span>';
      else if (i === typed.length) html += '<span class="cur">' + ch + '</span>';
      else html += ch;
    }
    $('passage').innerHTML = html;
  }

  function stats(){
    var typed = $('input').value;
    var correct = 0;
    for (var i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
    var elapsed = started ? (Date.now() - startTime) / 1000 : 0;
    // Standard WPM: one "word" is five correct characters.
    var wpm = elapsed > 0 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
    var acc = typed.length ? Math.round(correct / typed.length * 100) : 100;
    $('wpm').textContent = wpm;
    $('acc').textContent = acc + '%';
    $('chars').textContent = typed.length;
    return { wpm: wpm, acc: acc };
  }

  function verdictFor(wpm){
    if (wpm < 20) return 'Below average — worth practising touch typing.';
    if (wpm < 35) return 'Slower than average. Most adults type around 40 wpm.';
    if (wpm < 45) return 'About average for an adult.';
    if (wpm < 60) return 'Above average — comfortably productive.';
    if (wpm < 80) return 'Fast. Around professional typist level.';
    if (wpm < 100) return 'Very fast — top few percent.';
    return 'Exceptional. Competitive typing territory.';
  }

  function finish(){
    finished = true;
    clearInterval(timer);
    var s = stats();
    $('input').disabled = true;
    $('final').textContent = s.wpm + ' wpm at ' + s.acc + '% accuracy';
    $('verdict').textContent = verdictFor(s.wpm);
    $('out').hidden = false;
  }

  function tick(){
    var limit = parseInt($('dur').value, 10);
    var left = Math.max(0, limit - (Date.now() - startTime) / 1000);
    $('left').textContent = Math.ceil(left) + 's';
    stats();
    if (left <= 0) finish();
  }

  function reset(){
    clearInterval(timer);
    started = false; finished = false;
    text = TEXTS[$('diff').value];
    $('input').value = ''; $('input').disabled = false;
    $('out').hidden = true;
    $('wpm').textContent = '0'; $('acc').textContent = '100%'; $('chars').textContent = '0';
    $('left').textContent = $('dur').value + 's';
    render();
  }

  $('input').addEventListener('input', function(){
    if (finished) return;
    if (!started) {
      started = true;
      startTime = Date.now();
      timer = setInterval(tick, 100);
    }
    render();
    stats();
    if (this.value.length >= text.length) finish();
  });

  $('restart').addEventListener('click', reset);
  $('dur').addEventListener('change', reset);
  $('diff').addEventListener('change', reset);
  reset();
})();`,

  answerHeading: 'How typing speed is measured',
  answer: `<p><strong>Words per minute counts every five correct characters as one word, including spaces.</strong> This convention exists because real words vary enormously in length — counting actual words would let someone typing "a an it is" score higher than someone typing "extraordinary". Accuracy is measured separately, as the share of keystrokes that matched. The two matter together: 80 wpm at 85% accuracy is slower in practice than 60 wpm at 99%, because every error costs time to find and fix.</p>`,

  steps: [
    'Choose a test length and difficulty.',
    'Click into the box and start typing. The timer starts on your first keystroke.',
    'Type the passage as it appears — correct characters turn green, mistakes turn red.',
    'The test ends when the time runs out or you finish the passage.',
  ],

  sections: [
    {
      id: 'benchmarks',
      h2: 'How fast is fast?',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Speed</th><th>Level</th></tr></thead>
<tbody>
<tr><td>Under 20 wpm</td><td>Hunt and peck</td></tr>
<tr><td>30–40 wpm</td><td>Typical adult</td></tr>
<tr><td>40–50 wpm</td><td>Comfortable touch typist</td></tr>
<tr><td>60–70 wpm</td><td>Professional standard; many admin roles ask for this</td></tr>
<tr><td>80–95 wpm</td><td>Fast — top few percent</td></tr>
<tr><td>100+ wpm</td><td>Competitive territory</td></tr>
</tbody></table></div>
<p>For context, the record on standard keyboards sits above 200 wpm on short passages. Sustained speeds over 120 wpm are rare and almost always come from years of touch typing rather than natural aptitude.</p>`,
    },
    {
      id: 'improve',
      h2: 'Getting faster',
      html: `<p>The gains come in a predictable order, and most people stall because they skip the first one.</p>
<ul>
<li><strong>Learn touch typing properly.</strong> Fingers on the home row, eyes on the screen. It will feel much slower for a week or two, then overtake your old speed permanently.</li>
<li><strong>Prioritise accuracy over speed.</strong> Errors cost more time than slow keystrokes, and practising at 99% accuracy builds better habits than racing at 90%.</li>
<li><strong>Practise in short sessions.</strong> Fifteen focused minutes beats an hour of fatigue.</li>
<li><strong>Do not look down.</strong> Cover your hands if you have to. Glancing is the single biggest thing that caps progress.</li>
<li><strong>Work on the awkward pairs.</strong> Most people have a handful of specific transitions they consistently fumble. Drill those rather than generic passages.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'What is a good typing speed?', a: '<p>Around 40 wpm is average for an adult. 60 to 70 wpm is a common professional standard, and anything above 80 puts you in the top few percent.</p>' },
    { q: 'How is WPM calculated?', a: '<p>Correct characters divided by five, divided by elapsed minutes. The five-character convention makes scores comparable regardless of whether the passage happens to use long or short words.</p>' },
    { q: 'Do mistakes count against my speed?', a: '<p>Yes. Only correct characters count toward WPM, so errors reduce your score directly as well as showing in the accuracy figure.</p>' },
    { q: 'Why is my speed lower here than on other tests?', a: '<p>Tests differ in how they handle errors. Some count all typed characters regardless of accuracy, which inflates results. This test counts only correct characters, which is the stricter and more meaningful measure.</p>' },
    { q: 'How long does it take to learn touch typing?', a: '<p>Most people reach their previous speed within two to three weeks of consistent practice, and exceed it clearly by two months. The temporary slowdown at the start is what stops most people, and it is worth pushing through.</p>' },
  ],

  related: ['word-counter', 'text-case-converter', 'countdown-timer', 'random-fact-generator'],
};
