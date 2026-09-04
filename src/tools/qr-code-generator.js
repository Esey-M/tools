import fs from 'node:fs';

// The encoder is inlined so the page stays a single request and works offline.
const encoderSource = fs.readFileSync(new URL('../lib/qrcode.js', import.meta.url), 'utf8');

const toolJs = `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var kind = 'text';
  var current = null;

  function wifiPayload(){
    // Backslash, semicolon, comma, colon and quote must be escaped in WIFI: strings.
    var esc = function(s){ return String(s).replace(/([\\\\;,:"])/g, '\\\\$1'); };
    var enc = $('w-enc').value;
    var ssid = esc($('w-ssid').value);
    var pass = esc($('w-pass').value);
    var hidden = $('w-hidden').checked ? 'H:true;' : '';
    if (enc === 'nopass') return 'WIFI:T:nopass;S:' + ssid + ';' + hidden + ';';
    return 'WIFI:T:' + enc + ';S:' + ssid + ';P:' + pass + ';' + hidden + ';';
  }

  function payload(){
    if (kind === 'text') return $('t-text').value;
    if (kind === 'wifi') return wifiPayload();
    if (kind === 'email') {
      var addr = $('e-addr').value.trim();
      var subj = $('e-subj').value.trim();
      var body = $('e-body').value.trim();
      var q = [];
      if (subj) q.push('subject=' + encodeURIComponent(subj));
      if (body) q.push('body=' + encodeURIComponent(body));
      return 'mailto:' + addr + (q.length ? '?' + q.join('&') : '');
    }
    if (kind === 'phone') {
      var num = $('p-num').value.replace(/[^\\d+]/g, '');
      return $('p-sms').checked ? 'sms:' + num : 'tel:' + num;
    }
    return '';
  }

  function render(){
    var text = payload();
    var box = $('preview');
    var meta = $('meta');
    if (!text) {
      box.innerHTML = '<div class="qr-empty">Your QR code appears here</div>';
      meta.textContent = '';
      $('dl-png').disabled = true; $('dl-svg').disabled = true;
      current = null;
      return;
    }
    try {
      var qr = QRCode.encode(text, { ec: $('ec').value });
      current = qr;
      box.innerHTML = QRCode.toSvg(qr, { quiet: 4, dark: $('fg').value, light: $('bg').value });
      meta.textContent = 'Version ' + qr.version + ' · ' + qr.size + '×' + qr.size + ' modules · ' +
        'error correction ' + qr.ec + ' · ' + text.length + ' characters';
      $('dl-png').disabled = false; $('dl-svg').disabled = false;
      $('err').hidden = true;
    } catch (e) {
      current = null;
      box.innerHTML = '<div class="qr-empty">Too much data</div>';
      $('err').hidden = false;
      $('err').textContent = e.message + ' Try a shorter text or a lower error-correction level.';
      $('dl-png').disabled = true; $('dl-svg').disabled = true;
    }
  }

  function download(name, href){
    var a = document.createElement('a');
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  $('dl-svg').addEventListener('click', function(){
    if (!current) return;
    var svg = QRCode.toSvg(current, { quiet: 4, dark: $('fg').value, light: $('bg').value });
    download('qr-code.svg', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  });

  $('dl-png').addEventListener('click', function(){
    if (!current) return;
    var px = parseInt($('size').value, 10);
    var quiet = 4;
    var total = current.size + quiet * 2;
    var scale = Math.max(1, Math.floor(px / total));
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = total * scale;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = $('bg').value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = $('fg').value;
    for (var y = 0; y < current.size; y++) {
      for (var x = 0; x < current.size; x++) {
        if (current.modules[y][x]) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
    download('qr-code.png', canvas.toDataURL('image/png'));
  });

  $('kinds').addEventListener('click', function(e){
    var b = e.target.closest('button[data-kind]'); if (!b) return;
    kind = b.getAttribute('data-kind');
    var btns = $('kinds').querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(btns[i] === b));
    ['text','wifi','email','phone'].forEach(function(k){ $('panel-' + k).hidden = k !== kind; });
    render();
  });

  $('w-enc').addEventListener('change', function(){
    $('w-pass-field').hidden = $('w-enc').value === 'nopass';
    render();
  });

  var inputs = ['t-text','w-ssid','w-pass','w-hidden','e-addr','e-subj','e-body','p-num','p-sms','ec','fg','bg'];
  inputs.forEach(function(id){
    var el = $(id);
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', render);
  });

  render();
})();`;

