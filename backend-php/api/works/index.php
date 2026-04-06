<?php
/**
 * /api/works — GET (list) and POST (create)
 */

require_once __DIR__ . '/../../helpers.php';

cors();
$method = get_method();

try {

if ($method === 'GET') {
    // ── List all works (protected) ──
    require_auth();
    $db = getDB();
    $rows = $db->query('SELECT * FROM works ORDER BY created_at DESC')->fetchAll();

    // Attach images to each work
    $stmtImg = $db->prepare('SELECT id, image_url, sort_order FROM work_images WHERE work_id = ? ORDER BY sort_order, id');
    foreach ($rows as &$row) {
        $stmtImg->execute([$row['id']]);
        $row['images'] = $stmtImg->fetchAll();
    }
    unset($row);

    json_response(['success' => true, 'works' => $rows]);

} elseif ($method === 'POST') {
    // ── Create a new work (protected) ──
    require_auth();

    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if ($name === '') {
        json_response(['success' => false, 'message' => 'Work name is required'], 400);
    }

    $uploadDir = __DIR__ . '/../../uploads';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            json_response(['success' => false, 'message' => 'Failed to create uploads directory'], 500);
        }
    }

    $allowedImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 100 * 1024 * 1024; // 100 MB

    // Insert the work first
    $db = getDB();
    $stmt = $db->prepare('INSERT INTO works (name, description) VALUES (?, ?)');
    $stmt->execute([$name, $description ?: null]);
    $workId = $db->lastInsertId();

    // Handle multiple image uploads (field name: images[])
    $uploadedImages = [];
    if (isset($_FILES['images'])) {
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;

        for ($i = 0; $i < $count; $i++) {
            $tmpName  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $fileType = is_array($files['type'])     ? $files['type'][$i]     : $files['type'];
            $fileSize = is_array($files['size'])     ? $files['size'][$i]     : $files['size'];
            $fileName = is_array($files['name'])     ? $files['name'][$i]     : $files['name'];
            $fileErr  = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];

            if ($fileErr !== UPLOAD_ERR_OK) continue;

            if (!in_array($fileType, $allowedImage)) continue;
            if ($fileSize > $maxSize) continue;

            $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $newName = 'img-' . $workId . '-' . time() . '-' . mt_rand(100000, 999999) . '.' . $ext;

            if (move_uploaded_file($tmpName, "$uploadDir/$newName")) {
                $imageUrl = BASE_URL . '/uploads/' . $newName;
                $stmtImg = $db->prepare('INSERT INTO work_images (work_id, image_url, sort_order) VALUES (?, ?, ?)');
                $stmtImg->execute([$workId, $imageUrl, $i]);
                $uploadedImages[] = ['image_url' => $imageUrl, 'sort_order' => $i];
            }
        }
    }

    // Return the created work with images
    $stmt = $db->prepare('SELECT * FROM works WHERE id = ?');
    $stmt->execute([$workId]);
    $work = $stmt->fetch();
    $work['images'] = $uploadedImages;

    json_response(['success' => true, 'message' => 'Work created', 'work' => $work], 201);

} else {
    json_response(['success' => false, 'message' => 'Method not allowed'], 405);
}

} catch (Exception $e) {
    json_response(['success' => false, 'message' => 'Server error: ' . $e->getMessage()], 500);
}
