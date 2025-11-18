document.addEventListener("DOMContentLoaded", () => {
    initReviewForm();
    initProjectReveal();
    initPortfolioSlider();
    initProgressTracker();
    initProjectStack();
    initImageLoader();
    initNavigation();
});

function initReviewForm() {
    const starContainer = document.getElementById("starRating");
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviews-list");

    if (!starContainer || !reviewForm || !reviewsList) return;

    let selectedRating = 0;
    const initialStars = 5;

    starContainer.innerHTML = "";

    for (let i = 0; i < initialStars; i++) {
        const span = document.createElement("span");
        span.textContent = "★";
        span.addEventListener("click", () => {
            selectedRating = i + 1;
            updateStars();
        });
        starContainer.appendChild(span);
    }

    function updateStars() {
        const spans = starContainer.querySelectorAll("span");
        spans.forEach((s, index) => {
            s.style.color = index < selectedRating ? "gold" : "#bfbfbf";
        });
    }

    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name")?.value.trim() || "Anonymous";
        const text = document.getElementById("reviewText")?.value.trim() || "";

        if (!selectedRating || !text) {
            return;
        }

        addReview(name, selectedRating, text);
        reviewForm.reset();
        selectedRating = 0;
        updateStars();
    });

    function addReview(name, rating, text) {
        const card = document.createElement("div");
        card.className = "review-card";
        card.innerHTML = `
            <div class="avatar"></div>
            <div class="review-info">
                <div class="review-name">${name}</div>
                <div class="review-stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
                <div class="review-text">${text}</div>
            </div>
        `;
        reviewsList.prepend(card);
    }
}

function initProjectReveal() {
    const projectCards = document.querySelectorAll(".project-card, .project-slider-card");
    if (!projectCards.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal");
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 },
    );

    projectCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(card);
    });
}

function initPortfolioSlider() {
    const slider = document.getElementById("slider");
    if (!slider) return;

    const cards = Array.from(slider.querySelectorAll(".port-card"));
    const totalCards = cards.length;
    if (!totalCards) return;

    const originalCards = cards.map((card) => card.cloneNode(true));
    let currentIndex = 0;
    let isAnimating = false;

    function setupInfiniteLoop() {
        for (let i = totalCards - 1; i >= 0; i--) {
            const clone = originalCards[i].cloneNode(true);
            slider.insertBefore(clone, slider.firstChild);
        }

        for (let i = 0; i < totalCards; i++) {
            const clone = originalCards[i].cloneNode(true);
            slider.appendChild(clone);
        }

        currentIndex = totalCards;
    }

    function updateCurrentCard() {
        const allCards = slider.querySelectorAll(".port-card");
        const allUserNames = slider.querySelectorAll(".user-name");
        const allNumbs = slider.querySelectorAll(".numb");
        const allSeeMoreBtns = slider.querySelectorAll(".see-more");

        allCards.forEach((card, index) => {
            const isCurrent = index === currentIndex;
            card.classList.toggle("current", isCurrent);

            allUserNames[index]?.classList.toggle("current", isCurrent);
            allNumbs[index]?.classList.toggle("current", isCurrent);
            allSeeMoreBtns[index]?.classList.toggle("current", isCurrent);
        });
    }

    function updateSliderPosition(instant = false) {
        const allCards = slider.querySelectorAll(".port-card");
        const wrapper = document.querySelector(".portfolio-slider-wrapper");
        if (!allCards.length || !wrapper) return;

        const cardWidth = allCards[0].offsetWidth;
        if (!cardWidth) return;

        const sliderStyle = window.getComputedStyle(slider);
        const gap = parseFloat(sliderStyle.gap) || 32;

        const viewportCenter = wrapper.offsetWidth / 2;
        const totalOffsetToCurrent = currentIndex * (cardWidth + gap);
        const offset = viewportCenter - totalOffsetToCurrent - cardWidth / 2;

        if (instant) slider.style.transition = "none";
        slider.style.transform = `translateX(${offset}px)`;
        if (instant) {
            setTimeout(() => {
                slider.style.transition = "transform 0.6s ease";
            }, 50);
        }
    }

    function checkLoopPosition() {
        if (currentIndex >= totalCards * 2) {
            currentIndex = totalCards;
            updateSliderPosition(true);
        } else if (currentIndex < totalCards) {
            currentIndex = totalCards * 2 - 1;
            updateSliderPosition(true);
        }
    }

    function nextCard() {
        if (isAnimating) return;
        isAnimating = true;

        currentIndex++;
        updateCurrentCard();
        updateSliderPosition();

        setTimeout(() => {
            checkLoopPosition();
            isAnimating = false;
        }, 600);
    }

    function prevCard() {
        if (isAnimating) return;
        isAnimating = true;

        currentIndex--;
        updateCurrentCard();
        updateSliderPosition();

        setTimeout(() => {
            checkLoopPosition();
            isAnimating = false;
        }, 600);
    }

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    nextBtn?.addEventListener("click", nextCard);
    prevBtn?.addEventListener("click", prevCard);

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => updateSliderPosition(true), 200);
    });

    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener(
        "touchstart",
        (e) => {
            touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true },
    );

    slider.addEventListener(
        "touchend",
        (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        },
        { passive: true },
    );

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) nextCard();
        else if (touchEndX - touchStartX > swipeThreshold) prevCard();
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") nextCard();
        if (e.key === "ArrowLeft") prevCard();
    });

    setupInfiniteLoop();
    updateCurrentCard();
    updateSliderPosition(true);
}

