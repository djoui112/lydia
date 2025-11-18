document.addEventListener("DOMContentLoaded", () => {
    initProjectStack();
    initImageLoader();
    initNavigation();
    initExperienceAnimations();
    initReviewForm();
});

// ====== Experience Section Animations ======
function initExperienceAnimations() {
    const experienceItems = document.querySelectorAll(".experience-item");
    
    if (!experienceItems.length) return;

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, index * 100);
                }
            });
        },
        { threshold: 0.1 }
    );

    experienceItems.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(item);
    });
}

// ====== Project Stack Slider (Like Agency Portfolio) ======
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

// ====== Image Loader ======
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

// ====== Navigation ======
function initNavigation() {
    // Navigation for experience items
    const experienceItems = document.querySelectorAll(".experience-item");
    experienceItems.forEach((item) => {
        const seeMoreBtn = item.querySelector(".see-more-exp");
        const experienceId = item.getAttribute("data-experience-id");

        const navigateToExperience = (e) => {
            e.stopPropagation();
            // Only prevent default and handle navigation if it's not already a link
            if (seeMoreBtn && seeMoreBtn.tagName !== 'A') {
                // Navigate to experience details page if needed
                // window.location.href = `experience-details.html?id=${experienceId || '1'}`;
            }
        };

        if (seeMoreBtn) {
            seeMoreBtn.addEventListener("click", navigateToExperience);
        }
    });

    // Navigation for project view buttons
    const projectViewButtons = document.querySelectorAll(".btn-view-project");
    projectViewButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            // Only prevent default and handle navigation if it's not already a link
            if (button.tagName !== 'A') {
                const projectCard = button.closest(".project-slider-card");
                const projectId = projectCard?.getAttribute("data-project-id") || "1";
                // Navigate to project details page
                window.location.href = `projectdetails.html?id=${projectId}`;
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
