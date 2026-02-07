<?php
// Simple router for PHP built-in server
// This ensures that requests to the root serve index.html

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove leading slash
$requestPath = ltrim($requestPath, '/');

// If it's the root or empty, serve index.html
if (empty($requestPath) || $requestPath === '/') {
    if (file_exists(__DIR__ . '/index.html')) {
        return false; // Let PHP serve index.html
    }
}

// If the file exists, serve it
$filePath = __DIR__ . '/' . $requestPath;
if (file_exists($filePath) && is_file($filePath)) {
    return false; // Let PHP serve the file
}

// For API routes, let them be handled by their respective files
if (strpos($requestPath, 'php/') === 0) {
    return false; // Let PHP handle it
}

// If file doesn't exist, try index.html for directory requests
if (is_dir(__DIR__ . '/' . dirname($requestPath))) {
    $indexPath = __DIR__ . '/' . dirname($requestPath) . '/index.html';
    if (file_exists($indexPath)) {
        return false;
    }
}

// Default: return 404
http_response_code(404);
echo "404 - File not found";
return true;
