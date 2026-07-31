  function mouseFollow() {
    const cursor = new MouseFollower({ visible: false });
    const el = document.querySelector(".business-line-list");
    el.addEventListener("mouseenter", () => {
      cursor.show();
      cursor.setText("Drag");
    });
    el.addEventListener("mouseleave", () => {
      cursor.removeText();
      cursor.hide();
    });
  }
  function animateRevealImages() {
    gsap.utils.toArray(".animate-reveal").forEach((element) => {
      const isCeoSection = element.classList.contains('ceo') || !!element.closest('.ceo');

      if (isCeoSection) {
        // CEO section sits below a dynamically-expanding milestones section whose
        // height grows as the user scrolls — this makes ScrollTrigger's precalculated
        // positions stale and fires the animation before the element is visible.
        // IntersectionObserver checks actual viewport overlap, so it's immune to this.
        gsap.set(element, { opacity: 0, x: -60 });
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(element, { opacity: 1, x: 0, ease: "power2.inOut", duration: 1 });
              io.disconnect();
            }
          });
        }, { threshold: 0.15 });
        io.observe(element);
        return;
      }

      // Use opacity+transform instead of clip-path for GPU performance
      gsap.fromTo(
        element,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          ease: "power2.inOut",
          duration: 1,
          scrollTrigger: { trigger: element, start: "top 80%", once: true },
        }
      );
    });
  }
  var _lenisInstance = null;
  var _refreshTimer = null;
  function debouncedRefresh() {
    if (_refreshTimer) clearTimeout(_refreshTimer);
    _refreshTimer = setTimeout(function() {
      if (_lenisInstance) _lenisInstance.resize();
      ScrollTrigger.refresh();
    }, 200);
  }
  function constructSmoothScrollByLenis() {
    _lenisInstance = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
    });
    _lenisInstance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      _lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener("refresh", () => _lenisInstance.resize());
    // Delayed refreshes
    setTimeout(debouncedRefresh, 500);
    setTimeout(debouncedRefresh, 2000);
    setTimeout(debouncedRefresh, 4000);
    window.addEventListener('load', () => { setTimeout(debouncedRefresh, 500); });
    // Watch for lazy images — debounced to avoid thrashing
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.addEventListener('load', debouncedRefresh);
    });
  }
  function splitTextAndAnimateAll() {
    const splitTextDivs = document.querySelectorAll("[split-text]");
    splitTextDivs.forEach((div) => {
      const text = div.innerText;
      const words = text.split(" ");
      div.innerHTML = "";
      words.forEach((word) => {
        const span = document.createElement("span");
        span.innerText = word + " ";
        div.appendChild(span);
      });
      const inCeoSection = !!div.closest('.ceo, .ceos');

      if (inCeoSection) {
        // Use IntersectionObserver instead of ScrollTrigger — the milestones section
        // above grows its height dynamically as the user scrolls, making ScrollTrigger
        // positions stale and causing the animation to fire while off-screen.
        Array.from(div.children).forEach((span) => gsap.set(span, { opacity: 0.2 }));
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(div.children, { opacity: 1, stagger: 0.01, ease: "power2.inOut", duration: 0.01 });
              io.disconnect();
            }
          });
        }, { threshold: 0.15 });
        io.observe(div);
        return;
      }

      gsap.fromTo(
        div.children,
        { opacity: 0.2 },
        {
          opacity: 1,
          stagger: 0.01,
          ease: "power2.inOut",
          duration: 0.01,
          scrollTrigger: {
            trigger: div,
            start: "top 85%",
            once: true,
          },
        }
      );
    });
  }
  function initDragDealer() {
    $(".business-line-wrapper").each(function (index) {
      let siblingTrack = $(this).siblings(".businessline-track");
      let wrapperId = "wrapper" + index;
      $(this).attr("id", wrapperId);
      let trackId = "track" + index;
      siblingTrack.attr("id", trackId);
      let wrapperSlider = new Dragdealer(wrapperId, {
        handleClass: "business-line-list",
        loose: true,
        speed: 0.5,
        requestAnimationFrame: true,
        dragStopCallback(x, y) {
          handleSlider.setValue(x, 0, (snap = true));
        },
      });
      let handleSlider = new Dragdealer(trackId, {
        handleClass: "handle",
        speed: 0.5,
        requestAnimationFrame: true,
        animationCallback: function (x, y) {
          wrapperSlider.setValue(x, 0, (snap = false));
        },
      });
    });
  }
  function initChartsAnimation() {
    document.querySelectorAll(".chart-block-with-title").forEach((block) => {
      const barNumbers = block.querySelectorAll(".bar-number");
      let maxValue = 0;
      barNumbers.forEach((num) => {
        const value = parseFloat(num.textContent);
        if (value > maxValue) {
          maxValue = value;
        }
      });
      const bars = block.querySelectorAll(".chart-bar");
      bars.forEach((bar) => (bar.style.height = "0%"));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bars = block.querySelectorAll(".chart-bar");
              bars.forEach((bar) => {
                const value = parseFloat(
                  bar.querySelector(".bar-number").textContent
                );
                const percentage = (value / maxValue) * 100;
                // GSAP animation for each bar
                gsap.to(bar, {
                  height: `${percentage}%`,
                  duration: 1,
                  ease: "power1.inOut",
                  stagger: 0.2, // Stagger the animation of each bar within the block
                });
              });
              observer.unobserve(block);
            }
          });
        },
        {
          root: null, 
          rootMargin: "0px",
          threshold: 1,
        }
      );
      observer.observe(block);
    });
    document.querySelectorAll(".chart-block2").forEach((block) => {
      const barNumbers = block.querySelectorAll(".bar-number-v2");
      let maxValue = 0;
      barNumbers.forEach((num) => {
        const value = parseFloat(num.textContent);
        if (value > maxValue) {
          maxValue = value;
        }
      });
      const bars = block.querySelectorAll(".chart2-bar");
      bars.forEach((bar) => (bar.style.width = "0%"));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bars = block.querySelectorAll(".chart2-bar");
              bars.forEach((bar) => {
                const value = parseFloat(
                  bar.querySelector(".bar-number-v2").textContent
                );
                const percentage = (value / maxValue) * 100;
                // GSAP animation for each bar
                gsap.to(bar, {
                  width: `${percentage}%`,
                  duration: 1,
                  ease: "power1.inOut",
                  stagger: 0.2, // Stagger the animation of each bar within the block
                });
              });
              observer.unobserve(block);
            }
          });
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 1,
        }
      );
      observer.observe(block);
    });
  }
  function initCounter() {
    const countUpElems = document.querySelectorAll("[countup]");
    countUpElems.forEach((elem) => {
      const target = elem.innerText;
      const match = target.match(/(\d+\.?\d*)/);
      if (match) {
        const number = parseFloat(match[0].replace("bn", "").replace("+", ""));
        elem.setAttribute("countup", number.toString());
      }
    });
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const text = target.innerText;
            const match = text.match(/(\d+\.?\d*)/);
            if (match) {
              const number = parseFloat(
                match[0].replace("bn", "").replace("+", "")
              );
              animateNumber(target, number, text, match.index, match[0].length);
            }
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );
    countUpElems.forEach((elem) => {
      observer.observe(elem);
    });
    function animateNumber(
      element,
      end,
      fullText,
      startIdx,
      length,
      duration = 2000
    ) {
      let startTime = null;
      let decimalPlaces = (end.toString().split(".")[1] || []).length;
      const originalText = fullText.substring(startIdx, startIdx + length);
      if (
        originalText.includes(".") &&
        !originalText.includes("bn") &&
        decimalPlaces === 0
      ) {
        decimalPlaces = 1;
      }
      const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
      function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      }
      function updateNumber(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeProgress = easeInOutQuad(progress);
        const current = easeProgress * end;
        const displayNumber = formatter.format(current.toFixed(decimalPlaces));
        element.innerText =
          fullText.substring(0, startIdx) +
          displayNumber +
          fullText.substring(startIdx + length);
        if (elapsedTime < duration) {
          window.requestAnimationFrame(updateNumber);
        } else {
          element.innerText =
            fullText.substring(0, startIdx) +
            formatter.format(end.toFixed(decimalPlaces)) +
            fullText.substring(startIdx + length);
        }
      }
      window.requestAnimationFrame(updateNumber);
    }
  }
