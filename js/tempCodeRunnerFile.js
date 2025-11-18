// Vertical Project Card Stack - Click to bring to top with smooth animation
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
      const allCards = Array.from(projectSliderTrack.querySelectorAll(".project-slider-card"));
      const currentIndex = allCards.indexOf(currentActiveCard);
      
      // Get the next card (wrap around to first if at end)
      if (currentIndex < allCards.length - 1) {
        return allCards[currentIndex + 1];
      } else {
        return allCards[0];
      }
    }

    // Click handler for cards
    projectSliderTrack.addEventListener("click", function(e) {
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
  }

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
      const ease = percentage < 0.5
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
  if