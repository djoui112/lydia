<?php
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../config/session.php';
    
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'agency') {
        echo json_encode(['agency_id' => (int)$_SESSION['user_id']]);
    } else {
        echo json_encode(['agency_id' => null]);
    }
} catch (Exception $e) {
    http_response_code(200); // Return 200 with null to avoid breaking frontend
    echo json_encode(['agency_id' => null]);
}
