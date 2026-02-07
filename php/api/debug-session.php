<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/session.php';

$response = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'session_name' => session_name(),
    'session_data' => $_SESSION,
    'cookies' => $_COOKIE,
    'cookie_params' => session_get_cookie_params(),
    'server' => [
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'not set',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'not set',
        'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
        'HTTP_REFERER' => $_SERVER['HTTP_REFERER'] ?? 'not set',
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
