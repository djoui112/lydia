<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/response.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

// Check authentication
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'architect') {
    json_error('Unauthorized. Only architects can view education.', 401);
}

try {
    $db = getDB();
    $architectId = (int)$_SESSION['user_id'];
    $educationId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($educationId <= 0) {
        json_error('Invalid education ID', 400);
    }
    
    // Fetch education record
    $query = "SELECT 
                id,
                architect_id,
                university_name,
                degree,
                field_of_study,
                start_date,
                end_date,
                is_current,
                display_order
              FROM architect_education
              WHERE id = :id AND architect_id = :architect_id
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $educationId,
        ':architect_id' => $architectId
    ]);
    
    $education = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$education) {
        json_error('Education record not found', 404);
    }
    
    json_success($education);
    
} catch (Throwable $e) {
    error_log('Education fetch error: ' . $e->getMessage());
    json_error('Failed to fetch education: ' . $e->getMessage(), 500);
}
