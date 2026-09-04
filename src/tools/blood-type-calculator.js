export default {
  slug: 'blood-type-calculator',
  category: 'health',
  title: 'Blood Type Calculator – Compatibility and Inheritance',
  h1: 'Blood Type Calculator',
  cardText: 'Who you can donate to and receive from, and what type a child could be.',
  description:
    'Free blood type calculator. See who you can donate to and receive from, and work out the possible blood types of a child from both parents’ types.',
  keywords: ['blood type calculator', 'blood type compatibility', 'blood type chart', 'child blood type', 'universal donor'],
  updated: '2026-09-04',
  disclaimer: 'Educational only. Blood typing for medical or legal purposes requires a laboratory test.',
  lede: 'Check donation compatibility, or work out which blood types a child could inherit from two parents.',

  form: `
<div class="field">
  <span class="field-label" id="mode-label">What do you want to know?</span>
  <div class="seg" role="group" aria-labelledby="mode-label" id="modes" style="flex-wrap:wrap">
    <button type="button" data-m="donate" aria-pressed="true">Donation compatibility</button>
    <button type="button" data-m="child">A child’s possible types</button>
  </div>
</div>

<div id="pane-donate">
  <div class="field">
    <label for="type">Your blood type</label>
    <select id="type"></select>
  </div>
  <div class="result" id="out1" aria-live="polite">
    <div class="result-label">You can donate blood to</div>
    <div class="result-value" id="give" style="font-size:1.7rem">—</div>
    <div class="result-note" id="givenote"></div>
    <dl class="result-grid">
      <div class="stat"><dt>You can receive from</dt><dd id="take" style="font-size:1.05rem">—</dd></div>
      <div class="stat"><dt>Share of population</dt><dd id="freq">—</dd></div>
    </dl>
  </div>
</div>

<div id="pane-child" hidden>
  <div class="row">
    <div class="field">
      <label for="p1">Parent 1</label>
      <select id="p1"></select>
    </div>
    <div class="field">
      <label for="p2">Parent 2</label>
      <select id="p2"></select>
    </div>
  </div>
  <div class="result" id="out2" aria-live="polite">
    <div class="result-label">The child could be</div>
    <div class="result-value" id="child" style="font-size:1.7rem">—</div>
    <div class="result-note" id="childnote"></div>
    <dl class="result-grid">
      <div class="stat"><dt>Cannot be</dt><dd id="cannot" style="font-size:1.05rem">—</dd></div>
    </dl>
  </div>
</div>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var TYPES = ['O-','O+','A-','A+','B-','B+','AB-','AB+'];
  var FREQ = { 'O+':38, 'A+':34, 'B+':9, 'O-':7, 'A-':6, 'AB+':3, 'B-':2, 'AB-':1 };
  var mode = 'donate';

  function parse(t){
    return { abo: t.replace(/[+-]$/, ''), rh: t.slice(-1) === '+' };
  }

  // A donor's antigens must not be ones the recipient lacks.
  function canGive(donor, recipient){
    var d = parse(donor), r = parse(recipient);
    if (d.rh && !r.rh) return false;                       // Rh+ cannot go to Rh−
    if (d.abo === 'O') return true;
    if (d.abo === 'AB') return r.abo === 'AB';
    return r.abo === d.abo || r.abo === 'AB';
  }

  function fill(sel){
    sel.innerHTML = TYPES.map(function(t){ return '<option value="' + t + '">' + t + '</option>'; }).join('');
  }
  [$('type'), $('p1'), $('p2')].forEach(fill);
  $('type').value = 'O+'; $('p1').value = 'A+'; $('p2').value = 'B+';

  function showDonate(){
    var t = $('type').value;
    var give = TYPES.filter(function(x){ return canGive(t, x); });
    var take = TYPES.filter(function(x){ return canGive(x, t); });

    $('give').textContent = give.join(', ');
    $('take').textContent = take.join(', ');
    $('freq').textContent = (FREQ[t] || 0) + '% (US)';
    $('givenote').textContent =
      t === 'O-' ? 'O− is the universal red cell donor — it can be given to anyone, which is why it is used in emergencies before a patient is typed.' :
      t === 'AB+' ? 'AB+ is the universal recipient: it can receive red cells from any type. Its plasma, however, can only go to other AB patients.' :
      'Compatible with ' + give.length + ' of the 8 types for red cell donation.';
  }

  // Alleles each phenotype can carry.
  var ABO_ALLELES = { O: ['O'], A: ['A','O'], B: ['B','O'], AB: ['A','B'] };
  function phenotype(a, b){
    var pair = [a, b].sort().join('');
    if (pair === 'AB') return 'AB';
    if (pair.indexOf('A') > -1) return 'A';
    if (pair.indexOf('B') > -1) return 'B';
    return 'O';
  }

  function showChild(){
    var a = parse($('p1').value), b = parse($('p2').value);
    var abo = {};
    ABO_ALLELES[a.abo].forEach(function(x){
      ABO_ALLELES[b.abo].forEach(function(y){ abo[phenotype(x, y)] = 1; });
    });

    // Rh+ parents may carry a recessive negative allele, so Rh− is possible unless
    // both parents are Rh−, in which case the child must be Rh−.
    var rh = (!a.rh && !b.rh) ? ['-'] : ['+','-'];

    var possible = [];
    Object.keys(abo).forEach(function(g){ rh.forEach(function(r){ possible.push(g + r); }); });
    possible.sort(function(x, y){ return TYPES.indexOf(x) - TYPES.indexOf(y); });

    var impossible = TYPES.filter(function(t){ return possible.indexOf(t) === -1; });

    $('child').textContent = possible.join(', ');
    $('cannot').textContent = impossible.length ? impossible.join(', ') : 'Any type is possible';
    $('childnote').textContent = (!a.rh && !b.rh)
      ? 'Both parents are Rh negative, so the child must be Rh negative too.'
      : 'An Rh positive parent may carry a hidden negative allele, so an Rh negative child is possible.';
  }

  $('modes').addEventListener('click', function(e){
    var b = e.target.closest('button[data-m]'); if (!b) return;
    mode = b.getAttribute('data-m');
    var btns = $('modes').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    $('pane-donate').hidden = mode !== 'donate';
    $('pane-child').hidden = mode === 'donate';
  });
  $('type').addEventListener('change', showDonate);
  $('p1').addEventListener('change', showChild);
  $('p2').addEventListener('change', showChild);

  showDonate(); showChild();
})();`,

  answerHeading: 'How blood compatibility works',
  answer: `<p><strong>Your immune system attacks any blood antigen it has not met, so a donor's antigens must be a subset of the recipient's.</strong> Type O red cells carry neither A nor B antigen, which is why O negative can be given to anyone and is what ambulances carry. Type AB carries both, so AB positive patients can receive from anyone. Plasma works the opposite way round — AB is the universal plasma donor and O the universal plasma recipient — because plasma carries the antibodies rather than the antigens.</p>`,

  steps: [
    'Choose whether you are checking donation compatibility or a child’s possible types.',
    'Select the blood type or the two parents’ types.',
    'Read who can give and receive, or which types a child could and could not be.',
  ],

  sections: [
    {
      id: 'chart',
      h2: 'Red cell compatibility',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>Can donate to</th><th>Can receive from</th><th>US population</th></tr></thead>
<tbody>
<tr><td>O−</td><td>Everyone</td><td>O−</td><td>7%</td></tr>
<tr><td>O+</td><td>O+, A+, B+, AB+</td><td>O−, O+</td><td>38%</td></tr>
<tr><td>A−</td><td>A−, A+, AB−, AB+</td><td>O−, A−</td><td>6%</td></tr>
<tr><td>A+</td><td>A+, AB+</td><td>O−, O+, A−, A+</td><td>34%</td></tr>
<tr><td>B−</td><td>B−, B+, AB−, AB+</td><td>O−, B−</td><td>2%</td></tr>
<tr><td>B+</td><td>B+, AB+</td><td>O−, O+, B−, B+</td><td>9%</td></tr>
<tr><td>AB−</td><td>AB−, AB+</td><td>O−, A−, B−, AB−</td><td>1%</td></tr>
<tr><td>AB+</td><td>AB+</td><td>Everyone</td><td>3%</td></tr>
</tbody></table></div>
<p>Population figures are approximate US frequencies and vary considerably by ancestry — Rh negative is much rarer in East Asian populations, for instance.</p>`,
    },
    {
      id: 'inheritance',
      h2: 'How a child inherits blood type',
      html: `<p>ABO type comes from two alleles, one from each parent. A and B are codominant; O is recessive. So a parent who is type A carries either AA or AO, and can pass on an O allele without being type O themselves.</p>
<p>Rh works the same way: an Rh positive parent may carry a hidden negative allele, so two Rh positive parents can have an Rh negative child. Two Rh negative parents, however, have no positive allele to pass on, so their child must be Rh negative.</p>
<p>One well-known exception: the extremely rare Bombay phenotype produces results that appear to break the rules, which is why blood typing alone is not accepted as proof of parentage.</p>`,
    },
  ],

  faq: [
    { q: 'What is the universal blood donor?', a: '<p>O negative, for red cells. It carries no A, B or Rh D antigen, so it can be transfused into any patient — which is why it is stocked for emergencies before a patient can be typed.</p>' },
    { q: 'What is the universal recipient?', a: '<p>AB positive. Those patients already have A, B and Rh D antigens, so their immune system does not attack any donor red cells.</p>' },
    { q: 'Can two O parents have an A child?', a: '<p>No. Type O carries only O alleles, so both parents can only pass on O. Any apparent exception points to an extremely rare genetic variant or a mistake in the typing.</p>' },
    { q: 'Can blood type prove parentage?', a: '<p>It can exclude a possibility but never confirm one, and rare phenotypes make even exclusions unreliable. DNA testing is the only sound method.</p>' },
    { q: 'Why is plasma compatibility the other way round?', a: '<p>Because plasma carries antibodies rather than antigens. Type AB plasma has neither anti-A nor anti-B antibodies, making AB the universal plasma donor — the reverse of red cells.</p>' },
  ],

  related: ['bmi-calculator', 'heart-rate-calculator', 'calorie-calculator', 'water-intake-calculator'],
};