export default {
  slug: 'qr-code-generator',
  category: 'generators',
  title: 'QR Code Generator – Free, No Watermark, No Expiry',
  h1: 'QR Code Generator',
  cardText: 'Make a QR code for a link, WiFi, email or phone. Download as PNG or SVG.',
  description:
    'Free QR code generator with no watermark, no signup and no expiry. Create QR codes for links, WiFi networks, email and phone numbers, then download as PNG or SVG.',
  keywords: ['qr code generator', 'free qr code', 'make a qr code', 'qr code maker', 'wifi qr code'],
  updated: '2026-09-04',
  lede: 'Create a QR code for a link, WiFi network, email or phone number. Generated entirely in your browser — nothing is uploaded, and the code never expires.',

  form: `
<div class="field">
  <span class="field-label" id="kind-label">What should it do?</span>
  <div class="seg" role="group" aria-labelledby="kind-label" id="kinds" style="flex-wrap:wrap">
    <button type="button" data-kind="text" aria-pressed="true">Link or text</button>
    <button type="button" data-kind="wifi">WiFi</button>
    <button type="button" data-kind="email">Email</button>
    <button type="button" data-kind="phone">Phone</button>
  </div>
</div>

<div id="panel-text">
  <div class="field">
    <label for="t-text">Link or text</label>
    <textarea id="t-text" rows="3" placeholder="https://example.com" style="min-height:80px">https://cinchpad.com</textarea>
  </div>
</div>

<div id="panel-wifi" hidden>
  <div class="row">
    <div class="field">
      <label for="w-ssid">Network name (SSID)</label>
      <input type="text" id="w-ssid" placeholder="My Home WiFi" autocomplete="off">
    </div>
    <div class="field">
      <label for="w-enc">Security</label>
      <select id="w-enc">
        <option value="WPA">WPA / WPA2 / WPA3</option>
        <option value="WEP">WEP</option>
        <option value="nopass">Open (no password)</option>
      </select>
    </div>
  </div>
  <div class="field" id="w-pass-field">
    <label for="w-pass">Password</label>
    <input type="text" id="w-pass" placeholder="Network password" autocomplete="off">
    <span class="hint">Stays in your browser. Nothing is sent anywhere.</span>
  </div>
  <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2)">
    <input type="checkbox" id="w-hidden" style="width:auto"> This is a hidden network
  </label>
</div>

<div id="panel-email" hidden>
  <div class="field">
    <label for="e-addr">Email address</label>
    <input type="email" id="e-addr" placeholder="hello@example.com" autocomplete="off">
  </div>
  <div class="field">
    <label for="e-subj">Subject <span class="hint">(optional)</span></label>
    <input type="text" id="e-subj" placeholder="Enquiry">
  </div>
  <div class="field">
    <label for="e-body">Message <span class="hint">(optional)</span></label>
    <textarea id="e-body" rows="2" style="min-height:60px"></textarea>
  </div>
</div>

<div id="panel-phone" hidden>
  <div class="field">
    <label for="p-num">Phone number</label>
    <input type="tel" id="p-num" placeholder="+1 555 123 4567" autocomplete="off">
  </div>
  <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2)">
    <input type="checkbox" id="p-sms" style="width:auto"> Start a text message instead of a call
  </label>
</div>

<div class="qr-wrap">
  <div class="qr-preview" id="preview"><div class="qr-empty">Your QR code appears here</div></div>
  <div class="qr-controls">
    <div class="field">
      <label for="ec">Error correction</label>
      <select id="ec">
        <option value="L">Low — smallest code</option>
        <option value="M" selected>Medium — recommended</option>
        <option value="Q">Quartile</option>
        <option value="H">High — survives damage</option>
      </select>
    </div>
    <div class="row">
      <div class="field">
        <label for="fg">Dark</label>
        <input type="color" id="fg" value="#000000" style="height:42px;padding:4px">
      </div>
      <div class="field">
        <label for="bg">Light</label>
        <input type="color" id="bg" value="#ffffff" style="height:42px;padding:4px">
      </div>
    </div>
    <div class="field">
      <label for="size">PNG size</label>
      <select id="size">
        <option value="256">256 px</option>
        <option value="512" selected>512 px</option>
        <option value="1024">1024 px</option>
        <option value="2048">2048 px — print</option>
      </select>
    </div>
    <div class="btn-row">
      <button type="button" class="btn" id="dl-png" disabled>Download PNG</button>
      <button type="button" class="btn btn-ghost" id="dl-svg" disabled>SVG</button>
    </div>
  </div>
</div>
<p class="hint" id="meta" style="margin-top:12px"></p>
<p class="notice notice-warn" id="err" hidden style="margin-top:12px"></p>`,

  css: `
.qr-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;margin-top:20px;align-items:start}
@media (max-width:620px){.qr-wrap{grid-template-columns:1fr}}
.qr-preview{background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);padding:16px;display:grid;place-items:center;min-height:220px}
.qr-preview svg{width:100%;max-width:300px;height:auto;border-radius:4px}
.qr-empty{color:var(--ink-3);font-size:.9rem;text-align:center}
.qr-controls .field{margin-bottom:12px}
input[type=color]{width:100%;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--bg);cursor:pointer}`,

  js: encoderSource + '\n' + toolJs,

  answerHeading: 'What a QR code actually holds',
  answer: `<p><strong>A QR code is a picture of text — usually a web address.</strong> Scanning it does not connect to any service; the camera simply reads the characters encoded in the pattern and hands them to your phone, which then opens the link. That means a QR code generated here works forever, offline, with no account and no tracking, because the destination is baked into the pattern itself. Codes that expire or need a subscription are "dynamic" codes: they encode a short redirect link owned by the provider, so if the provider disappears, so does your code.</p>`,

  steps: [
    'Choose what the code should do — open a link, join a WiFi network, start an email, or dial a number.',
    'Fill in the details. The preview updates as you type.',
    'Adjust the error-correction level and colours if you need to.',
    'Download as <strong>PNG</strong> for screens and documents, or <strong>SVG</strong> for print at any size.',
  ],

  sections: [
    {
      id: 'static-dynamic',
      h2: 'Static versus dynamic QR codes',
      html: `<div class="table-scroll"><table>
<thead><tr><th></th><th>Static (this tool)</th><th>Dynamic (subscription services)</th></tr></thead>
<tbody>
<tr><td>What is encoded</td><td>Your actual link or text</td><td>A short redirect owned by the provider</td></tr>
<tr><td>Expires</td><td>Never</td><td>When you stop paying</td></tr>
<tr><td>Editable later</td><td>No — regenerate instead</td><td>Yes</td></tr>
<tr><td>Scan tracking</td><td>None</td><td>Yes, by the provider</td></tr>
<tr><td>Works offline</td><td>Yes</td><td>Needs the provider's servers</td></tr>
<tr><td>Cost</td><td>Free</td><td>Usually monthly</td></tr>
</tbody></table></div>
<p>Use a static code for anything printed and permanent: a menu, a business card, a WiFi sign, a product label. Dynamic codes are only worth it when you genuinely need to change the destination after printing, or need scan analytics.</p>`,
    },
    {
      id: 'error-correction',
      h2: 'Which error-correction level to choose',
      html: `<p>QR codes carry redundant data so they still scan when partly obscured. More redundancy means a denser, larger pattern.</p>
<div class="table-scroll"><table>
<thead><tr><th>Level</th><th>Damage tolerated</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>L (Low)</td><td>~7%</td><td>Clean digital use, long URLs</td></tr>
<tr><td>M (Medium)</td><td>~15%</td><td>The sensible default for most uses</td></tr>
<tr><td>Q (Quartile)</td><td>~25%</td><td>Codes with a logo placed over the centre</td></tr>
<tr><td>H (High)</td><td>~30%</td><td>Printed labels, outdoor signs, anything likely to scuff</td></tr>
</tbody></table></div>
<p>If you plan to drop a logo in the middle, use Q or H — the redundancy is what lets the code survive the covered area.</p>`,
    },
    {
      id: 'printing',
      h2: 'Getting QR codes to scan reliably in print',
      html: `<ul>
<li><strong>Keep the quiet zone.</strong> The blank margin around the code must be at least four modules wide. Crowding it with text is the most common reason a code fails to scan.</li>
<li><strong>Size for the scan distance.</strong> A rough rule is a code width of at least one tenth of the intended scanning distance: 2 cm for 20 cm away, 30 cm for a poster read from 3 metres.</li>
<li><strong>Keep the contrast dark-on-light.</strong> Inverted codes (light on dark) fail on many scanners. Avoid low-contrast pairings entirely.</li>
<li><strong>Use SVG for print.</strong> It stays sharp at any size. PNG at 1024 px or more is fine for most documents.</li>
<li><strong>Shorten long links first.</strong> Fewer characters means a lower version with larger modules, which scans far more easily.</li>
<li><strong>Test before you print a thousand.</strong> Scan it with both an iPhone and an Android device, in the lighting where it will actually live.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Are these QR codes really free, with no expiry?', a: '<p>Yes. The code encodes your link directly, so there is nothing to expire and no account behind it. Download it once and it will keep working indefinitely, including offline.</p>' },
    { q: 'Is my data sent to a server?', a: '<p>No. The entire QR encoder runs in your browser. WiFi passwords, email addresses and links never leave your device — you can disconnect from the internet and this page still generates codes.</p>' },
    { q: 'Can I put a logo in the middle?', a: '<p>Yes, using any image editor. Set error correction to Q or H first, and keep the logo under about 25% of the code’s width. Always test the result before printing.</p>' },
    { q: 'How much data fits in a QR code?', a: '<p>Up to about 2,900 bytes of text at the lowest error-correction level, though codes that large are hard to scan. For links, staying under 300 characters keeps the pattern comfortably readable.</p>' },
    { q: 'Why does my QR code not scan?', a: '<p>The usual causes are too little quiet zone around the edge, printing it too small for the scan distance, poor contrast, or an inverted colour scheme. Try a larger size with high error correction and plain black on white.</p>' },
    { q: 'Can I use these codes commercially?', a: '<p>Yes. QR code patents expired long ago and the format is an open ISO standard. Codes made here carry no watermark and no licence conditions.</p>' },
  ],

  related: ['wifi-qr-code-generator', 'barcode-generator', 'password-generator', 'image-to-pdf'],
};
