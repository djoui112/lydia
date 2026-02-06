// Get application ID from URL
function getApplicationId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Function to load application data from database
async function loadApplicationData() {
  const applicationId = getApplicationId();
  
  if (!applicationId) {
    console.error('No application ID provided');
    showError('Application ID is required');
    return;
  }

  try {
    console.log('Loading application data for ID:', applicationId);
    const response = await fetch(`../php/agency/applications.php?id=${applicationId}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Failed to load application data');
    }

    const application = result.data;

    // Populate the form with application data
    populateApplicationForm(application);
    
    // Store application ID for accept/reject
    window.currentApplicationId = applicationId;
    window.currentApplication = application;
    
  } catch (error) {
    console.error('Error loading application:', error);
    showError('Failed to load application data. Please try again.');
  }
}

// Function to populate the form with application data
function populateApplicationForm(application) {
  // Personal Information
  document.getElementById('firstName').textContent = application.first_name || 'N/A';
  document.getElementById('lastName').textContent = application.last_name || 'N/A';
  document.getElementById('phoneNumber').textContent = application.phone_number || 'N/A';
  
  // Address and date of birth from architect profile
  document.getElementById('address').textContent = application.address || 'N/A';
  const dateOfBirth = application.date_of_birth 
    ? new Date(application.date_of_birth).toLocaleDateString('en-GB')
    : 'N/A';
  document.getElementById('dateOfBirth').textContent = dateOfBirth;

  // Professional Information
  const statement = application.statement || 'graduate_architect';
  const statementDisplay = statement === 'graduate_architect' ? 'Graduate Architect' : 'Intern';
  document.getElementById('statement').textContent = statementDisplay;

  document.getElementById('primaryExpertise').textContent = 
    application.primary_expertise || 'N/A';
  
  document.getElementById('softwareProficiency').textContent = 
    application.software_proficiency || 'N/A';

  // Types of Projects from application
  let projectTypes = [];
  if (application.project_types) {
    try {
      // Try parsing as JSON first
      projectTypes = JSON.parse(application.project_types);
    } catch (e) {
      // If not JSON, treat as comma-separated string
      projectTypes = application.project_types.split(',').map(type => type.trim());
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
  document.getElementById('email').textContent = application.email || 'N/A';
  
  const portfolioLink = document.getElementById('portfolio');
  if (application.portfolio_url) {
    portfolioLink.textContent = application.portfolio_url;
    portfolioLink.href = application.portfolio_url;
  } else {
    portfolioLink.textContent = 'N/A';
    portfolioLink.href = '#';
  }
  
  const linkedinLink = document.getElementById('linkedin');
  if (application.linkedin_url) {
    linkedinLink.textContent = application.linkedin_url;
    linkedinLink.href = application.linkedin_url;
  } else {
    linkedinLink.textContent = 'N/A';
    linkedinLink.href = '#';
  }
  
  document.getElementById('motivationLetter').textContent = 
    application.motivation_letter || 'No motivation letter provided.';
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

// Load data when page loads
window.addEventListener('DOMContentLoaded', loadApplicationData);
