import fs from 'node:fs';
const barcodeSource = fs.readFileSync(new URL('../lib/barcode.js', import.meta.url), 'utf8');

const toolJs = `(function(){
  var $ = function(id){ return document.getElementById(id); };
  var current = null;

  function build(){
    var type = $('type').value;
    var text = $('text').value.trim();
    if (!text) {
      $('svg-wrap').innerHTML = '<div class="bc-empty">Your barcode appears here</div>';
      $('meta').textContent = '';
      $('dl-png').disabled = true; $('dl-svg').disabled = true;
      $('err').hidden = true;
      current = null;
      return;
    }
    try {
      var result = type === 'ean13' ? Barcode.ean13(text) : Barcode.code128(text);
      current = result;
      $('svg-wrap').innerHTML = toSvg(result);
      $('meta').textContent = result.type + ' · ' + result.modules.length + ' modules · ' +
        result.text.length + ' characters encoded';
      $('dl-png').disabled = false; $('dl-svg').disabled = false;
      $('err').hidden = true;
    } catch (e) {
      current = null;
      $('svg-wrap').innerHTML = '<div class="bc-empty">Cannot encode that</div>';
      $('meta').textContent = '';
      $('err').hidden = false;
      $('err').textContent = e.message;
      $('dl-png').disabled = true; $('dl-svg').disabled = true;
    }
  }

  function layout(result){
    var quiet = 10;
    var barHeight = parseInt($('height').value, 10);
    var showText = $('showtext').checked;
    var textGap = showText ? 22 : 0;
    var width = result.modules.length + quiet * 2;
    var height = barHeight + textGap + 8;
    return { quiet: quiet, barHeight: barHeight, showText: showText, width: width, height: height };
  }

  function toSvg(result){
    var L = layout(result);
    var rects = '';
    var i = 0;
    while (i < result.modules.length) {
      if (result.modules[i]) {
        var start = i;
        while (i < result.modules.length && result.modules[i]) i++;
        // EAN-13 guard bars run longer than the data bars.
        var isGuard = (result.guards || []).some(function(g){ return start >= g[0] && start < g[1]; });
        var h = L.barHeight + (isGuard && L.showText ? 9 : 0);
        rects += '<rect x="' + (start + L.quiet) + '" y="4" width="' + (i - start) + '" height="' + h + '"/>';
      } else i++;
    }
    var label = '';
    if (L.showText) {
      label = '<text x="' + (L.width / 2) + '" y="' + (L.height - 4) +
        '" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="13" letter-spacing="1.5">' +
        result.text.replace(/[<>&]/g, '') + '</text>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + L.width + ' ' + L.height +
      '" shape-rendering="crispEdges" role="img" aria-label="Barcode encoding ' + result.text.replace(/["<>&]/g, '') + '">' +
      '<rect width="' + L.width + '" height="' + L.height + '" fill="#ffffff"/>' +
      '<g fill="#000000">' + rects + '</g>' + label + '</svg>';
  }

  function download(name, href){
    var a = document.createElement('a');
    a.href = href; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  $('dl-svg').addEventListener('click', function(){
    if (!current) return;
    download('barcode.svg', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(toSvg(current)));
  });

  $('dl-png').addEventListener('click', function(){
    if (!current) return;
    var L = layout(current);
    var scale = 4;
    var canvas = document.createElement('canvas');
    canvas.width = L.width * scale;
    canvas.height = L.height * scale;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    var i = 0;
    while (i < current.modules.length) {
      if (current.modules[i]) {
        var start = i;
        while (i < current.modules.length && current.modules[i]) i++;
        var isGuard = (current.guards || []).some(function(g){ return start >= g[0] && start < g[1]; });
        var h = L.barHeight + (isGuard && L.showText ? 9 : 0);
        ctx.fillRect((start + L.quiet) * scale, 4 * scale, (i - start) * scale, h * scale);
      } else i++;
    }
    if (L.showText) {
      ctx.fillStyle = '#000';
      ctx.font = '600 ' + (13 * scale) + 'px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(current.text, canvas.width / 2, (L.height - 4) * scale);
    }
    download('barcode.png', canvas.toDataURL('image/png'));
  });

  $('type').addEventListener('change', function(){
    var ean = this.value === 'ean13';
    $('text').placeholder = ean ? '9780201379624' : 'CINCHPAD-123';
    $('hint').textContent = ean
      ? '12 or 13 digits. If you enter 12, the check digit is calculated for you.'
      : 'Any printable ASCII — letters, digits, spaces and punctuation.';
    build();
  });
  ['text','height','showtext'].forEach(function(id){
    $(id).addEventListener($(id).type === 'checkbox' ? 'change' : 'input', build);
  });

  build();
})();`;

