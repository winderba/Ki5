/* ============================================================
   KNICKS IN 5 — confetti + count-up + a couple easter eggs
   Auto-loaded by Mintlify on every page (runs after interactive).
   ============================================================ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#F58426', '#006BB6', '#F7E4B0', '#F3F6FC', '#1F8FE0'];

  /* ---------- confetti engine (canvas) ---------- */
  function runConfetti(opts) {
    opts = opts || {};
    var canvas = document.createElement('canvas');
    canvas.className = 'ki5-confetti-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    function size() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    size(); window.addEventListener('resize', size);

    var burst = !!opts.burst;
    var N = burst ? 180 : (reduce ? 40 : 90);
    var pieces = [];
    for (var i = 0; i < N; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: burst ? canvas.height * 0.5 : Math.random() * canvas.height - canvas.height,
        w: 4 + Math.random() * 6, h: 6 + Math.random() * 8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        vy: (burst ? -6 - Math.random() * 6 : 0.6 + Math.random() * 1.6),
        vx: -1 + Math.random() * 2,
        rot: Math.random() * 6.28, vr: -0.08 + Math.random() * 0.16,
        sway: Math.random() * 6.28
      });
    }
    var life = 0, maxLife = burst ? 160 : Infinity;
    function frame() {
      life++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        if (burst) p.vy += 0.18; // gravity
        p.y += p.vy; p.sway += 0.02; p.x += p.vx + Math.sin(p.sway) * 0.5; p.rot += p.vr;
        if (!burst && p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.globalAlpha = burst ? Math.max(0, 1 - life / maxLife) : 0.9;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (burst && life > maxLife) { canvas.remove(); return; }
      if (reduce && !burst) return; // static single frame for reduced motion
      requestAnimationFrame(frame);
    }
    frame();
  }

  function isHome() {
    var p = (document.documentElement.getAttribute('data-current-path') || window.location.pathname || '');
    return p === '/' || p === '' || /\/index$/.test(p);
  }

  /* ---------- count-up for .statnum[data-to] ---------- */
  function countUp() {
    var els = document.querySelectorAll('.statnum[data-to]');
    els.forEach(function (el) {
      if (el.getAttribute('data-done')) return;
      el.setAttribute('data-done', '1');
      var to = parseFloat(el.getAttribute('data-to'));
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = (String(to).split('.')[1] || '').length;
      if (reduce) { el.textContent = to.toFixed(decimals) + suffix; return; }
      var start = null, dur = 1100;
      function step(ts) {
        if (!start) start = ts;
        var t = Math.min(1, (ts - start) / dur);
        var v = (to * (1 - Math.pow(1 - t, 3)));
        el.textContent = v.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Konami easter egg -> confetti burst ---------- */
  var seq = [38,38,40,40,37,39,37,39,66,65], idx = 0;
  window.addEventListener('keydown', function (e) {
    idx = (e.keyCode === seq[idx]) ? idx + 1 : 0;
    if (idx === seq.length) { idx = 0; runConfetti({ burst: true }); }
  });

  function init() {
    try { if (isHome()) runConfetti({}); } catch (e) {}
    try { countUp(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
