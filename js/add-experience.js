// DOM Elements
const experienceModal = document.getElementById('experienceModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const experienceForm = document.getElementById('experienceForm');
const modalTitle = document.getElementById('modalTitle');

// Form fields
const agencyNameInput = document.getElementById('agencyName');
const roleInput = document.getElementById('role');
const startMonthSelect = document.getElementById('startMonth');
const startYearSelect = document.getElementById('startYear');
const endMonthSelect = document.getElementById('endMonth');
const endYearSelect = document.getElementById('endYear');
const currentlyWorkingCheckbox = document.getElementById('currentlyWorking');
const descriptionTextarea = document.getElementById('description');
const charCount = document.getElementById('charCount');

// Get experience ID from URL if editing
const urlParams = new URLSearchParams(window.location.search);
const experienceId = urlParams.get('id');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeYearDropdowns();
    setupEventListeners();
    
    // If editing, load the experience data
    if (experienceId) {
        loadExperienceData(experienceId);
        if (modalTitle) {
            modalTitle.textContent = 'Edit Experience';
        }
    }
    // Modal is already visible via active class in HTML
});

// Setup Event Listeners
function setupEventListeners() {
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    if (experienceForm) {
        experienceForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Close modal when clicking outside
    if (experienceModal) {
        experienceModal.addEventListener('click', function(e) {
            if (e.target === experienceModal) {
                closeModal();
            }
        });
    }

    // Character counter for description
    if (descriptionTextarea && charCount) {
        descriptionTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > 1000) {
                this.value = this.value.substring(0, 1000);
                charCount.textContent = 1000;
            }
        });
    }

    // Disable end date when currently working
    if (currentlyWorkingCheckbox) {
        currentlyWorkingCheckbox.addEventListener('change', function() {
            endMonthSelect.disabled = this.checked;
            endYearSelect.disabled = this.checked;
            
            if (this.checked) {
                endMonthSelect.value = '';
                endYearSelect.value = '';
                const errorElement = document.getElementById('endDate-error');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            }
        });
    }
}

// Initialize Year Dropdowns
function initializeYearDropdowns() {
    const currentYear = new Date().getFullYear();
    const startYear = 1950;
    
    for (let year = currentYear + 10; year >= startYear; year--) {
        const startOption = document.createElement('option');
        startOption.value = year;
        startOption.textContent = year;
        startYearSelect.appendChild(startOption);
        
        const endOption = document.createElement('option');
        endOption.value = year;
        endOption.textContent = year;
        endYearSelect.appendChild(endOption);
    }
}

