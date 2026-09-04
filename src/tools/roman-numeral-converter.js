export default {
  slug: 'roman-numeral-converter',
  category: 'converters',
  title: 'Roman Numeral Converter – Numbers to Roman and Back',
  h1: 'Roman Numeral Converter',
  cardText: 'Convert numbers to Roman numerals and Roman numerals to numbers.',
  description:
    'Free Roman numeral converter. Turn any number from 1 to 3,999 into Roman numerals, or decode Roman numerals back into digits, with the rules explained.',
  keywords: ['roman numeral converter', 'roman numerals', 'number to roman numeral', 'xiv meaning', 'roman numeral chart'],
  updated: '2026-09-04',
  lede: 'Type a number or a Roman numeral into either box. The other side updates as you type, and invalid numerals are flagged with the reason.',

  form: `
<div class="row">
  <div class="field">
    <label for="num">Number</label>
    <input type="number" id="num" inputmode="numeric" min="1" max="3999" step="1" value="2026" placeholder="2026">
    <span class="hint">1 to 3,999</span>
  </div>
  <div class="field">
    <label for="rom">Roman numeral</label>
    <input type="text" id="rom" placeholder="MMXXVI" autocomplete="off" spellcheck="false" style="text-transform:uppercase;font-family:var(--font-num);letter-spacing:.04em">
    <span class="hint">I V X L C D M</span>
  </div>
</div>

<div class="result" id="out" aria-live="polite">
  <div class="result-label" id="lbl">Roman numeral</div>
  <div class="result-value" id="main" style="letter-spacing:.05em">—</div>
  <div class="result-note" id="note"></div>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var busy = false;

  var TABLE = [
    [1000,'M'], [900,'CM'], [500,'D'], [400,'CD'], [100,'C'], [90,'XC'],
    [50,'L'], [40,'XL'], [10,'X'], [9,'IX'], [5,'V'], [4,'IV'], [1,'I']
  ];
  var VALUE = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

  function toRoman(n){
    var out = '';
    for (var i = 0; i < TABLE.length; i++) {
      while (n >= TABLE[i][0]) { out += TABLE[i][1]; n -= TABLE[i][0]; }
    }
    return out;
  }

  /** Returns { value } or { error } — validation is strict, not just permissive parsing. */
  function fromRoman(s){
    s = s.toUpperCase().replace(/\\s/g, '');
    if (!s) return { error: '' };
    if (!/^[IVXLCDM]+$/.test(s)) return { error: 'Roman numerals only use the letters I, V, X, L, C, D and M.' };

    var total = 0;
    for (var i = 0; i < s.length; i++) {
      var v = VALUE[s[i]];
      var next = i + 1 < s.length ? VALUE[s[i + 1]] : 0;
      total += v < next ? -v : v;
    }
    if (total > 3999) return { error: 'Standard Roman numerals stop at 3,999 (MMMCMXCIX).' };

    // The only valid numeral for a value is the canonical one.
    if (toRoman(total) !== s) {
      return { error: '"' + s + '" is not written correctly. ' + total + ' is normally ' + toRoman(total) + '.' };
    }
    return { value: total };
  }

  function showNumber(n){
    var r = toRoman(n);
    $('lbl').textContent = 'Roman numeral';
    $('main').textContent = r;
    $('note').textContent = n.toLocaleString('en-US') + ' written in Roman numerals.' +
      (r.length > 8 ? ' Long numerals like this are why the system fell out of use for arithmetic.' : '');
    $('err').hidden = true;
  }

  $('num').addEventListener('input', function(){
    if (busy) return;
    busy = true;
    var n = parseInt(this.value, 10);
    if (!isFinite(n) || n < 1 || n > 3999) {
      $('rom').value = '';
      $('main').textContent = '—'; $('note').textContent = '';
      $('err').hidden = !this.value;
      if (this.value) $('err').textContent = 'Enter a whole number between 1 and 3,999.';
    } else {
      $('rom').value = toRoman(n);
      showNumber(n);
    }
    busy = false;
  });

  $('rom').addEventListener('input', function(){
    if (busy) return;
    busy = true;
    var r = fromRoman(this.value);
    if (r.error !== undefined) {
      $('num').value = '';
      $('main').textContent = '—'; $('note').textContent = '';
      $('err').hidden = !r.error;
      if (r.error) $('err').textContent = r.error;
    } else {
      $('num').value = r.value;
      $('lbl').textContent = 'Number';
      $('main').textContent = r.value.toLocaleString('en-US');
      $('note').textContent = this.value.toUpperCase() + ' is ' + r.value.toLocaleString('en-US') + '.';
      $('err').hidden = true;
    }
    busy = false;
  });

  $('rom').value = toRoman(2026);
  showNumber(2026);
})();`,

  answerHeading: 'How Roman numerals work',
  answer: `<p><strong>Seven letters carry fixed values — I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000 — and you add them left to right.</strong> The one twist is subtractive notation: when a smaller value sits immediately before a larger one, it is subtracted instead. So IV is 4 (5 − 1) and XC is 90 (100 − 10). Only six subtractive pairs are valid: IV, IX, XL, XC, CD and CM. The system has no zero and no way to write fractions, which is why it was replaced for arithmetic.</p>`,

  steps: [
    'Type a number between 1 and 3,999 into the left box.',
    'Or type a Roman numeral into the right box to decode it.',
    'Malformed numerals are explained rather than silently accepted.',
  ],

  sections: [
    {
      id: 'rules',
      h2: 'The rules that make a numeral valid',
      html: `<ul>
<li><strong>I, X, C and M may repeat</strong> up to three times in a row. IIII is not standard; IV is.</li>
<li><strong>V, L and D never repeat.</strong> VV would be X, so it is simply written as X.</li>
<li><strong>Only I, X and C are subtracted</strong>, and only from the next two values up. IX and IV are valid; IL and IC are not.</li>
<li><strong>Subtract only from the next two denominations.</strong> XC (90) is valid; XM would not be — 990 is CMXC.</li>
<li><strong>Read left to right, largest first</strong>, apart from the six subtractive pairs.</li>
</ul>
<p>This is why 1999 is MCMXCIX and not MIM: each part of the number is expressed separately as 1000 + 900 + 90 + 9.</p>`,
    },
    {
      id: 'chart',
      h2: 'Roman numeral chart',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Number</th><th>Roman</th><th>Number</th><th>Roman</th></tr></thead>
<tbody>
<tr><td>1</td><td>I</td><td>30</td><td>XXX</td></tr>
<tr><td>2</td><td>II</td><td>40</td><td>XL</td></tr>
<tr><td>3</td><td>III</td><td>50</td><td>L</td></tr>
<tr><td>4</td><td>IV</td><td>90</td><td>XC</td></tr>
<tr><td>5</td><td>V</td><td>100</td><td>C</td></tr>
<tr><td>6</td><td>VI</td><td>400</td><td>CD</td></tr>
<tr><td>9</td><td>IX</td><td>500</td><td>D</td></tr>
<tr><td>10</td><td>X</td><td>900</td><td>CM</td></tr>
<tr><td>14</td><td>XIV</td><td>1000</td><td>M</td></tr>
<tr><td>20</td><td>XX</td><td>2026</td><td>MMXXVI</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'why-3999',
      h2: 'Why the limit is 3,999',
      html: `<p>M is the largest single letter, and it may repeat at most three times, so MMMCMXCIX — 3,999 — is the largest number standard notation can express.</p>
<p>The Romans handled larger figures with a <em>vinculum</em>, a bar drawn over a numeral to multiply it by a thousand: V̄ meant 5,000 and X̄ meant 10,000. Because that is a typographic mark rather than a letter, it is rarely supported, and most converters — this one included — stop at 3,999.</p>`,
    },
  ],

  faq: [
    { q: 'What is XIV in numbers?', a: '<p>14. The X is 10, and IV is 4 because the I before the V subtracts one from five.</p>' },
    { q: 'Why is 4 written IV and not IIII?', a: '<p>Standard notation uses subtraction to avoid four identical letters in a row. IIII does appear historically, most famously on clock faces, where it is still used for visual balance against the VIII opposite.</p>' },
    { q: 'Is there a zero in Roman numerals?', a: '<p>No. The system has no symbol for zero and no concept of place value, which is precisely why positional Hindu-Arabic numerals replaced it for calculation.</p>' },
    { q: 'What is the largest Roman numeral?', a: '<p>MMMCMXCIX, which is 3,999, in standard notation. Larger values needed an overbar to multiply by a thousand.</p>' },
    { q: 'How do I write the current year?', a: '<p>2026 is MMXXVI — two thousands, two tens, a five and a one.</p>' },
  ],

  related: ['unit-converter', 'percentage-calculator', 'text-case-converter', 'word-counter'],
};
