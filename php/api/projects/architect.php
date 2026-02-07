<?php
// Start output buffering to prevent any accidental output
ob_start();

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

// Clear any output that might have been generated
ob_clean();

header('Content-Type: application/json');

// Check if user is logged in as architect
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'architect') {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Get database connection
$pdo = getDB();

$method = $_SERVER['REQUEST_METHOD'];
$architectId = (int)$_SESSION['user_id'];

switch ($method) {
    case 'GET':
        // Get all projects assigned to this architect
        $sql = "
            SELECT 
                p.*,
                p.request_id,
                c.first_name,
                c.last_name,
                ag.name as agency_name,
                ag.id as agency_id
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            LEFT JOIN agencies ag ON p.agency_id = ag.id
            WHERE p.assigned_architect_id = ?
            ORDER BY p.created_at DESC
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$architectId]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get photos for each project
        foreach ($projects as &$project) {
            $photoStmt = $pdo->prepare("SELECT photo_path, is_primary FROM project_photos WHERE project_id = ? ORDER BY is_primary DESC, display_order ASC LIMIT 1");
            $photoStmt->execute([$project['id']]);
            $photo = $photoStmt->fetch(PDO::FETCH_ASSOC);
            if ($photo) {
                $project['photos'] = [$photo];
            } else {
                $project['photos'] = [];
            }
        }
        
        ob_end_clean();
        echo json_encode(['success' => true, 'data' => $projects]);
        exit;
        break;
        
    default:
        ob_end_clean();
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
}
