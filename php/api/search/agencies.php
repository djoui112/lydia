<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';


header('Content-Type: application/json');

try {
    $db = getDB();
    // Support both 'query' and 'search' parameters for frontend compatibility
    $search = sanitize($_GET['query'] ?? $_GET['search'] ?? '');
    
    // Check if pagination is requested, otherwise return all results
    $usePagination = isset($_GET['page']) || isset($_GET['limit']);
    $pagination = $usePagination ? getPaginationParams() : ['limit' => 10000, 'offset' => 0];

    // Build query
    $whereClause = "WHERE is_approved = 1";
    $params = [];

    if (!empty($search)) {
        $whereClause .= " AND (name LIKE :search OR city LIKE :search OR bio LIKE :search)";
        $params[':search'] = "%$search%";
    }

    // Get paginated results (or all if no pagination requested)
    $query = "SELECT id, name, city, address, cover_image, bio 
             FROM agencies 
             $whereClause 
             ORDER BY name ASC 
             LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
    $stmt->execute();

    $agencies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // NOTE: The agencies listing frontend (frontend/pages/agencies.html)
    // calls `renderAgencies(data)` and expects `data` to be a plain array
    // of agencies, not wrapped in { success, data, message }.
    // To avoid breaking the existing UI, we intentionally return the raw array here.
    echo json_encode($agencies);
    
} catch (Exception $e) {
    error_log("Error in search agencies: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => [],
        'message' => 'An error occurred while searching agencies'
    ]);
}
