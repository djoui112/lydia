<?php
// Fix passwords for test accounts
require_once __DIR__ . '/php/config/database.php';

try {
    $db = getDB();
    
    $password = 'test123456';
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    
    echo "<h2>Fixing Passwords for Test Accounts</h2>\n";
    echo "<p>Setting password to: <strong>$password</strong></p>\n";
    echo "<p>Hash: <code>$passwordHash</code></p>\n";
    echo "<hr>\n";
    
    // Update existing accounts from SQL file
    $accounts = [
        ['email' => 'agency1@test.com', 'type' => 'agency'],
        ['email' => 'client1@test.com', 'type' => 'client'],
        ['email' => 'arch1@test.com', 'type' => 'architect'],
    ];
    
    // Also update our new test accounts
    $newAccounts = [
        ['email' => 'agency@test.com', 'type' => 'agency'],
        ['email' => 'client@test.com', 'type' => 'client'],
        ['email' => 'architect@test.com', 'type' => 'architect'],
    ];
    
    $allAccounts = array_merge($accounts, $newAccounts);
    
    foreach ($allAccounts as $acc) {
        try {
            $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            $result = $stmt->execute([$passwordHash, $acc['email']]);
            
            if ($stmt->rowCount() > 0) {
                echo "<p style='color: green;'>✅ Updated password for: <strong>{$acc['email']}</strong></p>\n";
            } else {
                echo "<p style='color: orange;'>⚠️ Account not found: {$acc['email']}</p>\n";
            }
        } catch (Exception $e) {
            echo "<p style='color: red;'>❌ Error updating {$acc['email']}: " . $e->getMessage() . "</p>\n";
        }
    }
    
    echo "<hr>\n";
    echo "<h3>✅ Password Update Complete!</h3>\n";
    echo "<p><strong>You can now log in with any of these accounts:</strong></p>\n";
    echo "<ul>\n";
    echo "<li><strong>agency1@test.com</strong> / test123456</li>\n";
    echo "<li><strong>client1@test.com</strong> / test123456</li>\n";
    echo "<li><strong>arch1@test.com</strong> / test123456</li>\n";
    echo "<li><strong>agency@test.com</strong> / test123456</li>\n";
    echo "<li><strong>client@test.com</strong> / test123456</li>\n";
    echo "<li><strong>architect@test.com</strong> / test123456</li>\n";
    echo "</ul>\n";
    echo "<p><a href='pages/login/login.html'>Go to Login Page</a></p>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>\n";
}
?>
