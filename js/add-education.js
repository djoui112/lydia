// DOM Elements
const educationModal = document.getElementById('educationModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const educationForm = document.getElementById('educationForm');
const modalTitle = document.getElementById('modalTitle');

// Form fields
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
    initializeYearDropdowns();
    setupEventListeners();
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
    if (educationForm) {
        educationForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Close modal when clicking outside
    if (educationModal) {
        educationModal.addEventListener('click', function(e) {
            if (e.target === educationModal) {
                closeModal();
            }
        });
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

// Open Modal
function openModal() {
    if (modalTitle) {
        modalTitle.textContent = 'Add Education';
    }
    if (educationForm) {
        educationForm.reset();
    }
    clearErrors();
    if (charCount) {
        charCount.textContent = '0';
    }
    if (endMonthSelect && endYearSelect) {
        endMonthSelect.disabled = false;
        endYearSelect.disabled = false;
    }
    if (educationModal) {
        educationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Modal
function closeModal() {
    // For standalone page, go back in history
    window.history.back();
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
        const response = await fetch('/mimaria/php/api/education/add.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(educationData),
            credentials: 'include' // Include session cookies
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success
            alert('Education added successfully!');
            closeModal();
            
            // Reload page to show updated education or trigger parent page refresh
            if (window.opener) {
                // If opened in popup
                window.opener.location.reload();
                window.close();
            } else {
                // Reload current page or redirect
                window.location.reload();
            }
        } else {
            // Error from server
            const errorMsg = result.message || 'Failed to add education';
            if (result.errors && Array.isArray(result.errors)) {
                alert(errorMsg + ':\\n' + result.errors.join('\\n'));
            } else {
                alert(errorMsg);
            }
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error submitting education:', error);
        alert('Network error. Please check your connection and try again.');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Validate Form
function validateForm() {
    let isValid = true;
    clearErrors();
    
    // Validate school
    if (!schoolInput.value.trim()) {
        showError('school', 'Please enter a school name');
        isValid = false;
    }
    
    // Validate degree
    if (!degreeInput.value.trim()) {
        showError('degree', 'Please enter a degree');
        isValid = false;
    }
    
    // Validate field of study
    if (!fieldOfStudyInput.value.trim()) {
        showError('fieldOfStudy', 'Please enter a field of study');
        isValid = false;
    }
    
    // Validate start date
    if (!startMonthSelect.value || !startYearSelect.value) {
        showError('startDate', 'Please select a start date');
        isValid = false;
    }
    
    // Validate end date (if not currently studying)
    if (!currentlyStudyingCheckbox.checked) {
        if (!endMonthSelect.value || !endYearSelect.value) {
            showError('endDate', 'Please select an end date or check "Currently studying"');
            isValid = false;
        } else {
            // Check if end date is after start date
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

// Utility function to format date
function formatDate(month, year) {
    if (!month || !year) return '';
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

// Export openModal function for external use
window.openEducationModal = openModal;
window.closeEducationModal = closeModal;
