 // Profile image upload
            document.getElementById('edit-client-profile-upload').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        document.getElementById('edit-client-profile-preview').src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Load existing data
            window.addEventListener('load', function() {
                const userData = JSON.parse(sessionStorage.getItem('clientData') || '{}');
                if (userData.fname) document.getElementById('edit-client-fname').value = userData.fname;
                if (userData.lname) document.getElementById('edit-client-lname').value = userData.lname;
                if (userData.email) document.getElementById('edit-client-email').value = userData.email;
            });

            // Form validation
            document.getElementById('edit-profile-client').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const fname = document.getElementById('edit-client-fname');
                const lname = document.getElementById('edit-client-lname');
                const email = document.getElementById('edit-client-email');
                let isValid = true;

                clearErrors();

                // First name validation
                if (!fname.value.trim()) {
                    showError(fname, 'edit-client-fname-error', 'First name is required');
                    isValid = false;
                } else if (fname.value.trim().length < 2) {
                    showError(fname, 'edit-client-fname-error', 'First name must be at least 2 characters');
                    isValid = false;
                } else if (!/^[a-zA-Z\s]+$/.test(fname.value.trim())) {
                    showError(fname, 'edit-client-fname-error', 'First name can only contain letters');
                    isValid = false;
                }

                // Last name validation
                if (!lname.value.trim()) {
                    showError(lname, 'edit-client-lname-error', 'Last name is required');
                    isValid = false;
                } else if (lname.value.trim().length < 2) {
                    showError(lname, 'edit-client-lname-error', 'Last name must be at least 2 characters');
                    isValid = false;
                } else if (!/^[a-zA-Z\s]+$/.test(lname.value.trim())) {
                    showError(lname, 'edit-client-lname-error', 'Last name can only contain letters');
                    isValid = false;
                }

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email.value.trim()) {
                    showError(email, 'edit-client-email-error', 'Email is required');
                    isValid = false;
                } else if (!emailRegex.test(email.value)) {
                    showError(email, 'edit-client-email-error', 'Please enter a valid email address');
                    isValid = false;
                }

                if (isValid) {
                    const updatedData = {
                        fname: fname.value,
                        lname: lname.value,
                        email: email.value,
                        userType: 'client'
                    };
                    sessionStorage.setItem('clientData', JSON.stringify(updatedData));
                    alert('Profile updated successfully!');
                    window.location.href = '/pages/client-interface.html';
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