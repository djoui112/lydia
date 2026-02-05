<?php
require_once '../config.php';
require_once '../auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$agencyId = getCurrentAgencyId($pdo);

switch ($method) {
    case 'GET':
        // Get agency profile
        $stmt = $pdo->prepare("
            SELECT a.*, u.email, u.phone_number, u.profile_image, u.is_active
            FROM agencies a
            JOIN users u ON a.id = u.id
            WHERE a.id = ?
        ");
        $stmt->execute([$agencyId]);
        $profile = $stmt->fetch();
        
        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'Agency not found']);
            exit;
        }
        
        echo json_encode(['success' => true, 'data' => $profile]);
        break;
        
    case 'PUT':
        // Update agency profile
        $data = json_decode(file_get_contents('php://input'), true);
        
        $allowedFields = ['name', 'city', 'address', 'bio', 'email', 'phone_number'];
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
        
        // Update agencies table
        $stmt = $pdo->prepare("
            UPDATE agencies 
            SET " . implode(', ', $updates) . ", updated_at = NOW()
            WHERE id = ?
        ");
        $values[] = $agencyId;
        $stmt->execute($values);
        
        // Update users table if email or phone changed
        if (isset($data['email']) || isset($data['phone_number'])) {
            $userUpdates = [];
            $userValues = [];
            
            if (isset($data['email'])) {
                $userUpdates[] = "email = ?";
                $userValues[] = $data['email'];
            }
            if (isset($data['phone_number'])) {
                $userUpdates[] = "phone_number = ?";
                $userValues[] = $data['phone_number'];
            }
            
            $stmt = $pdo->prepare("
                UPDATE users 
                SET " . implode(', ', $userUpdates) . ", updated_at = NOW()
                WHERE id = ?
            ");
            $userValues[] = $agencyId;
            $stmt->execute($userValues);
        }
        
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
