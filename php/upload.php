<?php
require_once 'config.php';
require_once 'auth.php';

$agencyId = getCurrentAgencyId($pdo);
$uploadDir = '../uploads/agencies/' . $agencyId . '/';

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
$maxSize = 5 * 1024 * 1024; // 5MB

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$fileType = $file['type'];
$fileSize = $file['size'];

// Validate file type
if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

// Validate file size
if ($fileSize > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large']);
    exit;
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $filepath)) {
    $relativePath = 'uploads/agencies/' . $agencyId . '/' . $filename;
    
    // Update database based on upload type
    $uploadType = $_POST['type'] ?? 'profile';
    
    if ($uploadType === 'profile') {
        $stmt = $pdo->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
        $stmt->execute([$relativePath, $agencyId]);
    } elseif ($uploadType === 'cover') {
        $stmt = $pdo->prepare("UPDATE agencies SET cover_image = ? WHERE id = ?");
        $stmt->execute([$relativePath, $agencyId]);
    } elseif ($uploadType === 'document') {
        $stmt = $pdo->prepare("UPDATE agencies SET legal_document = ? WHERE id = ?");
        $stmt->execute([$relativePath, $agencyId]);
    }
    
    echo json_encode([
        'success' => true,
        'filepath' => $relativePath,
        'message' => 'File uploaded successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to upload file']);
}
?>
