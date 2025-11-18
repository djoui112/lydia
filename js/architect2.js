// Date picker handling
const dateInput = document.getElementById('architect-birth');
const dateDisplay = document.getElementById('architect-birth-display');

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
document.querySelector('.date-icon').addEventListener('click', function(e) {
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
        // Go to architect interface (relative to pages/login/)
        window.location.href = '../architect-interface.html';
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


