<?php
/**
 * Common helpers: CORS, JSON responses, auth middleware
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

function cors(): void {
    header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function json_response(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_auth(): array {
    // Try multiple sources for the Authorization header (shared hosting compatibility)
    $header = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if (empty($header) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        $token = $m[1];
    } else {
        json_response(['success' => false, 'message' => 'Access token required'], 401);
    }

    $payload = jwt_decode($token, JWT_SECRET);
    if (!$payload) {
        json_response(['success' => false, 'message' => 'Invalid or expired token'], 403);
    }

    return $payload;
}

function get_method(): string {
    return $_SERVER['REQUEST_METHOD'];
}
