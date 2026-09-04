export default {
  slug: 'clothing-size-converter',
  category: 'converters',
  title: 'Clothing Size Converter – US, UK, EU and International',
  h1: 'Clothing Size Converter',
  cardText: 'Convert clothing sizes between US, UK, EU, Italy, France and Japan.',
  description:
    'Free clothing size converter for women’s and men’s clothing across US, UK, EU, Italian, French and Japanese sizing, with body measurements shown.',
  keywords: ['clothing size converter', 'us to uk size', 'eu clothing size', 'international size chart', 'dress size converter'],
  updated: '2026-09-04',
  lede: 'Pick a size in the system you know and see the rest, with the body measurements each size assumes.',

  form: `
<div class="field">
  <span class="field-label" id="who-label">Chart</span>
  <div class="seg" role="group" aria-labelledby="who-label" id="whos">
    <button type="button" data-w="women" aria-pressed="true">Women</button>
    <button type="button" data-w="men">Men</button>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="system">I know my size in</label>
    <select id="system"></select>
  </div>
  <div class="field">
    <label for="value">Size</label>
    <select id="value"></select>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label">Equivalent sizes</div>
  <div class="result-value" id="main" style="font-size:1.6rem">—</div>
  <div class="result-note" id="note"></div>
</div>

<div style="margin-top:22px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:10px">Full chart</h2>
  <div class="table-scroll"><table id="chart"></table></div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var who = 'women';

  // Women: [US, UK, EU, IT, FR, JP, bust cm, waist cm, hip cm]
  var WOMEN = {
    cols: ['US','UK','EU','Italy','France','Japan','Bust','Waist','Hip'],
    rows: [
      ['0','4','30','36','32','5','78','60','86'],
      ['2','6','32','38','34','7','81','63','89'],
      ['4','8','34','40','36','9','84','66','92'],
      ['6','10','36','42','38','11','87','69','95'],
      ['8','12','38','44','40','13','90','72','98'],
      ['10','14','40','46','42','15','94','76','102'],
      ['12','16','42','48','44','17','99','81','107'],
      ['14','18','44','50','46','19','104','86','112'],
      ['16','20','46','52','48','21','109','91','117'],
      ['18','22','48','54','50','23','114','96','122'],
      ['20','24','50','56','52','25','120','102','128']
    ]
  };

  // Men: [US/UK chest in, EU, Italy, Japan, letter, chest cm, waist cm]
  var MEN = {
    cols: ['US/UK','EU','Italy','Japan','Letter','Chest','Waist'],
    rows: [
      ['34','44','44','S','XS','86','71'],
      ['36','46','46','M','S','91','76'],
      ['38','48','48','L','M','96','81'],
      ['40','50','50','LL','L','101','86'],
      ['42','52','52','3L','XL','107','91'],
      ['44','54','54','4L','XXL','112','97'],
      ['46','56','56','5L','3XL','117','102'],
      ['48','58','58','6L','4XL','122','107']
    ]
  };

  function data(){ return who === 'women' ? WOMEN : MEN; }
  // Only the size columns are selectable; the measurement columns are output only.
  function sizeCols(){ return who === 'women' ? [0,1,2,3,4,5] : [0,1,2,3,4]; }

  function fillSystems(){
    var d = data();
    $('system').innerHTML = sizeCols().map(function(i){
      return '<option value="' + i + '">' + d.cols[i] + '</option>';
    }).join('');
  }

  function fillValues(){
    var d = data();
    var col = parseInt($('system').value, 10);
    $('value').innerHTML = d.rows.map(function(r, i){
      return '<option value="' + i + '">' + r[col] + '</option>';
    }).join('');
    $('value').selectedIndex = Math.floor(d.rows.length / 2);
  }

  function show(){
    var d = data();
    var row = d.rows[parseInt($('value').value, 10)];
    if (!row) return;

    $('main').textContent = sizeCols().map(function(i){
      return d.cols[i] + ' ' + row[i];
    }).join('  ·  ');

    var measures = d.cols.slice(sizeCols().length).map(function(name, k){
      var idx = sizeCols().length + k;
      return name.toLowerCase() + ' ' + row[idx] + ' cm (' + (row[idx] / 2.54).toFixed(0) + ' in)';
    });
    $('note').textContent = 'This size assumes ' + measures.join(', ') + '.';

    $('chart').innerHTML = '<thead><tr>' + d.cols.map(function(c){ return '<th>' + c + '</th>'; }).join('') +
      '</tr></thead><tbody>' + d.rows.map(function(r){
        var current = r === row;
        return '<tr' + (current ? ' style="background:var(--accent-soft);font-weight:600"' : '') + '>' +
          r.map(function(v, i){
            return '<td>' + v + (i >= sizeCols().length ? ' cm' : '') + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</tbody>';
  }

  $('whos').addEventListener('click', function(e){
    var b = e.target.closest('button[data-w]'); if (!b) return;
    who = b.getAttribute('data-w');
    var btns = $('whos').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    fillSystems(); fillValues(); show();
  });
  $('system').addEventListener('change', function(){ fillValues(); show(); });
  $('value').addEventListener('change', show);

  fillSystems(); fillValues(); show();
})();`,

  answerHeading: 'Why sizes are so inconsistent',
  answer: `<p><strong>There is no enforced international clothing size standard, and the numbers mean different things in each country.</strong> UK women's sizes run 4 above US; EU sizes run 30 above US; Italian sizes run 6 above EU. Men's sizing is more rational, being based on chest measurement in inches or centimetres. The larger problem is <em>vanity sizing</em>: brands have progressively relabelled the same measurements with smaller numbers, so a US size 8 today is roughly what a size 14 was in 1960. Measure yourself and use the brand's own chart.</p>`,

  steps: [
    'Choose the women’s or men’s chart.',
    'Pick the system you already know your size in.',
    'Read the equivalents and the body measurements each size assumes.',
  ],

  sections: [
    {
      id: 'measure',
      h2: 'Measure yourself once',
      html: `<p>A measurement in centimetres works with any brand's chart. A size number only works with the brand that printed it.</p>
<ul>
<li><strong>Bust or chest</strong> — around the fullest part, tape level, arms down.</li>
<li><strong>Waist</strong> — the narrowest point, usually just above the navel. Do not hold your stomach in.</li>
<li><strong>Hips</strong> — the widest point, usually about 20 cm below the waist.</li>
<li><strong>Inside leg</strong> — from crotch to floor, in bare feet.</li>
</ul>
<p>Keep the tape snug but not tight, and take measurements over underwear rather than clothing. Write them down — you will use them repeatedly.</p>`,
    },
    {
      id: 'vanity',
      h2: 'Vanity sizing, in numbers',
      html: `<p>US women's sizes have drifted steadily for decades. Comparing standard size charts across time, a garment labelled size 8 today corresponds to roughly:</p>
<div class="table-scroll"><table>
<thead><tr><th>Era</th><th>Equivalent label</th></tr></thead>
<tbody>
<tr><td>1960s</td><td>Size 14</td></tr>
<tr><td>1980s</td><td>Size 10</td></tr>
<tr><td>Today</td><td>Size 8</td></tr>
</tbody></table></div>
<p>The drift is not uniform between brands, which is why the same person can genuinely be a 6 in one shop and a 12 in another. This is a labelling phenomenon, not a fitting one — the measurements are what they are.</p>`,
    },
  ],

  faq: [
    { q: 'What is a US size 8 in UK?', a: '<p>UK 12. UK women’s sizes run four numbers above US throughout the range.</p>' },
    { q: 'How do EU clothing sizes work?', a: '<p>EU women’s sizes are roughly US size plus 30, so US 8 is EU 38. Italy adds a further six, and France sits between the two.</p>' },
    { q: 'Why am I different sizes in different shops?', a: '<p>Because each brand sets its own measurements for a given label, and vanity sizing has pushed those measurements around over decades. Your body has not changed between shops; the labels have.</p>' },
    { q: 'How do men’s sizes work?', a: '<p>More sensibly. US and UK men’s jacket sizes are the chest measurement in inches, and EU sizes are roughly that number plus 10.</p>' },
    { q: 'Should I size up or down between sizes?', a: '<p>Generally up, since taking something in is far easier than letting it out. For knitwear and stretch fabrics the smaller size usually works.</p>' },
  ],

  related: ['shoe-size-converter', 'unit-converter', 'bmi-calculator', 'ideal-weight-calculator'],
};
