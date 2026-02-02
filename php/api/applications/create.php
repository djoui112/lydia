<?php

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Architect.php';
require_once __DIR__ . '/../utils/response.php';

// Session diagnostics
error_log('Create.php - Session ID: ' . session_id());
error_log('Create.php - User ID: ' . ($_SESSION['user_id'] ?? 'NOT SET'));
error_log('Create.php - User Type: ' . ($_SESSION['user_type'] ?? 'NOT SET'));

if (!isset($_SESSION['user_id'])) {
    json_error('Unauthorized', 401);
}

$userId = (int)$_SESSION['user_id'];
$userType = $_SESSION['user_type'] ?? null;

// Only architects can apply to agencies
if ($userType !== 'architect') {
    json_error('Only architects can submit applications', 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// Handle both JSON and FormData
$input = [];
if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
    $input = $_POST;
    // Handle file uploads if needed
} else {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
}

// Validate required application fields
$agencyId = isset($input['agency_id']) ? (int)$input['agency_id'] : null;
$motivationLetter = trim($input['motivation_letter'] ?? '');

if (!$agencyId) {
    json_error('Agency ID is required', 422);
}

if (empty($motivationLetter)) {
    json_error('Motivation letter is required', 422);
}

try {
    // Verify architect exists and get their data from database
    $userModel = new User($pdo);
    $user = $userModel->findById($userId);
    
    if (!$user || $user['user_type'] !== 'architect') {
        json_error('Architect profile not found', 404);
    }
    
    $architectModel = new Architect($pdo);
    $architect = $architectModel->findByUserId($userId);
    
    if (!$architect) {
        json_error('Architect profile data not found', 404);
    }
    
    // Verify agency exists
    $stmt = $pdo->prepare('SELECT id FROM agencies WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $agencyId]);
    $agency = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agency) {
        json_error('Agency not found', 404);
    }
    
    // Insert application - use existing architect data from database
    // Only application-specific fields come from frontend
    $stmt = $pdo->prepare(
        'INSERT INTO architect_applications (
            architect_id,
            agency_id,
            project_types,
            motivation_letter,
            status,
            created_at,
            updated_at
        ) VALUES (
            :architect_id,
            :agency_id,
            :project_types,
            :motivation_letter,
            :status,
            NOW(),
            NOW()
        )'
    );
    
    $stmt->execute([
        'architect_id' => $userId, // From session
        'agency_id' => $agencyId, // From frontend
        'project_types' => $input['project_types'] ?? null,
        'motivation_letter' => $motivationLetter,
        'status' => 'pending',
    ]);
    
    $applicationId = (int)$pdo->lastInsertId();
    
    json_success([
        'application_id' => $applicationId,
        'message' => 'Application submitted successfully',
    ], 201);
    
} catch (Throwable $e) {
    error_log('Application creation error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    json_error('Failed to submit application: ' . $e->getMessage(), 500);
}
