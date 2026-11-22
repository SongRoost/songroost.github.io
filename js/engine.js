// Songroost — rules engine. Plays the original game's turn structure with our additions
// (5th round, Strike, Pair up). Works in the browser and in Node for testing.
(function (root) {
  'use strict';
  var FOODS = ['insect', 'grain', 'berry', 'fish', 'prey'];
  var DIE = ['insect', 'grain', 'berry', 'fish', 'prey', 'insect/grain'];
  var HABS = ['canopy', 'meadow', 'shore'];
  var ROWNAME = { canopy: 'Jungle canopy', meadow: 'Clearing', shore: 'River' };
  var ROWACT = { canopy: 'forage', meadow: 'nest', shore: 'scout' };
  var GAIN = [1, 1, 2, 2, 3, 3], LAY = [2, 2, 3, 3, 4, 4], EGG_COST = [0, 1, 1, 2, 2];
  var TOD5 = ['Dawn', 'Morning', 'Midday', 'Dusk', 'Nightfall'], TOD4 = ['Dawn', 'Midday', 'Dusk', 'Nightfall'];
  var ACTIONS5 = [8, 7, 6, 5, 4], ACTIONS4 = [8, 7, 6, 5];
  var FIRST = [4, 5, 6, 7, 8], SECOND = [1, 2, 3, 4, 5], THIRD = [0, 1, 2, 3, 4];
  var FOODNAME = { insect: 'insect', grain: 'grain', berry: 'berry', fish: 'fish', prey: 'prey', any: 'food' };

  // What each bird's power does (the card text is in birds.js).
  var FX = {
    'scarlet-macaw': { t: 'gainSupply', f: 'berry' }, 'blue-and-yellow-macaw': { t: 'draw', n: 2 },
    'channel-billed-toucan': { t: 'gainFeeder', f: ['berry'] }, 'white-throated-toucan': { t: 'lookKeep', n: 3 },
    'lettered-aracari': { t: 'tuck' }, 'mealy-amazon': { t: 'echo', on: 'forage', fx: { t: 'gainSupply', f: 'grain' } },
    'orange-winged-amazon': { t: 'allGainSupply', f: 'berry' }, 'white-bellied-parrot': { t: 'layEachNest', nest: 'cavity' },
    'harpy-eagle': { t: 'predator', mode: 'deck', limit: 75 }, 'king-vulture': { t: 'echo', on: 'predator', fx: { t: 'gainSupply', f: 'prey' } },
    'spangled-cotinga': { t: 'drawTray', n: 1 }, 'amazonian-umbrellabird': { t: 'echo', on: 'play', hab: 'shore', fx: { t: 'draw', n: 1 } },
    'screaming-piha': { t: 'gainFeeder', f: null }, 'guianan-cock-of-the-rock': { t: 'layThis', n: 2 },
    'paradise-tanager': { t: 'tuck' }, 'green-honeycreeper': { t: 'gainSupply', f: 'berry' },
    'purple-honeycreeper': { t: 'echo', on: 'play', hab: 'canopy', fx: { t: 'gainSupply', f: 'berry' } },
    'black-tailed-trogon': { t: 'cacheSupply', f: 'insect' }, 'pavonine-quetzal': null,
    'crimson-crested-woodpecker': { t: 'cacheFeeder', f: ['insect'] }, 'crested-oropendola': { t: 'drawPerRow', hab: 'canopy', max: 3 },
    'great-potoo': { t: 'cacheSupply', f: 'insect' }, 'greater-ani': { t: 'tuck' }, 'smooth-billed-ani': { t: 'layAny', n: 1 },
    'yellow-headed-caracara': { t: 'predator', mode: 'roll', f: 'prey', limit: 60 }, 'great-kiskadee': { t: 'gainFeeder', f: ['insect', 'fish'] },
    'tropical-kingbird': { t: 'gainFeeder', f: ['insect'] }, 'ruddy-ground-dove': { t: 'layAny', n: 1 },
    'blue-black-grassquit': { t: 'gainFeeder', f: ['grain'] }, 'chestnut-bellied-seedeater': { t: 'echo', on: 'forage', fx: { t: 'gainSupply', f: 'grain' } },
    'silver-beaked-tanager': { t: 'gainFeeder', f: ['berry'] }, 'blue-gray-tanager': { t: 'drawTray', n: 1 },
    'roadside-hawk': { t: 'predator', mode: 'deck', limit: 50 }, 'variegated-tinamou': { t: 'layEachNest', nest: 'ground' },
    'common-pauraque': { t: 'echo', on: 'nest', fx: { t: 'layThis', n: 1 } }, 'southern-lapwing': { t: 'layThis', n: 1 },
    'black-vulture': { t: 'echo', on: 'predator', fx: { t: 'gainFeeder', f: null } },
    'laughing-falcon': { t: 'predator', mode: 'roll', f: 'prey', limit: 65 }, 'violaceous-jay': { t: 'cacheFeeder', f: null },
    'black-billed-thrush': { t: 'echo', on: 'play', hab: 'meadow', fx: { t: 'gainFeeder', f: null } },
    'amazonian-motmot': { t: 'gainFeeder', f: ['insect'] }, 'black-fronted-nunbird': { t: 'gainSupplyPerRow', f: 'insect', max: 3 },
    'hoatzin': { t: 'echo', on: 'nest', fx: { t: 'layThis', n: 1 } }, 'amazon-kingfisher': { t: 'rollCache', f: 'fish' },
    'ringed-kingfisher': { t: 'gainSupply', f: 'fish' }, 'sunbittern': { t: 'drawGive' }, 'wattled-jacana': { t: 'layEachRow', hab: 'shore' },
    'capped-heron': { t: 'gainFeeder', f: ['fish'] }, 'cocoi-heron': null,
    'rufescent-tiger-heron': { t: 'echo', on: 'scout', fx: { t: 'draw', n: 1 } }, 'boat-billed-heron': { t: 'cacheFeeder', f: ['fish'] },
    'jabiru': null, 'roseate-spoonbill': { t: 'tuck' }, 'horned-screamer': { t: 'allLay' }, 'muscovy-duck': { t: 'layAnyNest', nest: 'cavity' },
    'anhinga': { t: 'rollCache', f: 'fish' }, 'black-skimmer': { t: 'echo', on: 'fishFeeder', fx: { t: 'gainSupply', f: 'fish' } },
    'black-collared-hawk': { t: 'predator', mode: 'roll', f: 'fish', limit: 70 }, 'sungrebe': { t: 'drawTray', n: 1 },
    'red-and-green-macaw': null
  };

  var GOALS = [
    { id: 'birds-canopy', text: 'Birds in the Jungle canopy', f: function (p) { return p.board.canopy.length; } },
    { id: 'birds-meadow', text: 'Birds in the Clearing', f: function (p) { return p.board.meadow.length; } },
    { id: 'birds-shore', text: 'Birds in the River', f: function (p) { return p.board.shore.length; } },
    { id: 'eggs-canopy', text: 'Eggs in the Jungle canopy', f: function (p) { return eggsIn(p, 'canopy'); } },
    { id: 'eggs-meadow', text: 'Eggs in the Clearing', f: function (p) { return eggsIn(p, 'meadow'); } },
    { id: 'eggs-shore', text: 'Eggs in the River', f: function (p) { return eggsIn(p, 'shore'); } },
    { id: 'nest-cavity', text: 'Birds with a cavity nest', f: function (p) { return nestCount(p, 'cavity'); } },
    { id: 'nest-cup', text: 'Birds with a cup nest', f: function (p) { return nestCount(p, 'cup'); } },
    { id: 'nest-platform', text: 'Birds with a platform nest', f: function (p) { return nestCount(p, 'platform'); } },
    { id: 'nest-ground', text: 'Birds with a ground nest', f: function (p) { return nestCount(p, 'ground'); } },
    { id: 'total-birds', text: 'Birds on your board', f: function (p) { return allBirds(p).length; } },
    { id: 'eggs-cavity', text: 'Eggs in cavity nests', f: function (p) { return allBirds(p).filter(function (x) { return x.b.nest === 'cavity' || x.b.nest === 'freeform'; }).reduce(function (s, x) { return s + x.eggs; }, 0); } }
  ];

  // ---------- helpers ----------
  function rngFrom(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(g, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(g.rng() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function allBirds(p) { return p.board.canopy.concat(p.board.meadow, p.board.shore); }
  function eggsIn(p, h) { return p.board[h].reduce(function (s, x) { return s + x.eggs; }, 0); }
  function nestCount(p, n) { return allBirds(p).filter(function (x) { return x.b.nest === n || x.b.nest === 'freeform'; }).length; }
  function totalEggs(p) { return allBirds(p).reduce(function (s, x) { return s + x.eggs; }, 0); }
  function foodTotal(p) { return FOODS.reduce(function (s, f) { return s + p.food[f]; }, 0); }
  function others(g, p) { return g.players.filter(function (q) { return q !== p; }); }
  function log(g, text, who) { g.log.push({ text: text, who: who ? who.name : null, round: g.round }); if (g.log.length > 120) g.log.shift(); g.emit('log'); }
  function birdName(x) { return x.b.name; }

  function newGame(opts) {
    var g = { rng: rngFrom(opts.seed || (Date.now() & 0xffffffff)), birds: opts.birds, rounds: opts.rounds === 4 ? 4 : 5,
      deck: [], discard: [], tray: [null, null, null], feeder: [], players: [], round: 0, log: [], over: false,
      listeners: [], emit: function (e) { this.listeners.forEach(function (fn) { fn(e); }); }, goals: [], goalResults: [], startPlayer: 0, current: null, echoQueue: [] };
    g.byId = {}; opts.birds.forEach(function (b) { g.byId[b.id] = b; });
    var uid = 0;
    opts.birds.forEach(function (b) { ['M', 'F', null].forEach(function (s) { g.deck.push({ uid: ++uid, id: b.id, sex: s || (g.rng() < .5 ? 'M' : 'F') }); }); });
    shuffle(g, g.deck);
    var goals = shuffle(g, GOALS.slice());
    g.goals = goals.slice(0, g.rounds);
    opts.players.forEach(function (pl, i) {
      g.players.push({ i: i, name: pl.name, human: !!pl.human, level: pl.level || 'medium', ctrl: pl.ctrl,
        board: { canopy: [], meadow: [], shore: [] }, hand: [], food: { insect: 1, grain: 1, berry: 1, fish: 1, prey: 1 },
        actions: 0, ribbons: 0, strikeRound: 0, pairRound: 0, goalPts: 0 });
    });
    rollFeeder(g, true); refillTray(g);
    return g;
  }
  function card(g, c) { return g.byId[c.id]; }
  function drawDeck(g) { if (!g.deck.length) { g.deck = shuffle(g, g.discard); g.discard = []; } return g.deck.pop() || null; }
  function refillTray(g) { for (var i = 0; i < 3; i++) if (!g.tray[i]) g.tray[i] = drawDeck(g); }
  function rollDie(g) { return DIE[Math.floor(g.rng() * 6)]; }
  function rollFeeder(g) { g.feeder = []; for (var i = 0; i < 5; i++) g.feeder.push(rollDie(g)); log(g, 'The Feeding Stump was refilled.'); }
  function feederAllSame(g) { return g.feeder.length > 0 && g.feeder.every(function (d) { return d === g.feeder[0]; }); }

  // ---------- paying ----------
  // Two food of any kind may stand in for one food the card asks for.
  function payPlan(food, b) {
    var f = Object.assign({}, food), pay = { insect: 0, grain: 0, berry: 0, fish: 0, prey: 0 };
    function takeMost(n) { for (var k = 0; k < n; k++) { var best = null; FOODS.forEach(function (x) { if (f[x] > 0 && (!best || f[x] > f[best])) best = x; }); if (!best) return false; f[best]--; pay[best]++; } return true; }
    if (b.foodOr) {
      var opt = b.food.filter(function (x) { return x !== 'any' && f[x] > 0; })[0];
      if (opt) { f[opt]--; pay[opt]++; return pay; }
      if (b.food.indexOf('any') >= 0 && takeMost(1)) return pay;
      return takeMost(2) ? pay : null;
    }
    var deficit = 0, anyN = 0;
    b.food.forEach(function (x) { if (x === 'any') anyN++; else if (f[x] > 0) { f[x]--; pay[x]++; } else deficit++; });
    if (!takeMost(anyN)) return null;
    if (!takeMost(deficit * 2)) return null;
    return pay;
  }
  function eggCost(p, hab) { return EGG_COST[p.board[hab].length] || 0; }
  function hasSpecies(p, id) { return allBirds(p).some(function (x) { return x.b.id === id; }); }
  // Why a card can or can't go in a row (used for the blue / clay glow).
  function canPlace(g, p, c, hab) {
    var b = card(g, c);
    if (b.hab.indexOf(hab) < 0) return { ok: false, lives: false, why: b.name + 's don’t live in the ' + ROWNAME[hab] };
    if (p.board[hab].length >= 5) return { ok: false, lives: true, why: 'This row is full' };
    if (hasSpecies(p, b.id)) return { ok: false, lives: true, why: 'You already have a ' + b.name };
    var miss = [], plan = payPlan(p.food, b), ec = eggCost(p, hab);
    if (!plan) miss.push('Not enough food');
    if (totalEggs(p) < ec) miss.push('Need ' + ec + ' egg' + (ec > 1 ? 's' : ''));
    return { ok: !miss.length, lives: true, why: miss.join(' · '), plan: plan, eggs: ec };
  }
  function playableHabs(g, p, c) { return HABS.filter(function (h) { return canPlace(g, p, c, h).ok; }); }

  // ---------- choices ----------
  function ask(g, p, kind, prompt, options, extra) {
    if (!options.length) return Promise.resolve(null);
    return Promise.resolve(p.ctrl.choose(g, p, Object.assign({ kind: kind, prompt: prompt, options: options }, extra || {})));
  }

  // ---------- gaining things ----------
  function gainFood(g, p, f, n) { p.food[f] += n || 1; }
  async function takeFromFeeder(g, p, allowed, why) {
    if (!g.feeder.length || feederAllSame(g)) rollFeeder(g);
    var opts = [];
    g.feeder.forEach(function (d, i) {
      var faces = d === 'insect/grain' ? ['insect', 'grain'] : [d];
      faces.forEach(function (f) { if (!allowed || allowed.indexOf(f) >= 0) opts.push({ label: FOODNAME[f], value: { i: i, f: f }, die: i, food: f }); });
    });
    if (!opts.length) return null;
    var pick = await ask(g, p, 'die', why || 'Take a die from the Feeding Stump', opts);
    if (!pick) return null;
    g.feeder.splice(pick.i, 1);
    return pick.f;
  }
  function hand(g, p, c) { p.hand.push(c); }
  async function chooseEggBird(g, p, list, prompt) {
    var opts = list.filter(function (x) { return x.eggs < x.b.eggs; }).map(function (x) { return { label: x.b.name + ' (' + x.eggs + '/' + x.b.eggs + ')', value: x.card.uid, bird: x.card.uid }; });
    if (!opts.length) return null;
    var v = await ask(g, p, 'egg', prompt || 'Lay an egg on which bird?', opts);
    return list.filter(function (x) { return x.card.uid === v; })[0] || null;
  }
  async function layEggs(g, p, n, list, prompt) {
    var laid = 0;
    for (var k = 0; k < n; k++) {
      var x = await chooseEggBird(g, p, list || allBirds(p), prompt ? prompt + ' (' + (k + 1) + ' of ' + n + ')' : 'Lay an egg (' + (k + 1) + ' of ' + n + ')');
      if (!x) break; x.eggs++; laid++; g.emit('change');
    }
    return laid;
  }
  function layOn(x, n) { var add = Math.min(n, x.b.eggs - x.eggs); x.eggs += add; return n - add; }
  async function drawChoice(g, p, n, trayOnly) {
    for (var k = 0; k < n; k++) {
      var opts = [];
      g.tray.forEach(function (c, i) { if (c) opts.push({ label: card(g, c).name, value: 'tray' + i, tray: i }); });
      if (!trayOnly) opts.push({ label: 'Top of the deck', value: 'deck', deck: true });
      var v = await ask(g, p, 'draw', 'Draw a card (' + (k + 1) + ' of ' + n + ')', opts);
      if (!v) break;
      var c = v === 'deck' ? drawDeck(g) : g.tray[+v.slice(4)];
      if (v !== 'deck') g.tray[+v.slice(4)] = null;
      if (c) hand(g, p, c);
      g.emit('change');
    }
  }

  // ---------- powers ----------
  function rowOf(p, x) { for (var i = 0; i < HABS.length; i++) if (p.board[HABS[i]].indexOf(x) >= 0) return HABS[i]; return null; }
  async function runFx(g, p, x, fx, ctx) {
    if (!fx) return;
    var name = x.b.name, n, i;
    switch (fx.t) {
      case 'gainSupply': gainFood(g, p, fx.f, 1); log(g, name + ': gained 1 ' + fx.f + '.', p); break;
      case 'allGainSupply': g.players.forEach(function (q) { gainFood(g, q, fx.f, 1); }); log(g, name + ': every keeper gained 1 ' + fx.f + '.', p); break;
      case 'gainSupplyPerRow': n = Math.min(fx.max, p.board[rowOf(p, x)].length); gainFood(g, p, fx.f, n); log(g, name + ': gained ' + n + ' ' + fx.f + '.', p); break;
      case 'gainFeeder': { var f = await takeFromFeeder(g, p, fx.f, name + ': take a die'); if (f) { gainFood(g, p, f, 1); log(g, name + ': took 1 ' + f + ' from the Feeding Stump.', p); if (f === 'fish') echo(g, p, 'fishFeeder'); } break; }
      case 'cacheSupply': x.cache++; log(g, name + ': cached 1 ' + fx.f + '.', p); break;
      case 'cacheFeeder': { var cf = await takeFromFeeder(g, p, fx.f, name + ': take a die to cache'); if (cf) { x.cache++; log(g, name + ': cached 1 ' + cf + '.', p); if (cf === 'fish') echo(g, p, 'fishFeeder'); } break; }
      case 'draw': for (i = 0; i < fx.n; i++) { var c = drawDeck(g); if (c) hand(g, p, c); } log(g, name + ': drew ' + fx.n + ' card' + (fx.n > 1 ? 's' : '') + '.', p); break;
      case 'drawTray': await drawChoice(g, p, fx.n, true); log(g, name + ': took a card from the Sightings.', p); break;
      case 'drawPerRow': n = Math.min(fx.max, p.board[fx.hab].length); for (i = 0; i < n; i++) { var c2 = drawDeck(g); if (c2) hand(g, p, c2); } log(g, name + ': drew ' + n + '.', p); break;
      case 'lookKeep': {
        var look = []; for (i = 0; i < fx.n; i++) { var c3 = drawDeck(g); if (c3) look.push(c3); }
        var v = await ask(g, p, 'keep', name + ': keep one card', look.map(function (c) { return { label: card(g, c).name, value: c.uid, card: c.uid, id: c.id }; }));
        look.forEach(function (c) { if (c.uid === v) hand(g, p, c); else g.discard.push(c); });
        log(g, name + ': looked at ' + look.length + ' cards and kept one.', p); break;
      }
      case 'drawGive': {
        var two = [drawDeck(g), drawDeck(g)].filter(Boolean);
        var keep = await ask(g, p, 'keep', name + ': keep one card (the other goes to another keeper)', two.map(function (c) { return { label: card(g, c).name, value: c.uid, card: c.uid, id: c.id }; }));
        var rest = two.filter(function (c) { return c.uid !== keep; }), kept = two.filter(function (c) { return c.uid === keep; })[0];
        if (kept) hand(g, p, kept);
        if (rest[0]) { var opp = others(g, p); var to = opp.length > 1 ? await ask(g, p, 'player', 'Give the other card to whom?', opp.map(function (q) { return { label: q.name, value: q.i }; })) : opp[0].i; hand(g, g.players[to], rest[0]); }
        log(g, name + ': drew 2, kept 1 and gave 1 away.', p); break;
      }
      case 'tuck': {
        if (!p.hand.length) break;
        var opts = p.hand.map(function (c) { return { label: card(g, c).name, value: c.uid, card: c.uid, id: c.id }; });
        var t = await ask(g, p, 'tuck', name + ': tuck a card from your hand? (then draw 1)', opts, { skip: 'Don’t tuck' });
        if (t) { p.hand = p.hand.filter(function (c) { if (c.uid === t) { g.discard.push(c); return false; } return true; }); x.tucked++; var c4 = drawDeck(g); if (c4) hand(g, p, c4); log(g, name + ': tucked a card and drew 1.', p); }
        break;
      }
      case 'layThis': n = fx.n - layOn(x, fx.n); log(g, name + ': laid ' + n + ' egg' + (n === 1 ? '' : 's') + ' on itself.', p); break;
      case 'layAny': n = await layEggs(g, p, fx.n, null, name + ': lay an egg'); log(g, name + ': laid ' + n + ' egg.', p); break;
      case 'layAnyNest': n = await layEggs(g, p, 1, allBirds(p).filter(function (y) { return y.b.nest === fx.nest || y.b.nest === 'freeform'; }), name + ': lay an egg on a ' + fx.nest + ' nest'); log(g, name + ': laid ' + n + ' egg.', p); break;
      case 'layEachNest': n = 0; allBirds(p).forEach(function (y) { if ((y.b.nest === fx.nest || y.b.nest === 'freeform') && y.eggs < y.b.eggs) { y.eggs++; n++; } }); log(g, name + ': laid ' + n + ' egg' + (n === 1 ? '' : 's') + ' on ' + fx.nest + ' nests.', p); break;
      case 'layEachRow': n = 0; p.board[fx.hab].forEach(function (y) { if (y.eggs < y.b.eggs) { y.eggs++; n++; } }); log(g, name + ': laid ' + n + ' egg' + (n === 1 ? '' : 's') + ' in the ' + ROWNAME[fx.hab] + '.', p); break;
      case 'allLay':
        for (i = 0; i < g.players.length; i++) { var q = g.players[i]; await layEggs(g, q, q === p ? 2 : 1, null, name + (q === p ? ': lay your eggs' : ': you may lay 1 egg')); }
        log(g, name + ': every keeper laid an egg; ' + p.name + ' laid 2.', p); break;
      case 'rollCache': { var hit = rollOutside(g, fx.f); if (hit) { x.cache++; log(g, name + ': rolled a ' + fx.f + ' and cached it.', p); } else log(g, name + ': rolled, no ' + fx.f + ' this time.', p); return hit; }
      case 'predator': return predator(g, p, x, fx);
    }
    g.emit('change');
  }
  function rollOutside(g, f) { var n = 5 - g.feeder.length, hit = false; g.lastRoll = []; for (var i = 0; i < n; i++) { var d = rollDie(g); g.lastRoll.push(d); if (d === f || (d === 'insect/grain' && (f === 'insect' || f === 'grain'))) hit = true; } return hit; }

  // ---------- Strike ----------
  function strikeChance(target) {
    var pts = target.b.pts, base = pts <= 2 ? 83 : pts <= 4 ? 67 : pts <= 6 ? 50 : 33;
    return Math.max(10, base - 5 * target.eggs - (target.paired ? 30 : 0));
  }
  function strikeTargets(g, p, x, limit) {
    if (g.round < 2 || p.strikeRound === g.round) return [];
    var out = [];
    others(g, p).forEach(function (q) { allBirds(q).forEach(function (y) { if (y.b.span < limit) out.push({ q: q, y: y }); }); });
    return out;
  }
  async function predator(g, p, x, fx) {
    var name = x.b.name, targets = strikeTargets(g, p, x, fx.limit), mode = 'hunt';
    if (targets.length) mode = await ask(g, p, 'predator', name + ': Hunt or Strike?', [{ label: 'Hunt', value: 'hunt' }, { label: 'Strike another keeper', value: 'strike' }]);
    if (mode === 'strike') {
      var opp = others(g, p).filter(function (q) { return targets.some(function (t) { return t.q === q; }); });
      var qi = opp.length > 1 ? await ask(g, p, 'player', 'Strike which keeper?', opp.map(function (q) { return { label: q.name, value: q.i }; })) : opp[0].i;
      var q = g.players[qi];
      var list = targets.filter(function (t) { return t.q === q; });
      var uid = await ask(g, p, 'strike', 'Choose a bird to strike', list.map(function (t) { return { label: t.y.b.name + ' · ' + strikeChance(t.y) + '% chance', value: t.y.card.uid, bird: t.y.card.uid, owner: q.i, chance: strikeChance(t.y) }; }));
      var target = list.filter(function (t) { return t.y.card.uid === uid; })[0].y, chance = strikeChance(target);
      p.strikeRound = g.round;
      var ok = g.rng() * 100 < chance;
      g.lastStrike = { by: p.i, owner: q.i, bird: target.card.uid, ok: ok, chance: chance };
      if (ok) {
        var lost = target.eggs ? (target.eggs--, 'an egg') : target.cache ? (target.cache--, 'a cached food') : target.tucked ? (target.tucked--, 'a tucked card') : 'nothing';
        var c = drawDeck(g); if (c) { g.discard.push(c); x.tucked++; }
        log(g, name + ' struck ' + q.name + '’s ' + target.b.name + ' (' + chance + '% chance). It was startled and lost ' + lost + '.', p);
        echo(g, p, 'predator');
      } else log(g, name + ' tried to strike ' + q.name + '’s ' + target.b.name + ' (' + chance + '% chance), but it flew off safely.', p);
      g.emit('strike'); g.emit('change');
      return ok;
    }
    var hit = false;
    if (fx.mode === 'deck') {
      var top = drawDeck(g);
      if (top) { var tb = card(g, top); hit = tb.span < fx.limit; g.discard.push(top); if (hit) x.tucked++; log(g, name + ' hunted: ' + tb.name + ' (' + tb.span + ' cm) ' + (hit ? 'was caught.' : 'got away.'), p); }
    } else {
      hit = rollOutside(g, fx.f);
      if (hit) x.cache++;
      log(g, name + ' hunted: ' + (hit ? 'caught a ' + fx.f + '.' : 'nothing this time.'), p);
    }
    if (hit) echo(g, p, 'predator');
    g.emit('change');
    return hit;
  }

  // ---------- ECHO powers (between your turns) ----------
  function echo(g, actor, event, data) {
    others(g, actor).forEach(function (q) {
      allBirds(q).forEach(function (y) {
        var fx = FX[y.b.id];
        if (!fx || fx.t !== 'echo' || fx.on !== event || y.echoUsed) return;
        if (fx.hab && (!data || data.hab !== fx.hab)) return;
        y.echoUsed = true;
        g.echoQueue.push({ q: q, y: y, fx: fx.fx });
      });
    });
  }
  async function flushEcho(g) {
    while (g.echoQueue.length) { var e = g.echoQueue.shift(); await runFx(g, e.q, e.y, e.fx); }
  }

  // ---------- Pair up ----------
  function pairOptions(g, p) {
    if (p.pairRound === g.round) return [];
    var out = [];
    allBirds(p).forEach(function (x) {
      if (x.paired) return;
      others(g, p).forEach(function (q) {
        allBirds(q).forEach(function (y) { if (!y.paired && y.b.id === x.b.id && y.card.sex !== x.card.sex) out.push({ x: x, q: q, y: y }); });
      });
    });
    return out;
  }
  async function offerPair(g, p, pick) {
    p.pairRound = g.round;
    var q = pick.q;
    var yes = await ask(g, q, 'pairOffer', p.name + ' offers to pair their ' + pick.x.b.name + ' (' + (pick.x.card.sex === 'M' ? '♂' : '♀') + ') with yours. Both of you lay 2 eggs and earn a Pair ribbon (+2 points).', [{ label: 'Pair up', value: 'yes' }, { label: 'Not now', value: 'no' }]);
    if (yes !== 'yes') { log(g, q.name + ' passed on pairing ' + pick.x.b.name + 's.', q); g.emit('change'); return false; }
    pick.x.paired = pick.y.card.uid; pick.y.paired = pick.x.card.uid;
    p.ribbons++; q.ribbons++;
    [[p, pick.x], [q, pick.y]].forEach(function (pr) { var left = layOn(pr[1], 2); allBirds(pr[0]).forEach(function (z) { if (left > 0) left = layOn(z, left); }); });
    log(g, p.name + ' and ' + q.name + ' paired their ' + pick.x.b.name + 's. Both laid eggs and earned a Pair ribbon.', p);
    g.emit('pair'); g.emit('change');
    return true;
  }

  // ---------- turn ----------
  async function activateRow(g, p, hab) {
    var row = p.board[hab];
    for (var i = row.length - 1; i >= 0; i--) {
      var x = row[i], fx = FX[x.b.id];
      if (fx && x.b.kind === 'SONG') { g.activeBird = x.card.uid; g.emit('change'); await runFx(g, p, x, fx); await flushEcho(g); }
    }
    g.activeBird = null;
  }
  async function doAction(g, p, a) {
    var n, i, hab;
    if (a.type === 'play') {
      var c = p.hand.filter(function (h) { return h.uid === a.uid; })[0], chk = canPlace(g, p, c, a.hab);
      if (!c || !chk.ok) throw new Error('Illegal play');
      FOODS.forEach(function (f) { p.food[f] -= chk.plan[f]; });
      var need = chk.eggs;
      while (need > 0) {
        var src = allBirds(p).filter(function (y) { return y.eggs > 0; });
        var pick = src.length === 1 ? src[0].card.uid : await ask(g, p, 'payEgg', 'Remove an egg to pay (' + need + ' left)', src.map(function (y) { return { label: y.b.name + ' (' + y.eggs + ')', value: y.card.uid, bird: y.card.uid }; }));
        var y = src.filter(function (s) { return s.card.uid === pick; })[0]; y.eggs--; need--;
      }
      p.hand = p.hand.filter(function (h) { return h !== c; });
      var x = { card: c, b: card(g, c), eggs: 0, cache: 0, tucked: 0, paired: 0, echoUsed: false };
      p.board[a.hab].push(x);
      g.justPlaced = c.uid;
      log(g, p.name + ' attracted a ' + x.b.name + ' (' + (c.sex === 'M' ? '♂' : '♀') + ') to the ' + ROWNAME[a.hab] + '.', p);
      g.emit('place'); g.emit('change');
      echo(g, p, 'play', { hab: a.hab });
      if (x.b.kind === 'CALL') await runFx(g, p, x, FX[x.b.id]);
      await flushEcho(g);
      return;
    }
    hab = a.type === 'forage' ? 'canopy' : a.type === 'nest' ? 'meadow' : 'shore';
    var cnt = p.board[hab].length;
    if (a.type === 'forage') {
      n = GAIN[cnt]; var got = [];
      for (i = 0; i < n; i++) { var f = await takeFromFeeder(g, p, null, 'Forage: take a die (' + (i + 1) + ' of ' + n + ')'); if (f) { gainFood(g, p, f, 1); got.push(f); if (f === 'fish') echo(g, p, 'fishFeeder'); } g.emit('change'); }
      log(g, p.name + ' foraged: ' + got.join(', ') + '.', p);
      echo(g, p, 'forage');
    } else if (a.type === 'nest') {
      n = LAY[cnt]; var laid = await layEggs(g, p, n, null, 'Nest: lay an egg');
      log(g, p.name + ' nested and laid ' + laid + ' egg' + (laid === 1 ? '' : 's') + '.', p);
      echo(g, p, 'nest');
    } else {
      n = GAIN[cnt]; await drawChoice(g, p, n, false);
      log(g, p.name + ' scouted and drew ' + n + ' card' + (n > 1 ? 's' : '') + '.', p);
      echo(g, p, 'scout');
    }
    await flushEcho(g);
    await activateRow(g, p, hab);
  }
  function legalActions(g, p) {
    var out = [{ type: 'forage' }, { type: 'scout' }];
    if (allBirds(p).some(function (x) { return x.eggs < x.b.eggs; })) out.push({ type: 'nest' });
    p.hand.forEach(function (c) { playableHabs(g, p, c).forEach(function (h) { out.push({ type: 'play', uid: c.uid, hab: h }); }); });
    return out;
  }
  async function takeTurn(g, p) {
    g.current = p.i; allBirds(p).forEach(function (x) { x.echoUsed = false; }); g.emit('turn');
    for (;;) {
      var a = await Promise.resolve(p.ctrl.chooseAction(g, p));
      if (a.type === 'pair') { var po = pairOptions(g, p).filter(function (o) { return o.x.card.uid === a.uid && o.q.i === a.with; })[0] || pairOptions(g, p)[0]; if (po) await offerPair(g, p, po); continue; }
      await doAction(g, p, a); break;
    }
    p.actions--; refillTray(g); g.justPlaced = null; g.emit('change');
  }

  // ---------- rounds and scoring ----------
  function scoreRoundGoal(g) {
    var r = g.round - 1, goal = g.goals[r];
    var counts = g.players.map(function (p) { return { p: p, n: goal.f(p) }; }).sort(function (a, b) { return b.n - a.n; });
    var table = [FIRST[r], SECOND[r], THIRD[r], 0, 0, 0], res = [], pos = 0;
    while (pos < counts.length) {
      var same = counts.filter(function (c) { return c.n === counts[pos].n; }), pts = 0;
      for (var k = 0; k < same.length; k++) pts += table[pos + k] || 0;
      var each = counts[pos].n > 0 ? Math.floor(pts / same.length) : 0;
      same.forEach(function (c) { c.p.goalPts += each; res.push({ i: c.p.i, n: c.n, pts: each }); });
      pos += same.length;
    }
    g.goalResults[r] = res;
    log(g, 'Round goal — ' + goal.text + ': ' + res.map(function (x) { return g.players[x.i].name + ' ' + x.n + ' (+' + x.pts + ')'; }).join(', ') + '.');
  }
  function score(g, p) {
    var birds = allBirds(p), s = { birds: 0, eggs: 0, cache: 0, tucked: 0, goals: p.goalPts, ribbons: p.ribbons * 2 };
    birds.forEach(function (x) { s.birds += x.b.pts; s.eggs += x.eggs; s.cache += x.cache; s.tucked += x.tucked; });
    s.total = s.birds + s.eggs + s.cache + s.tucked + s.goals + s.ribbons;
    return s;
  }
  async function setupHands(g) {
    for (var i = 0; i < g.players.length; i++) {
      var p = g.players[i], five = [];
      for (var k = 0; k < 5; k++) five.push(drawDeck(g));
      var r = await Promise.resolve(p.ctrl.chooseStart(g, p, five));
      five.forEach(function (c) { if (r.keep.indexOf(c.uid) >= 0) p.hand.push(c); else g.discard.push(c); });
      r.discardFood.forEach(function (f) { p.food[f]--; });
    }
  }
  async function play(g) {
    await setupHands(g);
    var acts = g.rounds === 4 ? ACTIONS4 : ACTIONS5;
    for (g.round = 1; g.round <= g.rounds; g.round++) {
      g.players.forEach(function (p) { p.actions = acts[g.round - 1]; });
      log(g, 'Round ' + g.round + ' begins: ' + todName(g) + '. Goal: ' + g.goals[g.round - 1].text + '.');
      g.emit('round');
      var order = g.players.slice(g.startPlayer).concat(g.players.slice(0, g.startPlayer));
      while (order.some(function (p) { return p.actions > 0; })) {
        for (var i = 0; i < order.length; i++) if (order[i].actions > 0) await takeTurn(g, order[i]);
      }
      scoreRoundGoal(g);
      g.tray.forEach(function (c) { if (c) g.discard.push(c); }); g.tray = [null, null, null]; refillTray(g);
      g.startPlayer = (g.startPlayer + 1) % g.players.length;
      g.emit('roundEnd');
    }
    g.over = true; g.current = null;
    g.final = g.players.map(function (p) { return Object.assign({ i: p.i, name: p.name }, score(g, p)); });
    log(g, 'The day is done. ' + g.final.map(function (s) { return s.name + ' ' + s.total; }).join(' · '));
    g.emit('over'); g.emit('change');
    return g.final;
  }
  function todName(g) { return (g.rounds === 4 ? TOD4 : TOD5)[g.round - 1] || ''; }

  var api = { newGame: newGame, play: play, FX: FX, FOODS: FOODS, HABS: HABS, ROWNAME: ROWNAME, ROWACT: ROWACT, GAIN: GAIN, LAY: LAY, EGG_COST: EGG_COST,
    canPlace: canPlace, playableHabs: playableHabs, payPlan: payPlan, legalActions: legalActions, allBirds: allBirds, totalEggs: totalEggs, foodTotal: foodTotal,
    score: score, strikeChance: strikeChance, pairOptions: pairOptions, card: card, todName: todName, eggCost: eggCost, TOD5: TOD5, TOD4: TOD4 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SongroostEngine = api;
})(this);
