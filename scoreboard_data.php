<?php
header('Content-Type: application/json');

$config = require 'config.php';

$host = $config['database']['host'];
$dbname = $config['database']['dbname'];
$username = $config['database']['username'];
$password = $config['database']['password'];

$adminPassword = $config['admin']['password'];

$jsonFilePath = $config['paths']['json_file'];

// Establish a connection to the database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Could not connect to the database: " . $e->getMessage());
}


$input = json_decode(file_get_contents('php://input'), true);

// Check if the password and action are provided via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['password'])) {
    $password = $input['password'];

    // Verify the password
    if ($password === $adminPassword) {
        // Query to get the number of people who joined the competition
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE competition_started = TRUE");
        $stmt->execute();
        $joinedCount = $stmt->fetchColumn();

        // Query to get the top 10 users ranked by score
        $stmt = $pdo->prepare("SELECT id, first_name, last_name, phone, score, avatar, uuid FROM users WHERE competition_started = 1 ORDER BY score DESC LIMIT 10");
        $stmt->execute();
        $topUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Prepare the response data
        $response = [
            'status' => 'success',
            'message' => 'Competition data fetched successfully.',
            'joined_count' => $joinedCount,
            'top_10_users' => $topUsers
        ];

        // Return the response as JSON
        echo json_encode($response);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Password is required.']);
}

?>
