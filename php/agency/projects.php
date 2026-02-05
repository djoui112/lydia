<?php
require_once '../config.php';
require_once '../auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$agencyId = getCurrentAgencyId($pdo);

switch ($method) {
    case 'GET':
        // Get all projects or single project
        $projectId = $_GET['project_id'] ?? null;
        
        if ($projectId) {
            // Get single project with details
            $stmt = $pdo->prepare("
                SELECT 
                    p.*,
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
            $project = $stmt->fetch();
            
            if (!$project) {
                http_response_code(404);
                echo json_encode(['error' => 'Project not found']);
                exit;
            }
            
            // Get milestones
            $stmt = $pdo->prepare("SELECT * FROM project_milestones WHERE project_id = ? ORDER BY due_date ASC");
            $stmt->execute([$projectId]);
            $project['milestones'] = $stmt->fetchAll();
            
            // Get photos
            $stmt = $pdo->prepare("SELECT * FROM project_photos WHERE project_id = ? ORDER BY display_order ASC");
            $stmt->execute([$projectId]);
            $project['photos'] = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $project]);
        } else {
            // Get all projects
            $status = $_GET['status'] ?? null;
            
            $sql = "
                SELECT 
                    p.*,
                    c.first_name,
                    c.last_name
                FROM projects p
                JOIN clients c ON p.client_id = c.id
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
            $projects = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $projects]);
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
        
        echo json_encode(['success' => true, 'message' => 'Project updated successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
