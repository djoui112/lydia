// Function to load request data from API
async function loadFormData() {
  // Get request ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  
  if (!requestId) {
    console.error('No request ID found in URL');
    alert('Invalid request. Please go back and try again.');
    return;
  }
  
  try {
    // Determine API base path
    const path = window.location.pathname;
    const apiBase = path.includes('/pages/') ? '../../php/api' : '../php/api';
    const url = `${apiBase}/project-requests/get.php?id=${requestId}`;
    
    console.log('🌐 Fetching from API:', url);
    console.log('Current path:', path);
    console.log('API base:', apiBase);
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Unauthorized - not logged in');
        alert('Please log in to view request details.');
        window.location.href = 'login/login.html';
        return;
      }
      if (response.status === 403) {
        console.error('❌ Forbidden - insufficient permissions');
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'You do not have permission to view this request.');
        window.history.back();
        return;
      }
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📦 API Response:', result);
    
    if (!result.success) {
      if (response.status === 404) {
        console.error('❌ Request not found');
        alert('Request not found. It may have been deleted or you don\'t have permission to view it.');
        window.location.href = 'request-managment.html';
        return;
      }
      console.error('❌ API returned success=false:', result.message);
      throw new Error(result.message || 'Failed to load request data');
    }
    
    if (!result.data) {
      console.error('❌ No data in API response');
      throw new Error('No data returned from server');
    }
    
    console.log('✅ API call successful, data received');
    
    const request = result.data;
    console.log('=== REQUEST DATA FROM API ===');
    console.log('Full request object:', JSON.stringify(request, null, 2));
    console.log('First name:', request.first_name);
    console.log('Last name:', request.last_name);
    console.log('Project location:', request.project_location);
    console.log('Min budget:', request.min_budget);
    console.log('Max budget:', request.max_budget);
    console.log('Timeline:', request.preferred_timeline);
    console.log('Style:', request.style_preference);
    console.log('Interior details:', request.interior_details);
    console.log('Exterior details:', request.exterior_details);
    console.log('============================');
    
    // Populate basic information - FORCE use of API data
    const clientName = `${request.first_name || ''} ${request.last_name || ''}`.trim();
    if (!clientName || clientName === '') {
      console.error('Client name is empty! Request data:', request);
    }
    document.getElementById('fullName').textContent = clientName || 'Not specified';
    
    // Phone number - try to extract from description first (form phone), then use user account phone
    let phoneNumber = request.client_phone || 'N/A';
    let description = request.description || '';
    if (description.includes('Contact Phone:')) {
      const phoneMatch = description.match(/Contact Phone:\s*([^\n]+)/);
      if (phoneMatch && phoneMatch[1]) {
        phoneNumber = phoneMatch[1].trim();
        console.log('Using phone number from form:', phoneNumber);
      }
    }
    document.getElementById('phoneNumber').textContent = phoneNumber;
    console.log('Phone number displayed:', phoneNumber);
    
    // Email from users table
    const email = request.client_email || 'N/A';
    document.getElementById('email').textContent = email;
    console.log('Email:', email);
    
    // Project location from project_requests table - FORCE use of API data
    const projectLocation = request.project_location;
    if (!projectLocation) {
      console.error('Project location is NULL in API response!');
    }
    document.getElementById('projectLocation').textContent = projectLocation || 'Not specified';
    console.log('Project location set to:', projectLocation || 'Not specified');
    
    // Description/Notes - remove duplicates
    // Reuse description variable already declared above (line 88)
    // Remove duplicate sections
    const sections = ['Contact Phone:', 'Special Requirements:', 'Environmental Considerations:', 'Additional Notes:', 'Contact Method:'];
    const seen = new Set();
    const lines = description.split('\n');
    const cleanedLines = [];
    let currentSection = null;
    
    for (const line of lines) {
      let isSectionHeader = false;
      for (const section of sections) {
        if (line.trim().startsWith(section)) {
          isSectionHeader = true;
          const sectionKey = section;
          if (seen.has(sectionKey)) {
            // Skip duplicate section
            currentSection = null;
            continue;
          }
          seen.add(sectionKey);
          currentSection = sectionKey;
          cleanedLines.push(line);
          break;
        }
      }
      if (!isSectionHeader && currentSection) {
        cleanedLines.push(line);
      } else if (!isSectionHeader && line.trim()) {
        cleanedLines.push(line);
      }
    }
    description = cleanedLines.join('\n');
    console.log('Description/Notes (cleaned):', description);
    
    // Show project name if available
    if (request.project_name) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        titleElement.textContent = request.project_name + ' - Request Preview';
      }
    }

    // Project Type
    const projectType = request.project_type || 'exterior';
    const projectTypeDisplay = projectType === 'exterior' ? 'Exterior' : 
                                projectType === 'interior' ? 'Interior' : 
                                projectType === 'both' ? 'Both' : 'Exterior';
    document.getElementById('projectType').textContent = projectTypeDisplay;

    // Show/hide sections based on project type
    const interiorSection = document.getElementById('interiorSection');
    const exteriorSection = document.getElementById('exteriorSection');
    
    if (projectType === 'interior' || projectType === 'both') {
      interiorSection.style.display = 'block';
      // Load interior data from API response
      loadInteriorData(request);
    } else {
      interiorSection.style.display = 'none';
    }

    if (projectType === 'exterior' || projectType === 'both') {
      exteriorSection.style.display = 'block';
      // Load exterior data from API response
      loadExteriorData(request);
    } else {
      exteriorSection.style.display = 'none';
    }
    
    // Load contact preferences - extract from description if available
    let contactMethod = request.preferred_contact_method || 'Email';
    if (description.includes('Contact Method:')) {
      const contactMatch = description.match(/Contact Method:\s*([^\n]+)/);
      if (contactMatch && contactMatch[1]) {
        contactMethod = contactMatch[1].trim();
      }
    }
    document.getElementById('contactMethod').textContent = contactMethod;
    
  } catch (error) {
    console.error('❌ ERROR loading request data:', error);
    console.error('Error stack:', error.stack);
    // Don't fall back to localStorage - show error instead
    document.getElementById('fullName').textContent = 'Error loading data';
    document.getElementById('phoneNumber').textContent = 'Error loading data';
    document.getElementById('email').textContent = 'Error loading data';
    document.getElementById('projectLocation').textContent = 'Error loading data';
    alert('Error loading request details: ' + error.message + '\n\nPlease check the browser console for details.');
    throw error; // Re-throw to prevent fallback
  }
}

