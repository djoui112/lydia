<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/php/api/utils/helpers.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $db = getDB();
    
    // Search for architect by name (case insensitive)
    $searchName = 'aminz zeroual';
    $nameParts = explode(' ', $searchName);
    
    $query = "SELECT 
                a.id as architect_id,
                a.first_name,
                a.last_name,
                a.city,
                a.address,
                a.bio,
                a.years_of_experience,
                a.primary_expertise,
                u.email,
                u.phone_number,
                u.profile_image,
                u.id as user_id
              FROM architects a
              INNER JOIN users u ON a.id = u.id
              WHERE (LOWER(a.first_name) LIKE LOWER(:first) AND LOWER(a.last_name) LIKE LOWER(:last))
                 OR (LOWER(CONCAT(a.first_name, ' ', a.last_name)) LIKE LOWER(:full))
              LIMIT 10";
    
    $stmt = $db->prepare($query);
    $first = isset($nameParts[0]) ? '%' . $nameParts[0] . '%' : '%';
    $last = isset($nameParts[1]) ? '%' . $nameParts[1] . '%' : '%';
    $full = '%' . $searchName . '%';
    
    $stmt->execute([
        ':first' => $first,
        ':last' => $last,
        ':full' => $full
    ]);
    
    $architects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<!DOCTYPE html><html><head><title>Architect Search</title><style>body{font-family:Arial;padding:20px;}table{border-collapse:collapse;width:100%;margin:20px 0;}th,td{border:1px solid #ddd;padding:12px;text-align:left;}th{background-color:#4CAF50;color:white;}.found{background:#d4edda;padding:20px;margin:20px 0;border:2px solid #28a745;}.notfound{background:#f8d7da;padding:20px;margin:20px 0;border:2px solid #dc3545;}</style></head><body>";
    echo "<h2>Search Results for: '$searchName'</h2>";
    
    if (empty($architects)) {
        echo "<div class='notfound'><p style='color: red; font-size:18px;'>❌ No architect found with name matching '$searchName'</p></div>";
        
        // Show all architects for reference
        echo "<h3>All Architects in Database:</h3>";
        $allQuery = "SELECT a.id, a.first_name, a.last_name, u.email 
                     FROM architects a 
                     INNER JOIN users u ON a.id = u.id 
                     ORDER BY a.id 
                     LIMIT 50";
        $allStmt = $db->prepare($allQuery);
        $allStmt->execute();
        $allArchitects = $allStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table>";
        echo "<tr><th>Architect ID</th><th>First Name</th><th>Last Name</th><th>Email</th></tr>";
        foreach ($allArchitects as $arch) {
            echo "<tr>";
            echo "<td><strong>" . htmlspecialchars($arch['id']) . "</strong></td>";
            echo "<td>" . htmlspecialchars($arch['first_name'] ?? '') . "</td>";
            echo "<td>" . htmlspecialchars($arch['last_name'] ?? '') . "</td>";
            echo "<td>" . htmlspecialchars($arch['email'] ?? '') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<div class='found'><p style='color: green; font-size:18px;'>✅ Found " . count($architects) . " architect(s)</p></div>";
        
        foreach ($architects as $arch) {
            echo "<div style='border: 2px solid #333; padding: 20px; margin: 20px 0; background: #f5f5f5;'>";
            echo "<h3 style='color: #4CAF50;'>Architect ID: <strong>" . htmlspecialchars($arch['architect_id']) . "</strong></h3>";
            echo "<table>";
            echo "<tr><th>Field</th><th>Value</th></tr>";
            echo "<tr><td><strong>Name</strong></td><td>" . htmlspecialchars($arch['first_name'] . ' ' . $arch['last_name']) . "</td></tr>";
            echo "<tr><td><strong>User ID</strong></td><td>" . htmlspecialchars($arch['user_id']) . "</td></tr>";
            echo "<tr><td><strong>Email</strong></td><td>" . htmlspecialchars($arch['email'] ?? 'N/A') . "</td></tr>";
            echo "<tr><td><strong>Phone</strong></td><td>" . htmlspecialchars($arch['phone_number'] ?? 'N/A') . "</td></tr>";
            echo "<tr><td><strong>City</strong></td><td>" . htmlspecialchars($arch['city'] ?? 'N/A') . "</td></tr>";
            echo "<tr><td><strong>Years of Experience</strong></td><td>" . htmlspecialchars($arch['years_of_experience'] ?? 'N/A') . "</td></tr>";
            echo "<tr><td><strong>Primary Expertise</strong></td><td>" . htmlspecialchars($arch['primary_expertise'] ?? 'N/A') . "</td></tr>";
            echo "<tr><td><strong>Profile Image</strong></td><td>" . htmlspecialchars($arch['profile_image'] ?? 'N/A') . "</td></tr>";
            echo "<tr><td><strong>Bio</strong></td><td>" . htmlspecialchars($arch['bio'] ?? 'N/A') . "</td></tr>";
            echo "</table>";
            echo "</div>";
        }
    }
    
    echo "</body></html>";
    
} catch (Exception $e) {
    echo "<!DOCTYPE html><html><head><title>Error</title></head><body>";
    echo "<div class='notfound'>";
    echo "<h2>❌ Error</h2>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Error Code: " . $e->getCode() . "</p>";
    echo "<p>File: " . htmlspecialchars($e->getFile()) . "</p>";
    echo "<p>Line: " . $e->getLine() . "</p>";
    if (strpos($e->getMessage(), '2002') !== false) {
        echo "<p style='color: orange;'>⚠️ MySQL server is not running! Please start MySQL in XAMPP.</p>";
    }
    echo "</div></body></html>";
}
?>
