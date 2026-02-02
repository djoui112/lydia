// Agency Portfolio Action Buttons
// Handles "Request a Project" and "Apply for a Job" buttons with access control

const API_BASE = '../php/api';

// Check user session and show appropriate buttons
window.addEventListener('load', async function() {
    const portfolioActions = document.getElementById('portfolioActions');
    const btnRequestProject = document.getElementById('btnRequestProject');
    const btnApplyJob = document.getElementById('btnApplyJob');
    const actionError = document.getElementById('action-error');
    
    if (!portfolioActions || !btnRequestProject || !btnApplyJob) {
        return; // Buttons not found, exit
    }
    
    try {
        // Check if user is logged in
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (!res.ok) {
            // User not logged in - hide buttons or show login prompt
            portfolioActions.style.display = 'none';
            return;
        }
        
        const data = await res.json();
        if (!data.success || !data.data?.user) {
            portfolioActions.style.display = 'none';
            return;
        }
        
        const userType = data.data.user.user_type;
        portfolioActions.style.display = 'block';
        
        // Show buttons based on user type
        if (userType === 'client') {
            // Clients can request projects
            btnRequestProject.style.display = 'block';
            btnApplyJob.style.display = 'none';
        } else if (userType === 'architect' || userType === 'agency') {
            // Architects and agencies can apply for jobs
            btnRequestProject.style.display = 'none';
            btnApplyJob.style.display = 'block';
        } else {
            portfolioActions.style.display = 'none';
        }
        
    } catch (err) {
        console.error('Error checking user session:', err);
        portfolioActions.style.display = 'none';
    }
});

// Request a Project button handler (clients only)
document.getElementById('btnRequestProject')?.addEventListener('click', function() {
    // Get agency ID from URL or page data
    // For now, redirect to project request form
    // Agency ID should be passed via URL parameter or stored in page data
    const urlParams = new URLSearchParams(window.location.search);
    const agencyId = urlParams.get('agency_id') || null;
    
    if (agencyId) {
        window.location.href = `formclient/exteriorproject.html?agency_id=${agencyId}`;
    } else {
        window.location.href = 'formclient/exteriorproject.html';
    }
});

// Apply for a Job button handler (architects/agencies only)
document.getElementById('btnApplyJob')?.addEventListener('click', async function() {
    const actionError = document.getElementById('action-error');
    const btnApplyJob = document.getElementById('btnApplyJob');
    
    // Check user type again
    try {
        const res = await fetch(`${API_BASE}/users/profile.php`, {
            method: 'GET',
            credentials: 'include',
        });
        
        if (!res.ok) {
            actionError.textContent = 'Please log in to apply for a job';
            actionError.style.display = 'block';
            return;
        }
        
        const data = await res.json();
        if (!data.success || !data.data?.user) {
            actionError.textContent = 'Please log in to apply for a job';
            actionError.style.display = 'block';
            return;
        }
        
        const userType = data.data.user.user_type;
        
        // Only architects and agencies can apply
        if (userType === 'client') {
            actionError.textContent = 'Only architects and agencies can apply for jobs';
            actionError.style.display = 'block';
            return;
        }
        
        // Get agency ID from URL or page data
        const urlParams = new URLSearchParams(window.location.search);
        const agencyId = urlParams.get('agency_id') || null;
        
        if (!agencyId) {
            // Try to get from page data or use a default
            // For now, redirect to application form
            // Agency ID should be stored in the page when viewing an agency portfolio
            window.location.href = `formarchitect/appliance.html`;
        } else {
            window.location.href = `formarchitect/appliance.html?agency_id=${agencyId}`;
        }
        
    } catch (err) {
        actionError.textContent = 'Network error. Please try again.';
        actionError.style.display = 'block';
    }
});
