// Profile image upload
document.getElementById('profile-upload-agency').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-preview-agency').src = event.target.result;
            // Store image for next page
            sessionStorage.setItem('agencyProfile', event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Form validation
document.getElementById('login-agency-1').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('agency-email');
    const password = document.getElementById('agency-password');
    const cpassword = document.getElementById('agency-cpassword');
    const name = document.getElementById('agency-name');
    const phone = document.getElementById('agency-phone');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        showError(email, 'email-error', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (!password.value) {
        showError(password, 'password-error', 'Password is required');
        isValid = false;
    } else if (password.value.length < 8) {
        showError(password, 'password-error', 'Password must be at least 8 characters');
        isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password.value)) {
        showError(password, 'password-error', 'Password must contain uppercase, lowercase and number');
        isValid = false;
    }

    // Confirm password validation
    if (!cpassword.value) {
        showError(cpassword, 'cpassword-error', 'Please confirm your password');
        isValid = false;
    } else if (password.value !== cpassword.value) {
        showError(cpassword, 'cpassword-error', 'Passwords do not match');
        isValid = false;
    }

    // Agency name validation
    if (!name.value.trim()) {
        showError(name, 'name-error', 'Agency name is required');
        isValid = false;
    } else if (name.value.trim().length < 3) {
        showError(name, 'name-error', 'Agency name must be at least 3 characters');
        isValid = false;
    }

    // Phone validation: 10 digits starting with 05, 06 or 07
    const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
    if (!phone.value.trim()) {
        showError(phone, 'phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
        isValid = false;
    }

    if (isValid) {
        // Store data for page 2
        sessionStorage.setItem('agencyData1', JSON.stringify({
            email: email.value,
            password: password.value,
            name: name.value,
            phone: phone.value
        }));
        // Go to agencyLogin2 in the same login folder
        window.location.href = 'agencyLogin2.html';
    }
});

function showError(input, errorId, message) {
    input.parentElement.classList.add('error');
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('input').forEach(inp => {
        if (inp.parentElement.classList) {
            inp.parentElement.classList.remove('error');
        }
    });
}


// ============================================
// 5. AGENCY VALIDATION PAGE 2 (agencyValidation2.js)
// ============================================

// Load profile image from page 1
window.addEventListener('load', function() {
    const savedProfile = sessionStorage.getItem('agencyProfile');
    if (savedProfile) {
        document.getElementById('profile-preview-display').src = savedProfile;
    }
});

// File upload handling
document.getElementById('agency-document').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    document.getElementById('document-display').value = fileName;
});

// Form validation
document.getElementById('login-agency-2').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const city = document.getElementById('agency-city');
    const address = document.getElementById('agency-address');
    const document = document.getElementById('agency-document');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // City validation
    if (!city.value) {
        showError(city, 'city-error', 'Please select a city');
        isValid = false;
    }

    // Address validation
    if (!address.value.trim()) {
        showError(address, 'address-error', 'Office address is required');
        isValid = false;
    } else if (address.value.trim().length < 5) {
        showError(address, 'address-error', 'Address must be at least 5 characters');
        isValid = false;
    }

    // Document validation
    if (!document.files.length) {
        showError(document, 'document-error', 'Verification document is required');
        isValid = false;
    } else {
        const file = document.files[0];
        const fileSize = file.size / 1024 / 1024; // MB
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!validTypes.includes(file.type)) {
            showError(document, 'document-error', 'Only PDF and DOC files are allowed');
            isValid = false;
        } else if (fileSize > 5) {
            showError(document, 'document-error', 'File size must be less than 5MB');
            isValid = false;
        }
    }

    if (isValid) {
        // Get data from page 1
        const data1 = JSON.parse(sessionStorage.getItem('agencyData1') || '{}');
        
        // Combine all data
        const fullData = {
            ...data1,
            city: city.value,
            address: address.value,
            document: document.files[0].name,
            userType: 'agency'
        };
        
        sessionStorage.setItem('agencyData', JSON.stringify(fullData));
        sessionStorage.removeItem('agencyData1');
        // Go to agency interface (pages folder)
        window.location.href = '../agency-interface.html';
    }
});

function showError(input, errorId, message) {
    const wrapper = input.closest('div, .file-input-wrapper, .select-wrapper');
    if (wrapper) {
        wrapper.classList.add('error');
    }
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('.file-input-wrapper, .select-wrapper, div').forEach(el => {
        el.classList.remove('error');
    });
}