function initProgressTracker() {
    const sections = document.querySelectorAll("section");
    const trackerDots = document.querySelectorAll(".tracker-dot");
    if (!trackerDots.length || !sections.length) return;

    function updateProgressTracker() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                trackerDots.forEach((dot) => dot.classList.remove("active"));
                trackerDots[index]?.classList.add("active");
            }
        });
    }

    trackerDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            sections[index].scrollIntoView({ behavior: "smooth" });
        });
    });

    window.addEventListener("scroll", updateProgressTracker);
    updateProgressTracker();
}

function initProjectStack() {
    const projectSliderTrack = document.getElementById("projectSliderTrack");
    if (!projectSliderTrack) return;

    const cards = projectSliderTrack.querySelectorAll(".project-slider-card");
    let currentActiveCard = cards.length ? cards[0] : null;
    currentActiveCard?.classList.add("active");

    function bringCardToTop(card) {
        cards.forEach((c) => {
            if (c !== card && c.classList.contains("active")) {
                c.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
                c.classList.remove("active");
            }
        });

        projectSliderTrack.insertBefore(card, projectSliderTrack.firstChild);

        setTimeout(() => {
            card.style.transition = "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            card.classList.add("active");
            currentActiveCard = card;

            setTimeout(() => {
                card.style.transition = "";
                cards.forEach((c) => {
                    if (c !== card) {
                        c.style.transition = "";
                    }
                });
            }, 800);
        }, 50);
    }

    function getNextCard() {
        const allCards = Array.from(projectSliderTrack.querySelectorAll(".project-slider-card"));
        const currentIndex = allCards.indexOf(currentActiveCard);
        if (currentIndex < allCards.length - 1) {
            return allCards[currentIndex + 1];
        }
        return allCards[0];
    }

    projectSliderTrack.addEventListener("click", (e) => {
        const card = e.target.closest(".project-slider-card");
        if (!card || e.target.closest(".btn-view-project")) {
            return;
        }

        if (card.classList.contains("active")) {
            const nextCard = getNextCard();
            if (nextCard && nextCard !== currentActiveCard) {
                bringCardToTop(nextCard);
            }
        } else {
            bringCardToTop(card);
        }
    });
}

function initImageLoader() {
    const images = document.querySelectorAll("img");
    if (!images.length) return;

    images.forEach((img) => {
        img.addEventListener("load", function () {
            this.style.opacity = "1";
        });

        img.style.opacity = "0";
        img.style.transition = "opacity 0.3s ease";

        if (img.complete) {
            img.style.opacity = "1";
        }
    });
}

function initNavigation() {
    // Navigation for member cards to architect portfolio
    const memberCards = document.querySelectorAll(".port-card");
    memberCards.forEach((card) => {
        const seeMoreBtn = card.querySelector(".see-more");
        const memberId = card.getAttribute("data-member-id");
        
        // Make the entire card clickable
        card.style.cursor = "pointer";
        
        const navigateToArchitect = (e) => {
            // Only prevent default if it's not a link
            if (seeMoreBtn && seeMoreBtn.tagName !== 'A') {
                e.stopPropagation();
                // Navigate to architect portfolio page
                window.location.href = `architect-portfolio.html?id=${memberId || '1'}`;
            }
        };
        
        if (seeMoreBtn && seeMoreBtn.tagName !== 'A') {
            seeMoreBtn.addEventListener("click", navigateToArchitect);
        }
        
        card.addEventListener("click", (e) => {
            // Don't navigate if clicking on the see more button (it will handle its own navigation)
            if (!e.target.closest(".see-more")) {
                navigateToArchitect(e);
            }
        });
    });
    
    // Navigation for project view buttons to architect portfolio
    const projectViewButtons = document.querySelectorAll(".btn-view-project");
    projectViewButtons.forEach((button) => {
        // Only add event listener if it's not a link (links handle their own navigation)
        if (button.tagName !== 'A') {
            button.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent card click event
                const projectCard = button.closest(".project-slider-card");
                const projectId = projectCard?.getAttribute("data-project-id") || '1';
                // Navigate to architect portfolio page
                window.location.href = `architect-portfolio.html?id=${projectId}`;
            });
        }
    });
}