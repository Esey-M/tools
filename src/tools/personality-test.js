export default {
  slug: 'personality-test',
  category: 'fun',
  title: 'Personality Test – Free Big Five, No Email Required',
  h1: 'Personality Test',
  cardText: 'A 20-question Big Five test — the model psychologists actually use.',
  description:
    'Free Big Five personality test. Twenty questions, five traits, results explained honestly — including what the scores do and do not predict. No email required.',
  keywords: ['personality test', 'big five test', 'free personality quiz', 'ocean personality', 'personality traits test'],
  updated: '2026-09-04',
  disclaimer: 'A brief self-report questionnaire, not a clinical assessment.',
  lede: 'Twenty statements, about three minutes. This uses the Big Five, which is the model personality researchers actually use — unlike the four-letter type tests, which they largely do not.',

  form: `
<div id="intro">
  <div class="notice" style="background:var(--bg-sunken);border-color:var(--line)">
    Answer honestly rather than aspirationally — how you <em>are</em>, not how you would like to be. There are no good or bad scores. Nothing you enter is stored or sent anywhere.
  </div>
  <div class="btn-row" style="margin-top:16px">
    <button type="button" class="btn btn-lg" id="start">Start the test</button>
  </div>
</div>

<div id="quiz" hidden>
  <p class="hint" id="progress"></p>
  <div class="pq-progress"><span id="bar"></span></div>
  <p class="pq-statement" id="statement"></p>
  <div class="pq-options" id="options"></div>
  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn btn-ghost" id="back">Back</button>
  </div>
</div>

<div id="result" hidden>
  <div class="result">
    <div class="result-label">Your profile</div>
    <div class="result-value" id="headline" style="font-size:1.6rem">—</div>
  </div>
  <div id="traits" class="pq-traits"></div>
  <div class="btn-row" style="margin-top:18px">
    <button type="button" class="btn btn-ghost" id="copy">Copy results</button>
    <button type="button" class="btn btn-ghost" id="again">Take it again</button>
  </div>
</div>`,

  css: `
.pq-progress{height:7px;background:var(--bg-sunken);border:1px solid var(--line);border-radius:999px;
  overflow:hidden;margin:8px 0 22px}
.pq-progress span{display:block;height:100%;width:0;background:var(--accent);border-radius:999px;transition:width .25s}
.pq-statement{font-size:clamp(1.1rem,1rem+1vw,1.4rem);font-weight:600;line-height:1.4;text-align:center;
  margin:10px 0 20px;min-height:2.8em;display:grid;place-items:center}
.pq-options{display:grid;gap:8px;max-width:480px;margin:0 auto}
.pq-options button{padding:13px 16px;border:1px solid var(--line-strong);background:var(--bg-raised);
  border-radius:var(--radius);font-size:.98rem;cursor:pointer;color:var(--ink);text-align:left}
.pq-options button:hover{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)}
.pq-traits{margin-top:20px;display:flex;flex-direction:column;gap:16px}
.pq-trait{background:var(--bg-raised);border:1px solid var(--line);border-radius:var(--radius);padding:16px 18px}
.pq-trait .th{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:9px}
.pq-trait .th b{font-size:1.02rem;font-weight:660}
.pq-trait .th span{font-size:.88rem;color:var(--ink-3);font-variant-numeric:tabular-nums}
.pq-bar{height:9px;border-radius:999px;background:var(--bg-sunken);border:1px solid var(--line);overflow:hidden}
.pq-bar i{display:block;height:100%;border-radius:999px;background:var(--accent);transition:width .5s}
.pq-trait p{font-size:.92rem;color:var(--ink-2);margin-top:10px}
.pq-poles{display:flex;justify-content:space-between;font-size:.74rem;color:var(--ink-3);margin-top:5px}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // [statement, trait, reverse-scored]
  var ITEMS = [
    ['I start conversations with people I do not know.', 'E', false],
    ['I prefer a quiet evening in to a busy social event.', 'E', true],
    ['I feel energised after spending time in a large group.', 'E', false],
    ['I tend to stay in the background at gatherings.', 'E', true],
    ['I go out of my way to make people feel at ease.', 'A', false],
    ['I am quick to point out when someone is wrong.', 'A', true],
    ['I trust that most people mean well.', 'A', false],
    ['I find it hard to sympathise with people who caused their own problems.', 'A', true],
    ['I finish what I start, even when it stops being interesting.', 'C', false],
    ['I leave things until the last minute.', 'C', true],
    ['I like having a plan before I begin.', 'C', false],
    ['My workspace is usually a mess.', 'C', true],
    ['I worry about things that might go wrong.', 'N', false],
    ['I stay calm under pressure.', 'N', true],
    ['My mood changes noticeably through the day.', 'N', false],
    ['I rarely feel embarrassed.', 'N', true],
    ['I enjoy ideas and theories for their own sake.', 'O', false],
    ['I prefer familiar routines to trying something new.', 'O', true],
    ['I notice beauty in things other people walk past.', 'O', false],
    ['I have little interest in abstract discussion.', 'O', true]
  ];

  var SCALE = [
    ['Strongly disagree', 1], ['Disagree', 2], ['Neither', 3], ['Agree', 4], ['Strongly agree', 5]
  ];

  var TRAITS = {
    O: { name: 'Openness to experience', low: 'Practical, conventional', high: 'Curious, imaginative',
         desc: 'How drawn you are to new ideas, art, and unfamiliar experiences. High scorers enjoy abstraction and novelty; low scorers prefer the concrete and the proven. Neither is better — it predicts what you enjoy, not how capable you are.' },
    C: { name: 'Conscientiousness', low: 'Flexible, spontaneous', high: 'Organised, dependable',
         desc: 'How much you plan, persist and follow through. This is the trait with the strongest link to job performance and academic outcomes across almost every role studied, though very high scores can tip into inflexibility.' },
    E: { name: 'Extraversion', low: 'Reserved, reflective', high: 'Outgoing, energetic',
         desc: 'Where your energy comes from and how much external stimulation you seek. It is not the same as shyness or social skill — plenty of introverts are socially confident and simply find crowds draining.' },
    A: { name: 'Agreeableness', low: 'Direct, questioning', high: 'Warm, cooperative',
         desc: 'How much you prioritise harmony and others’ needs. High scorers are trusting and accommodating; low scorers are more sceptical and comfortable with conflict, which is genuinely useful in negotiation and quality control.' },
    N: { name: 'Neuroticism', low: 'Calm, even', high: 'Sensitive, reactive',
         desc: 'How readily you experience negative emotion. High scorers feel stress and worry more intensely, which is uncomfortable but comes with greater vigilance to real problems. This is the trait most responsive to circumstances, sleep and therapy.' }
  };

  var index = 0, answers = [];

  function render(){
    var item = ITEMS[index];
    $('progress').textContent = 'Question ' + (index + 1) + ' of ' + ITEMS.length;
    $('bar').style.width = (index / ITEMS.length * 100) + '%';
    $('statement').textContent = item[0];
    $('options').innerHTML = SCALE.map(function(s){
      var chosen = answers[index] === s[1];
      return '<button type="button" data-v="' + s[1] + '"' +
        (chosen ? ' style="border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)"' : '') +
        '>' + s[0] + '</button>';
    }).join('');
    $('back').disabled = index === 0;
  }

  function answer(value){
    answers[index] = value;
    if (index < ITEMS.length - 1) { index++; render(); }
    else finish();
  }

  function finish(){
    var totals = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    var counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    ITEMS.forEach(function(item, i){
      var score = answers[i] || 3;
      if (item[2]) score = 6 - score;          // reverse-scored item
      totals[item[1]] += score;
      counts[item[1]]++;
    });

    var percents = {};
    Object.keys(totals).forEach(function(k){
      // Convert to 0-100 across the possible range for that trait's items.
      var min = counts[k], max = counts[k] * 5;
      percents[k] = Math.round((totals[k] - min) / (max - min) * 100);
    });

    $('quiz').hidden = true;
    $('result').hidden = false;

    var order = ['O', 'C', 'E', 'A', 'N'];
    var strongest = order.slice().sort(function(a, b){
      return Math.abs(percents[b] - 50) - Math.abs(percents[a] - 50);
    })[0];
    var t = TRAITS[strongest];
    $('headline').textContent = 'Most distinctive: ' + t.name.toLowerCase() +
      ' (' + (percents[strongest] >= 50 ? 'high' : 'low') + ')';

    $('traits').innerHTML = order.map(function(k){
      var p = percents[k];
      var band = p >= 70 ? 'high' : p >= 55 ? 'somewhat high' : p >= 45 ? 'around average' : p >= 30 ? 'somewhat low' : 'low';
      return '<div class="pq-trait"><div class="th"><b>' + TRAITS[k].name + '</b><span>' + p + ' / 100 · ' + band + '</span></div>' +
        '<div class="pq-bar"><i style="width:' + p + '%"></i></div>' +
        '<div class="pq-poles"><span>' + TRAITS[k].low + '</span><span>' + TRAITS[k].high + '</span></div>' +
        '<p>' + TRAITS[k].desc + '</p></div>';
    }).join('');

    $('result').dataset.text = order.map(function(k){
      return TRAITS[k].name + ': ' + percents[k] + '/100';
    }).join('\\n');
  }

  $('start').addEventListener('click', function(){
    $('intro').hidden = true; $('quiz').hidden = false;
    index = 0; answers = [];
    render();
  });
  $('options').addEventListener('click', function(e){
    var b = e.target.closest('button[data-v]'); if (!b) return;
    answer(parseInt(b.getAttribute('data-v'), 10));
  });
  $('back').addEventListener('click', function(){ if (index > 0) { index--; render(); } });
  $('again').addEventListener('click', function(){
    $('result').hidden = true; $('intro').hidden = false;
  });
  $('copy').addEventListener('click', function(){
    navigator.clipboard.writeText($('result').dataset.text || '').then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy results'; }, 1400);
    });
  });
})();`,

  answerHeading: 'Why the Big Five and not the four-letter one',
  answer: `<p><strong>The Big Five emerged from decades of research into how people actually describe personality; the popular four-letter type indicator did not.</strong> Researchers repeatedly analysed personality words across languages and found the same five dimensions surfacing: openness, conscientiousness, extraversion, agreeableness and neuroticism. Crucially the Big Five uses continuous scales, because traits are distributed like height — most people sit near the middle. Type indicators force a binary split, which is why roughly half of people get a different result when retested weeks later.</p>`,

  steps: [
    'Press start and answer twenty statements.',
    'Answer how you actually are, not how you would like to be.',
    'You get five scores out of 100, each with what it does and does not mean.',
  ],

  sections: [
    {
      id: 'traits',
      h2: 'The five traits',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Trait</th><th>Low</th><th>High</th></tr></thead>
<tbody>
<tr><td>Openness</td><td>Practical, prefers the familiar</td><td>Curious, drawn to ideas and novelty</td></tr>
<tr><td>Conscientiousness</td><td>Flexible, spontaneous</td><td>Organised, persistent</td></tr>
<tr><td>Extraversion</td><td>Reserved, energised by solitude</td><td>Outgoing, energised by people</td></tr>
<tr><td>Agreeableness</td><td>Direct, sceptical</td><td>Warm, cooperative</td></tr>
<tr><td>Neuroticism</td><td>Emotionally even</td><td>Reactive, feels stress keenly</td></tr>
</tbody></table></div>
<p>Only one trait has a consistent direction of advantage: conscientiousness predicts job and academic performance across nearly every context studied. The rest are trade-offs. Low agreeableness is a liability in a caring role and an asset in negotiation. High openness suits research and hinders repetitive precision work.</p>`,
    },
    {
      id: 'limits',
      h2: 'What a score like this is worth',
      html: `<p>Some honest framing, because personality tests are routinely oversold.</p>
<ul>
<li><strong>Twenty items is short.</strong> Research instruments use 60 to 300. This gives a reasonable indication, not a precise measurement.</li>
<li><strong>It is self-report.</strong> It measures how you see yourself today, which is affected by mood, recent events and how you would like to be seen.</li>
<li><strong>Traits are stable but not fixed.</strong> They shift gradually across a lifetime — conscientiousness and agreeableness tend to rise with age, neuroticism to fall.</li>
<li><strong>They predict tendencies, not behaviour.</strong> Personality accounts for a modest share of what any individual does in a given situation. Context does much of the rest.</li>
<li><strong>Do not use it to hire people.</strong> Brief self-report tests are poor selection tools and are easily gamed by anyone who wants the job.</li>
</ul>
<p>The useful output is not a label. It is noticing where you sit far from the middle, and what that predictably makes easier and harder for you.</p>`,
    },
  ],

  faq: [
    { q: 'Is the Big Five scientifically valid?', a: '<p>It is the most empirically supported personality model, replicated across languages and cultures, with meaningful correlations to life outcomes. It is not a complete account of a person, and no personality model is.</p>' },
    { q: 'Why not the 16-type test?', a: '<p>Because its reliability is poor — a large share of people get a different type on retest a few weeks later — and its binary categories do not match how traits are actually distributed. It is enjoyable; it is not measurement.</p>' },
    { q: 'Can my personality change?', a: '<p>Gradually, yes. Traits are relatively stable over months but shift across decades, and deliberate effort can move them somewhat. Neuroticism in particular responds to circumstances, sleep and therapy.</p>' },
    { q: 'Is a high score better?', a: '<p>Only for conscientiousness, which predicts performance fairly consistently. Everything else is a trade-off with real advantages at both ends.</p>' },
    { q: 'Are my answers stored?', a: '<p>No. Everything happens in your browser and nothing is transmitted, stored or emailed. There is no address to enter.</p>' },
    { q: 'Why do some questions seem reversed?', a: '<p>Deliberately. Reverse-scored items catch people agreeing with everything out of habit, which is a well-documented response bias. Half the items in each trait are worded the other way round.</p>' },
  ],

  related: ['zodiac-sign-finder', 'random-fact-generator', 'quote-generator', 'typing-speed-test'],
};
