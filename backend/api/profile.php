<?php
/**
 * User Profile API Endpoint
 * Innovation Day 2025
 */

require_once '../config/database.php';
require_once '../config/auth.php';

// Set CORS headers
setCORSHeaders();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Require authentication
    requireAuth();
    
    // Get current user data
    $currentUser = getCurrentUser();
    
    if (!$currentUser) {
        sendErrorResponse('User not found', 404);
    }
    
    // Get database connection for additional user info
    $db = getDBConnection();
    
    // Get user details with additional information
    $query = "SELECT u.id, u.username, u.email, u.full_name, u.phone, u.role, u.judge_category, u.created_at,
                     jc.name as judge_category_name, jc.weight_multiplier
              FROM users u
              LEFT JOIN judge_categories jc ON u.judge_category = jc.name
              WHERE u.id = :user_id AND u.is_active = 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $currentUser['id']);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        sendErrorResponse('User not found', 404);
    }
    
    // If user is a participant, get participant info
    $participantInfo = null;
    if ($user['role'] === 'participant') {
        $participantQuery = "SELECT p.id, p.team_name, p.stage, p.registration_date, p.description,
                                   cc.name as category_name, cc.description as category_description
                            FROM participants p
                            JOIN competition_categories cc ON p.category_id = cc.id
                            WHERE p.user_id = :user_id AND p.is_active = 1";
        
        $participantStmt = $db->prepare($participantQuery);
        $participantStmt->bindParam(':user_id', $user['id']);
        $participantStmt->execute();
        
        $participantInfo = $participantStmt->fetch();
    }
    
    // Prepare response data
    $responseData = [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'phone' => $user['phone'],
        'role' => $user['role'],
        'judge_category' => $user['judge_category'],
        'judge_category_name' => $user['judge_category_name'],
        'judge_weight' => $user['weight_multiplier'],
        'created_at' => $user['created_at'],
        'participant_info' => $participantInfo
    ];
    
    sendSuccessResponse($responseData, 'Profile retrieved successfully');
    
} catch (Exception $e) {
    error_log("Profile error: " . $e->getMessage());
    sendErrorResponse('Failed to retrieve profile', 500);
}
?>
