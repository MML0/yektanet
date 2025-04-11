<?php
header('Content-Type: application/json');

$config = require 'config.php';

$host = $config['database']['host'];
$dbname = $config['database']['dbname'];
$username = $config['database']['username'];
$password = $config['database']['password'];

$adminPassword = $config['admin']['password'];

$jsonFilePath = $config['paths']['json_file'];

$input = json_decode(file_get_contents('php://input'), true);

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST'&& isset($input['action']) ) {
    

    $action = $input['action'];
    
    if ($action === 'get_next_question') {
        //$phone = $input['phone'];


        $file = fopen($jsonFilePath, 'r');
        if ($file) {
            $data = json_decode(fread($file, filesize($jsonFilePath)), true);
            fclose($file);
            
            // Check if is next question ready
            if( isset($input['question_id'])){
                $questionId = $input['question_id'];
                if ($questionId === 11){
                    if( isset($input['phone'])){
                        try {
                            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
                            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                        } catch (PDOException $e) {
                            echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready and competion is over.'. $e->getMessage(),'is_next_question_ready'=>false,'started'=>false,'ended'=>true]);
                            exit;
                        }
                
                        $phone = $input['phone']; 
                        
                        $query = "
                            WITH RankedUsers AS (
                                SELECT id, first_name, last_name, phone, score, avatar, uuid,
                                    RANK() OVER (ORDER BY score DESC) AS `rank`
                                FROM users
                            )
                            SELECT `rank`, score 
                            FROM RankedUsers
                            WHERE phone = ?
                        ";

                        $stmt = $pdo->prepare($query);
                        $stmt->execute([$phone]);
                        $user = $stmt->fetch(PDO::FETCH_ASSOC);

                        if ($user) {
                            echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready and competion is over.','is_next_question_ready'=>false,'started'=>false,'ended'=>true,
                            'rank' => $user['rank'],
                            'score' => $user['score']
                        ]);
                            exit;
                        } else {
                            echo json_encode(['status' => 'error', 'message' => 'User not found']);
                        }
                       
    
                    }else{
                        echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready and competion is over.','is_next_question_ready'=>false,'started'=>false,'ended'=>true]);
                        exit;
                    }
                }

                // if user want current q +1 means he should wait
                if ($questionId === $data['current_question']+1){
                    echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready.','is_next_question_ready'=>false,'started'=>false]);
                    exit;
                }
            }else{
                $questionId = $data['current_question'];
                if (((int)(microtime(true)*1000)-$data['show_time'])>15000 && (int)$data['current_question'] === 10) {
                    echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready you are late !!! game is over','is_next_question_ready'=>false,'started'=>true,'ended'=>true]);
                    exit;
                }

            }

            if(($data['show_time'] - (int) (microtime(true) * 1000))<-500){
                echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready you are late !!!','is_next_question_ready'=>false,'started'=>$data['started']]);
                exit;
            }

            if ($data['is_next_question_ready'] && (int)$questionId <=  (int)$data['current_question']) {
                echo json_encode([
                    'status' => 'success',
                    'started'=>true,
                    'message' => 'next question is ready.',
                    'is_next_question_ready' => $data['is_next_question_ready'],
                    'data' => $data['q'. $data['current_question']],
                    'current_question' => $data['current_question'],
                    'remaining' => max(0, $data['show_time'] - (int) (microtime(true) * 1000)) // Remaining time in ms
                ]);            
                
            } else {
                echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready.','is_next_question_ready'=>false]);
            }

        }else {
            echo json_encode(['status' => 'error', 'message' => 'Could not open the file.']);
        }

        
    } 

    if ($action === 'answer') {
        
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Could not connect to the database: " . $e->getMessage());
        }

        $phone = $input['phone']; 
        $questionId = $input['question_id'];
        $answer = $input['answer'];
        $remained_time = $input['remained_time'];
    
        $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$user) {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
            exit;
        }
    
        $userId = $user['id'];
    
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM answers WHERE user_id = ? AND question_id = ?");
        $stmt->execute([$userId, $questionId]);
        $alreadyAnswered = $stmt->fetchColumn();
        
        if ($alreadyAnswered > 0) {
            echo json_encode(['status' => 'error', 'message' => 'You have already answered this question.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM answers WHERE correct = ? AND question_id = ?");
        $stmt->execute([1, $questionId]);
        $count_answers = $stmt->fetchColumn();
        

        $file = fopen($jsonFilePath, 'r');
        if ($file) {
            $data = json_decode(fread($file, filesize($jsonFilePath)), true);
            fclose($file);
            $key = "q" . $questionId; // Map numeric ID to JSON key (e.g., '1' -> 'q1')
            $correct_answer = $data[$key]['correct'];
            if(( (int) (microtime(true) * 1000)-$data['show_time'] )>17000){
                echo json_encode(['status' => 'success', 'message' => 'next question is NOT ready you are late !!!','is_next_question_ready'=>false,'started'=>$data['started']]);
                exit;
            }
            if($questionId!=$data['current_question']){
                echo json_encode(['status' => 'success', 'message' => 'you are late !!!','is_next_question_ready'=>false,'started'=>$data['started']]);
                exit;
            }
            if (strtolower(trim("a" . $answer)) === strtolower(trim($correct_answer))) {
                $scoreToAdd = 80 + $remained_time; // Calculate score based on the formula
                $score_to_add = 1000 - (int)(( (int) (microtime(true) * 1000)-$data['show_time'])/50);
                $is_your_answer_corect = true;
                $is_your_answer_corect_num = 1;
            }else{
                $score_to_add = 0;
                $scoreToAdd = 0; // If the answer is incorrect, add 0 to the
                $is_your_answer_corect = false;
                $is_your_answer_corect_num = 0;
            }
                
            $logString = "score_to_add: $score_to_add, timestamp: " . microtime(true) . ", show_time: " . $data['show_time'] . ", remained_time: $remained_time";

            $stmt = $pdo->prepare("INSERT INTO answers (user_id, correct, question_id, answer) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $is_your_answer_corect_num, $questionId, $answer.' data '.$logString]);
        
            $stmt = $pdo->prepare("UPDATE users SET score = score + ? WHERE id = ?");
            $stmt->execute([$score_to_add, $userId]);
        
            // Optional: Log the score update or fetch the updated score
            $stmt = $pdo->prepare("SELECT score FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $updatedScore = $stmt->fetch(PDO::FETCH_ASSOC)['score'];
        
            echo json_encode([
                'status' => 'success',
                'message' => 'Answer submitted and score updated successfully.',
                'correct_answer' => $correct_answer,  
                'your_answer' => $answer,
                'is_your_answer_corect' => $is_your_answer_corect,
                'updated_score' => $updatedScore,
                'pass' => (int) (microtime(true) * 1000) - $data['show_time'],
                'cor' => $count_answers,
                'explanation' => $data[$key]['explanation']
            ]);
        
            
        }else {
            echo json_encode(['status' => 'error', 'message' => 'Could not open the file.']);
            exit;
        }

    }

    if ($action === 'no_answer') {
        
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


            $phone = $input['phone']; // User's unique phone number
            $questionId = $input['question_id'];
        
            $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
            $stmt->execute([$phone]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
            if (!$user) {
                echo json_encode(['status' => 'error', 'message' => 'User not found.']);
                exit;
            }
        
            $userId = $user['id'];
        
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM answers WHERE user_id = ? AND question_id = ?");
            $stmt->execute([$userId, $questionId]);
            $alreadyAnswered = $stmt->fetchColumn();
            
            if ($alreadyAnswered > 0) {
                echo json_encode(['status' => 'error', 'message' => 'You have already answered this question.']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO answers (user_id, question_id,correct, answer) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $questionId,false ,'no answer']);
            
            $file = fopen($jsonFilePath, 'r');
            if ($file) {
                $data = json_decode(fread($file, filesize($jsonFilePath)), true);
                fclose($file);
                $key = "q" . $questionId; // Map numeric ID to JSON key (e.g., '1' -> 'q1')
                $correct_answer = $data[$key]['correct'];
                
                try{
                    // Optional: Log the score update or fetch the updated score
                    $stmt = $pdo->prepare("SELECT score FROM users WHERE id = ?");
                    $stmt->execute([$userId]);
                    $updatedScore = $stmt->fetch(PDO::FETCH_ASSOC)['score'];
                } catch (PDOException $e){
                    $updatedScore = "";
                }

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Answer submitted and score updated successfully.',
                    'correct_answer' => $correct_answer, 
                    'updated_score' => $updatedScore
                ]);
            
            }else {
                echo json_encode(['status' => 'error', 'message' => 'Could not open the file.']);
                exit;
            }
        } catch (PDOException $e) {
        die("Could not connect to the database: ");
    }
    }


    if ($action === 'next_question') {
        if( isset($input['password'])){
            $password_u = $input['password'];
            if ($password_u === $adminPassword) {
                // Lock and process the file operations
                $file = fopen($jsonFilePath, 'r+');
        
                if (flock($file, LOCK_EX)) {
                    // Read the current data from the JSON file
                    $data = json_decode(fread($file, filesize($jsonFilePath)), true);
                    if ($data['current_question'] === 10){
                        echo json_encode(['status' => 'error', 'message' => 'competion is over.']);
                        exit;
                    }
                
                    // Increment the current question
                    $data['current_question'] = isset($data['current_question']) ? $data['current_question'] + 1  : 1; // Default to question 1 if not set
                    
                    // Set the show time for the next question (20 seconds from now)
                    $data['show_time'] = (int) (microtime(true) * 1000) + 10000;

                    // Mark the next question as ready
                    $data['is_next_question_ready'] = true;

                    
                    ftruncate($file, 0); 
                    rewind($file); 
                    fwrite($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                    fflush($file); // Flush the output buffer
                    flock($file, LOCK_UN); // Unlock the file

                    echo json_encode(['status' => 'success', 'message' => 'Next question is ready.', 'remain' => 10,'current'=>$data['current_question'] ]);    
                    fclose($file);
                    exit;

                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Could not lock the file.']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid password.']);
                exit;
            }
        }else {
            echo json_encode(['status' => 'error', 'message' => ' password ??????.']);
        }
    }
      
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method or mised action.']);
}

?>
