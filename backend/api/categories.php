<?php
/**
 * Competition Categories API Endpoint
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
    // Get database connection
    $db = getDBConnection();
    
    // Get all active competition categories
    $query = "SELECT id, name, description, max_participants, created_at
              FROM competition_categories 
              WHERE is_active = 1 
              ORDER BY name ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll();
    
    // Get participant count for each category
    foreach ($categories as &$category) {
        $countQuery = "SELECT COUNT(*) as participant_count 
                       FROM participants 
                       WHERE category_id = :category_id AND is_active = 1";
        
        $countStmt = $db->prepare($countQuery);
        $countStmt->bindParam(':category_id', $category['id']);
        $countStmt->execute();
        
        $count = $countStmt->fetch();
        $category['participant_count'] = intval($count['participant_count']);
        
        // Check if category is full
        $category['is_full'] = false;
        if ($category['max_participants'] !== null && $category['participant_count'] >= $category['max_participants']) {
            $category['is_full'] = true;
        }
    }
    
    sendSuccessResponse($categories, 'Categories retrieved successfully');
    
} catch (Exception $e) {
    error_log("Categories error: " . $e->getMessage());
    sendErrorResponse('Failed to retrieve categories', 500);
}
?>
