<?php
header('Content-Type: application/json');

$config = require 'config.php';


$jsonFilePath = $config['paths']['json_file'];

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST' ) {

    // Open the q.json file for reading
    $file = fopen($jsonFilePath, 'r');
    
    if ($file) {
        // Read the current data from the JSON file
        $data = json_decode(fread($file, filesize($jsonFilePath)), true);

        // Check if competition has already started
        if ($data['started']) {
            fclose($file);
            echo json_encode([
                'status' => 'success',
                'message' => 'Competition started.',
                'started' => $data['started'],
                'data' => $data,
                'remaining' => max(0, $data['start_time'] - (int) (microtime(true) * 1000)) // Remaining time in ms
            ]);            
            
        } else {
            fclose($file);
            echo json_encode(['status' => 'success', 'message' => 'Competition has not started.','started'=>$data['started']]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Could not open the file.']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}

?>
