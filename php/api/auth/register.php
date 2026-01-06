<?php

require_once __DIR__ . '/../../config/session.php';

// Enable error reporting for debugging (remove in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Architect.php';
require_once __DIR__ . '/../../models/Agency.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$userType = $input['user_type'] ?? '';
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$firstName = trim($input['first_name'] ?? '');
$lastName = trim($input['last_name'] ?? '');

// Validate user type
if (!in_array($userType, ['client', 'architect', 'agency'], true)) {
    json_error('Invalid user type', 422);
}

// Validate required fields
if ($email === '' || $password === '' || $firstName === '' || $lastName === '') {
    json_error('Missing required fields', 422);
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email address', 422);
}

// Validate password length
if (strlen($password) < 8) {
    json_error('Password must be at least 8 characters', 422);
}

$userModel = new User($pdo);

// Check if email already exists
if ($userModel->findByEmail($email)) {
    json_error('Email already in use', 409);
}

try {
    $pdo->beginTransaction();

    // Hash the password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Create user
    $userId = $userModel->create([
        'email' => $email,
        'password_hash' => $passwordHash,
        'user_type' => $userType,
        'phone_number' => $input['phone_number'] ?? null,
        'profile_image' => null,
    ]);

    // Create type-specific record
    if ($userType === 'client') {
        $stmt = $pdo->prepare(
            'INSERT INTO clients (id, first_name, last_name) 
             VALUES (:id, :first_name, :last_name)'
        );
        $stmt->execute([
            'id' => $userId,
            'first_name' => $firstName,
            'last_name' => $lastName,
        ]);
    } elseif ($userType === 'architect') {
        $architectModel = new Architect($pdo);
        $architectModel->create($userId, [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'city' => $input['city'] ?? null,
            'date_of_birth' => $input['date_of_birth'] ?? null,
            'gender' => $input['gender'] ?? null,
            'address' => $input['address'] ?? null,
            'bio' => $input['bio'] ?? null,
            'years_of_experience' => $input['years_of_experience'] ?? null,
            'portfolio_url' => $input['portfolio_url'] ?? null,
            'linkedin_url' => $input['linkedin_url'] ?? null,
            'primary_expertise' => $input['primary_expertise'] ?? null,
            'software_proficiency' => $input['software_proficiency'] ?? null,
            'statement' => $input['statement'] ?? 'graduate_architect',
        ]);
    } elseif ($userType === 'agency') {
        $agencyModel = new Agency($pdo);
        $agencyModel->create($userId, [
            'name' => $input['agency_name'] ?? ($firstName . ' ' . $lastName),
            'city' => $input['city'] ?? null,
            'address' => $input['address'] ?? null,
            'cover_image' => $input['cover_image'] ?? null,
            'bio' => $input['bio'] ?? null,
            'legal_document' => $input['legal_document'] ?? null,
        ]);
    }

    $pdo->commit();

    // Set session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_type'] = $userType;

    // Log success
    error_log("User registered successfully: ID=$userId, Type=$userType, Email=$email");

    json_success([
        'user_id' => $userId,
        'user_type' => $userType,
        'email' => $email,
    ], 201);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log the error
    error_log('Registration error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    json_error('Registration failed: ' . $e->getMessage(), 500);
}