export default {
  slug: 'word-counter',
  category: 'text',
  title: 'Word Counter – Words, Characters, Sentences and Reading Time',
  h1: 'Word Counter',
  cardText: 'Live word, character, sentence and paragraph counts, plus reading time.',
  description:
    'Free word counter. Paste your text for instant word, character, sentence and paragraph counts, reading time, and a check against social media limits.',
  keywords: ['word counter', 'character count', 'word count tool', 'essay word count', 'reading time'],
  updated: '2026-09-04',
  lede: 'Paste or type below. Counts update as you write, and nothing you enter leaves your browser.',

  form: `
<div class="field">
  <label for="txt">Your text</label>
  <textarea id="txt" rows="10" placeholder="Start typing or paste your text here…" style="min-height:210px"></textarea>
</div>
<div class="btn-row" style="margin-bottom:16px">
  <button type="button" class="btn btn-ghost" id="paste">Paste</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear</button>
</div>

<dl class="result-grid" style="margin-top:0">
  <div class="stat"><dt>Words</dt><dd id="words">0</dd></div>
  <div class="stat"><dt>Characters</dt><dd id="chars">0</dd></div>
  <div class="stat"><dt>No spaces</dt><dd id="nospace">0</dd></div>
  <div class="stat"><dt>Sentences</dt><dd id="sent">0</dd></div>
  <div class="stat"><dt>Paragraphs</dt><dd id="paras">0</dd></div>
  <div class="stat"><dt>Reading time</dt><dd id="read">0s</dd></div>
</dl>

<div style="margin-top:20px">
  <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:9px">Against common limits</h2>
  <div id="limits" class="limit-list"></div>
</div>`,

  css: `
.limit-list{display:grid;gap:7px}
.limit-row{display:flex;align-items:center;gap:11px;font-size:.88rem}
.limit-row span:first-child{flex:0 0 118px;color:var(--ink-2)}
.limit-bar{flex:1;height:7px;border-radius:999px;background:var(--bg-sunken);overflow:hidden;border:1px solid var(--line)}
.limit-bar i{display:block;height:100%;border-radius:999px;background:var(--accent);transition:width .2s}
.limit-row b{flex:0 0 82px;text-align:right;font-variant-numeric:tabular-nums;font-weight:560;color:var(--ink-3)}
.limit-row.over i{background:var(--danger)}
.limit-row.over b{color:var(--danger)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var txt = $('txt');

  var LIMITS = [
    ['Tweet/X post', 280, 'chars'],
    ['SMS message', 160, 'chars'],
    ['Meta description', 160, 'chars'],
    ['Page title', 60, 'chars'],
    ['Instagram caption', 2200, 'chars'],
    ['LinkedIn post', 3000, 'chars']
  ];

  function count(){
    var v = txt.value;
    var trimmed = v.trim();

    var words = trimmed ? trimmed.split(/\\s+/).length : 0;
    var chars = v.length;
    var nospace = v.replace(/\\s/g, '').length;
    // Sentences end at . ! ? — repeated marks and ellipses count once.
    var sentences = trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+(\\s|$)|[^.!?…]+$/g) || []).length : 0;
    var paragraphs = trimmed ? trimmed.split(/\\n\\s*\\n/).filter(function(p){ return p.trim(); }).length : 0;

    $('words').textContent = words.toLocaleString('en-US');
    $('chars').textContent = chars.toLocaleString('en-US');
    $('nospace').textContent = nospace.toLocaleString('en-US');
    $('sent').textContent = sentences.toLocaleString('en-US');
    $('paras').textContent = paragraphs.toLocaleString('en-US');

    // 238 wpm is the mean silent reading speed for adults reading English prose.
    var seconds = Math.round(words / 238 * 60);
    $('read').textContent = seconds < 60
      ? seconds + 's'
      : Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';

    $('limits').innerHTML = LIMITS.map(function(l){
      var used = chars;
      var pct = Math.min(100, used / l[1] * 100);
      var over = used > l[1];
      return '<div class="limit-row' + (over ? ' over' : '') + '">' +
        '<span>' + l[0] + '</span>' +
        '<span class="limit-bar"><i style="width:' + pct.toFixed(1) + '%"></i></span>' +
        '<b>' + used.toLocaleString('en-US') + ' / ' + l[1].toLocaleString('en-US') + '</b></div>';
    }).join('');
  }

  txt.addEventListener('input', count);
  $('clear').addEventListener('click', function(){ txt.value = ''; count(); txt.focus(); });
  $('paste').addEventListener('click', function(){
    navigator.clipboard.readText().then(function(t){ txt.value = t; count(); });
  });
  count();
})();`,

  answerHeading: 'How words are counted',
  answer: `<p><strong>A word is any run of characters separated by whitespace.</strong> That is the definition used by this tool, by Microsoft Word, and by almost every academic word-count requirement. It means "well-known" counts as one word, "e-mail me" counts as two, and a number like "1,250" counts as one. Character counts come in two forms — with and without spaces — and social platforms almost always mean <em>with</em> spaces, which is the figure to check against a 280-character post limit.</p>`,

  steps: [
    'Paste or type your text into the box.',
    'Watch the counts update live as you edit.',
    'Check the bars underneath if you are writing to a platform limit.',
  ],

  sections: [
    {
      id: 'reading-time',
      h2: 'How reading time is estimated',
      html: `<p>Reading time here assumes <strong>238 words per minute</strong>, the mean silent reading rate for adults reading English prose found in a 2019 meta-analysis of 190 studies. It is a better default than the 200 or 250 wpm figures many tools use.</p>
<div class="table-scroll"><table>
<thead><tr><th>Length</th><th>Approximate reading time</th></tr></thead>
<tbody>
<tr><td>500 words</td><td>2 minutes</td></tr>
<tr><td>1,000 words</td><td>4 minutes</td></tr>
<tr><td>2,000 words</td><td>8.5 minutes</td></tr>
<tr><td>5,000 words</td><td>21 minutes</td></tr>
</tbody></table></div>
<p>Reading aloud is much slower — around 150 wpm — so double the figure shown if you are timing a speech or a script.</p>`,
    },
    {
      id: 'limits',
      h2: 'Common length limits worth knowing',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Limit</th><th>Practical advice</th></tr></thead>
<tbody>
<tr><td>X / Twitter post</td><td>280 characters</td><td>Links count as 23 regardless of real length</td></tr>
<tr><td>SMS</td><td>160 characters</td><td>Longer messages split and may cost more</td></tr>
<tr><td>Search result title</td><td>~60 characters</td><td>Measured in pixels, so wide letters truncate sooner</td></tr>
<tr><td>Meta description</td><td>~160 characters</td><td>Also pixel-based; front-load the important words</td></tr>
<tr><td>Instagram caption</td><td>2,200 characters</td><td>Only the first ~125 show before "more"</td></tr>
<tr><td>UCAS personal statement</td><td>4,000 characters</td><td>Includes spaces; 47 lines maximum</td></tr>
</tbody></table></div>`,
    },
  ],

  faq: [
    { q: 'Does a hyphenated word count as one word or two?', a: '<p>One. Because words are split on whitespace, "well-known" and "mother-in-law" each count as a single word. Most style guides and academic markers use the same convention.</p>' },
    { q: 'Is my text uploaded anywhere?', a: '<p>No. Counting happens entirely in your browser as you type. Nothing is sent to a server, stored, or logged — safe for confidential drafts and coursework.</p>' },
    { q: 'Why does my count differ from Microsoft Word?', a: '<p>Usually by a handful of words, because Word applies slightly different rules to things like numbers with units, standalone symbols and text inside footnotes or text boxes. For an essay limit, a difference of a few words is not normally an issue.</p>' },
    { q: 'How many pages is 1,000 words?', a: '<p>About four pages double-spaced, or two pages single-spaced, in 12pt Times New Roman with one-inch margins. Font and spacing change this considerably.</p>' },
    { q: 'Do characters include spaces?', a: '<p>The tool shows both. "Characters" includes spaces and line breaks, which is what social platforms count. "No spaces" excludes all whitespace, which some academic limits use.</p>' },
  ],

  related: ['text-case-converter', 'typing-speed-test', 'password-strength-checker', 'percentage-calculator'],
};
