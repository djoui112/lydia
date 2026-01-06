<?php

require_once __DIR__ . '/../../config/session.php';

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Architect.php';
require_once __DIR__ . '/../../models/Agency.php';
require_once __DIR__ . '/../utils/response.php';

// Debug logging
error_log('Profile.php - Session ID: ' . session_id());
error_log('Profile.php - User ID: ' . ($_SESSION['user_id'] ?? 'NOT SET'));
error_log('Profile.php - User Type: ' . ($_SESSION['user_type'] ?? 'NOT SET'));

if (!isset($_SESSION['user_id'])) {
    json_error('Unauthorized', 401);
}

$userId = (int)$_SESSION['user_id'];
$userType = $_SESSION['user_type'] ?? null;

// GET - Fetch profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userModel = new User($pdo);
    $user = $userModel->findById($userId);
    
    if (!$user) {
        json_error('User not found', 404);
    }

    $profile = ['user' => $user];

    if ($userType === 'architect') {
        $architectModel = new Architect($pdo);
        $profile['architect'] = $architectModel->findByUserId($userId);
    } elseif ($userType === 'agency') {
        $agencyModel = new Agency($pdo);
        $profile['agency'] = $agencyModel->findByUserId($userId);
    } elseif ($userType === 'client') {
        $stmt = $pdo->prepare('SELECT * FROM clients WHERE id = :id');
        $stmt->execute(['id' => $userId]);
        $profile['client'] = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    json_success($profile);
}

// PUT/POST - Update profile
if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $userModel = new User($pdo);
    $user = $userModel->findById($userId);
    
    if (!$user) {
        json_error('User not found', 404);
    }

    try {
        $pdo->beginTransaction();

        // Update email if provided
        if (isset($input['email']) && filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $stmt = $pdo->prepare('UPDATE users SET email = :email, updated_at = NOW() WHERE id = :id');
            $stmt->execute([
                'email' => $input['email'],
                'id' => $userId,
            ]);
        }

        // Update phone number if provided
        if (isset($input['phone_number'])) {
            $stmt = $pdo->prepare('UPDATE users SET phone_number = :phone_number, updated_at = NOW() WHERE id = :id');
            $stmt->execute([
                'phone_number' => $input['phone_number'],
                'id' => $userId,
            ]);
        }

        // Update type-specific data
        if ($userType === 'client') {
            $stmt = $pdo->prepare(
                'UPDATE clients SET first_name = :first_name, last_name = :last_name WHERE id = :id'
            );
            $stmt->execute([
                'id' => $userId,
                'first_name' => $input['first_name'] ?? '',
                'last_name' => $input['last_name'] ?? '',
            ]);
        } elseif ($userType === 'architect') {
            $architectModel = new Architect($pdo);
            $architectModel->update($userId, [
                'first_name' => $input['first_name'] ?? '',
                'last_name' => $input['last_name'] ?? '',
                'date_of_birth' => $input['date_of_birth'] ?? null,
                'gender' => $input['gender'] ?? null,
                'city' => $input['city'] ?? null,
                'address' => $input['address'] ?? null,
            ]);
        } elseif ($userType === 'agency') {
            $agencyModel = new Agency($pdo);
            $agencyModel->update($userId, [
                'name' => $input['name'] ?? '',
                'city' => $input['city'] ?? null,
                'address' => $input['address'] ?? null,
                'bio' => $input['bio'] ?? null,
            ]);
        }

        $pdo->commit();
        json_success(['message' => 'Profile updated']);
        
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('Profile update error: ' . $e->getMessage());
        json_error('Failed to update profile', 500);
    }
}

json_error('Method not allowed', 405);