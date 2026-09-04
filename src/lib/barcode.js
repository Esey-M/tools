/* ---------------------------------------------------------------------------
 * Barcode encoders: Code 128 (auto sub-set switching) and EAN-13 / UPC-A.
 * Produces module arrays; rendering is left to the caller.
 * ------------------------------------------------------------------------- */
var Barcode = (function () {
  'use strict';

  /* --------------------------------------------------------------- Code 128 */
  // Each pattern is six widths: bar, space, bar, space, bar, space.
  var C128 = [
    '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
    '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
    '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
    '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
    '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
    '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
    '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
    '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
    '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
    '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
    '114131','311141','411131','211412','211214','211232','2331112'
  ];
  var START_B = 104, START_C = 105, STOP = 106;

  function isDigit(ch) { return ch >= '0' && ch <= '9'; }

  /** Count digits from position i. Long digit runs are cheaper in sub-set C. */
  function digitRun(text, i) {
    var n = 0;
    while (i + n < text.length && isDigit(text[i + n])) n++;
    return n;
  }

  function code128Values(text) {
    var codes = [];
    var i = 0;
    var mode = null;

    // Opening in C pays off from four digits, or two if that is the whole string.
    var run = digitRun(text, 0);
    if (run >= 4 || (run === text.length && run >= 2 && run % 2 === 0)) {
      codes.push(START_C); mode = 'C';
    } else {
      codes.push(START_B); mode = 'B';
    }

    while (i < text.length) {
      if (mode === 'C') {
        var r = digitRun(text, i);
        if (r >= 2) {
          codes.push(parseInt(text.substr(i, 2), 10));
          i += 2;
          continue;
        }
        codes.push(100);          // Code B
        mode = 'B';
        continue;
      }
      var r2 = digitRun(text, i);
      if (r2 >= 6 && r2 % 2 === 0) {
        codes.push(99);           // Code C
        mode = 'C';
        continue;
      }
      var code = text.charCodeAt(i) - 32;
      if (code < 0 || code > 94) throw new Error('Code 128 supports printable ASCII only (space to ~).');
      codes.push(code);
      i++;
    }

    var sum = codes[0];
    for (var k = 1; k < codes.length; k++) sum += codes[k] * k;
    codes.push(sum % 103);
    codes.push(STOP);
    return codes;
  }

  /** Expand widths into a flat array of 1 (bar) and 0 (space) modules. */
  function widthsToModules(patterns) {
    var modules = [];
    for (var p = 0; p < patterns.length; p++) {
      var w = patterns[p];
      for (var i = 0; i < w.length; i++) {
        var count = parseInt(w[i], 10);
        var value = (i % 2 === 0) ? 1 : 0;   // even index is a bar
        for (var n = 0; n < count; n++) modules.push(value);
      }
    }
    return modules;
  }

  function code128(text) {
    if (!text) throw new Error('Enter some text to encode.');
    var codes = code128Values(text);
    var modules = widthsToModules(codes.map(function (c) { return C128[c]; }));
    return { modules: modules, text: text, type: 'Code 128' };
  }

  /* -------------------------------------------------------------- EAN-13 */
  var L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  var G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  var R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
  var PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];

  function ean13Checksum(digits12) {
    var sum = 0;
    for (var i = 0; i < 12; i++) {
      sum += parseInt(digits12[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10;
  }

  function ean13(input) {
    var digits = String(input).replace(/\D/g, '');
    if (digits.length === 12) digits += ean13Checksum(digits);
    if (digits.length !== 13) throw new Error('EAN-13 needs 12 digits (the check digit is added) or 13.');
    var expected = ean13Checksum(digits.slice(0, 12));
    if (parseInt(digits[12], 10) !== expected) {
      throw new Error('Check digit is wrong — for ' + digits.slice(0, 12) + ' it should be ' + expected + '.');
    }

    var first = parseInt(digits[0], 10);
    var parity = PARITY[first];
    var bits = '101';                                   // start guard
    for (var i = 1; i <= 6; i++) {
      var d = parseInt(digits[i], 10);
      bits += (parity[i - 1] === 'L' ? L : G)[d];
    }
    bits += '01010';                                    // centre guard
    for (var j = 7; j <= 12; j++) bits += R[parseInt(digits[j], 10)];
    bits += '101';                                      // end guard

    return {
      modules: bits.split('').map(Number),
      text: digits,
      type: 'EAN-13',
      // Guard bars extend below the digits, so the renderer needs their positions.
      guards: [[0, 3], [45, 50], [92, 95]]
    };
  }

  return { code128: code128, ean13: ean13, ean13Checksum: ean13Checksum };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Barcode;
