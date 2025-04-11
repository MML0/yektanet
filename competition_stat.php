<?php
header('Content-Type: application/json');


$config = require 'config.php';

$host = $config['database']['host'];
$dbname = $config['database']['dbname'];
$username = $config['database']['username'];
$password = $config['database']['password'];

$adminPassword = $config['admin']['password'];

$jsonFilePath = $config['paths']['json_file'];

// Connect to the database
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Could not connect to the database: " . $e->getMessage());
}



$input = json_decode(file_get_contents('php://input'), true);

// Check if the password and action are provided via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['password'], $input['action'])) {
    $password = $input['password'];
    $action = $input['action'];

    // Verify the password
    if ($password === $adminPassword) {
        // Lock and process the file operations
        $jsonFilePath = 'q.json';
        $file = fopen($jsonFilePath, 'r+');

        if (flock($file, LOCK_EX)) {
            // Read the current data from the JSON file
            $data = json_decode(fread($file, filesize($jsonFilePath)), true);
            if ($action === 'start') {
                // Start the competition: set "competition_started" to true and reset scores
                $data['started'] = true;
                $data['start_time'] = (int) (microtime(true) * 1000) + 10000; // Current time in ms + 20 seconds

                $data['current_question'] =  1; // Default to question 1 if not set
                    
                $data['show_time'] = (int) (microtime(true) * 1000) + 10000;

                // Mark the next question as ready
                $data['is_next_question_ready'] = true;


                // Reset user scores to 0 and update their competition status
                $stmt = $pdo->prepare("UPDATE users SET score = 0");
                $stmt->execute();

                $file = fopen($jsonFilePath, 'w');
                // Move the file pointer to the beginning and save the changes
                fseek($file, 0);
                fwrite($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

                echo json_encode(['status' => 'success', 'message' => 'Competition started, all user scores reset.', 'remain' => 10 ]);
            } elseif ($action === 'reset') {
                // Reset the competition: set "competition_started" to false and reset scores
                $data['started'] = false;
                $data['is_next_question_ready'] = false;
                $data['current_question'] = 1;

                // Reset user scores to 0 and set their competition status to false
                $stmt = $pdo->prepare("UPDATE users SET score = 0, competition_started = FALSE");
                $stmt->execute();
                
                $stmt = $pdo->prepare("TRUNCATE TABLE answers");
                $stmt->execute();
        
                $file = fopen($jsonFilePath, 'w');
                fseek($file, 0);
                fwrite($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

                echo json_encode(['status' => 'success', 'message' => 'Competition reset, all user scores cleared.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid action. Please use "start" or "reset".']);
            }

            // Release the lock and close the file
            flock($file, LOCK_UN);
            fclose($file);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Could not lock the file for writing.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Incorrect password.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Password and action are required.']);
}

?>