// Function to load form data from localStorage if available (fallback)
function loadFormDataFromLocalStorage() {
  // Basic Information
  const fullName = localStorage.getItem('fullName') || 'John Doe';
  const phoneNumber = localStorage.getItem('phoneNumber') || '+213 550 000 000';
  const email = localStorage.getItem('email') || 'contact@example.com';
  const projectLocation = localStorage.getItem('projectLocation') || 'Algiers, Algeria';

  document.getElementById('fullName').textContent = fullName;
  document.getElementById('phoneNumber').textContent = phoneNumber;
  document.getElementById('email').textContent = email;
  document.getElementById('projectLocation').textContent = projectLocation;

  // Project Type
  const projectType = localStorage.getItem('project-type') || 'both';
  const projectTypeDisplay = projectType === 'exterior' ? 'Exterior' : 
                              projectType === 'interior' ? 'Interior' : 'Both';
  document.getElementById('projectType').textContent = projectTypeDisplay;

  // Show/hide sections based on project type
  const interiorSection = document.getElementById('interiorSection');
  const exteriorSection = document.getElementById('exteriorSection');
  
  if (projectType === 'interior' || projectType === 'both') {
    interiorSection.style.display = 'block';
    // Load interior data
    loadInteriorData();
  } else {
    interiorSection.style.display = 'none';
  }

  if (projectType === 'exterior' || projectType === 'both') {
    exteriorSection.style.display = 'block';
    // Load exterior data
    loadExteriorData();
  } else {
    exteriorSection.style.display = 'none';
  }
}