// Open Modal
function openModal() {
    if (modalTitle) {
        modalTitle.textContent = 'Add Experience';
    }
    if (experienceForm) {
        experienceForm.reset();
    }
    clearErrors();
    if (charCount) {
        charCount.textContent = '0';
    }
    if (endMonthSelect && endYearSelect) {
        endMonthSelect.disabled = false;
        endYearSelect.disabled = false;
    }
    if (experienceModal) {
        experienceModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Modal
function closeModal() {
    // For standalone page, go back in history
    window.history.back();
}

// Load Experience Data for Editing
async function loadExperienceData(id) {
    try {
        const response = await fetch(`/mimaria/php/api/experience/get.php?id=${id}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load experience data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const exp = result.data;
            
            // Populate form fields
            agencyNameInput.value = exp.agency_name || '';
            roleInput.value = exp.role || '';
            
            // Parse and set start date
            if (exp.start_date) {
                const startDate = new Date(exp.start_date);
                startMonthSelect.value = startDate.getMonth() + 1;
                startYearSelect.value = startDate.getFullYear();
            }
            
            // Parse and set end date
            if (exp.is_current) {
                currentlyWorkingCheckbox.checked = true;
                endMonthSelect.disabled = true;
                endYearSelect.disabled = true;
            } else if (exp.end_date) {
                const endDate = new Date(exp.end_date);
                endMonthSelect.value = endDate.getMonth() + 1;
                endYearSelect.value = endDate.getFullYear();
            }
            
            // Description
            descriptionTextarea.value = exp.description || '';
            charCount.textContent = (exp.description || '').length;
        }
    } catch (error) {
        console.error('Error loading experience data:', error);
        alert('Failed to load experience data. Please try again.');
    }
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const experienceData = {
        agencyName: agencyNameInput.value.trim(),
        role: roleInput.value.trim(),
        startMonth: startMonthSelect.value,
        startYear: startYearSelect.value,
        endMonth: currentlyWorkingCheckbox.checked ? '' : endMonthSelect.value,
        endYear: currentlyWorkingCheckbox.checked ? '' : endYearSelect.value,
        currentlyWorking: currentlyWorkingCheckbox.checked,
        description: descriptionTextarea.value.trim()
    };
    
    // Disable submit button to prevent double submission
    const submitBtn = experienceForm.querySelector('.btn-save');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const url = experienceId 
            ? `/mimaria/php/api/experience/update.php?id=${experienceId}`
            : '/mimaria/php/api/experience/add.php';
        const method = experienceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(experienceData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert(experienceId ? 'Experience updated successfully!' : 'Experience added successfully!');
            closeModal();
            
            if (window.opener) {
                window.opener.location.reload();
                window.close();
            } else {
                // Get architect ID from referrer or session to preserve it
                const referrer = document.referrer;
                let portfolioUrl = 'architect-portfolio.html';
                
                // Try to extract architect_id from referrer URL
                if (referrer) {
                    try {
                        const referrerUrl = new URL(referrer);
                        const referrerId = referrerUrl.searchParams.get('architect_id') || referrerUrl.searchParams.get('id');
                        if (referrerId) {
                            portfolioUrl = `architect-portfolio.html?architect_id=${referrerId}`;
                        } else {
                            // Fallback: fetch from session
                            try {
                                const sessionRes = await fetch('/mimaria/php/api/get-session-architect.php', {
                                    credentials: 'include'
                                });
                                if (sessionRes.ok) {
                                    const sessionData = await sessionRes.json();
                                    if (sessionData && sessionData.architect_id) {
                                        portfolioUrl = `architect-portfolio.html?architect_id=${sessionData.architect_id}`;
                                    }
                                }
                            } catch (e) {
                                console.error('Failed to get architect ID from session:', e);
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse referrer URL:', e);
                    }
                } else {
                    // No referrer, try to get from session
                    try {
                        const sessionRes = await fetch('/mimaria/php/api/get-session-architect.php', {
                            credentials: 'include'
                        });
                        if (sessionRes.ok) {
                            const sessionData = await sessionRes.json();
                            if (sessionData && sessionData.architect_id) {
                                portfolioUrl = `architect-portfolio.html?architect_id=${sessionData.architect_id}`;
                            }
                        }
                    } catch (e) {
                        console.error('Failed to get architect ID from session:', e);
                    }
                }
                
                // Navigate to portfolio page with architect ID
                window.location.href = portfolioUrl;
            }
        } else {
            const errorMsg = result.message || (experienceId ? 'Failed to update experience' : 'Failed to add experience');
            if (result.errors && Array.isArray(result.errors)) {
                alert(errorMsg + ':\n' + result.errors.join('\n'));
            } else {
                alert(errorMsg);
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error submitting experience:', error);
        alert('Network error. Please check your connection and try again.');
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Validate Form
function validateForm() {
    let isValid = true;
    clearErrors();
    
    if (!agencyNameInput.value.trim()) {
        showError('agencyName', 'Please enter a company/agency name');
        isValid = false;
    }
    
    if (!roleInput.value.trim()) {
        showError('role', 'Please enter your role/title');
        isValid = false;
    }
    
    if (!startMonthSelect.value || !startYearSelect.value) {
        showError('startDate', 'Please select a start date');
        isValid = false;
    }
    
    if (!currentlyWorkingCheckbox.checked) {
        if (!endMonthSelect.value || !endYearSelect.value) {
            showError('endDate', 'Please select an end date or check "Currently working"');
            isValid = false;
        } else {
            const startDate = new Date(startYearSelect.value, startMonthSelect.value - 1);
            const endDate = new Date(endYearSelect.value, endMonthSelect.value - 1);
            
            if (endDate < startDate) {
                showError('endDate', 'End date must be after start date');
                isValid = false;
            }
        }
    }
    
    return isValid;
}

// Show Error
function showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Clear Errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Export functions for external use
window.openExperienceModal = openModal;
window.closeExperienceModal = closeModal;
