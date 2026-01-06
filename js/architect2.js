const ARCH_API_BASE = '../../php/api';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('architect2.js loaded, DOM ready');

    // Date picker handling
    const dateInput = document.getElementById('architect-birth');
    const dateDisplay = document.getElementById('architect-birth-display');

    if (dateInput && dateDisplay) {
        // Update display when date changes
        dateInput.addEventListener('change', function() {
            if (this.value) {
                // Split the date string (format: YYYY-MM-DD)
                const [year, month, day] = this.value.split('-');
                // Format as DD/MM/YYYY
                dateDisplay.value = `${day}/${month}/${year}`;
            }
        });

        // Trigger date picker when clicking the icon
        const dateIcon = document.querySelector('.date-icon');
        if (dateIcon) {
            dateIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    dateInput.showPicker();
                } catch (e) {
                    // Fallback: focus and click the input
                    dateInput.focus();
                    dateInput.click();
                }
            });
        }

        // Also allow clicking the display input to open picker
        dateDisplay.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                dateInput.showPicker();
            } catch (e) {
                dateInput.focus();
                dateInput.click();
            }
        });
    }
    const form = document.getElementById('login-architect-2');
    if (!form) {
        console.error('Form #login-architect-2 not found!');
        return;
    }
    console.log('Form found, attaching submit handler');

    // Form validation + final registration
    form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const phone = document.getElementById('architect-phone');
    const city = document.getElementById('architect-city');
    const birth = document.getElementById('architect-birth');
    const gender = document.querySelector('input[name="gender"]:checked');
    
    let isValid = true;

    // Reset errors
    clearErrors();

    // Phone validation
    const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
    if (!phone.value.trim()) {
        showError(phone, 'phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'phone-error', 'Phone must start with 05,06 or 07 and contain 10 numbers');
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

    if (!isValid) {
        console.log('Validation failed');
        return;
    }

    // Get data from page 1
    const data1 = JSON.parse(sessionStorage.getItem('architectData1') || '{}');
    console.log('Data from step 1:', data1);

    if (!data1.email || !data1.password || !data1.fname || !data1.lname) {
        console.error('Missing data from step 1');
        showError(phone, 'phone-error', 'Previous step data is missing. Please go back.');
        return;
    }

    const registerUrl = `${ARCH_API_BASE}/auth/register.php`;
    console.log('Registering architect at:', registerUrl);

    const registerData = {
        user_type: 'architect',
        email: data1.email.trim(),
        password: data1.password,
        first_name: data1.fname.trim(),
        last_name: data1.lname.trim(),
        phone_number: phone.value.trim(),
        city: city.value,
        date_of_birth: birth.value,
        gender: gender.value
    };
    console.log('Sending data:', { ...registerData, password: '***' });

    try {
        const res = await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(registerData)
        });

        console.log('Response status:', res.status, res.statusText);
        console.log('Response headers:', Object.fromEntries(res.headers.entries()));

        const data = await res.json();
        console.log('Response data:', data);

        if (!res.ok || data.success === false) {
            console.error('Registration failed:', data.message);
            showError(phone, 'phone-error', data.message || 'Registration failed');
            return;
        }

        console.log('Registration successful!');
        sessionStorage.removeItem('architectData1');
        // Go to architect interface (relative to pages/login/)
        window.location.href = '../architect-interface.html';
    } catch (err) {
        console.error('Network error:', err);
        showError(phone, 'phone-error', 'Network error: ' + err.message);
    }
    });
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


