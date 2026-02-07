const API_BASE = '../php/api';

// Get architect ID from URL or session
async function getArchitectId() {
    const urlParams = new URLSearchParams(window.location.search);
    let architectId = urlParams.get('architect_id') || urlParams.get('id');
    
    // If missing from URL, try fetching from backend session
    if (!architectId) {
        try {
            const response = await fetch('../php/api/get-session-architect.php', { 
                credentials: 'include' 
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.architect_id) {
                    architectId = data.architect_id;
                    // Update URL to include the ID for future navigation
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('architect_id', architectId);
                    window.history.replaceState({}, '', newUrl);
                }
            }
        } catch (error) {
            console.error('Failed to fetch architect ID from session:', error);
        }
    }
    
    return architectId;
}

document.addEventListener("DOMContentLoaded", async () => {
    const architectId = await getArchitectId();
    
    if (!architectId) {
        console.error('No architect ID provided');
        const container = document.querySelector('.generalcontainer');
        if (container) {
            container.innerHTML = '<div style="padding: 40px; text-align: center;"><p>Error: No architect selected. Please go back and try again.</p><button onclick="history.back()" style="margin-top: 20px; padding: 10px 20px; background-color: #6A2E2A; color: white; border: none; border-radius: 4px; cursor: pointer;">Go Back</button></div>';
        }
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
        if (!architectId) {
            throw new Error('Architect ID is required');
        }
        
        const response = await fetch(`${API_BASE}/portfolios/architect.php?architect_id=${architectId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
            } catch (e) {
                // Use default error message
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
            throw new Error(result.message || 'Invalid response format');
        }
        
        const { profile, education, experience, projects, is_owner } = result.data;
        
        // Render profile
        renderProfile(profile, is_owner);
        
        // Render education
        renderEducation(education, is_owner);
        
        // Render experience
        renderExperience(experience, is_owner);
        
        // Render projects
        renderProjects(projects, is_owner);
        
    } catch (error) {
        console.error('Error loading architect portfolio:', error);
        // Show error message to user with option to retry
        const container = document.querySelector('.generalcontainer');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #d32f2f; margin-bottom: 15px;">Error Loading Portfolio</h2>
                    <p style="color: #666; margin-bottom: 20px;">${error.message || 'Error loading portfolio. Please try again later.'}</p>
                    <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background-color: #6A2E2A; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Retry</button>
                    <button onclick="history.back()" style="margin-top: 20px; padding: 10px 20px; background-color: #999; color: white; border: none; border-radius: 4px; cursor: pointer;">Go Back</button>
                </div>
            `;
        }
    }
}

// ====== Render Profile Section ======
function renderProfile(profile, isOwner) {
    if (!profile) return;
    
    // Profile picture
    const profilePic = document.querySelector('.profile-pic');
    if (profilePic) {
        const defaultProfileImage = '../assets/main/Profile-blue.png';
        let profileImage = profile.profile_image_url || profile.profile_image || defaultProfileImage;
        
        // Validate and fix image path
        if (!profileImage || profileImage === '' || profileImage === 'null' || profileImage === 'undefined') {
            profileImage = defaultProfileImage;
        }
        
        // Handle different path formats
        if (profileImage && profileImage !== defaultProfileImage) {
            // If it's a full URL from the API, use it as is
            if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
                // Add cache-busting timestamp to full URL
                const separator = profileImage.includes('?') ? '&' : '?';
                profileImage = profileImage.split('?')[0] + separator + 't=' + new Date().getTime();
            }
            // If it's a relative path starting with assets/, make it absolute
            else if (profileImage.startsWith('assets/')) {
                profileImage = '/' + profileImage;
                // Add cache-busting timestamp
                profileImage = profileImage + '?t=' + new Date().getTime();
            }
            // If it's already an absolute path starting with /, use it
            else if (profileImage.startsWith('/')) {
                // Add cache-busting timestamp
                const separator = profileImage.includes('?') ? '&' : '?';
                profileImage = profileImage.split('?')[0] + separator + 't=' + new Date().getTime();
            }
            // Otherwise, make it absolute
            else {
                profileImage = '/' + profileImage;
                // Add cache-busting timestamp
                profileImage = profileImage + '?t=' + new Date().getTime();
            }
        }
        
        // Clear src first to force reload
        profilePic.src = '';
        
        // Use a small delay to ensure the old image is cleared from cache
        setTimeout(() => {
            profilePic.src = profileImage;
            console.log('Profile image src set to:', profilePic.src);
            
            // If image fails to load, try reloading with a new timestamp
            profilePic.onerror = function() {
                console.warn('Image failed to load, trying with fresh timestamp');
                this.onerror = null; // Prevent infinite loop
                const separator = profileImage.includes('?') ? '&' : '?';
                this.src = profileImage.split('?')[0] + separator + 't=' + new Date().getTime();
            };
        }, 10);
        
        profilePic.alt = `${profile.first_name} ${profile.last_name}`;
        
        // Final fallback to default image
        profilePic.addEventListener('error', function() {
            if (this.src !== defaultProfileImage) {
                this.onerror = null;
                this.src = defaultProfileImage;
            }
        }, { once: true });
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
    
    // Edit Profile button in header (only for owner)
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        if (isOwner) {
            editProfileBtn.style.display = 'flex';
        } else {
            editProfileBtn.style.display = 'none';
        }
    }
    
    // Edit Profile button in projects section (legacy, keep for compatibility)
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
function renderEducation(education, isOwner) {
    const educationContainer = document.querySelector('.education-container');
    if (!educationContainer) return;
    
    // Show/hide Add Education button
    const addEducationBtn = document.getElementById('addEducationBtn');
    if (addEducationBtn) {
        if (isOwner) {
            addEducationBtn.style.display = 'flex';
            addEducationBtn.onclick = () => {
                window.location.href = 'add-education.html';
            };
        } else {
            addEducationBtn.style.display = 'none';
        }
    }
    
    // Clear existing static cards
    educationContainer.innerHTML = '';
    
    if (!education || education.length === 0) {
        const emptyMessage = isOwner 
            ? '<p style="text-align: center; color: #666;">No education records available. Click the + button to add one.</p>'
            : '<p style="text-align: center; color: #666;">No education records available.</p>';
        educationContainer.innerHTML = emptyMessage;
        return;
    }
    
    education.forEach(edu => {
        const card = document.createElement('div');
        card.className = 'education-card';
        
        const editButton = isOwner ? `
            <button class="edit-education-btn" onclick="window.location.href='add-education.html?id=${edu.id}'" aria-label="Edit education">
                <i class="fas fa-pencil-alt"></i>
            </button>
        ` : '';
        
        card.innerHTML = `
            ${editButton}
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
function renderExperience(experience, isOwner) {
    const experienceContainer = document.querySelector('.experience-container');
    if (!experienceContainer) return;
    
    // Show/hide Add Experience button
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    if (addExperienceBtn) {
        if (isOwner) {
            addExperienceBtn.style.display = 'flex';
            addExperienceBtn.onclick = () => {
                window.location.href = 'add-experience.html';
            };
        } else {
            addExperienceBtn.style.display = 'none';
        }
    }
    
    // Clear existing static items
    experienceContainer.innerHTML = '';
    
    if (!experience || experience.length === 0) {
        const emptyMessage = isOwner 
            ? '<p style="text-align: center; color: #666;">No experience records available. Click the + button to add one.</p>'
            : '<p style="text-align: center; color: #666;">No experience records available.</p>';
        experienceContainer.innerHTML = emptyMessage;
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
        
        const editButton = isOwner ? `
            <button class="edit-experience-btn" onclick="window.location.href='add-experience.html?id=${exp.id}'" aria-label="Edit experience">
                <i class="fas fa-pencil-alt"></i>
            </button>
        ` : '';
        
        item.innerHTML = `
            <div class="experience-timeline">
                <div class="timeline-dot"></div>
                ${index < experience.length - 1 ? '<div class="timeline-line"></div>' : ''}
            </div>
            <div class="experience-content">
                ${editButton}
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
        
        // Build project photo URL with default fallback
        const defaultProjectImage = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop';
        let projectPhoto = project.project_photo_url || project.project_photo || defaultProjectImage;
        
        // Ensure we have a valid image URL
        if (!projectPhoto || projectPhoto === '' || projectPhoto === 'null' || projectPhoto === 'undefined') {
            projectPhoto = defaultProjectImage;
        }
        
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
                    ${project.project_id ? `<a href="project-portfolio.html?id=${project.project_id}" class="btn-view-project">view project</a>` : '<span class="btn-view-project" style="opacity: 0.5; cursor: not-allowed;">view project</span>'}
                </div>
                <div class="project-image">
                    <img src="${projectPhoto}" 
                         alt="${project.project_name || 'Project'}" 
                         onerror="this.onerror=null; this.src='${defaultProjectImage}';" />
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
                // Navigate to project portfolio page (same as agency portfolio)
                window.location.href = `project-portfolio.html?id=${projectId}`;
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
        const defaultAvatarImage = "../assets/main/Profile-blue.png";
        avatar.src = defaultAvatarImage;
        avatar.alt = `${name} avatar`;
        avatar.onerror = function() {
            this.onerror = null;
            this.src = defaultAvatarImage;
        };
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
