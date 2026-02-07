<?php
require_once __DIR__ . '/php/config/database.php';

try {
    $db = getDB();
    
    // Password hash for "test123456" (same as existing test accounts)
    $passwordHash = '$2y$10$5Ojosx.PW37G8V.e4xZ7o.GNeNDk8VMiJRmOncHvdWaz.F1aFdH6a';
    
    echo "<h2>Creating Test Accounts</h2>\n";
    
    // 1. Agency Account
    try {
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, user_type, phone_number, is_active, created_at, updated_at) 
                              VALUES (100, 'agency@test.com', ?, 'agency', '0555000100', 1, NOW(), NOW())
                              ON DUPLICATE KEY UPDATE email=email");
        $stmt->execute([$passwordHash]);
        
        $stmt = $db->prepare("INSERT INTO agencies (id, name, city, address, bio, is_approved) 
                              VALUES (100, 'Test Agency', 'Algiers', 'Test Address', 'Test agency account', 1)
                              ON DUPLICATE KEY UPDATE name=name");
        $stmt->execute();
        
        echo "<p style='color: green;'>✅ Agency account created: agency@test.com</p>\n";
    } catch (Exception $e) {
        echo "<p style='color: orange;'>⚠️ Agency account (may already exist): " . $e->getMessage() . "</p>\n";
    }
    
    // 2. Client Account
    try {
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, user_type, phone_number, is_active, created_at, updated_at) 
                              VALUES (101, 'client@test.com', ?, 'client', '0555000101', 1, NOW(), NOW())
                              ON DUPLICATE KEY UPDATE email=email");
        $stmt->execute([$passwordHash]);
        
        $stmt = $db->prepare("INSERT INTO clients (id, first_name, last_name) 
                              VALUES (101, 'Test', 'Client')
                              ON DUPLICATE KEY UPDATE first_name=first_name");
        $stmt->execute();
        
        echo "<p style='color: green;'>✅ Client account created: client@test.com</p>\n";
    } catch (Exception $e) {
        echo "<p style='color: orange;'>⚠️ Client account (may already exist): " . $e->getMessage() . "</p>\n";
    }
    
    // 3. Architect Account
    try {
        $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, user_type, phone_number, is_active, created_at, updated_at) 
                              VALUES (102, 'architect@test.com', ?, 'architect', '0555000102', 1, NOW(), NOW())
                              ON DUPLICATE KEY UPDATE email=email");
        $stmt->execute([$passwordHash]);
        
        $stmt = $db->prepare("INSERT INTO architects (id, first_name, last_name, city, bio, years_of_experience, statement) 
                              VALUES (102, 'Test', 'Architect', 'Algiers', 'Test architect account', 5, 'graduate architect')
                              ON DUPLICATE KEY UPDATE first_name=first_name");
        $stmt->execute();
        
        echo "<p style='color: green;'>✅ Architect account created: architect@test.com</p>\n";
    } catch (Exception $e) {
        echo "<p style='color: orange;'>⚠️ Architect account (may already exist): " . $e->getMessage() . "</p>\n";
    }
    
    // Display created accounts
    echo "<hr>\n";
    echo "<h3>Account Summary</h3>\n";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>\n";
    echo "<tr><th>Email</th><th>Password</th><th>Type</th></tr>\n";
    echo "<tr><td>agency@test.com</td><td>test123456</td><td>Agency</td></tr>\n";
    echo "<tr><td>client@test.com</td><td>test123456</td><td>Client</td></tr>\n";
    echo "<tr><td>architect@test.com</td><td>test123456</td><td>Architect</td></tr>\n";
    echo "</table>\n";
    
    echo "<p><strong>You can now log in at:</strong> <a href='pages/login/login.html'>http://localhost:8000/pages/login/login.html</a></p>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>\n";
}
?>
