<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../utils/helpers.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get project ID from query parameter
    $projectId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($projectId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid project ID'
        ]);
        exit;
    }
    
    // Fetch project details
    $projectQuery = "SELECT 
                        p.id,
                        p.project_name,
                        p.description,
                        p.status,
                        p.progress_percentage,
                        p.start_date,
                        p.deadline,
                        p.completed_date,
                        p.budget,
                        p.client_id,
                        p.agency_id,
                        p.assigned_architect_id,
                        CONCAT(c.first_name, ' ', c.last_name) as client_name,
                        ag.name as agency_name,
                        CONCAT(ar.first_name, ' ', ar.last_name) as architect_name,
                        pr.project_type,
                        pr.project_location,
                        pr.service_type
                     FROM projects p
                     INNER JOIN clients c ON p.client_id = c.id
                     LEFT JOIN agencies ag ON p.agency_id = ag.id
                     LEFT JOIN architects ar ON p.assigned_architect_id = ar.id
                     LEFT JOIN project_requests pr ON p.request_id = pr.id
                     WHERE p.id = :id
                     LIMIT 1";
    
    $stmt = $db->prepare($projectQuery);
    $stmt->execute([':id' => $projectId]);
    $project = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$project) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Project not found'
        ]);
        exit;
    }
    
    // Fetch project photos
    $photosQuery = "SELECT 
                       id,
                       photo_path,
                       is_primary,
                       display_order
                    FROM project_photos
                    WHERE project_id = :id
                    ORDER BY is_primary DESC, display_order ASC";
    
    $stmt = $db->prepare($photosQuery);
    $stmt->execute([':id' => $projectId]);
    $photos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format photo URLs
    foreach ($photos as &$photo) {
        if (!empty($photo['photo_path'])) {
            $photo['photo_url'] = buildFileUrl($photo['photo_path']);
        }
    }
    
    // Fetch project milestones
    $milestonesQuery = "SELECT 
                           id,
                           title,
                           description,
                           due_date,
                           due_time,
                           is_completed,
                           completed_at
                        FROM project_milestones
                        WHERE project_id = :id
                        ORDER BY due_date ASC, due_time ASC";
    
    $stmt = $db->prepare($milestonesQuery);
    $stmt->execute([':id' => $projectId]);
    $milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format milestone dates
    foreach ($milestones as &$milestone) {
        if ($milestone['due_date']) {
            $milestone['due_date_formatted'] = formatDate($milestone['due_date'], 'M j, Y');
        }
    }
    
    // Fetch client review for this project (if exists)
    $reviewQuery = "SELECT 
                       r.id,
                       r.rating,
                       r.review_text,
                       r.created_at,
                       CONCAT(c.first_name, ' ', c.last_name) as client_name,
                       u.profile_image
                    FROM reviews r
                    INNER JOIN clients c ON r.client_id = c.id
                    INNER JOIN users u ON c.id = u.id
                    WHERE r.project_id = :id
                    AND r.is_visible = 1
                    ORDER BY r.created_at DESC
                    LIMIT 1";
    
    $stmt = $db->prepare($reviewQuery);
    $stmt->execute([':id' => $projectId]);
    $review = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($review) {
        if (!empty($review['profile_image'])) {
            $review['profile_image_url'] = buildFileUrl($review['profile_image']);
        }
        if ($review['created_at']) {
            $review['created_at_formatted'] = formatDate($review['created_at'], 'F j, Y');
        }
    }
    
    // Check authorization: who can see "Add to Portfolio" button
    $canAddToPortfolio = false;
    $isClient = false;
    $currentUserId = null;
    
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_type'])) {
        $currentUserId = (int)$_SESSION['user_id'];
        $userType = $_SESSION['user_type'];
        
        // Client can see review form if they own the project
        $isClient = ($userType === 'client' && $currentUserId == $project['client_id']);
        
        // Architect or Agency owner can add to portfolio
        // Check if architect is assigned to this project
        if ($userType === 'architect' && $currentUserId == $project['assigned_architect_id']) {
            $canAddToPortfolio = true;
        }
        // Check if agency owns this project
        if ($userType === 'agency' && $currentUserId == $project['agency_id']) {
            $canAddToPortfolio = true;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'project' => $project,
            'photos' => $photos,
            'milestones' => $milestones,
            'review' => $review,
            'can_add_to_portfolio' => $canAddToPortfolio,
            'is_client' => $isClient
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error in project preview: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching project details'
    ]);
}
