<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');
requireAdminLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$data = getPostBody();
$id     = $data['id'] ?? '';
$status = $data['status'] ?? '';
$allowed = ['pending', 'paid', 'approved', 'rejected'];

if (!$id || !in_array($status, $allowed)) jsonError('Invalid id or status');

$db = getDb();
$db->prepare("UPDATE submissions SET status = ? WHERE id = ?")->execute([$status, $id]);
jsonResponse(['success' => true]);
