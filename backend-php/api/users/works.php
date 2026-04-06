<?php
/**
 * /api/users/works — public endpoint for chatbot to retrieve portfolio
 */

require_once __DIR__ . '/../../helpers.php';

cors();

if (get_method() !== 'GET') {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

$db = getDB();
$rows = $db->query('SELECT id, name, description, created_at FROM works ORDER BY created_at DESC')->fetchAll();

$stmtImg = $db->prepare('SELECT id, image_url, sort_order FROM work_images WHERE work_id = ? ORDER BY sort_order, id');
foreach ($rows as &$row) {
    $stmtImg->execute([$row['id']]);
    $row['images'] = $stmtImg->fetchAll();
}
unset($row);

json_response(['success' => true, 'works' => $rows]);
