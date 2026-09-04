import fs from 'node:fs';
const encoderSource = fs.readFileSync(new URL('../lib/qrcode.js', import.meta.url), 'utf8');

const toolJs = `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var current = null;

  function payload(){
    // Backslash, semicolon, comma, colon and quote must be escaped per the WIFI: scheme.
    var esc = function(s){ return String(s).replace(/([\\\\;,:"])/g, '\\\\$1'); };
    var enc = $('enc').value;
    var ssid = esc($('ssid').value);
    var pass = esc($('pass').value);
    var hidden = $('hidden').checked ? 'H:true;' : '';
    if (!$('ssid').value) return '';
    if (enc === 'nopass') return 'WIFI:T:nopass;S:' + ssid + ';' + hidden + ';';
    return 'WIFI:T:' + enc + ';S:' + ssid + ';P:' + pass + ';' + hidden + ';';
  }

  function render(){
    var text = payload();
    if (!text) {
      $('preview').innerHTML = '<div class="qr-empty">Enter your network name to see the code</div>';
      $('meta').textContent = '';
      $('dl-png').disabled = true; $('dl-svg').disabled = true; $('print').disabled = true;
      current = null;
      $('card-ssid').textContent = 'Network name';
      $('card-qr').innerHTML = '';
      return;
    }
    try {
      // High error correction, because these get printed and stuck to walls.
      var qr = QRCode.encode(text, { ec: 'H' });
      current = qr;
      var svg = QRCode.toSvg(qr, { quiet: 4, dark: '#000000', light: '#ffffff' });
      $('preview').innerHTML = svg;
      $('card-qr').innerHTML = svg;
      $('card-ssid').textContent = $('ssid').value;
      $('card-note').textContent = $('enc').value === 'nopass'
        ? 'Open network — no password needed'
        : 'Scan with your camera to join';
      $('meta').textContent = 'Version ' + qr.version + ' · error correction H · ' + text.length + ' characters';
      $('dl-png').disabled = false; $('dl-svg').disabled = false; $('print').disabled = false;
      $('err').hidden = true;
    } catch (e) {
      current = null;
      $('err').hidden = false;
      $('err').textContent = e.message;
      $('dl-png').disabled = true; $('dl-svg').disabled = true; $('print').disabled = true;
    }
  }

  function download(name, href){
    var a = document.createElement('a');
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  $('dl-svg').addEventListener('click', function(){
    if (!current) return;
    download('wifi-qr.svg', 'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(QRCode.toSvg(current, { quiet: 4 })));
  });

  $('dl-png').addEventListener('click', function(){
    if (!current) return;
    var quiet = 4, total = current.size + quiet * 2;
    var scale = Math.max(1, Math.floor(1024 / total));
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = total * scale;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    for (var y = 0; y < current.size; y++) {
      for (var x = 0; x < current.size; x++) {
        if (current.modules[y][x]) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
    download('wifi-qr.png', canvas.toDataURL('image/png'));
  });

  $('print').addEventListener('click', function(){ window.print(); });

  $('show').addEventListener('click', function(){
    var showing = $('pass').type === 'text';
    $('pass').type = showing ? 'password' : 'text';
    this.textContent = showing ? 'Show' : 'Hide';
  });

  $('enc').addEventListener('change', function(){
    $('pass-field').hidden = this.value === 'nopass';
    render();
  });
  ['ssid','pass','hidden'].forEach(function(id){
    $(id).addEventListener($(id).type === 'checkbox' ? 'change' : 'input', render);
  });

  render();
})();`;

