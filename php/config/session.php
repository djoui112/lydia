<?php

ini_set('session.use_strict_mode', 1);

// Use root path so session cookie is sent on all app pages
// Set samesite to None for cross-origin requests, but only if secure (HTTPS)
// For localhost development, use Lax
$isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/', 
    'domain' => '', // Empty means current domain
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'Lax', // Use Lax for localhost
]);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}