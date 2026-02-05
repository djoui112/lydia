<?php
require_once '../config.php';
require_once '../auth.php';

$agencyId = getCurrentAgencyId($pdo);

// Get dashboard statistics
$stats = [];

// Total clients
$stmt = $pdo->prepare("
    SELECT COUNT(DISTINCT client_id) as count
    FROM project_requests
    WHERE agency_id = ?
");
$stmt->execute([$agencyId]);
$stats['total_clients'] = $stmt->fetch()['count'];

// Total architects (team members)
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM agency_team_members
    WHERE agency_id = ? AND is_active = TRUE
");
$stmt->execute([$agencyId]);
$stats['total_architects'] = $stmt->fetch()['count'];

// Total projects
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM projects
    WHERE agency_id = ?
");
$stmt->execute([$agencyId]);
$stats['total_projects'] = $stmt->fetch()['count'];

// Pending requests
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM project_requests
    WHERE agency_id = ? AND status = 'pending'
");
$stmt->execute([$agencyId]);
$stats['pending_requests'] = $stmt->fetch()['count'];

// Upcoming deadlines (next 7 days)
$stmt = $pdo->prepare("
    SELECT COUNT(*) as count
    FROM project_milestones pm
    JOIN projects p ON pm.project_id = p.id
    WHERE p.agency_id = ? 
    AND pm.is_completed = FALSE
    AND pm.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
");
$stmt->execute([$agencyId]);
$stats['upcoming_deadlines'] = $stmt->fetch()['count'];

echo json_encode(['success' => true, 'data' => $stats]);
?>
