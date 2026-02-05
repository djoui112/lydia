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

// Only architects can view their education
if ($userType !== 'architect') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Only architects can view education records'
    ]);
    exit;
}

// Get education ID from query parameter
$educationId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($educationId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid education ID'
    ]);
    exit;
}

try {
    // Get education record - verify it belongs to the current user
    $query = "SELECT 
                id,
                university_name,
                degree,
                field_of_study,
                start_date,
                end_date,
                is_current,
                display_order,
                created_at,
                updated_at
              FROM architect_education
              WHERE id = :id AND architect_id = :architect_id";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        ':id' => $educationId,
        ':architect_id' => $userId
    ]);
    
    $education = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$education) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Education record not found or access denied'
        ]);
        exit;
    }
    
    // Convert is_current to boolean
    $education['is_current'] = (bool)$education['is_current'];
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $education
    ]);
    
} catch (PDOException $e) {
    error_log('Database error in get education: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log('Error in get education: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching education'
    ]);
}
?>
