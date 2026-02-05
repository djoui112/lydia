// Get education ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const educationId = urlParams.get('id');

// DOM Elements
const educationForm = document.getElementById('educationForm');
const schoolInput = document.getElementById('school');
const degreeInput = document.getElementById('degree');
const fieldOfStudyInput = document.getElementById('fieldOfStudy');
const startMonthSelect = document.getElementById('startMonth');
const startYearSelect = document.getElementById('startYear');
const endMonthSelect = document.getElementById('endMonth');
const endYearSelect = document.getElementById('endYear');
const currentlyStudyingCheckbox = document.getElementById('currentlyStudying');
const descriptionTextarea = document.getElementById('description');
const charCount = document.getElementById('charCount');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    if (!educationId) {
        alert('No education ID provided');
        window.history.back();
        return;
    }
    
    initializeYearDropdowns();
    setupEventListeners();
    loadEducationData();
});

// Setup Event Listeners
function setupEventListeners() {
    if (educationForm) {
        educationForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Character counter for description
    if (descriptionTextarea && charCount) {
        descriptionTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > 500) {
                this.value = this.value.substring(0, 500);
                charCount.textContent = 500;
            }
        });
    }

    // Disable end date when currently studying
    if (currentlyStudyingCheckbox) {
        currentlyStudyingCheckbox.addEventListener('change', function() {
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

// Load existing education data
async function loadEducationData() {
    try {
        const response = await fetch(`/mimaria/php/api/education/get.php?id=${educationId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            populateForm(result.data);
        } else {
            alert(result.message || 'Failed to load education data');
            window.history.back();
        }
    } catch (error) {
        console.error('Error loading education:', error);
        alert('Failed to load education data. Please try again.');
        window.history.back();
    }
}

// Populate form with education data
function populateForm(data) {
    if (schoolInput) schoolInput.value = data.university_name || '';
    if (degreeInput) degreeInput.value = data.degree || '';
    if (fieldOfStudyInput) fieldOfStudyInput.value = data.field_of_study || '';
    
    // Parse and set start date
    if (data.start_date) {
        const startDate = new Date(data.start_date);
        if (startMonthSelect) startMonthSelect.value = startDate.getMonth() + 1;
        if (startYearSelect) startYearSelect.value = startDate.getFullYear();
    }
    
    // Parse and set end date or current status
    const isCurrent = data.is_current === 1 || data.is_current === true;
    if (currentlyStudyingCheckbox) {
        currentlyStudyingCheckbox.checked = isCurrent;
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
    
    const educationData = {
        school: schoolInput.value.trim(),
        degree: degreeInput.value.trim(),
        fieldOfStudy: fieldOfStudyInput.value.trim(),
        startMonth: startMonthSelect.value,
        startYear: startYearSelect.value,
        endMonth: currentlyStudyingCheckbox.checked ? '' : endMonthSelect.value,
        endYear: currentlyStudyingCheckbox.checked ? '' : endYearSelect.value,
        currentlyStudying: currentlyStudyingCheckbox.checked,
        description: descriptionTextarea.value.trim()
    };
    
    // Disable submit button to prevent double submission
    const submitBtn = educationForm.querySelector('.btn-save');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const response = await fetch(`/mimaria/php/api/education/update.php?id=${educationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(educationData),
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('Education updated successfully!');
            window.history.back();
        } else {
            const errorMsg = result.message || 'Failed to update education';
            if (result.errors && Array.isArray(result.errors)) {
                alert(errorMsg + ':\n' + result.errors.join('\n'));
            } else {
                alert(errorMsg);
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error updating education:', error);
        alert('Network error. Please check your connection and try again.');
        
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Validate Form
function validateForm() {
    let isValid = true;
    clearErrors();
    
    if (!schoolInput.value.trim()) {
        showError('school', 'Please enter a school name');
        isValid = false;
    }
    
    if (!degreeInput.value.trim()) {
        showError('degree', 'Please enter a degree');
        isValid = false;
    }
    
    if (!fieldOfStudyInput.value.trim()) {
        showError('fieldOfStudy', 'Please enter a field of study');
        isValid = false;
    }
    
    if (!startMonthSelect.value || !startYearSelect.value) {
        showError('startDate', 'Please select a start date');
        isValid = false;
    }
    
    if (!currentlyStudyingCheckbox.checked) {
        if (!endMonthSelect.value || !endYearSelect.value) {
            showError('endDate', 'Please select an end date or check "Currently studying"');
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
