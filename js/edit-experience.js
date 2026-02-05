// Get experience ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const experienceId = urlParams.get('id');

// DOM Elements
const experienceForm = document.getElementById('experienceForm');
const roleInput = document.getElementById('role');
const agencyNameInput = document.getElementById('agencyName');
const startMonthSelect = document.getElementById('startMonth');
const startYearSelect = document.getElementById('startYear');
const endMonthSelect = document.getElementById('endMonth');
const endYearSelect = document.getElementById('endYear');
const currentlyWorkingCheckbox = document.getElementById('currentlyWorking');
const descriptionTextarea = document.getElementById('description');
const charCount = document.getElementById('charCount');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!experienceId) {
        alert('No experience ID provided');
        window.history.back();
        return;
    }
    
    initializeYearDropdowns();
    setupEventListeners();
    loadExperienceData();
});

// Setup Event Listeners
function setupEventListeners() {
    if (experienceForm) {
        experienceForm.addEventListener('submit', handleFormSubmit);
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

// Load existing experience data
async function loadExperienceData() {
    try {
        const response = await fetch(`/mimaria/php/api/experience/get.php?id=${experienceId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            populateForm(result.data);
        } else {
            alert(result.message || 'Failed to load experience data');
            window.history.back();
        }
    } catch (error) {
        console.error('Error loading experience:', error);
        alert('Failed to load experience data. Please try again.');
        window.history.back();
    }
}

// Populate form with experience data
function populateForm(data) {
    if (roleInput) roleInput.value = data.role || '';
    if (agencyNameInput) agencyNameInput.value = data.agency_name || '';
    
    // Parse and set start date
    if (data.start_date) {
        const startDate = new Date(data.start_date);
        if (startMonthSelect) startMonthSelect.value = startDate.getMonth() + 1;
        if (startYearSelect) startYearSelect.value = startDate.getFullYear();
    }
    
    // Parse and set end date or current status
    const isCurrent = data.is_current === 1 || data.is_current === true;
    if (currentlyWorkingCheckbox) {
        currentlyWorkingCheckbox.checked = isCurrent;
    }
    
    if (isCurrent) {
        if (endMonthSelect) {
            endMonthSelect.value = '';
            endMonthSelect.disabled = true;
        }
        if (endYearSelect) {
            endYearSelect.value = '';
            endYearSelect.disabled = true;
        }
    } else if (data.end_date) {
        const endDate = new Date(data.end_date);
        if (endMonthSelect) {
            endMonthSelect.value = endDate.getMonth() + 1;
            endMonthSelect.disabled = false;
        }
        if (endYearSelect) {
            endYearSelect.value = endDate.getFullYear();
            endYearSelect.disabled = false;
        }
    }
    
    // Set description if exists
    if (descriptionTextarea) {
        descriptionTextarea.value = data.description || '';
        if (charCount) {
            charCount.textContent = (data.description || '').length;
        }
    }
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const experienceData = {
        role: roleInput.value.trim(),
        agencyName: agencyNameInput.value.trim(),
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
        const response = await fetch(`/mimaria/php/api/experience/update.php?id=${experienceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(experienceData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('Experience updated successfully!');
            window.history.back();
        } else {
            const errorMsg = result.message || 'Failed to update experience';
            alert(errorMsg);
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error updating experience:', error);
        alert('An error occurred. Please try again.');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Validate Form
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Validate role
    if (!roleInput.value.trim()) {
        showError('role', 'Title is required');
        isValid = false;
    }
    
    // Validate agency name
    if (!agencyNameInput.value.trim()) {
        showError('agencyName', 'Company name is required');
        isValid = false;
    }
    
    // Validate start date
    if (!startMonthSelect.value || !startYearSelect.value) {
        showError('startDate', 'Start date is required');
        isValid = false;
    }
    
    // Validate end date (if not currently working)
    if (!currentlyWorkingCheckbox.checked) {
        if (!endMonthSelect.value || !endYearSelect.value) {
            showError('endDate', 'End date is required');
            isValid = false;
        } else if (startMonthSelect.value && startYearSelect.value) {
            // Check if end date is after start date
            const startDate = new Date(startYearSelect.value, startMonthSelect.value - 1);
            const endDate = new Date(endYearSelect.value, endMonthSelect.value - 1);
            
            if (endDate < startDate) {
                showError('endDate', 'End date must be after start date');
                isValid = false;
            }
        }
    }
    
    // Validate description length
    if (descriptionTextarea.value.length > 1000) {
        showError('description', 'Description cannot exceed 1000 characters');
        isValid = false;
    }
    
    return isValid;
}

// Show Error Message
function showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Clear All Errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}
