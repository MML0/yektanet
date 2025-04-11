<?php
//session_start();
header('Content-Type: application/json');

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

$input = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['phone'])    && isset($input['i']) ) {
  

    // Assuming the input contains the user_id and the int number 'i'
    $userId = $input['phone'];
    $i = $input['i']; // The integer i between 1 and 20

    // Ensure that i is between 1 and 20
    if ($i >= 1 && $i <= 20) {
        // Create the avatar path
        $avatarPath = "/noghte/user/resource/avatar_" . $i . ".png";

        // Prepare the SQL query to update the avatar
        $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE phone = ?");
        $stmt->execute([$avatarPath, $userId]);

        // Return success response
        echo json_encode(['status' => 'success', 'message' => 'Avatar updated successfully.']);
    } else {
        // Return error if 'i' is out of range
        echo json_encode(['status' => 'error', 'message' => 'Invalid avatar number. Please choose a number between 1 and 20.']);
    }
}else{
    echo json_encode(['status' => 'error', 'message' => 'I']);

}
?>
