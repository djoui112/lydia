<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email = trim($input['email'] ?? '');

if ($email === '') {
    json_error('Email is required', 422, ['email' => 'Email is required']);
}

$userModel = new User($pdo);
$user = $userModel->findByEmail($email);

if (!$user) {
    // Do not reveal that the email does not exist
    json_success(['message' => 'If that email exists, a code has been sent.']);
}

// Ensure password_resets table exists in your DB:
// id, user_id, code, expires_at, used (BOOLEAN)

$code = random_int(100000, 999999);
$expiresAt = (new DateTime('+15 minutes'))->format('Y-m-d H:i:s');

$stmt = $pdo->prepare(
    'INSERT INTO password_resets (user_id, code, expires_at, used)
     VALUES (:user_id, :code, :expires_at, 0)'
);

$stmt->execute([
    'user_id' => $user['id'],
    'code' => (string)$code,
    'expires_at' => $expiresAt,
]);

// Send email - configure your server/mail settings as needed
$subject = 'Your Mimaria password reset code';
$message = "Your password reset code is: {$code}\n\nThis code will expire in 15 minutes.";
$headers = 'From: no-reply@mimaria.local';

@mail($email, $subject, $message, $headers);

json_success([
    'message' => 'If that email exists, a code has been sent.',
]);


