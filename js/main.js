// Wrap everything in an IIFE (Immediately Invoked Function Expression) 
// to avoid variable conflicts with inline scripts
(function() {
  'use strict';
  
  const API_BASE = 'php/api';

  // ====== Menu Toggle Logic ======
  const menuBtn = document.querySelector(".menu");
  const landingText = document.querySelector(".landing-text");
  const landingPic = document.querySelector(".landing-pic");
  const menu = document.querySelector(".main-menu");
  
  if (menuBtn && landingText && landingPic && menu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle("cancel");
      landingText.classList.toggle('active');
      landingPic.classList.toggle('active');
      menu.classList.toggle('active');
    });
  }

  // ====== Progress Tracker (Section Navigation Dots) ======
  const trackerDots = document.querySelectorAll('.tracker-dot');
  
  // Define the main sections to track (in order)
  const mainSectionIds = ['landingPage', 'about-us', 'our-agencies', 'portfolios', 'Contact'];

  function updateProgressTracker() {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let activeSectionId = null;

      // Check each main section
      mainSectionIds.forEach((sectionId) => {
          const section = document.getElementById(sectionId);
          if (section) {
              const sectionTop = section.offsetTop;
              const sectionBottom = sectionTop + section.offsetHeight;

              if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                  activeSectionId = sectionId;
              }
          }
      });

      // Update tracker dots based on active section
      if (activeSectionId) {
          trackerDots.forEach(dot => {
              const dotSectionId = dot.getAttribute('data-section');
              if (dotSectionId === activeSectionId) {
                  dot.classList.add('active');
              } else {
                  dot.classList.remove('active');
              }
          });
      }
  }

  // Click tracker dots to navigate
  trackerDots.forEach((dot) => {
      dot.addEventListener('click', () => {
          const sectionId = dot.getAttribute('data-section');
          const section = document.getElementById(sectionId);
          if (section) {
              section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      });
  });

  // Update on scroll
  window.addEventListener('scroll', updateProgressTracker, { passive: true });
  updateProgressTracker();

  // ====== Footer Navigation - Smooth scroll to sections ======
  const footerLinks = document.querySelectorAll(".footer-nav a");
  footerLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
          const href = link.getAttribute("href");
          // Only handle anchor links (starting with #)
          if (href && href.startsWith("#")) {
              e.preventDefault();
              const targetId = href.substring(1);
              const targetSection = document.getElementById(targetId);
              if (targetSection) {
                  targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
              }
          }
          // For non-anchor links, let the browser handle it normally
      });
  });

})(); // End of IIFE - all variables are now scoped and won't conflict