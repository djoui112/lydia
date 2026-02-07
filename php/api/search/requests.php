<?php
declare(strict_types=1);

// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// Start output buffering
if (ob_get_level() == 0) {
    ob_start();
}

try {
    // CRITICAL: Load session FIRST before anything else
    require_once __DIR__ . '/../../config/session.php';
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../middleware/cors.php';
    require_once __DIR__ . '/../utils/helpers.php';
} catch (Exception $e) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    exit;
}

// Clear any output
$output = ob_get_clean();
if (!empty($output) && trim($output) !== '') {
    error_log("Unexpected output before JSON: " . substr($output, 0, 200));
}
ob_start();

header('Content-Type: application/json');

// Ensure session is started and readable
// IMPORTANT: session_start() must be called BEFORE any output
// The session config file already handles this, but ensure it's started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Debug: Log session info
error_log("Requests API - Session ID: " . session_id());
error_log("Requests API - Session status: " . session_status());
error_log("Requests API - Has user_id: " . (isset($_SESSION['user_id']) ? 'YES' : 'NO'));
if (isset($_SESSION['user_id'])) {
    error_log("Requests API - User ID: " . $_SESSION['user_id']);
    error_log("Requests API - User Type: " . ($_SESSION['user_type'] ?? 'NOT SET'));
}

try {
    $db = getDB();
    
    // Debug session information
    error_log("Requests API - Session ID: " . session_id());
    error_log("Requests API - Session status: " . session_status());
    error_log("Requests API - Session data: " . print_r($_SESSION, true));
    error_log("Requests API - Cookies: " . print_r($_COOKIE, true));
    error_log("Requests API - Cookie params: " . print_r(session_get_cookie_params(), true));
    
    // Check if user is logged in and is an agency
    if (!isset($_SESSION['user_id'])) {
        error_log("Session check failed - user_id not set.");
        error_log("Session ID: " . session_id());
        error_log("Session status: " . session_status());
        error_log("Session data: " . print_r($_SESSION, true));
        error_log("Cookies received: " . print_r($_COOKIE, true));
        error_log("Cookie params: " . print_r(session_get_cookie_params(), true));
        
        ob_end_clean();
        http_response_code(401);
        echo json_encode([
            'error' => 'Not logged in', 
            'session_id' => session_id(), 
            'session_status' => session_status(),
            'session_data' => $_SESSION,
            'cookies_received' => $_COOKIE,
            'cookie_params' => session_get_cookie_params(),
            'message' => 'Session exists but user_id is not set. Please log in again.'
        ]);
        exit;
    }
    
    if ($_SESSION['user_type'] !== 'agency') {
        error_log("Session check failed - user_type is '{$_SESSION['user_type']}', expected 'agency'");
        ob_end_clean();
        http_response_code(403);
        echo json_encode(['error' => 'Not an agency account', 'user_type' => $_SESSION['user_type']]);
        exit;
    }
    
    $agencyId = (int)$_SESSION['user_id'];
    
    // Support both 'query' and 'search' parameters for frontend compatibility
    $search = sanitize($_GET['query'] ?? $_GET['search'] ?? '');
    
    // Check if pagination is requested, otherwise return all results
    $usePagination = isset($_GET['page']) || isset($_GET['limit']);
    $pagination = $usePagination ? getPaginationParams() : ['limit' => 10000, 'offset' => 0];

    // Build query - query project_requests table, filter by agency_id
    $whereClause = "WHERE pr.agency_id = :agency_id";
    $params = [':agency_id' => $agencyId];

    if (!empty($search)) {
        $whereClause .= " AND (
            pr.project_name LIKE :search OR 
            pr.description LIKE :search OR
            CONCAT(c.first_name, ' ', c.last_name) LIKE :search OR
            pr.project_location LIKE :search
        )";
        $params[':search'] = "%$search%";
    }

    // Get paginated results (or all if no pagination requested)
    $query = "SELECT 
                 pr.id,
                 pr.project_name,
                 pr.description,
                 pr.status,
                 pr.created_at,
                 CONCAT(c.first_name, ' ', c.last_name) AS client_name
             FROM project_requests pr
             JOIN clients c ON pr.client_id = c.id
             $whereClause 
             ORDER BY pr.created_at DESC 
             LIMIT :limit OFFSET :offset";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
    $stmt->execute();

    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // NOTE: The request management frontend (frontend/pages/request-managment.html)
    // calls `renderProjects(data)` and expects `data` to be a plain array
    // with fields: id, project_name, client_name, description. To keep that page
    // working without modification, we return the raw array here.
    ob_end_clean();
    echo json_encode($requests);
    exit;
    
} catch (Exception $e) {
    error_log("Error in search requests: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    ob_end_clean();
    http_response_code(500);
    // Return empty array to match expected format
    echo json_encode([]);
    exit;
}
