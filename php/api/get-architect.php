<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Architect.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $architect = new Architect($db);

    $architectId = $_GET['architect_id'] ?? null;

    if (!$architectId) {
        http_response_code(400);
        echo json_encode(['error' => 'Architect ID is required']);
        exit();
    }

    $architectData = $architect->findByUserId($architectId);

    if (!$architectData) {
        http_response_code(404);
        echo json_encode(['error' => 'Architect not found']);
        exit();
    }

    http_response_code(200);
    echo json_encode($architectData);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
