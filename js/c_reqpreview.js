// Function to load form data from localStorage if available
function loadFormData() {
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

function loadInteriorData() {
  // Load interior-specific data from localStorage
  document.getElementById('interiorLocation').textContent = 
    localStorage.getItem('interiorLocation') || localStorage.getItem('projectLocation') || 'Algiers, Algeria';
  document.getElementById('totalArea').textContent = 
    localStorage.getItem('totalArea') || '150 m²';
  document.getElementById('numberOfRooms').textContent = 
    localStorage.getItem('numberOfRooms') || '3 bedrooms, 2 bathrooms, 1 kitchen, 1 living room';
  document.getElementById('interiorType').textContent = 
    localStorage.getItem('interiorType') || 'Residential';
  document.getElementById('interiorCondition').textContent = 
    localStorage.getItem('interiorCondition') || 'Empty space';
  document.getElementById('interiorServiceType').textContent = 
    localStorage.getItem('interiorServiceType') || 'Full renovation';
  
  const minBudget = localStorage.getItem('interiorMinBudget') || localStorage.getItem('minBudget') || '500000';
  const maxBudget = localStorage.getItem('interiorMaxBudget') || localStorage.getItem('maxBudget') || '1000000';
  document.getElementById('interiorBudget').textContent = 
    `${parseInt(minBudget).toLocaleString()} DZD - ${parseInt(maxBudget).toLocaleString()} DZD`;
  
  document.getElementById('interiorTimeline').textContent = 
    localStorage.getItem('interiorTimeline') || localStorage.getItem('preferredTimeline') || '6 months';
  document.getElementById('interiorStyle').textContent = 
    localStorage.getItem('interiorStyle') || localStorage.getItem('stylePreference') || 'Modern, Minimalist';
  document.getElementById('interiorColors').textContent = 
    localStorage.getItem('interiorColors') || localStorage.getItem('colorPreferences') || 'Neutral tones with accent colors';
  document.getElementById('furnitureIncluded').textContent = 
    localStorage.getItem('furnitureIncluded') || 'Yes, include furniture';
  document.getElementById('lightingRequirements').textContent = 
    localStorage.getItem('lightingRequirements') || 'Natural light priority, Ambient lighting';
  document.getElementById('storageNeeds').textContent = 
    localStorage.getItem('storageNeeds') || 'Built-in cabinets, Walk-in closet';
  
  // Special Features
  const specialFeatures = localStorage.getItem('specialFeatures') || 'Home office space,Smart home integration';
  const specialFeaturesArray = specialFeatures.split(',').map(feature => feature.trim());
  const specialFeaturesContainer = document.getElementById('specialFeaturesContainer');
  if (specialFeaturesContainer) {
    specialFeaturesContainer.innerHTML = '';
    specialFeaturesArray.forEach(feature => {
      const span = document.createElement('span');
      span.className = 'choice-display';
      span.textContent = feature;
      specialFeaturesContainer.appendChild(span);
    });
  }
  
  document.getElementById('interiorNotes').textContent = 
    localStorage.getItem('interiorNotes') || localStorage.getItem('additionalNotes') || 'Looking for a modern, functional design that maximizes space.';
}

function loadExteriorData() {
  // Load exterior-specific data from localStorage
  document.getElementById('exteriorLocation').textContent = 
    localStorage.getItem('exteriorLocation') || localStorage.getItem('projectLocation') || 'Algiers, Algeria';
  document.getElementById('approximateArea').textContent = 
    localStorage.getItem('approximateArea') || '200 m²';
  document.getElementById('propertyType').textContent = 
    localStorage.getItem('propertyType') || 'Residential facade';
  document.getElementById('numberOfFloors').textContent = 
    localStorage.getItem('numberOfFloors') || '2 floors';
  document.getElementById('exteriorCondition').textContent = 
    localStorage.getItem('exteriorCondition') || 'Needs renovation';
  document.getElementById('exteriorServiceType').textContent = 
    localStorage.getItem('exteriorServiceType') || 'Renovation';
  
  const minBudget = localStorage.getItem('exteriorMinBudget') || localStorage.getItem('minBudget') || '800000';
  const maxBudget = localStorage.getItem('exteriorMaxBudget') || localStorage.getItem('maxBudget') || '1500000';
  document.getElementById('exteriorBudget').textContent = 
    `${parseInt(minBudget).toLocaleString()} DZD - ${parseInt(maxBudget).toLocaleString()} DZD`;
  
  document.getElementById('exteriorTimeline').textContent = 
    localStorage.getItem('exteriorTimeline') || localStorage.getItem('preferredTimeline') || '8 months';
  document.getElementById('exteriorStyle').textContent = 
    localStorage.getItem('exteriorStyle') || localStorage.getItem('stylePreference') || 'Modern, Contemporary';
  
  // Material Preferences
  const materialPreferences = localStorage.getItem('materialPreferences') || 'Concrete,Stone,Glass';
  const materialPreferencesArray = materialPreferences.split(',').map(material => material.trim());
  const materialPreferencesContainer = document.getElementById('materialPreferencesContainer');
  if (materialPreferencesContainer) {
    materialPreferencesContainer.innerHTML = '';
    materialPreferencesArray.forEach(material => {
      const span = document.createElement('span');
      span.className = 'choice-display';
      span.textContent = material;
      materialPreferencesContainer.appendChild(span);
    });
  }
  
  document.getElementById('exteriorSpecialRequirements').textContent = 
    localStorage.getItem('exteriorSpecialRequirements') || localStorage.getItem('specialRequirements') || 'Parking space, Energy efficiency';
  document.getElementById('environmentalConsiderations').textContent = 
    localStorage.getItem('environmentalConsiderations') || 'Solar panels, Rainwater collection';
  document.getElementById('exteriorNotes').textContent = 
    localStorage.getItem('exteriorNotes') || localStorage.getItem('additionalNotes') || 'Looking for sustainable and modern exterior design.';
}

function handleAccept() {
  // Handle accept action
  alert('Request accepted!');
  // You can add navigation or API call here
  // window.location.href = 'success-page.html';
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
window.addEventListener('DOMContentLoaded', loadFormData);

