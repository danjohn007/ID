<?php
/**
 * /api/health — Health check
 */

require_once __DIR__ . '/../helpers.php';

cors();

json_response([
    'success'   => true,
    'message'   => 'API is running',
    'timestamp' => date('c'),
]);
