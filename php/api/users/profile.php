<?php

require_once __DIR__ . '/../../config/session.php';

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Architect.php';
require_once __DIR__ . '/../../models/Agency.php';
require_once __DIR__ . '/../utils/response.php';

// Session diagnostics (required for debugging)
error_log('Session status: ' . session_status());
error_log('Session ID: ' . session_id());
error_log('Session data: ' . print_r($_SESSION, true));

// Existing debug logging (do not remove)
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
        $architect = $architectModel->findByUserId($userId);
        if ($architect) {
            // Remove duplicate fields from JOIN (email, phone_number, profile_image already in user)
            unset($architect['email'], $architect['phone_number'], $architect['profile_image']);
            // Ensure all nullable fields are included, even if NULL
            $profile['architect'] = array_merge([
                'statement' => null,
                'software_proficiency' => null,
                'projects_worked_on' => null,
            ], $architect);
        } else {
            $profile['architect'] = null;
        }
    } elseif ($userType === 'agency') {
        $agencyModel = new Agency($pdo);
        $agency = $agencyModel->findByUserId($userId);
        if ($agency) {
            // Remove duplicate fields from JOIN
            unset($agency['email'], $agency['phone_number'], $agency['profile_image']);
            $profile['agency'] = $agency;
        } else {
            $profile['agency'] = null;
        }
    } elseif ($userType === 'client') {
        $stmt = $pdo->prepare('SELECT * FROM clients WHERE id = :id');
        $stmt->execute(['id' => $userId]);
        $profile['client'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    json_success($profile);
}

// PUT/POST - Update profile
if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle both JSON and FormData (multipart/form-data)
    $input = [];
    if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
        // FormData - merge POST and handle file uploads
        $input = $_POST;
        // Handle profile image upload
        if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../../assets/uploads/profile_images/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $fileName = uniqid() . '_' . basename($_FILES['profile_image']['name']);
            $targetPath = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $targetPath)) {
                $input['profile_image'] = 'assets/uploads/profile_images/' . $fileName;
            }
        }
    } else {
        // JSON input
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    }

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
                'phone_number' => $input['phone_number'] ?: null,
                'id' => $userId,
            ]);
        }
        
        // Update profile image if provided
        if (isset($input['profile_image'])) {
            $stmt = $pdo->prepare('UPDATE users SET profile_image = :profile_image, updated_at = NOW() WHERE id = :id');
            $stmt->execute([
                'profile_image' => $input['profile_image'] ?: null,
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
            
            // Build update array - only include fields that are explicitly provided
            // The update method will only update provided fields, preserving others
            $updateData = [];
            
            if (isset($input['first_name'])) $updateData['first_name'] = $input['first_name'] ?: '';
            if (isset($input['last_name'])) $updateData['last_name'] = $input['last_name'] ?: '';
            if (isset($input['date_of_birth'])) $updateData['date_of_birth'] = $input['date_of_birth'] ?: null;
            if (isset($input['gender'])) $updateData['gender'] = $input['gender'] ?: null;
            if (isset($input['city'])) $updateData['city'] = $input['city'] ?: null;
            if (isset($input['address'])) $updateData['address'] = $input['address'] ?: null;
            if (isset($input['bio'])) $updateData['bio'] = $input['bio'] ?: null;
            if (isset($input['years_of_experience'])) {
                $updateData['years_of_experience'] = $input['years_of_experience'] !== '' && $input['years_of_experience'] !== null 
                    ? (int)$input['years_of_experience'] : null;
            }
            if (isset($input['portfolio_url'])) $updateData['portfolio_url'] = $input['portfolio_url'] ?: null;
            if (isset($input['linkedin_url'])) $updateData['linkedin_url'] = $input['linkedin_url'] ?: null;
            if (isset($input['primary_expertise'])) $updateData['primary_expertise'] = $input['primary_expertise'] ?: null;
            if (isset($input['statement'])) $updateData['statement'] = $input['statement'] ?: null;
            if (isset($input['software_proficiency'])) $updateData['software_proficiency'] = $input['software_proficiency'] ?: null;
            if (isset($input['projects_worked_on'])) {
                // Handle SET type - can be comma-separated string or array
                $projects = is_array($input['projects_worked_on']) 
                    ? $input['projects_worked_on'] 
                    : explode(',', $input['projects_worked_on']);
                $updateData['projects_worked_on'] = !empty($projects) ? implode(',', array_filter($projects)) : null;
            }
            
            // Only update if there are fields to update
            if (!empty($updateData)) {
                $architectModel->update($userId, $updateData);
            }

        } elseif ($userType === 'agency') {
            $agencyModel = new Agency($pdo);
            
            // Handle legal document upload if provided
            if (isset($_FILES['legal_document']) && $_FILES['legal_document']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../../../assets/uploads/documents/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                $fileName = uniqid() . '_' . basename($_FILES['legal_document']['name']);
                $targetPath = $uploadDir . $fileName;
                if (move_uploaded_file($_FILES['legal_document']['tmp_name'], $targetPath)) {
                    $input['legal_document'] = 'assets/uploads/documents/' . $fileName;
                }
            }
            
            // Update phone number in users table if provided
            if (isset($input['phone_number'])) {
                $stmt = $pdo->prepare('UPDATE users SET phone_number = :phone_number, updated_at = NOW() WHERE id = :id');
                $stmt->execute([
                    'phone_number' => $input['phone_number'] ?: null,
                    'id' => $userId,
                ]);
            }
            
            // Update agency profile
            $updateData = [];
            if (isset($input['name'])) $updateData['name'] = $input['name'] ?: '';
            if (isset($input['city'])) $updateData['city'] = $input['city'] ?: null;
            if (isset($input['address'])) $updateData['address'] = $input['address'] ?: null;
            if (isset($input['bio'])) $updateData['bio'] = $input['bio'] ?: null;
            if (isset($input['legal_document'])) {
                // Update legal document in agencies table
                $stmt = $pdo->prepare('UPDATE agencies SET legal_document = :legal_document WHERE id = :id');
                $stmt->execute([
                    'legal_document' => $input['legal_document'],
                    'id' => $userId,
                ]);
            }
            
            if (!empty($updateData)) {
                $agencyModel->update($userId, $updateData);
            }
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