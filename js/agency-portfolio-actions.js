// Agency Portfolio Action Buttons
// Simple direct links to forms

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const btnRequestProject = document.getElementById('btnRequestProject');
    const btnApplyJob = document.getElementById('btnApplyJob');
    
    if (!btnRequestProject || !btnApplyJob) {
        return;
    }
    
    // Get agency ID from URL parameter 'id' (used by portfolio page) or 'agency_id', or from window.agencyId
    const urlParams = new URLSearchParams(window.location.search);
    const agencyId = urlParams.get('id') || urlParams.get('agency_id') || window.agencyId || null;
    
    // Request a Project button - link to exteriorproject.html
    btnRequestProject.addEventListener('click', function() {
        if (agencyId) {
            window.location.href = `formclient/exteriorproject.html?agency_id=${agencyId}`;
        } else {
            window.location.href = 'formclient/exteriorproject.html';
        }
    });

    // Apply button - link to appliance.html
    btnApplyJob.addEventListener('click', function() {
        if (agencyId) {
            window.location.href = `formarchitect/appliance.html?agency_id=${agencyId}`;
        } else {
            window.location.href = 'formarchitect/appliance.html';
        }
    });
});
