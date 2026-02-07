<?php
require_once __DIR__ . '/php/config/database.php';

try {
    $db = getDB();
    
    $stmt = $db->query("SELECT id, email, user_type FROM users WHERE email IN ('agency@test.com', 'client@test.com', 'architect@test.com') ORDER BY user_type");
    $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Test Accounts Status</h2>\n";
    
    if (empty($accounts)) {
        echo "<p style='color: orange;'>No test accounts found. Run create-test-accounts.php first.</p>\n";
    } else {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>\n";
        echo "<tr><th>Email</th><th>Password</th><th>Type</th><th>Status</th></tr>\n";
        
        foreach ($accounts as $account) {
            echo "<tr>";
            echo "<td>{$account['email']}</td>";
            echo "<td>test123456</td>";
            echo "<td>{$account['user_type']}</td>";
            echo "<td style='color: green;'>✅ Created</td>";
            echo "</tr>\n";
        }
        
        echo "</table>\n";
        echo "<p><strong>Login at:</strong> <a href='pages/login/login.html'>http://localhost:8000/pages/login/login.html</a></p>\n";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>\n";
}
?>
