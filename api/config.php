<?php
// config.php
declare(strict_types=1);

session_start(); // if you use session auth

// change these to match your setup
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'mimaria');
define('DB_USER', 'root');
define('DB_PASS', ''); // XAMPP default is empty

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}
?>
