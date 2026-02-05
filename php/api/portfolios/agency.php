<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get agency ID from query parameter (support both 'id' and 'agency_id' for compatibility)
    $agencyId = isset($_GET['agency_id']) ? (int)$_GET['agency_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
    
    if ($agencyId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid agency ID'
        ]);
        exit;
    }
    
    // Fetch agency profile with user data
    $profileQuery = "SELECT 
                        a.id,
                        a.name as agency_name,
                        a.city,
                        a.address,
                        a.bio,
                        a.cover_image,
                        u.email,
                        u.phone_number,
                        u.profile_image
                    FROM agencies a
                    INNER JOIN users u ON a.id = u.id
                    WHERE a.id = :id
                    LIMIT 1";
    
    $stmt = $db->prepare($profileQuery);
    $stmt->execute([':id' => $agencyId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$profile) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Agency not found'
        ]);
        exit;
    }
    
    // Format image URLs
    if (!empty($profile['profile_image'])) {
        $profile['profile_image_url'] = buildFileUrl($profile['profile_image']);
    }
    if (!empty($profile['cover_image'])) {
        $profile['cover_image_url'] = buildFileUrl($profile['cover_image']);
    }
    
    // Fetch team members (architects working for this agency)
    $membersQuery = "SELECT 
                        tm.id,
                        tm.architect_id,
                        tm.role,
                        a.first_name,
                        a.last_name,
                        u.profile_image,
                        a.years_of_experience,
                        (SELECT COUNT(*) 
                         FROM architect_portfolio_items 
                         WHERE architect_id = tm.architect_id) as project_count
                     FROM agency_team_members tm
                     INNER JOIN architects a ON tm.architect_id = a.id
                     INNER JOIN users u ON a.id = u.id
                     WHERE tm.agency_id = :id
                     AND tm.is_active = 1
                     ORDER BY tm.start_date DESC";
    
    $stmt = $db->prepare($membersQuery);
    $stmt->execute([':id' => $agencyId]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format member profile images
    foreach ($members as &$member) {
        if (!empty($member['profile_image'])) {
            $member['profile_image_url'] = buildFileUrl($member['profile_image']);
        }
    }
    
    // Fetch portfolio projects
    $projectsQuery = "SELECT 
                         p.id as portfolio_item_id,
                         p.project_id,
                         p.project_name,
                         p.description,
                         p.project_type,
                         p.completion_date,
                         p.is_featured,
                         COALESCE(pr.client_id, NULL) as client_id,
                         COALESCE(CONCAT(c.first_name, ' ', c.last_name), NULL) as client_name,
                         COALESCE(pr.assigned_architect_id, NULL) as assigned_architect_id,
                         COALESCE(CONCAT(ar.first_name, ' ', ar.last_name), NULL) as architect_name,
                         (SELECT photo_path 
                          FROM agency_portfolio_photos 
                          WHERE portfolio_item_id = p.id 
                          AND is_primary = 1 
                          LIMIT 1) as project_photo
                      FROM agency_portfolio_items p
                      LEFT JOIN projects pr ON p.project_id = pr.id
                      LEFT JOIN clients c ON pr.client_id = c.id
                      LEFT JOIN architects ar ON pr.assigned_architect_id = ar.id
                      WHERE p.agency_id = :id
                      ORDER BY p.is_featured DESC, p.created_at DESC";
    
    $stmt = $db->prepare($projectsQuery);
    $stmt->execute([':id' => $agencyId]);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format project photos
    foreach ($projects as &$project) {
        if (!empty($project['project_photo'])) {
            $project['project_photo_url'] = buildFileUrl($project['project_photo']);
        }
        if ($project['completion_date']) {
            $project['completion_date_formatted'] = formatDate($project['completion_date'], 'd/m/Y');
        }
    }
    
    // Fetch reviews (only visible reviews)
    $reviewsQuery = "SELECT 
                        r.id,
                        r.rating,
                        r.review_text,
                        r.created_at,
                        CONCAT(c.first_name, ' ', c.last_name) as client_name,
                        u.profile_image
                     FROM reviews r
                     INNER JOIN clients c ON r.client_id = c.id
                     INNER JOIN users u ON c.id = u.id
                     WHERE r.agency_id = :id
                     AND r.is_visible = 1
                     ORDER BY r.created_at DESC
                     LIMIT 10";
    
    $stmt = $db->prepare($reviewsQuery);
    $stmt->execute([':id' => $agencyId]);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format review data
    foreach ($reviews as &$review) {
        if (!empty($review['profile_image'])) {
            $review['profile_image_url'] = buildFileUrl($review['profile_image']);
        }
        if ($review['created_at']) {
            $review['created_at_formatted'] = formatDate($review['created_at'], 'F j, Y');
        }
    }
    
    // Check if current user is the portfolio owner
    $isOwner = false;
    $userType = null;
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_type'])) {
        $isOwner = ($_SESSION['user_id'] == $agencyId && $_SESSION['user_type'] === 'agency');
        $userType = $_SESSION['user_type'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'profile' => $profile,
            'members' => $members,
            'projects' => $projects,
            'reviews' => $reviews,
            'is_owner' => $isOwner,
            'user_type' => $userType
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error in agency portfolio: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching agency portfolio'
    ]);
}
