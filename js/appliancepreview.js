// Get application ID or architect ID from URL
function getApplicationId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('application_id') || urlParams.get('id');
}

function getArchitectId() {
  const urlParams = new URLSearchParams(window.location.search);
  // Support both architect_id parameter and id parameter (for backward compatibility)
  return urlParams.get('architect_id') || urlParams.get('id');
}

// Function to load application data from database
async function loadApplicationData() {
  const applicationId = getApplicationId();
  const architectId = getArchitectId();
  
  if (!applicationId && !architectId) {
    console.error('No application ID or architect ID provided');
    showError('Application ID or Architect ID is required');
    return;
  }

  try {
    let url;
    // Prioritize application_id - use new API endpoint
    if (applicationId) {
      console.log('Loading application data for application ID:', applicationId);
      url = `../php/api/applications/get-application.php?application_id=${applicationId}`;
    } else {
      // Fallback to old endpoint for architect_id
      console.log('Loading application data for architect ID:', architectId);
      url = `../php/agency/applications.php?architect_id=${architectId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to load application data');
    }

    const application = result.data;

    // Populate the form with application data
    populateApplicationForm(application);
    
    // Store application ID for accept/reject
    window.currentApplicationId = application.application_id || application.id || applicationId;
    window.currentApplication = application;
    
    console.log('Application data loaded successfully:', application);
    
  } catch (error) {
    console.error('Error loading application:', error);
    showError(error.message || 'Failed to load application data. Please try again.');
  }
}

// Function to populate the form with application data
function populateApplicationForm(application) {
  console.log('Populating form with application data:', application);
  
  // Personal Information
  const firstNameEl = document.getElementById('firstName');
  const lastNameEl = document.getElementById('lastName');
  const phoneNumberEl = document.getElementById('phoneNumber');
  const addressEl = document.getElementById('address');
  const dateOfBirthEl = document.getElementById('dateOfBirth');
  
  if (firstNameEl) firstNameEl.textContent = application.first_name || 'N/A';
  if (lastNameEl) lastNameEl.textContent = application.last_name || 'N/A';
  if (phoneNumberEl) phoneNumberEl.textContent = application.phone_number || 'N/A';
  
  // Address and date of birth from architect profile
  if (addressEl) addressEl.textContent = application.address || 'N/A';
  
  let dateOfBirth = 'N/A';
  // Use pre-formatted date if available from API
  if (application.date_of_birth_formatted) {
    dateOfBirth = application.date_of_birth_formatted;
  } else if (application.date_of_birth) {
    try {
      const date = new Date(application.date_of_birth);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        // Format as DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        dateOfBirth = `${day}/${month}/${year}`;
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
  }
  if (dateOfBirthEl) dateOfBirthEl.textContent = dateOfBirth;

  // Professional Information
  const statementEl = document.getElementById('statement');
  const primaryExpertiseEl = document.getElementById('primaryExpertise');
  const softwareProficiencyEl = document.getElementById('softwareProficiency');
  
  if (statementEl) {
  const statement = application.statement || 'graduate_architect';
    const statementDisplay = statement === 'graduate_architect' || statement === 'Graduate Architect' 
      ? 'Graduate Architect' 
      : 'Intern';
    statementEl.textContent = statementDisplay;
  }

  if (primaryExpertiseEl) {
    primaryExpertiseEl.textContent = application.primary_expertise || 'N/A';
  }
  
  if (softwareProficiencyEl) {
    softwareProficiencyEl.textContent = application.software_proficiency || 'N/A';
  }

  // Types of Projects from application
  let projectTypes = [];
  // Use pre-parsed array if available from API
  if (application.project_types_array && Array.isArray(application.project_types_array)) {
    projectTypes = application.project_types_array;
  } else if (application.project_types) {
    try {
      // Try parsing as JSON first
      projectTypes = JSON.parse(application.project_types);
      if (!Array.isArray(projectTypes)) {
        throw new Error('Not an array');
      }
    } catch (e) {
      // If not JSON, treat as comma-separated string
      projectTypes = application.project_types.split(',').map(type => type.trim()).filter(type => type);
    }
  }
  
  const projectTypesContainer = document.getElementById('projectTypesContainer');
  if (projectTypesContainer) {
    projectTypesContainer.innerHTML = '';
    if (projectTypes.length > 0) {
      projectTypes.forEach(type => {
        const span = document.createElement('span');
        span.className = 'choice-display';
        span.textContent = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
        projectTypesContainer.appendChild(span);
      });
    } else {
      projectTypesContainer.innerHTML = '<span class="choice-display">N/A</span>';
    }
  }

  // Contact & Portfolio
  const emailEl = document.getElementById('email');
  const portfolioLink = document.getElementById('portfolio');
  const linkedinLink = document.getElementById('linkedin');
  const motivationLetterEl = document.getElementById('motivationLetter');
  
  if (emailEl) {
    emailEl.textContent = application.email || 'N/A';
  }
  
  if (portfolioLink) {
  if (application.portfolio_url) {
    portfolioLink.textContent = application.portfolio_url;
    portfolioLink.href = application.portfolio_url;
      portfolioLink.target = '_blank';
  } else {
    portfolioLink.textContent = 'N/A';
    portfolioLink.href = '#';
      portfolioLink.onclick = (e) => e.preventDefault();
    }
  }
  
  if (linkedinLink) {
  if (application.linkedin_url) {
    linkedinLink.textContent = application.linkedin_url;
    linkedinLink.href = application.linkedin_url;
      linkedinLink.target = '_blank';
  } else {
    linkedinLink.textContent = 'N/A';
    linkedinLink.href = '#';
      linkedinLink.onclick = (e) => e.preventDefault();
    }
  }
  
  if (motivationLetterEl) {
    motivationLetterEl.textContent = 
    application.motivation_letter || 'No motivation letter provided.';
  }
  
  // Agency Information (only show if data is available)
  const agencySection = document.getElementById('agencySection');
  if (agencySection && application.agency_name) {
    const agencyNameEl = document.getElementById('agencyName');
    const agencyCityEl = document.getElementById('agencyCity');
    const agencyAddressEl = document.getElementById('agencyAddress');
    const agencyEmailEl = document.getElementById('agencyEmail');
    const agencyPhoneEl = document.getElementById('agencyPhone');
    const agencyBioEl = document.getElementById('agencyBio');
    
    if (agencyNameEl) agencyNameEl.textContent = application.agency_name || 'N/A';
    if (agencyCityEl) agencyCityEl.textContent = application.agency_city || 'N/A';
    if (agencyAddressEl) agencyAddressEl.textContent = application.agency_address || 'N/A';
    if (agencyEmailEl) agencyEmailEl.textContent = application.agency_email || 'N/A';
    if (agencyPhoneEl) agencyPhoneEl.textContent = application.agency_phone || 'N/A';
    if (agencyBioEl) agencyBioEl.textContent = application.agency_bio || 'N/A';
    
    agencySection.style.display = 'block';
  }
  
  console.log('Form populated successfully');
}

function showError(message) {
  const container = document.querySelector('.preview-container');
  if (container) {
    container.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">${message}</div>`;
  }
}

async function handleAccept() {
  if (!window.currentApplicationId) {
    alert('Application ID not found');
    return;
  }

  if (!confirm('Are you sure you want to accept this application? The architect will be added to your team.')) {
    return;
  }

  try {
    const response = await fetch('../php/agency/applications.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        application_id: window.currentApplicationId,
        action: 'accept'
      })
    });

    const result = await response.json();

    if (result.success) {
      // Store accepted application ID in sessionStorage for UI update
      if (window.currentApplication) {
        sessionStorage.setItem('acceptedApplication', JSON.stringify({
          applicationId: window.currentApplicationId,
          architectId: window.currentApplication.architect_id,
          firstName: window.currentApplication.first_name,
          lastName: window.currentApplication.last_name,
          profileImage: window.currentApplication.profile_image
        }));
      }
      
      alert('Application accepted! The architect has been added to your team.');
      window.location.href = 'agency-interface.html#team-management';
    } else {
      alert(result.message || 'Failed to accept application');
    }
  } catch (error) {
    console.error('Error accepting application:', error);
    alert('Failed to accept application. Please try again.');
  }
}

