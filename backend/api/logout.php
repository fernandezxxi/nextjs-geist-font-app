<?php
/**
 * User Logout API Endpoint
 * Innovation Day 2025
 */

require_once '../config/auth.php';

// Set CORS headers
setCORSHeaders();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendErrorResponse('Method not allowed', 405);
}

try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        sendErrorResponse('Not authenticated', 401);
    }
    
    // Clear user session
    clearUserSession();
    
    sendSuccessResponse([], 'Logout successful');
    
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    sendErrorResponse('Logout failed. Please try again.', 500);
}
?>
