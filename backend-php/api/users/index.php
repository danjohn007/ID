<?php
/**
 * /api/users — POST (create, public) and GET (list, admin only)
 */

require_once __DIR__ . '/../../helpers.php';

cors();
$method = get_method();
$db = getDB();

if ($method === 'POST') {
    // ── Save chatbot user info (public) ──
    $body = get_json_body();
    $name    = trim($body['name'] ?? '');
    $company = trim($body['company'] ?? '');
    $email   = trim($body['email'] ?? '');

    if ($name === '' || $email === '') {
        json_response(['success' => false, 'message' => 'Name and email are required'], 400);
    }

    $stmt = $db->prepare('INSERT INTO users (name, company, email) VALUES (?, ?, ?)');
    $stmt->execute([$name, $company ?: null, $email]);

    json_response([
        'success' => true,
        'message' => 'User registered',
        'userId'  => (int) $db->lastInsertId(),
    ], 201);

} elseif ($method === 'GET') {
    // ── List chatbot users (admin only) ──
    require_auth();
    $rows = $db->query('SELECT * FROM users ORDER BY created_at DESC')->fetchAll();
    json_response(['success' => true, 'users' => $rows]);

} else {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}
