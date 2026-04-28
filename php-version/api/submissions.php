<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

header('Content-Type: application/json');
requireAdminLogin();

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? '';

if ($method === 'GET') {
    $db = getDb();
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM submissions WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) jsonError('Not found', 404);
        jsonResponse($row);
    } else {
        $status = $_GET['status'] ?? '';
        $search = $_GET['search'] ?? '';
        $sql = "SELECT id, first_name, last_name, email, phone, city, state, plan, status, payment_ref, submitted_at FROM submissions WHERE 1=1";
        $params = [];
        if ($status) { $sql .= " AND status = ?"; $params[] = $status; }
        if ($search) { $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
            $s = "%{$search}%"; $params = array_merge($params, [$s,$s,$s,$s]); }
        $sql .= " ORDER BY submitted_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        jsonResponse($stmt->fetchAll());
    }
}

jsonError('Method not allowed', 405);
