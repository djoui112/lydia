<?php

// Common JSON response helpers for API endpoints
// Note: CORS headers are handled by middleware/cors.php, so we don't set them here
// to avoid conflicts. Only set Content-Type here.

header('Content-Type: application/json; charset=utf-8');

// Don't set CORS headers here - let the CORS middleware handle it
// This prevents conflicts and ensures proper origin handling

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