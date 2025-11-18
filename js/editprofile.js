// Profile image preview
document.getElementById('profile-upload-edit').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-preview-edit').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Load existing user data (from localStorage or API)
window.addEventListener('DOMContentLoaded', function() {
    // Example: Load saved data
    const userData = JSON.parse(localStorage.getItem('clientData') || '{}');
    
    if (userData.email) document.getElementById('edit-email').value = userData.email;
    if (userData.fname) document.getElementById('edit-fname').value = userData.fname;
    if (userData.lname) document.getElementById('edit-lname').value = userData.lname;
    if (userData.profileImage) document.getElementById('profile-preview-edit').src = userData.profileImage;
});

// Form validation
document.getElementById('edit-client-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
    document.querySelectorAll('div').forEach(div => div.classList.remove('error'));
    
    let isValid = true;
    
    // Email validation
    const email = document.getElementById('edit-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError('email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('email-error', 'Please enter a valid email');
        isValid = false;
    }
    
    // First name validation
    const fname = document.getElementById('edit-fname').value.trim();
    if (!fname) {
        showError('fname-error', 'First name is required');
        isValid = false;
    } else if (fname.length < 2) {
        showError('fname-error', 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Last name validation
    const lname = document.getElementById('edit-lname').value.trim();
    if (!lname) {
        showError('lname-error', 'Last name is required');
        isValid = false;
    } else if (lname.length < 2) {
        showError('lname-error', 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    if (isValid) {
        // Save updated data
        const profileImage = document.getElementById('profile-preview-edit').src;
        const updatedData = {
            email: email,
            fname: fname,
            lname: lname,
            profileImage: profileImage.includes('data:') ? profileImage : null
        };
        
        localStorage.setItem('clientData', JSON.stringify(updatedData));
        
        alert('Profile updated successfully!');
        // Redirect to profile page or dashboard
        // window.location.href = '/pages/client-interface.html';
    }
});

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.previousElementSibling.classList.add('error');
}