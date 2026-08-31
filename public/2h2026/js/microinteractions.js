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
      threshold: 0,
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

/* ============================================================
   BOARD FLIP CARDS — pairs with the matching block at the bottom
   of css/microinteractions.css. Two-stage horizontal spin: rotate
   to 90deg, swap faces while edge-on, spin back while the card's
   height animates to fit (FLIP-style measure). Opening a card
   closes any other open card; a close requested while the other
   card is mid-animation retries until it lands. The toggle control
   is the "View bio" button (native focus/keyboard, aria-expanded,
   aria-controls); clicking anywhere on the card also toggles.
   Transition progress is confirmed by transitionend with a timer
   fallback so the state machine can never stall.
   ============================================================ */
(function () {
  function init() {
    var openCard = null;
    var cards = document.querySelectorAll('.board-flip');
    Array.prototype.forEach.call(cards, function (card) {
      var busy = false;
      var isOpen = false; /* the card's TARGET state — set the moment a
                             flip starts, so a close requested mid-animation
                             sees the intent, not the half-finished display */
      var hint = card.querySelector('.board-flip-hint');
      function afterProp(prop, ms, fn) {
        var settled = false;
        function settle() {
          if (settled) return;
          settled = true;
          card.removeEventListener('transitionend', onEnd);
          fn();
        }
        function onEnd(e) {
          if (e.target === card && e.propertyName === prop) settle();
        }
        card.addEventListener('transitionend', onEnd);
        setTimeout(settle, ms);
      }
      function swapFaces(open) {
        var img = card.querySelector('.image-6');
        var front = card.querySelector('.flex-block');
        var bio = card.querySelector('.board-bio');
        if (img) img.style.display = open ? 'none' : '';
        if (front) front.style.display = open ? 'none' : '';
        if (bio) bio.hidden = !open;
        if (hint) {
          hint.textContent = open ? 'Back' : 'View bio';
          hint.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      }
      function flip() {
        if (busy) return;
        busy = true;
        isOpen = !isOpen;
        var open = isOpen;
        if (open && openCard && openCard !== card && openCard.__boardFlipClose) {
          openCard.__boardFlipClose();
        }
        openCard = open ? card : (openCard === card ? null : openCard);
        var h0 = card.offsetHeight;
        card.classList.add('is-turning');
        afterProp('transform', 220, function () {
          swapFaces(open);
          card.classList.remove('is-turning');
          card.classList.add('is-edge-on');
          void card.offsetWidth; /* reflow so -90deg lands before animating */
          card.classList.remove('is-edge-on');
          card.classList.add('is-returning');
          /* FLIP: measure the swapped content's natural height, then
             animate from the old height alongside the return spin. */
          card.style.height = 'auto';
          var h1 = card.offsetHeight;
          card.style.height = h0 + 'px';
          void card.offsetWidth;
          card.classList.add('is-resizing');
          card.style.height = h1 + 'px';
          afterProp('transform', 220, function () {
            card.classList.remove('is-returning');
          });
          afterProp('height', 420, function () {
            card.classList.remove('is-resizing');
            card.style.height = '';
            busy = false;
          });
        });
      }
      card.__boardFlipClose = function () {
        if (!isOpen) return;
        if (busy) { setTimeout(card.__boardFlipClose, 120); return; }
        flip();
      };
      card.addEventListener('click', flip);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
/* END board flip cards */
