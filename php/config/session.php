<?php
require_once 'database.php';

ini_set('session.use_strict_mode', 1);

// Use root path so session cookie is sent on all app pages
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/', 
    'httponly' => true,
    'samesite' => 'Lax',
]);

session_start();
?>