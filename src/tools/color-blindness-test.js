export default {
  slug: 'color-blindness-test',
  category: 'health',
  title: 'Colour Blindness Test – Quick Ishihara-Style Screening',
  h1: 'Colour Blindness Test',
  cardText: 'A quick screening test for red-green colour vision deficiency.',
  description:
    'Free online colour blindness test. Answer a short set of Ishihara-style plates to screen for red-green colour vision deficiency, with results explained.',
  keywords: ['color blindness test', 'colour blind test', 'ishihara test online', 'am i colorblind', 'red green colour blind'],
  updated: '2026-09-04',
  disclaimer: 'A screening indication only. Screen colours are not calibrated — a proper diagnosis needs an optometrist with printed plates.',
  lede: 'Eight plates, about a minute. This is a screen, not a diagnosis — your screen’s colour rendering alone makes it unreliable as a clinical test.',

  form: `
<div id="intro">
  <div class="notice" style="background:var(--bg-sunken);border-color:var(--line)">
    <strong>Before you start:</strong> view this on a screen at normal brightness, not in direct sunlight, and do not adjust colour settings or use night mode. Look at each plate for a few seconds and answer with your first impression.
  </div>
  <div class="btn-row" style="margin-top:16px">
    <button type="button" class="btn btn-lg" id="start">Start the test</button>
  </div>
</div>

<div id="test" hidden>
  <p class="hint" id="progress"></p>
  <div class="cb-plate" id="plate"></div>
  <p class="cb-q" id="question"></p>
  <div class="cb-options" id="options"></div>
  <div class="btn-row" style="margin-top:14px">
    <button type="button" class="btn btn-ghost" id="skip">I cannot tell</button>
  </div>
</div>

<div id="result" hidden>
  <div class="result">
    <div class="result-label">Result</div>
    <div class="result-value" id="score" style="font-size:2rem">—</div>
    <div class="result-note" id="verdict"></div>
  </div>
  <div id="breakdown" style="margin-top:18px"></div>
  <div class="btn-row" style="margin-top:16px">
    <button type="button" class="btn" id="again">Take it again</button>
  </div>
</div>`,

  css: `
.cb-plate{margin:20px auto;width:300px;height:300px;max-width:100%;border-radius:50%;overflow:hidden;
  background:#e8e2d2;display:grid;place-items:center}
.cb-plate svg{width:100%;height:100%;display:block}
.cb-q{text-align:center;font-size:1.05rem;font-weight:560;margin-bottom:14px}
.cb-options{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));max-width:440px;margin:0 auto}
.cb-options button{padding:14px 10px;border:1px solid var(--line-strong);background:var(--bg-raised);
  border-radius:var(--radius);font-size:1.15rem;font-weight:660;cursor:pointer;color:var(--ink)}
.cb-options button:hover{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)}
.cb-row{display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:var(--radius-sm);
  background:var(--bg-raised);border:1px solid var(--line);font-size:.9rem;margin-bottom:6px}
.cb-row .mark{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;
  font-size:.78rem;font-weight:700;color:#fff}
.cb-row .mark.ok{background:var(--accent)}
.cb-row .mark.no{background:var(--danger)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };

  // Each plate: the digit shown, the digit a red-green deficient viewer typically
  // reports, the option set, and the two dot palettes.
  var PLATES = [
    { normal: '12', deficient: '12', options: ['12','17','70','nothing'], fig: '#c4623a', bg: '#b9a86a', note: 'Everyone should see 12 — this checks the test is displaying correctly.' },
    { normal: '8',  deficient: '3',  options: ['8','3','5','nothing'],    fig: '#7d9c4a', bg: '#c98a63', note: 'Red-green deficiency often reads 3.' },
    { normal: '29', deficient: '70', options: ['29','70','20','nothing'], fig: '#6e9b52', bg: '#c47f5e', note: 'Commonly read as 70 with red-green deficiency.' },
    { normal: '5',  deficient: '2',  options: ['5','2','3','nothing'],    fig: '#5f9455', bg: '#cf8a5c', note: 'Often read as 2.' },
    { normal: '74', deficient: '21', options: ['74','21','71','nothing'], fig: '#78a04e', bg: '#c67d5f', note: 'Frequently read as 21.' },
    { normal: '6',  deficient: 'nothing', options: ['6','8','9','nothing'], fig: '#8aa957', bg: '#c9855f', note: 'Often not visible at all with red-green deficiency.' },
    { normal: '45', deficient: 'nothing', options: ['45','15','40','nothing'], fig: '#6d9b58', bg: '#cb8760', note: 'Often not visible with red-green deficiency.' },
    { normal: '7',  deficient: 'nothing', options: ['7','1','4','nothing'], fig: '#7fa254', bg: '#c78462', note: 'Often not visible with red-green deficiency.' }
  ];

  var index = 0, answers = [];

  function rand(seed){
    // Deterministic pseudo-random so each plate looks the same every time.
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function makePlate(p, seed){
    // Dots inside the digit glyph take the figure palette; the rest take the background.
    var size = 300, dots = '';
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    var c = canvas.getContext('2d');
    c.fillStyle = '#000';
    c.font = '700 ' + (p.normal.length > 1 ? 150 : 190) + 'px ui-sans-serif, system-ui, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(p.normal, size / 2, size / 2 + 6);
    var mask = c.getImageData(0, 0, size, size).data;

    var placed = [];
    var n = 0, tries = 0;
    while (n < 850 && tries < 24000) {
      tries++;
      var s = tries * 0.7311;
      var x = rand(s) * size, y = rand(s + 0.5) * size;
      var r = 4 + rand(s + 1.7) * 6;
      var dx = x - size / 2, dy = y - size / 2;
      if (Math.sqrt(dx * dx + dy * dy) > size / 2 - r - 2) continue;

      var clash = false;
      for (var i = placed.length - 1; i >= 0 && i > placed.length - 90; i--) {
        var q = placed[i];
        var d = Math.hypot(q[0] - x, q[1] - y);
        if (d < q[2] + r + 1.4) { clash = true; break; }
      }
      if (clash) continue;

      var idx = ((Math.round(y) * size) + Math.round(x)) * 4 + 3;
      var inFigure = mask[idx] > 128;
      var base = inFigure ? p.fig : p.bg;
      // Vary lightness so brightness cannot give the digit away.
      var vary = (rand(s + 3.1) - 0.5) * 34;
      placed.push([x, y, r]);
      dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) +
        '" fill="' + shift(base, vary) + '"/>';
      n++;
    }
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Colour vision test plate">' +
      '<rect width="' + size + '" height="' + size + '" fill="#e8e2d2"/>' + dots + '</svg>';
  }

  function shift(hex, amount){
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var f = function(v){ return Math.max(0, Math.min(255, Math.round(v + amount))); };
    return '#' + [f(r), f(g), f(b)].map(function(v){ return ('0' + v.toString(16)).slice(-2); }).join('');
  }

  function showPlate(){
    var p = PLATES[index];
    $('progress').textContent = 'Plate ' + (index + 1) + ' of ' + PLATES.length;
    $('plate').innerHTML = makePlate(p, index);
    $('question').textContent = 'What number do you see?';
    $('options').innerHTML = p.options.map(function(o){
      return '<button type="button" data-a="' + o + '">' + (o === 'nothing' ? 'Nothing' : o) + '</button>';
    }).join('');
  }

  function answer(value){
    answers.push({ plate: PLATES[index], given: value });
    index++;
    if (index >= PLATES.length) finish(); else showPlate();
  }

  function finish(){
    var correct = answers.filter(function(a){ return a.given === a.plate.normal; }).length;
    var deficientMatches = answers.filter(function(a){
      return a.given !== a.plate.normal && a.given === a.plate.deficient;
    }).length;

    $('test').hidden = true;
    $('result').hidden = false;
    $('score').textContent = correct + ' of ' + PLATES.length + ' read normally';

    var verdict;
    if (correct >= 7) verdict = 'This suggests normal colour vision. Nothing here indicates a red-green deficiency.';
    else if (correct >= 5) verdict = 'Mostly normal, with a few misread plates. Screen rendering or lighting can cause this — worth repeating on a different screen before drawing conclusions.';
    else verdict = 'Several plates were read the way someone with red-green colour vision deficiency typically reads them. That is worth following up with an optometrist, who can test properly with printed plates.';
    if (deficientMatches >= 3) verdict += ' ' + deficientMatches + ' of your answers matched the pattern associated with red-green deficiency specifically.';
    $('verdict').textContent = verdict;

    $('breakdown').innerHTML = answers.map(function(a, i){
      var ok = a.given === a.plate.normal;
      return '<div class="cb-row"><span class="mark ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '×') + '</span>' +
        '<span>Plate ' + (i + 1) + ': you said <strong>' + (a.given === 'nothing' ? 'nothing' : a.given) +
        '</strong>, normal colour vision reads <strong>' + a.plate.normal + '</strong>. ' + a.plate.note + '</span></div>';
    }).join('');
  }

  $('start').addEventListener('click', function(){
    $('intro').hidden = true; $('test').hidden = false;
    index = 0; answers = [];
    showPlate();
  });
  $('options').addEventListener('click', function(e){
    var b = e.target.closest('button[data-a]'); if (!b) return;
    answer(b.getAttribute('data-a'));
  });
  $('skip').addEventListener('click', function(){ answer('nothing'); });
  $('again').addEventListener('click', function(){
    $('result').hidden = true; $('intro').hidden = false;
  });
})();`,

  answerHeading: 'What this test can and cannot tell you',
  answer: `<p><strong>It can suggest whether you may have a red-green colour vision deficiency. It cannot diagnose one.</strong> Ishihara plates were designed as printed cards under standard lighting, and every screen renders colour differently — brightness, colour profile, night mode and ambient light all shift the result. A proper assessment uses calibrated printed plates and, where it matters, an anomaloscope. Treat a poor result here as a reason to book an eye test, not as an answer.</p>`,

  steps: [
    'Set your screen to normal brightness and turn off any night or warmth filter.',
    'Press start, then answer each plate with your first impression.',
    'Read the breakdown afterwards — it shows what each plate was testing.',
  ],

  sections: [
    {
      id: 'types',
      h2: 'Types of colour vision deficiency',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>Affects</th><th>Roughly how common</th></tr></thead>
<tbody>
<tr><td>Deuteranomaly</td><td>Green cones shifted — greens look more red</td><td>~5% of men</td></tr>
<tr><td>Protanomaly</td><td>Red cones shifted — reds look duller and darker</td><td>~1% of men</td></tr>
<tr><td>Deuteranopia / protanopia</td><td>One cone type absent</td><td>~1% of men each</td></tr>
<tr><td>Tritanomaly / tritanopia</td><td>Blue-yellow, not detected by these plates</td><td>Very rare, affects both sexes equally</td></tr>
<tr><td>Achromatopsia</td><td>No colour vision at all</td><td>About 1 in 30,000</td></tr>
</tbody></table></div>
<p>Red-green deficiency is carried on the X chromosome, which is why it affects roughly 8% of men of northern European descent but only about 0.5% of women. This test screens for red-green types only.</p>`,
    },
    {
      id: 'living',
      h2: 'If you do have it',
      html: `<p>It is a variation rather than a disease, it does not get worse, and most people manage without difficulty once they know.</p>
<ul>
<li><strong>It affects some careers.</strong> Commercial piloting, some electrical work, parts of the armed forces and certain medical roles have colour vision requirements.</li>
<li><strong>Design for it, if you design.</strong> Never rely on colour alone to carry meaning — add labels, patterns or icons. Roughly one in twelve men cannot distinguish your red error state from your green success state.</li>
<li><strong>Phone tools help.</strong> Both iOS and Android have colour filters and a colour identifier that names what the camera sees.</li>
<li><strong>Tinted lenses are marketed heavily.</strong> They shift perception and can make some distinctions easier, but they do not restore normal colour vision, and evidence for real-world benefit is mixed.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Is this test accurate?', a: '<p>It is a screening indication, not a diagnosis. Screens are not colour-calibrated, so both false positives and false negatives are possible. An optometrist using printed plates is the reliable test.</p>' },
    { q: 'Why does everyone see 12 on the first plate?', a: '<p>That plate is a control. It is designed to be readable regardless of colour vision, and it confirms the test is displaying at all. If you cannot read it, something is wrong with the display rather than your eyes.</p>' },
    { q: 'How common is colour blindness?', a: '<p>Around 8% of men and 0.5% of women of northern European descent have some red-green deficiency. Rates are lower in other populations.</p>' },
    { q: 'Can colour blindness be cured?', a: '<p>No. It is genetic and permanent. Tinted lenses can make certain distinctions easier for some people but do not restore normal colour vision.</p>' },
    { q: 'Does this test blue-yellow deficiency?', a: '<p>No. Ishihara-style plates screen for red-green types. Blue-yellow deficiency is much rarer and needs different testing.</p>' },
    { q: 'Are my answers stored?', a: '<p>No. Everything happens in your browser and nothing is recorded or transmitted.</p>' },
  ],

  related: ['heart-rate-calculator', 'bmi-calculator', 'sleep-calculator', 'blood-type-calculator'],
};
