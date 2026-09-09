// Battlesnake Arena — DevCommunity
// Small, restrained interaction layer on top of the server-rendered pages:
//   - [data-reveal]   fades/lifts an element in once it enters the viewport
//   - [data-count]    counts a number up to its target once visible
//
// Progressive enhancement throughout: every element this script touches is
// already fully visible/correct in plain HTML+CSS. If this file fails to
// load, is blocked, or the browser lacks IntersectionObserver, the page
// looks and works exactly the same — just without the flourish. Reduced
// motion is respected: reveals skip straight to visible, and the arrival
// animation on numbers turns into an ordinary CSS transition.

(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // ---- scroll reveal ------------------------------------------------------
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("is-visible");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach(function (el, i) {
      // Small stagger for cards that reveal together, capped so a long
      // list doesn't leave the last item waiting.
      el.style.transitionDelay = Math.min(i * 70, 280) + "ms";
      io.observe(el);
    });
  }

  // ---- animated counters ---------------------------------------------------
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el, target, duration) {
    var startTime = null;

    function tick(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      var value = Math.round(target * easeOutCubic(progress));
      el.textContent = value.toLocaleString("en-US");
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString("en-US");
      }
    }
    requestAnimationFrame(tick);
  }

  function initCounts() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;

    // Reduced motion / no IntersectionObserver: leave the server-rendered
    // number exactly as it was rendered. Nothing to do.
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = parseInt(entry.target.getAttribute("data-count"), 10);
          if (!isNaN(target)) animateCount(entry.target, target, 900);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  ready(function () {
    initReveal();
    initCounts();
  });
})();
