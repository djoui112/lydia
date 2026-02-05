<?php

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    json_error('Email and password are required', 422);
}

$userModel = new User($pdo);
$user = $userModel->findByEmail($email);

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Invalid credentials', 401);
}

if ((int)$user['is_active'] === 0) {
    json_error('Account is inactive', 403);
}

$userModel->updateLastLogin((int)$user['id']);

// Persist authenticated session before returning the response
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_type'] = $user['user_type'];
// add it to make sure architect specific data is easily accessible
if ($user['user_type'] === 'architect') {
    $_SESSION['architect_id'] = (int)$user['id'];
}


session_write_close();

json_success([
    'user_id' => (int)$user['id'],
    'user_type' => $user['user_type'],
    'email' => $user['email'],
]);


