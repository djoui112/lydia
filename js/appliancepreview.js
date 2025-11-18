// Function to load form data from localStorage if available
function loadFormData() {
  // Personal Information
  const firstName = localStorage.getItem('firstName') || 'John';
  const lastName = localStorage.getItem('lastName') || 'Doe';
  const phoneNumber = localStorage.getItem('phoneNumber') || '+213 550 000 000';
  const address = localStorage.getItem('address') || '123 Main Street, Algiers, Algeria';
  const dateOfBirth = localStorage.getItem('dateOfBirth') || '01/01/1990';

  document.getElementById('firstName').textContent = firstName;
  document.getElementById('lastName').textContent = lastName;
  document.getElementById('phoneNumber').textContent = phoneNumber;
  document.getElementById('address').textContent = address;
  document.getElementById('dateOfBirth').textContent = dateOfBirth;

  // Professional Information
  const statement = localStorage.getItem('statement') || 'graduate architect';
  const statementDisplay = statement === 'graduate architect' ? 'Graduate Architect' : 'Intern';
  document.getElementById('statement').textContent = statementDisplay;

  document.getElementById('primaryExpertise').textContent = 
    localStorage.getItem('primaryExpertise') || 'Modern interior design';
  
  document.getElementById('softwareProficiency').textContent = 
    localStorage.getItem('softwareProficiency') || 'AutoCAD, SketchUp, Revit, 3ds Max';

  // Types of Projects - this might be stored as an array or comma-separated string
  const projectTypes = localStorage.getItem('projectTypes') || 'residential,commercial,institutional';
  const projectTypesArray = projectTypes.split(',').map(type => type.trim());
  const projectTypesContainer = document.getElementById('projectTypesContainer');
  if (projectTypesContainer) {
    projectTypesContainer.innerHTML = '';
    projectTypesArray.forEach(type => {
      const span = document.createElement('span');
      span.className = 'choice-display';
      span.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      projectTypesContainer.appendChild(span);
    });
  }

  // Contact & Portfolio
  const email = localStorage.getItem('email') || 'architect@example.com';
  const portfolio = localStorage.getItem('portfolio') || 'https://portfolio.com';
  const linkedin = localStorage.getItem('linkedin') || 'https://linkedin.com/in/architect';
  const motivationLetter = localStorage.getItem('motivationLetter') || 
    'I am passionate about creating innovative architectural designs that combine functionality with aesthetic appeal. With extensive experience in residential and commercial projects, I am excited to contribute to your team.';

  document.getElementById('email').textContent = email;
  const portfolioLink = document.getElementById('portfolio');
  portfolioLink.textContent = portfolio;
  portfolioLink.href = portfolio;
  
  const linkedinLink = document.getElementById('linkedin');
  linkedinLink.textContent = linkedin;
  linkedinLink.href = linkedin;
  
  document.getElementById('motivationLetter').textContent = motivationLetter;
}

function handleAccept() {
  // Handle accept action
  alert('Application accepted!');
  // You can add navigation or API call here
  // window.location.href = 'success-page.html';
}

function handleReject() {
  // Handle reject action
  if (confirm('Are you sure you want to reject this application?')) {
    alert('Application rejected.');
    // You can add navigation or API call here
    // window.location.href = 'reject-page.html';
  }
}

// Load data when page loads
window.addEventListener('DOMContentLoaded', loadFormData);
