<?php
/**
 * Participant Registration API Endpoint
 * Innovation Day 2025
 */

require_once '../config/database.php';
require_once '../config/auth.php';

// Set CORS headers
setCORSHeaders();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendErrorResponse('Invalid JSON input');
    }
    
    // Validate required fields
    $username = sanitizeInput($input['username'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $full_name = sanitizeInput($input['full_name'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $team_name = sanitizeInput($input['team_name'] ?? '');
    $category_id = intval($input['category_id'] ?? 0);
    $description = sanitizeInput($input['description'] ?? '');
    
    // Validation
    if (empty($username) || empty($email) || empty($password) || empty($full_name) || empty($team_name) || $category_id <= 0) {
        sendErrorResponse('All required fields must be filled');
    }
    
    if (!isValidEmail($email)) {
        sendErrorResponse('Invalid email format');
    }
    
    if (strlen($password) < 6) {
        sendErrorResponse('Password must be at least 6 characters long');
    }
    
    // Get database connection
    $db = getDBConnection();
    
    // Check if username or email already exists
    $checkQuery = "SELECT id FROM users WHERE username = :username OR email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':username', $username);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->fetch()) {
        sendErrorResponse('Username or email already exists');
    }
    
    // Check if category exists and is active
    $categoryQuery = "SELECT id, name FROM competition_categories WHERE id = :category_id AND is_active = 1";
    $categoryStmt = $db->prepare($categoryQuery);
    $categoryStmt->bindParam(':category_id', $category_id);
    $categoryStmt->execute();
    
    $category = $categoryStmt->fetch();
    if (!$category) {
        sendErrorResponse('Invalid competition category');
    }
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Hash password
        $password_hash = hashPassword($password);
        
        // Insert user
        $userQuery = "INSERT INTO users (username, email, password_hash, full_name, phone, role) 
                      VALUES (:username, :email, :password_hash, :full_name, :phone, 'participant')";
        
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':username', $username);
        $userStmt->bindParam(':email', $email);
        $userStmt->bindParam(':password_hash', $password_hash);
        $userStmt->bindParam(':full_name', $full_name);
        $userStmt->bindParam(':phone', $phone);
        $userStmt->execute();
        
        $user_id = $db->lastInsertId();
        
        // Insert participant
        $participantQuery = "INSERT INTO participants (user_id, team_name, category_id, description) 
                            VALUES (:user_id, :team_name, :category_id, :description)";
        
        $participantStmt = $db->prepare($participantQuery);
        $participantStmt->bindParam(':user_id', $user_id);
        $participantStmt->bindParam(':team_name', $team_name);
        $participantStmt->bindParam(':category_id', $category_id);
        $participantStmt->bindParam(':description', $description);
        $participantStmt->execute();
        
        $participant_id = $db->lastInsertId();
        
        // Commit transaction
        $db->commit();
        
        // Prepare response data
        $responseData = [
            'user_id' => $user_id,
            'participant_id' => $participant_id,
            'username' => $username,
            'email' => $email,
            'full_name' => $full_name,
            'team_name' => $team_name,
            'category' => $category['name'],
            'stage' => 'registration'
        ];
        
        sendSuccessResponse($responseData, 'Registration successful');
        
    } catch (Exception $e) {
        // Rollback transaction
        $db->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    sendErrorResponse('Registration failed. Please try again.', 500);
}
?>
