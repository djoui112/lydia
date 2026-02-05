<?php
declare(strict_types=1);

/**
 * CORS middleware - enables cross-origin requests for localhost development
 */
function handleCORS(): void {
    // Get origin from request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Allow all localhost variations for development
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
    
    // If no origin (same-origin request) or allowed origin, set CORS headers
    if (empty($origin) || $isAllowed) {
        if (!empty($origin)) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            // Allow all for same-origin or when origin is missing
            header("Access-Control-Allow-Origin: *");
        }
    } else {
        // Default fallback
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Auto-execute on include
handleCORS();
