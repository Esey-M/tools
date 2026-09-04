export default {
  slug: 'voice-to-text',
  category: 'converters',
  title: 'Voice to Text – Dictate and Copy, Free',
  h1: 'Voice to Text',
  cardText: 'Dictate into your browser and copy the text out. No account.',
  description:
    'Free voice to text. Dictate with your microphone and get editable text you can copy, with punctuation commands and a choice of languages. No signup.',
  keywords: ['voice to text', 'speech to text free', 'dictation online', 'transcribe voice', 'talk to type'],
  updated: '2026-09-04',
  lede: 'Press record and talk. The text appears as you speak and stays editable — say "full stop" or "comma" to punctuate.',

  form: `
<div class="row">
  <div class="field">
    <label for="lang">Language</label>
    <select id="lang">
      <option value="en-GB">English (UK)</option>
      <option value="en-US" selected>English (US)</option>
      <option value="en-AU">English (Australia)</option>
      <option value="en-IN">English (India)</option>
      <option value="es-ES">Spanish</option>
      <option value="fr-FR">French</option>
      <option value="de-DE">German</option>
      <option value="it-IT">Italian</option>
      <option value="pt-BR">Portuguese (Brazil)</option>
      <option value="nl-NL">Dutch</option>
      <option value="hi-IN">Hindi</option>
      <option value="ja-JP">Japanese</option>
      <option value="ko-KR">Korean</option>
      <option value="zh-CN">Chinese (Mandarin)</option>
      <option value="ar-SA">Arabic</option>
    </select>
  </div>
  <div class="field">
    <span class="field-label">Options</span>
    <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);padding-top:8px">
      <input type="checkbox" id="autocap" checked style="width:auto"> Capitalise after full stops
    </label>
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="rec">Start recording</button>
  <button type="button" class="btn btn-ghost" id="copy">Copy text</button>
  <button type="button" class="btn btn-ghost" id="clear">Clear</button>
</div>

<div class="vt-status" id="status">Ready. Press start and allow microphone access.</div>

<div class="field" style="margin-top:16px">
  <label for="text">Transcript <span class="hint">(editable)</span></label>
  <textarea id="text" rows="10" style="min-height:220px"></textarea>
  <span class="hint" id="count"></span>
</div>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.vt-status{margin-top:14px;padding:11px 14px;border-radius:var(--radius-sm);background:var(--bg-sunken);
  border:1px solid var(--line);font-size:.9rem;color:var(--ink-2);display:flex;align-items:center;gap:10px}
.vt-status.live{background:var(--accent-soft);border-color:var(--accent);color:var(--accent-ink)}
.vt-status.live::before{content:"";width:11px;height:11px;border-radius:50%;background:var(--danger);
  animation:vtpulse 1.2s ease-in-out infinite;flex:none}
@keyframes vtpulse{0%,100%{opacity:1}50%{opacity:.25}}
@media (prefers-reduced-motion: reduce){.vt-status.live::before{animation:none}}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null, listening = false, committed = '';

  if (!SR) {
    $('err').hidden = false;
    $('err').textContent = 'This browser does not support speech recognition. It works in Chrome, Edge and Safari; Firefox does not currently support it.';
    $('rec').disabled = true;
    $('status').textContent = 'Speech recognition unavailable in this browser.';
    return;
  }

  // Spoken punctuation, applied after recognition returns.
  var PUNCT = [
    [/\\b(full stop|period)\\b/gi, '.'],
    [/\\bcomma\\b/gi, ','],
    [/\\bquestion mark\\b/gi, '?'],
    [/\\bexclamation (mark|point)\\b/gi, '!'],
    [/\\bcolon\\b/gi, ':'],
    [/\\bsemicolon\\b/gi, ';'],
    [/\\b(new line|newline)\\b/gi, '\\n'],
    [/\\b(new paragraph)\\b/gi, '\\n\\n'],
    [/\\bopen quote\\b/gi, '“'],
    [/\\bclose quote\\b/gi, '”'],
    [/\\bdash\\b/gi, '—']
  ];

  function applyPunctuation(s){
    PUNCT.forEach(function(p){ s = s.replace(p[0], p[1]); });
    // Tidy spacing around inserted marks.
    s = s.replace(/\\s+([.,!?;:])/g, '$1').replace(/([.,!?;:])(?=\\S)/g, '$1 ');
    s = s.replace(/ *\\n */g, '\\n');
    if ($('autocap').checked) {
      s = s.replace(/(^|[.!?]\\s+|\\n\\s*)([a-z])/g, function(_, pre, ch){ return pre + ch.toUpperCase(); });
    }
    return s;
  }

  function updateCount(){
    var t = $('text').value.trim();
    var w = t ? t.split(/\\s+/).length : 0;
    $('count').textContent = w.toLocaleString('en-US') + (w === 1 ? ' word' : ' words');
  }

  function start(){
    recognition = new SR();
    recognition.lang = $('lang').value;
    recognition.continuous = true;
    recognition.interimResults = true;

    committed = $('text').value;
    if (committed && !/\\s$/.test(committed)) committed += ' ';

    recognition.onstart = function(){
      listening = true;
      $('rec').textContent = 'Stop recording';
      $('status').className = 'vt-status live';
      $('status').textContent = 'Listening — speak normally. Say “full stop” or “comma” to punctuate.';
      $('err').hidden = true;
    };

    recognition.onresult = function(e){
      var interim = '';
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) committed += applyPunctuation(chunk) + ' ';
        else interim += chunk;
      }
      $('text').value = committed + interim;
      $('text').scrollTop = $('text').scrollHeight;
      updateCount();
    };

    recognition.onerror = function(e){
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      $('err').hidden = false;
      $('err').textContent = e.error === 'not-allowed'
        ? 'Microphone access was blocked. Allow it in your browser’s address bar and try again.'
        : 'Recognition error: ' + e.error;
    };

    recognition.onend = function(){
      // Browsers stop after a pause; restart automatically while still recording.
      if (listening) { try { recognition.start(); } catch (err) {} }
      else {
        $('rec').textContent = 'Start recording';
        $('status').className = 'vt-status';
        $('status').textContent = 'Stopped. Your text stays in the box and is editable.';
      }
    };

    try { recognition.start(); }
    catch (err) {
      $('err').hidden = false;
      $('err').textContent = 'Could not start: ' + err.message;
    }
  }

  function stop(){
    listening = false;
    if (recognition) recognition.stop();
  }

  $('rec').addEventListener('click', function(){ listening ? stop() : start(); });
  $('clear').addEventListener('click', function(){ $('text').value = ''; committed = ''; updateCount(); });
  $('copy').addEventListener('click', function(){
    if (!$('text').value) return;
    navigator.clipboard.writeText($('text').value).then(function(){
      var b = $('copy'); b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy text'; }, 1400);
    });
  });
  $('text').addEventListener('input', function(){ committed = this.value; updateCount(); });
  $('lang').addEventListener('change', function(){ if (listening) { stop(); setTimeout(start, 300); } });

  updateCount();
})();`,

  answerHeading: 'Where your voice actually goes',
  answer: `<p><strong>This is the one place on the site worth reading carefully.</strong> Browser speech recognition uses the Web Speech API, and in Chrome and Edge that means your audio is sent to Google's or Microsoft's servers for processing — it is not done on your device. Safari on recent Apple systems can process some dictation locally. Firefox does not support the API at all. So this tool is genuinely free and works well, but it is <em>not</em> private in the way the rest of this site is. Do not dictate anything confidential.</p>`,

  steps: [
    'Pick your language and press <strong>Start recording</strong>.',
    'Allow microphone access when your browser asks.',
    'Speak normally. Say "full stop", "comma" or "new paragraph" to punctuate.',
    'Edit the text directly in the box, then copy it.',
  ],

  sections: [
    {
      id: 'commands',
      h2: 'Punctuation commands',
      html: `<div class="table-scroll"><table>
<thead><tr><th>Say</th><th>Get</th></tr></thead>
<tbody>
<tr><td>"full stop" or "period"</td><td>.</td></tr>
<tr><td>"comma"</td><td>,</td></tr>
<tr><td>"question mark"</td><td>?</td></tr>
<tr><td>"exclamation mark"</td><td>!</td></tr>
<tr><td>"colon" / "semicolon"</td><td>: ;</td></tr>
<tr><td>"new line"</td><td>A line break</td></tr>
<tr><td>"new paragraph"</td><td>A blank line</td></tr>
<tr><td>"dash"</td><td>—</td></tr>
</tbody></table></div>`,
    },
    {
      id: 'accuracy',
      h2: 'Getting better accuracy',
      html: `<ul>
<li><strong>Speak at a normal pace.</strong> Slowing down and over-enunciating makes recognition worse, not better — the models are trained on natural speech.</li>
<li><strong>Reduce background noise.</strong> Music and other voices confuse it far more than volume does.</li>
<li><strong>Get closer to the microphone</strong>, but not so close that you produce plosives.</li>
<li><strong>Pick the right regional variant.</strong> English (UK) versus English (US) meaningfully changes accuracy on accents and vocabulary.</li>
<li><strong>Dictate in sentences.</strong> Longer stretches give the model context, and context is where most of its accuracy comes from.</li>
<li><strong>Expect to edit.</strong> Names, technical terms and homophones will need fixing — the box is editable for that reason.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Is my voice sent to a server?', a: '<p>In Chrome and Edge, yes — audio goes to Google or Microsoft for processing. Safari on recent Apple systems can handle some dictation on-device. This is a property of the browser API, not of this page, and it is why you should not dictate anything confidential.</p>' },
    { q: 'Why does it not work in Firefox?', a: '<p>Firefox does not implement the Web Speech recognition API. Use Chrome, Edge or Safari.</p>' },
    { q: 'Why does it stop after a while?', a: '<p>Browsers end a recognition session after a pause. This page restarts it automatically while recording is on, so you should not notice — though very long sessions may occasionally need restarting manually.</p>' },
    { q: 'Can I dictate in other languages?', a: '<p>Yes, fifteen are listed. Recognition quality varies considerably by language and accent.</p>' },
    { q: 'How do I add punctuation?', a: '<p>Say it. "Full stop", "comma", "question mark" and the others in the table above are converted automatically.</p>' },
    { q: 'Does it work on a phone?', a: '<p>Yes, in Chrome on Android and Safari on iOS. On a phone, your keyboard’s built-in dictation button often works just as well.</p>' },
  ],

  related: ['text-to-speech', 'word-counter', 'text-case-converter', 'typing-speed-test'],
};
