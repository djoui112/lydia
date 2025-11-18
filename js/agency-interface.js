// Smooth scrolling and interactive enhancements
document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mobileOverlay = document.querySelector(".mobile-overlay");

  if (mobileMenuToggle && sidebar && mobileOverlay) {
    function toggleMobileMenu() {
      sidebar.classList.toggle("mobile-open");
      mobileOverlay.classList.toggle("active");
      document.body.style.overflow = sidebar.classList.contains("mobile-open")
        ? "hidden"
        : "";
    }

    function closeMobileMenu() {
      sidebar.classList.remove("mobile-open");
      mobileOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    mobileMenuToggle.addEventListener("click", toggleMobileMenu);
    mobileOverlay.addEventListener("click", closeMobileMenu);

    // Close menu when clicking on a nav icon (on mobile)
    const navIcons = document.querySelectorAll(".nav-icon");
    navIcons.forEach((icon) => {
      icon.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
          closeMobileMenu();
        }
      });
    });

    // Close menu on window resize if it becomes desktop size
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    });
  }

  // Add hover effects to navigation icons
  const navIcons = document.querySelectorAll(".nav-icon");
  navIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", function () {
      if (!this.classList.contains("active")) {
        this.style.backgroundColor = "#F0F0F0";
      }
    });
    icon.addEventListener("mouseleave", function () {
      if (!this.classList.contains("active")) {
        this.style.backgroundColor = "transparent";
      }
    });
  });

  // Scroll-based active state for sidebar navigation
  const sections = document.querySelectorAll("section[id]");
  const navIconsWithSections = document.querySelectorAll(
    ".nav-icon[data-section]"
  );

  function updateActiveNav() {
    const scrollPosition = window.scrollY + 150; // Offset for better detection

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        // Remove active from all nav icons
        navIconsWithSections.forEach((icon) => {
          icon.classList.remove("active");
        });

        // Add active to matching nav icons
        navIconsWithSections.forEach((icon) => {
          if (icon.getAttribute("data-section") === sectionId) {
            icon.classList.add("active");
          }
        });
      }
    });

    // If at the top of the page, activate data-section icons
    if (window.scrollY < 100) {
      navIconsWithSections.forEach((icon) => {
        icon.classList.remove("active");
        if (icon.getAttribute("data-section") === "data-section") {
          icon.classList.add("active");
        }
      });
    }
  }

  // Update on scroll
  window.addEventListener("scroll", updateActiveNav);
  // Update on page load
  updateActiveNav();

  // Add click handlers for navigation icons (scroll to section)
  navIconsWithSections.forEach((icon) => {
    icon.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section");
      const targetSection = document.getElementById(sectionId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Button interactions
  const buttons = document.querySelectorAll(".btn-see-more, .btn-view-project");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      // Add ripple effect
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Horizontal Carousel Slider
  const carouselTrack = document.getElementById("carouselTrack");
  const carouselPrev = document.getElementById("carouselPrev");
  const carouselNext = document.getElementById("carouselNext");

  if (carouselTrack && carouselPrev && carouselNext) {
    let scrollPosition = 0;
    const scrollAmount = 320; // card width + gap

    carouselNext.addEventListener("click", () => {
      scrollPosition = Math.min(
        scrollPosition + scrollAmount,
        carouselTrack.scrollWidth - carouselTrack.clientWidth
      );
      smoothScroll(carouselTrack, scrollPosition);
    });

    carouselPrev.addEventListener("click", () => {
      scrollPosition = Math.max(0, scrollPosition - scrollAmount);
      smoothScroll(carouselTrack, scrollPosition);
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    carouselTrack.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(carouselTrack);
      },
      { passive: true }
    );

    function handleSwipe(element) {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next
          scrollPosition = Math.min(
            scrollPosition + scrollAmount,
            element.scrollWidth - element.clientWidth
          );
        } else {
          // Swipe right - previous
          scrollPosition = Math.max(0, scrollPosition - scrollAmount);
        }
        smoothScroll(element, scrollPosition);
      }
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (
        document.activeElement === carouselTrack ||
        carouselTrack.contains(document.activeElement)
      ) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollPosition = Math.max(0, scrollPosition - scrollAmount);
          smoothScroll(carouselTrack, scrollPosition);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollPosition = Math.min(
            scrollPosition + scrollAmount,
            carouselTrack.scrollWidth - carouselTrack.clientWidth
          );
          smoothScroll(carouselTrack, scrollPosition);
        }
      }
    });
  }

  // Vertical Project Card Stack - Click to bring to top with smooth animation
  // Link "view project" buttons to project management page
  const viewProjectButtons = document.querySelectorAll(".btn-view-project");
  viewProjectButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card click event
      window.location.href = "projectmanagement.html";
    });
  });

  const projectSliderTrack = document.getElementById("projectSliderTrack");

  if (projectSliderTrack) {
    const cards = projectSliderTrack.querySelectorAll(".project-slider-card");

    // Initialize: Set first card as active
    let currentActiveCard = cards.length > 0 ? cards[0] : null;
    if (currentActiveCard) {
      currentActiveCard.classList.add("active");
    }

    // Function to bring a card to the top with smooth animation
    function bringCardToTop(card) {
      // Remove active from all cards with smooth transition
      cards.forEach((c) => {
        if (c !== card && c.classList.contains("active")) {
          c.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          c.classList.remove("active");
        }
      });

      // Reorder cards: move card to the front of the DOM
      projectSliderTrack.insertBefore(card, projectSliderTrack.firstChild);

      // Activate the card with smooth sliding animation
      setTimeout(() => {
        card.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        card.classList.add("active");
        currentActiveCard = card;

        // Reset transition after animation
        setTimeout(() => {
          card.style.transition = "";
          // Reset transitions for other cards too
          cards.forEach((c) => {
            if (c !== card) {
              c.style.transition = "";
            }
          });
        }, 800);
      }, 50);
    }

    // Function to get next card in sequence
    function getNextCard() {
      const allCards = Array.from(
        projectSliderTrack.querySelectorAll(".project-slider-card")
      );
      const currentIndex = allCards.indexOf(currentActiveCard);

      // Get the next card (wrap around to first if at end)
      if (currentIndex < allCards.length - 1) {
        return allCards[currentIndex + 1];
      } else {
        return allCards[0];
      }
    }

    // Click handler for cards
    projectSliderTrack.addEventListener("click", function (e) {
      const card = e.target.closest(".project-slider-card");

      // Don't trigger if clicking on the button
      if (!card || e.target.closest(".btn-view-project")) {
        return;
      }

      // If clicking on active card, advance to next card
      if (card.classList.contains("active")) {
        const nextCard = getNextCard();
        if (nextCard && nextCard !== currentActiveCard) {
          bringCardToTop(nextCard);
        }
      } else {
        // If clicking on inactive card, bring it to top
        bringCardToTop(card);
      }
    });

    // Touch swipe support for mobile project cards (horizontal on mobile, vertical on desktop)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    projectSliderTrack.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    projectSliderTrack.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Vertical swipe for both mobile and desktop
        if (
          Math.abs(diffY) > swipeThreshold &&
          Math.abs(diffY) > Math.abs(diffX)
        ) {
          if (diffY > 0) {
            // Swipe up - next card
            const nextCard = getNextCard();
            if (nextCard && nextCard !== currentActiveCard) {
              bringCardToTop(nextCard);
              // Scroll to card on mobile
              if (window.innerWidth <= 768) {
                nextCard.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
          } else {
            // Swipe down - previous card
            const allCards = Array.from(
              projectSliderTrack.querySelectorAll(".project-slider-card")
            );
            const currentIndex = allCards.indexOf(currentActiveCard);
            const prevCard =
              currentIndex > 0
                ? allCards[currentIndex - 1]
                : allCards[allCards.length - 1];
            if (prevCard && prevCard !== currentActiveCard) {
              bringCardToTop(prevCard);
              // Scroll to card on mobile
              if (window.innerWidth <= 768) {
                prevCard.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
          }
        }
      },
      { passive: true }
    );
  }

  // Footer Navigation - Smooth scroll to sections
  const footerLinks = document.querySelectorAll(".footer-nav a");
  footerLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Smooth scroll function using requestAnimationFrame
  function smoothScroll(element, targetPosition) {
    const startPosition = element.scrollLeft;
    const distance = targetPosition - startPosition;
    const duration = 500; // milliseconds
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);

      // Easing function (ease-in-out)
      const ease =
        percentage < 0.5
          ? 2 * percentage * percentage
          : 1 - Math.pow(-2 * percentage + 2, 2) / 2;

      element.scrollLeft = startPosition + distance * ease;

      if (progress < duration) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // Add loading animation for images
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("load", function () {
      this.style.opacity = "1";
    });

    // Set initial opacity
    img.style.opacity = "0";
    img.style.transition = "opacity 0.3s ease";

    // If image is already loaded
    if (img.complete) {
      img.style.opacity = "1";
    }
  });

  // Calendar functionality - Reused from agency.js
  const calendarContainer = document.querySelector(".calendar-container");
  if (calendarContainer) {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Load deadlines from localStorage or use default sample data
    let deadlines = JSON.parse(localStorage.getItem("calendarDeadlines")) || {
      2026: {
        2: {
          23: {
            title: "Project Review",
            description: "Review project progress",
            time: "",
          },
          25: {
            title: "Client Meeting",
            description: "Discuss new requirements",
            time: "14:00",
          },
          28: {
            title: "Deadline Submission",
            description: "Submit final documents",
            time: "17:00",
          },
        },
      },
    };

    // Save deadlines to localStorage
    function saveDeadlines() {
      localStorage.setItem("calendarDeadlines", JSON.stringify(deadlines));
    }

    function getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(month, year) {
      return new Date(year, month, 1).getDay();
    }

    function isToday(day, month, year) {
      const today = new Date();
      return (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      );
    }

    function hasDeadline(day, month, year) {
      if (
        deadlines[year] &&
        deadlines[year][month] &&
        deadlines[year][month][day]
      ) {
        return deadlines[year][month][day];
      }
      return null;
    }

    function getDeadline(day, month, year) {
      if (
        deadlines[year] &&
        deadlines[year][month] &&
        deadlines[year][month][day]
      ) {
        return deadlines[year][month][day];
      }
      return null;
    }

    function setDeadline(day, month, year, deadlineData) {
      if (!deadlines[year]) {
        deadlines[year] = {};
      }
      if (!deadlines[year][month]) {
        deadlines[year][month] = {};
      }
      deadlines[year][month][day] = deadlineData;
      saveDeadlines();
    }

    function deleteDeadline(day, month, year) {
      if (
        deadlines[year] &&
        deadlines[year][month] &&
        deadlines[year][month][day]
      ) {
        delete deadlines[year][month][day];
        // Clean up empty objects
        if (Object.keys(deadlines[year][month]).length === 0) {
          delete deadlines[year][month];
        }
        if (Object.keys(deadlines[year]).length === 0) {
          delete deadlines[year];
        }
        saveDeadlines();
      }
    }

    function renderCalendar() {
      const monthNameEl = calendarContainer.querySelector(".month-name");
      const yearEl = calendarContainer.querySelector(".year");
      const daysContainer = calendarContainer.querySelector(".calendar-days");

      monthNameEl.textContent = monthNames[currentMonth];
      yearEl.textContent = currentYear;

      const daysInMonth = getDaysInMonth(currentMonth, currentYear);
      const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

      daysContainer.innerHTML = "";

      // Empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "calendar-day empty";
        daysContainer.appendChild(emptyDay);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement("div");
        dayEl.className = "calendar-day";
        dayEl.textContent = day;

        if (isToday(day, currentMonth, currentYear)) {
          dayEl.classList.add("today");
        }

        const deadline = hasDeadline(day, currentMonth, currentYear);
        if (deadline) {
          dayEl.classList.add("deadline");
          dayEl.title = deadline.title || "Deadline";
        }

        dayEl.addEventListener("click", () => {
          openDeadlineModal(day, currentMonth, currentYear);
        });

        daysContainer.appendChild(dayEl);
      }
    }

    // Modal functionality
    const modal = document.getElementById("deadlineModal");
    const modalTitle = modal.querySelector(".modal-title");
    const deadlineDateInput = document.getElementById("deadlineDate");
    const deadlineTitleInput = document.getElementById("deadlineTitle");
    const deadlineDescriptionInput = document.getElementById(
      "deadlineDescription"
    );
    const deadlineTimeInput = document.getElementById("deadlineTime");
    const deleteBtn = document.getElementById("deleteDeadline");
    const saveBtn = document.querySelector(".btn-save");
    const cancelBtn = document.querySelector(".btn-cancel");
    const closeBtn = modal.querySelector(".modal-close");
    const overlay = modal.querySelector(".modal-overlay");

    let selectedDay = null;
    let selectedMonth = null;
    let selectedYear = null;

    function openDeadlineModal(day, month, year) {
      selectedDay = day;
      selectedMonth = month;
      selectedYear = year;

      const dateString = `${monthNames[month]} ${day}, ${year}`;
      deadlineDateInput.value = dateString;

      const existingDeadline = getDeadline(day, month, year);
      if (existingDeadline) {
        modalTitle.textContent = "Edit Deadline";
        deadlineTitleInput.value = existingDeadline.title || "";
        deadlineDescriptionInput.value = existingDeadline.description || "";
        deadlineTimeInput.value = existingDeadline.time || "";
        deleteBtn.style.display = "block";
      } else {
        modalTitle.textContent = "Add Deadline";
        deadlineTitleInput.value = "";
        deadlineDescriptionInput.value = "";
        deadlineTimeInput.value = "";
        deleteBtn.style.display = "none";
      }

      modal.classList.add("active");
      deadlineTitleInput.focus();
    }

    function closeDeadlineModal() {
      modal.classList.remove("active");
      selectedDay = null;
      selectedMonth = null;
      selectedYear = null;
    }

    saveBtn.addEventListener("click", () => {
      const title = deadlineTitleInput.value.trim();
      if (!title) {
        alert("Please enter a deadline title");
        deadlineTitleInput.focus();
        return;
      }

      const deadlineData = {
        title: title,
        description: deadlineDescriptionInput.value.trim(),
        time: deadlineTimeInput.value,
      };

      setDeadline(selectedDay, selectedMonth, selectedYear, deadlineData);
      renderCalendar();
      closeDeadlineModal();
    });

    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this deadline?")) {
        deleteDeadline(selectedDay, selectedMonth, selectedYear);
        renderCalendar();
        closeDeadlineModal();
      }
    });

    cancelBtn.addEventListener("click", closeDeadlineModal);
    closeBtn.addEventListener("click", closeDeadlineModal);
    overlay.addEventListener("click", closeDeadlineModal);

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        closeDeadlineModal();
      }
    });

    // Navigation buttons
    const prevBtn = calendarContainer.querySelector(".prev-month");
    const nextBtn = calendarContainer.querySelector(".next-month");

    prevBtn.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });

    nextBtn.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });

    // Initialize calendar
    renderCalendar();
  }

  // Card hover effects
  const cards = document.querySelectorAll(
    ".profile-card, .project-slider-card, .data-card, .carousel-card"
  );
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transition = "all 0.3s ease";
    });
  });
});

// Bubbles are fixed in position - no dragging functionality
// Positions are locked as defined in CSS

// Add ripple effect styles dynamically
const style = document.createElement("style");
style.textContent = `
    .btn-see-more,
    .btn-view-project {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
