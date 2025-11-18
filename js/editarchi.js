// Profile image upload
document.getElementById('edit-architect-profile-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('edit-architect-profile-preview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Date input auto-formatting
const dateInput = document.getElementById('edit-architect-birth');
const dateDisplay = document.getElementById('edit-architect-birth-display');

dateInput.addEventListener('change', function() {
    if (this.value) {
        const [year, month, day] = this.value.split('-');
        dateDisplay.value = `${day}/${month}/${year}`;
    }
});

// Trigger date picker
document.querySelectorAll('.date-icon, #edit-architect-birth-display').forEach(el => {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        try { dateInput.showPicker(); }
        catch { dateInput.focus(); dateInput.click(); }
    });
});

// Load existing data
window.addEventListener('load', function() {
    const userData = JSON.parse(sessionStorage.getItem('architectData') || '{}');
    if (userData.fname) document.getElementById('edit-architect-fname').value = userData.fname;
    if (userData.lname) document.getElementById('edit-architect-lname').value = userData.lname;
    if (userData.email) document.getElementById('edit-architect-email').value = userData.email;
    if (userData.phone) document.getElementById('edit-architect-phone').value = userData.phone;
    if (userData.city) document.getElementById('edit-architect-city').value = userData.city;
    if (userData.birth) document.getElementById('edit-architect-birth').value = userData.birth;
    if (userData.gender) {
        const genderInput = document.querySelector(`input[name="edit-architect-gender"][value="${userData.gender}"]`);
        if (genderInput) genderInput.checked = true;
    }
});

// Form validation
document.getElementById('edit-profile-architect').addEventListener('submit', function(e) {
    e.preventDefault();

    const fname = document.getElementById('edit-architect-fname');
    const lname = document.getElementById('edit-architect-lname');
    const email = document.getElementById('edit-architect-email');
    const phone = document.getElementById('edit-architect-phone');
    const city = document.getElementById('edit-architect-city');
    const birth = document.getElementById('edit-architect-birth');
    const gender = document.querySelector('input[name="edit-architect-gender"]:checked');
    let isValid = true;

    clearErrors();

    // First name
    if (!fname.value.trim()) {
        showError(fname, 'edit-architect-fname-error', 'First name is required');
        isValid = false;
    } else if (fname.value.trim().length < 2) {
        showError(fname, 'edit-architect-fname-error', 'First name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
        showError(fname, 'edit-architect-fname-error', 'First name can only contain letters');
        isValid = false;
    }

    // Last name
    if (!lname.value.trim()) {
        showError(lname, 'edit-architect-lname-error', 'Last name is required');
        isValid = false;
    } else if (lname.value.trim().length < 2) {
        showError(lname, 'edit-architect-lname-error', 'Last name must be at least 2 characters');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
        showError(lname, 'edit-architect-lname-error', 'Last name can only contain letters');
        isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError(email, 'edit-architect-email-error', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email.value.trim())) {
        showError(email, 'edit-architect-email-error', 'Please enter a valid email address');
        isValid = false;
    }

    // Phone
    const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
    if (!phone.value.trim()) {
        showError(phone, 'edit-architect-phone-error', 'Phone number is required');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError(phone, 'edit-architect-phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
        isValid = false;
    }

    // City
    if (!city.value) {
        showError(city, 'edit-architect-city-error', 'Please select a city');
        isValid = false;
    }

    // Birth date: only +18
    if (!birth.value) {
        showError(birth, 'edit-architect-birth-error', 'Date of birth is required');
        isValid = false;
    } else {
        const birthDate = new Date(birth.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age < 18) {
            showError(birth, 'edit-architect-birth-error', 'You must be at least 18 years old');
            isValid = false;
        }
    }

    if (isValid) {
        const updatedData = {
            fname: fname.value.trim(),
            lname: lname.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            city: city.value,
            birth: birth.value,
            gender: gender.value,
            userType: 'architect'
        };
        sessionStorage.setItem('architectData', JSON.stringify(updatedData));
        alert('Profile updated successfully!');
        window.location.href = 'architect-interface.html';
    }
});

// Show error function
function showError(input, errorId, message) {
    const wrapper = input.closest('div, .select-wrapper');
    if (wrapper) wrapper.classList.add('error');
    document.getElementById(errorId).textContent = message;
}

// Clear all errors
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
    document.querySelectorAll('.select-wrapper, div').forEach(el => el.classList.remove('error'));
}
