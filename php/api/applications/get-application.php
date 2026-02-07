<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get application ID from query parameter
    $applicationId = isset($_GET['application_id']) ? (int)$_GET['application_id'] : 0;
    
    if ($applicationId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid application ID'
        ]);
        exit;
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized - Please log in'
        ]);
        exit;
    }
    
    $userId = (int)$_SESSION['user_id'];
    $userType = $_SESSION['user_type'];
    
    // Fetch application with all related data
    $query = "SELECT 
                aa.id as application_id,
                aa.architect_id,
                aa.agency_id,
                aa.project_types,
                aa.motivation_letter,
                aa.status,
                aa.created_at,
                aa.updated_at,
                aa.reviewed_at,
                aa.reviewed_by,
                -- Architect information
                a.first_name,
                a.last_name,
                a.years_of_experience,
                a.primary_expertise,
                a.statement,
                a.city,
                a.address,
                a.date_of_birth,
                a.software_proficiency,
                a.portfolio_url,
                a.linkedin_url,
                -- User information
                u.email,
                u.profile_image,
                u.phone_number,
                -- Agency information
                ag.name as agency_name,
                ag.city as agency_city,
                ag.address as agency_address,
                ag.bio as agency_bio,
                ua.email as agency_email,
                ua.phone_number as agency_phone
            FROM architect_applications aa
            INNER JOIN architects a ON aa.architect_id = a.id
            INNER JOIN users u ON a.id = u.id
            INNER JOIN agencies ag ON aa.agency_id = ag.id
            INNER JOIN users ua ON ag.id = ua.id
            WHERE aa.id = :application_id
            LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':application_id' => $applicationId]);
    $application = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$application) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Application not found'
        ]);
        exit;
    }
    
    // Security check: Verify user has permission to view this application
    // - Architect can view their own applications
    // - Agency can view applications to their agency
    $hasPermission = false;
    
    if ($userType === 'architect' && (int)$application['architect_id'] === $userId) {
        $hasPermission = true;
    } elseif ($userType === 'agency' && (int)$application['agency_id'] === $userId) {
        $hasPermission = true;
    }
    
    if (!$hasPermission) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Forbidden - You do not have permission to view this application'
        ]);
        exit;
    }
    
    // Format date of birth
    if (!empty($application['date_of_birth'])) {
        try {
            $date = new DateTime($application['date_of_birth']);
            $application['date_of_birth_formatted'] = $date->format('d/m/Y');
        } catch (Exception $e) {
            $application['date_of_birth_formatted'] = $application['date_of_birth'];
        }
    } else {
        $application['date_of_birth_formatted'] = 'N/A';
    }
    
    // Format profile image URL
    if (!empty($application['profile_image'])) {
        $application['profile_image_url'] = buildFileUrl($application['profile_image']);
    }
    
    // Parse project types
    if (!empty($application['project_types'])) {
        try {
            $projectTypes = json_decode($application['project_types'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($projectTypes)) {
                $application['project_types_array'] = $projectTypes;
            } else {
                // If not JSON, treat as comma-separated string
                $application['project_types_array'] = array_map('trim', explode(',', $application['project_types']));
            }
        } catch (Exception $e) {
            $application['project_types_array'] = [];
        }
    } else {
        $application['project_types_array'] = [];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $application
    ]);
    
} catch (Exception $e) {
    error_log('Error fetching application: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
