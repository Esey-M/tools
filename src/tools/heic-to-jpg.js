export default {
  slug: 'heic-to-jpg',
  category: 'converters',
  title: 'HEIC to JPG – Convert iPhone Photos to JPEG',
  h1: 'HEIC to JPG',
  cardText: 'Convert iPhone HEIC photos to JPG or PNG so anything can open them.',
  description:
    'Free HEIC to JPG converter. Turn iPhone HEIC and HEIF photos into JPG or PNG that open anywhere, converted in your browser with no upload.',
  keywords: ['heic to jpg', 'convert heic', 'heic converter', 'iphone photo format', 'heif to jpeg'],
  updated: '2026-09-04',
  lede: 'Drop in HEIC photos from an iPhone and get JPGs that open on any device. Converted on your machine — the photos are never uploaded.',

  form: `
<div class="drop" id="drop" tabindex="0" role="button" aria-label="Choose HEIC files">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 15 5-5 4 4 3-3 6 6"/><circle cx="8.5" cy="8.5" r="1.5"/>
  </svg>
  <p><strong>Drop HEIC photos here</strong> or click to choose</p>
  <p class="hint">Several at once · nothing is uploaded</p>
  <input type="file" id="file" accept=".heic,.heif,image/heic,image/heif" multiple hidden>
</div>

<div id="controls" hidden>
  <div class="row" style="margin-top:18px">
    <div class="field">
      <label for="format">Convert to</label>
      <select id="format">
        <option value="image/jpeg" selected>JPG — smallest, opens anywhere</option>
        <option value="image/png">PNG — lossless, larger files</option>
      </select>
    </div>
    <div class="field">
      <label for="quality">JPG quality: <strong id="qval">88</strong>%</label>
      <input type="range" id="quality" min="50" max="100" step="2" value="88" style="width:100%;padding:0;border:none;background:transparent">
    </div>
  </div>
  <div class="btn-row">
    <button type="button" class="btn btn-lg" id="go">Convert</button>
    <button type="button" class="btn btn-ghost" id="dlall" hidden>Download all</button>
    <button type="button" class="btn btn-ghost" id="clear">Clear</button>
  </div>
</div>

<div id="list" class="heic-list"></div>
<p class="hint" id="status" style="margin-top:12px"></p>
<p class="notice notice-warn" id="err" hidden style="margin-top:14px"></p>`,

  css: `
.drop{border:2px dashed var(--line-strong);border-radius:var(--radius-lg);padding:34px 20px;text-align:center;
  cursor:pointer;color:var(--ink-2);display:grid;place-items:center;gap:8px;transition:border-color .15s,background .15s}
.drop:hover,.drop:focus-visible,.drop.over{border-color:var(--accent);background:var(--accent-soft)}
.drop p{margin:0}.drop svg{color:var(--ink-3)}
.heic-list{margin-top:20px;display:flex;flex-direction:column;gap:10px}
.heic-item{display:flex;gap:13px;align-items:center;background:var(--bg-raised);border:1px solid var(--line);
  border-radius:var(--radius);padding:11px 13px}
.heic-item img{width:56px;height:56px;object-fit:cover;border-radius:7px;flex:none;background:var(--bg-sunken)}
.heic-item .ph{width:56px;height:56px;border-radius:7px;flex:none;background:var(--bg-sunken);display:grid;
  place-items:center;color:var(--ink-3);font-size:.66rem;font-weight:700}
.heic-meta{flex:1;min-width:0}
.heic-meta b{display:block;font-size:.92rem;font-weight:580;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.heic-meta span{display:block;font-size:.83rem;color:var(--ink-3);margin-top:3px}
.heic-meta .ok{color:var(--accent)}
.heic-meta .bad{color:var(--danger)}
.heic-item .btn{flex:none;padding:7px 13px;font-size:.85rem}`,

  js: `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var items = [];
  var libPromise = null;

  function human(b){ return b < 1048576 ? (b/1024).toFixed(0) + ' KB' : (b/1048576).toFixed(2) + ' MB'; }

  function loadLib(){
    if (libPromise) return libPromise;
    $('status').textContent = 'Loading the HEIC decoder (about 1.3 MB, once per visit)…';
    libPromise = new Promise(function(resolve, reject){
      if (window.heic2any) return resolve(window.heic2any);
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js';
      s.crossOrigin = 'anonymous';
      s.onload = function(){ window.heic2any ? resolve(window.heic2any) : reject(new Error('decoder failed to initialise')); };
      s.onerror = function(){ reject(new Error('could not load the HEIC decoder')); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function render(){
    $('list').innerHTML = items.map(function(it, i){
      var thumb = it.url
        ? '<img alt="" src="' + it.url + '">'
        : '<span class="ph">HEIC</span>';
      var status = it.error
        ? '<span class="bad">' + it.error + '</span>'
        : it.out
          ? '<span class="ok">' + human(it.file.size) + ' → ' + human(it.out.size) + ' ' + it.ext.toUpperCase() + '</span>'
          : '<span>' + human(it.file.size) + (it.working ? ' · converting…' : ' · ready') + '</span>';
      return '<div class="heic-item">' + thumb +
        '<span class="heic-meta"><b>' + it.file.name.replace(/[<>&]/g, '') + '</b>' + status + '</span>' +
        (it.out ? '<button type="button" class="btn" data-i="' + i + '">Save</button>' : '') + '</div>';
    }).join('');
    $('controls').hidden = items.length === 0;
    $('dlall').hidden = items.filter(function(i){ return i.out; }).length < 2;
  }

  function addFiles(fileList){
    var accepted = [].slice.call(fileList).filter(function(f){
      return /\\.(heic|heif)$/i.test(f.name) || /^image\\/(heic|heif)/.test(f.type);
    });
    var skipped = fileList.length - accepted.length;
    $('err').hidden = skipped === 0;
    if (skipped) $('err').textContent = skipped + ' file' + (skipped > 1 ? 's were' : ' was') +
      ' skipped — this tool only converts HEIC and HEIF files.';
    if (!accepted.length) return;
    accepted.forEach(function(f){ items.push({ file: f }); });
    render();
  }

  function convertAll(){
    if (!items.length) return;
    $('go').disabled = true;
    $('go').textContent = 'Converting…';
    $('err').hidden = true;

    var type = $('format').value;
    var ext = type === 'image/png' ? 'png' : 'jpg';
    var quality = parseInt($('quality').value, 10) / 100;

    loadLib().then(function(heic2any){
      $('status').textContent = 'Converting ' + items.length + ' file' + (items.length > 1 ? 's' : '') + '…';
      var chain = Promise.resolve();
      items.forEach(function(it){
        if (it.out) return;
        chain = chain.then(function(){
          it.working = true; it.error = null; render();
          return heic2any({ blob: it.file, toType: type, quality: quality })
            .then(function(result){
              var blob = Array.isArray(result) ? result[0] : result;
              it.out = blob;
              it.ext = ext;
              it.url = URL.createObjectURL(blob);
              it.working = false;
              render();
            })
            .catch(function(e){
              it.working = false;
              it.error = 'Could not convert — ' + (e && e.message ? e.message : 'unsupported file');
              render();
            });
        });
      });
      return chain;
    }).then(function(){
      var done = items.filter(function(i){ return i.out; }).length;
      $('status').textContent = done + ' of ' + items.length + ' converted.';
      $('go').disabled = false;
      $('go').textContent = 'Convert';
      render();
    }).catch(function(e){
      $('err').hidden = false;
      $('err').textContent = e.message + '. Check your connection and try again.';
      $('status').textContent = '';
      $('go').disabled = false;
      $('go').textContent = 'Convert';
    });
  }

  function download(it){
    var a = document.createElement('a');
    a.href = it.url;
    a.download = it.file.name.replace(/\\.(heic|heif)$/i, '') + '.' + it.ext;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  var drop = $('drop');
  drop.addEventListener('click', function(){ $('file').click(); });
  drop.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('file').click(); } });
  $('file').addEventListener('change', function(){ addFiles(this.files); this.value = ''; });
  ['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function(e){ addFiles(e.dataTransfer.files); });

  $('list').addEventListener('click', function(e){
    var b = e.target.closest('button[data-i]'); if (!b) return;
    download(items[parseInt(b.getAttribute('data-i'), 10)]);
  });
  $('dlall').addEventListener('click', function(){
    items.filter(function(i){ return i.out; }).forEach(function(it, i){
      setTimeout(function(){ download(it); }, i * 260);
    });
  });
  $('go').addEventListener('click', convertAll);
  $('quality').addEventListener('input', function(){ $('qval').textContent = this.value; });
  $('clear').addEventListener('click', function(){
    items.forEach(function(i){ if (i.url) URL.revokeObjectURL(i.url); });
    items = []; render(); $('status').textContent = ''; $('err').hidden = true;
  });
})();`,

  answerHeading: 'Why iPhone photos are HEIC',
  answer: `<p><strong>HEIC stores the same photo at roughly half the size of JPEG, which is why Apple made it the default in iOS 11.</strong> It uses HEVC compression — the same technology behind 4K video — to keep more detail in a smaller file, and it also supports transparency, 16-bit colour and Live Photos. The problem is compatibility: Windows needs a codec, many websites reject the format outright, and older software cannot open it at all. Converting to JPG trades some efficiency for the ability to open the file anywhere.</p>`,

  steps: [
    'Drop in the HEIC files from your iPhone or Photos library.',
    'Choose JPG for compatibility, or PNG if you need lossless.',
    'Press convert. The decoder downloads once, then works locally.',
    'Save each file, or use <strong>Download all</strong>.',
  ],

  sections: [
    {
      id: 'stop-heic',
      h2: 'Stop your iPhone producing HEIC in the first place',
      html: `<p>If you convert these regularly, change the setting instead.</p>
<p><strong>To shoot JPEG from now on:</strong> Settings → Camera → Formats → choose <em>Most Compatible</em>. Photos are larger but open everywhere.</p>
<p><strong>To keep shooting HEIC but export JPEG:</strong> Settings → Photos → Transfer to Mac or PC → choose <em>Automatic</em>. Your iPhone then converts on the way out, which is usually the better arrangement — you keep the storage saving on the phone and get compatible files off it.</p>
<p><strong>On a Mac:</strong> open the HEIC in Preview and use File → Export, choosing JPEG. For a batch, select several in Finder, right-click and use Quick Actions → Convert Image.</p>`,
    },
    {
      id: 'formats',
      h2: 'HEIC, JPG and PNG compared',
      html: `<div class="table-scroll"><table>
<thead><tr><th></th><th>HEIC</th><th>JPG</th><th>PNG</th></tr></thead>
<tbody>
<tr><td>File size for a photo</td><td>Smallest</td><td>About double HEIC</td><td>Much larger</td></tr>
<tr><td>Compression</td><td>Lossy</td><td>Lossy</td><td>Lossless</td></tr>
<tr><td>Transparency</td><td>Yes</td><td>No</td><td>Yes</td></tr>
<tr><td>Opens everywhere</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Best for</td><td>Storage on Apple devices</td><td>Sharing photos</td><td>Screenshots, graphics</td></tr>
</tbody></table></div>
<p>Converting HEIC to JPG re-encodes the image, so a small amount of quality is lost. At 88% quality it is not visible at normal viewing sizes. Choose PNG if the file is a screenshot or contains text.</p>`,
    },
    {
      id: 'privacy',
      h2: 'What is fetched, and what is not',
      html: `<p>HEIC decoding needs a codec that browsers do not expose, so this page fetches an open-source decoder (heic2any, about 1.3 MB) from a public CDN the first time you convert.</p>
<p>That is one request for library code. <strong>Your photos are not part of it.</strong> They are read from your device, decoded in memory and written back out as downloads — nothing is transmitted. As with the other file tools here, you can confirm that in your browser's network tab.</p>`,
    },
  ],

  faq: [
    { q: 'Are my photos uploaded?', a: '<p>No. Only the decoder library is fetched from a CDN. Your images are decoded and converted entirely on your device.</p>' },
    { q: 'Why can I not open HEIC on Windows?', a: '<p>Windows needs the HEIF Image Extensions from the Microsoft Store, and on some versions the HEVC codec as well, which is a paid extension. Converting to JPG avoids the problem entirely.</p>' },
    { q: 'Does converting lose quality?', a: '<p>A little, since JPEG is lossy and the image is re-encoded. At the default 88% quality the difference is not visible at normal sizes. Choose PNG for lossless output.</p>' },
    { q: 'How do I stop my iPhone saving HEIC?', a: '<p>Settings → Camera → Formats → Most Compatible. Or leave it and set Settings → Photos → Transfer to Mac or PC → Automatic, so transfers convert for you.</p>' },
    { q: 'Can I convert many at once?', a: '<p>Yes. Add as many as you like — they convert one after another so the browser stays responsive.</p>' },
    { q: 'Why is the first conversion slow?', a: '<p>The decoder downloads on first use, about 1.3 MB. After that it is cached and conversions are much quicker.</p>' },
  ],

  related: ['image-compressor', 'image-resizer', 'image-to-pdf', 'photo-cropper'],
};
