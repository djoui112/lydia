<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Check if user is logged in as agency
    if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'agency') {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized - Agency login required'
        ]);
        exit;
    }
    
    $agencyId = (int)$_SESSION['user_id'];
    $status = $_GET['status'] ?? null;
    $search = sanitize($_GET['search'] ?? $_GET['query'] ?? '');
    
    // Build query
    $query = "SELECT 
                aa.id as application_id,
                aa.architect_id,
                aa.agency_id,
                aa.status,
                aa.created_at,
                a.first_name,
                a.last_name,
                a.primary_expertise,
                u.profile_image,
                u.email,
                u.phone_number
            FROM architect_applications aa
            INNER JOIN architects a ON aa.architect_id = a.id
            INNER JOIN users u ON a.id = u.id
            WHERE aa.agency_id = :agency_id";
    
    $params = [':agency_id' => $agencyId];
    
    // Filter by status if provided
    if ($status) {
        $query .= " AND aa.status = :status";
        $params[':status'] = $status;
    }
    
    // Search filter
    if ($search !== '') {
        $query .= " AND (CONCAT(a.first_name, ' ', a.last_name) LIKE :search 
                      OR a.primary_expertise LIKE :search
                      OR u.email LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    $query .= " ORDER BY aa.created_at DESC";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format profile image URLs
    foreach ($applications as &$app) {
        if (!empty($app['profile_image'])) {
            $app['profile_image_url'] = buildFileUrl($app['profile_image']);
        }
        $app['full_name'] = trim($app['first_name'] . ' ' . $app['last_name']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $applications
    ]);
    
} catch (Exception $e) {
    error_log('Error listing applications: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