function createAnimatedBarChart() {
  // Get all .mini-kpi-bars elements on the page
  const miniKpiBarsContainers = document.querySelectorAll('.mini-kpi-bars');
  miniKpiBarsContainers.forEach(container => {
    // Get all .single-bar-outer-frame elements within the current .mini-kpi-bars container
    const bars = container.querySelectorAll('.single-bar-outer-frame');
    // Get the values from each .year-bar-value and parse them as numbers
    const values = Array.from(bars).map(bar => {
      return parseFloat(bar.querySelector('.year-bar-value').textContent);
    });
    // Find the highest value in the current container
    const maxValue = Math.max(...values);
    // For each bar in the current container, calculate its width as a percentage of the max value
    bars.forEach((bar, index) => {
      const value = values[index];
      const barIndicator = bar.querySelector('.bar-indicator');
      // Calculate the percentage width based on the value
      const widthPercentage = (value / maxValue) * 100;
      // Use GSAP to animate the width of the bar when the container hits 70% of the viewport height
      gsap.fromTo(barIndicator, 
        {
          width: 0, // Start with width 0%
        },
        {
          width: `${widthPercentage}%`,
          duration: 1,  // Animation duration (1 second)
          ease: "power2.out", // Animation easing
          scrollTrigger: {
            trigger: container,  // Element to trigger the animation
            start: "top 80%",    // Start when the top of the container hits 70% of the viewport
            end: "bottom 30%",   // End when the bottom of the container reaches 30% of the viewport (you can adjust this)
            markers: false,      // Set to true if you want to see the trigger points
          },
        }
      );
    });
  });
}
  function countriesSwitcher() {
    const images = document.querySelectorAll(".countryimage img");
    const paragraphs = document.querySelectorAll(".country-description p");
    const buttons = document.querySelectorAll(".countryclick");
    const desc = document.querySelector('.col6.align-end.country-description');
    function positionDesc() {
        const parentRect = desc.parentElement.getBoundingClientRect();
        const lastBtnRect = buttons[buttons.length - 1].getBoundingClientRect();
        desc.style.top = (lastBtnRect.bottom - parentRect.top + 16) + 'px';
    }
    function showCountry(country) {
        images.forEach(img => img.classList.remove("visible"));
        paragraphs.forEach(para => para.classList.remove("visible"));
        document.querySelector(`.countryimage img[data-country='${country}']`).classList.add("visible");
        document.querySelector(`.country-description p[data-country='${country}']`).classList.add("visible");
        buttons.forEach(btn => btn.classList.remove("active"));
        document.querySelector(`.countryclick[data-country='${country}']`).classList.add("active");
    }
    // Set position once, then only on resize
    positionDesc();
    window.addEventListener("resize", positionDesc);
    // Set default view to Bahrain
    showCountry("bahrain");
    // Add click event listener to buttons
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            showCountry(this.getAttribute("data-country"));
        });
    });
  }
  var Webflow = Webflow || [];
  // Force async decode of CEO background image to prevent scroll jank
  (function() {
    var ceoImg = new Image();
    ceoImg.src = 'images/NAJLA-NEW-PIC-TO-USE-extended-copy.jpg';
    if (ceoImg.decode) ceoImg.decode().catch(function() {});
  })();

  var Webflow = Webflow || [];
  function initMilestonesTimeline() {
    var inner = document.querySelector('.milestones-timeline-inner');
    var container = document.querySelector('.milestones-timeline-container');
    if (!inner || !container) return;

    // Set the starting clip-path (reveal top-to-bottom) and collapse container
    inner.style.clipPath = 'inset(0 0 100% 0)';
    inner.style.opacity = '1';
    gsap.set(container, { height: 0, overflow: 'hidden', padding: 0 });

    function startAnimation() {
      var fullHeight = inner.scrollHeight;
      if (fullHeight < 100) {
        // Images not loaded yet — retry
        setTimeout(startAnimation, 150);
        return;
      }

      // Sync container height + clip-path reveal in one scrubbed timeline.
      // Both run at ease:'none' so the container height always matches the
      // visible (unclipped) portion of the images — zero dead space below.
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.closest('section') || container.parentElement,
          start: 'top 65%',
          end: '+=' + Math.round(fullHeight * 0.9),
          scrub: 0.8,
        }
      });

      tl.fromTo(
        inner,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', ease: 'none' },
        0
      );
      tl.fromTo(
        container,
        { height: 0 },
        { height: fullHeight, ease: 'none' },
        0
      );
    }

    // Start once images have their natural dimensions.
    // Two rAF frames after the last image fires let the browser finish
    // computing the SVG's aspect-ratio-based height before we measure
    // inner.scrollHeight — otherwise the SVG's contribution can be missing.
    function scheduleStart() {
      requestAnimationFrame(function () {
        requestAnimationFrame(startAnimation);
      });
    }

    var imgs = Array.from(inner.querySelectorAll('img'));
    var pending = imgs.filter(function (img) { return !img.complete; });
    if (pending.length === 0) {
      scheduleStart();
    } else {
      var loaded = 0;
      pending.forEach(function (img) {
        function onDone() { if (++loaded === pending.length) scheduleStart(); }
        img.addEventListener('load', onDone);
        img.addEventListener('error', onDone);
      });
    }
  }

  function initESGCirclesAnimation() {
    var circles = document.querySelectorAll('.env-vertical-col');
    var isMobile = window.innerWidth < 768;

    circles.forEach(function(circle, index) {
      var heading = circle.querySelector('h4');
      var textDiv = circle.querySelector('div[split-text]');

      // Effect B: pre-hide text on mobile so it can fade up after circle enters
      if (isMobile) {
        if (heading) gsap.set(heading, { opacity: 0, y: 22 });
        if (textDiv)  gsap.set(textDiv,  { opacity: 0, y: 22 });
      }

      gsap.fromTo(circle,
        { scale: 0.6, opacity: 0, y: 40 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.15,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: circle,
            start: 'top 85%',
            once: true,
          },
          onComplete: function() {
            if (!isMobile) return;

            // Effect B: fade up heading then description, slow and noticeable
            if (heading) gsap.to(heading, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' });
            if (textDiv)  gsap.to(textDiv,  { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.35 });

            // Effect C: each box glows independently after its own text finishes
            gsap.to(circle, {
              boxShadow: '0 0 20px 5px rgba(44, 186, 236, 0.35)',
              borderColor: '#2cbaec',
              duration: 0.6,
              delay: 1.3,
              ease: 'power2.out'
            });
          }
        }
      );
    });
  }

  function initHeroAnimation() {
    var tl = gsap.timeline({ delay: 0.9 });
    var heroLogo = document.querySelector('.hero-banner .logo') || document.querySelector('.logo');
    var heroTitle = document.querySelector('._2024-annual-report');
    var heroBtn = document.querySelector('.hero-banner .button-white-contained');
    var heroDeco = document.querySelector('.hero-decoration');
    var scrollCta = document.querySelector('.cta-scroll-frame');

    if (heroLogo) {
      gsap.set(heroLogo, { opacity: 0, scale: 0.82, transformOrigin: 'center center' });
      tl.to(heroLogo, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' });
    }
    if (heroTitle) {
      gsap.set(heroTitle, { opacity: 0, y: 60 });
      tl.to(heroTitle, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.5');
    }
    if (heroBtn) {
      gsap.set(heroBtn, { opacity: 0, y: 30 });
      tl.to(heroBtn, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.5');
    }
    if (heroDeco) {
      gsap.set(heroDeco, { opacity: 0, scale: 1.1 });
      tl.to(heroDeco, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, '-=0.6');
    }
    if (scrollCta) {
      gsap.set(scrollCta, { opacity: 0, y: 20 });
      tl.to(scrollCta, { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3');
    }
  }

  function initParallaxEffects() {
    if (window.innerWidth < 768) return;
    var parallaxItems = [
      { sel: '.hero-decoration', yRange: [-30, 30] },
      { sel: '.fh-decoration', yRange: [-40, 40] },
      { sel: '.sustainability-decoration-left', yRange: [-25, 25] },
      { sel: '.sustainability-decoration-right', yRange: [-20, 20] },
      { sel: '.tabdecoration', yRange: [-30, 30] },
    ];
    parallaxItems.forEach(function(item) {
      var el = document.querySelector(item.sel);
      if (!el) return;
      gsap.fromTo(el,
        { y: item.yRange[0] },
        {
          y: item.yRange[1],
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('.section') || el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          }
        }
      );
    });
  }

  function positionTabDecoration() {
    var img = document.querySelector('.image-3');
    var tabsContent = document.querySelector('.tabs-content.w-tab-content');
    if (!img || !tabsContent) return;

    // Move image inside tabs-content if not already there
    if (img.parentElement !== tabsContent) {
      tabsContent.appendChild(img);
    }

    // Make tabs-content the positioning context
    tabsContent.style.position = 'relative';
    tabsContent.style.overflow = 'hidden';

    // Fill the full height of the container, anchored to the right
    img.style.position     = 'absolute';
    img.style.top          = '0';
    img.style.bottom       = '0';
    img.style.right        = '0';
    img.style.left         = 'auto';
    img.style.height       = '100%';
    img.style.width        = 'auto';  // 1:1 ratio — width follows height
    img.style.objectFit    = 'cover';
    img.style.pointerEvents = 'none';
  }

  function fixTabsContentHeight(callback) {
    var tabsContent = document.querySelector('.tabs-content');
    var tabs = document.querySelectorAll('.w-tab-link');
    if (!tabsContent || !tabs.length) { if (callback) callback(); return; }

    function measure() {
      var maxHeight = 0;
      var originalTab = document.querySelector('.w-tab-link.w--current');

      tabs.forEach(function(tab) {
        tab.click();
        var activePane = tabsContent.querySelector('.w-tab-pane.w--tab-active');
        if (activePane) {
          maxHeight = Math.max(maxHeight, activePane.offsetHeight);
        }
      });

      if (originalTab) originalTab.click();
      tabsContent.style.minHeight = Math.ceil(maxHeight * 1.05) + 'px';
      if (callback) callback();
    }

    if (document.readyState === 'complete') {
      measure();
    } else {
      window.addEventListener('load', measure);
    }
  }

  function initOperationalReviewAnimations() {
    var section = document.querySelector('.business-lines-tabs');
    if (!section) return;
    var wrapper = section.closest('.section') || section.closest('[class*="operational"]') || section.parentElement;

    // Animate tab links with staggered fade-in from left
    var tabLinks = section.querySelectorAll('.tab-link');
    gsap.fromTo(tabLinks,
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true }
      }
    );

    // Animate active tab content with fade-in-up
    var tabContent = section.querySelector('.tabs-content');
    if (tabContent) {
      gsap.fromTo(tabContent,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: tabContent, start: 'top 85%', once: true }
        }
      );
    }

    // Animate any images in the tab area
    var tabImages = section.querySelectorAll('.tab-content-flex img, .tab-content-flex .w-richtext');
    gsap.fromTo(tabImages,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1, scale: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true }
      }
    );

    // Animate the tab decoration/side image
    var sideImage = wrapper ? wrapper.querySelector('.tab-side-image, [class*="tab-decoration"], .tabdecoration') : null;
    if (sideImage) {
      gsap.fromTo(sideImage,
        { opacity: 0, x: 60 },
        {
          opacity: 1, x: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: sideImage, start: 'top 85%', once: true }
        }
      );
    }
  }

  function initMilestonesReveal() {
    // The .milestones-timeline-inner / -container elements don't exist in the
    // HTML — the SICO at 30 images are bare <img> direct children of
    // .section.creating-value-section. Animate them with a scrubbed clip-path
    // so the reveal plays forward on scroll-down AND reverses on scroll-up.
    //
    // Mobile guard: clip-path keeps the element in layout flow, so on mobile
    // the invisible (fully-clipped) image reads as a blank white section while
    // scrolling back up. Skip on mobile — images are naturally visible there.
    if (window.innerWidth < 768) return;

    var milestoneImgs = document.querySelectorAll('.section.creating-value-section > img');
    milestoneImgs.forEach(function(img) {
      gsap.fromTo(img,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top 90%',
            end: 'top 10%',
            scrub: 1.2,
          }
        }
      );
    });
  }

  function initHeroMouseParallax() {
    var hero = document.querySelector('.hero-banner');
    var deco = hero && hero.querySelector('.hero-decoration');
    if (!hero || !deco) return;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var dx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      var dy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      deco.style.transform = 'translate(' + (dx * 8) + 'px, ' + (dy * 6) + 'px)';
    });

    hero.addEventListener('mouseleave', function () {
      deco.style.transform = '';
    });
  }

  function initESGMouseParallax() {
    var section = document.querySelector('.section.sustainbility-new-section');
    if (!section) return;
    var decorLeft  = section.querySelector('.sustainability-decoration-left');
    var decorRight = section.querySelector('.sustainability-decoration-right');
    if (!decorLeft && !decorRight) return;

    section.addEventListener('mousemove', function (e) {
      var rect = section.getBoundingClientRect();
      // Normalise mouse position: -1 (left/top) to +1 (right/bottom)
      var dx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      var dy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);

      if (decorLeft)  decorLeft.style.transform  = 'translate(' + (dx * -14) + 'px, ' + (dy * -10) + 'px)';
      if (decorRight) decorRight.style.transform = 'translate(' + (dx *  10) + 'px, ' + (dy *   7) + 'px)';
    });

    section.addEventListener('mouseleave', function () {
      if (decorLeft)  decorLeft.style.transform  = '';
      if (decorRight) decorRight.style.transform = '';
    });
  }

  function initAnchorScroll() {
    // Lenis takes over scrolling and overwrites any native hash-jump on the
    // next tick, so anchor links ("Read more" -> #at-a-glance, "Back to top")
    // need to be routed through lenis.scrollTo() explicitly.
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var hash = link.getAttribute('href');
      e.preventDefault();

      if (hash === '#' || hash === '') {
        if (_lenisInstance) _lenisInstance.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      var target = document.querySelector(hash);
      if (!target) return;

      history.pushState(null, '', hash);
      if (_lenisInstance) _lenisInstance.scrollTo(target, { duration: 1.2 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  Webflow.push(function () {
    gsap.registerPlugin(ScrollTrigger);
    constructSmoothScrollByLenis();
    initAnchorScroll();
    initCounter();
    createAnimatedBarChart();
    countriesSwitcher();
    animateRevealImages();
    // On mobile only: replace the hard <br> in the "Who We Are" .p-lg subtitle
    // with a space BEFORE splitTextAndAnimateAll reads innerText.
    // On desktop the break is intentional — it keeps the subtitle in the designed
    // 2-line layout within the fixed-height .regional-footprint section.
    // On mobile the break re-injects as a DOM <br> inside the generated span,
    // visually separating "Driving" from "Growth" with a blank line.
    // Scope to [split-text].p-lg only — other headings with <br> are left alone.
    if (window.innerWidth < 768) {
      document.querySelectorAll('[split-text].p-lg br').forEach(function(br) {
        br.replaceWith(document.createTextNode(' '));
      });
    }
    splitTextAndAnimateAll();
    initDragDealer();
    initChartsAnimation();
    initMilestonesTimeline();
    initMilestonesReveal();
    initESGCirclesAnimation();
    initOperationalReviewAnimations();
    initHeroAnimation();
    fixTabsContentHeight(positionTabDecoration);
    var _tabsResizeTimer = null;
    window.addEventListener('resize', function() {
      clearTimeout(_tabsResizeTimer);
      _tabsResizeTimer = setTimeout(function() {
        fixTabsContentHeight(positionTabDecoration);
      }, 200);
    });
    initParallaxEffects();
    initHeroMouseParallax();
    initESGMouseParallax();
  });