export default {
  slug: 'wifi-qr-code-generator',
  category: 'generators',
  title: 'WiFi QR Code Generator – Share WiFi Without Typing It',
  h1: 'WiFi QR Code Generator',
  cardText: 'A printable QR code that joins guests to your WiFi in one scan.',
  description:
    'Free WiFi QR code generator. Make a scannable code that connects phones to your network without typing the password, with a printable card for guests.',
  keywords: ['wifi qr code', 'wifi qr code generator', 'share wifi password', 'guest wifi qr', 'wifi password qr'],
  updated: '2026-09-04',
  lede: 'Create a QR code that joins any phone to your network in one scan. Generated in your browser — your password is never uploaded.',

  form: `
<div class="row">
  <div class="field">
    <label for="ssid">Network name (SSID)</label>
    <input type="text" id="ssid" placeholder="My Home WiFi" autocomplete="off" spellcheck="false">
    <span class="hint">Must match exactly, including capitals.</span>
  </div>
  <div class="field">
    <label for="enc">Security type</label>
    <select id="enc">
      <option value="WPA" selected>WPA / WPA2 / WPA3</option>
      <option value="WEP">WEP (old)</option>
      <option value="nopass">Open — no password</option>
    </select>
  </div>
</div>

<div class="field" id="pass-field">
  <label for="pass">WiFi password</label>
  <div class="input-group">
    <input type="password" id="pass" autocomplete="off" spellcheck="false" placeholder="Your network password">
    <button type="button" class="addon" id="show" style="cursor:pointer;border-radius:0 var(--radius-sm) var(--radius-sm) 0;border-left:none">Show</button>
  </div>
  <span class="hint">Stays in your browser. Never sent to a server.</span>
</div>

<label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);margin-bottom:6px">
  <input type="checkbox" id="hidden" style="width:auto"> This network is hidden
</label>

<div class="qr-wrap">
  <div class="qr-preview" id="preview"><div class="qr-empty">Enter your network name to see the code</div></div>
  <div>
    <div class="btn-row" style="margin-bottom:14px">
      <button type="button" class="btn" id="dl-png" disabled>Download PNG</button>
      <button type="button" class="btn btn-ghost" id="dl-svg" disabled>SVG</button>
      <button type="button" class="btn btn-ghost" id="print" disabled>Print card</button>
    </div>
    <p class="hint" id="meta"></p>
    <p class="notice notice-warn" id="err" hidden style="margin-top:12px"></p>
  </div>
</div>

<div class="wifi-card print-only" aria-hidden="true">
  <h2>WiFi</h2>
  <div id="card-qr"></div>
  <p class="ssid" id="card-ssid">Network name</p>
  <p class="note" id="card-note">Scan with your camera to join</p>
</div>`,

  css: `
.qr-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;margin-top:20px;align-items:start}
@media (max-width:620px){.qr-wrap{grid-template-columns:1fr}}
.qr-preview{background:var(--bg-sunken);border:1px solid var(--line);border-radius:var(--radius);
  padding:16px;display:grid;place-items:center;min-height:220px}
.qr-preview svg{width:100%;max-width:280px;height:auto;border-radius:4px}
.qr-empty{color:var(--ink-3);font-size:.9rem;text-align:center}
.wifi-card{display:none;text-align:center;padding:28px;border:2px solid #000;border-radius:14px;max-width:340px;margin:0 auto}
.wifi-card h2{font-size:1.1rem;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px}
.wifi-card svg{width:190px;height:190px;margin:0 auto}
.wifi-card .ssid{font-size:1.25rem;font-weight:700;margin-top:14px;word-break:break-word}
.wifi-card .note{font-size:.85rem;color:#555;margin-top:5px}
@media print{
  .wifi-card{display:block !important}
  body *{visibility:hidden}
  .wifi-card,.wifi-card *{visibility:visible}
  .wifi-card{position:absolute;left:50%;top:40px;transform:translateX(-50%)}
}`,

  js: encoderSource + '\n' + toolJs,

  answerHeading: 'How a WiFi QR code works',
  answer: `<p><strong>The code contains a short text string in a standard format — <code>WIFI:T:WPA;S:NetworkName;P:password;;</code> — which phones recognise and turn into a join prompt.</strong> Nothing clever is happening: your camera reads the text, sees the WIFI prefix, and offers to connect. It works natively on iOS 11 and later and on Android 10 and later with no app required. Because the credentials are encoded in the image itself, anyone who can see or photograph the code can join your network.</p>`,

  steps: [
    'Type your network name exactly as it appears, including capitals.',
    'Choose the security type — WPA covers WPA, WPA2 and WPA3.',
    'Enter the password.',
    'Download the PNG, or press <strong>Print card</strong> for a framed card to leave out for guests.',
  ],

  sections: [
    {
      id: 'guest',
      h2: 'Use your guest network for this',
      html: `<p>A printed QR code hands out your WiFi password to everyone who sees it, permanently. That is fine for a guest network and a poor idea for your main one.</p>
<p>Most routers can broadcast a separate guest network that reaches the internet but not your other devices. Printers, network storage, cameras and smart home equipment stay invisible to anyone who joins it — which matters, because a guest device that is compromised should not be able to reach your file server.</p>
<p>If you run a café, shop or holiday let, a guest network with a rotating password is the right setup, and this tool makes regenerating the card trivial.</p>`,
    },
    {
      id: 'troubleshooting',
      h2: 'If the code will not connect',
      html: `<ul>
<li><strong>Check the network name character by character.</strong> SSIDs are case-sensitive, and a trailing space is invisible but fatal.</li>
<li><strong>Check the security type.</strong> WPA3 networks use the WPA setting. WEP is only for genuinely old equipment.</li>
<li><strong>Special characters in the password.</strong> Semicolons, colons, commas, quotes and backslashes are escaped automatically here, but some routers display them oddly in their own admin pages — copy the password from a text field, not a screenshot.</li>
<li><strong>Hidden networks need the box ticked.</strong> Without it, phones will not find the network even with correct credentials.</li>
<li><strong>5 GHz-only networks.</strong> If a device does not support 5 GHz it cannot join regardless of the code.</li>
<li><strong>Print it large enough.</strong> At least 3 cm across for a code held at arm's length.</li>
</ul>`,
    },
    {
      id: 'privacy',
      h2: 'Why generating this locally matters',
      html: `<p>Your WiFi password is one of the more sensitive strings you own. It protects every device on your network.</p>
<p>Many WiFi QR generators send the network name and password to a server to render the image. Even with good intentions, that puts your credentials in someone else's logs, and a network name is often enough to locate a home through public WiFi mapping databases.</p>
<p>This tool implements the QR encoder in JavaScript and runs it in your browser. Nothing is transmitted — you can disconnect from the internet entirely and it will still produce the code.</p>`,
    },
  ],

  faq: [
    { q: 'Is my WiFi password sent anywhere?', a: '<p>No. The QR code is generated entirely in your browser. Disconnect from the internet and the tool still works, which is the simplest way to confirm it.</p>' },
    { q: 'Do iPhones and Android phones both support this?', a: '<p>Yes. iOS 11 and later and Android 10 and later read WiFi QR codes with the built-in camera. Older Androids may need a QR scanner app.</p>' },
    { q: 'Can someone steal my password from the code?', a: '<p>Yes — the password is encoded in the image in plain text, so anyone who photographs the code can extract it. Treat a printed code exactly as you would treat the password written on paper, and use a guest network.</p>' },
    { q: 'What if my password contains special characters?', a: '<p>Semicolons, colons, commas, quotes and backslashes are escaped automatically to the WiFi QR specification, so they work correctly.</p>' },
    { q: 'Which security type should I choose?', a: '<p>WPA covers WPA, WPA2 and WPA3 — almost every modern network. Choose WEP only for genuinely old hardware, and Open for a network with no password.</p>' },
    { q: 'Does the code expire?', a: '<p>No. It keeps working until you change the network name or password, at which point you simply generate a new one.</p>' },
  ],

  related: ['qr-code-generator', 'password-generator', 'password-strength-checker', 'barcode-generator'],
};