function loadInteriorData(request = null) {
  let interior = null;
  
  if (request && request.interior_details) {
    interior = request.interior_details;
    console.log('Loading interior data from API:', interior);
  } else {
    console.warn('No interior details found in API response');
  }
  
  // Load interior-specific data from API - prioritize API data
  document.getElementById('interiorLocation').textContent = 
    interior?.interior_location || request?.project_location || 'N/A';
  document.getElementById('totalArea').textContent = 
    interior?.area ? `${interior.area} m²` : 'N/A';
  document.getElementById('numberOfRooms').textContent = 
    interior?.number_of_rooms ? `${interior.number_of_rooms} rooms` : 'N/A';
  document.getElementById('interiorType').textContent = 
    interior?.property_type ? interior.property_type.charAt(0).toUpperCase() + interior.property_type.slice(1) : 'N/A';
  document.getElementById('interiorCondition').textContent = 
    'N/A'; // This field doesn't exist in the database
  document.getElementById('interiorServiceType').textContent = 
    request?.service_type ? request.service_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
  
  // Budget from main request table - use actual data from API
  const minBudget = request?.min_budget || null;
  const maxBudget = request?.max_budget || null;
  if (minBudget && maxBudget) {
    document.getElementById('interiorBudget').textContent = 
      `${parseFloat(minBudget).toLocaleString()} DZD - ${parseFloat(maxBudget).toLocaleString()} DZD`;
  } else if (minBudget) {
    document.getElementById('interiorBudget').textContent = 
      `Min: ${parseFloat(minBudget).toLocaleString()} DZD`;
  } else if (maxBudget) {
    document.getElementById('interiorBudget').textContent = 
      `Max: ${parseFloat(maxBudget).toLocaleString()} DZD`;
  } else {
    document.getElementById('interiorBudget').textContent = 'Not specified';
  }
  
  document.getElementById('interiorTimeline').textContent = 
    request?.preferred_timeline || 'Not specified';
  document.getElementById('interiorStyle').textContent = 
    interior?.style_preference || request?.style_preference || 'Not specified';
  document.getElementById('interiorColors').textContent = 
    interior?.color_scheme || 'Not specified';
  
  // Fields not in database - show Not specified
  document.getElementById('furnitureIncluded').textContent = 'Not specified';
  document.getElementById('lightingRequirements').textContent = 'Not specified';
  document.getElementById('storageNeeds').textContent = 'Not specified';
  
  // Special Requirements - from interior_details table
  const specialRequirements = interior?.special_requirements || '';
  const specialFeaturesArray = specialRequirements ? specialRequirements.split(',').map(feature => feature.trim()) : [];
  const specialFeaturesContainer = document.getElementById('specialFeaturesContainer');
  if (specialFeaturesContainer) {
    specialFeaturesContainer.innerHTML = '';
    if (specialFeaturesArray.length > 0) {
      specialFeaturesArray.forEach(feature => {
        const span = document.createElement('span');
        span.className = 'choice-display';
        span.textContent = feature;
        specialFeaturesContainer.appendChild(span);
      });
    } else {
      specialFeaturesContainer.textContent = 'N/A';
    }
  }
  
  // Additional Notes - from main request description
  let interiorNotes = request?.description || '';
  // Remove contact phone and extract just the "Additional Notes" part if it exists
  if (interiorNotes.includes('Contact Phone:')) {
    interiorNotes = interiorNotes.replace(/Contact Phone:.*?(?=\n\n|$)/g, '').trim();
  }
  if (interiorNotes.includes('Additional Notes:')) {
    const notesMatch = interiorNotes.match(/Additional Notes:\s*(.+)/);
    if (notesMatch) {
      interiorNotes = notesMatch[1].trim();
    }
  }
  
  document.getElementById('interiorNotes').textContent = 
    interiorNotes || 'No additional notes provided';
  
  console.log('Full description:', request?.description);
  console.log('Interior notes set to:', interiorNotes);
}

