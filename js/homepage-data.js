/**
 * Homepage Architect Portfolios Data Injection Module
 * 
 * This module ONLY handles:
 * - Fetching featured architects from /api/discover/featured_architect.php
 * - Injecting data into EXISTING HTML elements (no new elements created)
 * - Preserving all existing animations and slider logic
 */
console.log("homepage-data.js loaded");

// ====== API Configuration ======
const API_BASE_URL = 'php/api';
const ENDPOINT_FEATURED_ARCHITECT = 'php/api/discover/featured_architect.php';

// ====== Utility Functions ======

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object>} Parsed JSON response
 */
async function fetchAPI(url) {
    try {
        console.log('Fetching from:', url);
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response received:', data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return {
            success: false,
            data: [],
            message: error.message || 'Failed to fetch data'
        };
    }
}

/**
 * Get featured architects from backend
 * @param {number} limit - Maximum number of architects to fetch
 * @returns {Promise<Array>} Array of architect objects
 */
async function fetchFeaturedArchitects(limit = 8) {
    const url = `${ENDPOINT_FEATURED_ARCHITECT}?limit=${limit}`;
    console.log('Fetching architects from:', url);
    const response = await fetchAPI(url);
    
    if (response.success && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} architects:`, response.data);
        return response.data;
    }
    
    console.warn('No featured architects data received or invalid response format');
    return [];
}

// ====== Data Injection Functions ======

/**
 * Inject architect data into existing portfolio cards
 * Only updates: name, profile image, projects count, years of experience
 * Preserves: cover image, HTML structure, classes, animations
 * @param {Array} architects - Array of architect objects
 */
function injectArchitectData(architects) {
    console.log('Injecting architect data into existing cards...');
    const slider = document.getElementById('slider');
    if (!slider) {
        console.warn('Portfolio slider not found');
        return;
    }

    // Get all existing port-card elements
    const existingCards = Array.from(slider.querySelectorAll('.port-card'));
    console.log(`Found ${existingCards.length} existing portfolio cards`);
    
    if (existingCards.length === 0) {
        console.warn('No existing portfolio cards found');
        return;
    }

    // If no architects data, keep existing hardcoded content
    if (!architects || architects.length === 0) {
        console.info('No featured architects to display, keeping existing cards');
        return;
    }

    // Inject data into existing cards (up to the number of cards available)
    const cardsToUpdate = Math.min(existingCards.length, architects.length);
    console.log(`Updating ${cardsToUpdate} portfolio cards with architect data`);
    
    for (let i = 0; i < cardsToUpdate; i++) {
        const card = existingCards[i];
        const architect = architects[i];
        
        console.log(`Updating card ${i + 1} with architect:`, architect);
        
        // Update profile image (user-pic)
        const profileImg = card.querySelector('.user-pic');
        if (profileImg) {
            const profileImageUrl = architect.profile_image_url || architect.profile_image || 'assets/main/Mask group.png';
            profileImg.src = profileImageUrl;
            // Build full name for alt text
            const fullName = `${architect.first_name || ''} ${architect.last_name || ''}`.trim() || 'Architect';
            profileImg.alt = fullName;
            // Fallback if image fails to load
            profileImg.onerror = function() {
                console.warn(`Profile image failed to load for architect ${architect.id}, using default`);
                this.src = 'assets/main/Mask group.png';
            };
        }
        
        // Update architect name (user-name)
        const nameElement = card.querySelector('.user-name');
        if (nameElement) {
            const fullName = `${architect.first_name || ''} ${architect.last_name || ''}`.trim() || 'Architect Name';
            nameElement.textContent = fullName.toUpperCase();
        }
        
        // Update projects count (num-projects > p:last-child)
        // Backend returns 'project_count' (singular)
        const projectsElement = card.querySelector('.num-projects p:last-child');
        if (projectsElement) {
            const projectCount = architect.project_count || 0;
            projectsElement.textContent = projectCount.toString();
        }
        
        // Update years of experience (num-years > p:last-child)
        const yearsElement = card.querySelector('.num-years p:last-child');
        if (yearsElement) {
            const yearsOfExp = architect.years_of_experience || 0;
            yearsElement.textContent = yearsOfExp.toString();
        }
        
        // Update "See more" link with architect ID
        // Backend returns 'id' (not 'architect_id')
        const seeMoreLink = card.querySelector('.see-more');
        if (seeMoreLink && architect.id) {
            seeMoreLink.href = `pages/architect-portfolio.html?id=${architect.id}`;
        }
    }
    
    console.log('Architect data injection completed');
    
    // Note: Projects count and years are only visible on active card
    // This is handled by CSS classes (.current) managed by main.js slider logic
    // No changes needed here - the data is injected, CSS handles visibility
}

// ====== Initialization ======

/**
 * Initialize homepage architect data injection
 * This should be called after DOM is loaded
 */
async function initHomepageArchitectData() {
    console.log('Initializing homepage architect data injection...');
    
    try {
        // Fetch featured architects
        const architects = await fetchFeaturedArchitects(8);
        console.log('Architects fetched:', architects);
        
        // Inject data into existing cards
        injectArchitectData(architects);
        
        console.log('Homepage architect data injected successfully');
    } catch (error) {
        console.error('Error initializing homepage architect data:', error);
        // Graceful degradation - page will show existing hardcoded content
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageArchitectData);
} else {
    // DOM is already loaded
    initHomepageArchitectData();
}

// Export for use in other scripts if needed
window.HomepageArchitectData = {
    fetchFeaturedArchitects,
    injectArchitectData,
    initHomepageArchitectData
};
