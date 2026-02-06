<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../utils/helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'client') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Only clients can update reviews.'
    ]);
    exit;
}

try {
    $db = getDB();
    $clientId = (int)$_SESSION['user_id'];

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $reviewId = isset($input['review_id']) ? (int)$input['review_id'] : 0;
    $rating = isset($input['rating']) ? (int)$input['rating'] : 0;
    $reviewText = isset($input['review_text']) ? trim($input['review_text']) : '';

    if ($reviewId <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid review ID'
        ]);
        exit;
    }

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

    $checkQuery = "SELECT id FROM reviews WHERE id = :id AND client_id = :client_id LIMIT 1";
    $stmt = $db->prepare($checkQuery);
    $stmt->execute([
        ':id' => $reviewId,
        ':client_id' => $clientId
    ]);

    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Review not found or not owned by you'
        ]);
        exit;
    }

    $updateQuery = "UPDATE reviews
                    SET rating = :rating,
                        review_text = :review_text,
                        updated_at = NOW()
                    WHERE id = :id";

    $stmt = $db->prepare($updateQuery);
    $stmt->execute([
        ':rating' => $rating,
        ':review_text' => sanitize($reviewText),
        ':id' => $reviewId
    ]);

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
        'message' => 'Review updated successfully'
    ]);

} catch (Exception $e) {
    error_log("Error updating review: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating the review'
    ]);
}
