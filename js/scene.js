// Songroost — the living Amazon board: row scenery and gentle animation.
// Each row scene is drawn at 1070 x 148 and scaled to fit. Everything moves slowly on purpose.
(function (root) {
  'use strict';
  var W = 1070, H = 148;
  function rngFrom(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function R(seed) { var r = rngFrom(seed); return { u: function (a, b) { return a + (b - a) * r(); }, pick: function (arr) { return arr[Math.floor(r() * arr.length)]; }, r: r }; }
  function n0(v) { return Math.round(v); }
  function p3(v) { return String(Math.round(v * 1000) / 1000); }

  // ---------- scenery ----------
  function rect(c, y, hh) { y = y || 0; return '<rect y="' + n0(y) + '" width="' + W + '" height="' + n0(hh == null ? H - y : hh) + '" fill="' + c + '"/>'; }
  function hill(y, amp, c, r) { var d = 'M0 ' + n0(y); for (var i = 1; i <= 4; i++) { var x = W * i / 4; d += ' Q' + n0(x - W / 8) + ' ' + n0(y - amp * r.u(-1, 1)) + ' ' + n0(x) + ' ' + n0(y + amp * r.u(-.4, .4)); } return '<path d="' + d + ' V' + H + ' H0Z" fill="' + c + '"/>'; }
  function blobs(r, n, x0, x1, y0, y1, r0, r1, cols) { var s = ''; for (var i = 0; i < n; i++) s += '<circle cx="' + n0(r.u(x0, x1)) + '" cy="' + n0(r.u(y0, y1)) + '" r="' + n0(r.u(r0, r1)) + '" fill="' + r.pick(cols) + '"/>'; return s; }
  function strokes(r, n, x0, x1, y0, y1, l0, l1, c, sw, bend) { var d = ''; bend = bend || 4; for (var i = 0; i < n; i++) { var x = r.u(x0, x1), y = r.u(y0, y1), l = r.u(l0, l1); d += 'M' + n0(x) + ' ' + n0(y) + 'q' + n0(r.u(-bend, bend)) + ' ' + n0(-l / 2) + ' ' + n0(r.u(-bend * 1.5, bend * 1.5)) + ' ' + n0(-l); } return '<path d="' + d + '" stroke="' + c + '" stroke-width="' + (sw || 1.2) + '" fill="none" stroke-linecap="round"/>'; }
  function ripples(r, n, y0, y1, c, sw) { var d = ''; for (var i = 0; i < n; i++) d += 'M' + n0(r.u(0, W)) + ' ' + n0(r.u(y0, y1)) + 'h' + n0(r.u(8, 30)); return '<path d="' + d + '" stroke="' + c + '" stroke-width="' + (sw || 1.3) + '" stroke-linecap="round"/>'; }
  function palm(x, y, hgt, lean, trunk, frond, sw) {
    var tx = x + lean, ty = y - hgt, s = '<path d="M' + n0(x) + ' ' + n0(y) + ' Q' + n0(x + lean * .3) + ' ' + n0(y - hgt * .6) + ' ' + n0(tx) + ' ' + n0(ty) + '" stroke="' + trunk + '" stroke-width="' + (sw + .8) + '" fill="none" stroke-linecap="round"/>', d = '';
    [-170, -135, -100, -60, -25, 10].forEach(function (a) { var L = hgt * .42, rad = a * Math.PI / 180; d += 'M' + n0(tx) + ' ' + n0(ty) + 'Q' + n0(tx + L * .5 * Math.cos(rad)) + ' ' + n0(ty - L * .2) + ' ' + n0(tx + L * Math.cos(rad)) + ' ' + n0(ty + L * Math.sin(rad) * .6 + L * .25); });
    return s + '<path d="' + d + '" stroke="' + frond + '" stroke-width="' + (sw + 1) + '" fill="none" stroke-linecap="round"/>';
  }
  function scenery(hab) {
    var r = R({ canopy: 11, meadow: 23, shore: 37 }[hab]), P = [];
    if (hab === 'canopy') {
      P.push(rect('#dfeccf'), blobs(r, 118, 0, W, -H * .1, H * .5, H * .12, H * .26, ['#4f8a52', '#3f7a46', '#5f9a5a']), blobs(r, 133, 0, W, H * .3, H * .85, H * .14, H * .3, ['#2f6b3a', '#24583a', '#3a7a44']), blobs(r, 107, 0, W, H * .7, H * 1.1, H * .15, H * .3, ['#1d4a30', '#24583a']));
      for (var i = 0; i < 6; i++) P.push(palm(r.u(0, W), H, H * r.u(.6, .85), r.u(-20, 20), '#5a4030', '#1f5a32', 2.2));
      P.push(strokes(r, 42, 0, W, 0, H * .1, -H * .55, -H * .25, '#2f6b3a', 1.3, 6), blobs(r, 23, 0, W, H * .3, H * .9, 2, 3.2, ['#e2483c', '#f2a541', '#e86fa4']));
    } else if (hab === 'meadow') {
      P.push(rect('#e8f0d6'), blobs(r, 133, 0, W, -H * .05, H * .32, H * .12, H * .24, ['#2f6b3a', '#3f7a46', '#24583a']), rect('#a9c96a', H * .42), hill(H * .55, H * .05, '#97bb57', r), strokes(r, 267, 0, W, H * .62, H, 10, 26, '#5f8f32', 1.3, 5));
      for (var k = 0; k < 3; k++) P.push(palm(r.u(0, W), H * .6, H * .5, r.u(-14, 14), '#5a4030', '#2f6b3a', 2));
      P.push(blobs(r, 35, 0, W, H * .6, H * .95, 1.6, 2.6, ['#f2a541', '#e2483c', '#fbf7ee']));
    } else {
      P.push(rect('#e3eedd'), blobs(r, 152, 0, W, -H * .08, H * .3, H * .12, H * .22, ['#2f6b3a', '#24583a', '#3f7a46']), rect('#8f8458', H * .36),
        '<path d="M0 ' + n0(H * .36) + ' C' + n0(W * .3) + ' ' + n0(H * .42) + ' ' + n0(W * .6) + ' ' + n0(H * .32) + ' ' + W + ' ' + n0(H * .38) + ' V' + n0(H * .44) + ' C' + n0(W * .6) + ' ' + n0(H * .4) + ' ' + n0(W * .3) + ' ' + n0(H * .48) + ' 0 ' + n0(H * .44) + 'Z" fill="#a5996a"/>',
        ripples(r, 107, H * .48, H * .9, '#cfc59a', 1.8), blobs(r, 26, -20, W * .25, H * .82, H * 1.1, H * .1, H * .2, ['#24583a', '#2f6b3a']));
    }
    return '<svg aria-hidden="true" class="bg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + P.join('') + '</svg>';
  }

  // ---------- small animated things ----------
  function cloud(w, op) { return '<svg aria-hidden="true" width="' + w + '" height="' + n0(w * .38) + '" viewBox="0 0 200 76" style="display:block;opacity:' + op + '"><ellipse cx="60" cy="48" rx="46" ry="22" fill="#fff"/><ellipse cx="100" cy="36" rx="44" ry="30" fill="#fff"/><ellipse cx="146" cy="48" rx="42" ry="22" fill="#fff"/><rect x="20" y="48" width="170" height="22" rx="11" fill="#fff"/></svg>'; }
  function flock() { return '<svg aria-hidden="true" width="90" height="36" viewBox="0 0 90 36" style="display:block">' + [[0, 10], [30, 2], [26, 22], [56, 14]].map(function (p) { return '<g transform="translate(' + p[0] + ',' + p[1] + ')"><path class="sg-flap" d="M0 6 Q6 0 12 6 Q18 0 24 6" stroke="#22362a" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>'; }).join('') + '</svg>'; }
  function riverFlow() {
    var r = R(9), segs = [];
    for (var i = 0; i < 118; i++) segs.push([r.u(0, W), r.u(H * .5, H * .95), r.u(12, 34)]);
    var d = segs.map(function (s) { return 'M' + n0(s[0]) + ' ' + n0(s[1]) + 'h' + n0(s[2]); }).join('') + segs.map(function (s) { return 'M' + n0(s[0] + W) + ' ' + n0(s[1]) + 'h' + n0(s[2]); }).join('');
    return '<svg aria-hidden="true" class="ov" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><g class="sg-flow"><path d="' + d + '" stroke="#e2dab4" stroke-width="1.8" stroke-linecap="round" opacity=".75"/></g><g class="sg-leaf"><ellipse cx="0" cy="' + n0(H * .72) + '" rx="7" ry="3" fill="#6b8a3e" transform="rotate(-15 0 ' + n0(H * .72) + ')"/></g></svg>';
  }

  // fish
  var FISH = { ember: ['#d9542c', '#f6b26b', '#b8401f', '#fbf7ee'], neon: ['#2f8fd0', '#bfe6f2', '#e2483c', null], gold: ['#d79a1e', '#f6dc7a', '#b07a12', null],
    aro: ['#9aa7a6', '#eef0e6', '#c46a5a', null], lime: ['#6f9e2e', '#d9ec8c', '#4f7a1e', '#2f5a1a'], teal: ['#2a9a8a', '#a9e2d2', '#1e7a6c', null] };
  function fishSvg(kind, w, uid) {
    var f = FISH[kind], g = 'fg' + uid, long = kind === 'aro';
    var body = long ? 'M6 15 C14 7 34 7 50 10 C55 11 58 13 59 15 C58 17 55 19 50 20 C34 23 14 23 6 15Z' : 'M8 15 C14 4 34 2 46 8 C52 11 56 13 58 15 C56 17 52 19 46 22 C34 28 14 26 8 15Z';
    var st = f[3] ? '<path d="M30 5 C28 12 28 18 30 25" stroke="' + f[3] + '" stroke-width="3" fill="none" opacity=".8"/><path d="M38 6 C36 12 36 18 38 24" stroke="' + f[3] + '" stroke-width="2" fill="none" opacity=".6"/>' : '';
    if (kind === 'neon') st = '<path d="M14 15 C26 12 40 12 52 13" stroke="#5ff0e6" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M14 18 C22 20 30 20 36 19" stroke="#e2483c" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>';
    return '<svg aria-hidden="true" width="' + n0(w) + '" height="' + n0(w / 2) + '" viewBox="0 0 60 30" style="display:block;overflow:visible"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + f[0] + '"/><stop offset=".55" stop-color="' + f[0] + '"/><stop offset="1" stop-color="' + f[1] + '"/></linearGradient></defs>' +
      '<g class="sg-tail"><path d="M10 15 L0 5 C2 10 2 20 0 25Z" fill="' + f[2] + '"/></g><path d="M24 ' + (long ? 7 : 5) + ' C28 ' + (long ? 2 : 0) + ' 36 ' + (long ? 3 : 1) + ' 40 ' + (long ? 9 : 6) + 'Z" fill="' + f[2] + '"/>' +
      '<path d="' + body + '" fill="url(#' + g + ')"/>' + st + '<path d="M30 20 C33 24 37 25 38 21Z" fill="' + f[2] + '" opacity=".85"/><circle cx="49" cy="13" r="2.3" fill="#fbf7ee"/><circle cx="49.6" cy="13" r="1.2" fill="#141210"/></svg>';
  }
  var SWIM = [['ember', 64, 82, 1, 84, 0, 46, -12], ['neon', 20, 112, -1, 66, 0, 40, -40], ['neon', 17, 122, -1, 66, 1.2, 41.5, -40], ['neon', 19, 104, -1, 66, 2.2, 42.5, -40],
    ['gold', 42, 120, 1, 74, 0, 44, -50], ['aro', 96, 96, -1, 118, 0, 52, -70], ['lime', 30, 74, 1, 96, 0, 40, -4]];
  var JUMP = [['ember', 34, 640, 47, 88, -20], ['teal', 26, 880, 71, 92, -55]];
  function fishLayer() {
    var s = '';
    SWIM.forEach(function (f, i) { s += '<div class="sg-swim sg-s' + i + '"><div class="sg-bobf" style="animation-delay:' + (-i * .9).toFixed(1) + 's">' + fishSvg(f[0], f[1], 's' + i) + '</div></div>'; });
    JUMP.forEach(function (f, i) {
      s += '<div class="sg-jump sg-j' + i + '">' + fishSvg(f[0], f[1], 'j' + i) + '</div>';
      for (var k = 0; k < 2; k++) s += '<svg class="sg-ring sg-r' + i + k + '" aria-hidden="true" width="40" height="14" viewBox="0 0 40 14"><ellipse cx="20" cy="7" rx="17" ry="5" fill="none" stroke="#efe7c4" stroke-width="2"/><ellipse cx="20" cy="7" rx="9" ry="2.6" fill="none" stroke="#efe7c4" stroke-width="1.4" opacity=".8"/></svg>';
    });
    return s;
  }
  function fishCss() {
    var css = ['.sg-tail{transform-box:fill-box;transform-origin:100% 50%;animation:sgWag .7s ease-in-out infinite alternate}', '@keyframes sgWag{from{transform:scaleX(1) skewY(-8deg)}to{transform:scaleX(.8) skewY(8deg)}}',
      '.sg-bobf{animation:sgBobF 3.6s ease-in-out infinite alternate}', '@keyframes sgBobF{from{transform:translateY(-3px)}to{transform:translateY(3px)}}', '.sg-swim,.sg-jump,.sg-ring{position:absolute;pointer-events:none}'];
    SWIM.forEach(function (f, i) {
      var a = f[3] > 0 ? -f[1] - 20 : W + 20, b = f[3] > 0 ? W + 20 : -f[1] - 20, fl = f[3] > 0 ? '' : ' scaleX(-1)';
      css.push('.sg-s' + i + '{left:0;top:' + f[2] + 'px;animation:sgS' + i + ' ' + f[4] + 's linear infinite;animation-delay:' + f[7] + 's;opacity:.88}');
      css.push('@keyframes sgS' + i + '{0%,' + p3(f[5]) + '%{transform:translateX(' + a + 'px)' + fl + '}' + p3(f[6]) + '%,100%{transform:translateX(' + b + 'px)' + fl + '}}');
    });
    JUMP.forEach(function (f, i) {
      var T = f[3], js = f[4], dur = 1.5 / T * 100, st = ['0%,' + p3(js - .01) + '%{opacity:0;transform:translate(0px,24px) rotate(-55deg)}'];
      for (var j = 0; j <= 8; j++) { var t = j / 8, x = 70 * t, y = 24 - 84 * Math.sin(Math.PI * t), ang = Math.atan2(-84 * Math.PI * Math.cos(Math.PI * t), 70) * 180 / Math.PI; st.push(p3(js + dur * t) + '%{opacity:' + (j > 0 && j < 8 ? 1 : .6) + ';transform:translate(' + n0(x) + 'px,' + n0(y) + 'px) rotate(' + n0(ang) + 'deg)}'); }
      st.push(p3(js + dur + .2) + '%,100%{opacity:0;transform:translate(70px,30px) rotate(60deg)}');
      css.push('.sg-j' + i + '{left:' + f[2] + 'px;top:96px;animation:sgJ' + i + ' ' + T + 's linear infinite;animation-delay:' + f[5] + 's}', '@keyframes sgJ' + i + '{' + st.join('') + '}');
      [[0, js], [70, js + dur]].forEach(function (rr, k) {
        css.push('.sg-r' + i + k + '{left:' + (f[2] + rr[0] - 10 + Math.floor(f[1] / 2)) + 'px;top:118px;animation:sgR' + i + k + ' ' + T + 's ease-out infinite;animation-delay:' + f[5] + 's}');
        css.push('@keyframes sgR' + i + k + '{0%,' + p3(rr[1] - .01) + '%{opacity:0;transform:scale(.3)}' + p3(rr[1]) + '%{opacity:.9;transform:scale(.4)}' + p3(rr[1] + 4) + '%{opacity:0;transform:scale(1.6)}100%{opacity:0;transform:scale(1.6)}}');
      });
    });
    return css.join('\n');
  }

  // grass that sways in rolling gusts
  function grassLayer(seed, perBand, lo, hi, cols, width, topFrac, seeds) {
    var r = R(seed), bands = 10, bw = W / bands, out = '';
    for (var b = 0; b < bands; b++) {
      var d = {}; cols.forEach(function (c) { d[c] = ''; });
      for (var i = 0; i < perBand; i++) { var x = r.u(b * bw, (b + 1) * bw), y = r.u(H * topFrac, H + 2), l = r.u(lo, hi), c = r.pick(cols); d[c] += 'M' + n0(x) + ' ' + n0(y) + 'q' + n0(r.u(-3, 3)) + ' ' + n0(-l / 2) + ' ' + n0(r.u(-6, 6)) + ' ' + n0(-l); }
      var paths = cols.map(function (c) { return d[c] ? '<path d="' + d[c] + '" stroke="' + c + '" stroke-width="' + width + '" fill="none" stroke-linecap="round"/>' : ''; }).join('');
      if (seeds) for (var k = 0; k < 2; k++) { var sx = r.u(b * bw, (b + 1) * bw), sl = r.u(hi * .9, hi * 1.25), tx = sx + r.u(-4, 4); paths += '<path d="M' + n0(sx) + ' ' + H + 'q' + n0(r.u(-2, 2)) + ' ' + n0(-sl / 2) + ' ' + n0(tx - sx) + ' ' + n0(-sl) + '" stroke="#7a9a3a" stroke-width="1.2" fill="none"/><ellipse cx="' + n0(tx) + '" cy="' + n0(H - sl - 4) + '" rx="2.2" ry="5" fill="#d9c27a"/>'; }
      out += '<g class="sg-breeze" style="animation-delay:' + (-(bands - b) * .45).toFixed(2) + 's">' + paths + '</g>';
    }
    return out;
  }

  // ---------- black jaguar ----------
  function jaguarSvg(uid) {
    var w = 210, h = n0(w * 100 / 240), B = 'jgB' + uid, F = 'jgF' + uid;
    function hind(cls, dx, fill) { return '<g class="' + cls + '"><path transform="translate(' + dx + ' 0)" d="M62 48 C72 50 78 57 77 65 C76 70 73 74 72 78 L78 90 C81 93 78 96 71 96 C66 96 64 94 65 92 L63 82 C59 76 57 66 58 56 Z" fill="' + fill + '"/></g>'; }
    function fore(cls, dx, fill) { return '<g class="' + cls + '"><path transform="translate(' + dx + ' 0)" d="M150 50 C158 51 166 55 167 63 L166 87 C168 91 172 93 175 95 C170 97 162 97 158 95 C157 92 158 90 158 88 L156 67 C150 62 147 56 150 50 Z" fill="' + fill + '"/></g>'; }
    var ghost = [[92, 38, 2.6], [104, 44, 2.4], [118, 37, 2.6], [128, 46, 2.2], [140, 39, 2.4], [80, 46, 2.4], [112, 51, 2]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="none" stroke="#3a3d48" stroke-width="1" opacity=".35"/>'; }).join('');
    return '<svg role="img" aria-label="A black jaguar in the clearing" width="' + w + '" height="' + h + '" viewBox="0 0 240 100" style="display:block;overflow:visible">' +
      '<defs><linearGradient id="' + B + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f4a"/><stop offset=".35" stop-color="#22242b"/><stop offset="1" stop-color="#111114"/></linearGradient><linearGradient id="' + F + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1b20"/><stop offset="1" stop-color="#0d0d10"/></linearGradient></defs>' +
      '<ellipse cx="120" cy="96" rx="72" ry="3.5" fill="#1d2a14" opacity=".25"/><g class="sg-jbob">' +
      '<g class="sg-jtail"><path d="M62 40 C44 44 33 58 29 74 C27 82 29 88 35 89" stroke="#1c1d22" stroke-width="6.5" fill="none" stroke-linecap="round"/><path d="M60 39 C44 43 35 55 31 68" stroke="#4a4f5c" stroke-width="1.2" fill="none" opacity=".5"/></g>' +
      hind('sg-lh2', -8, 'url(#' + F + ')') + fore('sg-lf2', -9, 'url(#' + F + ')') +
      '<path d="M58 42 C60 31 76 27 96 29 C118 31 136 33 150 29 C160 26 170 28 178 36 C183 42 183 51 177 57 C171 62 162 64 154 62 C140 58 124 56 108 57 C92 58 76 60 66 56 C59 52 56 47 58 42 Z" fill="url(#' + B + ')"/>' + ghost +
      '<path d="M64 36 C74 29 90 28 104 30 C122 32 138 33 152 29 C160 27 168 28 174 33" stroke="#6b7385" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".55"/><path d="M62 46 C66 38 76 36 84 40" stroke="#4d5361" stroke-width="1.2" fill="none" opacity=".55"/><path d="M148 34 C156 36 160 44 158 52" stroke="#4d5361" stroke-width="1.2" fill="none" opacity=".55"/>' +
      hind('sg-lh1', 6, 'url(#' + B + ')') + fore('sg-lf1', 4, 'url(#' + B + ')') +
      '<g class="sg-jhead"><path d="M170 36 C176 29 188 27 197 31 C204 33 210 37 214 41 C217 44 216 48 212 50 C206 52 198 53 190 52 C181 51 174 46 170 40 Z" fill="url(#' + B + ')"/>' +
      '<path d="M179 32 C179 25 184 22 189 27 Z" fill="#26282f"/><path d="M181 30 C181 27 184 26 186 28 Z" fill="#4a3a3c"/><path d="M178 33 C186 29 196 29 204 34" stroke="#6b7385" stroke-width="1.2" fill="none" opacity=".55"/>' +
      '<g class="sg-jlid"><g class="sg-jeye"><path d="M194 37 C196 34.5 200 34.5 203 36.5 C200 38.5 197 38.6 194 37 Z" fill="#c9b13a"/><path d="M198.5 35.2 L198.5 38.2" stroke="#0e0e10" stroke-width="1.3" stroke-linecap="round"/></g></g>' +
      '<path d="M212 41 C214 40.5 216 41.5 216 43 C214 43.5 212.5 43 212 41 Z" fill="#3a2e30"/><path d="M215 44 C212 47 207 48 203 47" stroke="#0e0e10" stroke-width="1" fill="none" stroke-linecap="round"/><path d="M206 45 L224 43 M206 46.5 L223 48" stroke="#7d8290" stroke-width=".5" opacity=".6"/></g></g></svg>';
  }

  // timeline -> CSS keyframes
  function TL(T) { this.T = T; this.k = {}; }
  TL.prototype.add = function (part, t, tf) { (this.k[part] = this.k[part] || []).push([Math.round(Math.min(Math.max(t, 0), this.T) * 1000) / 1000, tf]); };
  TL.prototype.pose = function (t, d) { for (var p in d) this.add(p, t, d[p]); };
  TL.prototype.keyframes = function (part, name) {
    var fr = this.k[part].map(function (x, i) { return [x[0], x[1], i]; }).sort(function (a, b) { return a[0] - b[0] || a[2] - b[2]; });
    if (fr[0][0] > 0) fr.unshift([0, fr[0][1]]);
    if (fr[fr.length - 1][0] < this.T) fr.push([this.T, fr[fr.length - 1][1]]);
    var seen = {}, out = '', T = this.T;
    fr.forEach(function (f) { var pc = p3(f[0] / T * 100); if (seen[pc]) return; seen[pc] = 1; out += pc + '%{transform:' + f[1] + '}'; });
    return '@keyframes ' + name + '{' + out + '}';
  };
  var LEGS = { lh1: 0, lf1: .25, lh2: .5, lf2: .75 };
  function leg(a, sy) { return 'rotate(' + n0(a) + 'deg) scaleY(' + sy.toFixed(2) + ')'; }
  function head(a, x, y) { return 'rotate(' + n0(a) + 'deg) translate(' + (x || 0) + 'px,' + (y || 0) + 'px)'; }
  function bob(y) { return 'translateY(' + y.toFixed(1) + 'px)'; }
  function wrap(x) { return 'translate(' + n0(x) + 'px,0px)'; }
  var STAND = { lh1: leg(0, 1), lf1: leg(0, 1), lh2: leg(0, 1), lf2: leg(0, 1), bob: bob(0), head: head(0) };
  var CROUCH = { lh1: leg(6, .72), lh2: leg(6, .72), lf1: leg(-4, .74), lf2: leg(-4, .74), bob: bob(13), head: head(4, 0, 2) };
  var LIE = { lh1: leg(0, .42), lh2: leg(0, .42), lf1: leg(-72, .92), lf2: leg(-68, .92), bob: bob(26), head: head(10, 4, 7) };
  var LEAP = { lh1: leg(52, 1), lh2: leg(48, 1), lf1: leg(-58, 1), lf2: leg(-54, 1), head: head(-6) };
  var SPEED = 13, P = 1.9;
  function walk(tl, t0, t1, x0, x1, A, sy0, bob0) {
    A = A || 17; sy0 = sy0 || 1; bob0 = bob0 || 0;
    tl.add('wrap', t0, wrap(x0)); tl.add('wrap', t1, wrap(x1));
    function pose(u) { if (u < .6) return [-A + 2 * A * u / .6, sy0]; if (u < .8) { var f = (u - .6) / .2; return [A * (1 - f), sy0 * (1 - .2 * f)]; } var g = (u - .8) / .2; return [-A * g, sy0 * (.8 + .2 * g)]; }
    var a0 = t0 + .35, a1 = t1 - .35;
    Object.keys(LEGS).forEach(function (l) {
      var ph = LEGS[l], ts = [a0, a1], n = Math.floor((t1 - t0) / P) + 2;
      for (var k = -1; k <= n; k++) [0, .6, .8].forEach(function (q) { var tb = t0 + (k + q - ph) * P; if (tb > a0 && tb < a1) ts.push(tb); });
      ts.sort(function (a, b) { return a - b; }).forEach(function (tb) { var u = (((tb - t0) / P) + ph) % 1, p = pose(u); tl.add(l, tb, leg(p[0], p[1])); });
    });
    var k2 = 0, tb2 = a0; while (tb2 < a1) { tl.add('bob', tb2, bob(bob0 - (k2 % 2 ? 1.4 : 0))); tb2 += P / 4; k2++; }
    tl.add('bob', a1, bob(bob0));
  }
  function visitNap(tl, s) {
    var x1 = 280, t = s + (x1 + 240) / SPEED;
    tl.pose(s, STAND); tl.add('lid', s, 'scaleY(1)'); walk(tl, s, t, -240, x1); tl.pose(t + .4, STAND);
    [[2, head(-12)], [3.6, head(-12, -2, 0)], [5, head(4)], [6.4, head(-5)], [7.4, head(0)]].forEach(function (h) { tl.add('head', t + h[0], h[1]); });
    tl.pose(t + 9, STAND); tl.pose(t + 10.6, CROUCH); tl.pose(t + 12.8, LIE);
    tl.add('lid', t + 13.4, 'scaleY(1)'); tl.add('lid', t + 14.2, 'scaleY(.1)');
    var b = t + 12.8, k = 0; while (b < t + 36) { b += 2.3; k++; tl.add('bob', b, bob(26 - (k % 2 ? 1.8 : 0))); }
    tl.add('bob', t + 37, bob(26)); tl.add('head', t + 37, LIE.head); tl.add('lid', t + 37.2, 'scaleY(.1)'); tl.add('lid', t + 37.8, 'scaleY(1)');
    tl.add('head', t + 38.8, head(-6, 2, 4)); Object.keys(LEGS).forEach(function (l) { tl.add(l, t + 38.8, LIE[l]); });
    tl.pose(t + 40.6, CROUCH); tl.pose(t + 42.6, STAND); tl.add('head', t + 43.6, head(-8)); tl.add('head', t + 44.6, head(0));
    var w0 = t + 45.4, w1 = w0 + (1100 - x1) / SPEED; tl.add('wrap', w0, wrap(x1)); walk(tl, w0, w1, x1, 1100);
    tl.pose(w1 + .4, STAND); tl.add('lid', w1, 'scaleY(1)'); tl.add('wrap', w1 + .5, wrap(-240));
    return w1 + .5;
  }
  function visitPounce(tl, s) {
    var x1 = 380, t = s + (x1 + 240) / SPEED;
    tl.pose(s, STAND); tl.add('lid', s, 'scaleY(1)'); walk(tl, s, t, -240, x1); tl.pose(t + .4, STAND);
    tl.add('head', t + 1.8, head(6, 0, 2)); tl.add('head', t + 3.4, head(3, 0, 1));
    tl.pose(t + 5, CROUCH); tl.add('head', t + 5, head(7, 0, 4));
    var c0 = t + 5.4, c1 = t + 13.4, xc = x1 + 60; walk(tl, c0, c1, x1, xc, 8, .72, 13);
    Object.keys(CROUCH).forEach(function (l) { tl.add(l, c1 + .3, CROUCH[l]); }); tl.add('head', c1 + .3, head(7, 0, 4));
    [.5, .8, 1.1, 1.4, 1.7, 2.0].forEach(function (dt, i) { tl.add('bob', c1 + dt, bob(13 + (i % 2 === 0 ? 2.5 : 0))); });
    var j0 = c1 + 2.3; tl.pose(j0, CROUCH); tl.add('bob', j0, bob(16)); tl.add('wrap', j0, wrap(xc));
    var dur = .95, dist = 160, hgt = 42;
    tl.pose(j0 + .25, LEAP); tl.pose(j0 + .7, LEAP);
    for (var i = 1; i <= 6; i++) { var f = i / 6; tl.add('wrap', j0 + dur * f, wrap(xc + dist * f)); if (i < 6) tl.add('bob', j0 + dur * f, bob(-hgt * 1.14 * 4 * f * (1 - f))); }
    var land = j0 + dur; tl.pose(land + .15, CROUCH); tl.pose(land + 1.8, STAND);
    tl.add('head', land + 2.8, head(14, 2, 5)); tl.add('head', land + 4.6, head(12, 2, 4)); tl.add('head', land + 5.6, head(-10)); tl.add('head', land + 7, head(0));
    var x2 = xc + dist, w0 = land + 7.6, w1 = w0 + (1100 - x2) / SPEED; tl.add('wrap', w0, wrap(x2)); walk(tl, w0, w1, x2, 1100);
    tl.pose(w1 + .4, STAND); tl.add('wrap', w1 + .5, wrap(-240));
    return w1 + .5;
  }
  function jaguarCss() {
    var tl = new TL(1000); tl.add('wrap', 0, wrap(-240)); tl.add('lid', 0, 'scaleY(1)');
    var e1 = visitNap(tl, 2), e2 = visitPounce(tl, e1 + 18), T = e2 + 14; tl.T = T;
    var css = ['.sg-jg{position:absolute;left:0;top:60px;pointer-events:none}',
      '.sg-jgate{position:absolute;inset:0;pointer-events:none;animation:sgGate ' + p3(T * 3) + 's linear infinite both}', '@keyframes sgGate{0%,33.3%{opacity:1}33.34%,99.99%{opacity:0}100%{opacity:1}}',
      '.sg-lh1,.sg-lh2,.sg-lf1,.sg-lf2{transform-box:fill-box;transform-origin:50% 8%}', '.sg-jhead{transform-box:fill-box;transform-origin:5% 50%}', '.sg-jlid{transform-box:fill-box;transform-origin:50% 50%}',
      '.sg-jtail{transform-box:fill-box;transform-origin:100% 0%;animation:sgJTail 5.5s ease-in-out infinite alternate}', '@keyframes sgJTail{from{transform:rotate(-4deg)}to{transform:rotate(6deg)}}',
      '.sg-jeye{transform-box:fill-box;transform-origin:50% 50%;animation:sgBlink 7s linear infinite}', '@keyframes sgBlink{0%,95%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}'];
    var sel = { wrap: '.sg-jg', bob: '.sg-jbob', head: '.sg-jhead', lid: '.sg-jlid', lh1: '.sg-lh1', lf1: '.sg-lf1', lh2: '.sg-lh2', lf2: '.sg-lf2' };
    Object.keys(sel).forEach(function (part) { var nm = 'sgJ_' + part; css.push(sel[part] + '{animation:' + nm + ' ' + p3(T) + 's linear infinite both}', tl.keyframes(part, nm)); });
    return css.join('\n');
  }

  // ---------- squirrel monkey ----------
  function monkeySvg() {
    return '<svg aria-hidden="true" width="48" height="40" viewBox="0 0 60 50" style="display:block;overflow:visible">' +
      '<g class="sg-mtail"><path d="M18 31 C8 33 4 40 6 46 C7 50 12 50 13 46" stroke="#9c927c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M7 45 C8 50 12 50 13 46" stroke="#2a2420" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>' +
      '<g class="sg-mbody"><g class="sg-mleg"><path d="M20 32 C17 37 15 40 17 44 L22 44" stroke="#e3a33a" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<ellipse cx="26" cy="29" rx="11" ry="7.5" fill="#8f8a78"/><path d="M17 27 C22 22 30 21 36 25" stroke="#a9a48f" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 34 C26 36 31 36 34 33" stroke="#e8d9a8" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<g class="sg-marm"><path d="M33 30 C36 34 37 38 38 42 L42 42" stroke="#e3a33a" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<g class="sg-mhead"><circle cx="40" cy="19" r="8.2" fill="#8f8a78"/><path d="M33 16 C35 10 44 9 48 14" stroke="#4a463c" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="34" cy="18" r="2.4" fill="#f4efe2"/><ellipse cx="43" cy="20" rx="5.6" ry="6.2" fill="#f4efe2"/>' +
      '<circle cx="41.4" cy="18.2" r="1.7" fill="#1c1814"/><circle cx="45.6" cy="18.2" r="1.6" fill="#1c1814"/><circle cx="41" cy="17.6" r=".5" fill="#fff"/><circle cx="45.2" cy="17.6" r=".5" fill="#fff"/><ellipse cx="44.6" cy="23.4" rx="3" ry="2.2" fill="#2a2420"/></g></g></svg>';
  }
  function mb(a, sx, sy) { return 'rotate(' + n0(a) + 'deg) scale(' + (sx || 1).toFixed(2) + ',' + (sy || 1).toFixed(2) + ')'; }
  function rot(a) { return 'rotate(' + n0(a) + 'deg)'; }
  var SIT = { mbody: mb(0), mhead: rot(0), marm: rot(0), mleg: rot(0) };
  function mwrap(x, y) { return 'translate(' + n0(x) + 'px,' + n0(y) + 'px)'; }
  function monkeyTl(seed, T, start, flip) {
    var r = R(seed), tl = new TL(T), x = flip ? 1140 : -70, y = r.u(30, 80), sgn = flip ? -1 : 1, t = start, hops = 0, longDone = false;
    tl.add('mwrap', 0, mwrap(x, y)); tl.pose(0, SIT); tl.add('mwrap', t, mwrap(x, y));
    while (flip ? x > -80 : x < 1110) {
      var dx = r.u(55, 140) * sgn, ny = Math.min(96, Math.max(14, y + r.u(-34, 34))), dur = r.u(.42, .66), hg = r.u(14, 30);
      tl.pose(t, SIT); tl.pose(t + .08, { mbody: mb(-16), marm: rot(-50), mleg: rot(40), mhead: rot(-6) });
      for (var i = 1; i <= 5; i++) { var f = i / 5; tl.add('mwrap', t + dur * f, mwrap(x + dx * f, y + (ny - y) * f - hg * 4 * f * (1 - f))); }
      tl.pose(t + dur * .5, { mbody: mb(0), marm: rot(-62), mleg: rot(30), mhead: rot(0) });
      tl.pose(t + dur, { mbody: mb(12, 1.1, .84), marm: rot(10), mleg: rot(-6), mhead: rot(6) });
      x += dx; y = ny; t += dur; tl.pose(t + .14, SIT); hops++;
      var on = x > -60 && x < 1050, roll = r.r();
      if (on && !longDone && hops >= 3 && roll < .45) {
        longDone = true; var d = r.u(3.5, 5.5);
        [[.6, -18], [1.4, 12], [2.2, -8], [3, 16], [d - .3, 0]].forEach(function (h) { tl.add('mhead', t + h[0], rot(h[1])); });
        [[1.2, -120], [1.5, -100], [1.8, -122], [2.1, -104], [2.5, 0]].forEach(function (h) { tl.add('marm', t + h[0], rot(h[1])); });
        tl.add('mwrap', t + d, mwrap(x, y)); t += d;
      } else if (on && roll < .35) { var d2 = r.u(.6, 1.6); tl.add('mhead', t + d2 * .5, rot(r.pick([-14, 10, 16]))); tl.add('mhead', t + d2, rot(0)); tl.add('mwrap', t + d2, mwrap(x, y)); t += d2; }
      else { t += r.u(.05, .18); tl.add('mwrap', t, mwrap(x, y)); }
    }
    tl.add('mwrap', t + .05, mwrap(flip ? 1140 : -70, y));
    return tl;
  }
  var MONKEYS = [[7, 97, 4, false], [21, 151, 70, true]];
  function monkeyCss() {
    var css = ['.sg-mk{position:absolute;left:0;top:0;pointer-events:none}', '.sg-mbody{transform-box:fill-box;transform-origin:50% 100%}', '.sg-mhead{transform-box:fill-box;transform-origin:30% 80%}',
      '.sg-marm{transform-box:fill-box;transform-origin:10% 5%}', '.sg-mleg{transform-box:fill-box;transform-origin:70% 5%}',
      '.sg-mtail{transform-box:fill-box;transform-origin:100% 0%;animation:sgMTail 2.4s ease-in-out infinite alternate}', '@keyframes sgMTail{from{transform:rotate(-8deg)}to{transform:rotate(10deg)}}', '.sg-mflip{transform:scaleX(-1)}'];
    MONKEYS.forEach(function (m, i) {
      var tl = monkeyTl(m[0], m[1], m[2], m[3]), sel = { mwrap: '.sg-mk' + i, mbody: '.sg-mk' + i + ' .sg-mbody', mhead: '.sg-mk' + i + ' .sg-mhead', marm: '.sg-mk' + i + ' .sg-marm', mleg: '.sg-mk' + i + ' .sg-mleg' };
      Object.keys(sel).forEach(function (part) { var nm = 'sgM' + i + '_' + part; css.push(sel[part] + '{animation:' + nm + ' ' + m[1] + 's linear infinite both}', tl.keyframes(part, nm)); });
    });
    return css.join('\n');
  }

  // ---------- assembly ----------
  var BASE_CSS = [
    '.sg-cloud{position:absolute;pointer-events:none;animation:sgCloud linear infinite}', '@keyframes sgCloud{from{transform:translateX(-360px)}to{transform:translateX(1460px)}}',
    '.sg-flock{position:absolute;pointer-events:none;animation:sgFlock 46s linear infinite}', '@keyframes sgFlock{0%{transform:translateX(-140px)}26%{transform:translateX(1140px)}100%{transform:translateX(1140px)}}',
    '.sg-flock2{position:absolute;pointer-events:none;animation:sgFlock2 58s linear infinite;animation-delay:-20s}', '@keyframes sgFlock2{0%{transform:translateX(1160px) scaleX(-1)}22%{transform:translateX(-160px) scaleX(-1)}100%{transform:translateX(-160px) scaleX(-1)}}',
    '.sg-flap{transform-box:fill-box;transform-origin:50% 60%;animation:sgFlapS 1.1s ease-in-out infinite alternate}', '@keyframes sgFlapS{from{transform:scaleY(1)}to{transform:scaleY(.3)}}',
    '.sg-flow{animation:sgFlow 28s linear infinite}', '@keyframes sgFlow{from{transform:translateX(0)}to{transform:translateX(-1070px)}}',
    '.sg-leaf{animation:sgLeaf 52s linear infinite;animation-delay:-14s}', '@keyframes sgLeaf{from{transform:translateX(-40px)}to{transform:translateX(1110px)}}',
    '.sg-breeze{transform-box:fill-box;transform-origin:50% 100%;animation:sgBreeze 6.5s ease-in-out infinite}', '@keyframes sgBreeze{0%,100%{transform:skewX(-1.5deg)}35%{transform:skewX(4.5deg)}60%{transform:skewX(1deg)}}',
    '.sg-fly{position:absolute;width:5px;height:5px;border-radius:50%;background:#f6e27a;box-shadow:0 0 8px 3px rgba(246,226,122,.7);animation:sgFire 6s ease-in-out infinite;pointer-events:none;display:none}', '@keyframes sgFire{0%,100%{opacity:0;transform:translate(0,0)}50%{opacity:1;transform:translate(10px,-14px)}}',
    '.board.night .sg-fly{display:block}', '.board .jg-dusk{display:none}', '.board.dusk .jg-dusk{display:block}', '.board.dusk .jg-day{display:none}',
    '.scene{position:absolute;inset:0;overflow:hidden;border-radius:10px;pointer-events:none}', '.scn{position:absolute;left:50%;bottom:0;width:1070px;height:148px;transform-origin:50% 100%}',
    '.scn .bg,.scn .ov{position:absolute;left:0;top:0;display:block}', '.scene .tint{position:absolute;inset:0;transition:background 3s ease}',
    '@media (prefers-reduced-motion: reduce){.scn *{animation:none !important}.sg-swim,.sg-jump,.sg-ring,.sg-mk,.sg-cloud,.sg-flock,.sg-flock2{display:none}.sg-jg{transform:translateX(380px)}.sg-jgate{opacity:1}}'
  ].join('\n');
  function fireflies(seed) { var r = R(seed), s = ''; for (var i = 0; i < 8; i++) s += '<span class="sg-fly" style="left:' + n0(r.u(120, 1040)) + 'px;top:' + n0(r.u(10, 130)) + 'px;animation-delay:' + r.u(0, 6).toFixed(1) + 's;animation-duration:' + r.u(5, 8).toFixed(1) + 's"></span>'; return s; }
  function rowScene(hab) {
    var s = scenery(hab);
    if (hab === 'canopy') {
      s += [[6, 170, -60, 210, .5], [40, 230, -150, 160, .4], [0, 200, -20, 180, .45]].map(function (c) { return '<div class="sg-cloud" style="left:0;top:' + c[0] + 'px;animation-duration:' + c[1] + 's;animation-delay:' + c[2] + 's">' + cloud(c[3], c[4]) + '</div>'; }).join('');
      s += '<div class="sg-flock" style="left:0;top:14px">' + flock() + '</div><div class="sg-flock2" style="left:0;top:70px">' + flock() + '</div>';
      s += MONKEYS.map(function (m, i) { return '<div class="sg-mk sg-mk' + i + '"><div class="' + (m[3] ? 'sg-mflip' : '') + '">' + monkeySvg() + '</div></div>'; }).join('');
    } else if (hab === 'meadow') {
      var svg = function (inner) { return '<svg aria-hidden="true" class="ov" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" style="overflow:visible">' + inner + '</svg>'; };
      s += svg(grassLayer(4, 22, 16, 36, ['#4f8a2a', '#5f9a34', '#3f7a24'], 1.5, .5, true));
      s += '<div class="jg-dusk"><div class="sg-jg">' + jaguarSvg('d') + '</div></div><div class="jg-day"><div class="sg-jgate"><div class="sg-jg">' + jaguarSvg('n') + '</div></div></div>';
      s += svg(grassLayer(11, 14, 10, 22, ['#6aa83a', '#84b84a'], 1.8, .88, false));
    } else {
      s += fishLayer() + riverFlow();
    }
    return s + fireflies({ canopy: 3, meadow: 5, shore: 7 }[hab]);
  }
  var cssDone = false;
  function injectCss() { if (cssDone) return; cssDone = true; var st = document.createElement('style'); st.id = 'scene-css'; st.textContent = [BASE_CSS, fishCss(), jaguarCss(), monkeyCss()].join('\n'); document.head.appendChild(st); }
  // Scale each 1070 x 148 scene to cover its row.
  var ro = null;
  function fit(el) {
    function one(sc) { var p = sc.parentNode, w = p.clientWidth, h = p.clientHeight; if (!w || !h) return; var s = Math.max(w / W, h / H); sc.style.transform = 'translateX(-50%) scale(' + s.toFixed(4) + ')'; }
    var all = (el || document).querySelectorAll('.scn');
    Array.prototype.forEach.call(all, one);
    if (!ro && window.ResizeObserver) { ro = new ResizeObserver(function () { Array.prototype.forEach.call(document.querySelectorAll('.scn'), one); }); }
    if (ro) Array.prototype.forEach.call(all, function (sc) { ro.observe(sc.parentNode); });
  }
  root.SongroostScene = { row: rowScene, injectCss: injectCss, fit: fit };
})(this);
