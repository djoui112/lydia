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
    json_error('Unauthorized. Only architects can add experience.', 401);
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
    $agencyName = isset($input['agencyName']) ? trim($input['agencyName']) : '';
    $role = isset($input['role']) ? trim($input['role']) : '';
    $startMonth = isset($input['startMonth']) ? (int)$input['startMonth'] : 0;
    $startYear = isset($input['startYear']) ? (int)$input['startYear'] : 0;
    $endMonth = isset($input['endMonth']) ? (int)$input['endMonth'] : 0;
    $endYear = isset($input['endYear']) ? (int)$input['endYear'] : 0;
    $currentlyWorking = isset($input['currentlyWorking']) ? (bool)$input['currentlyWorking'] : false;
    $description = isset($input['description']) ? trim($input['description']) : '';
    
    // Validation
    if (empty($agencyName)) {
        json_error('Company/Agency name is required', 400);
    }
    
    if (empty($role)) {
        json_error('Role/Title is required', 400);
    }
    
    if ($startMonth < 1 || $startMonth > 12 || $startYear < 1950 || $startYear > 2100) {
        json_error('Invalid start date', 400);
    }
    
    // Build start date
    $startDate = sprintf('%04d-%02d-01', $startYear, $startMonth);
    
    // Build end date (if not currently working)
    $endDate = null;
    $isCurrent = false;
    
    if ($currentlyWorking) {
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
    
    // Try to find agency by name (optional - agency_id can be null)
    $agencyId = null;
    if (!empty($agencyName)) {
        $agencyQuery = "SELECT id FROM agencies WHERE name = :name LIMIT 1";
        $stmt = $db->prepare($agencyQuery);
        $stmt->execute([':name' => $agencyName]);
        $agency = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($agency) {
            $agencyId = (int)$agency['id'];
        }
    }
    
    // Get the highest display_order for this architect
    $orderQuery = "SELECT COALESCE(MAX(display_order), 0) as max_order 
                   FROM architect_experience 
                   WHERE architect_id = :architect_id";
    $stmt = $db->prepare($orderQuery);
    $stmt->execute([':architect_id' => $architectId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $displayOrder = ($result['max_order'] ?? 0) + 1;
    
    // Insert experience record
    $insertQuery = "INSERT INTO architect_experience (
                        architect_id,
                        agency_id,
                        agency_name,
                        role,
                        start_date,
                        end_date,
                        is_current,
                        description,
                        display_order,
                        created_at,
                        updated_at
                    ) VALUES (
                        :architect_id,
                        :agency_id,
                        :agency_name,
                        :role,
                        :start_date,
                        :end_date,
                        :is_current,
                        :description,
                        :display_order,
                        NOW(),
                        NOW()
                    )";
    
    $stmt = $db->prepare($insertQuery);
    $stmt->execute([
        ':architect_id' => $architectId,
        ':agency_id' => $agencyId,
        ':agency_name' => sanitize($agencyName),
        ':role' => sanitize($role),
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0,
        ':description' => !empty($description) ? sanitize($description) : null,
        ':display_order' => $displayOrder
    ]);
    
    $experienceId = (int)$db->lastInsertId();
    
    json_success([
        'experience_id' => $experienceId,
        'message' => 'Experience added successfully'
    ], 201);
    
} catch (Throwable $e) {
    error_log('Experience creation error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    json_error('Failed to add experience: ' . $e->getMessage(), 500);
}
