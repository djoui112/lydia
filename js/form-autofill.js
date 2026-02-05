/**
 * Form Auto-Fill Script
 * Automatically populates forms with user profile data based on user type
 * - Architect users → Application Form
 * - Client users → Project Request Form
 */

(function() {
  'use strict';

  // API endpoint for fetching user profile
  // Forms are in pages/formarchitect/ or pages/formclient/, so go up 2 levels
  const PROFILE_API_URL = '../../php/api/users/profile.php';

  /**
   * Check if user is logged in by checking for session cookie
   * Note: This is a client-side check. Actual authentication is handled server-side.
   */
  function isUserLoggedIn() {
    // Check if we have a session cookie (PHPSESSID)
    const cookies = document.cookie.split(';');
    const hasSession = cookies.some(cookie => 
      cookie.trim().startsWith('PHPSESSID=')
    );
    return hasSession;
  }

  /**
   * Fetch user profile data from API
   */
  async function fetchUserProfile() {
    try {
      const response = await fetch(PROFILE_API_URL, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not logged in');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Format date from database format (YYYY-MM-DD) to display format
   */
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    // If already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Try to parse and format
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateString;
  }

  /**
   * Auto-fill architect application form
   */
  function autofillArchitectForm(profile) {
    const user = profile.user || {};
    const architect = profile.architect || {};

    // Map profile data to form fields
    const fieldMapping = {
      // Page 1: appliance.html
      'first_name': architect.first_name || '',
      'last_name': architect.last_name || '',
      'phone_number': user.phone_number || '',
      'address': architect.address || '',
      'date_of_birth': formatDateForInput(architect.date_of_birth),
      
      // Page 2: appliancestyle.html
      'primary_expertise': architect.primary_expertise || '',
      'software_proficiency': architect.software_proficiency || '',
      
      // Page 3: appliancepro.html
      'portfolio_url': architect.portfolio_url || '',
      'linkedin_url': architect.linkedin_url || '',
      'email': user.email || ''
    };

    // Fill form fields
    Object.keys(fieldMapping).forEach(fieldId => {
      const input = document.getElementById(fieldId) || document.querySelector(`input[name="${fieldId}"]`);
      if (input && fieldMapping[fieldId]) {
        // Only fill if field is empty (allow user to override)
        if (!input.value || input.value.trim() === '') {
          input.value = fieldMapping[fieldId];
          // Trigger input event for form-persistence.js
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    // Handle statement selection (graduate architect / intern)
    const statement = architect.statement;
    if (statement) {
      // Find the statement choice group (label contains "statement")
      const labels = document.querySelectorAll('label');
      let statementGroup = null;
      
      labels.forEach(label => {
        if (label.textContent.trim().toLowerCase().includes('statement')) {
          const group = label.nextElementSibling;
          if (group && group.classList.contains('choice-group')) {
            statementGroup = group;
          }
        }
      });
      
      if (statementGroup) {
        const statementButtons = statementGroup.querySelectorAll('.choice');
        statementButtons.forEach(btn => {
          const btnText = btn.textContent.trim().toLowerCase();
          // Map database values to button text
          // 'graduate_architect' -> 'graduate architect'
          // 'intern' -> 'intern'
          const normalizedStatement = statement.toLowerCase().replace('_', ' ');
          if (btnText.includes(normalizedStatement) || btnText === normalizedStatement) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    }

    console.log('Architect form auto-filled with profile data');
  }

  /**
   * Auto-fill client project request form
   */
  function autofillClientForm(profile) {
    const user = profile.user || {};
    const client = profile.client || {};

    // Combine first_name and last_name for full_name
    const fullName = client.first_name && client.last_name 
      ? `${client.first_name} ${client.last_name}`.trim()
      : (client.first_name || client.last_name || '');

    // Map profile data to form fields
    const fieldMapping = {
      'full_name': fullName,
      'phone_number': user.phone_number || '',
      'email': user.email || '',
      // Note: project_location is not in profile, so we don't auto-fill it
    };

    // Fill form fields
    Object.keys(fieldMapping).forEach(fieldId => {
      const input = document.getElementById(fieldId) || document.querySelector(`input[name="${fieldId}"]`);
      if (input && fieldMapping[fieldId]) {
        // Only fill if field is empty (allow user to override)
        if (!input.value || input.value.trim() === '') {
          input.value = fieldMapping[fieldId];
          // Trigger input event for form-persistence.js
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    console.log('Client form auto-filled with profile data');
  }

  /**
   * Determine which form to auto-fill based on current page
   */
  function getFormType() {
    const path = window.location.pathname;
    
    // Check if we're on architect application form pages
    if (path.includes('/formarchitect/')) {
      return 'architect';
    }
    
    // Check if we're on client project request form pages
    if (path.includes('/formclient/')) {
      return 'client';
    }
    
    return null;
  }

  /**
   * Main initialization function
   */
  async function initAutofill() {
    // Check if user is logged in (client-side check)
    if (!isUserLoggedIn()) {
      console.log('User not logged in, skipping auto-fill');
      return;
    }

    // Determine form type
    const formType = getFormType();
    if (!formType) {
      console.log('Not on a form page, skipping auto-fill');
      return;
    }

    // Wait a bit for form-persistence.js to restore saved data first
    // This ensures auto-fill doesn't overwrite user's saved progress
    setTimeout(async () => {
      // Fetch user profile
      const profile = await fetchUserProfile();
      
      if (!profile) {
        console.log('Could not fetch user profile');
        return;
      }

      const userType = profile.user?.user_type;

      // Verify user type matches form type
      if (formType === 'architect' && userType !== 'architect') {
        console.log('User is not an architect, skipping auto-fill');
        return;
      }

      if (formType === 'client' && userType !== 'client') {
        console.log('User is not a client, skipping auto-fill');
        return;
      }

      // Auto-fill the appropriate form
      if (formType === 'architect') {
        autofillArchitectForm(profile);
      } else if (formType === 'client') {
        autofillClientForm(profile);
      }
    }, 500); // Wait 500ms for form-persistence.js to restore data first
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutofill);
  } else {
    initAutofill();
  }

  // Expose functions globally for debugging
  window.formAutofill = {
    init: initAutofill,
    fetchProfile: fetchUserProfile,
    isLoggedIn: isUserLoggedIn
  };

})();
