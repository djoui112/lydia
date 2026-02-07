<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/response.php';

// Only allow PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_error('Method not allowed', 405);
}

// Check authentication
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'architect') {
    json_error('Unauthorized. Only architects can update education.', 401);
}

try {
    $db = getDB();
    $architectId = (int)$_SESSION['user_id'];
    $educationId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($educationId <= 0) {
        json_error('Invalid education ID', 400);
    }
    
    // Verify the education record belongs to this architect
    $checkQuery = "SELECT id FROM architect_education 
                   WHERE id = :id AND architect_id = :architect_id 
                   LIMIT 1";
    $stmt = $db->prepare($checkQuery);
    $stmt->execute([
        ':id' => $educationId,
        ':architect_id' => $architectId
    ]);
    
    if (!$stmt->fetch()) {
        json_error('Education record not found or unauthorized', 404);
    }
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST; // Fallback to POST data
    }
    
    // Validate required fields
    $universityName = isset($input['school']) ? trim($input['school']) : '';
    $degree = isset($input['degree']) ? trim($input['degree']) : '';
    $fieldOfStudy = isset($input['fieldOfStudy']) ? trim($input['fieldOfStudy']) : '';
    $startMonth = isset($input['startMonth']) ? (int)$input['startMonth'] : 0;
    $startYear = isset($input['startYear']) ? (int)$input['startYear'] : 0;
    $endMonth = isset($input['endMonth']) ? (int)$input['endMonth'] : 0;
    $endYear = isset($input['endYear']) ? (int)$input['endYear'] : 0;
    $currentlyStudying = isset($input['currentlyStudying']) ? (bool)$input['currentlyStudying'] : false;
    
    // Validation
    if (empty($universityName)) {
        json_error('School name is required', 400);
    }
    
    if (empty($degree)) {
        json_error('Degree is required', 400);
    }
    
    if (empty($fieldOfStudy)) {
        json_error('Field of study is required', 400);
    }
    
    if ($startMonth < 1 || $startMonth > 12 || $startYear < 1950 || $startYear > 2100) {
        json_error('Invalid start date', 400);
    }
    
    // Build start date
    $startDate = sprintf('%04d-%02d-01', $startYear, $startMonth);
    
    // Build end date (if not currently studying)
    $endDate = null;
    $isCurrent = false;
    
    if ($currentlyStudying) {
        $isCurrent = true;
    } else {
        if ($endMonth < 1 || $endMonth > 12 || $endYear < 1950 || $endYear > 2100) {
            json_error('Invalid end date', 400);
        }
        
        // Validate end date is after start date
        $startDateTime = new DateTime($startDate);
        $endDate = sprintf('%04d-%02d-01', $endYear, $endMonth);
        $endDateTime = new DateTime($endDate);
        
        if ($endDateTime < $startDateTime) {
            json_error('End date must be after start date', 400);
        }
    }
    
    // Update education record
    $updateQuery = "UPDATE architect_education SET
                        university_name = :university_name,
                        degree = :degree,
                        field_of_study = :field_of_study,
                        start_date = :start_date,
                        end_date = :end_date,
                        is_current = :is_current,
                        updated_at = NOW()
                    WHERE id = :id AND architect_id = :architect_id";
    
    $stmt = $db->prepare($updateQuery);
    $stmt->execute([
        ':id' => $educationId,
        ':architect_id' => $architectId,
        ':university_name' => sanitize($universityName),
        ':degree' => sanitize($degree),
        ':field_of_study' => sanitize($fieldOfStudy),
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0
    ]);
    
    json_success([
        'education_id' => $educationId,
        'message' => 'Education updated successfully'
    ]);
    
} catch (Throwable $e) {
    error_log('Education update error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    json_error('Failed to update education: ' . $e->getMessage(), 500);
}
