// Form Submission Handler
// Handles submission of project requests and architect applications

// Determine API base path based on current page location
// If we're in pages/ subdirectory, go up two levels, otherwise one level
const getApiBase = () => {
    const path = window.location.pathname;
    // Check if we're in a pages subdirectory (pages/formclient/, pages/formarchitect/, etc.)
    if (path.includes('/pages/')) {
        return '../../php/api';
    }
    // For root level pages
    return '../php/api';
};

const API_BASE = getApiBase();
console.log('API_BASE resolved to:', API_BASE, 'from path:', window.location.pathname);

// Get agency_id from URL parameters
function getAgencyIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('agency_id') || null;
}

// Save agency_id to localStorage so it persists across form pages
function saveAgencyId(agencyId) {
    if (agencyId) {
        localStorage.setItem('form-agency-id', agencyId);
    }
}

// Get agency_id from localStorage or URL
function getAgencyId() {
    const agencyId = getAgencyIdFromURL() || localStorage.getItem('form-agency-id');
    
    // If no agency_id found, check if we can get it from the agencies page or use default DJO Agency
    if (!agencyId) {
        console.warn('Agency ID not found in URL or localStorage. Using DJO Agency (ID: 307) as default.');
        // Default to DJO Agency for testing - in production, you'd want to show an agency selection
        return '307'; // DJO Agency ID
    }
    
    return agencyId;
}

// Submit architect application
async function submitApplication() {
    const agencyId = getAgencyId();
    
    if (!agencyId) {
        console.error('Agency ID is required');
        alert('Error: Agency ID not found. Please go back and try again.');
        return false;
    }

    // Get form data from localStorage (saved by form-persistence.js)
    const formData = {
        agency_id: parseInt(agencyId),
        motivation_letter: localStorage.getItem('form-motivationLetter') || '',
        portfolio_url: localStorage.getItem('form-portfolio_url') || '',
        linkedin_url: localStorage.getItem('form-linkedin_url') || '',
        email: localStorage.getItem('form-email') || '',
        // Get project types from form
        project_types: getProjectTypes()
    };

    if (!formData.motivation_letter) {
        alert('Motivation letter is required');
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/applications/create.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to submit application');
        }

        // Clear agency_id from localStorage after successful submission
        localStorage.removeItem('form-agency-id');
        
        return true;
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('Error submitting application: ' + error.message);
        return false;
    }
}

// Get project types from form data
function getProjectTypes() {
    const projectTypes = [];
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('form-') && key.includes('project_type')) {
            const value = localStorage.getItem(key);
            if (value && value !== 'null' && value !== 'undefined') {
                projectTypes.push(value);
            }
        }
    });
    
    // Also check for selected choice buttons
    const selectedChoices = document.querySelectorAll('.choice.active');
    selectedChoices.forEach(choice => {
        const text = choice.textContent.trim().toLowerCase();
        if (text && !projectTypes.includes(text)) {
            projectTypes.push(text);
        }
    });
    
    return projectTypes.length > 0 ? JSON.stringify(projectTypes) : null;
}

// Prevent double submission - use a global flag
let submissionInProgress = false;

