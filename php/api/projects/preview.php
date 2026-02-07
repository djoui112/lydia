<?php
declare(strict_types=1);

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start output buffering
ob_start();

try {
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../config/session.php';
    require_once __DIR__ . '/../../middleware/cors.php';
    require_once __DIR__ . '/../utils/helpers.php';
    
    // Clear any output from includes
    if (ob_get_level() > 0) {
        ob_clean();
    }
    
    header('Content-Type: application/json');
    
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
    
    // Get database connection
    try {
        $db = getDB();
        if (!$db) {
            throw new Exception('Database connection failed');
        }
    } catch (Exception $dbError) {
        throw new Exception('Failed to connect to database: ' . $dbError->getMessage());
    }
    
    // Fetch project details - use LEFT JOIN for client to handle cases where client might be deleted
    $projectQuery = "SELECT 
                        p.id,
                        p.request_id,
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
                        COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Unknown Client') as client_name,
                        COALESCE(ag.name, NULL) as agency_name,
                        COALESCE(CONCAT(ar.first_name, ' ', ar.last_name), NULL) as architect_name,
                        COALESCE(pr.project_type, NULL) as project_type,
                        COALESCE(pr.project_location, NULL) as project_location,
                        COALESCE(pr.service_type, NULL) as service_type
                     FROM projects p
                     LEFT JOIN clients c ON p.client_id = c.id
                     LEFT JOIN agencies ag ON p.agency_id = ag.id
                     LEFT JOIN architects ar ON p.assigned_architect_id = ar.id
                     LEFT JOIN project_requests pr ON p.request_id = pr.id
                     WHERE p.id = :id
                     LIMIT 1";
    
    $stmt = $db->prepare($projectQuery);
    if (!$stmt) {
        throw new Exception('Failed to prepare project query: ' . implode(', ', $db->errorInfo()));
    }
    
    $stmt->execute([':id' => $projectId]);
    if ($stmt->errorCode() !== '00000') {
        $errorInfo = $stmt->errorInfo();
        throw new Exception('Database query error: ' . $errorInfo[2]);
    }
    
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
    if (!$stmt) {
        throw new Exception('Failed to prepare photos query: ' . implode(', ', $db->errorInfo()));
    }
    
    $stmt->execute([':id' => $projectId]);
    if ($stmt->errorCode() !== '00000') {
        $errorInfo = $stmt->errorInfo();
        throw new Exception('Photos query error: ' . $errorInfo[2]);
    }
    
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
    if (!$stmt) {
        // Milestones table might not exist, continue without error
        $milestones = [];
    } else {
        $stmt->execute([':id' => $projectId]);
        if ($stmt->errorCode() !== '00000') {
            // Log error but continue without milestones
            error_log('Milestones query error: ' . implode(', ', $stmt->errorInfo()));
            $milestones = [];
        } else {
            $milestones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
    
    // Format milestone dates
    foreach ($milestones as &$milestone) {
        if ($milestone['due_date']) {
            $milestone['due_date_formatted'] = formatDate($milestone['due_date'], 'M j, Y');
        }
    }
    
    // Fetch client review for this project (if exists)
    // Wrap in try-catch in case reviews table doesn't exist
    $review = null;
    try {
        // Check if reviews table exists first
        $tableCheckQuery = "SHOW TABLES LIKE 'reviews'";
        $tableCheck = $db->query($tableCheckQuery);
        if ($tableCheck && $tableCheck->rowCount() > 0) {
            $reviewQuery = "SELECT 
                               r.id,
                               r.rating,
                               r.review_text,
                               r.created_at,
                               r.client_id,
                               COALESCE(CONCAT(c.first_name, ' ', c.last_name), 'Client') as client_name,
                               u.profile_image
                            FROM reviews r
                            LEFT JOIN clients c ON r.client_id = c.id
                            LEFT JOIN users u ON c.id = u.id
                            WHERE r.project_id = :id
                            AND r.is_visible = 1
                            ORDER BY r.created_at DESC
                            LIMIT 1";
            
            $stmt = $db->prepare($reviewQuery);
            if ($stmt) {
                $stmt->execute([':id' => $projectId]);
                if ($stmt->errorCode() === '00000') {
                    $review = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($review) {
                        if (!empty($review['profile_image'])) {
                            $review['profile_image_url'] = buildFileUrl($review['profile_image']);
                        }
                        if ($review['created_at']) {
                            $review['created_at_formatted'] = formatDate($review['created_at'], 'F j, Y');
                        }
                    }
                }
            }
        }
    } catch (Exception $reviewError) {
        // Reviews table doesn't exist or has issues - continue without review
        error_log('Review query skipped: ' . $reviewError->getMessage());
        $review = null;
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
    
} catch (Throwable $e) {
    // Clean any output
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    
    $errorMessage = $e->getMessage();
    $errorTrace = $e->getTraceAsString();
    $errorFile = $e->getFile();
    $errorLine = $e->getLine();
    
    // Log detailed error
    error_log("Error in project preview: " . $errorMessage);
    error_log("Stack trace: " . $errorTrace);
    error_log("File: " . $errorFile . " Line: " . $errorLine);
    error_log("Project ID: " . (isset($projectId) ? $projectId : 'not set'));
    error_log("Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'unknown'));
    
    http_response_code(500);
    header('Content-Type: application/json');
    
    // Return detailed error in development
    $isDevelopment = ($_SERVER['HTTP_HOST'] ?? '') === 'localhost' || 
                     strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false ||
                     strpos($_SERVER['HTTP_HOST'] ?? '', '127.0.0.1') !== false;
    
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching project details',
        'error' => $isDevelopment ? $errorMessage : 'Internal server error',
        'file' => $isDevelopment ? basename($errorFile) : null,
        'line' => $isDevelopment ? $errorLine : null,
        'project_id' => $isDevelopment ? (isset($projectId) ? $projectId : null) : null
    ]);
    exit;
}
