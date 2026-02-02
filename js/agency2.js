const AGENCY_API_BASE = '../../php/api';
const PHONE_REGEX = /^0[5-7][0-9]{8}$/;

// Load profile image from page 1
window.addEventListener('load', function () {
    const savedProfile = sessionStorage.getItem('agencyProfile');
    if (savedProfile) {
        document.getElementById('profile-preview-display').src = savedProfile;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const agencyDocumentInput = document.getElementById('agency-document');
    const agencyDocumentDisplay = document.getElementById('document-display');
    const agencyFileWrapper = document.querySelector('.file-input-wrapper');

    if (agencyDocumentInput && agencyDocumentDisplay) {
        agencyDocumentInput.addEventListener('change', function () {
            const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
            agencyDocumentDisplay.value = fileName;
        });
    }

    if (agencyDocumentInput && agencyFileWrapper) {
        agencyFileWrapper.addEventListener('click', () => {
            agencyDocumentInput.click();
        });
    }
});

// Form validation + final registration
document.getElementById('login-agency-2').addEventListener('submit', async function (e) {
    e.preventDefault();

    const city = document.getElementById('agency-city');
    const address = document.getElementById('agency-address');
    const bio = document.getElementById('agency-bio');
    const agencyDocument = document.getElementById('agency-document'); // FIXED

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

    // Bio validation
    if (!bio.value.trim()) {
        showError(bio, 'bio-error', 'Agency bio is required');
        isValid = false;
    }

    // Document validation
    if (!agencyDocument.files.length) {
        showError(agencyDocument, 'document-error', 'Verification document is required');
        isValid = false;
    } else {
        const file = agencyDocument.files[0];
        const fileSize = file.size / 1024 / 1024; // MB
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!validTypes.includes(file.type)) {
            showError(agencyDocument, 'document-error', 'Only PDF and DOC files are allowed');
            isValid = false;
        } else if (fileSize > 5) {
            showError(agencyDocument, 'document-error', 'File size must be less than 5MB');
            isValid = false;
        }
    }

    if (!isValid) return;

    // Get data from page 1 (user already registered in step 1)
    const data1 = JSON.parse(sessionStorage.getItem('agencyData1') || '{}');

    if (!data1.email || !data1.name || !data1.phone) {
        showError(city, 'city-error', 'Previous step data is missing. Please go back.');
        return;
    }

    // User is already registered and logged in from step 1
    // Update profile with additional fields and handle file upload
    const formData = new FormData();
    formData.append('name', data1.name.trim());
    formData.append('phone_number', data1.phone.trim());
    formData.append('city', city.value);
    formData.append('address', address.value.trim());
    formData.append('bio', bio.value.trim());
    
    // Handle file upload properly
    if (agencyDocument.files[0]) {
        formData.append('legal_document', agencyDocument.files[0]);
    }

    try {
        // Update profile (user already registered in step 1)
        const res = await fetch(`${AGENCY_API_BASE}/users/profile.php`, {
            method: 'PUT',
            credentials: 'include',
            body: formData
        });

        const data = await res.json();

        if (!res.ok || data.success === false) {
            alert(data.message || 'Registration failed');
            return;
        }

        sessionStorage.removeItem('agencyData1');

        // Go to agency interface (relative to pages/login/)
        window.location.href = '../agency-interface.html';
    } catch (err) {
        showError(city, 'city-error', 'Network error. Please try again.');
    }
});

function showError(input, errorId, message) {
    const wrapper =
        input.closest('.file-input-wrapper') ||
        input.closest('.select-wrapper') ||
        input.closest('div');

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
