<?php
// Simple password reset - sets all test accounts to "test123456"
require_once __DIR__ . '/php/config/database.php';

$db = getDB();
$password = 'test123456';
$hash = password_hash($password, PASSWORD_BCRYPT);

$emails = [
    'agency1@test.com', 'agency2@test.com', 'agency3@test.com',
    'client1@test.com', 'client2@test.com', 'client3@test.com',
    'arch1@test.com', 'arch2@test.com', 'arch3@test.com',
    'agency@test.com', 'client@test.com', 'architect@test.com'
];

$updated = 0;
foreach ($emails as $email) {
    $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
    $stmt->execute([$hash, $email]);
    if ($stmt->rowCount() > 0) $updated++;
}

echo json_encode([
    'success' => true,
    'message' => "Updated $updated accounts",
    'password' => $password,
    'accounts' => [
        'agency' => 'agency1@test.com',
        'client' => 'client1@test.com', 
        'architect' => 'arch1@test.com'
    ]
], JSON_PRETTY_PRINT);
