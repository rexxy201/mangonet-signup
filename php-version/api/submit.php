<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$data = getPostBody();

$required = ['firstName','lastName','email','phone','address','city','state','plan','wifiSsid','wifiPassword','installationDate'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        jsonError("Field '{$field}' is required");
    }
}

$id = generateUUID();
$db = getDb();

$stmt = $db->prepare("INSERT INTO submissions
    (id, first_name, last_name, email, phone, address, city, state, zip_code, plan,
     wifi_ssid, wifi_password, installation_date, notes, passport_photo, govt_id, proof_of_address, nin, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')");

$stmt->execute([
    $id,
    trim($data['firstName']),
    trim($data['lastName']),
    trim($data['email']),
    trim($data['phone']),
    trim($data['address']),
    trim($data['city']),
    trim($data['state']),
    $data['zipCode'] ?? null,
    $data['plan'],
    trim($data['wifiSsid']),
    $data['wifiPassword'],
    $data['installationDate'],
    $data['notes'] ?? null,
    $data['passportPhoto'] ?? null,
    $data['govtId'] ?? null,
    $data['proofOfAddress'] ?? null,
    $data['nin'] ?? null,
]);

jsonResponse(['id' => $id, 'status' => 'pending']);
