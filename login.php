<?php
//session_start();

$config = require 'config.php';

$host = $config['database']['host'];
$dbname = $config['database']['dbname'];
$username = $config['database']['username'];
$password = $config['database']['password'];



try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}


header('Content-Type: application/json');

if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Send CSRF token to the frontend securely (optional endpoint)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['csrf'])) {
    echo json_encode(['csrf_token' => $_SESSION['csrf_token']]);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);


    // Validate phone number input
    $phone = $input['phone'] ?? '';
    if (empty($phone)) {
        echo json_encode(['status' => 'error', 'message' => 'Phone number is required']);
        exit;
    }

    // Check phone number in the database
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email, competition_started , score ,avatar FROM users WHERE phone = :phone");
    $stmt->execute(['phone' => $phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {

        // Mark the competition as started for the user if not already marked
        if (!$user['competition_started']) {
            $updateStmt = $pdo->prepare("UPDATE users SET competition_started = TRUE WHERE id = :id");
            $updateStmt->execute(['id' => $user['id']]);
        }

        echo json_encode(['status' => 'success', 'user' => $user]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'آیدی پیدا نشد']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>