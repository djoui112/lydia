<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';

header('Content-Type: application/json');

// Only accept PUT/PATCH requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

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

// Only architects can update experience
if ($userType !== 'architect') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Only architects can update experience records'
    ]);
    exit;
}

// Get experience ID from query parameter
$experienceId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($experienceId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid experience ID'
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
$role = trim($input['role'] ?? '');
$agencyName = trim($input['agencyName'] ?? '');
$startMonth = $input['startMonth'] ?? '';
$startYear = $input['startYear'] ?? '';
$endMonth = $input['endMonth'] ?? '';
$endYear = $input['endYear'] ?? '';
$isCurrent = !empty($input['currentlyWorking']);
$description = trim($input['description'] ?? '');

// Validation
$errors = [];

if (empty($role)) {
    $errors[] = 'Role is required';
}

if (empty($agencyName)) {
    $errors[] = 'Agency name is required';
}

if (empty($startMonth) || empty($startYear)) {
    $errors[] = 'Start date is required';
}

if (!$isCurrent && (empty($endMonth) || empty($endYear))) {
    $errors[] = 'End date is required unless currently working';
}

if (strlen($description) > 1000) {
    $errors[] = 'Description cannot exceed 1000 characters';
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
    // Check if the experience record exists and belongs to the current user
    $checkQuery = "SELECT id FROM architect_experience 
                   WHERE id = :id AND architect_id = :architect_id";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute([
        ':id' => $experienceId,
        ':architect_id' => $userId
    ]);
    
    $experience = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$experience) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Experience record not found or access denied'
        ]);
        exit;
    }
    
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
    
    // Update the experience record
    $updateQuery = "UPDATE architect_experience 
                    SET role = :role,
                        agency_name = :agency_name,
                        start_date = :start_date,
                        end_date = :end_date,
                        is_current = :is_current,
                        description = :description,
                        updated_at = NOW()
                    WHERE id = :id AND architect_id = :architect_id";
    
    $stmt = $pdo->prepare($updateQuery);
    $success = $stmt->execute([
        ':role' => $role,
        ':agency_name' => $agencyName,
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0,
        ':description' => $description,
        ':id' => $experienceId,
        ':architect_id' => $userId
    ]);
    
    if ($success) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Experience updated successfully',
            'data' => [
                'id' => $experienceId
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update experience'
        ]);
    }
    
} catch (PDOException $e) {
    error_log('Database error in update experience: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
}
