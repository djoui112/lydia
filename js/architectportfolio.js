const API_BASE = '/mimaria/php/api';

const urlParams = new URLSearchParams(window.location.search);
const architectId = urlParams.get('architect_id');

document.addEventListener("DOMContentLoaded", async () => {
    
    if (!architectId) {
        console.error('No architect ID provided');
        return;
    }
    
    // Load portfolio data
    await loadArchitectPortfolio(architectId);
    
    // Initialize UI components after data is loaded
    initProjectStack();
    initImageLoader();
    initNavigation();
    initExperienceAnimations();
});

// ====== Load Architect Portfolio Data ======
async function loadArchitectPortfolio(architectId) {
    try {
        const response = await fetch(`${API_BASE}/portfolios/architect.php?architect_id=${architectId}`, {
    credentials: 'include'
});

        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
            throw new Error('Invalid response format');
        }
        
        const { profile, education, experience, projects, is_owner } = result.data;
        
        // Render profile
        renderProfile(profile, is_owner);
        
        // Render education
        renderEducation(education);
        
        // Render experience
        renderExperience(experience);
        
        // Render projects
        renderProjects(projects, is_owner);
        
    } catch (error) {
        console.error('Error loading architect portfolio:', error);
        // Show error message to user
        const container = document.querySelector('.generalcontainer');
        if (container) {
            container.innerHTML = '<div style="padding: 40px; text-align: center;"><p>Error loading portfolio. Please try again later.</p></div>';
        }
    }
}

// ====== Render Profile Section ======
function renderProfile(profile, isOwner) {
    if (!profile) return;
    
    // Profile picture
    const profilePic = document.querySelector('.profile-pic');
    if (profilePic) {
        profilePic.src = profile.profile_image_url || profile.profile_image || '../assets/portfolios/user-pic.jpg';
        profilePic.alt = `${profile.first_name} ${profile.last_name}`;
    }
    
    // Name
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = `${profile.first_name} ${profile.last_name}`.toUpperCase();
    }
    
    // Title and location
    const architectTitle = document.querySelector('.architect-title');
    if (architectTitle) {
        const title = profile.primary_expertise || profile.statement || 'Architect';
        architectTitle.textContent = title;
    }
    
    const location = document.querySelector('.location');
    if (location && profile.city) {
        location.textContent = profile.city + (profile.address ? `, ${profile.address}` : '');
    }
    
    // Bio
    const bio = document.querySelector('.bio');
    if (bio) {
        bio.textContent = profile.bio || 'No bio available.';
    }
    
    // Contact info link
    const contactInfo = document.querySelector('.info');
    if (contactInfo && profile.email) {
        contactInfo.href = `mailto:${profile.email}`;
    }
    
    // Edit Profile button (only for owner)
    const addProjectLink = document.querySelector('.add-project-link');
    if (addProjectLink) {
        if (isOwner) {
            addProjectLink.href = 'editprofile-architect.html';
            addProjectLink.textContent = 'Edit Profile';
            addProjectLink.style.display = 'inline-block';
        } else {
            addProjectLink.style.display = 'none';
        }
    }
}

// ====== Render Education Section ======
function renderEducation(education) {
    const educationContainer = document.querySelector('.education-container');
    if (!educationContainer) return;
    
    // Clear existing static cards
    educationContainer.innerHTML = '';
    
    if (!education || education.length === 0) {
        educationContainer.innerHTML = '<p style="text-align: center; color: #666;">No education records available.</p>';
        return;
    }
    
    education.forEach(edu => {
        const card = document.createElement('div');
        card.className = 'education-card';
        
        card.innerHTML = `
            <div class="education-icon">
                <i class="fas fa-building"></i>
            </div>
            <h3 class="education-university">${edu.university_name || 'University name'}</h3>
            <p class="education-degree">${edu.degree || 'Degree'}${edu.field_of_study ? ` - ${edu.field_of_study}` : ''}</p>
        `;
        
        educationContainer.appendChild(card);
    });
}

