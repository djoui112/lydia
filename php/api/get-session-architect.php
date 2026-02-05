<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['architect_id'])) {
    echo json_encode(['architect_id' => $_SESSION['architect_id']]);
} else {
    echo json_encode(['architect_id' => null]);
}