async function handleReject() {
  if (!window.currentApplicationId) {
    alert('Application ID not found');
    return;
  }

  if (!confirm('Are you sure you want to reject this application?')) {
    return;
  }

  try {
    const response = await fetch('../php/agency/applications.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        application_id: window.currentApplicationId,
        action: 'reject'
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('Application rejected.');
      window.location.href = 'agency-interface.html#team-management';
    } else {
      alert(result.message || 'Failed to reject application');
    }
  } catch (error) {
    console.error('Error rejecting application:', error);
    alert('Failed to reject application. Please try again.');
  }
}

// Check user type and show/hide action buttons accordingly
async function checkUserTypeAndSetupButtons() {
  try {
    const response = await fetch('../php/api/users/profile.php', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data?.user?.user_type) {
        const userType = result.data.user.user_type;
        const actionButtons = document.querySelector('.action-buttons');
        
        // Only show action buttons for agencies
        if (actionButtons) {
          if (userType !== 'agency') {
            actionButtons.style.display = 'none';
          } else {
            actionButtons.style.display = 'flex';
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking user type:', error);
    // Hide buttons on error to be safe
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
      actionButtons.style.display = 'none';
    }
  }
}

// Load data when page loads
window.addEventListener('DOMContentLoaded', () => {
  loadApplicationData();
  checkUserTypeAndSetupButtons();
});
