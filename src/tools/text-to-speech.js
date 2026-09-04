export default {
  slug: 'text-to-speech',
  category: 'converters',
  title: 'Text to Speech – Read Any Text Aloud, Free',
  h1: 'Text to Speech',
  cardText: 'Have any text read aloud, with speed and voice control.',
  description:
    'Free text to speech. Paste any text and have it read aloud using your device’s built-in voices, with speed, pitch and language control. No signup.',
  keywords: ['text to speech', 'read text aloud', 'tts free', 'text reader', 'speech synthesis'],
  updated: '2026-09-04',
  lede: 'Paste text and press play. Uses the voices built into your device, so nothing is uploaded and there is no character limit.',

  form: `
<div class="field">
  <label for="text">Text to read</label>
  <textarea id="text" rows="8" style="min-height:170px">Paste or type anything here and press play. This tool uses the speech voices already built into your device, so your text is never uploaded and there is no limit on how much you can read.</textarea>
  <span class="hint" id="count"></span>
</div>

<div class="row">
  <div class="field">
    <label for="voice">Voice</label>
    <select id="voice"></select>
  </div>
  <div class="field">
    <label for="rate">Speed: <strong id="rval">1.0</strong>×</label>
    <input type="range" id="rate" min="0.5" max="2" step="0.1" value="1" style="width:100%;padding:0;border:none;background:transparent">
  </div>
  <div class="field">
    <label for="pitch">Pitch: <strong id="pval">1.0</strong></label>
    <input type="range" id="pitch" min="0.5" max="1.6" step="0.1" value="1" style="width:100%;padding:0;border:none;background:transparent">
  </div>
</div>

<div class="btn-row">
  <button type="button" class="btn btn-lg" id="play">▶ Play</button>
  <button type="button" class="btn btn-ghost" id="pause" disabled>Pause</button>
  <button type="button" class="btn btn-ghost" id="stop" disabled>Stop</button>
</div>

<p class="hint" id="status" style="margin-top:12px"></p>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var synth = window.speechSynthesis;
  var voices = [];
  var utterance = null;

  if (!synth) {
    $('err').hidden = false;
    $('err').textContent = 'This browser does not support speech synthesis. Try Chrome, Edge, Safari or Firefox.';
    $('play').disabled = true;
    return;
  }

  function loadVoices(){
    voices = synth.getVoices();
    if (!voices.length) return;
    // Group by language so the list is navigable.
    voices.sort(function(a, b){
      if (a.lang === b.lang) return a.name.localeCompare(b.name);
      return a.lang.localeCompare(b.lang);
    });
    var uiLang = navigator.language || 'en-US';
    $('voice').innerHTML = voices.map(function(v, i){
      return '<option value="' + i + '">' + v.name + ' — ' + v.lang + (v.localService ? '' : ' (network)') + '</option>';
    }).join('');
    // Default to a voice matching the browser language.
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang === uiLang) { $('voice').value = i; break; }
      if (voices[i].lang.slice(0, 2) === uiLang.slice(0, 2) && $('voice').value === '0') $('voice').value = i;
    }
    $('status').textContent = voices.length + ' voices available on this device.';
  }

  loadVoices();
  synth.onvoiceschanged = loadVoices;

  function updateCount(){
    var t = $('text').value;
    var words = t.trim() ? t.trim().split(/\\s+/).length : 0;
    // Roughly 150 spoken words per minute at normal speed.
    var seconds = words / 150 * 60 / parseFloat($('rate').value);
    $('count').textContent = words.toLocaleString('en-US') + ' words · about ' +
      (seconds < 60 ? Math.round(seconds) + ' seconds' : Math.round(seconds / 60) + ' minutes') + ' to read aloud';
  }

  function speak(){
    var text = $('text').value.trim();
    if (!text) return;
    synth.cancel();

    utterance = new SpeechSynthesisUtterance(text);
    var v = voices[parseInt($('voice').value, 10)];
    if (v) { utterance.voice = v; utterance.lang = v.lang; }
    utterance.rate = parseFloat($('rate').value);
    utterance.pitch = parseFloat($('pitch').value);

    utterance.onstart = function(){
      $('play').textContent = '▶ Playing';
      $('pause').disabled = false; $('stop').disabled = false;
      $('status').textContent = 'Speaking…';
    };
    utterance.onend = function(){
      $('play').textContent = '▶ Play';
      $('pause').disabled = true; $('stop').disabled = true;
      $('status').textContent = 'Finished.';
    };
    utterance.onerror = function(e){
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      $('err').hidden = false;
      $('err').textContent = 'Speech failed: ' + e.error + '. Try a different voice.';
    };

    synth.speak(utterance);
  }

  $('play').addEventListener('click', function(){
    if (synth.paused) { synth.resume(); $('pause').textContent = 'Pause'; return; }
    speak();
  });
  $('pause').addEventListener('click', function(){
    if (synth.paused) { synth.resume(); this.textContent = 'Pause'; $('status').textContent = 'Speaking…'; }
    else { synth.pause(); this.textContent = 'Resume'; $('status').textContent = 'Paused.'; }
  });
  $('stop').addEventListener('click', function(){
    synth.cancel();
    $('play').textContent = '▶ Play';
    $('pause').disabled = true; $('stop').disabled = true;
    $('pause').textContent = 'Pause';
    $('status').textContent = 'Stopped.';
  });

  $('rate').addEventListener('input', function(){ $('rval').textContent = parseFloat(this.value).toFixed(1); updateCount(); });
  $('pitch').addEventListener('input', function(){ $('pval').textContent = parseFloat(this.value).toFixed(1); });
  $('text').addEventListener('input', updateCount);

  // Some browsers keep speaking after navigation without this.
  window.addEventListener('beforeunload', function(){ synth.cancel(); });

  updateCount();
})();`,

  answerHeading: 'How this reads text aloud',
  answer: `<p><strong>It uses the Web Speech API, which hands your text to the speech voices already installed on your device.</strong> That is the same engine behind your operating system's screen reader — Siri's voices on a Mac or iPhone, the Google voices on Android, and the Microsoft voices on Windows. Because the synthesis happens locally on most systems, there is no character limit, no queue and no upload. The trade-off is that the available voices depend entirely on your device rather than on this site.</p>`,

  steps: [
    'Paste or type your text.',
    'Pick a voice — the list is whatever your device has installed.',
    'Adjust the speed. 1.3–1.5× is comfortable for proofreading.',
    'Press play. You can pause and resume at any point.',
  ],

  sections: [
    {
      id: 'uses',
      h2: 'What this is genuinely useful for',
      html: `<ul>
<li><strong>Proofreading.</strong> Hearing your own writing read back catches clumsy sentences and missing words far better than reading it silently — your eye skips over errors your ear will not.</li>
<li><strong>Long articles.</strong> Paste and listen while doing something else.</li>
<li><strong>Language learning.</strong> Choosing a voice in the target language gives you a pronunciation reference for any text.</li>
<li><strong>Accessibility.</strong> Useful for dyslexia and visual impairment, though a dedicated screen reader is better for navigating a whole interface.</li>
<li><strong>Checking scripts.</strong> Timing a presentation or video script by listening at normal pace.</li>
</ul>`,
    },
    {
      id: 'voices',
      h2: 'Why your voice list looks different from someone else’s',
      html: `<p>Voices come from your operating system, not from this page, so the list varies by device.</p>
<div class="table-scroll"><table>
<thead><tr><th>Platform</th><th>Typically offers</th></tr></thead>
<tbody>
<tr><td>macOS and iOS</td><td>The Siri voice set, plus downloadable high-quality voices in System Settings → Accessibility → Spoken Content</td></tr>
<tr><td>Windows</td><td>Microsoft voices; more languages can be added under Settings → Time &amp; Language → Speech</td></tr>
<tr><td>Android</td><td>Google text-to-speech voices, downloadable per language</td></tr>
<tr><td>Chrome on desktop</td><td>System voices plus several Google network voices</td></tr>
</tbody></table></div>
<p>Voices marked "network" are synthesised on the provider's servers rather than your device, which sounds better but does send the text to them. Local voices keep everything on your machine.</p>`,
    },
  ],

  faq: [
    { q: 'Is my text uploaded anywhere?', a: '<p>Not for local voices, which is most of them — synthesis happens on your device. Voices marked "network" are processed by the browser vendor’s servers. Choose a local voice if the text is sensitive.</p>' },
    { q: 'Is there a character limit?', a: '<p>No. Because it uses your device’s own engine rather than a paid API, you can read documents of any length.</p>' },
    { q: 'Why does it sound robotic?', a: '<p>Older system voices are noticeably synthetic. Most platforms offer higher-quality voices as an optional download — on a Mac, look under Accessibility → Spoken Content → System Voice → Manage Voices.</p>' },
    { q: 'Can I download the audio as a file?', a: '<p>Not through this API — it plays audio but does not expose a downloadable file. Recording your system audio output is the usual workaround.</p>' },
    { q: 'Why does it stop partway through long text?', a: '<p>Some browsers cut off very long utterances. If that happens, split the text into a few sections and play them in turn.</p>' },
    { q: 'Does it work on my phone?', a: '<p>Yes, on both iOS and Android. On iOS the ringer switch must not be on silent, or you will see it playing but hear nothing.</p>' },
  ],

  related: ['word-counter', 'text-case-converter', 'typing-speed-test', 'signature-maker'],
};
