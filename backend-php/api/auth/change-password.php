<?php
/**
 * POST /api/auth/change-password — change admin password (admin only)
 */

require_once __DIR__ . '/../../helpers.php';

cors();

if (get_method() !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

$payload = require_auth();

$body    = get_json_body();
$current = $body['current_password'] ?? '';
$new     = $body['new_password'] ?? '';

if ($current === '' || $new === '') {
    json_response(['success' => false, 'message' => 'Current and new password are required'], 400);
}

if (strlen($new) < 8) {
    json_response(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 8 caracteres'], 400);
}

$db   = getDB();
$stmt = $db->prepare('SELECT * FROM admins WHERE id = ?');
$stmt->execute([$payload['id']]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($current, $admin['password'])) {
    json_response(['success' => false, 'message' => 'La contraseña actual es incorrecta'], 403);
}

$hashed = password_hash($new, PASSWORD_BCRYPT);
$upd    = $db->prepare('UPDATE admins SET password = ? WHERE id = ?');
$upd->execute([$hashed, $payload['id']]);

json_response(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
