// Comprehensive form validation for all forms
// This script handles validation for both architect application and client project request forms

(function() {
  'use strict';

  // Validation utilities
  const validators = {
    // Name validation (first name, last name, full name)
    name: function(value) {
      if (!value || value.trim().length < 2) {
        return 'Name must be at least 2 characters long';
      }
      if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
      return null;
    },

    // Phone validation (Algerian format: +213)
    phone: function(value) {
      if (!value) return 'Phone number is required';
      // Remove spaces and dashes for validation
      const cleaned = value.replace(/[\s-]/g, '');
      // Check for +213 format or Algerian mobile numbers
      if (!/^(\+213|00213|0)?[5-7]\d{8}$/.test(cleaned)) {
        return 'Please enter a valid Algerian phone number (e.g., +213 5XX XXX XXX)';
      }
      return null;
    },

    // Email validation
    email: function(value) {
      if (!value) return 'Email is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid email address';
      }
      return null;
    },

    // URL validation
    url: function(value) {
      if (!value) return 'URL is required';
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return 'URL must start with http:// or https://';
        }
        return null;
      } catch (e) {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
    },

    // Address validation
    address: function(value) {
      if (!value || value.trim().length < 5) {
        return 'Address must be at least 5 characters long';
      }
      return null;
    },

    // Date of birth validation
    dateOfBirth: function(value) {
      if (!value) return 'Date of birth is required';
      
      let day, month, year;
      
      // Check if it's a date input type (YYYY-MM-DD format)
      const dateInputRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
      const dateInputMatch = value.trim().match(dateInputRegex);
      
      if (dateInputMatch) {
        // Date input type: YYYY-MM-DD
        year = parseInt(dateInputMatch[1], 10);
        month = parseInt(dateInputMatch[2], 10);
        day = parseInt(dateInputMatch[3], 10);
      } else {
        // Check for DD/MM/YYYY format (text input)
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = value.trim().match(dateRegex);
        if (!match) {
          return 'Please enter date in DD/MM/YYYY format';
        }
        day = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
        year = parseInt(match[3], 10);
      }
      
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
        return 'Please enter a valid date';
      }
      
      const date = new Date(year, month - 1, day);
      if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return 'Please enter a valid date';
      }
      
      // Check if person is at least 18 years old
      const today = new Date();
      const age = today.getFullYear() - year;
      if (age < 18 || (age === 18 && (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)))) {
        return 'You must be at least 18 years old';
      }
      
      return null;
    },

    // Area validation (for project forms)
    area: function(value) {
      if (!value) return 'Area is required';
      const area = parseFloat(value);
      if (isNaN(area) || area <= 0) {
        return 'Please enter a valid area in square meters';
      }
      if (area > 100000) {
        return 'Area seems too large. Please verify your input';
      }
      return null;
    },

    // Budget validation
    budget: function(value, isMax = false, minValue = null) {
      if (!value) return 'Budget is required';
      const budget = parseFloat(value);
      if (isNaN(budget) || budget < 0) {
        return 'Please enter a valid budget amount';
      }
      if (budget > 100000000) {
        return 'Budget seems too large. Please verify your input';
      }
      // If this is max budget and we have min budget, validate range
      if (isMax && minValue !== null && budget < minValue) {
        return 'Maximum budget must be greater than or equal to minimum budget';
      }
      return null;
    },

    // Text field validation (for expertise, software, etc.)
    text: function(value, minLength = 3) {
      if (!value || value.trim().length < minLength) {
        return `This field must be at least ${minLength} characters long`;
      }
      return null;
    },

    // Motivation letter validation
    motivationLetter: function(value) {
      if (!value || value.trim().length < 50) {
        return 'Motivation letter must be at least 50 characters long';
      }
      if (value.trim().length > 2000) {
        return 'Motivation letter must be less than 2000 characters';
      }
      return null;
    }
  };

  // Show error message
  function showError(input, message) {
    // Remove existing error
    removeError(input);
    
    // Add error class to input/textarea
    input.classList.add('error');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert error message after input/textarea
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }

  // Remove error message
  function removeError(input) {
    input.classList.remove('error');
    const errorMsg = input.parentNode.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }

  // Validate textarea field
  function validateTextarea(textarea) {
    const value = textarea.value.trim();
    const label = textarea.previousElementSibling?.textContent?.trim() || '';

    if (!value && textarea.hasAttribute('required')) {
      showError(textarea, 'This field is required');
      return false;
    }

    if (label.toLowerCase().includes('motivation letter')) {
      const error = validators.motivationLetter(value);
      if (error) {
        showError(textarea, error);
        return false;
      }
    }

    removeError(textarea);
    return true;
  }

  // Validate input field
  function validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const name = input.name || '';
    const placeholder = input.placeholder || '';
    const label = input.previousElementSibling?.textContent?.trim() || '';
    const form = input.closest('form');

    // Skip validation if field is empty and not required
    if (!value && !input.hasAttribute('required')) {
      removeError(input);
      return true;
    }

    // Determine validator based on field characteristics
    let error = null;

    if (type === 'email') {
      error = validators.email(value);
    } else if (type === 'number') {
      // For number inputs, validate based on label
      if (label.toLowerCase().includes('budget')) {
        const isMax = label.toLowerCase().includes('maximum');
        let minValue = null;
        if (isMax && form) {
          // Find min budget value in the form
          const minInput = form.querySelector('input[name="minBudget"]');
          if (minInput && minInput.value) {
            minValue = parseFloat(minInput.value);
          }
        }
        error = validators.budget(value, isMax, minValue);
      } else if (label.toLowerCase().includes('area') || placeholder.toLowerCase().includes('m²')) {
        error = validators.area(value);
      } else if (input.hasAttribute('required') && !value) {
        error = 'This field is required';
      }
    } else if (type === 'tel' || placeholder.toLowerCase().includes('phone') || label.toLowerCase().includes('phone')) {
      error = validators.phone(value);
    } else if (type === 'url' || placeholder.toLowerCase().includes('http') || label.toLowerCase().includes('portfolio') || label.toLowerCase().includes('linkedin')) {
      error = validators.url(value);
    } else if (label.toLowerCase().includes('first name') || label.toLowerCase().includes('last name')) {
      error = validators.name(value);
    } else if (label.toLowerCase().includes('full name') || (label.toLowerCase().includes('name') && !label.toLowerCase().includes('project'))) {
      error = validators.name(value);
    } else if (label.toLowerCase().includes('address') || label.toLowerCase().includes('location')) {
      error = validators.address(value);
    } else if (label.toLowerCase().includes('date of birth') || placeholder.includes('xx/xx/xxxx')) {
      error = validators.dateOfBirth(value);
    } else if (label.toLowerCase().includes('area') || placeholder.toLowerCase().includes('m²')) {
      error = validators.area(value);
    } else if (label.toLowerCase().includes('motivation letter')) {
      error = validators.motivationLetter(value);
    } else if (label.toLowerCase().includes('expertise') || label.toLowerCase().includes('software') || label.toLowerCase().includes('proficiency')) {
      error = validators.text(value, 3);
    } else {
      // Generic required field validation
      if (input.hasAttribute('required') && !value) {
        error = 'This field is required';
      }
    }

    if (error) {
      showError(input, error);
      return false;
    } else {
      removeError(input);
      return true;
    }
  }

  // Validate choice groups (for statement, property type, etc.)
  function validateChoiceGroup(form) {
    const choiceGroups = form.querySelectorAll('.choice-group');
    let isValid = true;

    choiceGroups.forEach(group => {
      const label = group.previousElementSibling?.textContent?.trim() || '';
      const choices = group.querySelectorAll('.choice.active');
      
      // Check if it's a single-select group (statement, service, property)
      const isSingleSelect = label.toLowerCase().includes('statement') || 
                            label.toLowerCase().includes('service') || 
                            label.toLowerCase().includes('property');
      
      if (isSingleSelect && choices.length === 0) {
        // Show error for single-select
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `Please select a ${label.toLowerCase()}`;
        group.parentNode.appendChild(errorDiv);
        isValid = false;
      } else if (!isSingleSelect && choices.length === 0) {
        // Show error for multi-select (at least one required)
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = `Please select at least one option for ${label.toLowerCase()}`;
        group.parentNode.appendChild(errorDiv);
        isValid = false;
      }
    });

    return isValid;
  }

  // Validate entire form
  function validateForm(form) {
    let isValid = true;
    
    // Validate all input fields
    const inputs = form.querySelectorAll('input[required], input[type="email"], input[type="tel"], input[type="url"]');
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    // Validate choice groups
    if (!validateChoiceGroup(form)) {
      isValid = false;
    }

    // Validate textareas
    const textareas = form.querySelectorAll('textarea[required]');
    textareas.forEach(textarea => {
      if (!textarea.value.trim()) {
        showError(textarea, 'This field is required');
        isValid = false;
      } else if (textarea.name === 'motivationLetter' || textarea.previousElementSibling?.textContent?.toLowerCase().includes('motivation')) {
        const error = validators.motivationLetter(textarea.value);
        if (error) {
          showError(textarea, error);
          isValid = false;
        }
      }
    });

    return isValid;
  }

  // Initialize form validation
  function initFormValidation() {
    const forms = document.querySelectorAll('.application-form');
    
    forms.forEach(form => {
      // Real-time validation on blur
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          // Remove error on input if field becomes valid
          if (input.classList.contains('error')) {
            validateField(input);
          }
        });
      });

      // Real-time validation for textareas
      const textareas = form.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        textarea.addEventListener('blur', () => validateTextarea(textarea));
        textarea.addEventListener('input', () => {
          if (textarea.classList.contains('error')) {
            validateTextarea(textarea);
          }
        });
      });

      // Validate on form submit/next button click
      const nextButton = form.querySelector('.next-btn');
      if (nextButton) {
        nextButton.addEventListener('click', function(e) {
          // Only prevent default if form is invalid
          if (!validateForm(form)) {
            e.preventDefault();
            e.stopPropagation();
            
            // Scroll to first error
            const firstError = form.querySelector('.error, .error-message');
            if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
          }
          // If valid, allow navigation (don't prevent default)
        });
      }
    });
  }

  // Handle next button click with validation
  window.handleNextClick = function(event, nextPage) {
    const form = event.target.closest('form');
    if (form && !validateForm(form)) {
      event.preventDefault();
      event.stopPropagation();
      
      // Scroll to first error
      const firstError = form.querySelector('.error, .error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    
    // Save form data before navigating (always save, even if validation passes)
    // Save synchronously before navigation
    if (typeof saveFormDataBeforeNavigate === 'function') {
      saveFormDataBeforeNavigate();
    } else if (typeof saveFormData === 'function') {
      saveFormData();
    }
    
    // Small delay to ensure localStorage write completes, then navigate
    setTimeout(() => {
      window.location.href = nextPage;
    }, 100);
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormValidation);
  } else {
    initFormValidation();
  }
})();

