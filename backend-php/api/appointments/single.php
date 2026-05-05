<?php
/**
 * /api/appointments/single — GET single appointment | PATCH update status/link (admin only)
 */

require_once __DIR__ . '/../../helpers.php';

cors();
require_auth();

$method = get_method();

/* ── GET ── */
if ($method === 'GET') {
    $hasId = isset($_GET['id']) && $_GET['id'] !== '';
    $id = $hasId ? (int) $_GET['id'] : 0;
    if (!$hasId || $id <= 0) {
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
        a.notes,
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

    json_response(['success' => true, 'appointment' => $appointment]);
}

/* ── PATCH ── */
if ($method === 'PATCH') {
    $body = get_json_body();

    $id = isset($body['id']) ? (int) $body['id'] : 0;
    if ($id <= 0) {
        json_response(['success' => false, 'message' => 'Invalid appointment ID'], 400);
    }

    $allowed_statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    $updates = [];
    $params  = [];

    if (array_key_exists('status', $body)) {
        if (!in_array($body['status'], $allowed_statuses, true)) {
            json_response(['success' => false, 'message' => 'Invalid status value'], 400);
        }
        $updates[] = 'status = ?';
        $params[]  = $body['status'];
    }

    if (array_key_exists('meeting_link', $body)) {
        $link = trim((string) ($body['meeting_link'] ?? ''));
        if ($link !== '' && !filter_var($link, FILTER_VALIDATE_URL)) {
            json_response(['success' => false, 'message' => 'Invalid meeting link URL'], 400);
        }
        $updates[] = 'meeting_link = ?';
        $params[]  = $link !== '' ? $link : null;
    }

    if (array_key_exists('notes', $body)) {
        $notes     = trim((string) ($body['notes'] ?? ''));
        $updates[] = 'notes = ?';
        $params[]  = $notes !== '' ? $notes : null;
    }

    if (empty($updates)) {
        json_response(['success' => false, 'message' => 'No fields to update'], 400);
    }

    $params[] = $id;
    $db = getDB();
    $stmt = $db->prepare('UPDATE appointments SET ' . implode(', ', $updates) . ' WHERE id = ?');
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        json_response(['success' => false, 'message' => 'Appointment not found'], 404);
    }

    json_response(['success' => true, 'message' => 'Appointment updated']);
}

json_response(['success' => false, 'message' => 'Method not allowed'], 405);
