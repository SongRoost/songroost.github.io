// Songroost — the Rival Keeper (computer player). Plays by the same rules on a real board.
(function (root) {
  'use strict';
  var E = root.SongroostEngine || (typeof require !== 'undefined' ? require('./engine.js') : null);
  function needs(g, p) {
    var want = { insect: 0, grain: 0, berry: 0, fish: 0, prey: 0 };
    p.hand.forEach(function (c) { var b = E.card(g, c); b.food.forEach(function (f) { if (f !== 'any') want[f] += b.foodOr ? .5 : 1; }); });
    E.FOODS.forEach(function (f) { want[f] -= p.food[f] * .9; });
    return want;
  }
  function playValue(g, p, c, hab) {
    var b = E.card(g, c), late = g.round >= g.rounds - 1;
    var v = b.pts * (late ? 1.3 : 1) + (b.kind ? (late ? .4 : 1.6) : 0) - .8 * E.eggCost(p, hab) - .25 * b.food.length;
    if (b.pred && g.round < g.rounds) v += .6;
    if (b.kind === 'SONG' && hab === 'canopy' && !late) v += .4;
    return v;
  }
  function eggRoom(p) { return E.allBirds(p).reduce(function (s, x) { return s + (x.b.eggs - x.eggs); }, 0); }
  function make(level) {
    var L = level || 'medium';
    return {
      chooseStart: function (g, p, five) {
        var ranked = five.slice().sort(function (a, b) { var A = E.card(g, a), B = E.card(g, b); return (B.pts - B.food.length * .8) - (A.pts - A.food.length * .8); });
        var keepN = L === 'easy' ? 2 : 3, keep = ranked.slice(0, keepN).map(function (c) { return c.uid; });
        var want = { insect: 0, grain: 0, berry: 0, fish: 0, prey: 0 };
        ranked.slice(0, keepN).forEach(function (c) { E.card(g, c).food.forEach(function (f) { if (f !== 'any') want[f]++; }); });
        var foods = E.FOODS.slice().sort(function (a, b) { return want[a] - want[b]; });
        return { keep: keep, discardFood: foods.slice(0, keepN) };
      },
      chooseAction: function (g, p) {
        if (L !== 'easy') { var po = E.pairOptions(g, p); if (po.length) return { type: 'pair', uid: po[0].x.card.uid, with: po[0].q.i }; }
        var legal = E.legalActions(g, p);
        if (L === 'easy' && g.rng() < .5) return legal[Math.floor(g.rng() * legal.length)];
        var plays = legal.filter(function (a) { return a.type === 'play'; }), late = g.round >= g.rounds - 1;
        var best = null, bestV = -99;
        plays.forEach(function (a) { var c = p.hand.filter(function (h) { return h.uid === a.uid; })[0], v = playValue(g, p, c, a.hab) - p.board[a.hab].length * .15; if (v > bestV) { bestV = v; best = a; } });
        var canNest = legal.some(function (a) { return a.type === 'nest'; }), room = eggRoom(p);
        if (late && canNest && room >= E.LAY[p.board.meadow.length] && (!best || bestV < 4 || (L === 'hard' && p.actions <= 2))) return { type: 'nest' };
        if (best && (bestV > (L === 'hard' && g.round <= 2 ? .8 : 1.5) || late)) return best;
        var w = needs(g, p), short = E.FOODS.some(function (f) { return w[f] > .5; });
        var eggShort = p.hand.some(function (c) { var b = E.card(g, c); return E.payPlan(p.food, b) && E.HABS.some(function (h) { return b.hab.indexOf(h) >= 0 && p.board[h].length < 5 && E.totalEggs(p) < E.eggCost(p, h); }); });
        if (eggShort && canNest) return { type: 'nest' };
        if (p.hand.length < 2) return { type: 'scout' };
        if (short || E.foodTotal(p) < 2) return { type: 'forage' };
        if (best) return best;
        return canNest && room > 2 ? { type: 'nest' } : { type: g.rng() < .5 ? 'forage' : 'scout' };
      },
      choose: function (g, p, req) {
        var o = req.options, k = req.kind;
        function by(score) { var b = o[0], bs = -1e9; o.forEach(function (x) { var s = score(x); if (s > bs) { bs = s; b = x; } }); return b.value; }
        function bird(uid) { var all = E.allBirds(p); for (var i = 0; i < all.length; i++) if (all[i].card.uid === uid) return all[i]; return null; }
        switch (k) {
          case 'die': { var w = needs(g, p); return by(function (x) { return w[x.food] + g.rng() * .1; }); }
          case 'egg': return by(function (x) { var b = bird(x.bird); if (!b) return 0; var left = b.b.eggs - b.eggs; return (L === 'hard' && left === 1 ? 1.5 : 0) + left + (b.paired ? 1 : 0); });
          case 'payEgg': return by(function (x) { var b = bird(x.bird); return b ? b.eggs - (b.paired ? 2 : 0) : 0; });
          case 'draw': {
            var trayBest = by(function (x) { return x.deck ? 3.5 : E.card(g, g.tray[x.tray]).pts + (E.payPlan(p.food, E.card(g, g.tray[x.tray])) ? 1 : 0); });
            return trayBest;
          }
          case 'keep': return by(function (x) { var c = null; g.discard.concat(g.deck, p.hand).forEach(function (h) { if (h && h.uid === x.card) c = h; }); return c ? E.card(g, c).pts : 0; });
          case 'tuck': {
            if (p.hand.length < 4) return null;
            return by(function (x) { var c = p.hand.filter(function (h) { return h.uid === x.card; })[0]; return c ? -E.card(g, c).pts : 0; });
          }
          case 'predator': {
            if (L === 'easy') return 'hunt';
            return g.rng() < .5 ? 'strike' : 'hunt';
          }
          case 'strike': return by(function (x) { return x.chance + g.rng() * 5; });
          case 'pairOffer': return 'yes';
          default: return o[0].value;
        }
      }
    };
  }
  var api = { make: make };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SongroostAI = api;
})(this);
