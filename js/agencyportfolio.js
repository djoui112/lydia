document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    initReviewForm();
    initProjectReveal();
    initPortfolioSlider();
    initProgressTracker();
    initProjectStack();
    initImageLoader();
    initNavigation();
});

// ====== Menu Toggle Functionality ======
function initMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const menuClose = document.getElementById("menuClose");
    const navMenu = document.getElementById("navMenu");
    const menuOverlay = document.getElementById("menuOverlay");

    if (!menuToggle || !navMenu) return;

    function openMenu() {
        navMenu.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent body scrolling when menu is open
    }

    function closeMenu() {
        navMenu.classList.remove("active");
        document.body.style.overflow = ""; // Restore body scrolling
    }

    // Open menu when menu icon is clicked
    menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        openMenu();
    });

    // Close menu when close button is clicked
    if (menuClose) {
        menuClose.addEventListener("click", (e) => {
            e.stopPropagation();
            closeMenu();
        });
    }

    // Close menu when overlay is clicked
    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeMenu);
    }

    // Close menu when pressing Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navMenu.classList.contains("active")) {
            closeMenu();
        }
    });

    // Close menu when clicking on a menu link (optional - you can remove this if you want menu to stay open)
    const menuLinks = document.querySelectorAll(".menu-link");
    menuLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            // Only close if the link has a real href (not just #)
            if (link.getAttribute("href") === "#") {
                e.preventDefault();
            } else {
                closeMenu();
            }
        });
    });
}

