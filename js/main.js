/**
 * N Farms — Core Frontend Engine
 * File: js/main.js
 * Production-ready, zero-dependency ES6+ implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Mobile Navigation Toggle & Dismissal
     -------------------------------------------------------------------------- */
  const initMobileNav = () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!navToggle || !navMenu) return;

    const toggleNav = (forceState) => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      const shouldOpen = typeof forceState === 'boolean' ? forceState : !isExpanded;

      navToggle.setAttribute('aria-expanded', String(shouldOpen));
      navMenu.classList.toggle('is-open', shouldOpen);

      if (shouldOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.removeProperty('overflow');
      }
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNav();
    });

    // Close menu when a navigation link is clicked
    navMenu.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => toggleNav(false));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        toggleNav(false);
      }
    });

    // Close menu on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        toggleNav(false);
        navToggle.focus();
      }
    });
  };

  /* --------------------------------------------------------------------------
     2. Active Route Navigation Sync
     -------------------------------------------------------------------------- */
  const initActiveRouteSync = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    let currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.split('/').pop();

      if (linkPath === currentPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('is-active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('is-active');
      }
    });
  };

  /* --------------------------------------------------------------------------
     3. Navbar Scroll Elevation
     -------------------------------------------------------------------------- */
  const initNavbarElevation = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const threshold = 20;

    const handleScroll = () => {
      if (window.scrollY > threshold) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Execute once on mount to capture reloaded scroll positions
  };

  /* --------------------------------------------------------------------------
     4. Drop Alert Form Validation & Inline Feedback
     -------------------------------------------------------------------------- */
  const initDropAlertForm = () => {
    const dropForm = document.querySelector('form[action=""], form:not([action])') || 
                     document.querySelector('#restock-form');

    if (!dropForm) return;

    const input = dropForm.querySelector('input[type="text"], input[type="email"], input[type="tel"]');
    if (!input) return;

    const validateContact = (val) => {
      const cleaned = val.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Permissive phone check supporting international formats: +234..., 080..., 10-15 digits
      const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;
      return emailPattern.test(cleaned) || phonePattern.test(cleaned);
    };

    dropForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const rawValue = input.value.trim();

      if (!validateContact(rawValue)) {
        input.style.borderColor = 'var(--accent-warm)';
        input.focus();
        return;
      }

      // Preserve container height during the transition
      const formContainer = dropForm.parentElement;
      const initialHeight = dropForm.offsetHeight;
      dropForm.style.minHeight = `${initialHeight}px`;

      // Render sleek inline success card
      dropForm.innerHTML = `
        <div style="
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.25rem 1.5rem;
          background-color: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: var(--radius-sm);
          animation: fadeIn 300ms ease-out forwards;
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="status-dot" style="color: var(--accent-green);"></span>
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--accent-green); letter-spacing: 0.02em;">
              Priority Allocated
            </span>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-primary); margin: 0; text-align: center;">
            You're on the priority drop list. Expect notification upon next harvest.
          </p>
        </div>
      `;
    });

    // Reset error styling on active keystroke
    input.addEventListener('input', () => {
      input.style.borderColor = 'var(--border)';
    });
  };

  /* --------------------------------------------------------------------------
     Bootstrap Application Modules
     -------------------------------------------------------------------------- */
  initMobileNav();
  initActiveRouteSync();
  initNavbarElevation();
  initDropAlertForm();
});