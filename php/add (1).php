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

// Only architects can add education
if ($userType !== 'architect') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Only architects can add education records'
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
$universityName = trim($input['school'] ?? '');
$degree = trim($input['degree'] ?? '');
$fieldOfStudy = trim($input['fieldOfStudy'] ?? '');
$startMonth = $input['startMonth'] ?? '';
$startYear = $input['startYear'] ?? '';
$endMonth = $input['endMonth'] ?? '';
$endYear = $input['endYear'] ?? '';
$isCurrent = !empty($input['currentlyStudying']);
$description = trim($input['description'] ?? '');

// Validation
$errors = [];

if (empty($universityName)) {
    $errors[] = 'School name is required';
}

if (empty($degree)) {
    $errors[] = 'Degree is required';
}

if (empty($fieldOfStudy)) {
    $errors[] = 'Field of study is required';
}

if (empty($startMonth) || empty($startYear)) {
    $errors[] = 'Start date is required';
}

if (!$isCurrent && (empty($endMonth) || empty($endYear))) {
    $errors[] = 'End date is required unless currently studying';
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
        // Use last day of the month for end date
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
                   FROM architect_education 
                   WHERE architect_id = :architect_id";
    $stmt = $pdo->prepare($orderQuery);
    $stmt->execute([':architect_id' => $userId]);
    $nextOrder = $stmt->fetchColumn();
    
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
    
    $stmt = $pdo->prepare($insertQuery);
    $result = $stmt->execute([
        ':architect_id' => $userId,
        ':university_name' => $universityName,
        ':degree' => $degree,
        ':field_of_study' => $fieldOfStudy,
        ':start_date' => $startDate,
        ':end_date' => $endDate,
        ':is_current' => $isCurrent ? 1 : 0,
        ':display_order' => $nextOrder
    ]);
    
    if ($result) {
        $educationId = $pdo->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Education record added successfully',
            'data' => [
                'id' => (int)$educationId,
                'university_name' => $universityName,
                'degree' => $degree,
                'field_of_study' => $fieldOfStudy,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'is_current' => $isCurrent
            ]
        ]);
    } else {
        throw new Exception('Failed to insert education record');
    }
    
} catch (PDOException $e) {
    error_log('Database error in add education: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log('Error in add education: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while adding education'
    ]);
}
?>
