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

  // Terminal hero typewriter: types each command/output line in sequence,
  // a shared cursor tracks the active line (solid while typing, blinking
  // when idle), then settles back into its static spot after the final
  // line. Falls back to showing everything immediately on error, reduced
  // motion, or if the hero markup isn't present.
  (function typewriter() {
    var root = document.documentElement;

    function revealAll() {
      root.classList.remove("js-anim");
      Array.prototype.slice.call(document.querySelectorAll(".term-body .tw")).forEach(function (n) {
        n.style.visibility = "visible";
      });
    }

    try {
      var termBody = document.querySelector(".term-body");
      if (!termBody) {
        revealAll();
        return;
      }

      var reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        revealAll();
        return;
      }

      var nodes = Array.prototype.slice.call(termBody.querySelectorAll(".tw"));
      var cursor = document.getElementById("termCursor");

      if (!nodes.length) {
        revealAll();
        return;
      }

      // Never leave the hero blank if something above goes sideways mid-run.
      var safety = setTimeout(revealAll, 6000);

      var queue = nodes.map(function (node) {
        var text = node.textContent;
        node.textContent = "";
        return { node: node, text: text, isCommand: !!node.closest(".term-prompt") };
      });

      function moveCursorAfter(node) {
        if (!cursor || !node.parentNode) return;
        node.parentNode.insertBefore(cursor, node.nextSibling);
      }

      function typeItem(item, done) {
        var node = item.node;
        node.style.visibility = "visible";
        moveCursorAfter(node);
        if (cursor) cursor.classList.add("is-typing");
        var i = 0;
        var speed = item.isCommand ? 48 : 14;
        (function step() {
          if (i <= item.text.length) {
            node.textContent = item.text.slice(0, i);
            i += 1;
            var jitter = speed + (Math.random() * speed * 0.5 - speed * 0.25);
            setTimeout(step, jitter);
          } else {
            if (cursor) cursor.classList.remove("is-typing");
            done();
          }
        })();
      }

      function run(index) {
        if (index >= queue.length) {
          clearTimeout(safety);
          root.classList.remove("js-anim");
          return;
        }
        var item = queue[index];
        var pauseAfter = item.isCommand ? 220 : 420;
        typeItem(item, function () {
          setTimeout(function () {
            run(index + 1);
          }, pauseAfter);
        });
      }

      setTimeout(function () {
        run(0);
      }, 650);
    } catch (err) {
      revealAll();
    }
  })();

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
