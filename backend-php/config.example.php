<?php
/**
 * Database configuration
 * Copy this file to config.php and fill in your actual credentials
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');
define('DB_PORT', 3306);

define('JWT_SECRET', 'change_this_to_a_random_string');
define('JWT_EXPIRES_IN', 86400); // 24 hours in seconds

define('FRONTEND_URL', 'https://yourdomain.com');

// Base URL for uploaded files
define('BASE_URL', 'https://yourdomain.com/backid');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}
