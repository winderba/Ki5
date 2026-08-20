/* ============================================================
   KNICKS IN 5 — confetti (manual), count-up, easter egg
   Auto-loaded by Mintlify on every page (runs after interactive).
   ============================================================ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#F58426', '#006BB6', '#F7E4B0', '#F3F6FC', '#1F8FE0'];

  var ambient = null; // { canvas, raf } when running

  function makeCanvas() {
    var c = document.createElement('canvas');
    c.className = 'ki5-confetti-canvas';
    document.body.appendChild(c);
    function size() { c.width = window.innerWidth; c.height = window.innerHeight; }
    size(); window.addEventListener('resize', size);
    return c;
  }

  function spawn(n, canvas, burst) {
    var pieces = [];
    for (var i = 0; i < n; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: burst ? canvas.height * 0.5 : Math.random() * canvas.height - canvas.height,
        w: 4 + Math.random() * 6, h: 6 + Math.random() * 8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        vy: burst ? -6 - Math.random() * 6 : 0.6 + Math.random() * 1.6,
        vx: -1 + Math.random() * 2,
        rot: Math.random() * 6.28, vr: -0.08 + Math.random() * 0.16,
        sway: Math.random() * 6.28
      });
    }
    return pieces;
  }

  /* one-shot celebratory burst */
  function burstConfetti() {
    var canvas = makeCanvas();
    var ctx = canvas.getContext('2d');
    var pieces = spawn(reduce ? 60 : 180, canvas, true);
    var life = 0, maxLife = 160;
    (function frame() {
      life++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        p.vy += 0.18; p.y += p.vy; p.sway += 0.02; p.x += p.vx + Math.sin(p.sway) * 0.5; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - life / maxLife);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (life > maxLife) { canvas.remove(); return; }
      requestAnimationFrame(frame);
    })();
  }

  /* toggleable ambient snowfall */
  function startAmbient() {
    if (ambient) return;
    var canvas = makeCanvas();
    var ctx = canvas.getContext('2d');
    var pieces = spawn(reduce ? 40 : 90, canvas, false);
    ambient = { canvas: canvas, raf: 0 };
    (function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        p.y += p.vy; p.sway += 0.02; p.x += p.vx + Math.sin(p.sway) * 0.5; p.rot += p.vr;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.globalAlpha = 0.9;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (reduce) return; // static frame under reduced motion
      if (ambient) ambient.raf = requestAnimationFrame(frame);
    })();
  }

  function stopAmbient() {
    if (!ambient) return;
    cancelAnimationFrame(ambient.raf);
    ambient.canvas.remove();
    ambient = null;
  }

  function toggleAmbient(btn) {
    if (ambient) { stopAmbient(); if (btn) { btn.setAttribute('data-on', ''); btn.textContent = '🎉 Confetti'; } }
    else { startAmbient(); if (btn) { btn.setAttribute('data-on', '1'); btn.textContent = '🎉 Confetti: ON'; } }
  }

  /* ---------- inject the nav button (survives SPA re-renders) ---------- */
  function ensureNavButton() {
    if (document.querySelector('.ki5-confetti-btn')) return;
    var anyLink = document.querySelector('.navbar-link');
    var container = anyLink && anyLink.parentElement;
    if (!container) return;
    var wrap = document.createElement('div');
    wrap.className = 'navbar-link';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ki5-confetti-btn';
    btn.textContent = '🎉 Confetti';
    btn.setAttribute('aria-label', 'Toggle confetti');
    btn.addEventListener('click', function () { toggleAmbient(btn); });
    wrap.appendChild(btn);
    container.insertBefore(wrap, container.firstChild);
  }

  /* ---------- easter egg: three up-arrows -> burst ---------- */
  var seq = [38, 38, 38], idx = 0;
  window.addEventListener('keydown', function (e) {
    idx = (e.keyCode === seq[idx]) ? idx + 1 : (e.keyCode === 38 ? 1 : 0);
    if (idx === seq.length) { idx = 0; burstConfetti(); }
  });

  function init() {
    try { ensureNavButton(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  // re-inject the nav button across SPA navigations
  setInterval(function () { try { ensureNavButton(); } catch (e) {} }, 1200);
})();
