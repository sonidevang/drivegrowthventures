/* ============================================
   Drive Growth Ventures: interactivity layer
   ============================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---- Theme toggle -------------------------------------------------- */
  var themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('dgv-theme', next); } catch (e) {}
    });
  }

  /* ---- Mobile nav menu ----------------------------------------------- */
  var menuToggle = $('#menuToggle');
  var navLinks = $('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('nav-open');
    });
    $$('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { navLinks.classList.remove('nav-open'); });
    });
  }

  /* ---- Scroll progress bar + header shadow + back-to-top ------------- */
  var progress = $('.scroll-progress');
  var header = $('header');
  var backToTop = $('.back-to-top');

  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
    if (header) header.classList.toggle('is-scrolled', scrollTop > 8);
    if (backToTop) backToTop.classList.toggle('visible', scrollTop > 480);
    updateParallax(scrollTop);
    updateScrollSpy(scrollTop);
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---- Parallax on photo bands --------------------------------------- */
  var parallaxEls = $$('[data-parallax]');
  function updateParallax(scrollTop) {
    if (reduceMotion) return;
    parallaxEls.forEach(function (el) {
      var band = el.parentElement;
      var rect = band.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var offset = (rect.top - window.innerHeight) * 0.08;
      el.style.transform = 'translateY(' + offset.toFixed(1) + 'px) scale(1.08)';
    });
  }

  /* ---- Scrollspy: highlight the nav link for the section in view ----- */
  var spyLinks = $$('.nav-links a').filter(function (a) {
    return (a.getAttribute('href') || '').indexOf('#') !== -1;
  });
  var spyTargets = spyLinks.map(function (a) {
    var href = a.getAttribute('href');
    var id = href.slice(href.indexOf('#') + 1);
    return { link: a, el: id ? document.getElementById(id) : null };
  }).filter(function (t) { return t.el; });

  function updateScrollSpy(scrollTop) {
    if (!spyTargets.length) return;
    var current = null;
    var probe = scrollTop + 140;
    spyTargets.forEach(function (t) {
      if (t.el.offsetTop <= probe) current = t;
    });
    spyLinks.forEach(function (a) { a.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }

  /* ---- Reveal on scroll (.fade-in and .stagger-grid) ----------------- */
  var revealEls = $$('.fade-in, .stagger-grid');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.hasAttribute('data-count-host') || $('[data-count-to]', entry.target)) {
            animateCounters(entry.target);
          }
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Animated stat counters ---------------------------------------- */
  function animateCounters(scope) {
    $$('[data-count-to]', scope).forEach(function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      var target = parseFloat(el.getAttribute('data-count-to'));
      if (isNaN(target)) return;
      if (reduceMotion) { el.textContent = target; return; }
      var dur = 1100, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
  // Hero counters are visible on load, so kick them off immediately.
  var hero = $('.hero');
  if (hero) animateCounters(hero);

  /* ---- Cursor-reactive tilt on cards --------------------------------- */
  var supportsHover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  if (supportsHover && !reduceMotion) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilt-hover');
        card.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('tilt-hover');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- Hero cursor-follow glow --------------------------------------- */
  if (hero && supportsHover && !reduceMotion) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    });
  }

  /* ---- Wire up scroll + initial paint -------------------------------- */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', function () { onScroll(); }, { passive: true });
  onScroll();
})();
