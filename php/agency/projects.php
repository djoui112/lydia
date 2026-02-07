<?php
// Start output buffering to prevent any accidental output
ob_start();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../api/utils/helpers.php';

// Clear any output that might have been generated
ob_clean();

header('Content-Type: application/json');

// Check if user is logged in as agency
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'agency') {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Get database connection
$pdo = getDB();

$method = $_SERVER['REQUEST_METHOD'];
$agencyId = (int)$_SESSION['user_id'];

switch ($method) {
    case 'GET':
        // Get all projects or single project
        $projectId = $_GET['project_id'] ?? null;
        
        if ($projectId) {
            // Get single project with details
            $stmt = $pdo->prepare("
                SELECT 
                    p.*,
                    p.request_id,
                    c.first_name,
                    c.last_name,
                    u.email as client_email,
                    a.first_name as architect_first_name,
                    a.last_name as architect_last_name
                FROM projects p
                JOIN clients c ON p.client_id = c.id
                JOIN users u ON c.id = u.id
                LEFT JOIN architects a ON p.assigned_architect_id = a.id
                WHERE p.id = ? AND p.agency_id = ?
            ");
            $stmt->execute([$projectId, $agencyId]);
            $project = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$project) {
                ob_end_clean();
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Project not found']);
                exit;
            }
            
            // Get milestones
            $stmt = $pdo->prepare("SELECT * FROM project_milestones WHERE project_id = ? ORDER BY due_date ASC");
            $stmt->execute([$projectId]);
            $project['milestones'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get photos
            $stmt = $pdo->prepare("SELECT * FROM project_photos WHERE project_id = ? ORDER BY display_order ASC");
            $stmt->execute([$projectId]);
            $project['photos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            ob_end_clean();
            echo json_encode(['success' => true, 'data' => $project]);
            exit;
        } else {
            // Get all projects
            $status = $_GET['status'] ?? null;
            
            $sql = "
                SELECT 
                    p.*,
                    c.first_name,
                    c.last_name,
                    a.first_name as architect_first_name,
                    a.last_name as architect_last_name
                FROM projects p
                JOIN clients c ON p.client_id = c.id
                LEFT JOIN architects a ON p.assigned_architect_id = a.id
                WHERE p.agency_id = ?
            ";
            
            $params = [$agencyId];
            if ($status) {
                $sql .= " AND p.status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY p.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
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
        }
        break;
        
    case 'PUT':
        // Update project
        $data = json_decode(file_get_contents('php://input'), true);
        $projectId = $data['project_id'] ?? null;
        
        if (!$projectId) {
            http_response_code(400);
            echo json_encode(['error' => 'Project ID required']);
            exit;
        }
        
        // Verify project belongs to this agency
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ? AND agency_id = ?");
        $stmt->execute([$projectId, $agencyId]);
        $project = $stmt->fetch();
        
        if (!$project) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            exit;
        }
        
        $allowedFields = [
            'project_name', 'description', 'status', 'progress_percentage',
            'start_date', 'deadline', 'completed_date', 'budget', 'assigned_architect_id'
        ];
        
        $updates = [];
        $values = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields to update']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            UPDATE projects 
            SET " . implode(', ', $updates) . ", updated_at = NOW()
            WHERE id = ?
        ");
        $values[] = $projectId;
        $stmt->execute($values);
        
        ob_end_clean();
        echo json_encode(['success' => true, 'message' => 'Project updated successfully']);
        exit;
        break;
        
    default:
        ob_end_clean();
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
}
