// Shared validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const PHONE_REGEX = /^0[5-7][0-9]{8}$/;

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
document.getElementById('login-agency-1').addEventListener('submit', async function(e) {
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
    if (!email.value.trim()) {
        showError(email, 'email-error', 'Email is required');
        isValid = false;
    } else if (!EMAIL_REGEX.test(email.value.trim())) {
        showError(email, 'email-error', 'Please enter a valid email address');
        isValid = false;
    }

    // Password validation
    if (!password.value) {
        showError(password, 'password-error', 'Password is required');
        isValid = false;
    } else if (!PASSWORD_REGEX.test(password.value)) {
        showError(
            password,
            'password-error',
            'Password must be at least 8 characters and include uppercase, lowercase, number and symbol'
        );
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

    // Phone validation
    if (!phone.value.trim()) {
        showError(phone, 'phone-error', 'Phone number is required');
        isValid = false;
    } else if (!PHONE_REGEX.test(phone.value.trim())) {
        showError(phone, 'phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
        isValid = false;
    }

    if (isValid) {
        // Security fix: Register immediately with password, don't store it
        const AGENCY_API_BASE = '../../php/api';
        
        // Use FormData to handle profile image upload
        const formData = new FormData();
        formData.append('user_type', 'agency');
        formData.append('email', email.value.trim());
        formData.append('password', password.value); // Send password directly, don't store
        formData.append('first_name', name.value.trim());
        formData.append('last_name', '');
        formData.append('agency_name', name.value.trim());
        formData.append('phone_number', phone.value.trim());
        
        // Handle profile image upload if selected
        const profileUpload = document.getElementById('profile-upload-agency');
        if (profileUpload && profileUpload.files[0]) {
            formData.append('profile_image', profileUpload.files[0]);
        }
        
        try {
            const res = await fetch(`${AGENCY_API_BASE}/auth/register.php`, {
                method: 'POST',
                credentials: 'include',
                body: formData // Use FormData instead of JSON
            });

            const data = await res.json();
            if (!res.ok || data.success === false) {
                showError(email, 'email-error', data.message || 'Registration failed');
                return;
            }

            // Store only non-sensitive data for step 2 profile update
            sessionStorage.setItem('agencyData1', JSON.stringify({
                email: email.value,
                name: name.value,
                phone: phone.value
            }));

            // User is now registered and logged in - proceed to step 2
            window.location.href = 'agencyLogin2.html';
        } catch (err) {
            showError(email, 'email-error', 'Network error. Please try again.');
        }
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
