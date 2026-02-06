<?php
// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// Start output buffering at the very beginning
if (ob_get_level() == 0) {
    ob_start();
}

try {
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../middleware/cors.php';
    require_once __DIR__ . '/../../config/session.php';
    require_once __DIR__ . '/../../models/User.php';
    require_once __DIR__ . '/../utils/response.php';
} catch (Exception $e) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    exit;
}

// Clear any output that might have been generated
$output = ob_get_clean();
if (!empty($output) && trim($output) !== '') {
    error_log("Unexpected output before JSON: " . substr($output, 0, 200));
}
ob_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    json_error('Email and password are required', 422);
}

try {
    $userModel = new User($pdo);
    $user = $userModel->findByEmail($email);
} catch (Exception $e) {
    error_log("Database error in login: " . $e->getMessage());
    ob_end_clean();
    json_error('Database connection error', 500);
}

if (!$user || !password_verify($password, $user['password_hash'])) {
    ob_end_clean();
    json_error('Invalid credentials', 401);
}

if ((int)$user['is_active'] === 0) {
    ob_end_clean();
    json_error('Account is inactive', 403);
}

try {
    $userModel->updateLastLogin((int)$user['id']);
} catch (Exception $e) {
    error_log("Error updating last login: " . $e->getMessage());
    // Don't fail login if this fails, just log it
}

// Persist authenticated session before returning the response
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_type'] = $user['user_type'];
// add it to make sure architect specific data is easily accessible
if ($user['user_type'] === 'architect') {
    $_SESSION['architect_id'] = (int)$user['id'];
}

// Regenerate session ID for security (prevents session fixation)
session_regenerate_id(true);

// Log session info for debugging
error_log("Login successful - User ID: " . (int)$user['id'] . ", Type: " . $user['user_type']);
error_log("Session ID after login: " . session_id());
error_log("Session data after login: " . print_r($_SESSION, true));

// Don't call session_write_close() - let PHP handle it automatically
// This ensures the session cookie is properly set

ob_end_clean(); // Clear buffer before outputting JSON
json_success([
    'user_id' => (int)$user['id'],
    'user_type' => $user['user_type'],
    'email' => $user['email'],
]);
exit;


