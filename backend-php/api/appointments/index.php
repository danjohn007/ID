<?php
/**
 * /api/appointments — GET list by date and month summary (admin only)
 */

require_once __DIR__ . '/../../helpers.php';

cors();

if (get_method() !== 'GET') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

require_auth();
$db = getDB();

$date = trim($_GET['date'] ?? '');
$month = trim($_GET['month'] ?? '');

if ($date !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_response(['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD'], 400);
}

if ($month !== '' && !preg_match('/^\d{4}-\d{2}$/', $month)) {
    json_response(['success' => false, 'message' => 'Invalid month format. Use YYYY-MM'], 400);
}

$appointments = [];
$monthSummary = [];

if ($date !== '') {
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
         WHERE DATE(a.appointment_at) = ?
         ORDER BY a.appointment_at ASC'
    );
    $stmt->execute([$date]);
    $appointments = $stmt->fetchAll();
}

if ($month !== '') {
    $stmtMonth = $db->prepare(
        'SELECT DATE(appointment_at) AS day_key, COUNT(*) AS total
         FROM appointments
         WHERE DATE_FORMAT(appointment_at, "%Y-%m") = ?
         GROUP BY DATE(appointment_at)
         ORDER BY day_key ASC'
    );
    $stmtMonth->execute([$month]);

    foreach ($stmtMonth->fetchAll() as $row) {
        $monthSummary[$row['day_key']] = (int) $row['total'];
    }
}

json_response([
    'success' => true,
    'appointments' => $appointments,
    'monthSummary' => $monthSummary,
]);
