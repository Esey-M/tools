/* ---------------------------------------------------------------------------
 * Minimal QR Code encoder (byte mode, versions 1–40, EC levels L/M/Q/H).
 * Implements ISO/IEC 18004. Produces a boolean matrix; rendering is separate.
 * Runs standalone in the browser — no dependencies, nothing leaves the device.
 * ------------------------------------------------------------------------- */
var QRCode = (function () {
  'use strict';

  // ecPerBlock[level][version-1] and numBlocks[level][version-1]. Levels: L M Q H.
  var EC_PER_BLOCK = {
    L: [7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    M: [10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
    Q: [13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
    H: [17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]
  };
  var NUM_BLOCKS = {
    L: [1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
    M: [1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
    Q: [1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],
    H: [1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]
  };
  var FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  /* ------------------------------------------------------------ geometry */
  function rawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }
  function totalCodewords(ver) { return Math.floor(rawDataModules(ver) / 8); }
  function dataCodewords(ver, ec) {
    return totalCodewords(ver) - EC_PER_BLOCK[ec][ver - 1] * NUM_BLOCKS[ec][ver - 1];
  }
  function alignPositions(ver) {
    if (ver === 1) return [];
    var numAlign = Math.floor(ver / 7) + 2;
    var step = (ver === 32) ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = ver * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  /* ------------------------------------------------- GF(256) / Reed-Solomon */
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11D;              // primitive polynomial
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gfMul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function rsGenerator(degree) {
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }
  function rsRemainder(data, degree) {
    var gen = rsGenerator(degree);
    var result = new Array(degree).fill(0);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ result[0];
      result.shift(); result.push(0);
      for (var j = 0; j < degree; j++) result[j] ^= gfMul(gen[j + 1], factor);
    }
    return result;
  }

  /* --------------------------------------------------------------- encoding */
  function utf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) { out.push(0xC0 | (c >> 6), 0x80 | (c & 63)); }
      else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < str.length) {
        var cp = 0x10000 + ((c - 0xD800) << 10) + (str.charCodeAt(++i) - 0xDC00);
        out.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else { out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63)); }
    }
    return out;
  }

  function chooseVersion(byteLen, ec, minVersion) {
    for (var v = minVersion || 1; v <= 40; v++) {
      var capacityBits = dataCodewords(v, ec) * 8;
      var countBits = v <= 9 ? 8 : 16;
      if (4 + countBits + byteLen * 8 <= capacityBits) return v;
    }
    return null;
  }

  function buildCodewords(bytes, ver, ec) {
    var bits = [];
    var push = function (value, len) {
      for (var i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    };
    push(4, 4);                                        // byte mode
    push(bytes.length, ver <= 9 ? 8 : 16);
    for (var i = 0; i < bytes.length; i++) push(bytes[i], 8);

    var capacity = dataCodewords(ver, ec) * 8;
    push(0, Math.min(4, capacity - bits.length));      // terminator
    while (bits.length % 8 !== 0) bits.push(0);

    var pad = [0xEC, 0x11], p = 0;
    while (bits.length < capacity) { push(pad[p++ % 2], 8); }

    var data = [];
    for (var b = 0; b < bits.length; b += 8) {
      var byte = 0;
      for (var k = 0; k < 8; k++) byte = (byte << 1) | bits[b + k];
      data.push(byte);
    }
    return data;
  }

  /** Split into RS blocks, add EC codewords, then interleave both halves. */
  function interleave(data, ver, ec) {
    var numBlocks = NUM_BLOCKS[ec][ver - 1];
    var ecLen = EC_PER_BLOCK[ec][ver - 1];
    var total = totalCodewords(ver);
    var shortBlockLen = Math.floor(total / numBlocks) - ecLen;
    var numShort = numBlocks - (total % numBlocks);

    var blocks = [], ecBlocks = [], offset = 0;
    for (var i = 0; i < numBlocks; i++) {
      var len = shortBlockLen + (i < numShort ? 0 : 1);
      var block = data.slice(offset, offset + len);
      offset += len;
      blocks.push(block);
      ecBlocks.push(rsRemainder(block, ecLen));
    }

    var out = [];
    for (var c = 0; c < shortBlockLen + 1; c++) {
      for (var b = 0; b < numBlocks; b++) {
        if (c < blocks[b].length) out.push(blocks[b][c]);
      }
    }
    for (var e = 0; e < ecLen; e++) {
      for (var b2 = 0; b2 < numBlocks; b2++) out.push(ecBlocks[b2][e]);
    }
    return out;
  }

  /* ----------------------------------------------------------- matrix build */
  function makeMatrix(size) {
    var m = [];
    for (var i = 0; i < size; i++) m.push(new Array(size).fill(null));
    return m;
  }

  function drawFunctionPatterns(m, ver) {
    var size = m.length;

    // Timing patterns.
    for (var i = 0; i < size; i++) {
      m[6][i] = (i % 2 === 0); m[i][6] = (i % 2 === 0);
    }

    function finder(cy, cx) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var y = cy + dy, x = cx + dx;
          if (y < 0 || y >= size || x < 0 || x >= size) continue;
          var d = Math.max(Math.abs(dy), Math.abs(dx));
          m[y][x] = (d !== 2 && d !== 4);
        }
      }
    }
    finder(3, 3); finder(3, size - 4); finder(size - 4, 3);

    // Alignment patterns, skipping the three finder corners.
    var pos = alignPositions(ver);
    for (var a = 0; a < pos.length; a++) {
      for (var b = 0; b < pos.length; b++) {
        if ((a === 0 && b === 0) || (a === 0 && b === pos.length - 1) || (a === pos.length - 1 && b === 0)) continue;
        for (var dy2 = -2; dy2 <= 2; dy2++) {
          for (var dx2 = -2; dx2 <= 2; dx2++) {
            m[pos[a] + dy2][pos[b] + dx2] = (Math.max(Math.abs(dy2), Math.abs(dx2)) !== 1);
          }
        }
      }
    }

    // Reserve format areas, and place the always-dark module.
    reserveFormat(m);
    m[size - 8][8] = true;

    if (ver >= 7) {
      var rem = ver;
      for (var k = 0; k < 12; k++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vbits = (ver << 12) | rem;
      for (var j = 0; j < 18; j++) {
        var bit = ((vbits >>> j) & 1) === 1;
        var r = Math.floor(j / 3), c = j % 3;
        m[size - 11 + c][r] = bit;
        m[r][size - 11 + c] = bit;
      }
    }
  }

  function reserveFormat(m) {
    var size = m.length;
    for (var i = 0; i <= 8; i++) {
      if (m[8][i] === null) m[8][i] = false;
      if (m[i][8] === null) m[i][8] = false;
    }
    for (var j = 0; j < 8; j++) {
      if (m[8][size - 1 - j] === null) m[8][size - 1 - j] = false;
      if (m[size - 1 - j][8] === null) m[size - 1 - j][8] = false;
    }
  }

  function drawFormat(m, ec, mask) {
    var size = m.length;
    var data = (FORMAT_BITS[ec] << 3) | mask;
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var bits = ((data << 10) | rem) ^ 0x5412;

    function bit(i) { return ((bits >>> i) & 1) === 1; }

    // Copy 1 wraps the top-left finder: up column 8, then left along row 8.
    for (var k = 0; k <= 5; k++) m[k][8] = bit(k);
    m[7][8] = bit(6);
    m[8][8] = bit(7);
    m[8][7] = bit(8);
    for (var j = 9; j < 15; j++) m[8][14 - j] = bit(j);

    // Copy 2 is split between the top-right and bottom-left finders.
    for (var a = 0; a < 8; a++) m[8][size - 1 - a] = bit(a);
    for (var b = 8; b < 15; b++) m[size - 15 + b][8] = bit(b);

    m[size - 8][8] = true;   // the always-dark module
  }

  function placeData(m, codewords) {
    var size = m.length, i = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;                       // skip the timing column
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (m[y][x] !== null) continue;
          var bit = false;
          if (i < codewords.length * 8) {
            bit = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          }
          m[y][x] = bit;
          i++;
        }
      }
    }
  }

  function applyMask(m, isFunction, mask) {
    var size = m.length;
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if (isFunction[y][x]) continue;
        var invert;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = (x * y) % 2 + (x * y) % 3 === 0; break;
          case 6: invert = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
          default: invert = ((x + y) % 2 + (x * y) % 3) % 2 === 0; break;
        }
        if (invert) m[y][x] = !m[y][x];
      }
    }
  }

  function penalty(m) {
    var size = m.length, score = 0, x, y, i;

    // Rule 1: runs of five or more same-coloured modules.
    for (y = 0; y < size; y++) {
      var runColor = m[y][0], runLen = 1;
      for (x = 1; x < size; x++) {
        if (m[y][x] === runColor) { runLen++; if (runLen === 5) score += 3; else if (runLen > 5) score++; }
        else { runColor = m[y][x]; runLen = 1; }
      }
    }
    for (x = 0; x < size; x++) {
      var rc = m[0][x], rl = 1;
      for (y = 1; y < size; y++) {
        if (m[y][x] === rc) { rl++; if (rl === 5) score += 3; else if (rl > 5) score++; }
        else { rc = m[y][x]; rl = 1; }
      }
    }

    // Rule 2: 2x2 blocks of one colour.
    for (y = 0; y < size - 1; y++) {
      for (x = 0; x < size - 1; x++) {
        var c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
      }
    }

    // Rule 3: finder-like 1:1:3:1:1 patterns with a 4-module quiet zone.
    var A = [true, false, true, true, true, false, true];
    function matches(get, at, len) {
      for (i = 0; i < 7; i++) if (get(at + i) !== A[i]) return false;
      var before = true, after = true;
      for (i = 1; i <= 4; i++) { if (at - i < 0) break; if (get(at - i)) { before = false; break; } }
      for (i = 0; i < 4; i++) { if (at + 7 + i >= len) break; if (get(at + 7 + i)) { after = false; break; } }
      return before || after;
    }
    for (y = 0; y < size; y++) {
      for (x = 0; x + 7 <= size; x++) {
        (function (yy) { if (matches(function (k) { return m[yy][k]; }, x, size)) score += 40; })(y);
      }
    }
    for (x = 0; x < size; x++) {
      for (y = 0; y + 7 <= size; y++) {
        (function (xx) { if (matches(function (k) { return m[k][xx]; }, y, size)) score += 40; })(x);
      }
    }

    // Rule 4: deviation from a 50% dark ratio.
    var dark = 0;
    for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (m[y][x]) dark++;
    var percent = dark * 100 / (size * size);
    score += Math.floor(Math.abs(percent - 50) / 5) * 10;
    return score;
  }

  /**
   * Encode text into a QR matrix.
   * @returns {{size:number, modules:boolean[][], version:number, ec:string, mask:number}}
   */
  function encode(text, options) {
    options = options || {};
    var ec = options.ec || 'M';
    if (!EC_PER_BLOCK[ec]) throw new Error('Unknown EC level: ' + ec);

    var bytes = utf8Bytes(String(text));
    var ver = chooseVersion(bytes.length, ec, options.minVersion);
    if (ver === null) throw new Error('Too much data for a QR code at EC level ' + ec);

    var codewords = interleave(buildCodewords(bytes, ver, ec), ver, ec);
    var size = ver * 4 + 17;

    var m = makeMatrix(size);
    drawFunctionPatterns(m, ver);

    // Record which modules are reserved before any data is placed.
    var isFunction = [];
    for (var y = 0; y < size; y++) {
      isFunction.push([]);
      for (var x = 0; x < size; x++) isFunction[y].push(m[y][x] !== null);
    }

    placeData(m, codewords);

    var best = null, bestScore = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      var trial = m.map(function (row) { return row.slice(); });
      applyMask(trial, isFunction, mask);
      drawFormat(trial, ec, mask);
      var s = penalty(trial);
      if (s < bestScore) { bestScore = s; best = trial; var bestMask = mask; }
    }
    return { size: size, modules: best, version: ver, ec: ec, mask: bestMask };
  }

  /** Render a matrix as a standalone SVG string. */
  function toSvg(qr, opts) {
    opts = opts || {};
    var quiet = opts.quiet === undefined ? 4 : opts.quiet;
    var dark = opts.dark || '#000000';
    var light = opts.light || '#ffffff';
    var total = qr.size + quiet * 2;
    var path = [];
    for (var y = 0; y < qr.size; y++) {
      for (var x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) path.push('M' + (x + quiet) + ' ' + (y + quiet) + 'h1v1h-1z');
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total +
      '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
      '<rect width="' + total + '" height="' + total + '" fill="' + light + '"/>' +
      '<path fill="' + dark + '" d="' + path.join('') + '"/></svg>';
  }

  return { encode: encode, toSvg: toSvg };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = QRCode;
