// Songroost — card art: design-system icons, placeholder bird drawings and the bird card.
(function () {
  var ICON = {"food-insect":"<ellipse cx=\"12\" cy=\"13.5\" rx=\"4.5\" ry=\"6\"></ellipse><path d=\"M12 7.5v12\"></path><circle cx=\"12\" cy=\"5.4\" r=\"1.8\"></circle><path d=\"M11 3.9 9.5 2.4M13 3.9l1.5-1.5M7.6 11 4.5 9.5M7.5 14H4M7.8 17 5 19M16.4 11l3.1-1.5M16.5 14H20M16.2 17l2.8 2\"></path>","food-grain":"<path d=\"M12 21.5V9\"></path><ellipse cx=\"9.4\" cy=\"13.2\" rx=\"1.8\" ry=\"3\" transform=\"rotate(-30 9.4 13.2)\"></ellipse><ellipse cx=\"14.6\" cy=\"13.2\" rx=\"1.8\" ry=\"3\" transform=\"rotate(30 14.6 13.2)\"></ellipse><ellipse cx=\"9.4\" cy=\"8.2\" rx=\"1.8\" ry=\"3\" transform=\"rotate(-30 9.4 8.2)\"></ellipse><ellipse cx=\"14.6\" cy=\"8.2\" rx=\"1.8\" ry=\"3\" transform=\"rotate(30 14.6 8.2)\"></ellipse><ellipse cx=\"12\" cy=\"4.4\" rx=\"1.8\" ry=\"2.8\"></ellipse>","food-berry":"<circle cx=\"8.5\" cy=\"15.5\" r=\"3\"></circle><circle cx=\"15.5\" cy=\"15.5\" r=\"3\"></circle><circle cx=\"12\" cy=\"10.5\" r=\"3\"></circle><path d=\"M12 7.5c0-2.5 1.5-4 4-4.5\"></path><path d=\"M13.6 5.2c2-.6 4 0 5 1.5-2 1-4 .5-5-1.5z\"></path>","food-fish":"<path d=\"M2.5 12c2.5-4.5 8.5-6 13-2.2L20.5 7v10l-5-2.8C11 18 5 16.5 2.5 12z\"></path><circle cx=\"7\" cy=\"11.2\" r=\"0.6\" fill=\"currentColor\"></circle>","food-prey":"<path d=\"M3.5 17h15.5c1.3 0 1.8-1.2 1-2l-1.6-1.4C17.6 10.3 14.8 8 11.5 8 7 8 3.5 11.5 3.5 17z\"></path><circle cx=\"14.2\" cy=\"8.6\" r=\"1.6\"></circle><path d=\"M3.5 17c-1.5 0-2.2-1.4-1.2-2.6\"></path><circle cx=\"17\" cy=\"12.4\" r=\"0.5\" fill=\"currentColor\"></circle>","food-any":"<path d=\"M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9\"></path><circle cx=\"12\" cy=\"12\" r=\"2.2\"></circle>","nest-platform":"<path d=\"M3 15h18M5 12.5l14 4.5M5 17.5l14-4.5\"></path><path d=\"M9.5 12.2a2.5 2 0 0 1 5 0\"></path>","nest-cup":"<path d=\"M3 9h18M4 9c0 6 3.5 10 8 10s8-4 8-10M5.5 13h13M7.5 16.5h9\"></path>","nest-cavity":"<path d=\"M4 21h16M6 21V9a6 6 0 0 1 12 0v12M9.5 21v-6.5a2.5 2.5 0 0 1 5 0V21\"></path>","nest-ground":"<path d=\"M2 17h20M6 17c1.5-3.2 10.5-3.2 12 0\"></path><circle cx=\"10.5\" cy=\"15.4\" r=\"1.2\"></circle><circle cx=\"13.6\" cy=\"15.4\" r=\"1.2\"></circle>","nest-freeform":"<path d=\"M12 12a1.5 1.5 0 0 1 1.5 1.5 3 3 0 0 1-3 3 4.5 4.5 0 0 1-4.5-4.5 6 6 0 0 1 6-6 7.5 7.5 0 0 1 7.5 7.5\"></path>","egg":"<path d=\"M12 3.5c3.6 0 6.2 5.2 6.2 9.8S15.4 20.5 12 20.5s-6.2-2.6-6.2-7.2S8.4 3.5 12 3.5z\"></path>","points-note":"<circle cx=\"8\" cy=\"17.5\" r=\"2.8\" fill=\"currentColor\"></circle><path d=\"M10.8 17.5V3.5c1.2 2.6 6.2 3.4 6.2 8\"></path>"};
  function icon(n, s, c) { return '<svg aria-hidden="true" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:none;color:' + (c || 'currentColor') + '">' + ICON[n] + '</svg>'; }
  var FOOD = { insect: ['#5f7a22', 'Insect'], grain: ['#8c6a14', 'Grain'], berry: ['#8e2f4a', 'Berry'], fish: ['#2f6487', 'Fish'], prey: ['#6b5747', 'Prey'], any: ['#27251f', 'Any food'] };
  var HAB = { canopy: ['#2f5d46', 'Jungle canopy'], meadow: ['#8a5a12', 'Clearing'], shore: ['#2a6370', 'River'] };
  var NEST = { platform: 'Platform', cup: 'Cup', cavity: 'Cavity', ground: 'Ground', freeform: 'Any nest' };
  var TAG = { SONG: '#34467a', ECHO: '#7a3f72' };

  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; var m = function (v) { return Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); }; return '#' + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1); }
  function eye(x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fbf7ee"/><circle cx="' + (x + r * .25) + '" cy="' + y + '" r="' + r * .55 + '" fill="#141210"/>'; }
  var BR = '<path d="M6 67 C40 63 80 69 116 64" stroke="#5a4030" stroke-width="4" fill="none" stroke-linecap="round"/>';
  var LEGS = function (a, b, y0, y1, c) { return '<path d="M' + a + ' ' + y0 + 'L' + (a - 2) + ' ' + y1 + 'M' + b + ' ' + y0 + 'L' + b + ' ' + y1 + '" stroke="' + (c || '#4a3a2a') + '" stroke-width="2.2" stroke-linecap="round"/>'; };

  // Placeholder drawing: a simple side view in the bird's own colours, by body type.
  function drawBird(b) {
    var c1 = b.col[0], c2 = b.col[1], c3 = b.col[2], d = shade(c1, -.25), s = '';
    switch (b.body) {
      case 'parrot':
        s = BR + '<path d="M40 50 L10 78 L17 79 L46 56Z" fill="' + c3 + '"/><path d="M42 50 L16 78 L20 78 L46 54Z" fill="' + c2 + '"/>' + LEGS(54, 60, 58, 66) +
          '<ellipse cx="56" cy="44" rx="17" ry="13" transform="rotate(-35 56 44)" fill="' + c1 + '"/><ellipse cx="52" cy="46" rx="13" ry="7" transform="rotate(-40 52 46)" fill="' + c2 + '"/><ellipse cx="50" cy="48" rx="9" ry="4.5" transform="rotate(-40 50 48)" fill="' + c3 + '"/>' +
          '<circle cx="70" cy="27" r="11" fill="' + c1 + '"/><ellipse cx="74" cy="27" rx="5" ry="4" fill="#f4efe2" opacity=".85"/>' + eye(74, 26, 2.2) + '<path d="M79 22 C90 22 92 32 86 37 C84 33 81 31 79 31Z" fill="#d8d0c0"/><path d="M79 31 C81 33 82 35 82 37 C80 36 79 34 79 33Z" fill="#3a2e24"/>';
        break;
      case 'toucan':
        s = BR + '<path d="M38 48 L22 66 L28 68 L44 54Z" fill="' + d + '"/>' + LEGS(52, 58, 56, 66) + '<ellipse cx="52" cy="44" rx="18" ry="13" transform="rotate(-25 52 44)" fill="' + c1 + '"/>' +
          '<circle cx="66" cy="29" r="10" fill="' + c1 + '"/><ellipse cx="66" cy="38" rx="8" ry="9" fill="' + c2 + '"/>' + eye(68, 26, 2.2) +
          '<path d="M74 22 C96 18 114 26 112 34 C100 37 86 37 74 33Z" fill="' + c3 + '"/><path d="M74 28 C90 26 104 28 112 33" stroke="' + shade(c3, -.3) + '" stroke-width="1" fill="none"/>';
        break;
      case 'raptor':
        s = BR + '<path d="M52 60 L44 78 L54 78 L58 62Z" fill="' + d + '"/>' + LEGS(56, 64, 60, 66, '#e8c23a') +
          '<ellipse cx="60" cy="42" rx="16" ry="23" fill="' + c1 + '"/><ellipse cx="63" cy="47" rx="10" ry="15" fill="' + c2 + '"/><path d="M46 30 C40 44 42 58 52 64 C50 52 50 40 54 30Z" fill="' + c3 + '"/>' +
          '<circle cx="63" cy="20" r="11" fill="' + c1 + '"/>' + eye(67, 18, 2.4) + '<path d="M72 16 C80 16 82 24 78 28 C76 25 74 24 72 24Z" fill="#3a3a3a"/><path d="M72 16 L75 16 L75 21 L72 21Z" fill="#e8c23a"/>';
        break;
      case 'owl':
        s = BR + LEGS(56, 64, 62, 66) + '<ellipse cx="60" cy="44" rx="18" ry="22" fill="' + c1 + '"/><ellipse cx="60" cy="50" rx="11" ry="13" fill="' + c2 + '" opacity=".8"/>' +
          '<circle cx="60" cy="26" r="13" fill="' + c1 + '"/><circle cx="60" cy="27" r="10" fill="' + c2 + '"/><circle cx="55" cy="26" r="3.6" fill="#f2d23a"/><circle cx="65" cy="26" r="3.6" fill="#f2d23a"/><circle cx="55" cy="26" r="1.8" fill="#141210"/><circle cx="65" cy="26" r="1.8" fill="#141210"/><path d="M58 30 L60 34 L62 30Z" fill="' + c3 + '"/>';
        break;
      case 'wader':
        s = '<path d="M4 76 H116" stroke="#ffffff" stroke-opacity=".25" stroke-width="2"/>' + LEGS(44, 52, 46, 76, '#6a5a3a') +
          '<ellipse cx="46" cy="38" rx="20" ry="11" transform="rotate(-10 46 38)" fill="' + c1 + '"/><ellipse cx="42" cy="38" rx="15" ry="7" transform="rotate(-10 42 38)" fill="' + c3 + '" opacity=".75"/>' +
          '<path d="M62 34 C72 28 64 18 72 12" stroke="' + c1 + '" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="74" cy="11" r="6" fill="' + c1 + '"/><path d="M69 8 C72 4 78 4 80 8" stroke="' + c2 + '" stroke-width="3" fill="none"/>' + eye(76, 10, 1.6) + '<path d="M79 11 L102 15" stroke="' + shade(c2, -.1) + '" stroke-width="2.6" stroke-linecap="round"/>';
        break;
      case 'swim':
        s = '<rect x="0" y="56" width="120" height="24" fill="#ffffff" opacity=".14"/><path d="M14 64 h18 M60 70 h22 M90 62 h16" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M20 56 C26 42 70 40 86 52 C80 62 32 64 20 56Z" fill="' + c1 + '"/><path d="M30 52 C42 44 62 44 72 50 C62 54 42 56 30 52Z" fill="' + c2 + '" opacity=".55"/>' +
          '<path d="M80 50 C82 42 82 36 86 32" stroke="' + c1 + '" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="88" cy="30" r="7" fill="' + c1 + '"/>' + eye(90, 28, 1.7) + '<path d="M94 29 L106 32 L94 34Z" fill="' + c3 + '"/>';
        break;
      case 'kingfisher':
        s = BR + '<path d="M40 52 L28 64 L34 66 L46 56Z" fill="' + d + '"/>' + LEGS(52, 57, 56, 66, '#3a2e24') +
          '<ellipse cx="52" cy="46" rx="16" ry="12" transform="rotate(-30 52 46)" fill="' + c1 + '"/><ellipse cx="56" cy="50" rx="10" ry="7" transform="rotate(-30 56 50)" fill="' + c3 + '"/>' +
          '<circle cx="68" cy="28" r="12" fill="' + c1 + '"/><path d="M58 36 C64 40 72 40 78 36" stroke="' + c2 + '" stroke-width="4" fill="none"/>' + eye(71, 26, 2.2) + '<path d="M78 25 L106 30 L78 33Z" fill="#2a2a2a"/>';
        break;
      case 'ground':
        s = '<path d="M4 72 C40 68 80 74 116 70" stroke="#5a4030" stroke-opacity=".6" stroke-width="3" fill="none"/>' + LEGS(54, 62, 60, 71, '#c86a5a') +
          '<path d="M30 50 L18 54 L30 56Z" fill="' + d + '"/><ellipse cx="54" cy="50" rx="25" ry="15" fill="' + c1 + '"/><ellipse cx="58" cy="56" rx="15" ry="7" fill="' + c2 + '"/><ellipse cx="48" cy="46" rx="14" ry="7" fill="' + c3 + '" opacity=".5"/>' +
          '<circle cx="78" cy="36" r="8.5" fill="' + c1 + '"/>' + eye(80, 34, 1.9) + '<path d="M86 35 L93 37 L86 39Z" fill="#3a2e24"/>';
        break;
      case 'vulture':
        s = BR + LEGS(52, 60, 58, 66) + '<path d="M30 46 L16 62 L24 62 L36 52Z" fill="' + d + '"/><ellipse cx="52" cy="46" rx="22" ry="16" transform="rotate(-12 52 46)" fill="' + c1 + '"/><ellipse cx="48" cy="44" rx="16" ry="9" transform="rotate(-12 48 44)" fill="' + c3 + '" opacity=".6"/>' +
          '<ellipse cx="68" cy="38" rx="7" ry="5" fill="#d8d0c0"/><circle cx="76" cy="32" r="7" fill="' + c2 + '"/>' + eye(78, 30, 1.6) + '<path d="M82 29 C88 29 89 36 85 38 C84 35 83 34 82 34Z" fill="#3a3a3a"/>';
        break;
      default: // perching bird
        s = BR + '<path d="M36 48 L14 62 L19 66 L42 54Z" fill="' + d + '"/>' + LEGS(52, 58, 54, 66) +
          '<ellipse cx="52" cy="44" rx="20" ry="13" transform="rotate(-20 52 44)" fill="' + c1 + '"/><ellipse cx="56" cy="49" rx="13" ry="7" transform="rotate(-20 56 49)" fill="' + c2 + '"/><ellipse cx="46" cy="41" rx="14" ry="7" transform="rotate(-15 46 41)" fill="' + c3 + '" opacity=".85"/>' +
          '<circle cx="70" cy="30" r="10" fill="' + c1 + '"/>' + eye(73, 28, 2.1) + '<path d="M79 28 L89 31 L79 34Z" fill="#3a2e24"/>';
    }
    return '<svg role="img" aria-label="Placeholder drawing of a ' + b.name + '" viewBox="0 0 120 80" width="100%" height="100%" style="display:block">' + s + '</svg>';
  }

  function foodChip(f) { return '<span class="fc" title="' + FOOD[f][1] + '" style="background:' + FOOD[f][0] + '">' + icon('food-' + f, '70%', '#fbf7ee') + '</span>'; }
  function cardHTML(b) {
    var h = HAB[b.hab[0]][0], cost = b.food.map(foodChip).join(b.foodOr ? '<span class="or">/</span>' : '');
    var habs = b.hab.map(function (k) { return '<span class="hp" style="background:' + HAB[k][0] + '">' + HAB[k][1] + '</span>'; }).join('');
    var eggs = ''; for (var i = 0; i < b.eggs; i++) eggs += icon('egg', '1em', '#fbf7ee');
    var tag = b.kind ? (b.kind === 'CALL' ? '<span class="tg call">CALL</span>' : '<span class="tg" style="background:' + TAG[b.kind] + '">' + b.kind + '</span>') : '';
    var pw = b.kind ? tag + ' ' + b.power : '<span class="nopw">No power. Worth its points.</span>';
    return '<article class="card" style="--h:' + h + '" data-id="' + b.id + '">' +
      '<header><div><h3>' + b.name + '</h3><p class="sci">' + b.sci + '</p></div><div class="cost">' + cost + '</div></header>' +
      '<div class="habs">' + habs + (b.pred ? '<span class="hp pred">Predator</span>' : '') + '</div>' +
      '<div class="pic">' + drawBird(b) + '<span class="ph">Photo coming</span></div>' +
      '<div class="stats"><span class="pts" title="Points">' + icon('points-note', '1.1em', '#fbf7ee') + b.pts + '</span>' +
      '<span class="nest" title="' + NEST[b.nest] + ' nest">' + icon('nest-' + b.nest, '1.1em', '#fbf7ee') + NEST[b.nest] + '</span>' +
      '<span class="eggs" title="Holds ' + b.eggs + ' eggs">' + eggs + '</span><span class="ws" title="Wingspan">' + b.span + ' cm</span></div>' +
      '<div class="power">' + pw + '</div>' +
      '<footer><p class="fact">' + b.fact + '</p><button type="button" class="song" data-song="' + b.id + '">&#9835; Play song</button></footer></article>';
  }
  window.SongroostArt = { icon: icon, drawBird: drawBird, cardHTML: cardHTML, HAB: HAB, FOOD: FOOD };
})();
