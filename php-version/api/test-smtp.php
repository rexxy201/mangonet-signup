<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/email.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');
requireAdminLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$data = getPostBody();
$host   = trim($data['host'] ?? '');
$port   = (int)($data['port'] ?? 587);
$user   = trim($data['user'] ?? '');
$pass   = $data['password'] ?? '';
$from   = trim($data['from'] ?? '');
$secure = filter_var($data['secure'] ?? false, FILTER_VALIDATE_BOOLEAN);

if (!$host || !$user || !$pass) jsonError('Host, user and password are required');

$mailer = new MangoMailer($host, $port, $user, $pass, $secure, $from);
$result = $mailer->testConnection();
jsonResponse($result);
