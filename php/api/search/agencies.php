<?php
declare(strict_types=1);

// Start output buffering to prevent any accidental output
ob_start();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

// Clear any output that might have been generated
ob_clean();

header('Content-Type: application/json');

try {
    $db = getDB();
    // Support both 'query' and 'search' parameters for frontend compatibility
    $search = sanitize($_GET['query'] ?? $_GET['search'] ?? '');
    
    // Check if pagination is requested, otherwise return all results
    $usePagination = isset($_GET['page']) || isset($_GET['limit']);
    $pagination = $usePagination ? getPaginationParams() : ['limit' => 10000, 'offset' => 0];

    // Build query - show all agencies (remove is_approved filter to show all)
    // If you want to filter by approval status later, you can add it back
    $whereClause = "WHERE 1=1";
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
    ob_end_clean(); // Clear buffer before outputting JSON
    echo json_encode($agencies);
    exit;
    
} catch (PDOException $e) {
    error_log("Database error in search agencies: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    ob_end_clean();
    http_response_code(500);
    echo json_encode([]);
    exit;
} catch (Exception $e) {
    error_log("Error in search agencies: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    ob_end_clean(); // Clear any output before error response
    http_response_code(500);
    // Return empty array to match expected format
    echo json_encode([]);
    exit;
}
