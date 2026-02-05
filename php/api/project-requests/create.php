<?php

require_once __DIR__ . '/../../config/session.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../utils/response.php';

if (!isset($_SESSION['user_id'])) {
    json_error('Unauthorized', 401);
}

$userId = (int)$_SESSION['user_id'];
$userType = $_SESSION['user_type'] ?? null;

// Only clients can create project requests
if ($userType !== 'client') {
    json_error('Only clients can submit project requests', 403);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

// Handle both JSON and FormData
$input = [];
if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
    $input = $_POST;
} else {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
}

// Validate required fields
$agencyId = isset($input['agency_id']) ? (int)$input['agency_id'] : null;
$projectName = trim($input['project_name'] ?? '');
$projectType = $input['project_type'] ?? 'exterior'; // exterior, interior, both
$serviceType = $input['service_type'] ?? 'design_only'; // construction, renovation, design_only
$projectLocation = trim($input['project_location'] ?? '');
$description = trim($input['description'] ?? '');

if (!$agencyId) {
    json_error('Agency ID is required', 422);
}

if (empty($projectName)) {
    json_error('Project name is required', 422);
}

if (!in_array($projectType, ['exterior', 'interior', 'both'])) {
    json_error('Invalid project type', 422);
}

if (!in_array($serviceType, ['construction', 'renovation', 'design_only'])) {
    json_error('Invalid service type', 422);
}

try {
    // Verify client exists
    $userModel = new User($pdo);
    $user = $userModel->findById($userId);
    
    if (!$user || $user['user_type'] !== 'client') {
        json_error('Client profile not found', 404);
    }
    
    $clientId = $userId; // In this system, client_id = user_id
    
    // Verify agency exists
    $stmt = $pdo->prepare('SELECT id FROM agencies WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $agencyId]);
    $agency = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agency) {
        json_error('Agency not found', 404);
    }
    
    // Insert project request
    $stmt = $pdo->prepare(
        'INSERT INTO project_requests (
            client_id,
            agency_id,
            project_name,
            project_type,
            service_type,
            project_location,
            description,
            min_budget,
            max_budget,
            preferred_timeline,
            style_preference,
            status,
            created_at,
            updated_at
        ) VALUES (
            :client_id,
            :agency_id,
            :project_name,
            :project_type,
            :service_type,
            :project_location,
            :description,
            :min_budget,
            :max_budget,
            :preferred_timeline,
            :style_preference,
            :status,
            NOW(),
            NOW()
        )'
    );
    
    $stmt->execute([
        'client_id' => $clientId,
        'agency_id' => $agencyId,
        'project_name' => $projectName,
        'project_type' => $projectType,
        'service_type' => $serviceType,
        'project_location' => $projectLocation ?: null,
        'description' => $description ?: null,
        'min_budget' => isset($input['min_budget']) ? (float)$input['min_budget'] : null,
        'max_budget' => isset($input['max_budget']) ? (float)$input['max_budget'] : null,
        'preferred_timeline' => isset($input['preferred_timeline']) ? trim($input['preferred_timeline']) : null,
        'style_preference' => isset($input['style_preference']) ? trim($input['style_preference']) : null,
        'status' => 'pending',
    ]);
    
    $requestId = (int)$pdo->lastInsertId();
    
    // Insert exterior details if project type is exterior or both
    if ($projectType === 'exterior' || $projectType === 'both') {
        $stmt = $pdo->prepare(
            'INSERT INTO project_request_exterior_details (
                request_id,
                property_type,
                number_of_floors,
                area,
                style_preference,
                material_preferences,
                special_requirements,
                created_at
            ) VALUES (
                :request_id,
                :property_type,
                :number_of_floors,
                :area,
                :style_preference,
                :material_preferences,
                :special_requirements,
                NOW()
            )'
        );
        
        $stmt->execute([
            'request_id' => $requestId,
            'property_type' => $input['exterior_property_type'] ?? null,
            'number_of_floors' => isset($input['number_of_floors']) ? (int)$input['number_of_floors'] : null,
            'area' => isset($input['exterior_area']) ? (float)$input['exterior_area'] : null,
            'style_preference' => $input['exterior_style_preference'] ?? null,
            'material_preferences' => isset($input['material_preferences']) ? json_encode($input['material_preferences']) : null,
            'special_requirements' => $input['exterior_special_requirements'] ?? null,
        ]);
    }
    
    // Insert interior details if project type is interior or both
    if ($projectType === 'interior' || $projectType === 'both') {
        $stmt = $pdo->prepare(
            'INSERT INTO project_request_interior_details (
                request_id,
                interior_location,
                property_type,
                number_of_rooms,
                area,
                style_preference,
                color_scheme,
                material_preferences,
                special_requirements,
                created_at
            ) VALUES (
                :request_id,
                :interior_location,
                :property_type,
                :number_of_rooms,
                :area,
                :style_preference,
                :color_scheme,
                :material_preferences,
                :special_requirements,
                NOW()
            )'
        );
        
        $stmt->execute([
            'request_id' => $requestId,
            'interior_location' => $input['interior_location'] ?? null,
            'property_type' => $input['interior_property_type'] ?? null,
            'number_of_rooms' => isset($input['number_of_rooms']) ? (int)$input['number_of_rooms'] : null,
            'area' => isset($input['interior_area']) ? (float)$input['interior_area'] : null,
            'style_preference' => $input['interior_style_preference'] ?? null,
            'color_scheme' => $input['color_scheme'] ?? null,
            'material_preferences' => isset($input['interior_material_preferences']) ? json_encode($input['interior_material_preferences']) : null,
            'special_requirements' => $input['interior_special_requirements'] ?? null,
        ]);
    }
    
    json_success([
        'request_id' => $requestId,
        'message' => 'Project request submitted successfully',
    ], 201);
    
} catch (Throwable $e) {
    error_log('Project request creation error: ' . $e->getMessage());
    json_error('Failed to create project request: ' . $e->getMessage(), 500);
}
