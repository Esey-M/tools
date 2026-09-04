export default {
  slug: 'text-case-converter',
  category: 'text',
  title: 'Text Case Converter – Upper, Lower, Title and Sentence Case',
  h1: 'Text Case Converter',
  cardText: 'Switch text between upper, lower, title, sentence and other cases.',
  description:
    'Free text case converter. Change text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case or kebab-case instantly in your browser.',
  keywords: ['text case converter', 'uppercase to lowercase', 'title case converter', 'change text case', 'capitalize text'],
  updated: '2026-09-04',
  lede: 'Paste text, pick a case, and copy the result. Useful for fixing a caps-lock accident or formatting a heading properly.',

  form: `
<div class="field">
  <label for="txt">Your text</label>
  <textarea id="txt" rows="6" placeholder="Paste or type your text here…" style="min-height:130px"></textarea>
</div>

<div class="field">
  <span class="field-label" id="case-label">Convert to</span>
  <div class="case-grid" role="group" aria-labelledby="case-label" id="cases">
    <button type="button" class="btn btn-ghost" data-c="upper">UPPER CASE</button>
    <button type="button" class="btn btn-ghost" data-c="lower">lower case</button>
    <button type="button" class="btn btn-ghost" data-c="title">Title Case</button>
    <button type="button" class="btn btn-ghost" data-c="sentence">Sentence case</button>
    <button type="button" class="btn btn-ghost" data-c="camel">camelCase</button>
    <button type="button" class="btn btn-ghost" data-c="pascal">PascalCase</button>
    <button type="button" class="btn btn-ghost" data-c="snake">snake_case</button>
    <button type="button" class="btn btn-ghost" data-c="kebab">kebab-case</button>
    <button type="button" class="btn btn-ghost" data-c="alternating">aLtErNaTiNg</button>
    <button type="button" class="btn btn-ghost" data-c="invert">iNVERT cASE</button>
  </div>
</div>

<div class="field">
  <label for="outtxt">Result</label>
  <textarea id="outtxt" rows="6" readonly style="min-height:130px;background:var(--bg-sunken)"></textarea>
</div>
<div class="btn-row">
  <button type="button" class="btn" id="copy">Copy result</button>
  <button type="button" class="btn btn-ghost" id="swap">Use result as input</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear</button>
</div>
<p class="hint" id="stats" style="margin-top:12px"></p>`,

  css: `
.case-grid{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(148px,1fr))}
.case-grid .btn{justify-content:flex-start;font-size:.88rem;padding:9px 13px}
.case-grid .btn[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var current = 'upper';

  // Words kept lowercase inside a title, unless they are first or last.
  var MINOR = ('a an and as at but by for in nor of on or per so the to up via vs with from into onto over than that ' +
               'till upon when yet if').split(' ');

  function words(s){
    return s
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')     // split camelCase
      .replace(/[_\\-]+/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();
  }

  function titleCase(s){
    // Preserve line breaks; treat each line as its own title.
    return s.split('\\n').map(function(line){
      var parts = line.toLowerCase().split(/(\\s+)/);
      var wordIndexes = [];
      parts.forEach(function(p, i){ if (p.trim()) wordIndexes.push(i); });
      return parts.map(function(p, i){
        if (!p.trim()) return p;
        var first = i === wordIndexes[0];
        var last = i === wordIndexes[wordIndexes.length - 1];
        var bare = p.replace(/[^a-z']/g, '');
        if (!first && !last && MINOR.indexOf(bare) > -1) return p;
        return p.replace(/[a-z]/, function(c){ return c.toUpperCase(); });
      }).join('');
    }).join('\\n');
  }

  function sentenceCase(s){
    var lower = s.toLowerCase();
    // Capitalise after a sentence end, and the standalone pronoun "I".
    return lower
      .replace(/(^|[.!?]\\s+|\\n\\s*)([a-z])/g, function(_, pre, ch){ return pre + ch.toUpperCase(); })
      .replace(/\\bi\\b/g, 'I');
  }

  var CONVERT = {
    upper: function(s){ return s.toUpperCase(); },
    lower: function(s){ return s.toLowerCase(); },
    title: titleCase,
    sentence: sentenceCase,
    camel: function(s){
      var w = words(s).toLowerCase().split(' ');
      return w.map(function(x, i){ return i ? x.charAt(0).toUpperCase() + x.slice(1) : x; }).join('');
    },
    pascal: function(s){
      return words(s).toLowerCase().split(' ')
        .map(function(x){ return x.charAt(0).toUpperCase() + x.slice(1); }).join('');
    },
    snake: function(s){ return words(s).toLowerCase().replace(/ /g, '_'); },
    kebab: function(s){ return words(s).toLowerCase().replace(/ /g, '-'); },
    alternating: function(s){
      var n = 0;
      return s.replace(/[a-z]/gi, function(c){ return (n++ % 2) ? c.toUpperCase() : c.toLowerCase(); });
    },
    invert: function(s){
      return s.replace(/[a-z]/gi, function(c){
        return c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase();
      });
    }
  };

  function run(){
    var src = $('txt').value;
    var out = src ? CONVERT[current](src) : '';
    $('outtxt').value = out;
    var w = src.trim() ? src.trim().split(/\\s+/).length : 0;
    $('stats').textContent = src ? w.toLocaleString('en-US') + (w === 1 ? ' word' : ' words') + '  ·  ' +
      src.length.toLocaleString('en-US') + ' characters' : '';
  }

  $('cases').addEventListener('click', function(e){
    var b = e.target.closest('button[data-c]'); if (!b) return;
    current = b.getAttribute('data-c');
    var btns = $('cases').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    run();
  });
  $('txt').addEventListener('input', run);
  $('copy').addEventListener('click', function(){
    if (!$('outtxt').value) return;
    navigator.clipboard.writeText($('outtxt').value).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy result'; }, 1400);
    });
  });
  $('swap').addEventListener('click', function(){ $('txt').value = $('outtxt').value; run(); });
  $('clear').addEventListener('click', function(){ $('txt').value = ''; run(); $('txt').focus(); });

  $('cases').querySelector('button').setAttribute('aria-pressed', 'true');
  run();
})();`,

  answerHeading: 'Which case to use where',
  answer: `<p><strong>Title Case capitalises the important words and leaves short joining words lowercase</strong> — "The Rise of the Machines", not "The Rise Of The Machines". Sentence case capitalises only the first word and proper nouns, and is now the house style for headings at most publications because it reads faster. The programming cases each belong to a convention: camelCase for JavaScript variables, PascalCase for class names, snake_case for Python, and kebab-case for URLs and CSS.</p>`,

  steps: [
    'Paste your text into the top box.',
    'Click the case you want. The result appears immediately.',
    'Copy the result, or press <strong>Use result as input</strong> to apply another conversion on top.',
  ],

  sections: [
    {
      id: 'title-rules',
      h2: 'The Title Case rules this tool follows',
      html: `<p>Title case is less standardised than people assume — AP, Chicago and MLA disagree on the details. This tool follows the most widely shared conventions:</p>
<ul>
<li>Capitalise the <strong>first and last word</strong>, always.</li>
<li>Capitalise nouns, verbs, adjectives, adverbs and pronouns.</li>
<li>Leave articles (<em>a, an, the</em>), short prepositions (<em>in, on, at, to, of, for, by</em>) and conjunctions (<em>and, but, or, nor</em>) lowercase.</li>
</ul>
<p>Where the guides differ most is prepositions of four or more letters. Chicago keeps them lowercase; AP capitalises anything of four letters or more. If you are writing to a specific style guide, check the result rather than assuming.</p>`,
    },
    {
      id: 'programming',
      h2: 'Programming case conventions',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Case</th><th>Example</th><th>Conventionally used for</th></tr></thead>
<tbody>
<tr><td>camelCase</td><td><code>userAccountName</code></td><td>JavaScript and Java variables and functions</td></tr>
<tr><td>PascalCase</td><td><code>UserAccountName</code></td><td>Class and component names</td></tr>
<tr><td>snake_case</td><td><code>user_account_name</code></td><td>Python, Ruby, database columns</td></tr>
<tr><td>kebab-case</td><td><code>user-account-name</code></td><td>URLs, CSS classes, HTML attributes</td></tr>
<tr><td>SCREAMING_SNAKE</td><td><code>MAX_RETRY_COUNT</code></td><td>Constants in most languages</td></tr>
</tbody></table></div>
<p>The converter recognises input in any of these forms, so you can paste <code>userAccountName</code> and convert straight to <code>user-account-name</code> without adding spaces first.</p>`,
    },
  ],

  faq: [
    { q: 'How do I fix text I typed with caps lock on?', a: '<p>Paste it in and choose <strong>Sentence case</strong>. That lowercases everything and then capitalises the first letter of each sentence, which is almost always what you want. Check proper nouns afterwards, since no tool can reliably identify every name.</p>' },
    { q: 'What is the difference between Title Case and Sentence case?', a: '<p>Title Case capitalises most words in a heading. Sentence case capitalises only the first word and proper nouns, exactly like an ordinary sentence. Most modern publications prefer sentence case for headings.</p>' },
    { q: 'Does it handle accented characters?', a: '<p>Yes for upper, lower, sentence and title case, which use the browser’s Unicode-aware case mapping. The programming cases strip accents and punctuation, since identifiers generally cannot contain them.</p>' },
    { q: 'Is my text sent anywhere?', a: '<p>No. Conversion happens entirely in your browser. Nothing is uploaded, logged or stored.</p>' },
    { q: 'Why did a proper noun stay lowercase in sentence case?', a: '<p>Because identifying names requires understanding meaning, not just letters. Sentence case lowercases everything and then capitalises sentence starts, so names in the middle of a sentence need fixing by hand.</p>' },
  ],

  related: ['word-counter', 'typing-speed-test', 'password-generator', 'qr-code-generator'],
};
