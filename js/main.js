(function () {
  "use strict";

  var nav = document.getElementById("siteNav");
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

  // Sticky nav border-strength on scroll
  function onScroll() {
    if (window.scrollY > 8) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
  // a shared cursor tracks the active line, then the CTAs fade in.
  // Falls back to showing everything immediately on error, reduced-motion,
  // or if the hero markup isn't present.
  (function typewriter() {
    var root = document.documentElement;

    function revealAll() {
      root.classList.remove("js-anim");
      Array.prototype.slice.call(document.querySelectorAll(".term-body .tw")).forEach(function (n) {
        n.style.visibility = "visible";
      });
      var actions = document.getElementById("termActions");
      if (actions) actions.classList.add("is-visible");
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
      var actions = document.getElementById("termActions");

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
          if (actions) {
            setTimeout(function () {
              actions.classList.add("is-visible");
            }, 200);
          }
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
      }, 350);
    } catch (err) {
      revealAll();
    }
  })();
})();
