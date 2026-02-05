<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../utils/helpers.php';


header('Content-Type: application/json');

try {
    $db = getDB();

    // Support both 'query' and 'search' parameters for frontend compatibility
    $search = sanitize($_GET['query'] ?? $_GET['search'] ?? '');

    $whereClause = '';
    $params = [];

    if ($search !== '') {
        $whereClause = "WHERE CONCAT(first_name, ' ', last_name) LIKE :search
                        OR primary_expertise LIKE :search";
        $params[':search'] = "%$search%";
    }

    // No pagination - return all matching architects
    $query = "SELECT id, first_name, last_name, primary_expertise
              FROM architects
              $whereClause
              ORDER BY last_name ASC, first_name ASC";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $architects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // The job appliance page expects a bare array of architects, not wrapped.
    echo json_encode($architects);

} catch (Exception $e) {
    error_log('Error in search architect: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([]);
}

