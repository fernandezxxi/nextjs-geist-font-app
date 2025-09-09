<?php
/**
 * User Login API Endpoint
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
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        sendErrorResponse('Username and password are required');
    }
    
    // Get database connection
    $db = getDBConnection();
    
    // Find user by username or email
    $query = "SELECT id, username, email, password_hash, full_name, role, judge_category, is_active 
              FROM users 
              WHERE (username = :username OR email = :username) AND is_active = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        sendErrorResponse('Invalid credentials', 401);
    }
    
    // Verify password
    if (!verifyPassword($password, $user['password_hash'])) {
        sendErrorResponse('Invalid credentials', 401);
    }
    
    // Set user session
    setUserSession($user);
    
    // Generate CSRF token
    $csrf_token = generateCSRFToken();
    
    // Prepare response data (exclude sensitive information)
    $responseData = [
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'judge_category' => $user['judge_category']
        ],
        'csrf_token' => $csrf_token
    ];
    
    sendSuccessResponse($responseData, 'Login successful');
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendErrorResponse('Login failed. Please try again.', 500);
}
?>
