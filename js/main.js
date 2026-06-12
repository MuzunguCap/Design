/* ============================================================
   Muzungu Capital — UI-Interaktionen
   Scroll-Reveal, Nav, Zähler-Animation, 3D-Tilt-Karten
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer-Jahr ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Navigation: Scroll-Zustand ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile Menü ---------- */
  var burger = document.getElementById("burger");
  var links = document.getElementById("navLinks");
  burger.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Scroll-Reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Zähler-Animation für Statistiken ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var plain = el.hasAttribute("data-plain");
    var duration = 1400;
    var start = null;

    function fmt(n) {
      return plain ? String(n) : n.toLocaleString("de-DE");
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    if (reducedMotion) {
      el.textContent = fmt(target) + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- 3D-Tilt für Karten ---------- */
  var supportsHover = window.matchMedia("(hover: hover)").matches;
  if (supportsHover && !reducedMotion) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var rect = null;

      card.addEventListener("pointerenter", function () {
        rect = card.getBoundingClientRect();
        card.style.transition = "transform 0.15s ease-out";
      });

      card.addEventListener("pointermove", function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;

        var rx = (0.5 - py) * 10; // max. 10° Kippung
        var ry = (px - 0.5) * 12;
        card.style.transform =
          "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(6px)";

        // Glow-Position für den radialen Verlauf
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });

      card.addEventListener("pointerleave", function () {
        rect = null;
        card.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
      });
    });
  }
})();
