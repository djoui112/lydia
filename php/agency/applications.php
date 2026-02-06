<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');

// Check if user is logged in as agency
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'agency') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$agencyId = (int)$_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get applications for this agency
        $status = $_GET['status'] ?? null;
        $applicationId = $_GET['id'] ?? null;
        
        $sql = "
            SELECT 
                aa.*,
                a.first_name,
                a.last_name,
                a.years_of_experience,
                a.primary_expertise,
                a.statement,
                a.city,
                a.address,
                a.date_of_birth,
                a.software_proficiency,
                a.portfolio_url,
                a.linkedin_url,
                u.email,
                u.profile_image,
                u.phone_number
            FROM architect_applications aa
            JOIN architects a ON aa.architect_id = a.id
            JOIN users u ON a.id = u.id
            WHERE aa.agency_id = ?
        ";
        
        $params = [$agencyId];
        
        // If specific application ID requested
        if ($applicationId) {
            $sql .= " AND aa.id = ?";
            $params[] = $applicationId;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $application = $stmt->fetch();
            
            if ($application) {
                echo json_encode(['success' => true, 'data' => $application]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Application not found']);
            }
            break;
        }
        
        // Otherwise get all applications (optionally filtered by status)
        if ($status) {
            $sql .= " AND aa.status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY aa.created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $applications = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $applications]);
        break;
        
    case 'PUT':
        // Accept or reject application
        $data = json_decode(file_get_contents('php://input'), true);
        $applicationId = $data['application_id'] ?? null;
        $action = $data['action'] ?? null; // 'accept' or 'reject'
        
        if (!$applicationId || !$action) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        // Verify application belongs to this agency
        $stmt = $pdo->prepare("SELECT * FROM architect_applications WHERE id = ? AND agency_id = ?");
        $stmt->execute([$applicationId, $agencyId]);
        $application = $stmt->fetch();
        
        if (!$application) {
            http_response_code(404);
            echo json_encode(['error' => 'Application not found']);
            exit;
        }
        
        $status = $action === 'accept' ? 'accepted' : 'rejected';
        
        // Update application status
        $stmt = $pdo->prepare("
            UPDATE architect_applications 
            SET status = ?, reviewed_at = NOW(), reviewed_by = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, $agencyId, $applicationId]);
        
        // If accepted, add to team members
        if ($action === 'accept') {
            // Check if already a team member
            $stmt = $pdo->prepare("
                SELECT * FROM agency_team_members 
                WHERE agency_id = ? AND architect_id = ?
            ");
            $stmt->execute([$agencyId, $application['architect_id']]);
            
            if (!$stmt->fetch()) {
                $stmt = $pdo->prepare("
                    INSERT INTO agency_team_members 
                    (agency_id, architect_id, application_id, start_date, is_active)
                    VALUES (?, ?, ?, CURDATE(), TRUE)
                ");
                $stmt->execute([
                    $agencyId,
                    $application['architect_id'],
                    $applicationId
                ]);
            }
        }
        
        echo json_encode(['success' => true, 'message' => "Application {$action}ed successfully"]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
