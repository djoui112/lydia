/**
 * Form Auto-Fill Script
 * Automatically populates forms with user profile data based on user type
 * - Architect users → Application Form
 * - Client users → Project Request Form
 */

(function() {
  'use strict';

  /**
   * Get the correct API URL based on current location
   * Handles both root installations and subdirectory installations (e.g., /mimaria/)
   */
  function getProfileApiUrl() {
    // Get the current URL to determine base path
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const pathname = urlObj.pathname;
    
    // Extract base path (everything before 'pages')
    // e.g., /mimaria/pages/formarchitect/appliance.html -> /mimaria/
    const pathParts = pathname.split('/').filter(p => p);
    const pagesIndex = pathParts.indexOf('pages');
    
    let apiUrl;
    
    if (pagesIndex !== -1) {
      // Build path: /base/php/api/users/profile.php
      const baseParts = pathParts.slice(0, pagesIndex);
      const basePath = baseParts.length > 0 ? '/' + baseParts.join('/') : '';
      apiUrl = basePath + '/php/api/users/profile.php';
    } else {
      // Fallback: try relative path
      apiUrl = '../../php/api/users/profile.php';
    }
    
    // If relative, convert to absolute
    if (apiUrl.startsWith('../') || apiUrl.startsWith('./')) {
      const currentDir = pathname.substring(0, pathname.lastIndexOf('/'));
      const parts = apiUrl.split('/');
      let resolved = currentDir;
      
      for (const part of parts) {
        if (part === '..') {
          resolved = resolved.substring(0, resolved.lastIndexOf('/'));
        } else if (part !== '.' && part !== '') {
          resolved += '/' + part;
        }
      }
      
      apiUrl = urlObj.origin + resolved;
    } else if (!apiUrl.startsWith('http')) {
      // Make absolute if not already
      apiUrl = urlObj.origin + apiUrl;
    }
    
    console.log('Form autofill: Resolved API URL:', apiUrl);
    return apiUrl;
  }

  /**
   * Check if user is logged in by checking for session cookie
   * Note: Since session cookies are httpOnly, we cannot read them in JavaScript.
   * This function checks for any cookies as a basic indicator, but the real
   * authentication check happens via the API call.
   */
  function isUserLoggedIn() {
    // Note: httpOnly cookies cannot be read by JavaScript
    // This is just a basic check - real auth is done via API
    const cookies = document.cookie;
    // If there are any cookies, user might be logged in
    // But we can't check PHPSESSID directly since it's httpOnly
    return cookies.length > 0;
  }

  /**
   * Check if a field is effectively empty (empty, whitespace, or just placeholder text)
   */
  function isFieldEmpty(input) {
    if (!input) return true;
    const value = input.value || '';
    const trimmed = value.trim();
    
    // Check if it's empty or just whitespace
    if (trimmed === '') return true;
    
    // Check if it matches common placeholder patterns
    const placeholder = input.placeholder || '';
    if (placeholder && trimmed.toLowerCase() === placeholder.toLowerCase()) {
      return true;
    }
    
    // Check for placeholder-like patterns (e.g., "your full name", "contact@gmail.com")
    const placeholderPatterns = [
      /^your\s+/i,
      /^contact@/i,
      /^\+213\s*---/i,
      /^\+213\s*----\s*--/i, // More specific phone pattern
      /^\+213\s*---\s*----\s*--/i, // Phone with spaces
      /^xx\/xx\/xxxx/i,
      /^dd\/mm\/yyyy/i, // Date placeholder
      /^city\s+or\s+adress/i, // project_location placeholder
      /^city\s+or\s+address/i,
      /^---\s*----\s*--/i, // Phone pattern without +213
      /^gmail\.com$/i, // Just "gmail.com"
      /^your\s+current\s+adress/i // Address placeholder
    ];
    
    if (placeholderPatterns.some(pattern => pattern.test(trimmed))) {
      return true;
    }
    
    // If value is very short (1-2 chars) and looks like placeholder, consider it empty
    if (trimmed.length <= 2 && /^[^a-zA-Z0-9]*$/.test(trimmed)) {
      return true;
    }
    
    return false;
  }

  /**
   * Fetch user profile data from API
   */
  async function fetchUserProfile() {
    const apiUrl = getProfileApiUrl();
    
    try {
      console.log('Form autofill: Fetching from URL:', apiUrl);
      console.log('Form autofill: Current URL:', window.location.href);
      console.log('Form autofill: Current cookies:', document.cookie);
      
      // Make the API call with proper credentials
      // credentials: 'include' ensures httpOnly cookies (PHPSESSID) are sent
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include cookies for session (httpOnly cookies)
        mode: 'same-origin', // Ensure same-origin requests (for session cookies)
        cache: 'no-cache', // Don't cache authentication requests
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // Identify as AJAX request
        }
      });

      console.log('Form autofill: Response status:', response.status);
      console.log('Form autofill: Response URL:', response.url);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        try {
          const errorText = await response.text();
          console.error('Form autofill: Error response body:', errorText);
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
            errorDetails = errorJson;
          } catch (e) {
            // Not JSON, use text
            errorMessage = errorText.substring(0, 200) || errorMessage;
            errorDetails = errorText;
          }
        } catch (e) {
          console.error('Form autofill: Could not read error response');
        }
        
        if (response.status === 401) {
          console.error('Form autofill: ❌ 401 Unauthorized - Authentication failed');
          console.error('Form autofill: Error message:', errorMessage);
          console.error('Form autofill: Error details:', errorDetails);
          console.error('Form autofill: Possible causes:');
          console.error('Form autofill: 1. User is not logged in (no active session)');
          console.error('Form autofill: 2. Session cookie (PHPSESSID) is not being sent');
          console.error('Form autofill:    - Check if cookie path matches API path');
          console.error('Form autofill:    - Check if cookie domain matches');
          console.error('Form autofill:    - Check if SameSite policy allows the request');
          console.error('Form autofill: 3. Session has expired');
          console.error('Form autofill: 4. API endpoint path is incorrect');
          console.error('Form autofill: Requested URL:', apiUrl);
          console.error('Form autofill: Response URL:', response.url);
          console.error('Form autofill: Expected URL pattern:', window.location.origin + '/[base]/php/api/users/profile.php');
          console.error('Form autofill: Note: Session cookies are httpOnly and sent automatically with credentials: "include"');
          return null;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Form autofill: Response is not JSON. Content-Type:', contentType);
        console.error('Form autofill: Response text:', text.substring(0, 500));
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      console.log('Form autofill: API response data:', data);
      
      if (data.success && data.data) {
        return data.data;
      }
      
      console.warn('Form autofill: API response missing data:', data);
      return null;
    } catch (error) {
      console.error('Form autofill: Error fetching user profile:', error);
      console.error('Form autofill: Error details:', error.message);
      if (error.stack) {
        console.error('Form autofill: Stack trace:', error.stack);
      }
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
    console.log('Starting architect form autofill...', profile);
    const user = profile.user || {};
    const architect = profile.architect || {};

    console.log('User data:', user);
    console.log('Architect data:', architect);

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

    console.log('Field mapping:', fieldMapping);

    let filledCount = 0;
    // Fill form fields
    Object.keys(fieldMapping).forEach(fieldId => {
      const input = document.getElementById(fieldId) || document.querySelector(`input[name="${fieldId}"]`);
      console.log(`Looking for field: ${fieldId}`, input);
      
      if (input) {
        console.log(`Found field ${fieldId}, current value: "${input.value}", mapping value: "${fieldMapping[fieldId]}"`);
        
        if (input && fieldMapping[fieldId] && fieldMapping[fieldId].trim() !== '') {
          // Fill if field is effectively empty (allows user to override if they've typed something)
          if (isFieldEmpty(input)) {
            console.log(`Filling field ${fieldId} with value: "${fieldMapping[fieldId]}"`);
            input.value = fieldMapping[fieldId];
            // Trigger input and change events for form-persistence.js and validation
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          } else {
            console.log(`Field ${fieldId} is not empty, skipping`);
          }
        } else {
          console.log(`No value to fill for field ${fieldId}`);
        }
      } else {
        console.warn(`Field ${fieldId} not found in form`);
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

    console.log(`Architect form auto-filled with profile data. Filled ${filledCount} fields.`);
  }

  /**
   * Auto-fill client project request form
   */
  function autofillClientForm(profile) {
    console.log('Starting client form autofill...', profile);
    const user = profile.user || {};
    const client = profile.client || {};

    console.log('User data:', user);
    console.log('Client data:', client);

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

    console.log('Field mapping:', fieldMapping);

    let filledCount = 0;
    // Fill form fields
    Object.keys(fieldMapping).forEach(fieldId => {
      const input = document.getElementById(fieldId) || document.querySelector(`input[name="${fieldId}"]`);
      console.log(`Looking for field: ${fieldId}`, input);
      
      if (input) {
        console.log(`Found field ${fieldId}, current value: "${input.value}", mapping value: "${fieldMapping[fieldId]}"`);
        
        if (fieldMapping[fieldId] && fieldMapping[fieldId].trim() !== '') {
          // Fill if field is effectively empty (allows user to override if they've typed something)
          if (isFieldEmpty(input)) {
            console.log(`Filling field ${fieldId} with value: "${fieldMapping[fieldId]}"`);
            input.value = fieldMapping[fieldId];
            // Trigger input and change events for form-persistence.js and validation
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          } else {
            console.log(`Field ${fieldId} is not empty, skipping`);
          }
        } else {
          console.log(`No value to fill for field ${fieldId}`);
        }
      } else {
        console.warn(`Field ${fieldId} not found in form`);
      }
    });

    console.log(`Client form auto-filled with profile data. Filled ${filledCount} fields.`);
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
    console.log('Form autofill: Initializing...');
    console.log('Form autofill: Current URL:', window.location.href);
    console.log('Form autofill: Current pathname:', window.location.pathname);
    
    // Note: Session cookies are httpOnly, so we cannot read PHPSESSID in JavaScript
    // This is a security feature. We rely on the API call to determine authentication.
    console.log('Form autofill: Note - Session cookies are httpOnly and cannot be read by JavaScript');
    console.log('Form autofill: Authentication will be determined by API response');
    console.log('Form autofill: Visible cookies:', document.cookie || '(none)');
    
    // Determine form type first
    const formType = getFormType();
    if (!formType) {
      console.log('Form autofill: Not on a form page, skipping auto-fill');
      return;
    }

    console.log(`Form autofill: Detected form type: ${formType}`);

    // Try to fetch profile - this is the real authentication check
    // The API will return 401 if user is not logged in (session cookie not sent or invalid)
    // The session cookie (PHPSESSID) is httpOnly and will be sent automatically with credentials: 'include'
    let profile = null;
    try {
      console.log('Form autofill: Fetching user profile from API...');
      console.log('Form autofill: This will determine if user is authenticated');
      profile = await fetchUserProfile();
      
      if (profile) {
        console.log('Form autofill: ✅ Profile fetched successfully - User is authenticated');
        console.log('Form autofill: Profile data:', profile);
      } else {
        console.warn('Form autofill: ⚠️ Profile fetch returned null - User may not be authenticated');
        console.warn('Form autofill: This could mean:');
        console.warn('Form autofill: 1. User is not logged in (no valid session)');
        console.warn('Form autofill: 2. API path is incorrect');
        console.warn('Form autofill: 3. Session cookie is not being sent (path/domain mismatch)');
        console.warn('Form autofill: 4. Session has expired');
        return;
      }
    } catch (error) {
      console.error('Form autofill: ❌ Error fetching profile:', error);
      console.error('Form autofill: Error message:', error.message);
      return;
    }

    if (!profile) {
      console.log('Form autofill: Could not fetch user profile, skipping auto-fill');
      console.log('Form autofill: User is likely not logged in or session expired');
      return;
    }

    const userType = profile.user?.user_type;
    console.log(`Form autofill: User type: ${userType}`);

    // Verify user type matches form type
    if (formType === 'architect' && userType !== 'architect') {
      console.log('Form autofill: User is not an architect, skipping auto-fill');
      return;
    }

    if (formType === 'client' && userType !== 'client') {
      console.log('Form autofill: User is not a client, skipping auto-fill');
      return;
    }

    // Function to perform autofill
    const performAutofill = () => {
      console.log('Form autofill: Performing autofill...');
      if (formType === 'architect') {
        autofillArchitectForm(profile);
      } else if (formType === 'client') {
        autofillClientForm(profile);
      }
    };

    // Wait for DOM to be fully ready and form-persistence.js to restore saved data first
    const waitForForm = () => {
      const form = document.querySelector('.application-form');
      if (!form) {
        console.log('Form autofill: Form not found yet, waiting...');
        setTimeout(waitForForm, 100);
        return;
      }

      console.log('Form autofill: Form found, waiting for form-persistence...');
      
      // Wait for form-persistence.js to restore data
      setTimeout(() => {
        console.log('Form autofill: First autofill attempt...');
        performAutofill();
      }, 1500);

      setTimeout(() => {
        console.log('Form autofill: Second autofill attempt...');
        performAutofill();
      }, 2500);
      
      setTimeout(() => {
        console.log('Form autofill: Final autofill attempt...');
        performAutofill();
      }, 3500);
    };

    waitForForm();
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
