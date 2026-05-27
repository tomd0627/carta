(function () {
  /* ─── Sticky header ───────────────────────────────────────────────── */

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    var hero = document.getElementById('hero');
    if (!header || !hero || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          header.removeAttribute('data-scrolled');
        } else {
          header.setAttribute('data-scrolled', 'true');
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
  }

  /* ─── Smooth-scroll nav links ─────────────────────────────────────── */

  function initSmoothNav() {
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ─── Init ────────────────────────────────────────────────────────── */

  function init() {
    initStickyHeader();
    initSmoothNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
