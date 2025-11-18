//Load profile image from page 1
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
        window.location.href = '/pages/agency-interface.html';
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