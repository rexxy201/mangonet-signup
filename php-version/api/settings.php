<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');
requireAdminLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $key = $_GET['key'] ?? '';
    if (!$key) jsonError('key is required');
    jsonResponse(['value' => getSetting($key)]);
}

if ($method === 'POST') {
    $data = getPostBody();
    $settings = $data['settings'] ?? [];
    if (!is_array($settings)) jsonError('settings must be an object');
    foreach ($settings as $key => $value) {
        setSetting($key, (string)$value);
    }
    jsonResponse(['success' => true]);
}

jsonError('Method not allowed', 405);
