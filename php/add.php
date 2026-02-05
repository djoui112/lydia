<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please log in.'
    ]);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$userType = $_SESSION['user_type'];

// Only architects can add experience
if ($userType !== 'architect') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Only architects can add experience records'
    ]);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON input'
    ]);
    exit;
}

// Validate required fields
$agencyName = trim($input['agencyName'] ?? '');
$role = trim($input['role'] ?? '');
$startMonth = $input['startMonth'] ?? '';
$startYear = $input['startYear'] ?? '';
$endMonth = $input['endMonth'] ?? '';
$endYear = $input['endYear'] ?? '';
$isCurrent = !empty($input['currentlyWorking']);
$description = trim($input['description'] ?? '');

// Validation
$errors = [];

if (empty($agencyName)) {
    $errors[] = 'Company/Agency name is required';
}

if (empty($role)) {
    $errors[] = 'Role/Title is required';
}

if (empty($startMonth) || empty($startYear)) {
    $errors[] = 'Start date is required';
}

if (!$isCurrent && (empty($endMonth) || empty($endYear))) {
    $errors[] = 'End date is required unless currently working';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

try {
    // Format dates
    $startDate = null;
    if (!empty($startMonth) && !empty($startYear)) {
        $startDate = sprintf('%04d-%02d-01', (int)$startYear, (int)$startMonth);
    }
    
    $endDate = null;
    if (!$isCurrent && !empty($endMonth) && !empty($endYear)) {
        $lastDay = cal_days_in_month(CAL_GREGORIAN, (int)$endMonth, (int)$endYear);
        $endDate = sprintf('%04d-%02d-%02d', (int)$endYear, (int)$endMonth, $lastDay);
    }
    
    // Validate that end date is after start date
    if ($startDate && $endDate && $endDate < $startDate) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'End date must be after start date'
        ]);
        exit;
    }
    
    // Get the highest display_order for this architect
    $orderQuery = "SELECT COALESCE(MAX(display_order), -1) + 1 as next_order 
                   FROM architect_experience 
                   WHERE architect_id = :architect_id";
    $stmt = $pdo->prepare($orderQuery);
    $stmt->execute([':architect_id' => $userId]);
    $nextOrder = $stmt->fetchColumn();
    
    // Insert experience record
    // Note: agency_id is NULL since we're just storing agency_name (agency not in system)
    $insertQuery = "INSERT INTO architect_experience (
                        architect_id,
                        role,
                        agency_id,
                        agency_name,
                        start_date,
                        end_date,
                        is_current,
                        description,
                        display_order,
                        created_at,
                        updated_at
                    ) VALUES (
                        :architect_id,
                        :role,
                        NULL,
                        :agency_name,
                        :start_date,
                        :end_date,
                        :is_current,
                        :description,
                        :display_order,
                        NOW(),
                        NOW()
                    )";
    
    $stmt = $pdo->prepare($insertQuery);
    $result = $stmt->execute([
        ':architect_id' => $userId,
        ':role' => $role,
        ':agency_name' => $agencyName,
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0,
        ':description' => $description ?: null,
        ':display_order' => $nextOrder
    ]);
    
    if ($result) {
        $experienceId = $pdo->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Experience record added successfully',
            'data' => [
                'id' => (int)$experienceId,
                'role' => $role,
                'agency_name' => $agencyName,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_current' => $isCurrent
            ]
        ]);
    } else {
        throw new Exception('Failed to insert experience record');
    }
    
} catch (PDOException $e) {
    error_log('Database error in add experience: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log('Error in add experience: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while adding experience'
    ]);
}
?>
