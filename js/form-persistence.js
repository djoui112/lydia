// Form data persistence across pages
// Saves form data to localStorage and restores it when navigating back

(function() {
  'use strict';

  // Get form identifier from page - use page filename for unique storage per page
  function getFormId() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop() || window.location.href.split('/').pop() || 'form';
    
    // Remove .html extension if present
    const pageName = fileName.replace('.html', '');
    
    // Use page name as unique identifier so each page has its own storage
    return `form-${pageName}`;
  }

  // Save form data to localStorage
  function saveFormData() {
    const formId = getFormId();
    const form = document.querySelector('.application-form');
    if (!form) {
      console.warn('No form found to save');
      return;
    }

    const formData = {
      inputs: {},
      choices: {},
      timestamp: Date.now()
    };

    // Save all input values
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach((input, index) => {
      // Try multiple ways to identify the field
      const label = input.previousElementSibling?.textContent?.trim() || '';
      let identifier = input.name || 
                      input.id || 
                      label ||
                      input.placeholder ||
                      `field_${index}`;
      
      const value = input.value;
      // Save by label first (most reliable), then by other identifiers
      if (label) {
        formData.inputs[label] = value;
      }
      if (identifier !== label) {
        formData.inputs[identifier] = value;
      }
      // Also save by index as backup
      formData.inputs[`field_${index}`] = value;
    });

    // Save all active choice buttons
    const choiceGroups = form.querySelectorAll('.choice-group');
    choiceGroups.forEach(group => {
      // Try to find label - could be previous sibling or parent's previous sibling (if wrapped in form-group)
      let label = '';
      const prevSibling = group.previousElementSibling;
      if (prevSibling) {
        if (prevSibling.tagName === 'LABEL') {
          label = prevSibling.textContent.trim();
        } else if (prevSibling.classList.contains('form-group')) {
          // If previous is form-group, check if it has a label before it
          const formGroupLabel = prevSibling.previousElementSibling;
          if (formGroupLabel && formGroupLabel.tagName === 'LABEL') {
            label = formGroupLabel.textContent.trim();
          }
        }
      }
      // If still no label, check parent's previous sibling
      if (!label && group.parentElement) {
        const parentPrev = group.parentElement.previousElementSibling;
        if (parentPrev && parentPrev.tagName === 'LABEL') {
          label = parentPrev.textContent.trim();
        }
      }
      
      const activeChoices = Array.from(group.querySelectorAll('.choice.active')).map(btn => btn.textContent.trim());
      if (label && activeChoices.length > 0) {
        formData.choices[label] = activeChoices;
      }
    });

    // Save to localStorage - each page has its own storage
    localStorage.setItem(formId, JSON.stringify(formData));
    console.log('Form data saved for page:', formId, formData);
  }

  // Restore form data from localStorage
  function restoreFormData() {
    const formId = getFormId();
    const form = document.querySelector('.application-form');
    if (!form) {
      console.warn('No form found to restore');
      return;
    }

    const savedData = localStorage.getItem(formId);
    
    if (!savedData) {
      console.log('No saved data found for page:', formId);
      return;
    }

    try {
      const formData = JSON.parse(savedData);
      console.log('Restoring form data:', formId, formData);

      // Restore input values
      if (formData.inputs) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach((input, index) => {
          // Try multiple ways to identify the field
          const identifiers = [
            input.name,
            input.id,
            input.previousElementSibling?.textContent?.trim(),
            input.placeholder,
            `field_${index}`
          ].filter(id => id);

          // Find matching saved data - try all identifiers
          let restored = false;
          for (const identifier of identifiers) {
            if (formData.inputs.hasOwnProperty(identifier) && formData.inputs[identifier] !== undefined) {
              input.value = formData.inputs[identifier];
              restored = true;
              // Trigger input event to remove any error states
              input.dispatchEvent(new Event('input', { bubbles: true }));
              break;
            }
          }
          
          // Also try by index as fallback
          if (!restored && formData.inputs[`field_${index}`] !== undefined) {
            input.value = formData.inputs[`field_${index}`];
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }

      // Restore choice button states
      if (formData.choices) {
        const choiceGroups = form.querySelectorAll('.choice-group');
        choiceGroups.forEach(group => {
          // Try to find label - could be previous sibling or parent's previous sibling (if wrapped in form-group)
          let label = '';
          const prevSibling = group.previousElementSibling;
          if (prevSibling) {
            if (prevSibling.tagName === 'LABEL') {
              label = prevSibling.textContent.trim();
            } else if (prevSibling.classList.contains('form-group')) {
              // If previous is form-group, check if it has a label before it
              const formGroupLabel = prevSibling.previousElementSibling;
              if (formGroupLabel && formGroupLabel.tagName === 'LABEL') {
                label = formGroupLabel.textContent.trim();
              }
            }
          }
          // If still no label, check parent's previous sibling
          if (!label && group.parentElement) {
            const parentPrev = group.parentElement.previousElementSibling;
            if (parentPrev && parentPrev.tagName === 'LABEL') {
              label = parentPrev.textContent.trim();
            }
          }
          
          if (label && formData.choices[label]) {
            const savedChoices = formData.choices[label];
            const choices = group.querySelectorAll('.choice');
            
            choices.forEach(choice => {
              const choiceText = choice.textContent.trim();
              if (savedChoices.includes(choiceText)) {
                choice.classList.add('active');
              } else {
                choice.classList.remove('active');
              }
            });
          }
        });
      }
    } catch (e) {
      console.error('Error restoring form data:', e);
    }
  }

  // Clear form data (call this on successful submission)
  function clearFormData() {
    // Clear all form data for the entire flow
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('form-')) {
        localStorage.removeItem(key);
      }
    });
    // Also clear project type
    localStorage.removeItem('project-type');
    console.log('All form data cleared');
  }

  // Initialize on page load
  function init() {
    // Restore data when page loads (each page restores only its own data)
    restoreFormData();

    // Save data when inputs change
    const form = document.querySelector('.application-form');
    if (form) {
      // Save on input change
      form.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          saveFormData();
        }
      });

      // Save when choice buttons are clicked
      form.addEventListener('click', function(e) {
        if (e.target.classList.contains('choice')) {
          // Use a longer delay to ensure active class is set after project.js handles it
          setTimeout(() => {
            saveFormData();
          }, 200);
        }
      });

      // Save before navigating to next page
      const nextButton = form.querySelector('.next-btn');
      if (nextButton) {
        const originalOnClick = nextButton.getAttribute('onclick');
        if (originalOnClick) {
          nextButton.setAttribute('onclick', 'saveFormDataBeforeNavigate(); ' + originalOnClick);
        }
      }
    }
  }

  // Function to save before navigation (called by onclick)
  window.saveFormDataBeforeNavigate = function() {
    console.log('Saving form data before navigation...');
    saveFormData();
  };

  // Also expose saveFormData globally as fallback
  window.saveFormData = saveFormData;

  // Function to clear form data (call this on success page)
  window.clearFormData = function() {
    clearFormData();
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

