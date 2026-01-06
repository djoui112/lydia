<?php

// Common JSON response helpers for API endpoints

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_success($data = [], int $status = 200): void
{
    http_response_code($status);
    echo json_encode([
        'success' => true,
        'data' => $data,
    ]);
    exit;
}

function json_error(string $message, int $status = 400, array $errors = []): void
{
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'errors' => $errors,
    ]);
    exit;
}