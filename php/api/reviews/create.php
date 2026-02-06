<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../utils/helpers.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Check authentication
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'client') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Only clients can submit reviews.'
    ]);
    exit;
}

try {
    $db = getDB();
    $clientId = (int)$_SESSION['user_id'];
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST; // Fallback to POST data
    }
    
    // Validate required fields
    $rating = isset($input['rating']) ? (int)$input['rating'] : 0;
    $reviewText = isset($input['review_text']) ? trim($input['review_text']) : '';
    $projectId = isset($input['project_id']) ? (int)$input['project_id'] : null;
    $agencyId = isset($input['agency_id']) ? (int)$input['agency_id'] : null;
    $architectId = isset($input['architect_id']) ? (int)$input['architect_id'] : null;
    
    // Validation
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Rating must be between 1 and 5'
        ]);
        exit;
    }
    
    if (empty($reviewText) || strlen($reviewText) < 10) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Review text must be at least 10 characters'
        ]);
        exit;
    }
    
    // Exactly one of project_id, agency_id, or architect_id must be provided
    $targetCount = ($projectId ? 1 : 0) + ($agencyId ? 1 : 0) + ($architectId ? 1 : 0);
    if ($targetCount !== 1) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Must specify exactly one of project_id, agency_id, or architect_id'
        ]);
        exit;
    }
    
    // If project_id is provided, verify the client owns the project
    if ($projectId) {
        $verifyQuery = "SELECT client_id, agency_id, assigned_architect_id FROM projects WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($verifyQuery);
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
        
        if ($project['client_id'] != $clientId) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'You can only review your own projects'
            ]);
            exit;
        }

        if (empty($project['assigned_architect_id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Architect is not assigned yet for this project'
            ]);
            exit;
        }

        // Force agency/architect linkage from the project
        $agencyId = (int)$project['agency_id'];
        $architectId = (int)$project['assigned_architect_id'];
        
        // Check if review already exists for this project
        $checkQuery = "SELECT id FROM reviews WHERE project_id = :project_id AND client_id = :client_id LIMIT 1";
        $stmt = $db->prepare($checkQuery);
        $stmt->execute([
            ':project_id' => $projectId,
            ':client_id' => $clientId
        ]);
        
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'You have already reviewed this project'
            ]);
            exit;
        }
    } elseif ($agencyId) {
        // Agency reviews should not be tied to a project or architect
        $projectId = null;
        $architectId = null;
    }
    
    // Insert review
    $insertQuery = "INSERT INTO reviews (
                        client_id,
                        project_id,
                        agency_id,
                        architect_id,
                        rating,
                        review_text,
                        is_verified,
                        is_visible,
                        created_at,
                        updated_at
                    ) VALUES (
                        :client_id,
                        :project_id,
                        :agency_id,
                        :architect_id,
                        :rating,
                        :review_text,
                        :is_verified,
                        1,
                        NOW(),
                        NOW()
                    )";
    
    $stmt = $db->prepare($insertQuery);
    $stmt->execute([
        ':client_id' => $clientId,
        ':project_id' => $projectId ?: null,
        ':agency_id' => $agencyId ?: null,
        ':architect_id' => $architectId ?: null,
        ':rating' => $rating,
        ':review_text' => sanitize($reviewText),
        ':is_verified' => $projectId ? 1 : 0 // Verified if it's for a project
    ]);
    
    $reviewId = $db->lastInsertId();
    
    // Fetch the created review with client info
    $fetchQuery = "SELECT 
                      r.id,
                      r.rating,
                      r.review_text,
                      r.created_at,
                      CONCAT(c.first_name, ' ', c.last_name) as client_name,
                      u.profile_image
                   FROM reviews r
                   INNER JOIN clients c ON r.client_id = c.id
                   INNER JOIN users u ON c.id = u.id
                   WHERE r.id = :id
                   LIMIT 1";
    
    $stmt = $db->prepare($fetchQuery);
    $stmt->execute([':id' => $reviewId]);
    $review = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Format review data
    if ($review) {
        if (!empty($review['profile_image'])) {
            $review['profile_image_url'] = buildFileUrl($review['profile_image']);
        }
        if ($review['created_at']) {
            $review['created_at_formatted'] = formatDate($review['created_at'], 'F j, Y');
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $review,
        'message' => 'Review submitted successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Error creating review: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while submitting the review'
    ]);
}
