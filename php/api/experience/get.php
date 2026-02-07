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
    json_error('Unauthorized. Only architects can view experience.', 401);
}

try {
    $db = getDB();
    $architectId = (int)$_SESSION['user_id'];
    $experienceId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($experienceId <= 0) {
        json_error('Invalid experience ID', 400);
    }
    
    // Fetch experience record
    $query = "SELECT 
                id,
                architect_id,
                agency_id,
                agency_name,
                role,
                start_date,
                end_date,
                is_current,
                description,
                display_order
              FROM architect_experience
              WHERE id = :id AND architect_id = :architect_id
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':id' => $experienceId,
        ':architect_id' => $architectId
    ]);
    
    $experience = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$experience) {
        json_error('Experience record not found', 404);
    }
    
    json_success($experience);
    
} catch (Throwable $e) {
    error_log('Experience fetch error: ' . $e->getMessage());
    json_error('Failed to fetch experience: ' . $e->getMessage(), 500);
}
