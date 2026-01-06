<?php

ini_set('session.use_strict_mode', 1);

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/Mimaria',   // 🔴 VERY IMPORTANT
    'httponly' => true,
    'samesite' => 'Lax',
]);

session_start();
