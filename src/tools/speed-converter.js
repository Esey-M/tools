export default {
  slug: 'speed-converter',
  category: 'converters',
  title: 'Speed Converter – mph, km/h, m/s, knots and Pace',
  h1: 'Speed Converter',
  cardText: 'Convert mph, km/h, m/s and knots, plus running and cycling pace.',
  description:
    'Free speed converter for mph, km/h, m/s, feet per second and knots, with running pace per mile and per kilometre shown alongside.',
  keywords: ['speed converter', 'mph to kmh', 'kmh to mph', 'knots to mph', 'pace converter'],
  updated: '2026-09-04',
  lede: 'Type a speed in any unit and see all the others, including the pace-per-mile and pace-per-kilometre figures runners actually use.',

  form: `
<div class="row">
  <div class="field">
    <label for="kmh">Kilometres per hour</label>
    <div class="input-group"><input type="number" id="kmh" inputmode="decimal" step="any" value="10"><span class="addon">km/h</span></div>
  </div>
  <div class="field">
    <label for="mph">Miles per hour</label>
    <div class="input-group"><input type="number" id="mph" inputmode="decimal" step="any"><span class="addon">mph</span></div>
  </div>
</div>
<div class="row">
  <div class="field">
    <label for="ms">Metres per second</label>
    <div class="input-group"><input type="number" id="ms" inputmode="decimal" step="any"><span class="addon">m/s</span></div>
  </div>
  <div class="field">
    <label for="kn">Knots</label>
    <div class="input-group"><input type="number" id="kn" inputmode="decimal" step="any"><span class="addon">kn</span></div>
  </div>
  <div class="field">
    <label for="fts">Feet per second</label>
    <div class="input-group"><input type="number" id="fts" inputmode="decimal" step="any"><span class="addon">ft/s</span></div>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">As a running pace</div>
  <div class="result-value" id="pace" style="font-size:2.1rem">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>5 km in</dt><dd id="t5k">—</dd></div>
    <div class="stat"><dt>10 km in</dt><dd id="t10k">—</dd></div>
    <div class="stat"><dt>Half marathon</dt><dd id="thalf">—</dd></div>
    <div class="stat"><dt>Marathon</dt><dd id="tfull">—</dd></div>
  </dl>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var busy = false;

  // Everything is defined against metres per second.
  var F = { kmh: 1 / 3.6, mph: 0.44704, ms: 1, kn: 1852 / 3600, fts: 0.3048 };
  var round = function(n){ return Math.round(n * 10000) / 10000; };

  function duration(seconds){
    if (!isFinite(seconds) || seconds <= 0) return '—';
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.round(seconds % 60);
    if (s === 60) { s = 0; m++; }
    var pad = function(n){ return n < 10 ? '0' + n : '' + n; };
    return h ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }

  function sync(from){
    if (busy) return;
    busy = true;
    var v = parseFloat($(from).value);
    var ms = isFinite(v) ? v * F[from] : NaN;

    Object.keys(F).forEach(function(k){
      if (k !== from) $(k).value = isFinite(ms) ? round(ms / F[k]) : '';
    });

    if (!isFinite(ms) || ms <= 0) {
      $('pace').textContent = '—'; $('note').textContent = '';
      ['t5k','t10k','thalf','tfull'].forEach(function(id){ $(id).textContent = '—'; });
      busy = false; return;
    }

    var perKm = 1000 / ms;
    var perMile = 1609.344 / ms;
    $('pace').textContent = duration(perKm) + ' /km  ·  ' + duration(perMile) + ' /mile';
    $('note').textContent = round(ms * 3.6) + ' km/h  ·  ' + round(ms / 0.44704) + ' mph  ·  ' + round(ms) + ' m/s';

    $('t5k').textContent = duration(5000 / ms);
    $('t10k').textContent = duration(10000 / ms);
    $('thalf').textContent = duration(21097.5 / ms);
    $('tfull').textContent = duration(42195 / ms);
    busy = false;
  }

  Object.keys(F).forEach(function(k){ $(k).addEventListener('input', function(){ sync(k); }); });
  sync('kmh');
})();`,

  answerHeading: 'Converting speed units',
  answer: `<p><strong>To convert km/h to mph, multiply by 0.621371; to go the other way, multiply by 1.60934.</strong> A useful mental shortcut is that mph is roughly five-eighths of km/h: 80 km/h is about 50 mph, and 100 km/h is about 62 mph. A knot is one nautical mile per hour, defined as exactly 1.852 km/h, which is why aviation and shipping speeds always look slightly higher than the equivalent in mph.</p>`,

  steps: [
    'Type a speed into whichever unit you know.',
    'Every other unit updates instantly.',
    'The pace section converts the same speed into minutes per kilometre and per mile, with predicted race times.',
  ],

  sections: [
    {
      id: 'reference',
      h2: 'Speed reference',
      html: `<div class="table-scroll"><table>
<thead><tr><th>km/h</th><th>mph</th><th>m/s</th><th>Roughly</th></tr></thead>
<tbody>
<tr><td>5</td><td>3.1</td><td>1.39</td><td>Walking pace</td></tr>
<tr><td>10</td><td>6.2</td><td>2.78</td><td>Steady jog, 6:00/km</td></tr>
<tr><td>20</td><td>12.4</td><td>5.56</td><td>Casual cycling</td></tr>
<tr><td>50</td><td>31.1</td><td>13.9</td><td>Urban speed limit</td></tr>
<tr><td>100</td><td>62.1</td><td>27.8</td><td>Motorway cruising</td></tr>
<tr><td>120</td><td>74.6</td><td>33.3</td><td>European motorway limit</td></tr>
<tr><td>1,235</td><td>767</td><td>343</td><td>Speed of sound at sea level</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'pace',
      h2: 'Speed versus pace',
      html: `<p>Runners think in <strong>pace</strong> — minutes per kilometre or mile — while cyclists and drivers think in <strong>speed</strong>. They are inverses of each other, which is why a small pace change feels much larger at faster speeds.</p>
<div class="table-scroll"><table>
<thead><tr><th>Pace per km</th><th>Speed</th><th>5 km</th><th>Marathon</th></tr></thead>
<tbody>
<tr><td>7:00</td><td>8.6 km/h</td><td>35:00</td><td>4:55:22</td></tr>
<tr><td>6:00</td><td>10.0 km/h</td><td>30:00</td><td>4:13:11</td></tr>
<tr><td>5:00</td><td>12.0 km/h</td><td>25:00</td><td>3:30:59</td></tr>
<tr><td>4:00</td><td>15.0 km/h</td><td>20:00</td><td>2:48:47</td></tr>
</tbody></table></div>
<p>The race predictions above assume you hold the same pace throughout, which almost nobody does over a marathon. Real marathon times are typically several percent slower than a pace held for 5 km would suggest.</p>`,
    },
  ],

  faq: [
    { q: 'How fast is 100 km/h in mph?', a: '<p>62.1 mph. The quick approximation is to take 60% and add a bit — 60 mph gets you close enough for reading a speedometer abroad.</p>' },
    { q: 'What is a knot?', a: '<p>One nautical mile per hour, defined as exactly 1.852 km/h or about 1.151 mph. It is used in shipping and aviation because a nautical mile corresponds to one minute of latitude, which makes navigation arithmetic simpler.</p>' },
    { q: 'How do I convert speed to running pace?', a: '<p>Divide the distance by the speed. At 10 km/h, one kilometre takes 0.1 hours, which is 6 minutes — a 6:00/km pace. The tool does this for both kilometres and miles automatically.</p>' },
    { q: 'Why do the race predictions look optimistic?', a: '<p>Because they assume perfectly even pacing over the whole distance. In practice fatigue means longer races are run slower per kilometre, so treat the marathon figure especially as a theoretical ceiling.</p>' },
    { q: 'Is Mach a fixed speed?', a: '<p>No. Mach 1 is the local speed of sound, which falls with temperature. It is about 1,235 km/h at sea level but closer to 1,062 km/h at cruising altitude, which is why aircraft speeds are quoted as Mach numbers rather than fixed values.</p>' },
  ],

  related: ['unit-converter', 'temperature-converter', 'fuel-cost-calculator', 'date-difference-calculator'],
};
