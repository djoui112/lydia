document.addEventListener('DOMContentLoaded', function() {
    const archiMenuToggle = document.querySelector('.archi-menu-icon');
    const archiMenu = document.querySelector('.archi-menu');

    if (archiMenuToggle && archiMenu) {
        archiMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            archiMenu.classList.toggle('active');
            console.log('Menu toggled');
        });

        document.addEventListener('click', function(event) {
            if (!archiMenuToggle.contains(event.target) && !archiMenu.contains(event.target)) {
                archiMenu.classList.remove('active');
            }
        });

        archiMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        console.error('Menu elements not found');
    }
})

    document.addEventListener('DOMContentLoaded', function() {
    const clientMenuToggle = document.querySelector('.client-menu-icon');
    const clientMenu = document.querySelector('.client-menu');

    if (clientMenuToggle && clientMenu) {
        clientMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            clientMenu.classList.toggle('active');
            console.log('Menu toggled');
        });

        document.addEventListener('click', function(event) {
            if (!clientMenuToggle.contains(event.target) && !clientMenu.contains(event.target)) {
                clientMenu.classList.remove('active');
            }
        });

        clientMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {
        console.error('Menu elements not found');
    }

    // Project Management - Vertical Project Card Stack - Click to bring to top with smooth animation
    // Link "view project" buttons to project management page
    const viewProjectButtons = document.querySelectorAll(".btn-view-project");
    viewProjectButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
            e.stopPropagation(); // Prevent card click event
            // Only prevent default and redirect if it's not already a link
            if (this.tagName !== 'A') {
                e.preventDefault();
                window.location.href = "projectpreview.html";
            }
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

    // Smooth scroll to project management section when clicking menu link
    const projectManagementLinks = document.querySelectorAll('a[href="#project-management"]');
    projectManagementLinks.forEach((link) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.getElementById('project-management');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close menu if open
                if (archiMenu) {
                    archiMenu.classList.remove('active');
                }
            }
        });
    });

    // Footer Navigation - Smooth scroll to sections
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
            // For non-anchor links (like ./edirprofile-architect.html), let the browser handle it normally
        });
    });
});
document.addEventListener('DOMContentLoaded', async () => {
  const link = document.querySelector('#portfolioLink'); // make sure your link has this id

  try {
    const res = await fetch('/mimaria/php/api/get-session-architect.php', { credentials: 'include' });
    const data = await res.json();

    if (data.architect_id) {
      link.href = `architect-portfolio.html?architect_id=${data.architect_id}`;
    } else {
      console.error('No architect ID in session');
      link.href = '#';
    }
  } catch (err) {
    console.error('Failed to get architect ID:', err);
    link.href = '#';
  }
});
