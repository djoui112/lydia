<?php
require_once '../config.php';
require_once '../auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$agencyId = getCurrentAgencyId($pdo);

switch ($method) {
    case 'GET':
        // Get milestones for a project
        $projectId = $_GET['project_id'] ?? null;
        
        if (!$projectId) {
            http_response_code(400);
            echo json_encode(['error' => 'Project ID required']);
            exit;
        }
        
        // Verify project belongs to agency
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ? AND agency_id = ?");
        $stmt->execute([$projectId, $agencyId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT * FROM project_milestones 
            WHERE project_id = ? 
            ORDER BY due_date ASC, due_time ASC
        ");
        $stmt->execute([$projectId]);
        $milestones = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $milestones]);
        break;
        
    case 'POST':
        // Create milestone
        $data = json_decode(file_get_contents('php://input'), true);
        $projectId = $data['project_id'] ?? null;
        
        if (!$projectId || !isset($data['title']) || !isset($data['due_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        // Verify project belongs to agency
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ? AND agency_id = ?");
        $stmt->execute([$projectId, $agencyId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Project not found']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO project_milestones 
            (project_id, title, description, due_date, due_time, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $projectId,
            $data['title'],
            $data['description'] ?? null,
            $data['due_date'],
            $data['due_time'] ?? null
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Milestone created successfully',
            'milestone_id' => $pdo->lastInsertId()
        ]);
        break;
        
    case 'PUT':
        // Update milestone
        $data = json_decode(file_get_contents('php://input'), true);
        $milestoneId = $data['milestone_id'] ?? null;
        
        if (!$milestoneId) {
            http_response_code(400);
            echo json_encode(['error' => 'Milestone ID required']);
            exit;
        }
        
        // Verify milestone belongs to agency's project
        $stmt = $pdo->prepare("
            SELECT pm.* FROM project_milestones pm
            JOIN projects p ON pm.project_id = p.id
            WHERE pm.id = ? AND p.agency_id = ?
        ");
        $stmt->execute([$milestoneId, $agencyId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Milestone not found']);
            exit;
        }
        
        $allowedFields = ['title', 'description', 'due_date', 'due_time', 'is_completed'];
        $updates = [];
        $values = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (isset($data['is_completed']) && $data['is_completed']) {
            $updates[] = "completed_at = NOW()";
        } elseif (isset($data['is_completed']) && !$data['is_completed']) {
            $updates[] = "completed_at = NULL";
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            UPDATE project_milestones 
            SET " . implode(', ', $updates) . ", updated_at = NOW()
            WHERE id = ?
        ");
        $values[] = $milestoneId;
        $stmt->execute($values);
        
        echo json_encode(['success' => true, 'message' => 'Milestone updated successfully']);
        break;
        
    case 'DELETE':
        // Delete milestone
        $milestoneId = $_GET['milestone_id'] ?? null;
        
        if (!$milestoneId) {
            http_response_code(400);
            echo json_encode(['error' => 'Milestone ID required']);
            exit;
        }
        
        // Verify milestone belongs to agency's project
        $stmt = $pdo->prepare("
            SELECT pm.* FROM project_milestones pm
            JOIN projects p ON pm.project_id = p.id
            WHERE pm.id = ? AND p.agency_id = ?
        ");
        $stmt->execute([$milestoneId, $agencyId]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Milestone not found']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM project_milestones WHERE id = ?");
        $stmt->execute([$milestoneId]);
        
        echo json_encode(['success' => true, 'message' => 'Milestone deleted successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
