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
    json_error('Unauthorized. Only architects can update experience.', 401);
}

try {
    $db = getDB();
    $architectId = (int)$_SESSION['user_id'];
    $experienceId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($experienceId <= 0) {
        json_error('Invalid experience ID', 400);
    }
    
    // Verify the experience record belongs to this architect
    $checkQuery = "SELECT id FROM architect_experience 
                   WHERE id = :id AND architect_id = :architect_id 
                   LIMIT 1";
    $stmt = $db->prepare($checkQuery);
    $stmt->execute([
        ':id' => $experienceId,
        ':architect_id' => $architectId
    ]);
    
    if (!$stmt->fetch()) {
        json_error('Experience record not found or unauthorized', 404);
    }
    
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
    
    // Update experience record
    $updateQuery = "UPDATE architect_experience SET
                        agency_id = :agency_id,
                        agency_name = :agency_name,
                        role = :role,
                        start_date = :start_date,
                        end_date = :end_date,
                        is_current = :is_current,
                        description = :description,
                        updated_at = NOW()
                    WHERE id = :id AND architect_id = :architect_id";
    
    $stmt = $db->prepare($updateQuery);
    $stmt->execute([
        ':id' => $experienceId,
        ':architect_id' => $architectId,
        ':agency_id' => $agencyId,
        ':agency_name' => sanitize($agencyName),
        ':role' => sanitize($role),
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0,
        ':description' => !empty($description) ? sanitize($description) : null
    ]);
    
    json_success([
        'experience_id' => $experienceId,
        'message' => 'Experience updated successfully'
    ]);
    
} catch (Throwable $e) {
    error_log('Experience update error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    json_error('Failed to update experience: ' . $e->getMessage(), 500);
}
