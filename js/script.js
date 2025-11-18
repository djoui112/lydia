/* ============================================
   Project Request Form - JavaScript
   ============================================ */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // Form Elements
    // ============================================
    const projectForm = document.getElementById('projectForm');
    const projectNameInput = document.getElementById('projectName');
    const projectTypeSelect = document.getElementById('projectType');
    const projectDescriptionTextarea = document.getElementById('projectDescription');
    const projectPhotosInput = document.getElementById('projectPhotos');
    const fileNamesDisplay = document.getElementById('fileNamesDisplay');

    if (projectForm) {
        projectForm.setAttribute('novalidate', 'novalidate');
        projectForm.addEventListener('invalid', function(event) {
            event.preventDefault();
        }, true);
    }

    // ============================================
    // File Upload Handler
    // ============================================
    projectPhotosInput.addEventListener('change', function(event) {
        const files = event.target.files;
        
        if (files.length > 0) {
            // Create list element for file names
            const fileList = document.createElement('ul');
            fileList.innerHTML = '';
            
            // Add each file name to the list
            Array.from(files).forEach(function(file) {
                const listItem = document.createElement('li');
                listItem.textContent = file.name;
                fileList.appendChild(listItem);
            });
            
            // Display the file names
            fileNamesDisplay.innerHTML = '';
            fileNamesDisplay.appendChild(fileList);
            fileNamesDisplay.classList.add('has-files');
        } else {
            // Hide the display if no files selected
            fileNamesDisplay.classList.remove('has-files');
            fileNamesDisplay.innerHTML = '';
        }
    });

    // ============================================
    // Form Validation
    // ============================================
    projectForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Reset previous error states
        clearErrors();
        
        // Validate required fields
        let isValid = true;
        const errors = [];
        
        // Validate Project Name
        const projectNameValue = projectNameInput.value.trim();

        if (!projectNameValue) {
            isValid = false;
            errors.push('Project name is required');
            showError(projectNameInput, 'Project name is required');
        } else if (/\d/.test(projectNameValue)) {
            isValid = false;
            errors.push('Project name cannot contain numbers');
            showError(projectNameInput, 'Project name cannot contain numbers');
        }
        
        // Validate Project Type
        if (!projectTypeSelect.value) {
            isValid = false;
            errors.push('Project type is required');
            showError(projectTypeSelect, 'Project type is required');
        }
        
        // Validate Project Description
        if (!projectDescriptionTextarea.value.trim()) {
            isValid = false;
            errors.push('Project description is required');
            showError(projectDescriptionTextarea, 'Project description is required');
        }
        
        // Validate Project Photos
        if (!projectPhotosInput.files || projectPhotosInput.files.length === 0) {
            isValid = false;
            errors.push('Please upload at least one photo');
            showError(projectPhotosInput, 'Please upload at least one photo');
        }

        // If validation fails, rely on inline errors only
        if (!isValid) {
            return;
        }
        
        showSuccessMessage();
    });
    function showSuccessMessage() {
        let successMessage = projectForm.querySelector('.submit-success');

        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.className = 'submit-success';
            successMessage.textContent = 'Your project has been submitted successfully!';
            projectForm.appendChild(successMessage);
        }

        successMessage.classList.add('is-visible');

        setTimeout(() => {
            successMessage.classList.remove('is-visible');
        }, 4000);
    }

    // ============================================
    // Error Display Functions
    // ============================================
    function showError(element, message) {
        // Add error class to input
        removeError(element);
        element.classList.add('error');

        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        element.parentNode.appendChild(errorElement);
    }

    function clearErrors() {
        const formErrors = projectForm.querySelectorAll('.error');
        formErrors.forEach((element) => element.classList.remove('error'));

        const messages = projectForm.querySelectorAll('.error-message');
        messages.forEach((message) => message.remove());
    }

    function removeError(element) {
        if (!element) {
            return;
        }

        element.classList.remove('error');

        const errorMessage = element.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // ============================================
    // Real-time Validation (Optional Enhancement)
    // ============================================
    // Clear errors when user starts typing
    projectNameInput.addEventListener('input', function() {
        const sanitizedValue = this.value.replace(/\d/g, '');
        if (sanitizedValue !== this.value) {
            this.value = sanitizedValue;
        }

        removeError(this);
    });

    projectTypeSelect.addEventListener('change', function() {
        removeError(this);
    });

    projectDescriptionTextarea.addEventListener('input', function() {
        removeError(this);
    });

    projectPhotosInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            removeError(this);
        }
    });
});


