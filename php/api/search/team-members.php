<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';


header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get agency ID from query parameter or session
    $agencyId = isset($_GET['agency_id']) ? (int)$_GET['agency_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
    
    // If no agency_id in query, try to get from session
    if ($agencyId <= 0) {
        if (isset($_SESSION['user_id']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'agency') {
            $agencyId = (int)$_SESSION['user_id'];
        }
    }
    
    if ($agencyId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid agency ID'
        ]);
        exit;
    }
    
    // Fetch team members (architects working for this agency) - return ALL active members
    $membersQuery = "SELECT 
                        tm.id,
                        tm.architect_id,
                        tm.role,
                        a.first_name,
                        a.last_name,
                        u.profile_image,
                        a.years_of_experience,
                        a.primary_expertise,
                        (SELECT COUNT(*) 
                         FROM architect_portfolio_items 
                         WHERE architect_id = tm.architect_id) as project_count
                     FROM agency_team_members tm
                     INNER JOIN architects a ON tm.architect_id = a.id
                     INNER JOIN users u ON a.id = u.id
                     WHERE tm.agency_id = :agency_id
                     AND tm.is_active = 1
                     ORDER BY tm.start_date DESC";
    
    $stmt = $db->prepare($membersQuery);
    $stmt->execute([':agency_id' => $agencyId]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format profile images
    foreach ($members as &$member) {
        if (!empty($member['profile_image'])) {
            $member['profile_image_url'] = buildFileUrl($member['profile_image']);
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $members
    ]);
    
} catch (Exception $e) {
    error_log("Error in team members: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => [],
        'message' => 'An error occurred while fetching team members'
    ]);
}
