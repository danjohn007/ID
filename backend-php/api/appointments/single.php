<?php
/**
 * /api/appointments/single?id={id} — GET single appointment detail (admin only)
 */

require_once __DIR__ . '/../../helpers.php';

cors();

if (get_method() !== 'GET') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

require_auth();

$hasId = isset($_GET['id']) && $_GET['id'] !== '';
$id = $hasId ? (int) $_GET['id'] : 0;
if (!$hasId || $id < 0) {
    json_response(['success' => false, 'message' => 'Invalid appointment ID'], 400);
}

$db = getDB();
$stmt = $db->prepare(
    'SELECT
        a.id,
        a.user_id,
        a.phone,
        a.name,
        a.email,
        a.company,
        a.event_name,
        a.interest,
        a.mode,
        a.appointment_at,
        a.meeting_link,
        a.status,
        a.created_at,
        u.name AS user_name
     FROM appointments a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.id = ?
     LIMIT 1'
);
$stmt->execute([$id]);
$appointment = $stmt->fetch();

if (!$appointment) {
    json_response(['success' => false, 'message' => 'Appointment not found'], 404);
}

json_response([
    'success' => true,
    'appointment' => $appointment,
]);
