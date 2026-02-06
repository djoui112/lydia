<?php

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed', 405);
}

if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
    json_error('Unauthorized', 401);
}

if ($_SESSION['user_type'] !== 'client') {
    json_error('Only clients can view their projects', 403);
}

$clientId = (int)$_SESSION['user_id'];

try {
    $query = "
        SELECT 
            p.id AS project_id,
            p.project_name,
            p.start_date,
            p.created_at,
            pr.project_type,
            a.name AS agency_name,
            CONCAT(ar.first_name, ' ', ar.last_name) AS architect_name,
            (
                SELECT photo_path
                FROM project_photos
                WHERE project_id = p.id
                ORDER BY is_primary DESC, display_order ASC, id ASC
                LIMIT 1
            ) AS project_photo
        FROM projects p
        LEFT JOIN project_requests pr ON p.request_id = pr.id
        LEFT JOIN agencies a ON p.agency_id = a.id
        LEFT JOIN architects ar ON p.assigned_architect_id = ar.id
        WHERE p.client_id = :client_id
        ORDER BY p.created_at DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['client_id' => $clientId]);
    $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = array_map(function ($project) {
        $displayDate = $project['start_date'] ?: $project['created_at'];
        return [
            'project_id' => (int)$project['project_id'],
            'project_name' => $project['project_name'],
            'project_type' => $project['project_type'],
            'agency_name' => $project['agency_name'],
            'architect_name' => trim((string)$project['architect_name']),
            'display_date' => $displayDate,
            'project_photo_url' => $project['project_photo'],
        ];
    }, $projects);

    json_success($data);
} catch (Throwable $e) {
    error_log('Client projects error: ' . $e->getMessage());
    json_error('Failed to fetch projects', 500);
}