export default {
  slug: 'barcode-generator',
  category: 'generators',
  title: 'Barcode Generator – Code 128 and EAN-13, Free',
  h1: 'Barcode Generator',
  cardText: 'Generate scannable Code 128 and EAN-13 barcodes and download as PNG or SVG.',
  description:
    'Free barcode generator for Code 128 and EAN-13. Create scannable barcodes for inventory, labels and retail, with automatic check digits. Download PNG or SVG.',
  keywords: ['barcode generator', 'code 128 generator', 'ean 13 barcode', 'free barcode maker', 'upc barcode generator'],
  updated: '2026-09-04',
  lede: 'Type your text or product number and download a scannable barcode. Generated in your browser, with no watermark and no account.',

  form: `
<div class="row">
  <div class="field">
    <label for="type">Barcode type</label>
    <select id="type">
      <option value="code128" selected>Code 128 — text, inventory, shipping</option>
      <option value="ean13">EAN-13 — retail products</option>
    </select>
  </div>
  <div class="field">
    <label for="text">Content</label>
    <input type="text" id="text" value="CINCHPAD-123" autocomplete="off" spellcheck="false"
           style="font-family:var(--font-num)">
    <span class="hint" id="hint">Any printable ASCII — letters, digits, spaces and punctuation.</span>
  </div>
</div>

<div class="row">
  <div class="field">
    <label for="height">Bar height</label>
    <select id="height">
      <option value="40">Short — 40</option>
      <option value="60" selected>Normal — 60</option>
      <option value="90">Tall — 90</option>
    </select>
  </div>
  <div class="field">
    <span class="field-label">Options</span>
    <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;color:var(--ink-2);padding-top:8px">
      <input type="checkbox" id="showtext" checked style="width:auto"> Print the value underneath
    </label>
  </div>
</div>

<div class="bc-preview" id="svg-wrap"><div class="bc-empty">Your barcode appears here</div></div>
<p class="hint" id="meta" style="margin-top:10px"></p>
<p class="notice notice-warn" id="err" hidden style="margin-top:12px"></p>

<div class="btn-row" style="margin-top:14px">
  <button type="button" class="btn" id="dl-png" disabled>Download PNG</button>
  <button type="button" class="btn btn-ghost" id="dl-svg" disabled>SVG</button>
</div>`,

  css: `
.bc-preview{background:#fff;border:1px solid var(--line);border-radius:var(--radius);
  padding:18px;margin-top:20px;display:grid;place-items:center;min-height:130px;overflow-x:auto}
.bc-preview svg{width:100%;max-width:520px;height:auto}
.bc-empty{color:#888;font-size:.9rem}`,

  js: barcodeSource + '\n' + toolJs,

  answerHeading: 'Which barcode type do you need?',
  answer: `<p><strong>Use Code 128 for anything internal and EAN-13 for anything sold in a shop.</strong> Code 128 encodes any printable ASCII — letters, digits and punctuation — which makes it the standard for inventory labels, shipping, asset tags and library books. EAN-13 encodes exactly 13 digits and is the retail barcode scanned at tills worldwide. The critical difference is that EAN-13 numbers must be bought from GS1: you cannot invent one and expect a shop to accept it.</p>`,

  steps: [
    'Choose <strong>Code 128</strong> for text or internal codes, or <strong>EAN-13</strong> for a retail product number.',
    'Type your content. For EAN-13, 12 digits is enough — the check digit is added automatically.',
    'Set the bar height and whether the value prints underneath.',
    'Download <strong>SVG</strong> for printing, or PNG for screens and documents.',
  ],

  sections: [
    {
      id: 'types',
      h2: 'Code 128 and EAN-13 compared',
      html: `<div class="table-scroll"><table>
<thead><tr><th></th><th>Code 128</th><th>EAN-13</th></tr></thead>
<tbody>
<tr><td>Encodes</td><td>Any printable ASCII</td><td>Exactly 13 digits</td></tr>
<tr><td>Length</td><td>Variable</td><td>Fixed</td></tr>
<tr><td>Typical use</td><td>Inventory, shipping, asset tags</td><td>Retail products at checkout</td></tr>
<tr><td>Needs registration</td><td>No — use any value you like</td><td>Yes, numbers come from GS1</td></tr>
<tr><td>Check digit</td><td>Built in, calculated automatically</td><td>13th digit, calculated here</td></tr>
</tbody></table></div>
<p>Code 128 also switches automatically between its sub-sets as it encodes, packing long digit runs two-to-a-symbol. That is why a numeric code produces a noticeably shorter barcode than the same length of letters.</p>`,
    },
    {
      id: 'gs1',
      h2: 'You cannot invent a retail barcode',
      html: `<p>This is the single most common misunderstanding, and it costs people money.</p>
<p>EAN-13 and UPC numbers are allocated by <a href="https://www.gs1.org" rel="noopener" target="_blank">GS1</a>, which issues each business a unique company prefix. You then assign your own product numbers within that prefix. Retailers verify that a barcode resolves to the registered owner, so a made-up number will be rejected — and duplicate numbers cause genuine chaos at checkout.</p>
<p>Cheap barcode numbers resold on marketplaces are usually recycled from prefixes issued before GS1 tightened its licensing. Many major retailers refuse them outright. If you are selling through shops, buy the prefix properly.</p>
<p>For anything internal — stock control, equipment tags, event tickets, library books — Code 128 needs no registration at all. Use whatever numbering makes sense to you.</p>`,
    },
    {
      id: 'printing',
      h2: 'Printing barcodes that scan first time',
      html: `<ul>
<li><strong>Use SVG.</strong> Barcodes are line art; scaling a PNG blurs the bar edges, which is exactly what scanners measure.</li>
<li><strong>Never stretch horizontally.</strong> The relative bar widths carry the data. You can change the height freely, but the width must scale proportionally.</li>
<li><strong>Keep the quiet zone.</strong> The white margin at each end must be at least ten times the narrowest bar width. It is included here — do not crop it.</li>
<li><strong>Print dark on light, at high contrast.</strong> Black on white scans best; red bars are effectively invisible to older red-laser scanners.</li>
<li><strong>Avoid glossy laminate</strong> where possible, since reflections defeat laser scanners.</li>
<li><strong>Test with an actual scanner</strong>, not just a phone app — phone cameras are considerably more forgiving than warehouse hardware.</li>
</ul>`,
    },
  ],

  faq: [
    { q: 'Are these barcodes free to use commercially?', a: '<p>The generated images are, with no watermark or licence conditions. But an EAN-13 <em>number</em> for retail sale must be licensed from GS1 — that is about the number, not the picture of it.</p>' },
    { q: 'What is the check digit?', a: '<p>A digit calculated from the others that lets a scanner detect misreads. For EAN-13 it is the 13th digit, and this tool calculates it for you if you enter only 12.</p>' },
    { q: 'Why is my EAN-13 rejected as invalid?', a: '<p>Almost always a wrong check digit. Enter just the first 12 digits and the correct one is added automatically. If you entered 13, the error message shows what the last digit should be.</p>' },
    { q: 'Can I use Code 128 for my own inventory?', a: '<p>Yes, freely. Code 128 needs no registration, so you can number your stock however you like — that is exactly what it is for.</p>' },
    { q: 'Is UPC-A the same as EAN-13?', a: '<p>Effectively, yes. A UPC-A is a 12-digit code that becomes a valid EAN-13 with a leading zero, so entering a UPC here with a 0 in front produces the correct barcode.</p>' },
    { q: 'Are my codes sent anywhere?', a: '<p>No. Encoding happens entirely in your browser, so your product numbers are never transmitted.</p>' },
  ],

  related: ['qr-code-generator', 'wifi-qr-code-generator', 'password-generator', 'image-to-pdf'],
};
