<?php
$conn = new mysqli("localhost", "root", "", "mimaria");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "✅ Connected to database successfully!";
?>
