<?php
// Create test accounts with proper password hashing
require_once __DIR__ . '/php/config/database.php';

try {
    $db = getDB();
    
    // Generate proper password hash for "test123456"
    $password = 'test123456';
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    
    echo "<h2>Creating Test Accounts with Proper Password Hashing</h2>\n";
    echo "<p>Password for all accounts: <strong>test123456</strong></p>\n";
    echo "<p>Generated hash: <code>" . substr($passwordHash, 0, 30) . "...</code></p>\n";
    echo "<hr>\n";
    
    // 1. Agency Account
    try {
        // Delete if exists first
        $db->exec("DELETE FROM agencies WHERE id = 100");
        $db->exec("DELETE FROM users WHERE id = 100");
        
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, user_type, phone_number, is_active, created_at, updated_at) 
                              VALUES (100, 'agency@test.com', ?, 'agency', '0555000100', 1, NOW(), NOW())");
        $stmt->execute([$passwordHash]);
        
        $stmt = $db->prepare("INSERT INTO agencies (id, name, city, address, bio, is_approved) 
                              VALUES (100, 'Test Agency', 'Algiers', 'Test Address', 'Test agency account', 1)");
        $stmt->execute();
        
        echo "<p style='color: green;'>✅ Agency account created: <strong>agency@test.com</strong> / <strong>test123456</strong></p>\n";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Agency account error: " . $e->getMessage() . "</p>\n";
    }
    
    // 2. Client Account
    try {
        // Delete if exists first
        $db->exec("DELETE FROM clients WHERE id = 101");
        $db->exec("DELETE FROM users WHERE id = 101");
        
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, user_type, phone_number, is_active, created_at, updated_at) 
                              VALUES (101, 'client@test.com', ?, 'client', '0555000101', 1, NOW(), NOW())");
        $stmt->execute([$passwordHash]);
        
        $stmt = $db->prepare("INSERT INTO clients (id, first_name, last_name) 
                              VALUES (101, 'Test', 'Client')");
        $stmt->execute();
        
        echo "<p style='color: green;'>✅ Client account created: <strong>client@test.com</strong> / <strong>test123456</strong></p>\n";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Client account error: " . $e->getMessage() . "</p>\n";
    }
    
    // 3. Architect Account
    try {
        // Delete if exists first
        $db->exec("DELETE FROM architects WHERE id = 102");
        $db->exec("DELETE FROM users WHERE id = 102");
        
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, user_type, phone_number, is_active, created_at, updated_at) 
                              VALUES (102, 'architect@test.com', ?, 'architect', '0555000102', 1, NOW(), NOW())");
        $stmt->execute([$passwordHash]);
        
        $stmt = $db->prepare("INSERT INTO architects (id, first_name, last_name, city, bio, years_of_experience, statement) 
                              VALUES (102, 'Test', 'Architect', 'Algiers', 'Test architect account', 5, 'graduate architect')");
        $stmt->execute();
        
        echo "<p style='color: green;'>✅ Architect account created: <strong>architect@test.com</strong> / <strong>test123456</strong></p>\n";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Architect account error: " . $e->getMessage() . "</p>\n";
    }
    
    // Verify accounts
    echo "<hr>\n";
    echo "<h3>Verifying Accounts</h3>\n";
    
    $stmt = $db->query("SELECT id, email, user_type FROM users WHERE email IN ('agency@test.com', 'client@test.com', 'architect@test.com') ORDER BY user_type");
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($accounts) === 3) {
        echo "<p style='color: green;'>✅ All 3 accounts verified in database!</p>\n";
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse; margin-top: 20px;'>\n";
        echo "<tr><th>Email</th><th>Password</th><th>Type</th></tr>\n";
        foreach ($accounts as $account) {
            echo "<tr><td>{$account['email']}</td><td>test123456</td><td>{$account['user_type']}</td></tr>\n";
        }
        echo "</table>\n";
    } else {
        echo "<p style='color: orange;'>⚠️ Only " . count($accounts) . " accounts found</p>\n";
    }
    
    echo "<hr>\n";
    echo "<p><strong>🔗 Login at:</strong> <a href='pages/login/login.html' target='_blank'>http://localhost:8000/pages/login/login.html</a></p>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>\n";
    echo "<pre>" . $e->getTraceAsString() . "</pre>\n";
}
?>