// Submit project request
async function submitProjectRequest() {
    // Prevent double submission - check flag FIRST
    if (submissionInProgress) {
        console.warn('⚠️ Submission already in progress, ignoring duplicate call');
        return false;
    }
    
    // Set flag IMMEDIATELY - before any async operations
    submissionInProgress = true;
    console.log('🔒 submissionInProgress set to true');
    
    const agencyId = getAgencyId();
    
    if (!agencyId) {
        console.error('Agency ID is required');
        alert('Error: Agency ID not found. Please go back and try again.');
        submissionInProgress = false;
        return false;
    }

    // Collect all form data from localStorage
    const projectType = localStorage.getItem('project-type') || 'exterior';
    
    const formData = {
        agency_id: parseInt(agencyId),
        project_name: localStorage.getItem('form-project_name') || 'Project Request',
        project_type: projectType,
        service_type: localStorage.getItem('form-service_type') || 'design_only',
        project_location: localStorage.getItem('form-project_location') || '',
        description: localStorage.getItem('form-description') || localStorage.getItem('form-project_description') || '',
        min_budget: localStorage.getItem('form-min_budget') ? parseFloat(localStorage.getItem('form-min_budget')) : null,
        max_budget: localStorage.getItem('form-max_budget') ? parseFloat(localStorage.getItem('form-max_budget')) : null,
        preferred_timeline: localStorage.getItem('form-preferred_timeline') || null,
        style_preference: localStorage.getItem('form-style_preference') || null,
    };

    // Add exterior details if applicable
    if (projectType === 'exterior' || projectType === 'both') {
        formData.exterior_property_type = localStorage.getItem('form-exterior_property_type') || null;
        formData.number_of_floors = localStorage.getItem('form-number_of_floors') ? parseInt(localStorage.getItem('form-number_of_floors')) : null;
        formData.exterior_area = localStorage.getItem('form-exterior_area') ? parseFloat(localStorage.getItem('form-exterior_area')) : null;
        formData.exterior_style_preference = localStorage.getItem('form-exterior_style_preference') || null;
        formData.exterior_special_requirements = localStorage.getItem('form-exterior_special_requirements') || null;
    }

    // Add interior details if applicable
    if (projectType === 'interior' || projectType === 'both') {
        formData.interior_location = localStorage.getItem('form-interior_location') || null;
        formData.interior_property_type = localStorage.getItem('form-interior_property_type') || null;
        formData.number_of_rooms = localStorage.getItem('form-number_of_rooms') ? parseInt(localStorage.getItem('form-number_of_rooms')) : null;
        formData.interior_area = localStorage.getItem('form-interior_area') ? parseFloat(localStorage.getItem('form-interior_area')) : null;
        formData.interior_style_preference = localStorage.getItem('form-interior_style_preference') || null;
        formData.color_scheme = localStorage.getItem('form-color_scheme') || null;
        formData.interior_special_requirements = localStorage.getItem('form-interior_special_requirements') || null;
    }

    try {
        const url = `${API_BASE}/project-requests/create.php`;
        console.log('Submitting project request to:', url);
        console.log('Form data:', formData);
        console.log('Cookies being sent:', document.cookie);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // This is crucial - sends cookies with the request
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status, response.statusText);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 500));
            throw new Error('Server returned invalid response format. Please check console for details.');
        }

        const result = await response.json();
        console.log('Response data:', result);

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to submit project request');
        }

        // Clear agency_id from localStorage after successful submission
        localStorage.removeItem('form-agency-id');
        
        // DON'T reset flag here - let the page navigation handle it
        // The flag will be reset when the page unloads or if there's an error
        console.log('✅ Submission successful - flag will reset on page navigation');
        
        return true;
    } catch (error) {
        console.error('Error submitting project request:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert('Error submitting project request: ' + error.message);
        submissionInProgress = false;
        return false;
    }
}

// Initialize on page load
(function() {
    // Save agency_id from URL to localStorage
    const agencyId = getAgencyIdFromURL();
    if (agencyId) {
        saveAgencyId(agencyId);
    }

    // Handle application form submission (on appliance-success.html)
    if (window.location.pathname.includes('appliance-success.html')) {
        // Submit application when success page loads
        submitApplication().then(success => {
            if (!success) {
                // If submission fails, redirect back to form
                window.location.href = 'appliancepro.html';
            }
        });
    }

    // Handle project request form submission (on success pages)
    if (window.location.pathname.includes('_success.html') && 
        window.location.pathname.includes('formclient')) {
        // Submit project request when success page loads
        submitProjectRequest().then(success => {
            if (!success) {
                // If submission fails, redirect back to form
                const currentPath = window.location.pathname;
                const prevPage = currentPath.replace('_success.html', '_3.html');
                window.location.href = prevPage;
            }
        });
    }
})();

// Export functions for use in other scripts
window.submitApplication = submitApplication;
window.submitProjectRequest = submitProjectRequest;
window.getAgencyId = getAgencyId;
window.saveAgencyId = saveAgencyId;
