 // Profile image upload
            document.getElementById('edit-agency-profile-upload').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        document.getElementById('edit-agency-profile-preview').src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Load existing data
            window.addEventListener('load', function() {
                const userData = JSON.parse(sessionStorage.getItem('agencyData') || '{}');
                if (userData.name) document.getElementById('edit-agency-name').value = userData.name;
                if (userData.email) document.getElementById('edit-agency-email').value = userData.email;
                if (userData.phone) document.getElementById('edit-agency-phone').value = userData.phone;
                if (userData.city) document.getElementById('edit-agency-city').value = userData.city;
                if (userData.address) document.getElementById('edit-agency-address').value = userData.address;
            });

            // Form validation
            document.getElementById('edit-profile-agency').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('edit-agency-name');
                const email = document.getElementById('edit-agency-email');
                const phone = document.getElementById('edit-agency-phone');
                const city = document.getElementById('edit-agency-city');
                const address = document.getElementById('edit-agency-address');
                let isValid = true;

                clearErrors();

                // Agency name validation
                if (!name.value.trim()) {
                    showError(name, 'edit-agency-name-error', 'Agency name is required');
                    isValid = false;
                } else if (name.value.trim().length < 3) {
                    showError(name, 'edit-agency-name-error', 'Agency name must be at least 3 characters');
                    isValid = false;
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email.value.trim()) {
                    showError(email, 'edit-agency-email-error', 'Email is required');
                    isValid = false;
                } else if (!emailRegex.test(email.value)) {
                    showError(email, 'edit-agency-email-error', 'Please enter a valid email address');
                    isValid = false;
                }

                // Phone validation
                const phoneRegex = /^[0]{1}[5-7]{1}[0-9]{8}$/;
                if (!phone.value.trim()) {
                    showError(phone, 'edit-agency-phone-error', 'Phone number is required');
                    isValid = false;
                } else if (!phoneRegex.test(phone.value.trim())) {
                    showError(phone, 'edit-agency-phone-error', 'Phone must be 10 digits starting with 05, 06, or 07');
                    isValid = false;
                }

                // City validation
                if (!city.value) {
                    showError(city, 'edit-agency-city-error', 'Please select a city');
                    isValid = false;
                }

                // Address validation
                if (!address.value.trim()) {
                    showError(address, 'edit-agency-address-error', 'Office address is required');
                    isValid = false;
                } else if (address.value.trim().length < 5) {
                    showError(address, 'edit-agency-address-error', 'Address must be at least 5 characters');
                    isValid = false;
                }

                if (isValid) {
                    const updatedData = {
                        name: name.value,
                        email: email.value,
                        phone: phone.value,
                        city: city.value,
                        address: address.value,
                        userType: 'agency'
                    };
                    sessionStorage.setItem('agencyData', JSON.stringify(updatedData));
                    alert('Profile updated successfully!');
                    window.location.href = '/pages/agency-interface.html';
                }
            });

            function showError(input, errorId, message) {
                const wrapper = input.closest('div, .select-wrapper');
                if (wrapper) {
                    wrapper.classList.add('error');
                }
                document.getElementById(errorId).textContent = message;
            }

            function clearErrors() {
                document.querySelectorAll('.error-message').forEach(err => err.textContent = '');
                document.querySelectorAll('.select-wrapper, div').forEach(el => {
                    el.classList.remove('error');
                });
            }