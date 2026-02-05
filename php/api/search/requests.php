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

    // Build query (search by project name, description, or client name)
    $whereClause = "WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $whereClause .= " AND (
            p.project_name LIKE :search OR 
            p.description LIKE :search OR
            CONCAT(c.first_name, ' ', c.last_name) LIKE :search
        )";
        $params[':search'] = "%$search%";
    }

    // Get paginated results (or all if no pagination requested)
    $query = "SELECT 
                 p.id,
                 p.project_name,
                 p.description,
                 CONCAT(c.first_name, ' ', c.last_name) AS client_name
             FROM projects p
             JOIN clients c ON p.client_id = c.id
             $whereClause 
             ORDER BY p.created_at DESC 
             LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
    $stmt->execute();

    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // NOTE: The request management frontend (frontend/pages/request-managment.html)
    // calls `renderProjects(data)` and expects `data` to be a plain array of projects
    // with fields: id, project_name, client_name, description. To keep that page
    // working without modification, we return the raw array here.
    echo json_encode($projects);
    
} catch (Exception $e) {
    error_log("Error in search projects: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => [],
        'message' => 'An error occurred while searching projects'
    ]);
}