function loadExteriorData(request = null) {
  let exterior = null;
  
  if (request && request.exterior_details) {
    exterior = request.exterior_details;
    console.log('Loading exterior data from API:', exterior);
  } else {
    console.warn('No exterior details found in API response');
  }
  
  // Load exterior-specific data from API - ONLY use API data, no localStorage fallback
  document.getElementById('exteriorLocation').textContent = 
    request?.project_location || 'Not specified';
  document.getElementById('approximateArea').textContent = 
    exterior?.area ? `${exterior.area} m²` : 'Not specified';
  document.getElementById('propertyType').textContent = 
    exterior?.property_type ? exterior.property_type.charAt(0).toUpperCase() + exterior.property_type.slice(1).replace('_', ' ') : 'Not specified';
  document.getElementById('numberOfFloors').textContent = 
    exterior?.number_of_floors ? `${exterior.number_of_floors} floors` : 'Not specified';
  document.getElementById('exteriorCondition').textContent = 
    'Not specified'; // This field doesn't exist in the database
  document.getElementById('exteriorServiceType').textContent = 
    request?.service_type ? request.service_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified';
  
  // Budget from main request table - use actual data from API
  const minBudget = request?.min_budget || null;
  const maxBudget = request?.max_budget || null;
  if (minBudget && maxBudget) {
    document.getElementById('exteriorBudget').textContent = 
      `${parseFloat(minBudget).toLocaleString()} DZD - ${parseFloat(maxBudget).toLocaleString()} DZD`;
  } else if (minBudget) {
    document.getElementById('exteriorBudget').textContent = 
      `Min: ${parseFloat(minBudget).toLocaleString()} DZD`;
  } else if (maxBudget) {
    document.getElementById('exteriorBudget').textContent = 
      `Max: ${parseFloat(maxBudget).toLocaleString()} DZD`;
  } else {
    document.getElementById('exteriorBudget').textContent = 'Not specified';
  }
  
  document.getElementById('exteriorTimeline').textContent = 
    request?.preferred_timeline || 'Not specified';
  document.getElementById('exteriorStyle').textContent = 
    exterior?.style_preference || request?.style_preference || 'Not specified';
  
  // Material Preferences - from exterior_details table
  const materialPreferences = exterior?.material_preferences || '';
  const materialPreferencesArray = materialPreferences ? materialPreferences.split(',').map(material => material.trim()) : [];
  const materialPreferencesContainer = document.getElementById('materialPreferencesContainer');
  if (materialPreferencesContainer) {
    materialPreferencesContainer.innerHTML = '';
    if (materialPreferencesArray.length > 0) {
      materialPreferencesArray.forEach(material => {
        const span = document.createElement('span');
        span.className = 'choice-display';
        span.textContent = material;
        materialPreferencesContainer.appendChild(span);
      });
    } else {
      materialPreferencesContainer.textContent = 'Not specified';
    }
  }
  
  // Get description once for this function
  const description = request?.description || '';
  
  // Special Requirements - from exterior_details table first, then from description
  let specialReqs = exterior?.special_requirements || '';
  if (!specialReqs) {
    // Try to extract from description
    if (description.includes('Special Requirements:')) {
      const reqMatch = description.match(/Special Requirements:\s*(.+?)(?:\n\n|$)/);
      if (reqMatch) {
        specialReqs = reqMatch[1].trim();
      }
    }
  }
  document.getElementById('exteriorSpecialRequirements').textContent = 
    specialReqs || 'No special requirements specified';
  
  // Environmental Considerations - extract from description
  let environmentalConsiderations = 'Not specified';
  if (description.includes('Environmental Considerations:')) {
    const envMatch = description.match(/Environmental Considerations:\s*(.+?)(?:\n\n|$)/);
    if (envMatch) {
      environmentalConsiderations = envMatch[1].trim();
    }
  }
  document.getElementById('environmentalConsiderations').textContent = environmentalConsiderations;
  
  // Additional Notes - from main request description (remove duplicates)
  let exteriorNotes = description;
  // Remove contact phone, special requirements and environmental considerations from notes
  if (exteriorNotes.includes('Contact Phone:')) {
    exteriorNotes = exteriorNotes.replace(/Contact Phone:.*?(?=\n\n|$)/g, '').trim();
  }
  if (exteriorNotes.includes('Special Requirements:')) {
    exteriorNotes = exteriorNotes.replace(/Special Requirements:.*?(?=\n\n|$)/g, '').trim();
  }
  if (exteriorNotes.includes('Environmental Considerations:')) {
    exteriorNotes = exteriorNotes.replace(/Environmental Considerations:.*?(?=\n\n|$)/g, '').trim();
  }
  if (exteriorNotes.includes('Contact Method:')) {
    exteriorNotes = exteriorNotes.replace(/Contact Method:.*?(?=\n\n|$)/g, '').trim();
  }
  if (exteriorNotes.includes('Additional Notes:')) {
    const notesMatch = exteriorNotes.match(/Additional Notes:\s*(.+)/);
    if (notesMatch) {
      exteriorNotes = notesMatch[1].trim();
    }
  }
  
  document.getElementById('exteriorNotes').textContent = 
    exteriorNotes || 'No additional notes provided';
  
  console.log('Full description:', description);
  console.log('Exterior notes set to:', exteriorNotes);
}

// Global variable to store current request ID
let currentRequestId = null;

function handleAccept() {
  // Show modal to select architect
  const modal = document.getElementById('acceptModal');
  if (modal) {
    modal.style.display = 'flex';
    loadArchitectsForAssignment();
  }
}

