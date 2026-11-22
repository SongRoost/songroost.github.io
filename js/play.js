// Songroost — play screen: you against the Rival Keeper.
(function () {
  'use strict';
  var E = window.SongroostEngine, A = window.SongroostArt, AI = window.SongroostAI, BIRDS = window.SONGROOST_BIRDS;
  var app = document.getElementById('app'), toastEl = document.getElementById('toast');
  var FOODC = { insect: '#5f7a22', grain: '#8c6a14', berry: '#8e2f4a', fish: '#2f6487', prey: '#6b5747' };
  var settings = { name: 'You', level: 'medium', rounds: 5 };
  try { var saved = JSON.parse(localStorage.getItem('songroost.settings') || 'null'); if (saved) settings = Object.assign(settings, saved); } catch (e) {}
  var G = null, ME = null, RIVAL = null, pend = null, sel = null, view = 'me', raf = 0, screen = 'setup', zoom = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function chip(f, sm) { return '<span class="chip' + (sm ? ' sm' : '') + '" style="background:' + FOODC[f] + '" title="' + f + '">' + A.icon('food-' + f, sm ? 15 : 20, '#fbf7ee') + '</span>'; }
  function dieFace(d) { return d === 'insect/grain' ? chip('insect', 1) + chip('grain', 1) : chip(d); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function schedule() { if (!raf) raf = setTimeout(function () { raf = 0; render(); }, 16); }
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 3800); }
  function byUid(p, uid) { var all = E.allBirds(p); for (var i = 0; i < all.length; i++) if (all[i].card.uid === uid) return all[i]; return null; }

  // ---------- sound: soft stand-in chirps until real recordings are in ----------
  var ac = null;
  function chirp(id, long) {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = ac || new AC(); if (ac.state === 'suspended') ac.resume();
      var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      var base = 1400 + (h % 1800), notes = (long ? 5 : 2) + (h % 3), t = ac.currentTime + .03;
      for (var n = 0; n < notes; n++) {
        var o = ac.createOscillator(), g = ac.createGain(), f = base * (1 + ((h >> n) % 5) * .08), d = .09 + ((h >> (n + 3)) % 4) * .03;
        o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (n % 2 ? .78 : 1.22), t + d);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.1, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + d);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + .02); t += d + .05;
      }
    } catch (e) {}
  }

  // ---------- controllers ----------
  var human = {
    chooseStart: function (g, p, five) { return new Promise(function (res) { pend = { kind: 'start', five: five, res: res, keep: {}, food: { insect: true, grain: true, berry: true, fish: true, prey: true } }; screen = 'start'; schedule(); }); },
    chooseAction: function () { return new Promise(function (res) { pend = { kind: 'action', res: res }; sel = null; view = 'me'; schedule(); }); },
    choose: function (g, p, req) { return new Promise(function (res) { pend = { kind: 'choose', req: req, res: res }; view = req.kind === 'strike' ? 'rival' : 'me'; schedule(); }); }
  };
  function slow(ctrl) {
    return { chooseStart: ctrl.chooseStart,
      chooseAction: async function (g, p) { await sleep(900); return ctrl.chooseAction(g, p); },
      choose: async function (g, p, req) { await sleep(req.kind === 'die' || req.kind === 'draw' ? 550 : 400); return ctrl.choose(g, p, req); } };
  }
  function resolve(v) { var p = pend; pend = null; sel = null; schedule(); if (p) p.res(v); }

  // ---------- start a game ----------
  function start() {
    try { localStorage.setItem('songroost.settings', JSON.stringify(settings)); } catch (e) {}
    var rivalName = { easy: 'Rival Keeper (easy)', medium: 'Rival Keeper', hard: 'Rival Keeper (hard)' }[settings.level];
    G = E.newGame({ birds: BIRDS, rounds: settings.rounds, players: [{ name: settings.name || 'You', human: true, ctrl: human }, { name: rivalName, level: settings.level, ctrl: slow(AI.make(settings.level)) }] });
    ME = G.players[0]; RIVAL = G.players[1];
    G.listeners.push(function (e) {
      if (e === 'place' && G.justPlaced) { var c = null; G.players.forEach(function (p) { var x = byUid(p, G.justPlaced); if (x) c = x; }); if (c) chirp(c.b.id, true); }
      if (e === 'strike' && G.lastStrike) { toast(G.log[G.log.length - 1].text); }
      if (e === 'pair') toast(G.log[G.log.length - 1].text);
      if (e === 'roundEnd') toast(G.log[G.log.length - 1].text);
      if (e === 'round') { document.body.className = 'tod-' + todIndex(); toast('Round ' + G.round + ' · ' + E.todName(G) + '. Goal: ' + G.goals[G.round - 1].text + '.'); }
      if (e === 'over') screen = 'end';
      schedule();
    });
    screen = 'start';
    E.play(G).catch(function (err) { console.error(err); toast('Something went wrong: ' + err.message); });
    schedule();
  }
  function todIndex() { if (!G || !G.round) return 0; return G.rounds === 4 ? [0, 2, 3, 4][G.round - 1] : G.round - 1; }

  // ---------- rendering ----------
  function render() {
    if (screen === 'setup') return renderSetup();
    if (screen === 'start') return renderStart();
    if (screen === 'end') { zoom = null; renderZoom(); return renderEnd(); }
    renderGame(); renderZoom();
  }
  function renderZoom() {
    var el = document.getElementById('zoom');
    if (!zoom) { el.hidden = true; el.innerHTML = ''; return; }
    var b = zoom.b, info = '', take = '';
    if (zoom.x) {
      var x = zoom.x, mate = x.paired ? 'Paired ♥ (its mate guards the nest)' : 'Not paired';
      info = '<ul class="zinfo"><li><b>' + (x.card.sex === 'M' ? '♂ Male' : '♀ Female') + '</b> · ' + esc(zoom.owner) + '</li><li>Eggs <b>' + x.eggs + ' of ' + x.b.eggs + '</b>' + (x.eggs >= 4 || x.eggs >= x.b.eggs ? ' · nesting, safe from Lure' : '') + '</li><li>Cached food <b>' + x.cache + '</b> · Tucked cards <b>' + x.tucked + '</b></li><li>' + mate + '</li>' +
        (b.pred ? '' : '') + '<li>Strike chance against it: <b>' + E.strikeChance(x) + '%</b></li></ul>';
    } else if (zoom.card) info = '<p class="zinfo">' + (zoom.card.sex === 'M' ? '♂ Male' : '♀ Female') + (zoom.where ? ' · ' + esc(zoom.where) : '') + '</p>';
    if (zoom.opt != null && pend && pend.kind === 'choose' && pend.req === zoom.req) take = '<button type="button" class="primary" data-act="zoomtake">Take this card</button>';
    el.hidden = false;
    el.innerHTML = '<div class="zback" data-act="zoomclose"></div><div class="zbox" role="dialog" aria-modal="true" aria-label="' + esc(b.name) + '"><div class="zcard">' + A.cardHTML(b) + '</div>' + info + '<div class="zbtns">' + take + '<button type="button" class="ghost" data-act="zoomclose">Close</button></div></div>';
  }
  function seg(name, val, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-set="' + name + '" data-val="' + o[0] + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + o[1] + (o[2] ? '<small>' + o[2] + '</small>' : '') + '</button>'; }).join('') + '</div>'; }
  function renderSetup() {
    app.innerHTML = '<div class="screen"><a class="back" href="./">&larr; Songroost</a><div class="panel" style="margin-top:10px">' +
      '<h1 class="title">Songroost</h1><p class="lede">Attract birds to your Amazon sanctuary from Dawn to Nightfall. You against the Rival Keeper.</p>' +
      '<div class="field"><label class="lbl" for="nm">Your name</label><input class="txt" id="nm" value="' + esc(settings.name) + '" maxlength="18"></div>' +
      '<div class="field"><span class="lbl">Rival Keeper</span>' + seg('level', settings.level, [['easy', 'Easy', 'Relaxed'], ['medium', 'Medium', 'Steady'], ['hard', 'Hard', 'Sharp']]) + '</div>' +
      '<div class="field"><span class="lbl">Length</span>' + seg('rounds', settings.rounds, [[5, '5 rounds', 'Dawn to Nightfall'], [4, 'Classic 4 rounds', 'Like the original']]) + '</div>' +
      '<div class="field"><button type="button" class="primary" data-act="start">Begin the day</button></div></div>' +
      '<p class="lede" style="margin-top:14px;font-size:13px">First playable version: drawings are placeholders, songs are stand-in chirps, and Lure cards come next.</p></div>';
  }
  function renderStart() {
    if (!pend || pend.kind !== 'start') { app.innerHTML = '<div class="screen"><div class="panel">Shuffling the deck…</div></div>'; return; }
    var nb = Object.keys(pend.keep).filter(function (k) { return pend.keep[k]; }).length, nf = E.FOODS.filter(function (f) { return pend.food[f]; }).length;
    var ok = nb + nf === 5;
    app.innerHTML = '<div class="screen"><div class="panel"><h1 class="title" style="font-size:30px">Choose what to keep</h1>' +
      '<p class="lede">Keep 5 things in total: tap birds to keep them, and for every bird you keep, let go of 1 food.</p>' +
      '<div class="keepgrid">' + pend.five.map(function (c) { var b = E.card(G, c); return '<div role="button" tabindex="0" class="keepcard" data-keep="' + c.uid + '" aria-pressed="' + !!pend.keep[c.uid] + '">' + A.cardHTML(b) + '</div>'; }).join('') + '</div>' +
      '<div class="field"><span class="lbl">Food</span><div class="foodrow">' + E.FOODS.map(function (f) { return '<button type="button" class="foodbtn" data-food="' + f + '" aria-pressed="' + !!pend.food[f] + '">' + chip(f) + f + '</button>'; }).join('') + '</div></div>' +
      '<p class="count">' + nb + ' bird' + (nb === 1 ? '' : 's') + ' + ' + nf + ' food = ' + (nb + nf) + (ok ? ' ✓' : ' (needs to be 5)') + '</p>' +
      '<button type="button" class="primary" data-act="keep"' + (ok ? '' : ' disabled') + '>Start round 1</button></div></div>';
  }
  function renderEnd() {
    var f = G.final, rows = [['Birds', 'birds'], ['Eggs', 'eggs'], ['Cached food', 'cache'], ['Tucked cards', 'tucked'], ['Round goals', 'goals'], ['Pair ribbons', 'ribbons']];
    var win = f[0].total === f[1].total ? 'A perfect tie. What a peaceful day.' : (f[0].total > f[1].total ? 'Your sanctuary sang the loudest today.' : 'The Rival Keeper’s sanctuary sang a little louder today.');
    app.innerHTML = '<div class="screen"><div class="panel"><h1 class="title" style="font-size:32px">Nightfall</h1><p class="lede">' + win + '</p>' +
      '<table class="scoretable"><thead><tr><th></th>' + f.map(function (s) { return '<th>' + esc(s.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td>' + f.map(function (s) { return '<td>' + s[r[1]] + '</td>'; }).join('') + '</tr>'; }).join('') +
      '<tr class="total"><td>Total</td>' + f.map(function (s) { return '<td>' + s.total + '</td>'; }).join('') + '</tr></tbody></table>' +
      '<div class="field" style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="primary" data-act="again">Play again</button><a class="ghost" style="display:inline-flex;align-items:center;text-decoration:none" href="birds.html">Field guide</a></div></div></div>';
  }

  // which board targets are clickable for the current choice
  function choiceTargets() {
    var t = { die: {}, bird: {}, tray: {}, deck: null, card: {} };
    if (!pend || pend.kind !== 'choose') return t;
    pend.req.options.forEach(function (o, i) {
      if (o.die != null && t.die[o.die] == null) t.die[o.die] = i;
      if (o.bird != null) t.bird[o.bird] = i;
      if (o.tray != null) t.tray[o.tray] = i;
      if (o.deck) t.deck = i;
      if (o.card != null) t.card[o.card] = i;
    });
    return t;
  }
  function ensureSkeleton() {
    if (document.getElementById('gameRoot')) return;
    var S = window.SongroostScene; S.injectCss();
    app.innerHTML = '<div class="game" id="gameRoot"><header class="topbar" id="gTop"></header><div class="maincol"><div class="tabs" id="gTabs"></div><div class="boardwrap"><div class="board" id="gBoard">' +
      E.HABS.map(function (h) { return '<div class="row ' + h + '" id="row-' + h + '"><div class="scene"><div class="scn">' + S.row(h) + '</div><div class="tint"></div></div><div class="rowc" id="rowc-' + h + '"></div></div>'; }).join('') +
      '</div></div></div><aside class="side" id="gSide"></aside></div><div id="gDock"></div>';
    S.fit(app);
  }
  function setHTML(id, html) { var el = document.getElementById(id); if (el && el.__h !== html) { el.innerHTML = html; el.__h = html; } }
  var TINT = ['rgba(255,196,140,.20)', 'rgba(255,255,255,0)', 'rgba(255,248,220,.12)', 'rgba(240,120,80,.22)', 'rgba(16,28,70,.42)'];
  function renderGame() {
    ensureSkeleton();
    var p = view === 'rival' ? RIVAL : ME, t = choiceTargets(), myTurn = pend && pend.kind === 'action';
    var acts = G.rounds === 4 ? [8, 7, 6, 5] : [8, 7, 6, 5, 4], tot = acts[G.round - 1] || 0, goal = G.goals[G.round - 1];
    function dots(pl) { var s = ''; for (var i = 0; i < tot; i++) s += '<span class="dot' + (i >= pl.actions ? ' used' : '') + '"></span>'; return '<span class="dots" aria-label="' + pl.actions + ' turns left">' + s + '</span>'; }
    var sMe = E.score(G, ME).total, sR = E.score(G, RIVAL).total;
    setHTML('gTop', '<span class="round">Round ' + G.round + ' · ' + E.todName(G) + '</span>' +
      '<span class="goal">Goal: <b>' + esc(goal ? goal.text : '') + '</b> — you ' + (goal ? goal.f(ME) : 0) + ', rival ' + (goal ? goal.f(RIVAL) : 0) + '</span>' +
      '<span class="scores"><span>' + esc(ME.name) + ' ' + sMe + ' ' + dots(ME) + '</span><span>Rival ' + sR + ' ' + dots(RIVAL) + '</span></span>');
    var pairs = myTurn ? E.pairOptions(G, ME) : [];
    setHTML('gTabs', '<button type="button" data-view="me" aria-pressed="' + (view === 'me') + '">Your sanctuary</button><button type="button" data-view="rival" aria-pressed="' + (view === 'rival') + '">Rival’s sanctuary</button>' +
      '<span class="who night-ink">' + (G.current === ME.i ? 'Your turn' : G.current === RIVAL.i ? 'The Rival Keeper is playing…' : '') + '</span>' +
      (pairs.length ? '<button type="button" class="pairbtn" data-act="pair">♥ Pair up</button>' : ''));
    var tod = todIndex(), board = document.getElementById('gBoard');
    board.classList.toggle('dusk', tod >= 3); board.classList.toggle('night', tod === 4);
    Array.prototype.forEach.call(board.querySelectorAll('.tint'), function (el) { el.style.background = TINT[tod]; });
    E.HABS.forEach(function (h) { var r = renderRow(p, h, t, myTurn && view === 'me'); document.getElementById('row-' + h).classList.toggle('dim', r.dim); setHTML('rowc-' + h, r.html); });
    var feeder = '<div class="box"><h3>Feeding Stump</h3><div class="feeder">' + G.feeder.map(function (d, i) { var pk = t.die[i] != null; return '<button type="button" class="die' + (pk ? ' pick' : '') + '"' + (pk ? ' data-opt="' + t.die[i] + '"' : ' tabindex="-1"') + ' aria-label="' + d + ' die">' + dieFace(d) + '</button>'; }).join('') + Array(6 - G.feeder.length).join('<span class="die empty"></span>') + '</div></div>';
    var tray = '<div class="box"><h3>Sightings <small>tap a card to look closer</small></h3><div class="tray">' + G.tray.map(function (c, i) { if (!c) return '<span class="mini" style="background:rgba(0,0,0,.06)"></span>'; var b = E.card(G, c), pk = t.tray[i] != null; return '<button type="button" class="mini' + (pk ? ' pick' : '') + '" style="background:' + A.HAB[b.hab[0]][0] + '" data-zoomtray="' + i + '"><span class="art">' + A.drawBird(b) + '</span><span class="nm">' + esc(b.name) + '</span><span class="meta"><b>' + b.pts + '</b>' + b.food.map(function (f) { return f === 'any' ? '<span class="chip sm anyc">★</span>' : chip(f, 1); }).join(b.foodOr ? '/' : '') + '</span></button>'; }).join('') +
      '<button type="button" class="deckbtn' + (t.deck != null ? ' pick' : '') + '"' + (t.deck != null ? ' data-opt="' + t.deck + '"' : ' tabindex="-1"') + '>Deck<br>' + G.deck.length + '</button></div></div>';
    var rival = '<div class="box"><h3>Rival Keeper</h3><div class="supply">' + E.FOODS.map(function (f) { return '<span>' + chip(f, 1) + RIVAL.food[f] + '</span>'; }).join('') + '</div><p class="rivalsum" style="margin:8px 0 0">' + RIVAL.hand.length + ' cards in hand · ' + E.allBirds(RIVAL).length + ' birds · ' + E.totalEggs(RIVAL) + ' eggs</p></div>';
    var logBox = '<div class="box"><h3>Field notes</h3><div class="log">' + G.log.slice(-30).reverse().map(function (l) { return '<p>' + esc(l.text) + '</p>'; }).join('') + '</div></div>';
    setHTML('gSide', feeder + tray + rival + logBox);
    setHTML('gDock', renderDock(t));
    var land = app.querySelector('.bird.land'); if (land && !land.__seen) { land.__seen = 1; land.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  function renderRow(p, h, t, interactive) {
    var row = p.board[h], n = row.length, kind = E.ROWACT[h];
    var amt = kind === 'nest' ? E.LAY[n] : E.GAIN[n];
    var label = kind === 'forage' ? 'Gain ' + amt + ' food' : kind === 'nest' ? 'Lay ' + amt + ' eggs' : 'Draw ' + amt + ' card' + (amt > 1 ? 's' : '');
    var canNest = kind !== 'nest' || E.allBirds(p).some(function (x) { return x.eggs < x.b.eggs; });
    var live = interactive && !sel && canNest;
    var chk = sel && interactive ? E.canPlace(G, ME, sel, h) : null;
    var act = '<button type="button" class="act ' + h + (live ? ' live' : '') + '"' + (live ? ' data-act="' + kind + '"' : ' tabindex="-1"') + (interactive && !canNest && !sel ? ' disabled' : '') + '><span class="k">' + kind.toUpperCase() + '</span><span class="h">' + E.ROWNAME[h] + '</span><span class="r">' + label + '</span></button>';
    var slots = '';
    for (var i = 0; i < 5; i++) {
      if (i < n) slots += renderBird(row[i], h, t, p);
      else if (i === n && chk) {
        if (chk.ok) slots += '<button type="button" class="slot glow-ok" data-place="' + h + '"><span class="go">Place here</span>' + eggCost(i) + '</button>';
        else if (chk.lives) slots += '<div class="slot glow-short"><span class="why">' + esc(chk.why) + '</span></div>';
        else slots += '<div class="slot">' + eggCost(i) + '</div>';
      } else slots += '<div class="slot">' + eggCost(i) + '</div>';
    }
    return { html: act + slots, dim: !!(chk && !chk.lives) };
  }
  function eggCost(i) { var c = E.EGG_COST[i] || 0; if (!c) return '<span>Free</span>'; var s = ''; for (var k = 0; k < c; k++) s += '<span class="egg"></span>'; return '<span class="ec" aria-label="Costs ' + c + ' egg">' + s + '</span>'; }
  function renderBird(x, h, t, owner) {
    var pk = t.bird[x.card.uid] != null, eggs = '';
    for (var k = 0; k < x.b.eggs; k++) eggs += '<span class="egg' + (k < x.eggs ? '' : ' e') + '"></span>';
    var chance = pk && pend.req.kind === 'strike' ? '<span class="chance">' + E.strikeChance(x) + '%</span>' : '';
    var cls = 'bird ' + h + (pk ? ' pick' : '') + (G.activeBird === x.card.uid ? ' active' : '') + (G.justPlaced === x.card.uid ? ' land' : '');
    var tag = pk ? 'button type="button" data-opt="' + t.bird[x.card.uid] + '"' : 'button type="button" data-zoom="' + owner.i + ':' + x.card.uid + '"';
    return '<' + tag + ' class="' + cls + '" title="' + esc(x.b.name + (x.b.kind ? ' — ' + x.b.kind + ': ' + x.b.power : '')) + '">' + chance +
      '<span class="tags"><span class="badge sex">' + (x.card.sex === 'M' ? '♂' : '♀') + '</span>' + (x.paired ? '<span class="badge pair">♥</span>' : '') + (x.cache ? '<span class="badge">●' + x.cache + '</span>' : '') + (x.tucked ? '<span class="badge">▤' + x.tucked + '</span>' : '') + '</span>' +
      '<span class="art">' + A.drawBird(x.b) + '</span><span class="nm">' + esc(x.b.name) + '</span><span class="meta"><span>♪' + x.b.pts + '</span><span class="eggs">' + eggs + '</span></span></' + tag.split(' ')[0] + '>';
  }
  function renderDock(t) {
    var msg = '', opts = '', keepCards = '';
    if (pend && pend.kind === 'action') {
      msg = sel ? 'Tap a glowing space to place your ' + esc(E.card(G, sel).name) + '<small>Blue means it can go there. Tap the card again to put it back.</small>'
        : 'Your turn: tap a bird to attract it, or choose Forage, Nest or Scout on your board<small>Then any SONG powers in that row play, right to left.</small>';
      if (sel) opts = '<button type="button" class="opt" data-act="zoomsel">🔍 Look closer</button><button type="button" class="opt skip" data-act="unsel">Put it back</button>';
    } else if (pend && pend.kind === 'choose') {
      var r = pend.req;
      msg = esc(r.prompt);
      if (r.kind === 'keep') keepCards = '<div class="keepopts">' + r.options.map(function (o, i) { var b = G.byId[o.id]; return '<div role="button" tabindex="0" class="hc" data-opt="' + i + '">' + A.cardHTML(b) + '</div>'; }).join('') + '</div>';
      else opts = r.options.map(function (o, i) { return '<button type="button" class="opt' + (r.options.length <= 2 && i === 0 ? ' main' : '') + '" data-opt="' + i + '">' + (o.food ? chip(o.food, 1) : '') + esc(o.label) + '</button>'; }).join('');
      if (r.skip) opts += '<button type="button" class="opt skip" data-act="skip">' + esc(r.skip) + '</button>';
    } else if (G.current === RIVAL.i) msg = 'The Rival Keeper is taking a turn…';
    var handHTML = ME.hand.length ? ME.hand.map(function (c) {
      var b = E.card(G, c), pk = t.card[c.uid] != null && pend.req.kind === 'tuck';
      var attrs = pk ? ' data-opt="' + t.card[c.uid] + '"' : (pend && pend.kind === 'action' ? ' data-sel="' + c.uid + '"' : '');
      return '<div role="button" tabindex="0" class="hc' + (pk ? ' pick' : '') + '"' + attrs + ' aria-pressed="' + (sel && sel.uid === c.uid) + '" aria-label="' + esc(b.name) + '">' + A.cardHTML(b) + '</div>';
    }).join('') : '<p class="empty">No birds in your hand. Scout the River to draw more.</p>';
    var bar = '<div class="supplybar" aria-label="Your supply">' + E.FOODS.map(function (f) { return '<span class="sb" title="' + f + '">' + chip(f) + '<b>' + ME.food[f] + '</b></span>'; }).join('') +
      '<span class="sb sep" title="Eggs on your birds"><span class="chip eggc">' + A.icon('egg', 22, '#27251f') + '</span><b>' + E.totalEggs(ME) + '</b></span><span class="sb" title="Cards in hand"><span class="chip cardc">🂠</span><b>' + ME.hand.length + '</b></span>' + (ME.ribbons ? '<span class="sb" title="Pair ribbons"><span class="chip pairc">♥</span><b>' + ME.ribbons + '</b></span>' : '') + '</div>';
    return '<div class="dock">' + bar + '<div class="prompt"><div class="msg">' + msg + '</div>' + opts + keepCards + '</div><div class="hand" aria-label="Your hand">' + handHTML + '</div></div>';
  }

  // ---------- events ----------
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-set],[data-act],[data-opt],[data-sel],[data-place],[data-view],[data-keep],[data-food],[data-zoom],[data-zoomtray],.song');
    if (!el) return;
    if (el.classList.contains('song')) { e.stopPropagation(); chirp(el.dataset.song, true); return; }
    if (el.dataset.set) { var v = el.dataset.val; settings[el.dataset.set] = el.dataset.set === 'rounds' ? +v : v; var nm = document.getElementById('nm'); if (nm) settings.name = nm.value; render(); return; }
    if (el.dataset.view) { view = el.dataset.view; render(); return; }
    if (el.dataset.zoom) { var zp = el.dataset.zoom.split(':'), owner = G.players[+zp[0]], zx = byUid(owner, +zp[1]); if (zx) { zoom = { b: zx.b, x: zx, owner: owner === ME ? 'Your sanctuary' : owner.name + '’s sanctuary' }; chirp(zx.b.id, true); render(); } return; }
    if (el.dataset.zoomtray != null) { var ti = +el.dataset.zoomtray, tc = G.tray[ti], tt = choiceTargets(); if (tc) { zoom = { b: E.card(G, tc), card: tc, where: 'In the Sightings', opt: tt.tray[ti], req: pend && pend.req }; render(); } return; }
    if (el.dataset.keep) { pend.keep[el.dataset.keep] = !pend.keep[el.dataset.keep]; render(); return; }
    if (el.dataset.food) { pend.food[el.dataset.food] = !pend.food[el.dataset.food]; render(); return; }
    if (el.dataset.opt != null && pend && pend.kind === 'choose') { var o = pend.req.options[+el.dataset.opt]; if (o) { if (o.food === undefined && pend.req.kind === 'die') {} resolve(o.value); } return; }
    if (el.dataset.sel && pend && pend.kind === 'action') { var c = ME.hand.filter(function (h) { return String(h.uid) === el.dataset.sel; })[0]; sel = sel && sel.uid === c.uid ? null : c; if (sel) chirp(E.card(G, sel).id, false); render(); return; }
    if (el.dataset.place && pend && pend.kind === 'action' && sel) { resolve({ type: 'play', uid: sel.uid, hab: el.dataset.place }); return; }
    var a = el.dataset.act;
    if (a === 'start') { var n2 = document.getElementById('nm'); settings.name = (n2 && n2.value.trim()) || 'You'; start(); return; }
    if (a === 'keep' && pend && pend.kind === 'start') {
      var keep = Object.keys(pend.keep).filter(function (k) { return pend.keep[k]; }).map(Number);
      var drop = E.FOODS.filter(function (f) { return !pend.food[f]; });
      var p = pend; pend = null; screen = 'game'; p.res({ keep: keep, discardFood: drop }); schedule(); return;
    }
    if (a === 'again') { screen = 'setup'; G = null; render(); return; }
    if (a === 'zoomclose') { zoom = null; render(); return; }
    if (a === 'zoomtake') { var zo = zoom; zoom = null; if (zo && pend && pend.kind === 'choose' && pend.req === zo.req) resolve(pend.req.options[zo.opt].value); else render(); return; }
    if (a === 'zoomsel' && sel) { zoom = { b: E.card(G, sel), card: sel, where: 'In your hand' }; render(); return; }
    if (!pend) return;
    if (a === 'unsel') { sel = null; render(); return; }
    if (a === 'skip' && pend.kind === 'choose') { resolve(null); return; }
    if ((a === 'forage' || a === 'nest' || a === 'scout') && pend.kind === 'action') { resolve({ type: a }); return; }
    if (a === 'pair' && pend.kind === 'action') {
      var po = E.pairOptions(G, ME), res = pend.res;
      pend = { kind: 'choose', req: { kind: 'pairPick', prompt: 'Offer to pair which bird?', options: po.map(function (x, i) { return { label: x.x.b.name + ' with ' + x.q.name + '’s ' + (x.y.card.sex === 'M' ? '♂' : '♀'), value: i }; }) }, skip: true,
        res: function (i) { if (i == null) { human.chooseAction().then(res); return; } res({ type: 'pair', uid: po[i].x.card.uid, with: po[i].q.i }); } };
      pend.req.skip = 'Never mind';
      render(); return;
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && zoom) { zoom = null; render(); return; } if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')) { e.preventDefault(); e.target.click(); } });
  window.__songroost = function () { return { G: G, pend: pend, sel: sel, screen: screen, view: view }; };
  render();
})();
