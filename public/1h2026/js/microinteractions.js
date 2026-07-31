(function () {
  'use strict';

  /* ---- Scroll Reveal ----------------------------------------
     Uses IntersectionObserver — no dependencies.
     Elements already in the viewport on load become visible
     immediately; elements below fold animate in on scroll.
  ------------------------------------------------------------ */
  function setupReveal() {
    if (!window.IntersectionObserver) return;

    // Solo elements — fade + slide up individually
    var soloSelectors = [
      '.hero-intro',
      '.meet-team',
      '.new-appointments-container',
      '.page-hero-section',
      '.blog-content',
      '.insights-single-article',
      '.carrer-headline-wrap',
    ];
    soloSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', '');
        }
      });
    });

    // Staggered groups — children cascade in with offset delay
    var staggeredGroups = [
      '.insightsgrid .utility-link-content-block',
      '.general-cards-row .general-card-container',
      '.frame-1000001879 .frame-1000001892',
    ];
    staggeredGroups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.style.setProperty('--mi-delay', (i * 80) + 'ms');
        el.setAttribute('data-reveal', '');
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('mi-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -30px 0px',
    });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- Reading Progress Bar ---------------------------------
     Thin gradient line fixed at top — only on inner pages.
  ------------------------------------------------------------ */
  function setupProgress() {
    var path = window.location.pathname;
    var isHome = path === '/'
      || path === ''
      || /\/index\.html$/.test(path)
      || /\/$/.test(path);
    if (isHome) return;

    var bar = document.createElement('div');
    bar.id = 'mi-progress';
    document.body.insertBefore(bar, document.body.firstChild);

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      bar.style.width = (docH > 0 ? Math.min((scrollTop / docH) * 100, 100) : 0) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---- Page Entry Normalization -----------------------------
     Tags the first content section (after the nav banner) with
     mi-page-start so CSS can normalize top padding consistently.
     9 of 10 inner pages already use 0px top; this aligns the 2
     outliers (.newherosection, .section) without touching HTML.
  ------------------------------------------------------------ */
  function normalizePageEntry() {
    var banner = document.querySelector('[role="banner"]');
    if (banner && banner.nextElementSibling) {
      banner.nextElementSibling.classList.add('mi-page-start');
    }
  }

  /* ---- Nav shrink on scroll --------------------------------
     Adds .is-scrolled to the nav after 60px scroll on desktop.
     Also handles the box-shadow (replaces the inline script).
  ------------------------------------------------------------ */
  function setupShrinkNav() {
    var nav = document.querySelector('.header-style.navigationstyle');
    if (!nav) return;
    function update() {
      var scrolled = window.scrollY > 60;
      nav.classList.toggle('is-scrolled', scrolled);
      nav.style.boxShadow = scrolled ? '0 2px 12px rgba(0,0,0,0.22)' : '';
    }
    window.addEventListener('scroll', update, { passive: true });
    update(); // apply immediately in case page loads mid-scroll
  }

  /* ---- Init ------------------------------------------------- */
  function init() {
    normalizePageEntry();
    setupReveal();
    setupProgress();
    setupShrinkNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
