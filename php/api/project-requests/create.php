<?php
// Disable error display to prevent HTML output
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// Start output buffering at the very beginning
if (ob_get_level() == 0) {
    ob_start();
}

try {
    require_once __DIR__ . '/../../config/database.php';
    require_once __DIR__ . '/../../middleware/cors.php';
    require_once __DIR__ . '/../../config/session.php';
    require_once __DIR__ . '/../../models/User.php';
    require_once __DIR__ . '/../utils/response.php';
} catch (Exception $e) {
    ob_end_clean();
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error']);
    exit;
}

// Clear any output that might have been generated
$output = ob_get_clean();
if (!empty($output) && trim($output) !== '') {
    error_log("Unexpected output before JSON: " . substr($output, 0, 200));
}
ob_start();

// Ensure session is started and readable
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Debug session information
error_log("Project Request API - Session ID: " . session_id());
error_log("Project Request API - Session status: " . session_status());
error_log("Project Request API - Session data: " . print_r($_SESSION, true));
error_log("Project Request API - Cookies: " . print_r($_COOKIE, true));

// Handle both JSON and FormData
$input = [];
if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
    $input = $_POST;
} else {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
}

$userId = null;
$userType = null;

// Check if user is logged in - prioritize session like applications API does
if (isset($_SESSION['user_id'])) {
    $userId = (int)$_SESSION['user_id'];
    $userType = $_SESSION['user_type'] ?? null;
    
    error_log("Project Request API - User logged in: ID=$userId, Type=$userType");
    
    // Only clients can create project requests
    if ($userType !== 'client') {
        json_error('Only clients can submit project requests', 403);
    }
    
    // When logged in as client, use session user_id directly (like applications API)
    // No need to look up or create client - we already have the user_id
} else {
    // User not logged in - try to find or create client from form data
    $email = trim($input['email'] ?? '');
    $phoneNumber = trim($input['phone_number'] ?? '');
    $fullName = trim($input['full_name'] ?? $input['project_name'] ?? '');
    
    if (empty($email)) {
        json_error('Email is required for project request submission', 422);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid email address', 422);
    }
    
    $userModel = new User($pdo);
    
    // Try to find existing client by email
    $existingUser = $userModel->findByEmail($email);
    
    if ($existingUser && $existingUser['user_type'] === 'client') {
        // Use existing client
        $userId = (int)$existingUser['id'];
        error_log("Found existing client with email: $email, ID: $userId");
    } else if ($existingUser && $existingUser['user_type'] !== 'client') {
        // Email exists but is not a client account
        json_error('This email is registered as a ' . $existingUser['user_type'] . ' account. Please log in with that account or use a different email.', 409);
    } else {
        // Create new client account automatically
        try {
            // Parse full name into first and last name
            $nameParts = explode(' ', $fullName, 2);
            $firstName = $nameParts[0] ?? 'Client';
            $lastName = $nameParts[1] ?? '';
            
            // Generate a temporary password (user can reset it later)
            $tempPassword = bin2hex(random_bytes(8));
            $passwordHash = password_hash($tempPassword, PASSWORD_DEFAULT);
            
            $pdo->beginTransaction();
            
            // Create user account
            $userId = $userModel->create([
                'email' => $email,
                'password_hash' => $passwordHash,
                'user_type' => 'client',
                'phone_number' => $phoneNumber ?: null,
                'profile_image' => null,
            ]);
            
            // Create client record
            $stmt = $pdo->prepare(
                'INSERT INTO clients (id, first_name, last_name) 
                 VALUES (:id, :first_name, :last_name)'
            );
            $stmt->execute([
                'id' => $userId,
                'first_name' => $firstName,
                'last_name' => $lastName,
            ]);
            
            $pdo->commit();
            error_log("Created new client account with email: $email, ID: $userId");
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log("Error creating client account: " . $e->getMessage());
            json_error('Failed to create client account: ' . $e->getMessage(), 500);
        }
    }
    
    $userType = 'client';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
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
    // Verify client exists (like applications API does for architects)
    $userModel = new User($pdo);
    $user = $userModel->findById($userId);
    
    if (!$user || $user['user_type'] !== 'client') {
        error_log("Project Request API - Client verification failed: userId=$userId, user=" . print_r($user, true));
        json_error('Client profile not found', 404);
    }
    
    error_log("Project Request API - Client verified: userId=$userId, email=" . ($user['email'] ?? 'N/A'));
    
    $clientId = $userId; // In this system, client_id = user_id
    
    // Verify agency exists
    $stmt = $pdo->prepare('SELECT id FROM agencies WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $agencyId]);
    $agency = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$agency) {
        json_error('Agency not found', 404);
    }
    
    // Insert project request (like applications API does)
    error_log("Project Request API - Inserting project request: clientId=$clientId, agencyId=$agencyId, projectName=$projectName");
    
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
    error_log("Project Request API - Project request inserted successfully: requestId=$requestId");
    
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
        
        // Validate property_type against enum values
        $validPropertyTypes = ['residential', 'commercial', 'landscape', 'institutional', 'other'];
        $propertyType = $input['exterior_property_type'] ?? null;
        if ($propertyType && !in_array($propertyType, $validPropertyTypes)) {
            // Try to map common variations
            $propertyTypeLower = strtolower($propertyType);
            if (strpos($propertyTypeLower, 'residential') !== false || strpos($propertyTypeLower, 'facade') !== false) {
                $propertyType = 'residential';
            } else if (strpos($propertyTypeLower, 'commercial') !== false) {
                $propertyType = 'commercial';
            } else if (strpos($propertyTypeLower, 'landscap') !== false || strpos($propertyTypeLower, 'garden') !== false) {
                $propertyType = 'landscape';
            } else if (strpos($propertyTypeLower, 'institutional') !== false) {
                $propertyType = 'institutional';
            } else {
                $propertyType = 'other';
            }
        }
        
        $stmt->execute([
            'request_id' => $requestId,
            'property_type' => $propertyType,
            'number_of_floors' => isset($input['number_of_floors']) ? (int)$input['number_of_floors'] : null,
            'area' => isset($input['exterior_area']) ? (float)$input['exterior_area'] : null,
            'style_preference' => $input['exterior_style_preference'] ?? null,
            'material_preferences' => isset($input['material_preferences']) ? (is_array($input['material_preferences']) ? json_encode($input['material_preferences']) : $input['material_preferences']) : null,
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
            'material_preferences' => isset($input['interior_material_preferences']) ? (is_array($input['interior_material_preferences']) ? json_encode($input['interior_material_preferences']) : $input['interior_material_preferences']) : null,
            'special_requirements' => $input['interior_special_requirements'] ?? null,
        ]);
    }
    
    ob_end_clean(); // Clear buffer before outputting JSON
    ob_end_clean(); // Clear buffer before outputting JSON
    json_success([
        'request_id' => $requestId,
        'message' => 'Project request submitted successfully',
    ], 201);
    exit;
    
} catch (Throwable $e) {
    error_log('Project request creation error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    error_log('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
    ob_end_clean(); // Clear any output before error response
    
    // Make sure we return JSON, not HTML
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create project request: ' . $e->getMessage(),
        'error' => $e->getMessage()
    ]);
    exit;
}
