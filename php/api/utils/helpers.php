<?php
declare(strict_types=1);

/**
 * Utility helper functions
 */

/**
 * Get database connection
 * @return PDO
 */
function getDB(): PDO {
    global $pdo;
    if (!isset($pdo)) {
        require_once __DIR__ . '/../../config/database.php';
    }
    return $pdo;
}

/**
 * Get base URL for the application
 * @return string
 */
function getBaseUrl(): string {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $path = dirname($_SERVER['SCRIPT_NAME'] ?? '');
    return "$protocol://$host$path";
}

/**
 * Build full URL for uploaded files
 * @param string $path
 * @return string
 */
function buildFileUrl(string $path): string {
    if (empty($path)) {
        return '';
    }
    
    // If already a full URL, return as is
    if (strpos($path, 'http') === 0) {
        return $path;
    }
    
    $baseUrl = 'http://localhost/mimaria';
    $path = ltrim($path, '/');
    
    // If path already starts with 'assets/', use it directly
    // Otherwise, assume it's in the uploads directory
    if (strpos($path, 'assets/') === 0) {
        return "$baseUrl/$path";
    } else {
        return "$baseUrl/uploads/$path";
    }
}

/**
 * Get pagination parameters from request
 * @return array
 */
function getPaginationParams(): array {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(100, (int)($_GET['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    
    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => $offset
    ];
}

/**
 * Format pagination response
 * @param array $data
 * @param int $total
 * @param int $page
 * @param int $limit
 * @return array
 */
function formatPaginatedResponse(array $data, int $total, int $page, int $limit): array {
    return [
        'data' => $data,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ];
}

/**
 * Sanitize string input
 * @param string $input
 * @return string
 */
function sanitize(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Get search query from request
 * @return string
 */
function getSearchQuery(): string {
    return sanitize($_GET['search'] ?? $_GET['query'] ?? '');
}

/**
 * Parse comma-separated tags
 * @param string|null $tags
 * @return array
 */
function parseTags(?string $tags): array {
    if (empty($tags)) {
        return [];
    }
    return array_map('trim', explode(',', $tags));
}

/**
 * Format date for display
 * @param string|null $date
 * @param string $format
 * @return string|null
 */
function formatDate(?string $date, string $format = 'Y-m-d'): ?string {
    if (empty($date)) {
        return null;
    }
    try {
        $dt = new DateTime($date);
        return $dt->format($format);
    } catch (Exception $e) {
        return null;
    }
}
