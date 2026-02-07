const API_BASE = '../php/api';

document.addEventListener("DOMContentLoaded", async () => {
    // Get agency ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    let agencyId = urlParams.get('id') || urlParams.get('agency_id');
    
    // Set window.agencyId early so other scripts can access it
    if (agencyId) {
        window.agencyId = agencyId;
        console.log('Agency ID set to:', agencyId);
    }
    
    // If no ID in URL, try to get from session and redirect
    if (!agencyId) {
        try {
            const response = await fetch('../php/api/get-session-agency.php', { 
                credentials: 'include' 
            });
            const data = await response.json();
            if (data && data.agency_id) {
                window.location.href = `agency-portfolio.html?id=${data.agency_id}`;
                return;
            }
        } catch (error) {
            // If can't get ID, redirect back
            window.location.href = 'agency-interface.html';
            return;
        }
    }
    
    // Load portfolio data
    await loadAgencyPortfolio(agencyId);
    
    // Initialize UI components
    initMenu();
    initReviewForm(agencyId);
    initProjectReveal();
    initPortfolioSlider();
    initProgressTracker();
    initProjectStack();
    initImageLoader();
    initNavigation();
    initPortfolioActions(agencyId);
});

// ====== Load Agency Portfolio Data ======
async function loadAgencyPortfolio(agencyId) {
    try {
        const apiUrl = `${API_BASE}/portfolios/agency.php?id=${agencyId}`;
        console.log('Fetching agency portfolio from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            credentials: 'include'
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        // Get response text first (can only read once)
        const responseText = await response.text();
        console.log('Response body:', responseText.substring(0, 500)); // Log first 500 chars
        
        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            console.error('Full response text:', responseText);
            throw new Error('Invalid JSON response from server');
        }
        
        // Check if response indicates an error
        if (!response.ok) {
            const errorMessage = result.message || result.error || `HTTP error! status: ${response.status}`;
            console.error('API Error:', result);
            throw new Error(errorMessage);
        }
        
        // Check if result indicates failure
        if (!result.success) {
            const errorMessage = result.message || 'Failed to load portfolio data';
            console.error('API returned success=false:', result);
            throw new Error(errorMessage);
        }
        
        if (!result.data) {
            throw new Error(result.message || 'No data returned from server');
        }
        
        const { profile, members, projects, reviews, is_owner, user_type } = result.data;
        
        // Store data globally for use in other functions
        window.agencyPortfolioData = { agencyId, is_owner, user_type };
        
        // Render profile
        renderAgencyProfile(profile, is_owner, user_type);
        
        // Render team members
        renderTeamMembers(members);
        
        // Render projects
        renderAgencyProjects(projects, is_owner);
        
        // Render reviews
        renderReviews(reviews, user_type);
        
        // Hide action buttons if user is agency owner
        if (is_owner && user_type === 'agency') {
            hidePortfolioActions();
        }
        
    } catch (error) {
        console.error('Error loading agency portfolio:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            agencyId: agencyId,
            url: `${API_BASE}/portfolios/agency.php?id=${agencyId}`
        });
        
        // Show error message to user
        const container = document.querySelector('.generalcontainer');
        if (container) {
            let errorMessage = 'Error loading portfolio. Please try again later.';
            if (error.message.includes('404') || error.message.includes('Agency not found')) {
                errorMessage = 'Agency not found. The agency ID may be invalid or the agency may have been removed.';
            } else if (error.message.includes('400') || error.message.includes('Invalid')) {
                errorMessage = 'Invalid agency ID. Please check the URL and try again.';
            }
            
            container.innerHTML = `<div style="padding: 40px; text-align: center;">
                <h2 style="color: #d32f2f; margin-bottom: 15px;">Error Loading Portfolio</h2>
                <p style="color: #666; margin-bottom: 20px;">${errorMessage}</p>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">Error: ${error.message}</p>
                <button onclick="history.back()" style="margin-top: 20px; padding: 10px 20px; background-color: #595F34; color: white; border: none; border-radius: 4px; cursor: pointer;">Go Back</button>
            </div>`;
        }
        
        // Also update the loading text
        const titles = document.querySelector('.titles');
        if (titles) {
            titles.textContent = 'Error';
        }
        const location = document.querySelector('.location');
        if (location) {
            location.textContent = errorMessage;
        }
        const bio = document.querySelector('.bio');
        if (bio) {
            bio.textContent = 'Please check the console for more details.';
        }
    }
}

