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
            const apiUrl = `${AGENCY_API_BASE}/auth/register.php`;
            console.log('Registering agency with API:', apiUrl);
            
            const res = await fetch(apiUrl, {
                method: 'POST',
                credentials: 'include',
                body: formData // Use FormData instead of JSON
            });

            // Check if response is OK before parsing
            if (!res.ok) {
                // Try to get error message from response
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await res.json();
                        showError(email, 'email-error', errorData.message || `Registration failed (${res.status})`);
                        return;
                    } catch (parseErr) {
                        console.error('Failed to parse error response:', parseErr);
                        showError(email, 'email-error', `Registration failed (${res.status} ${res.statusText})`);
                        return;
                    }
                } else {
                    // Response is not JSON, might be HTML error page
                    const text = await res.text();
                    console.error('Non-JSON error response:', text.substring(0, 200));
                    showError(email, 'email-error', `Registration failed (${res.status} ${res.statusText})`);
                    return;
                }
            }

            // Check content-type before parsing JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Response is not JSON. Content-Type:', contentType);
                console.error('Response:', text.substring(0, 200));
                showError(email, 'email-error', 'Server returned an invalid response. Please try again.');
                return;
            }

            const data = await res.json();
            if (data.success === false) {
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
            // Handle network errors, CORS errors, and other fetch failures
            console.error('Registration error:', err);
            if (err instanceof TypeError && err.message.includes('fetch')) {
                showError(email, 'email-error', 'Network error. Please check your connection and try again.');
            } else if (err instanceof SyntaxError) {
                showError(email, 'email-error', 'Server returned an invalid response. Please try again.');
            } else {
                showError(email, 'email-error', err.message || 'An error occurred. Please try again.');
            }
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
