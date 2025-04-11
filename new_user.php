<?php
header('Content-Type: application/json');
$config = require 'config.php';

$host = $config['database']['host'];
$dbname = $config['database']['dbname'];
$username = $config['database']['username'];
$password = $config['database']['password'];

$adminPassword = $config['admin']['password'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read and decode JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    $first_name = trim($input['first_name'] ?? '');
    $last_name = trim($input['last_name'] ?? '');
    $phone = trim($input['phone'] ?? '');


    $password_u = $input['password'];
    if( isset($input['password'])){
        $password_u = $input['password'];

    }else {
        echo json_encode(['status' => 'error', 'message' => ' password ??????.']);
        exit;
    }
    if ($password_u === $adminPassword) {
        $r = 1;
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid password.']);
        exit;
    }

    if (empty($phone)) {
        die('Invalid phone number.');
    }

    // Prepare SQL and execute
    $sql = "INSERT INTO users (first_name, last_name, phone) VALUES (:first_name, :last_name, :phone)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':first_name' => $first_name,
        ':last_name' => $last_name,
        ':phone' => $phone
    ]);

    echo json_encode(['status' => 'success', 'message' => 'User registered successfully!']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