// ====== Render Agency Profile ======
function renderAgencyProfile(profile, isOwner, userType) {
    if (!profile) return;
    
    // Profile picture
    const profilePic = document.querySelector('.profile-pic');
    if (profilePic) {
        const defaultProfileImage = '../assets/main/Profile-blue.png';
        let profileImage = profile.profile_image_url || profile.profile_image || defaultProfileImage;
        
        // Validate and fix image path
        if (!profileImage || profileImage === '' || profileImage === 'null' || profileImage === 'undefined') {
            profileImage = defaultProfileImage;
        } else {
            // Handle different path formats
            if (profileImage.startsWith('http://localhost/mimaria/')) {
                // Full URL from buildFileUrl - use as is
            } else if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
                // External URL - use as is
            } else if (profileImage.startsWith('assets/') && !profileImage.startsWith('../assets/')) {
                // Relative path starting with assets/ - make it relative to pages/
                profileImage = '../' + profileImage;
            } else if (profileImage.startsWith('/')) {
                // Absolute path - make it relative
                profileImage = '..' + profileImage;
            } else if (!profileImage.startsWith('../') && !profileImage.startsWith('./')) {
                // Path without ../ prefix - might need fixing
                if (!profileImage.includes('://')) {
                    // Not a URL, assume it's relative to assets
                    if (!profileImage.startsWith('assets/')) {
                        profileImage = '../assets/uploads/profile_images/' + profileImage.split('/').pop();
                    } else {
                        profileImage = '../' + profileImage;
                    }
                }
            }
            
            // Add cache-busting parameter to force reload of updated images
            // This ensures the browser fetches the latest version after profile update
            if (profileImage !== defaultProfileImage) {
                const separator = profileImage.includes('?') ? '&' : '?';
                profileImage += separator + 't=' + new Date().getTime();
            }
        }
        
        console.log('Setting profile image to:', profileImage);
        
        // Always force reload to ensure we get the latest image
        // Clear the src first to force browser to reload
        const currentSrc = profilePic.src;
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
        
        profilePic.alt = profile.agency_name || 'Agency';
        profilePic.onerror = function() {
            this.onerror = null;
            this.src = defaultProfileImage;
        };
    }
    
    // Agency name
    const agencyName = document.querySelector('.titles');
    if (agencyName) {
        agencyName.textContent = (profile.agency_name || 'Agency Name').toUpperCase();
    }
    
    // Location
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
    
    // Add edit button if user is the agency owner
    if (isOwner && userType === 'agency') {
        addEditButton();
    }
}

