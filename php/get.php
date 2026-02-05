<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';

header('Content-Type: application/json');

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Only architects can view their experience
if ($userType !== 'architect') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Only architects can view experience records'
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

try {
    // Get experience record - verify it belongs to the current user
    $query = "SELECT 
                id,
                role,
                agency_name,
                agency_id,
                start_date,
                end_date,
                is_current,
                description,
                display_order,
                created_at,
                updated_at
              FROM architect_experience
              WHERE id = :id AND architect_id = :architect_id";
    
    $stmt = $pdo->prepare($query);
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
    
    // Convert is_current to boolean
    $experience['is_current'] = (bool)$experience['is_current'];
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $experience
    ]);
    
} catch (PDOException $e) {
    error_log('Database error in get experience: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
}