function initReviewForm() {
    const starContainer = document.getElementById("starRating");
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviews-list");

    if (!starContainer || !reviewForm || !reviewsList) return;

    const fields = {
        name: reviewForm.querySelector("#name"),
        email: reviewForm.querySelector("#email"),
        reviewText: reviewForm.querySelector("#reviewText"),
    };

    const ratingWrapper = starContainer.closest(".rating-area") || starContainer.parentElement;
    const ratingError = createHelperMessage(ratingWrapper, "rating");
    let selectedRating = 0;
    const maxStars = 5;

    starContainer.innerHTML = "";
    for (let i = 0; i < maxStars; i++) {
        const span = document.createElement("span");
        span.textContent = "★";
        span.setAttribute("role", "button");
        span.setAttribute("aria-label", `Select ${i + 1} star${i === 0 ? "" : "s"}`);
        span.addEventListener("click", () => {
            selectedRating = i + 1;
            updateStars();
            clearRatingError();
        });
        starContainer.appendChild(span);
    }

    Object.values(fields).forEach((field) => {
        if (!field) return;
        field.addEventListener("input", () => validateField(field));
        field.addEventListener("blur", () => validateField(field));
    });

    function updateStars() {
        const spans = starContainer.querySelectorAll("span");
        spans.forEach((s, index) => {
            s.style.color = index < selectedRating ? "gold" : "#bfbfbf";
        });
    }

    function createHelperMessage(container, key) {
        if (!container) return null;
        let helper = container.querySelector(`.error-message[data-for="${key}"]`);
        if (!helper) {
            helper = document.createElement("span");
            helper.className = "error-message";
            helper.dataset.for = key;
            container.appendChild(helper);
        }
        return helper;
    }

    function getFieldErrorElement(field) {
        if (!field) return null;
        const wrapper = field.closest(".form-group") || field.parentElement;
        if (!wrapper) return null;
        let error = wrapper.querySelector(`.error-message[data-for="${field.id}"]`);
        if (!error) {
            error = document.createElement("span");
            error.className = "error-message";
            error.dataset.for = field.id;
            wrapper.appendChild(error);
        }
        return error;
    }

    function setFieldError(field, message) {
        if (!field) return false;
        const errorEl = getFieldErrorElement(field);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = "block";
        }
        field.classList.add("input-error");
        field.setAttribute("aria-invalid", "true");
        return false;
    }

    function clearFieldError(field) {
        if (!field) return;
        const errorEl = getFieldErrorElement(field);
        if (errorEl) {
            errorEl.textContent = "";
            errorEl.style.display = "none";
        }
        field.classList.remove("input-error");
        field.removeAttribute("aria-invalid");
    }

    function setRatingError(message) {
        if (ratingError) {
            ratingError.textContent = message;
            ratingError.style.display = "block";
        }
        ratingWrapper?.classList.add("input-error");
    }

    function clearRatingError() {
        if (ratingError) {
            ratingError.textContent = "";
            ratingError.style.display = "none";
        }
        ratingWrapper?.classList.remove("input-error");
    }

    function validateField(field) {
        if (!field) return true;
        const value = field.value.trim();

        if (field.id === "name") {
            if (!value) return setFieldError(field, "Please enter your name.");
            if (value.length < 2) return setFieldError(field, "Name must have at least 2 characters.");
        } else if (field.id === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) return setFieldError(field, "Email is required.");
            if (!emailPattern.test(value)) return setFieldError(field, "Enter a valid email address.");
        } else if (field.id === "reviewText") {
            if (!value) return setFieldError(field, "Please write a review.");
            if (value.length < 10) return setFieldError(field, "Review must be at least 10 characters.");
        }

        clearFieldError(field);
        return true;
    }

    function validateRating() {
        if (!selectedRating) {
            setRatingError("Please select a rating.");
            return false;
        }
        clearRatingError();
        return true;
    }

    function validateForm() {
        const isNameValid = validateField(fields.name);
        const isEmailValid = validateField(fields.email);
        const isReviewValid = validateField(fields.reviewText);
        const isRatingValid = validateRating();
        return isNameValid && isEmailValid && isReviewValid && isRatingValid;
    }

    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstInvalid =
                Object.values(fields).find((field) => field?.classList.contains("input-error")) || null;
            if (firstInvalid) {
                firstInvalid.focus();
            } else if (!selectedRating) {
                starContainer.focus();
            }
            return;
        }

        addReview(fields.name.value.trim(), selectedRating, fields.reviewText.value.trim());
        showSuccessMessage("Thank you for your review!");
        reviewForm.reset();
        Object.values(fields).forEach(clearFieldError);
        selectedRating = 0;
        updateStars();
        clearRatingError();
    });

    function addReview(name, rating, text) {
        const card = document.createElement("div");
        card.className = "review-card";

        const avatarWrapper = document.createElement("div");
        const avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = "../assets/portfolios/user-pic.jpg";
        avatar.alt = `${name} avatar`;
        avatarWrapper.appendChild(avatar);

        const info = document.createElement("div");
        info.className = "review-info";

        const reviewName = document.createElement("div");
        reviewName.className = "review-name";
        reviewName.textContent = name;

        const reviewStars = document.createElement("div");
        reviewStars.className = "review-stars";
        reviewStars.textContent = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;

        const reviewText = document.createElement("div");
        reviewText.className = "review-text";
        reviewText.textContent = text;

        info.appendChild(reviewName);
        info.appendChild(reviewStars);
        info.appendChild(reviewText);

        card.appendChild(avatarWrapper);
        card.appendChild(info);

        reviewsList.prepend(card);
    }

    function showSuccessMessage(message) {
        let successMsg = reviewForm.parentElement?.querySelector(".success-message");
        if (!successMsg) {
            successMsg = document.createElement("div");
            successMsg.className = "success-message";
            reviewForm.parentElement?.insertBefore(successMsg, reviewForm);
        }

        successMsg.textContent = message;
        successMsg.style.opacity = "1";
        successMsg.style.transform = "translateY(0)";

        setTimeout(() => {
            if (!successMsg) return;
            successMsg.style.opacity = "0";
            successMsg.style.transform = "translateY(-8px)";
        }, 2500);
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
        { threshold: 0.3 }
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
        { passive: true }
    );

    slider.addEventListener(
        "touchend",
        (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        },
        { passive: true }
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
            e.stopPropagation();
            // Navigate to architect portfolio page
            window.location.href = `architectportfolio.html?id=${memberId || '1'}`;
        };

        if (seeMoreBtn) {
            seeMoreBtn.addEventListener("click", navigateToArchitect);
        }

        card.addEventListener("click", (e) => {
            // Don't navigate if clicking on the see more button (it will handle its own navigation)
            if (!e.target.closest(".see-more")) {
                navigateToArchitect(e);
            }
        });
    });

    // Navigation for project view buttons to project details
    const projectViewButtons = document.querySelectorAll(".btn-view-project");
    projectViewButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent card click event
            const projectCard = button.closest(".project-slider-card");
            const projectId = projectCard?.getAttribute("data-project-id") || '1';

            // Navigate to project details page
            window.location.href = `projectdetails.html?id=${projectId}`;
        });
    });
}
