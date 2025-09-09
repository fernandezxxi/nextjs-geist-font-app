<?php
/**
 * Innovation Day 2025 Backend API
 * Main entry point for API routing
 */

// Enable CORS for all requests
header("Access-Control-Allow-Origin: http://localhost:8000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Simple API info endpoint
header('Content-Type: application/json');

$response = [
    'success' => true,
    'message' => 'Innovation Day 2025 API Server',
    'version' => '1.0.0',
    'endpoints' => [
        'POST /api/login.php' => 'User login',
        'POST /api/logout.php' => 'User logout',
        'GET /api/profile.php' => 'Get user profile',
        'POST /api/register-participant.php' => 'Register participant',
        'GET /api/categories.php' => 'Get competition categories'
    ],
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
