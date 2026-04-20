<?php
/**
 * /api/works/{id} — GET (single), PUT/PATCH (update) and DELETE
 */

require_once __DIR__ . '/../../helpers.php';

cors();
$method = get_method();

try {

require_auth();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

if ($id <= 0) {
    json_response(['success' => false, 'message' => 'Invalid work ID'], 400);
}

$db = getDB();

if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM works WHERE id = ?');
    $stmt->execute([$id]);
    $work = $stmt->fetch();

    if (!$work) {
        json_response(['success' => false, 'message' => 'Work not found'], 404);
    }

    // Attach images
    $stmtImg = $db->prepare('SELECT id, image_url, sort_order FROM work_images WHERE work_id = ? ORDER BY sort_order, id');
    $stmtImg->execute([$id]);
    $work['images'] = $stmtImg->fetchAll();

    json_response(['success' => true, 'work' => $work]);

} elseif ($method === 'PUT' || $method === 'PATCH') {
    $stmt = $db->prepare('SELECT * FROM works WHERE id = ?');
    $stmt->execute([$id]);
    $work = $stmt->fetch();

    if (!$work) {
        json_response(['success' => false, 'message' => 'Work not found'], 404);
    }

    $body = get_json_body();
    $name = array_key_exists('name', $body) ? trim((string) $body['name']) : $work['name'];
    $description = array_key_exists('description', $body) ? trim((string) $body['description']) : $work['description'];

    if ($name === '') {
        json_response(['success' => false, 'message' => 'Work name is required'], 400);
    }

    $stmtUpdate = $db->prepare('UPDATE works SET name = ?, description = ? WHERE id = ?');
    $stmtUpdate->execute([$name, $description !== '' ? $description : null, $id]);

    $stmt = $db->prepare('SELECT * FROM works WHERE id = ?');
    $stmt->execute([$id]);
    $updatedWork = $stmt->fetch();

    $stmtImg = $db->prepare('SELECT id, image_url, sort_order FROM work_images WHERE work_id = ? ORDER BY sort_order, id');
    $stmtImg->execute([$id]);
    $updatedWork['images'] = $stmtImg->fetchAll();

    json_response(['success' => true, 'message' => 'Work updated', 'work' => $updatedWork]);

} elseif ($method === 'DELETE') {
    $stmt = $db->prepare('SELECT * FROM works WHERE id = ?');
    $stmt->execute([$id]);
    $work = $stmt->fetch();

    if (!$work) {
        json_response(['success' => false, 'message' => 'Work not found'], 404);
    }

    $uploadDir = __DIR__ . '/../../uploads';

    // Remove PDF file if exists
    if (!empty($work['pdf_url'])) {
        $pdfFile = $uploadDir . '/' . basename($work['pdf_url']);
        if (file_exists($pdfFile)) unlink($pdfFile);
    }

    // Remove associated image files
    $stmtImg = $db->prepare('SELECT image_url FROM work_images WHERE work_id = ?');
    $stmtImg->execute([$id]);
    $images = $stmtImg->fetchAll();
    foreach ($images as $img) {
        $file = $uploadDir . '/' . basename($img['image_url']);
        if (file_exists($file)) unlink($file);
    }

    // CASCADE will delete work_images rows automatically
    $stmt = $db->prepare('DELETE FROM works WHERE id = ?');
    $stmt->execute([$id]);

    json_response(['success' => true, 'message' => 'Work deleted']);

} else {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
}
