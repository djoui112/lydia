<?php
// Test database connection
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Database Connection Test</h2>";

try {
    $host = 'localhost';
    $dbname = 'mimaria';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM projects");
    $result = $stmt->fetch();
    echo "<p>📊 Projects in database: " . $result['count'] . "</p>";
    
    // Show database name
    $stmt = $pdo->query("SELECT DATABASE() as dbname");
    $dbname_result = $stmt->fetch();
    echo "<p>🗄️ Connected to database: <strong>" . $dbname_result['dbname'] . "</strong></p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database connection failed!</p>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Error Code:</strong> " . $e->getCode() . "</p>";
    
    if (strpos($e->getMessage(), '2002') !== false) {
        echo "<p style='color: orange;'>⚠️ MySQL server is not running! Please start MySQL in XAMPP.</p>";
    }
}
?>
