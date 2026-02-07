<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Get architect ID from query parameter
   $architectId = isset($_GET['architect_id']) ? (int)$_GET['architect_id'] : 0;

    
    if ($architectId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid architect ID'
        ]);
        exit;
    }
    
    // Fetch architect profile with user data
    $profileQuery = "SELECT 
                        a.id,
                        a.first_name,
                        a.last_name,
                        a.city,
                        a.address,
                        a.bio,
                        a.years_of_experience,
                        a.primary_expertise,
                        a.statement,
                        u.email,
                        u.phone_number,
                        u.profile_image
                    FROM architects a
                    INNER JOIN users u ON a.id = u.id
                    WHERE a.id = :id
                    LIMIT 1";
    
    $stmt = $db->prepare($profileQuery);
    $stmt->execute([':id' => $architectId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$profile) {
        // Log for debugging
        error_log("Architect not found - ID: " . $architectId);
        
        // Check if architect exists but doesn't have user record
        $checkArchitectQuery = "SELECT id FROM architects WHERE id = :id LIMIT 1";
        $checkStmt = $db->prepare($checkArchitectQuery);
        $checkStmt->execute([':id' => $architectId]);
        $architectExists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($architectExists) {
            error_log("Architect exists but missing user record - ID: " . $architectId);
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Architect profile is incomplete. Please contact support.'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Architect not found'
            ]);
        }
        exit;
    }
    
    // Format profile image URL
    if (!empty($profile['profile_image'])) {
        $profile['profile_image_url'] = buildFileUrl($profile['profile_image']);
    }
    
    // Fetch education records
    $educationQuery = "SELECT 
                          id,
                          university_name,
                          degree,
                          field_of_study,
                          start_date,
                          end_date,
                          is_current
                      FROM architect_education
                      WHERE architect_id = :id
                      ORDER BY display_order ASC, end_date DESC, start_date DESC";
    
    $stmt = $db->prepare($educationQuery);
    $stmt->execute([':id' => $architectId]);
    $education = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch experience records (NO description field per schema)
    $experienceQuery = "SELECT 
                           e.id,
                           e.role,
                           e.agency_id,
                           COALESCE(ag.name, e.agency_name) as agency_name,
                           e.start_date,
                           e.end_date,
                           e.is_current
                       FROM architect_experience e
                       LEFT JOIN agencies ag ON e.agency_id = ag.id
                       WHERE e.architect_id = :id
                       ORDER BY e.display_order ASC, e.is_current DESC, e.end_date DESC, e.start_date DESC";
    
    $stmt = $db->prepare($experienceQuery);
    $stmt->execute([':id' => $architectId]);
    $experience = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates for experience
    foreach ($experience as &$exp) {
        if ($exp['start_date']) {
            $exp['start_date_formatted'] = formatDate($exp['start_date'], 'F Y');
        }
        if ($exp['end_date']) {
            $exp['end_date_formatted'] = formatDate($exp['end_date'], 'F Y');
        } elseif ($exp['is_current']) {
            $exp['end_date_formatted'] = 'Present';
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
                         COALESCE(pr.agency_id, NULL) as agency_id,
                         COALESCE(ag.name, NULL) as agency_name,
                         COALESCE(pr.assigned_architect_id, NULL) as assigned_architect_id,
                         COALESCE(CONCAT(ar.first_name, ' ', ar.last_name), NULL) as architect_name,
                         (SELECT photo_path 
                          FROM architect_portfolio_photos 
                          WHERE portfolio_item_id = p.id 
                          AND is_primary = 1 
                          LIMIT 1) as project_photo
                      FROM architect_portfolio_items p
                      LEFT JOIN projects pr ON p.project_id = pr.id
                      LEFT JOIN agencies ag ON pr.agency_id = ag.id
                      LEFT JOIN architects ar ON pr.assigned_architect_id = ar.id
                      WHERE p.architect_id = :id
                      ORDER BY p.is_featured DESC, p.created_at DESC";
    
    $stmt = $db->prepare($projectsQuery);
    $stmt->execute([':id' => $architectId]);
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
    
    // Check if current user is the portfolio owner (for authorization)
    $isOwner = false;
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_type'])) {
        $isOwner = ($_SESSION['user_id'] == $architectId && $_SESSION['user_type'] === 'architect');
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'profile' => $profile,
            'education' => $education,
            'experience' => $experience,
            'projects' => $projects,
            'is_owner' => $isOwner
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error in architect portfolio: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching architect portfolio'
    ]);
}
