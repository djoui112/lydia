<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'mimaria');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS
    );

    // Set PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    // Don't output HTML - let the calling script handle the error
    error_log("Database connection failed: " . $e->getMessage());
    throw new Exception("Database connection failed");
}
