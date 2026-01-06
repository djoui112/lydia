<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = trim($input['email'] ?? '');
$code = trim($input['code'] ?? '');
$newPassword = $input['new_password'] ?? '';

if ($email === '' || $code === '' || $newPassword === '') {
    json_error('Missing required fields', 422, [
        'email' => $email === '' ? 'Email is required' : null,
        'code' => $code === '' ? 'Code is required' : null,
        'new_password' => $newPassword === '' ? 'New password is required' : null,
    ]);
}

if (strlen($newPassword) < 8) {
    json_error('Password too short', 422, [
        'new_password' => 'Password must be at least 8 characters',
    ]);
}

$userModel = new User($pdo);
$user = $userModel->findByEmail($email);

if (!$user) {
    json_error('Invalid code or email', 400);
}

$stmt = $pdo->prepare(
    'SELECT * FROM password_resets
     WHERE user_id = :user_id AND code = :code AND used = 0
       AND expires_at >= NOW()
     ORDER BY id DESC
     LIMIT 1'
);

$stmt->execute([
    'user_id' => $user['id'],
    'code' => $code,
]);

$reset = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$reset) {
    json_error('Invalid or expired code', 400);
}

$pdo->beginTransaction();

try {
    // Mark reset as used
    $updateReset = $pdo->prepare('UPDATE password_resets SET used = 1 WHERE id = :id');
    $updateReset->execute(['id' => $reset['id']]);

    // Update password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $userModel->changePassword((int)$user['id'], $passwordHash);

    $pdo->commit();

    json_success(['message' => 'Password has been reset successfully.']);
} catch (Throwable $e) {
    $pdo->rollBack();
    json_error('Failed to reset password', 500);
}


