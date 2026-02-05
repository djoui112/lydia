<?php
require_once __DIR__ . '/../../config/session.php';
header('Content-Type: application/json');

if (isset($_SESSION['user_id']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'agency') {
    echo json_encode(['agency_id' => (int)$_SESSION['user_id']]);
} else {
    echo json_encode(['agency_id' => null]);
}