function closeAcceptModal() {
  const modal = document.getElementById('acceptModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function loadArchitectsForAssignment() {
  const select = document.getElementById('architectSelect');
  const noArchitectsNote = document.getElementById('noArchitectsNote');
  
  if (!select) return;
  
  select.innerHTML = '<option value="">Loading architects...</option>';
  
  try {
    // Get agency ID from session
    const sessionResponse = await fetch('../../php/api/get-session-agency.php', {
      credentials: 'include'
    });
    
    if (!sessionResponse.ok) {
      throw new Error('Failed to get agency ID');
    }
    
    const sessionData = await sessionResponse.json();
    
    if (!sessionData || !sessionData.agency_id) {
      select.innerHTML = '<option value="">Not logged in as agency</option>';
      return;
    }
    
    const agencyId = sessionData.agency_id;
    
    // Fetch team members (architects) for this agency
    const response = await fetch(`../../php/api/search/team-members.php?agency_id=${agencyId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      select.innerHTML = '<option value="">-- Select an architect (optional) --</option>';
      
      result.data.forEach(architect => {
        const fullName = `${architect.first_name || ''} ${architect.last_name || ''}`.trim();
        const role = architect.role ? ` - ${architect.role}` : '';
        const option = document.createElement('option');
        option.value = architect.architect_id;
        option.textContent = `${fullName}${role}`;
        select.appendChild(option);
      });
      
      noArchitectsNote.style.display = 'none';
    } else {
      select.innerHTML = '<option value="">No team members - Accept without assigning</option>';
      noArchitectsNote.style.display = 'block';
      noArchitectsNote.textContent = 'You don\'t have any team members yet. You can accept the request without assigning an architect, or add team members from the Team Management section first.';
    }
  } catch (error) {
    console.error('Error loading architects:', error);
    select.innerHTML = '<option value="">Error loading architects</option>';
    noArchitectsNote.style.display = 'block';
  }
}

async function confirmAccept() {
  if (!currentRequestId) {
    alert('Error: Request ID not found');
    return;
  }
  
  const select = document.getElementById('architectSelect');
  const assignedArchitectId = select.value || null;
  
  if (!confirm('Are you sure you want to accept this request?')) {
    return;
  }
  
  try {
    // Determine API base path
    const path = window.location.pathname;
    const apiBase = path.includes('/pages/') ? '../../php/agency' : '../php/agency';
    const url = `${apiBase}/project-requests.php`;
    
    console.log('Accepting request:', {
      requestId: currentRequestId,
      assignedArchitectId: assignedArchitectId,
      url: url
    });
    
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: parseInt(currentRequestId),
        action: 'accept',
        assigned_architect_id: assignedArchitectId ? parseInt(assignedArchitectId) : null
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert('Request accepted successfully! A project has been created.');
      closeAcceptModal();
      window.location.href = 'request-managment.html';
    } else {
      alert(result.message || 'Failed to accept request');
    }
  } catch (error) {
    console.error('Error accepting request:', error);
    alert('Error accepting request: ' + error.message);
  }
}

function handleReject() {
  // Handle reject action
  if (confirm('Are you sure you want to reject this request?')) {
    alert('Request rejected.');
    // You can add navigation or API call here
    // window.location.href = 'reject-page.html';
  }
}

// Load data when page loads
window.addEventListener('DOMContentLoaded', () => {
  // ALWAYS try to load from API first if there's an ID
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  currentRequestId = requestId;
  
  console.log('=== PAGE LOADED ===');
  console.log('URL:', window.location.href);
  console.log('Request ID from URL:', requestId);
  
  if (requestId) {
    console.log('✅ Request ID found:', requestId, '- Loading from API...');
    // Always load from API when ID is present - NEVER fall back to localStorage
    loadFormData().catch(error => {
      console.error('❌ CRITICAL: Failed to load from API:', error);
      console.error('Error details:', error.message, error.stack);
      // Show error in UI instead of placeholder data
      if (document.getElementById('fullName')) {
        document.getElementById('fullName').textContent = 'ERROR: Failed to load data';
        document.getElementById('phoneNumber').textContent = 'Check console (F12)';
        document.getElementById('email').textContent = 'API Error';
        document.getElementById('projectLocation').textContent = 'See console for details';
      }
      alert('Failed to load request data from server.\n\nError: ' + error.message + '\n\nPlease check the browser console (F12) for details.');
    });
  } else {
    console.error('❌ CRITICAL ERROR: No request ID in URL!');
    console.error('Current URL:', window.location.href);
    console.error('This page MUST be accessed with ?id=X parameter');
    // Don't show placeholder data - show error instead
    if (document.getElementById('fullName')) {
      document.getElementById('fullName').textContent = 'ERROR: No request ID in URL';
      document.getElementById('phoneNumber').textContent = 'Please access this page from Request Management';
      document.getElementById('email').textContent = 'Click "See more" button';
      document.getElementById('projectLocation').textContent = 'This page requires ?id=X parameter';
    }
    // Redirect back to request management page instead of showing alert
    setTimeout(() => {
      window.location.href = 'request-managment.html';
    }, 2000);
    alert('Error: No request ID in URL.\n\nRedirecting to Request Management page...');
  }
});

