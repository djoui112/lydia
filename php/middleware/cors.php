<?php
declare(strict_types=1);

/**
 * CORS middleware - enables cross-origin requests for localhost development
 */
function handleCORS(): void {
    // Get origin from request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Allow all localhost variations for development (including any port)
    $allowedPatterns = [
        'http://localhost',
        'http://127.0.0.1',
        'file://' // For file:// protocol when testing locally
    ];
    
    $isAllowed = false;
    foreach ($allowedPatterns as $pattern) {
        if (strpos($origin, $pattern) === 0) {
            $isAllowed = true;
            break;
        }
    }
    
    // Also allow if origin is empty (same-origin request)
    if (empty($origin)) {
        $isAllowed = true;
    }
    
    // Always set CORS headers - echo the origin if it's localhost/127.0.0.1, otherwise use *
    if (!empty($origin) && $isAllowed) {
        // Echo back the exact origin for allowed localhost requests
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Default fallback - allow all for development
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    
    // Ensure credentials are allowed - this is critical for session cookies
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // For preflight, explicitly allow credentials
        header("Access-Control-Allow-Credentials: true", true);
    }
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Auto-execute on include
handleCORS();
