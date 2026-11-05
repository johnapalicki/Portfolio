/* ==========================================================================
   Portfolio behavior: theme toggle, mobile menu, project filter,
   scroll reveal, active nav link. Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  var themeLabel = themeBtn ? themeBtn.querySelector('.theme-label') : null;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      var isDark = theme === 'dark';
      themeBtn.setAttribute('aria-pressed', String(isDark));
      if (themeLabel) themeLabel.textContent = isDark ? 'Light mode' : 'Dark mode';
    }
  }

  // The inline script in <head> already set data-theme; sync the button to it.
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable: ignore */ }
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a link
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Escape closes the menu and returns focus to the button
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---------- Project filtering ---------- */
  var filterButtons = document.querySelectorAll('.chip-btn');
  var cards = document.querySelectorAll('#project-grid .card');
  var status = document.getElementById('filter-status');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      var shown = 0;

      filterButtons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(' ');
        var match = filter === 'all' || tags.indexOf(filter) !== -1;
        card.hidden = !match;
        if (match) {
          shown += 1;
          card.classList.add('is-visible'); // never leave a filtered-in card faded out
        }
      });

      // Announce the result to screen readers
      if (status) {
        status.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects') +
          (filter === 'all' ? '.' : ' tagged ' + btn.textContent + '.');
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Highlight the nav link for the section in view ---------- */
  var navLinks = document.querySelectorAll('.site-nav a');
  var sections = [];
  navLinks.forEach(function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ link: link, el: target });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (s) {
          if (s.el === entry.target) s.link.setAttribute('aria-current', 'true');
          else s.link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s.el); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
