export default {
  slug: 'shoe-size-converter',
  category: 'converters',
  title: 'Shoe Size Converter – US, UK, EU and CM',
  h1: 'Shoe Size Converter',
  cardText: 'Convert shoe sizes between US, UK, EU and centimetres.',
  description:
    'Free shoe size converter for US, UK, EU, Japan and centimetres, for men, women and children, with a guide to measuring your foot properly.',
  keywords: ['shoe size converter', 'us to uk shoe size', 'eu shoe size chart', 'shoe size chart', 'convert shoe size'],
  updated: '2026-09-04',
  lede: 'Pick a size in any system and see all the others. Measure your foot in centimetres for the most reliable answer.',

  form: `
<div class="field">
  <span class="field-label" id="who-label">Sizing chart</span>
  <div class="seg" role="group" aria-labelledby="who-label" id="whos">
    <button type="button" data-w="men" aria-pressed="true">Men</button>
    <button type="button" data-w="women">Women</button>
    <button type="button" data-w="kids">Children</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="system">I know my size in</label>
    <select id="system">
      <option value="cm" selected>Foot length (cm)</option>
      <option value="us">US</option>
      <option value="uk">UK</option>
      <option value="eu">EU</option>
      <option value="jp">Japan (cm)</option>
    </select>
  </div>
  <div class="field">
    <label for="value">Size</label>
    <select id="value"></select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Your size</div>
  <div class="result-value" id="main" style="font-size:1.9rem">—</div>
  <div class="result-note" id="note"></div>
  <dl class="result-grid">
    <div class="stat"><dt>US</dt><dd id="r-us">—</dd></div>
    <div class="stat"><dt>UK</dt><dd id="r-uk">—</dd></div>
    <div class="stat"><dt>EU</dt><dd id="r-eu">—</dd></div>
    <div class="stat"><dt>Foot length</dt><dd id="r-cm">—</dd></div>
  </dl>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Full chart</h2>
  <div class="table-scroll"><table id="chart"><thead><tr><th>US</th><th>UK</th><th>EU</th><th>Foot length</th></tr></thead><tbody></tbody></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var who = 'men';

  // [US, UK, EU, foot length cm]
  var CHARTS = {
    men: [
      [6,5.5,39,24.1],[6.5,6,39,24.4],[7,6.5,40,24.8],[7.5,7,40.5,25.4],[8,7.5,41,25.7],
      [8.5,8,42,26],[9,8.5,42.5,26.7],[9.5,9,43,27],[10,9.5,44,27.3],[10.5,10,44.5,27.9],
      [11,10.5,45,28.3],[11.5,11,45.5,28.6],[12,11.5,46,29.4],[13,12.5,47.5,30.2],
      [14,13.5,48.5,31],[15,14.5,49.5,31.8]
    ],
    women: [
      [5,3,35.5,22],[5.5,3.5,36,22.2],[6,4,36.5,22.5],[6.5,4.5,37,23],[7,5,37.5,23.5],
      [7.5,5.5,38,23.8],[8,6,38.5,24.1],[8.5,6.5,39,24.6],[9,7,39.5,25.1],[9.5,7.5,40,25.4],
      [10,8,40.5,25.9],[10.5,8.5,41,26.2],[11,9,41.5,26.7],[11.5,9.5,42,27.1],[12,10,42.5,27.6]
    ],
    kids: [
      [8,7,24,14.6],[9,8,25,15.6],[10,9,27,16.5],[11,10,28,17.5],[12,11,30,18.4],
      [13,12,31,19.1],[1,13,32,20],[2,1,33,20.6],[3,2,34,21.6],[4,3,36,22.2],
      [5,4,37,22.9],[6,5,38,23.5],[7,6,39,24.1]
    ]
  };

  function chart(){ return CHARTS[who]; }

  function fillValues(){
    var sys = $('system').value;
    var col = { us: 0, uk: 1, eu: 2, cm: 3, jp: 3 }[sys];
    var rows = chart();
    $('value').innerHTML = rows.map(function(r, i){
      var v = r[col];
      return '<option value="' + i + '">' + v + (sys === 'cm' || sys === 'jp' ? ' cm' : '') + '</option>';
    }).join('');
    // Default to something near the middle of the range.
    $('value').selectedIndex = Math.floor(rows.length / 2);
  }

  function show(){
    var rows = chart();
    var r = rows[parseInt($('value').value, 10)];
    if (!r) return;

    $('r-us').textContent = r[0];
    $('r-uk').textContent = r[1];
    $('r-eu').textContent = r[2];
    $('r-cm').textContent = r[3] + ' cm';
    $('main').textContent = 'US ' + r[0] + '  ·  UK ' + r[1] + '  ·  EU ' + r[2];
    $('note').textContent = 'Foot length about ' + r[3] + ' cm (' + (r[3] / 2.54).toFixed(1) +
      ' in). Japanese sizing uses foot length directly, so this is JP ' + Math.round(r[3] * 2) / 2 + '.';

    $('chart').querySelector('tbody').innerHTML = rows.map(function(row){
      var isCurrent = row === r;
      return '<tr' + (isCurrent ? ' style="background:var(--accent-soft);font-weight:600"' : '') + '>' +
        '<td>' + row[0] + '</td><td>' + row[1] + '</td><td>' + row[2] + '</td><td>' + row[3] + ' cm</td></tr>';
    }).join('');
  }

  $('whos').addEventListener('click', function(e){
    var b = e.target.closest('button[data-w]'); if (!b) return;
    who = b.getAttribute('data-w');
    var btns = $('whos').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    fillValues(); show();
  });
  $('system').addEventListener('change', function(){ fillValues(); show(); });
  $('value').addEventListener('change', show);

  fillValues(); show();
})();`,

  answerHeading: 'Why shoe sizes disagree everywhere',
  answer: `<p><strong>There is no international shoe size standard, so each system counts differently from a different starting point.</strong> UK sizes run about 1 to 1.5 below US men's sizes and about 2 below US women's. EU sizes use Paris points, where one size is two-thirds of a centimetre. Japanese sizing is the only sensible one: it is simply your foot length in centimetres. Because brands also differ from each other by up to a full size, measuring your foot in centimetres and checking the maker's own chart beats converting a number you already own.</p>`,

  steps: [
    'Choose the men’s, women’s or children’s chart.',
    'Pick the system you already know your size in — foot length in centimetres is the most reliable.',
    'Read across for every other system, with the full chart underneath.',
  ],

  sections: [
    {
      id: 'measure',
      h2: 'Measuring your foot properly',
      html: `<p>Two minutes with a piece of paper beats any conversion table.</p>
<ol>
<li><strong>Measure in the late afternoon.</strong> Feet swell through the day by up to half a size.</li>
<li><strong>Wear the socks you will wear with the shoes.</strong></li>
<li><strong>Stand on a sheet of paper</strong> against a wall, with your heel touching it and your weight on the foot.</li>
<li><strong>Mark the tip of your longest toe.</strong> That is not always the big toe.</li>
<li><strong>Measure heel to mark in centimetres</strong>, and repeat for the other foot.</li>
<li><strong>Use the larger measurement.</strong> Most people have one foot noticeably bigger.</li>
</ol>
<p>Add 0.5 to 1 cm of wiggle room for everyday shoes, and closer to 1.5 cm for running shoes, where feet swell and toes need clearance on descents.</p>`,
    },
    {
      id: 'width',
      h2: 'Width matters as much as length',
      html: `<p>People with wide feet routinely buy shoes a size too long, because extra length is the only way to get extra width in a standard fitting. This produces a shoe that slips at the heel and rubs at the toe.</p>
<div class="table-scroll"><table>
<thead><tr><th>US width</th><th>Men</th><th>Women</th></tr></thead>
<tbody>
<tr><td>Narrow</td><td>B</td><td>AA / A</td></tr>
<tr><td>Standard</td><td>D</td><td>B</td></tr>
<tr><td>Wide</td><td>2E</td><td>D</td></tr>
<tr><td>Extra wide</td><td>4E</td><td>2E</td></tr>
</tbody></table></div>
<p>UK and EU brands often use F, G and H fittings instead. If shoes always feel tight across the ball of the foot but long at the toe, you need a wider fitting rather than a bigger size.</p>`,
    },
  ],

  faq: [
    { q: 'What is a US size 9 in UK?', a: '<p>For men, UK 8.5. For women, UK 7. The gap differs between men’s and women’s sizing, which is a common source of ordering mistakes.</p>' },
    { q: 'Are men’s and women’s shoe sizes the same?', a: '<p>No. A women’s US size is roughly 1.5 sizes higher than the men’s size for the same foot, so a women’s 9 is about a men’s 7.5. Women’s shoes are also cut narrower.</p>' },
    { q: 'How do I know my EU shoe size?', a: '<p>Measure your foot in centimetres and read the chart above. EU sizes are based on Paris points, where each size is two-thirds of a centimetre, so half sizes are less common.</p>' },
    { q: 'Why do sizes differ between brands?', a: '<p>Because each maker uses its own last — the wooden or plastic form a shoe is built around. Variation of up to a full size between brands is entirely normal, which is why checking the maker’s own chart matters.</p>' },
    { q: 'Should I size up for running shoes?', a: '<p>Usually about half a size. Feet swell during a run and toes need clearance on downhills. Aim for roughly a thumb’s width between your longest toe and the end.</p>' },
  ],

  related: ['unit-converter', 'clothing-size-converter', 'temperature-converter', 'percentage-calculator'],
};
