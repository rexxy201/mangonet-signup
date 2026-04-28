<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/email.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$data = getPostBody();
$id  = $data['id'] ?? '';
$ref = $data['paymentRef'] ?? '';

if (!$id || !$ref) jsonError('id and paymentRef are required');

$db = getDb();
$stmt = $db->prepare("UPDATE submissions SET payment_ref = ?, status = 'paid' WHERE id = ?");
$stmt->execute([$ref, $id]);

if ($stmt->rowCount() === 0) jsonError('Submission not found', 404);

$row = $db->prepare("SELECT * FROM submissions WHERE id = ?");
$row->execute([$id]);
$submission = $row->fetch();

// Send email async (best effort)
try {
    sendSignupEmail($submission);
} catch (Exception $e) {
    error_log("Email failed: " . $e->getMessage());
}

jsonResponse(['success' => true, 'id' => $id]);