// ====== Add Edit Button ======
function addEditButton() {
    const cover = document.querySelector('.cover');
    if (!cover) return;
    
    // Check if edit button already exists
    if (document.getElementById('editPortfolioBtn')) return;
    
    const editButton = document.createElement('button');
    editButton.id = 'editPortfolioBtn';
    editButton.className = 'edit-portfolio-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.setAttribute('aria-label', 'Edit Portfolio');
    editButton.onclick = function() {
        window.location.href = 'editprofile-agency.html';
    };
    
    // Style it similar to the back button but on the right side
    editButton.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        width: 45px;
        height: 45px;
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        padding: 0;
        z-index: 100;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(5px);
    `;
    
    editButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.style.transform = 'scale(1.1)';
    });
    
    editButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.style.transform = 'scale(1)';
    });
    
    editButton.addEventListener('active', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    // Add to cover section
    cover.appendChild(editButton);
}

// ====== Hide Portfolio Actions ======
function hidePortfolioActions() {
    const portfolioActions = document.getElementById('portfolioActions');
    if (portfolioActions) {
        portfolioActions.style.display = 'none';
    }
}

// ====== Render Team Members ======
function renderTeamMembers(members) {
    const slider = document.getElementById('slider');
    if (!slider) return;
    
    // Clear existing static cards
    slider.innerHTML = '';
    
    if (!members || members.length === 0) {
        slider.innerHTML = '<div style="padding: 40px; text-align: center;"><p>No team members available.</p></div>';
        return;
    }
    
    console.log('📋 Raw members data:', members);
    
    // Remove duplicates based on architect_id and validate
    // Use a Map to track unique members by architect_id
    const uniqueMembers = new Map();
    members.forEach(member => {
        const architectId = member.architect_id;
        // Validate architect_id before adding
        const validId = parseInt(architectId);
        if (architectId && !isNaN(validId) && validId > 0 && !uniqueMembers.has(validId)) {
            // Store with validated ID
            member.architect_id = validId;
            uniqueMembers.set(validId, member);
        } else {
            console.warn('⚠️ Skipping member with invalid architect_id:', member);
        }
    });
    
    // Convert Map values back to array
    const uniqueMembersArray = Array.from(uniqueMembers.values());
    
    console.log('✅ Valid members after filtering:', uniqueMembersArray.length, uniqueMembersArray);
    
    // Default profile image path
    const defaultProfileImage = '../assets/main/Profile-blue.png';
    
    // Render unique members
    uniqueMembersArray.forEach(member => {
        const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
        
        // Get profile image with proper fallback
        let profileImage = member.profile_image_url || member.profile_image || defaultProfileImage;
        
        // Validate and fix image path
        if (!profileImage || profileImage === '' || profileImage === 'null' || profileImage === 'undefined') {
            profileImage = defaultProfileImage;
        }
        
        // Fix path if needed - ensure it's relative to the page
        if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('../assets/') && !profileImage.startsWith('assets/')) {
            // If it's an absolute path starting with /, make it relative
            if (profileImage.startsWith('/')) {
                profileImage = profileImage.substring(1);
            }
            // If it doesn't start with assets, use default
            if (!profileImage.startsWith('assets/')) {
                profileImage = defaultProfileImage;
            }
        }
        
        const projectCount = member.project_count || 0;
        const yearsOfExp = member.years_of_experience || 0;
        const architectId = member.architect_id;
        
        // Validate architect_id before creating the link
        const validArchitectId = parseInt(architectId);
        if (!architectId || architectId === 'null' || architectId === 'undefined' || architectId === null || architectId === 0 || architectId === '0' || isNaN(validArchitectId) || validArchitectId <= 0) {
            console.warn('⚠️ Member has invalid architect_id:', architectId, member);
            console.warn('⚠️ Skipping member card for:', fullName);
            // Skip this member - don't create a card
            return;
        }
        
        console.log('✅ Creating member card for:', fullName, 'architect_id:', validArchitectId);
        
        const cardHTML = `
            <a href="architect-portfolio.html?architect_id=${validArchitectId}" class="port-card-link" style="text-decoration: none; color: inherit; display: block;">
                <div class="port-card">
                    <img src="${profileImage}" 
                         class="user-pic" 
                         alt="${fullName}" 
                         onerror="this.onerror=null; this.src='${defaultProfileImage}';">
                    <div class="portfolio-cover"></div>
                    <div class="portfolio-info">
                        <p class="user-name">${fullName.toUpperCase()}</p>
                        <div class="numb">
                            <div class="num-projects">
                                <p>projects</p>
                                <p>${projectCount}</p>
                            </div>
                            <div class="num-years">
                                <p>years</p>
                                <p>${yearsOfExp}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        `;
        slider.innerHTML += cardHTML;
    });
    
    // Ensure slider has proper width to contain all cards
    const cards = slider.querySelectorAll('.port-card');
    if (cards.length > 0) {
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(slider).gap) || 32;
        const totalWidth = (cards.length * cardWidth) + ((cards.length - 1) * gap);
        slider.style.width = `${totalWidth}px`;
    }
    
    // Re-initialize slider after rendering (using main page style)
    setTimeout(() => {
        initPortfolioSlider();
    }, 100);
}

// ====== Render Agency Projects ======
function renderAgencyProjects(projects, isOwner) {
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
        card.setAttribute('data-project-id', project.project_id || project.portfolio_item_id);
        
        // Build project tags
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
                        ${project.client_name ? `<p class="project-agency">Client: ${project.client_name}</p>` : ''}
                        ${project.architect_name ? `<p class="project-architect">Architect: ${project.architect_name}</p>` : ''}
                        ${tags.length > 0 ? `
                            <div class="project-tags-container">
                                ${tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${project.completion_date_formatted ? `
                            <div class="project-date">
                                <span>Deadline: ${project.completion_date_formatted}</span>
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

// ====== Render Reviews ======
function renderReviews(reviews, userType) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    
    // Clear existing static reviews
    reviewsList.innerHTML = '';
    
    // Only show reviews section if user is a client OR if there are reviews to show
    const reviewsSection = document.querySelector('.reviews-section');
    const addReviewSection = document.querySelector('.add-review-section');
    
    // Hide review form for agencies (they can only view reviews, not add them)
    if (userType === 'client') {
        // Show review form for clients
        if (addReviewSection) {
            addReviewSection.style.display = 'block';
        }
    } else {
        // Hide review form for non-clients (including agencies)
        if (addReviewSection) {
            addReviewSection.style.display = 'none';
        }
    }
    
    if (!reviews || reviews.length === 0) {
        if (userType !== 'client') {
            // Hide entire reviews section if no reviews and user is not a client
            const reviewsContainer = document.querySelector('.container');
            if (reviewsContainer) {
                reviewsContainer.style.display = 'none';
            }
        } else {
            reviewsList.innerHTML = '<p style="text-align: center; color: #666;">No reviews yet.</p>';
        }
        return;
    }
    
    const defaultReviewImage = '../assets/main/Profile-blue.png';
    
    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        if (review.id) {
            card.dataset.reviewId = review.id;
        }
        
        let profileImage = review.profile_image_url || review.profile_image || defaultReviewImage;
        
        // Validate and fix image path
        if (!profileImage || profileImage === '' || profileImage === 'null' || profileImage === 'undefined') {
            profileImage = defaultReviewImage;
        }
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        card.innerHTML = `
            <div>
                <img class="avatar" src="${profileImage}" alt="${review.client_name}" onerror="this.onerror=null; this.src='${defaultReviewImage}';">
            </div>
            <div class="review-info">
                <div class="review-name">${review.client_name || 'Client'}</div>
                <div class="review-stars">${stars}</div>
                <div class="review-text">${review.review_text || ''}</div>
            </div>
        `;

        if (review.is_owner) {
            const info = card.querySelector(".review-info");
            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn-review-edit";
            editBtn.textContent = "Edit";
            editBtn.dataset.reviewId = review.id || "";
            editBtn.dataset.reviewRating = String(review.rating || 0);
            editBtn.dataset.reviewText = review.review_text || "";
            info?.appendChild(editBtn);
        }
        
        reviewsList.appendChild(card);
    });
}
// ====== Initialize Portfolio Actions ======
function initPortfolioActions(agencyId) {
    // This will be handled by agency-portfolio-actions.js
    // But we can set the agency ID here if needed
    window.agencyId = agencyId;
}

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

function initReviewForm(agencyId) {
    const starContainer = document.getElementById("starRating");
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviews-list");

    if (!starContainer || !reviewForm || !reviewsList || !agencyId) return;

    const fields = {
        reviewText: reviewForm.querySelector("#reviewText"),
    };
    
    // Remove name and email fields if they exist (not needed for logged-in users)
    const nameField = reviewForm.querySelector("#name");
    const emailField = reviewForm.querySelector("#email");
    if (nameField) nameField.style.display = 'none';
    if (emailField) emailField.style.display = 'none';

    const ratingWrapper = starContainer.closest(".rating-area") || starContainer.parentElement;
    const ratingError = createHelperMessage(ratingWrapper, "rating");
    let selectedRating = 0;
    let editingReviewId = null;
    let editingCard = null;
    const submitBtn = reviewForm.querySelector(".btn-submit-review") || reviewForm.querySelector("button[type='submit']");
    const maxStars = 5;

    starContainer.innerHTML = "";
    for (let i = 0; i < maxStars; i++) {
        const span = document.createElement("span");
        span.textContent = "?";
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

    reviewsList.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".btn-review-edit");
        if (!editBtn) return;
        e.preventDefault();

        const reviewId = parseInt(editBtn.dataset.reviewId || "0", 10);
        const rating = parseInt(editBtn.dataset.reviewRating || "0", 10);
        const text = editBtn.dataset.reviewText || "";

        if (!reviewId) return;

        editingReviewId = reviewId;
        editingCard = editBtn.closest(".review-card");
        if (fields.reviewText) {
            fields.reviewText.value = text;
            clearFieldError(fields.reviewText);
        }
        selectedRating = rating || 0;
        updateStars();
        clearRatingError();
        if (submitBtn) submitBtn.textContent = "Update Review";
        reviewForm.scrollIntoView({ behavior: "smooth", block: "center" });
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

        if (field.id === "reviewText") {
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
        const isReviewValid = validateField(fields.reviewText);
        const isRatingValid = validateRating();
        return isReviewValid && isRatingValid;
    }

    function resetEditState() {
        editingReviewId = null;
        editingCard = null;
        if (submitBtn) submitBtn.textContent = "Submit Review";
    }

    function updateReviewCard(card, rating, text) {
        if (!card) return;
        const starsEl = card.querySelector(".review-stars");
        const textEl = card.querySelector(".review-text");
        if (starsEl) starsEl.textContent = `${"?".repeat(rating)}${"?".repeat(5 - rating)}`;
        if (textEl) textEl.textContent = text;
        const editBtn = card.querySelector(".btn-review-edit");
        if (editBtn) {
            editBtn.dataset.reviewRating = String(rating);
            editBtn.dataset.reviewText = text;
        }
    }

    reviewForm.addEventListener("submit", async (e) => {
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

        // Submit review to API
        try {
            const isEditing = Boolean(editingReviewId);
            const endpoint = isEditing ? 'update.php' : 'create.php';
            const payload = isEditing
                ? {
                    review_id: editingReviewId,
                    rating: selectedRating,
                    review_text: fields.reviewText.value.trim()
                }
                : {
                    rating: selectedRating,
                    review_text: fields.reviewText.value.trim(),
                    agency_id: agencyId
                };

            const response = await fetch(`${API_BASE}/reviews/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to submit review');
            }

            if (isEditing) {
                updateReviewCard(editingCard, selectedRating, fields.reviewText.value.trim());
                showSuccessMessage("Review updated successfully!");
            } else {
                addReview(result.data.client_name, selectedRating, fields.reviewText.value.trim(), {
                    ...result.data,
                    is_owner: true
                });
                showSuccessMessage("Thank you for your review!");
            }

            reviewForm.reset();
            if (fields.reviewText) clearFieldError(fields.reviewText);
            selectedRating = 0;
            updateStars();
            clearRatingError();
            resetEditState();
        } catch (error) {
            console.error('Error submitting review:', error);
            showSuccessMessage("Error submitting review. Please try again.");
        }
    });

    function addReview(name, rating, text, reviewData = null) {
        const card = document.createElement("div");
        card.className = "review-card";
        if (reviewData?.id) {
            card.dataset.reviewId = reviewData.id;
        }

        const avatarWrapper = document.createElement("div");
        const avatar = document.createElement("img");
        avatar.className = "avatar";
        const defaultAvatarImage = "../assets/main/Profile-blue.png";
        const avatarImage = reviewData?.profile_image_url || reviewData?.profile_image || defaultAvatarImage;
        avatar.src = avatarImage;
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
        reviewStars.textContent = `${"?".repeat(rating)}${"?".repeat(5 - rating)}`;

        const reviewText = document.createElement("div");
        reviewText.className = "review-text";
        reviewText.textContent = text;

        info.appendChild(reviewName);
        info.appendChild(reviewStars);
        info.appendChild(reviewText);

        if (reviewData?.is_owner) {
            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "btn-review-edit";
            editBtn.textContent = "Edit";
            editBtn.dataset.reviewId = reviewData?.id || "";
            editBtn.dataset.reviewRating = String(rating || 0);
            editBtn.dataset.reviewText = text || "";
            info.appendChild(editBtn);
        }

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

    let currentScrollPosition = 0;
    
    function slideLeft() {
        const cards = slider.querySelectorAll('.port-card');
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].offsetWidth;
        const sliderStyle = window.getComputedStyle(slider);
        const gap = parseFloat(sliderStyle.gap) || 32;
        const scrollAmount = cardWidth + gap;
        
        // Move slider to the right (positive) to show previous cards
        currentScrollPosition += scrollAmount;
        updateSliderTransform();
    }

    function slideRight() {
        const cards = slider.querySelectorAll('.port-card');
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].offsetWidth;
        const sliderStyle = window.getComputedStyle(slider);
        const gap = parseFloat(sliderStyle.gap) || 32;
        const scrollAmount = cardWidth + gap;
        
        // Move slider to the left (negative) to show next cards
        currentScrollPosition -= scrollAmount;
        updateSliderTransform();
    }
    
    function updateSliderTransform() {
        // Get wrapper width to calculate bounds
        const wrapper = document.querySelector('.portfolio-slider-wrapper');
        if (!wrapper) return;
        
        const cards = slider.querySelectorAll('.port-card');
        if (cards.length === 0) return;
        
        const wrapperWidth = wrapper.offsetWidth;
        const cardWidth = cards[0].offsetWidth;
        const gap = parseFloat(window.getComputedStyle(slider).gap) || 32;
        const totalWidth = (cards.length * cardWidth) + ((cards.length - 1) * gap);
        const maxScroll = Math.max(0, totalWidth - wrapperWidth);
        
        // Clamp the scroll position
        currentScrollPosition = Math.max(-maxScroll, Math.min(0, currentScrollPosition));
        
        // Apply transform
        slider.style.transform = `translateX(${currentScrollPosition}px)`;
    }

    // Connect navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Remove old event listeners by cloning and replacing
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        newPrevBtn.addEventListener('click', slideLeft);
    }
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', slideRight);
    }
    
    // Reset scroll position
    currentScrollPosition = 0;
    updateSliderTransform();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateSliderTransform();
        }, 200);
    });
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
            window.location.href = `architect-portfolio.html?architect_id=${memberId || '1'}`;
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

    // Navigation for project view buttons to project portfolio
    const projectViewButtons = document.querySelectorAll(".btn-view-project");
    projectViewButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent card click event
            // Only prevent default and handle navigation if it's not already a link
            if (button.tagName !== 'A') {
                const projectCard = button.closest(".project-slider-card");
                const projectId = projectCard?.getAttribute("data-project-id") || '1';
                // Navigate to project portfolio page
                window.location.href = `project-portfolio.html?id=${projectId}`;
            }
        });
    });
}
