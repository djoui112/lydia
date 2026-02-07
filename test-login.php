<?php
// Test login functionality
require_once __DIR__ . '/php/config/database.php';

try {
    $db = getDB();
    
    $email = 'agency@test.com';
    $password = 'test123456';
    
    echo "<h2>Testing Login for: $email</h2>\n";
    
    // Find user
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ User not found in database!</p>\n";
        exit;
    }
    
    echo "<p>✅ User found:</p>\n";
    echo "<ul>\n";
    echo "<li>ID: {$user['id']}</li>\n";
    echo "<li>Email: {$user['email']}</li>\n";
    echo "<li>User Type: {$user['user_type']}</li>\n";
    echo "<li>Is Active: {$user['is_active']}</li>\n";
    echo "<li>Password Hash: <code>" . substr($user['password_hash'], 0, 30) . "...</code></li>\n";
    echo "</ul>\n";
    
    // Test password verification
    echo "<hr>\n";
    echo "<h3>Password Verification Test</h3>\n";
    echo "<p>Testing password: <strong>$password</strong></p>\n";
    
    $verifyResult = password_verify($password, $user['password_hash']);
    
    if ($verifyResult) {
        echo "<p style='color: green; font-size: 20px;'>✅ Password verification SUCCESSFUL!</p>\n";
    } else {
        echo "<p style='color: red; font-size: 20px;'>❌ Password verification FAILED!</p>\n";
        echo "<p>This means the password hash in the database doesn't match the password.</p>\n";
        
        // Try to create a new hash
        echo "<hr>\n";
        echo "<h3>Creating New Password Hash</h3>\n";
        $newHash = password_hash($password, PASSWORD_BCRYPT);
        echo "<p>New hash: <code>$newHash</code></p>\n";
        
        // Test the new hash
        $newVerify = password_verify($password, $newHash);
        echo "<p>New hash verification: " . ($newVerify ? "✅ SUCCESS" : "❌ FAILED") . "</p>\n";
        
        // Update the user
        echo "<hr>\n";
        echo "<h3>Updating User Password</h3>\n";
        $updateStmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $user['id']]);
        echo "<p style='color: green;'>✅ Password updated in database!</p>\n";
        echo "<p>Try logging in again now.</p>\n";
    }
    
    // Check all test accounts
    echo "<hr>\n";
    echo "<h3>All Test Accounts</h3>\n";
    $stmt = $db->query("SELECT id, email, user_type, is_active FROM users WHERE email IN ('agency@test.com', 'client@test.com', 'architect@test.com')");
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>\n";
    echo "<tr><th>Email</th><th>Type</th><th>Active</th><th>Password Test</th></tr>\n";
    
    foreach ($accounts as $acc) {
        $testPassword = 'test123456';
        $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$acc['id']]);
        $hash = $stmt->fetchColumn();
        $testResult = password_verify($testPassword, $hash);
        
        echo "<tr>";
        echo "<td>{$acc['email']}</td>";
        echo "<td>{$acc['user_type']}</td>";
        echo "<td>" . ($acc['is_active'] ? '✅' : '❌') . "</td>";
        echo "<td>" . ($testResult ? '✅ Works' : '❌ Failed') . "</td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>\n";
    echo "<pre>" . $e->getTraceAsString() . "</pre>\n";
}
?>
