<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/response.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// Check authentication
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'architect') {
    json_error('Unauthorized. Only architects can add education.', 401);
}

try {
    $db = getDB();
    $architectId = (int)$_SESSION['user_id'];
    
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
    
    // Get the highest display_order for this architect
    $orderQuery = "SELECT COALESCE(MAX(display_order), 0) as max_order 
                   FROM architect_education 
                   WHERE architect_id = :architect_id";
    $stmt = $db->prepare($orderQuery);
    $stmt->execute([':architect_id' => $architectId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $displayOrder = ($result['max_order'] ?? 0) + 1;
    
    // Insert education record
    $insertQuery = "INSERT INTO architect_education (
                        architect_id,
                        university_name,
                        degree,
                        field_of_study,
                        start_date,
                        end_date,
                        is_current,
                        display_order,
                        created_at,
                        updated_at
                    ) VALUES (
                        :architect_id,
                        :university_name,
                        :degree,
                        :field_of_study,
                        :start_date,
                        :end_date,
                        :is_current,
                        :display_order,
                        NOW(),
                        NOW()
                    )";
    
    $stmt = $db->prepare($insertQuery);
    $stmt->execute([
        ':architect_id' => $architectId,
        ':university_name' => sanitize($universityName),
        ':degree' => sanitize($degree),
        ':field_of_study' => sanitize($fieldOfStudy),
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0,
        ':display_order' => $displayOrder
    ]);
    
    $educationId = (int)$db->lastInsertId();
    
    json_success([
        'education_id' => $educationId,
        'message' => 'Education added successfully'
    ], 201);
    
} catch (Throwable $e) {
    error_log('Education creation error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    json_error('Failed to add education: ' . $e->getMessage(), 500);
}
