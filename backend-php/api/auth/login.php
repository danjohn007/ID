<?php
/**
 * POST /api/auth/login
 */

require_once __DIR__ . '/../../helpers.php';

cors();

if (get_method() !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

$body = get_json_body();
$username = trim($body['username'] ?? '');
$password = $body['password'] ?? '';

if ($username === '' || $password === '') {
    json_response(['success' => false, 'message' => 'Username and password are required'], 400);
}

$db = getDB();
$stmt = $db->prepare('SELECT * FROM admins WHERE username = ?');
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password'])) {
    json_response(['success' => false, 'message' => 'Invalid credentials'], 401);
}

$token = jwt_encode([
    'id'       => $admin['id'],
    'username' => $admin['username'],
    'exp'      => time() + JWT_EXPIRES_IN,
], JWT_SECRET);

json_response([
    'success' => true,
    'message' => 'Login successful',
    'token'   => $token,
    'admin'   => ['id' => $admin['id'], 'username' => $admin['username']],
]);
