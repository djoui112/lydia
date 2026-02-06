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

try {
    // Get dashboard statistics
    $stats = [];

    // Total clients
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT client_id) as count
        FROM project_requests
        WHERE agency_id = ?
    ");
    $stmt->execute([$agencyId]);
    $result = $stmt->fetch();
    $stats['total_clients'] = (int)($result['count'] ?? 0);

    // Total architects (team members)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM agency_team_members
        WHERE agency_id = ? AND is_active = 1
    ");
    $stmt->execute([$agencyId]);
    $result = $stmt->fetch();
    $stats['total_architects'] = (int)($result['count'] ?? 0);

    // Total projects
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM projects
        WHERE agency_id = ?
    ");
    $stmt->execute([$agencyId]);
    $result = $stmt->fetch();
    $stats['total_projects'] = (int)($result['count'] ?? 0);

    // Pending requests
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM project_requests
        WHERE agency_id = ? AND status = 'pending'
    ");
    $stmt->execute([$agencyId]);
    $result = $stmt->fetch();
    $stats['pending_requests'] = (int)($result['count'] ?? 0);

    // Upcoming deadlines (next 7 days)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count
        FROM project_milestones pm
        JOIN projects p ON pm.project_id = p.id
        WHERE p.agency_id = ? 
        AND pm.is_completed = 0
        AND pm.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ");
    $stmt->execute([$agencyId]);
    $result = $stmt->fetch();
    $stats['upcoming_deadlines'] = (int)($result['count'] ?? 0);

    echo json_encode(['success' => true, 'data' => $stats]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load dashboard statistics']);
}
?>
