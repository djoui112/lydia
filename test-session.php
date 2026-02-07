<?php
require_once __DIR__ . '/php/config/session.php';

header('Content-Type: application/json');

$response = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'session_name' => session_name(),
    'session_data' => $_SESSION,
    'cookies_received' => $_COOKIE,
    'cookie_params' => session_get_cookie_params(),
    'server' => [
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'not set',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'not set',
        'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
        'HTTP_REFERER' => $_SERVER['HTTP_REFERER'] ?? 'not set',
    ],
    'is_logged_in' => isset($_SESSION['user_id']),
    'user_id' => $_SESSION['user_id'] ?? null,
    'user_type' => $_SESSION['user_type'] ?? null,
];

echo json_encode($response, JSON_PRETTY_PRINT);
