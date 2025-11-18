document.getElementById('profile-upload-arch').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-preview-arch').src = event.target.result;
            // Store image for next page
            sessionStorage.setItem('architectProfile', event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Form validation
document.getElementById('login-architect-1').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fname = document.getElementById('architect-fname');
    const lname = document.getElementById('architect-lname');
    const email = document.getElementById('architect-email');
    const password = document.getElementById('architect-password');
    const cpassword = document.getElementById('architect-cpassword');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // First name validation
    if (!fname.value.trim()) {
        showError(fname, 'fname-error', 'First name is required');
        isValid = false;
    } else if (fname.value.trim().length < 2) {
        showError(fname, 'fname-error', 'First name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
        showError(fname, 'fname-error', 'First name can only contain letters');
        isValid = false;
    }

    // Last name validation
    if (!lname.value.trim()) {
        showError(lname, 'lname-error', 'Last name is required');
        isValid = false;
    } else if (lname.value.trim().length < 2) {
        showError(lname, 'lname-error', 'Last name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
        showError(lname, 'lname-error', 'Last name can only contain letters');
        isValid = false;
    }

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

    if (isValid) {
        // Store data for page 2
        sessionStorage.setItem('architectData1', JSON.stringify({
            fname: fname.value,
            lname: lname.value,
            email: email.value,
            password: password.value
        }));
        window.location.href = '/pages/archiLogin2.html';
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
// 3. ARCHITECT VALIDATION PAGE 2 (archiValidation2.js)
// ============================================

// Load profile image from page 1
window.addEventListener('load', function() {
    const savedProfile = sessionStorage.getItem('architectProfile');
    if (savedProfile) {
        // Would set profile image here if displayed on page 2
    }
});

// Date picker handling
document.getElementById('architect-birth').addEventListener('change', function() {
    const date = new Date(this.value);
    const formatted = date.toLocaleDateString('en-GB');
    document.getElementById('architect-birth-display').value = formatted;
});

// Form validation
document.getElementById('login-architect-2').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('architect-phone');
    const city = document.getElementById('architect-city');
    const birth = document.getElementById('architect-birth');
    const gender = document.querySelector('input[name="gender"]:checked');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // Phone validation
    const phoneRegex = /^\+213[0-9]{9}$/;
    if (!phone.value.trim()) {
        showError(phone, 'phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'phone-error', 'Phone must be in format +213XXXXXXXXX');
        isValid = false;
    }

    // City validation
    if (!city.value) {
        showError(city, 'city-error', 'Please select a city');
        isValid = false;
    }

    // Birth date validation
    if (!birth.value) {
        showError(birth, 'birth-error', 'Date of birth is required');
        isValid = false;
    } else {
        const birthDate = new Date(birth.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            showError(birth, 'birth-error', 'You must be at least 18 years old');
            isValid = false;
        } else if (age > 100) {
            showError(birth, 'birth-error', 'Please enter a valid date of birth');
            isValid = false;
        }
    }

    if (isValid) {
        // Get data from page 1
        const data1 = JSON.parse(sessionStorage.getItem('architectData1') || '{}');
        
        // Combine all data
        const fullData = {
            ...data1,
            phone: phone.value,
            city: city.value,
            birth: birth.value,
            gender: gender.value,
            userType: 'architect'
        };
        
        sessionStorage.setItem('architectData', JSON.stringify(fullData));
        sessionStorage.removeItem('architectData1');
        window.location.href = '/pages/architect-interface.html';
    }
});

function showError(input, errorId, message) {
    const wrapper = input.closest('div, .date-wrapper, .select-wrapper');
    if (wrapper) {
        wrapper.classList.add('error');
    }
    document.getElementById(errorId).textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('.date-wrapper, .select-wrapper, div').forEach(el => {
        el.classList.remove('error');
    });
}