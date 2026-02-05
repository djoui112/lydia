<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    $limit = max(1, min(20, (int)($_GET['limit'] ?? 8)));
    
    // Get featured architects with their basic info
    $query = "SELECT a.id, a.first_name, a.last_name, a.city, a.bio, 
                     a.years_of_experience, a.primary_expertise, a.statement,
                     u.profile_image,
                     (SELECT COUNT(*) FROM architect_portfolio_items WHERE architect_id = a.id) as project_count
             FROM architects a
             LEFT JOIN users u ON a.id = u.id
             ORDER BY RAND()
             LIMIT :limit";
    
    $stmt = $db->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $architects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formattedArchitects = [];
    foreach ($architects as $architect) {
        // Build profile image URL
        $profileImage = null;
        if (!empty($architect['profile_image'])) {
            if (function_exists('buildFileUrl')) {
                $profileImage = buildFileUrl($architect['profile_image']);
            } else {
                // Fallback if buildFileUrl doesn't exist
                $profileImage = '/uploads/' . $architect['profile_image'];
            }
        }
        
        $formattedArchitects[] = [
            'architect_~id' => $architect['id'],
            'first_name' => $architect['first_name'],
            'last_name' => $architect['last_name'],
            'city' => $architect['city'],
            'bio' => $architect['bio'],
            'statement' => $architect['statement'],
            'years_of_experience' => (int)$architect['years_of_experience'],
            'primary_expertise' => $architect['primary_expertise'],
            'profile_image' => $profileImage,
            'project_count' => (int)$architect['project_count']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formattedArchitects,
        'message' => '',
        'count' => count($formattedArchitects)
    ]);
    
} catch (Exception $e) {
    error_log("Error in featured architects: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'data' => [],
        'message' => 'An error occurred while fetching featured architects',
        'error' => $e->getMessage() // For debugging - remove in production
    ]);
}
