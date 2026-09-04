/* ---------------------------------------------------------------------------
 * Minimal PDF writer: enough to place JPEG images on pages, one per page.
 * Images are embedded with DCTDecode, so the JPEG bytes are stored verbatim
 * and no re-encoding or external library is needed.
 * ------------------------------------------------------------------------- */
var SimplePDF = (function () {
  'use strict';

  function bytesOfString(str) {
    var out = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
  }

  function concat(chunks) {
    var total = 0, i;
    for (i = 0; i < chunks.length; i++) total += chunks[i].length;
    var out = new Uint8Array(total), offset = 0;
    for (i = 0; i < chunks.length; i++) { out.set(chunks[i], offset); offset += chunks[i].length; }
    return out;
  }

  /**
   * Build a PDF from pages of the form
   *   { jpeg: Uint8Array, width, height, pageWidth, pageHeight, x, y, drawWidth, drawHeight }
   * Sizes are in PDF points (72 per inch).
   */
  function build(pages) {
    var objects = [];      // each entry is an array of Uint8Array chunks
    var chunks = [];
    var offsets = [];
    var length = 0;

    function push(data) {
      var bytes = typeof data === 'string' ? bytesOfString(data) : data;
      chunks.push(bytes);
      length += bytes.length;
    }

    function startObject(num) {
      offsets[num] = length;
      push(num + ' 0 obj\n');
    }
    function endObject() { push('endobj\n'); }

    // Object numbering: 1 catalog, 2 pages, then 3 objects per page.
    var pageObjNums = [];
    for (var p = 0; p < pages.length; p++) pageObjNums.push(3 + p * 3);

    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    startObject(1);
    push('<< /Type /Catalog /Pages 2 0 R >>\n');
    endObject();

    startObject(2);
    push('<< /Type /Pages /Kids [' + pageObjNums.map(function (n) { return n + ' 0 R'; }).join(' ') +
         '] /Count ' + pages.length + ' >>\n');
    endObject();

    for (var i = 0; i < pages.length; i++) {
      var pg = pages[i];
      var pageNum = 3 + i * 3;
      var imgNum = pageNum + 1;
      var contentNum = pageNum + 2;

      startObject(pageNum);
      push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
           pg.pageWidth.toFixed(2) + ' ' + pg.pageHeight.toFixed(2) + '] ' +
           '/Resources << /XObject << /Im0 ' + imgNum + ' 0 R >> >> ' +
           '/Contents ' + contentNum + ' 0 R >>\n');
      endObject();

      startObject(imgNum);
      push('<< /Type /XObject /Subtype /Image /Width ' + pg.width + ' /Height ' + pg.height +
           ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
           pg.jpeg.length + ' >>\nstream\n');
      push(pg.jpeg);
      push('\nendstream\n');
      endObject();

      // The cm operator maps the unit square onto the placement rectangle.
      var content = 'q\n' + pg.drawWidth.toFixed(2) + ' 0 0 ' + pg.drawHeight.toFixed(2) + ' ' +
                    pg.x.toFixed(2) + ' ' + pg.y.toFixed(2) + ' cm\n/Im0 Do\nQ\n';
      startObject(contentNum);
      push('<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream\n');
      endObject();
    }

    var xrefOffset = length;
    var objectCount = 3 + pages.length * 3;   // includes the free object 0

    var xref = 'xref\n0 ' + objectCount + '\n0000000000 65535 f \n';
    for (var n = 1; n < objectCount; n++) {
      var off = offsets[n] || 0;
      xref += ('0000000000' + off).slice(-10) + ' 00000 n \n';
    }
    push(xref);
    push('trailer\n<< /Size ' + objectCount + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n');

    return concat(chunks);
  }

  /** Page sizes in PDF points. */
  var SIZES = {
    a4:     [595.28, 841.89],
    letter: [612, 792],
    legal:  [612, 1008],
    a5:     [419.53, 595.28]
  };

  /** Fit an image inside a page with margins, preserving aspect ratio. */
  function fit(imgW, imgH, pageW, pageH, margin) {
    var availW = pageW - margin * 2;
    var availH = pageH - margin * 2;
    var scale = Math.min(availW / imgW, availH / imgH);
    var w = imgW * scale, h = imgH * scale;
    return { x: (pageW - w) / 2, y: (pageH - h) / 2, drawWidth: w, drawHeight: h };
  }

  return { build: build, SIZES: SIZES, fit: fit };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = SimplePDF;
