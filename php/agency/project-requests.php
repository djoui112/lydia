<?php
require_once '../config.php';
require_once '../auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$agencyId = getCurrentAgencyId($pdo);

switch ($method) {
    case 'GET':
        // Get all project requests for this agency
        $status = $_GET['status'] ?? null;
        $requestId = $_GET['request_id'] ?? null;
        
        if ($requestId) {
            // Get single request with all details
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
                WHERE pr.id = ? AND pr.agency_id = ?
            ");
            $stmt->execute([$requestId, $agencyId]);
            $request = $stmt->fetch();
            
            if (!$request) {
                http_response_code(404);
                echo json_encode(['error' => 'Request not found']);
                exit;
            }
            
            // Get interior details
            $stmt = $pdo->prepare("SELECT * FROM project_request_interior_details WHERE request_id = ?");
            $stmt->execute([$requestId]);
            $request['interior_details'] = $stmt->fetch();
            
            // Get exterior details
            $stmt = $pdo->prepare("SELECT * FROM project_request_exterior_details WHERE request_id = ?");
            $stmt->execute([$requestId]);
            $request['exterior_details'] = $stmt->fetch();
            
            // Get photos
            $stmt = $pdo->prepare("SELECT * FROM project_request_photos WHERE request_id = ?");
            $stmt->execute([$requestId]);
            $request['photos'] = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $request]);
        } else {
            // Get all requests
            $sql = "
                SELECT 
                    pr.*,
                    c.first_name,
                    c.last_name,
                    u.email as client_email
                FROM project_requests pr
                JOIN clients c ON pr.client_id = c.id
                JOIN users u ON c.id = u.id
                WHERE pr.agency_id = ?
            ";
            
            $params = [$agencyId];
            if ($status) {
                $sql .= " AND pr.status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY pr.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $requests = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $requests]);
        }
        break;
        
    case 'PUT':
        // Accept or reject project request
        $data = json_decode(file_get_contents('php://input'), true);
        $requestId = $data['request_id'] ?? null;
        $action = $data['action'] ?? null; // 'accept' or 'reject'
        
        if (!$requestId || !$action) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        // Verify request belongs to this agency
        $stmt = $pdo->prepare("SELECT * FROM project_requests WHERE id = ? AND agency_id = ?");
        $stmt->execute([$requestId, $agencyId]);
        $request = $stmt->fetch();
        
        if (!$request) {
            http_response_code(404);
            echo json_encode(['error' => 'Request not found']);
            exit;
        }
        
        $status = $action === 'accept' ? 'accepted' : 'rejected';
        
        // Update request status
        $stmt = $pdo->prepare("
            UPDATE project_requests 
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$status, $requestId]);
        
        // If accepted, create a project
        if ($action === 'accept') {
            $assignedArchitectId = $data['assigned_architect_id'] ?? null;
            
            $stmt = $pdo->prepare("
                INSERT INTO projects 
                (request_id, client_id, agency_id, assigned_architect_id, project_name, 
                 description, status, start_date, budget, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'planning', CURDATE(), ?, NOW())
            ");
            $stmt->execute([
                $requestId,
                $request['client_id'],
                $agencyId,
                $assignedArchitectId,
                $request['project_name'],
                $request['description'],
                $request['max_budget'] ?? $request['min_budget']
            ]);
            
            $projectId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Request accepted and project created',
                'project_id' => $projectId
            ]);
        } else {
            echo json_encode(['success' => true, 'message' => 'Request rejected']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