// ====== Render Experience Section ======
function renderExperience(experience) {
    const experienceContainer = document.querySelector('.experience-container');
    if (!experienceContainer) return;
    
    // Clear existing static items
    experienceContainer.innerHTML = '';
    
    if (!experience || experience.length === 0) {
        experienceContainer.innerHTML = '<p style="text-align: center; color: #666;">No experience records available.</p>';
        return;
    }
    
    experience.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'experience-item';
        item.setAttribute('data-experience-id', exp.id);
        
        // Build date range
        let dateRange = '';
        if (exp.start_date_formatted) {
            dateRange = exp.start_date_formatted;
            if (exp.end_date_formatted) {
                dateRange += ` - ${exp.end_date_formatted}`;
            } else if (exp.is_current) {
                dateRange += ' - Present';
            }
        }
        
        // Build agency link
        let agencyLink = 'javascript:void(0)';
        if (exp.agency_id) {
            agencyLink = `agency-portfolio.html?id=${exp.agency_id}`;
        }
        
        item.innerHTML = `
            <div class="experience-timeline">
                <div class="timeline-dot"></div>
                ${index < experience.length - 1 ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="experience-content">
                <div class="experience-header">
                    <div class="experience-icon-wrapper">
                        <div class="experience-icon">
                            <i class="fas fa-building"></i>
                        </div>
                    </div>
                    <div class="experience-main-info">
                        <h3 class="experience-role">${exp.role || 'Role'}</h3>
                        <h4 class="experience-agency">${exp.agency_name || 'Agency'}</h4>
                        <p class="experience-date">
                            <i class="far fa-calendar"></i>
                            <span>${dateRange || 'Date not specified'}</span>
                        </p>
                    </div>
                </div>
                ${exp.agency_id ? `<a href="${agencyLink}" class="see-more-exp">View Details</a>` : ''}
            </div>
        `;
        
        experienceContainer.appendChild(item);
    });
    
    // Re-initialize animations after rendering
    setTimeout(() => {
        initExperienceAnimations();
    }, 100);
}

// ====== Render Projects Section ======
function renderProjects(projects, isOwner) {
    const projectSliderTrack = document.getElementById('projectSliderTrack');
    if (!projectSliderTrack) return;
    
    // Clear existing static cards
    projectSliderTrack.innerHTML = '';
    
    if (!projects || projects.length === 0) {
        projectSliderTrack.innerHTML = '<div style="padding: 40px; text-align: center;"><p>No projects available.</p></div>';
        return;
    }
    
    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-slider-card';
        card.setAttribute('data-index', index);
        card.setAttribute('data-project-id', project.id);
        
        // Build project tags (from project_type)
        const tags = project.project_type ? [project.project_type] : [];
        
        // Build project photo URL
        const projectPhoto = project.project_photo_url || project.project_photo || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop';
        
        card.innerHTML = `
            <div class="project-content">
                <div class="project-info">
                    <h3 class="project-name">${project.project_name || 'Project name'}</h3>
                    <div class="project-details">
                        ${project.agency_name ? `<p class="project-agency">Agency: ${project.agency_name}</p>` : ''}
                        ${project.architect_name ? `<p class="project-architect">Architect: ${project.architect_name}</p>` : ''}
                        ${tags.length > 0 ? `
                            <div class="project-tags-container">
                                ${tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${project.completion_date_formatted ? `
                            <div class="project-date">
                                <i class="far fa-calendar"></i>
                                <span>${project.completion_date_formatted}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${project.project_id ? `<a href="projectpreview.html?id=${project.project_id}" class="btn-view-project">view project</a>` : '<span class="btn-view-project" style="opacity: 0.5; cursor: not-allowed;">view project</span>'}
                </div>
                <div class="project-image">
                    <img src="${projectPhoto}" alt="${project.project_name || 'Project'}" />
                </div>
            </div>
        `;
        
        projectSliderTrack.appendChild(card);
    });
    
    // Re-initialize project stack after rendering
    setTimeout(() => {
        initProjectStack();
    }, 100);
}

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
