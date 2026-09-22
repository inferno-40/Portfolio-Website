(function () {
  "use strict";

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = links
    .map(function (link) {
      return document.getElementById(link.dataset.section);
    })
    .filter(Boolean);

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll-spy: highlight the active section link
  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            links.forEach(function (link) {
              link.classList.toggle("active", link.dataset.section === id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // Staged entrances: below-the-fold sections fade/slide in as they cross
  // into view (the hero and metrics strip use the CSS-only animate-rise
  // instead, since they're above the fold on load). No-JS and
  // reduced-motion visitors just see everything, and a timeout guarantees
  // nothing is ever left stranded invisible.
  (function scrollReveal() {
    var root = document.documentElement;

    function revealAllNow() {
      root.classList.remove("reveal-anim");
      Array.prototype.slice.call(document.querySelectorAll(".reveal")).forEach(function (el) {
        el.classList.add("is-in");
      });
    }

    try {
      var reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

      if (reduceMotion || !targets.length || !("IntersectionObserver" in window)) {
        revealAllNow();
        return;
      }

      var safety = setTimeout(revealAllNow, 5000);

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
          if (!document.querySelector(".reveal:not(.is-in)")) {
            clearTimeout(safety);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      targets.forEach(function (el) {
        observer.observe(el);
      });
    } catch (err) {
      revealAllNow();
    }
  })();
})();
