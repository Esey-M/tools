export default {
  slug: 'wheel-of-names',
  category: 'random',
  title: 'Wheel of Names – Spin to Pick a Winner',
  h1: 'Wheel of Names',
  cardText: 'A spinning wheel that picks a name at random. Good for classrooms and giveaways.',
  description:
    'Free spinning wheel picker. Add names, spin the wheel and get a random winner, with an option to remove each winner as it is drawn. No signup.',
  keywords: ['wheel of names', 'spinner wheel', 'random wheel picker', 'spin the wheel', 'name spinner'],
  updated: '2026-09-04',
  lede: 'Add your names, spin, and let the wheel decide. The result is chosen by your browser’s secure random source — the animation just shows you where it landed.',

  form: `
<div class="wheel-layout">
  <div class="wheel-stage">
    <canvas id="wheel" width="440" height="440" role="img" aria-label="Spinning wheel of names"></canvas>
    <div class="wheel-pointer" aria-hidden="true"></div>
    <button type="button" class="wheel-hub" id="spin">Spin</button>
  </div>
  <div>
    <div class="field">
      <label for="names">Names, one per line</label>
      <textarea id="names" rows="9" style="min-height:190px">Alex
Blake
Casey
Devon
Emerson
Frankie
Harper
Jordan</textarea>
      <span class="hint" id="count"></span>
    </div>
    <div class="pw-opts">
      <label><input type="checkbox" id="remove"> Remove the winner after each spin</label>
    </div>
  </div>
</div>

<div class="result" id="out" hidden aria-live="polite" style="text-align:center">
  <div class="result-label">Winner</div>
  <div class="result-value" id="winner">—</div>
  <div class="result-note" id="note"></div>
</div>`,

  css: `
.wheel-layout{display:grid;grid-template-columns:minmax(0,440px) minmax(0,1fr);gap:26px;align-items:start}
@media (max-width:720px){.wheel-layout{grid-template-columns:1fr}}
.wheel-stage{position:relative;display:grid;place-items:center}
.wheel-stage canvas{width:100%;max-width:440px;height:auto;display:block}
.wheel-pointer{position:absolute;top:-2px;left:50%;transform:translateX(-50%);
  width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;
  border-top:24px solid var(--ink);filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));z-index:2}
.wheel-hub{position:absolute;width:86px;height:86px;border-radius:50%;border:4px solid var(--bg-raised);
  background:var(--accent);color:#fff;font-size:1rem;font-weight:700;cursor:pointer;
  box-shadow:0 3px 12px rgba(0,0,0,.25);letter-spacing:.02em}
.wheel-hub:hover{background:var(--accent-hover)}
.wheel-hub:disabled{opacity:.6;cursor:default}
.pw-opts label{display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);cursor:pointer}
.pw-opts input{width:auto}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('wheel'), ctx = canvas.getContext('2d');
  var angle = 0, spinning = false;

  var COLORS = ['#0f7d6b','#4f9ee8','#e8a33d','#c94f6d','#7a9e4f','#8a6fc4','#3fa8a0','#d47a3a'];

  function names(){
    return $('names').value.split('\\n').map(function(s){ return s.trim(); }).filter(Boolean);
  }

  function draw(){
    var list = names();
    var size = canvas.width;
    var cx = size / 2, cy = size / 2, r = size / 2 - 6;
    ctx.clearRect(0, 0, size, size);

    if (!list.length) {
      ctx.fillStyle = '#c9c4bc';
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      return;
    }

    var slice = Math.PI * 2 / list.length;
    for (var i = 0; i < list.length; i++) {
      var start = angle + i * slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label, laid along the radius.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      var fontSize = list.length > 26 ? 10 : list.length > 16 ? 12 : 15;
      ctx.font = '600 ' + fontSize + 'px ui-sans-serif, system-ui, sans-serif';
      var label = list[i].length > 18 ? list[i].slice(0, 17) + '…' : list[i];
      ctx.fillText(label, r - 14, 0);
      ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 3; ctx.stroke();
  }

  function randInt(max){
    var limit = Math.floor(4294967296 / max) * max;
    var buf = new Uint32Array(1), v;
    do { crypto.getRandomValues(buf); v = buf[0]; } while (v >= limit);
    return v % max;
  }

  function spin(){
    var list = names();
    if (spinning || list.length < 2) return;
    spinning = true;
    $('spin').disabled = true;
    $('out').hidden = true;

    // Decide the winner first, then animate to it — the spin is presentation only.
    var winnerIndex = randInt(list.length);
    var slice = Math.PI * 2 / list.length;

    // The pointer sits at the top, which is -90 degrees in canvas coordinates.
    var targetCentre = -Math.PI / 2;
    var desired = targetCentre - (winnerIndex * slice + slice / 2);
    var turns = 5 + randInt(3);
    // Wind back until the wheel travels at least that many full rotations, so a
    // spin never looks like a half-hearted nudge.
    var start = angle;
    var end = desired;
    while (end > start - Math.PI * 2 * turns) end -= Math.PI * 2;

    var duration = 4200;
    var t0 = performance.now();
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function frame(now){
      var p = Math.min(1, (now - t0) / duration);
      // Ease out quintic: fast start, long slow settle.
      var eased = 1 - Math.pow(1 - p, 5);
      angle = start + (end - start) * eased;
      draw();
      if (p < 1) requestAnimationFrame(frame);
      else finish(list[winnerIndex], list.length);
    }

    if (reduced) { angle = end; draw(); finish(list[winnerIndex], list.length); }
    else requestAnimationFrame(frame);
  }

  function finish(winner, total){
    spinning = false;
    $('spin').disabled = false;
    $('winner').textContent = winner;
    $('note').textContent = 'Drawn from ' + total + ' names — each had a 1 in ' + total + ' chance.';
    $('out').hidden = false;

    if ($('remove').checked) {
      var list = names().filter(function(n){ return n !== winner; });
      $('names').value = list.join('\\n');
      updateCount();
      angle = 0;
      draw();
    }
  }

  function updateCount(){
    var n = names().length;
    $('count').textContent = n + (n === 1 ? ' name' : ' names') + (n < 2 ? ' — add at least two to spin' : '');
  }

  $('spin').addEventListener('click', spin);
  $('names').addEventListener('input', function(){ updateCount(); draw(); });
  canvas.addEventListener('click', spin);

  updateCount();
  draw();
})();`,

  answerHeading: 'Is the wheel actually fair?',
  answer: `<p><strong>Yes, and it is worth understanding why the animation is not what decides it.</strong> The winner is chosen first, using <code>crypto.getRandomValues</code> with rejection sampling so every name has exactly equal probability. The wheel then animates to that predetermined position. This is deliberately the opposite of a physical wheel, where friction, starting position and spin strength all introduce bias — a real wheel of fortune is famously exploitable for that reason.</p>`,

  steps: [
    'Type or paste your names into the box, one per line.',
    'Press <strong>Spin</strong>, or click the wheel itself.',
    'Tick <strong>remove the winner</strong> if you are drawing several in sequence.',
  ],

  sections: [
    {
      id: 'uses',
      h2: 'Where a wheel beats a plain list',
      html: `<p>Functionally, the wheel does the same job as a name picker. The difference is entirely social, and it matters more than it sounds.</p>
<ul>
<li><strong>Classrooms.</strong> A visible spin feels fair to students in a way a hidden algorithm does not. Turn on "remove the winner" so everyone gets asked before anyone is asked twice.</li>
<li><strong>Live giveaways.</strong> The build-up is the point. On a stream, the four seconds of spin do more for engagement than any instant result.</li>
<li><strong>Team meetings.</strong> Choosing who presents first, who runs the retro, who gets the last slot.</li>
<li><strong>Household arguments.</strong> Chores, who picks the film, who does the washing up. The theatre defuses it.</li>
</ul>`,
    },
    {
      id: 'physical',
      h2: 'Why real spinning wheels are not fair',
      html: `<p>A physical wheel is a deterministic mechanical system, not a random one. Given the starting position and the force applied, the outcome is in principle predictable — and in practice, wheels develop biases.</p>
<p>Roulette provides the documented cases. In 1873 Joseph Jagger hired clerks to record thousands of spins at Monte Carlo, found a wheel with slightly worn frets that favoured certain numbers, and won a fortune before the casino rotated its wheels. A century later, groups using concealed computers to time the ball did the same thing with physics rather than defects.</p>
<p>Casinos now rebalance wheels constantly for exactly this reason. A digital wheel has no frets to wear, which is why the result here is drawn cryptographically and merely displayed as a spin.</p>`,
    },
  ],

  faq: [
    { q: 'How many names can I add?', a: '<p>There is no hard limit, though labels shrink past about thirty and become hard to read. For very long lists the random name picker is easier to work with.</p>' },
    { q: 'Can the same name win twice?', a: '<p>Yes, unless you tick "remove the winner after each spin", which takes each winner out of the list as it is drawn.</p>' },
    { q: 'Is the spin predetermined?', a: '<p>The winner is selected before the animation starts, then the wheel animates to it. The selection itself is cryptographically random and uniform, so this makes it fairer than a simulated physics spin, not less fair.</p>' },
    { q: 'Are my names saved?', a: '<p>No. They stay in your browser and are gone when you close the page.</p>' },
    { q: 'Does it work on a phone?', a: '<p>Yes. The wheel scales to the screen and you can tap it directly to spin.</p>' },
  ],

  related: ['random-name-picker', 'random-team-generator', 'coin-flip', 'dice-roller'],
};
