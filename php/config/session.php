<?php

ini_set('session.use_strict_mode', 1);

// Use root path so session cookie is sent on all app pages
// For localhost development, use Lax and non-secure
$isSecure = false; // Always false for localhost:8000 (http://)
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/', 
    'domain' => '', // Empty means current domain (localhost)
    'secure' => false, // false for http://localhost
    'httponly' => true,
    'samesite' => 'Lax', // Use Lax for localhost
]);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}