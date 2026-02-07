// Agency Portfolio Action Buttons
// Simple direct links to forms

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const btnRequestProject = document.getElementById('btnRequestProject');
    const btnApplyJob = document.getElementById('btnApplyJob');
    const errorMessage = document.getElementById('action-error');
    
    if (!btnRequestProject || !btnApplyJob) {
        return;
    }
    
    // Get agency ID from URL parameter 'id' (used by portfolio page) or 'agency_id', or from window.agencyId
    const urlParams = new URLSearchParams(window.location.search);
    const agencyId = urlParams.get('id') || urlParams.get('agency_id') || window.agencyId || null;
    
    // Function to check user type - returns user type or null if not logged in
    async function checkUserType() {
        try {
            const response = await fetch('../php/api/users/profile.php', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.user?.user_type) {
                    return data.data.user.user_type;
                }
            }
            // Not logged in
            return null;
        } catch (error) {
            console.error('Error checking user type:', error);
            // On error, assume not logged in
            return null;
        }
    }
    
    // Function to show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            errorMessage.style.color = '#ff4444';
            errorMessage.style.marginTop = '10px';
            errorMessage.style.textAlign = 'center';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        } else {
            // Fallback: use alert if error element not found
            alert(message);
        }
    }
    
    // Request a Project button - check user type first
    btnRequestProject.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Check user type
        const userType = await checkUserType();
        
        // Only allow clients to request projects
        if (userType !== 'client') {
            if (userType === 'architect' || userType === 'agency') {
                showError('Please log in as a client to request a project.');
            } else {
                // Not logged in
                showError('Please log in as a client to request a project.');
            }
            return;
        }
        
        // Re-read agency ID from URL or window.agencyId when button is clicked
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentAgencyId = currentUrlParams.get('id') || currentUrlParams.get('agency_id') || window.agencyId || null;
        
        // Check if agency ID is available
        if (!currentAgencyId) {
            console.error('No agency ID found when clicking Request Project button');
            showError('Error: Agency ID not found. Please refresh the page and try again.');
            return;
        }
        
        // User is a client - proceed to form
        const formUrl = `formclient/exteriorproject.html?agency_id=${currentAgencyId}`;
        console.log('Navigating to:', formUrl);
        window.location.href = formUrl;
    });

    // Apply button - check user type first (only architects can apply)
    btnApplyJob.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Re-read agency ID from URL or window.agencyId when button is clicked
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentAgencyId = currentUrlParams.get('id') || currentUrlParams.get('agency_id') || window.agencyId || null;
        
        console.log('Apply button clicked - Agency ID:', currentAgencyId);
        console.log('URL params:', window.location.search);
        console.log('window.agencyId:', window.agencyId);
        
        // Check user type
        const userType = await checkUserType();
        
        // Only allow architects to apply
        if (userType !== 'architect') {
            if (userType === 'client' || userType === 'agency') {
                showError('Please log in as an architect to apply for a job.');
            } else {
                // Not logged in
                showError('Please log in as an architect to apply for a job.');
            }
            return;
        }
        
        // Check if agency ID is available
        if (!currentAgencyId) {
            console.error('No agency ID found when clicking Apply button');
            showError('Error: Agency ID not found. Please refresh the page and try again.');
            return;
        }
        
        // User is an architect - proceed to application form
        const formUrl = `formarchitect/appliance.html?agency_id=${currentAgencyId}`;
        console.log('Navigating to:', formUrl);
        window.location.href = formUrl;
    });
});
