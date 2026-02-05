<?php
require_once 'config.php';

function getCurrentAgencyId($pdo) {
    // Get agency ID from session or JWT token
    // For now, using session - you can implement JWT later
    session_start();
    
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'agency') {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    return $_SESSION['user_id'];
}

function verifyAgencyOwnership($pdo, $agencyId, $resourceId, $resourceType) {
    // Verify that the agency owns the resource
    // This is a placeholder - implement based on your needs
    return true;
}
?>
