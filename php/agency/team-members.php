<?php
require_once '../config.php';
require_once '../auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$agencyId = getCurrentAgencyId($pdo);

switch ($method) {
    case 'GET':
        // Get all team members
        $activeOnly = $_GET['active_only'] ?? true;
        
        $sql = "
            SELECT 
                tm.*,
                a.first_name,
                a.last_name,
                a.years_of_experience,
                a.primary_expertise,
                a.bio,
                u.email,
                u.profile_image,
                u.phone_number
            FROM agency_team_members tm
            JOIN architects a ON tm.architect_id = a.id
            JOIN users u ON a.id = u.id
            WHERE tm.agency_id = ?
        ";
        
        $params = [$agencyId];
        if ($activeOnly) {
            $sql .= " AND tm.is_active = TRUE";
        }
        
        $sql .= " ORDER BY tm.start_date DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $members = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $members]);
        break;
        
    case 'PUT':
        // Update team member (role, salary, deactivate)
        $data = json_decode(file_get_contents('php://input'), true);
        $memberId = $data['member_id'] ?? null;
        
        if (!$memberId) {
            http_response_code(400);
            echo json_encode(['error' => 'Member ID required']);
            exit;
        }
        
        // Verify member belongs to this agency
        $stmt = $pdo->prepare("SELECT * FROM agency_team_members WHERE id = ? AND agency_id = ?");
        $stmt->execute([$memberId, $agencyId]);
        $member = $stmt->fetch();
        
        if (!$member) {
            http_response_code(404);
            echo json_encode(['error' => 'Team member not found']);
            exit;
        }
        
        $updates = [];
        $values = [];
        
        if (isset($data['role'])) {
            $updates[] = "role = ?";
            $values[] = $data['role'];
        }
        
        if (isset($data['salary'])) {
            $updates[] = "salary = ?";
            $values[] = $data['salary'];
        }
        
        if (isset($data['is_active'])) {
            $updates[] = "is_active = ?";
            $values[] = $data['is_active'];
            if ($data['is_active']) {
                $updates[] = "end_date = NULL";
            } else {
                $updates[] = "end_date = CURDATE()";
            }
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            UPDATE agency_team_members 
            SET " . implode(', ', $updates) . ", updated_at = NOW()
            WHERE id = ?
        ");
        $values[] = $memberId;
        $stmt->execute($values);
        
        echo json_encode(['success' => true, 'message' => 'Team member updated successfully']);
        break;
        
    case 'DELETE':
        // Remove team member
        $memberId = $_GET['member_id'] ?? null;
        
        if (!$memberId) {
            http_response_code(400);
            echo json_encode(['error' => 'Member ID required']);
            exit;
        }
        
        // Verify and deactivate
        $stmt = $pdo->prepare("
            UPDATE agency_team_members 
            SET is_active = FALSE, end_date = CURDATE(), updated_at = NOW()
            WHERE id = ? AND agency_id = ?
        ");
        $stmt->execute([$memberId, $agencyId]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Team member not found']);
            exit;
        }
        
        echo json_encode(['success' => true, 'message' => 'Team member removed successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
