<?php
// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// Start output buffering at the very beginning
if (ob_get_level() == 0) {
    ob_start();
}

try {
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../middleware/cors.php';
    require_once __DIR__ . '/../../config/session.php';
    require_once __DIR__ . '/../utils/response.php';
} catch (Exception $e) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    exit;
}

// Clear any output that might have been generated
$output = ob_get_clean();
if (!empty($output) && trim($output) !== '') {
    error_log("Unexpected output before JSON: " . substr($output, 0, 200));
}
ob_start();

// Ensure session is started and readable
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['user_id'])) {
    ob_end_clean();
    json_error('Unauthorized - Please log in first', 401);
    exit;
}

$userId = (int)$_SESSION['user_id'];
$userType = $_SESSION['user_type'] ?? null;

// Only agencies and clients (viewing their own requests) can view project request details
if ($userType !== 'agency' && $userType !== 'client') {
    ob_end_clean();
    json_error('Only agencies and clients can view project request details', 403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ob_end_clean();
    json_error('Method not allowed', 405);
    exit;
}

// Get request ID from query parameter
$requestId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($requestId <= 0) {
    ob_end_clean();
    json_error('Invalid request ID', 400);
    exit;
}

try {
    // Get project request with client information
    // Build query based on user type
    if ($userType === 'agency') {
        // Agencies can view requests sent to them
        $stmt = $pdo->prepare("
            SELECT 
                pr.*,
                c.first_name,
                c.last_name,
                u.email as client_email,
                u.phone_number as client_phone
            FROM project_requests pr
            JOIN clients c ON pr.client_id = c.id
            JOIN users u ON c.id = u.id
            WHERE pr.id = :request_id AND pr.agency_id = :user_id
        ");
        
        $stmt->execute([
            'request_id' => $requestId,
            'user_id' => $userId
        ]);
    } else {
        // Clients can view their own requests
        $stmt = $pdo->prepare("
            SELECT 
                pr.*,
                c.first_name,
                c.last_name,
                u.email as client_email,
                u.phone_number as client_phone
            FROM project_requests pr
            JOIN clients c ON pr.client_id = c.id
            JOIN users u ON c.id = u.id
            WHERE pr.id = :request_id AND pr.client_id = :user_id
        ");
        
        $stmt->execute([
            'request_id' => $requestId,
            'user_id' => $userId
        ]);
    }
    
    $request = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$request) {
        error_log("Request not found - Request ID: $requestId, User ID: $userId, User Type: $userType");
        // Check if request exists
        $checkStmt = $pdo->prepare("SELECT id, agency_id, client_id FROM project_requests WHERE id = :request_id");
        $checkStmt->execute(['request_id' => $requestId]);
        $checkRequest = $checkStmt->fetch(PDO::FETCH_ASSOC);
        if ($checkRequest) {
            if ($userType === 'agency') {
                error_log("Request exists but belongs to agency: {$checkRequest['agency_id']}, not $userId");
            } else {
                error_log("Request exists but belongs to client: {$checkRequest['client_id']}, not $userId");
            }
        } else {
            error_log("Request ID $requestId does not exist at all");
        }
        ob_end_clean();
        json_error('Request not found', 404);
        exit;
    }
    
    // Get interior details if exists
    $stmt = $pdo->prepare("SELECT * FROM project_request_interior_details WHERE request_id = :request_id");
    $stmt->execute(['request_id' => $requestId]);
    $interiorDetails = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Decode JSON fields if they exist
    if ($interiorDetails && !empty($interiorDetails['material_preferences'])) {
        $decoded = json_decode($interiorDetails['material_preferences'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $interiorDetails['material_preferences'] = implode(', ', $decoded);
        }
    }
    
    $request['interior_details'] = $interiorDetails ?: null;
    
    // Get exterior details if exists
    $stmt = $pdo->prepare("SELECT * FROM project_request_exterior_details WHERE request_id = :request_id");
    $stmt->execute(['request_id' => $requestId]);
    $exteriorDetails = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Decode JSON fields if they exist
    if ($exteriorDetails && !empty($exteriorDetails['material_preferences'])) {
        $decoded = json_decode($exteriorDetails['material_preferences'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $exteriorDetails['material_preferences'] = implode(', ', $decoded);
        }
    }
    
    $request['exterior_details'] = $exteriorDetails ?: null;
    
    // Get photos if exists
    $stmt = $pdo->prepare("SELECT * FROM project_request_photos WHERE request_id = :request_id");
    $stmt->execute(['request_id' => $requestId]);
    $request['photos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    ob_end_clean();
    json_success($request);
    exit;
    
} catch (Exception $e) {
    error_log("Error fetching project request: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    ob_end_clean();
    json_error('Failed to fetch project request: ' . $e->getMessage(), 500);
    exit;
}
