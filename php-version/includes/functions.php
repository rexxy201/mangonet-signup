<?php
function generateUUID(): string {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function jsonError(string $message, int $code = 400): void {
    jsonResponse(['error' => $message], $code);
}

function sanitize(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function getPostBody(): array {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : $_POST;
}

function formatDate(string $dateStr): string {
    try {
        $date = new DateTime($dateStr);
        return $date->format('l, F j, Y');
    } catch (Exception $e) {
        return $dateStr;
    }
}

function formatDateTime(string $dateStr): string {
    try {
        $date = new DateTime($dateStr);
        return $date->format('M j, Y g:i A');
    } catch (Exception $e) {
        return $dateStr;
    }
}

function statusBadge(string $status): string {
    $map = [
        'pending'  => 'warning',
        'paid'     => 'info',
        'approved' => 'success',
        'rejected' => 'danger',
    ];
    $color = $map[$status] ?? 'secondary';
    return "<span class=\"badge bg-{$color}\">" . ucfirst($status) . "</span>";
}

$PLANS = [
    ['id' => 'basic',        'name' => 'Mango Basic',            'price' => 'NGN 14,067', 'speed' => '25Mbps',  'category' => 'Residential'],
    ['id' => 'plus',         'name' => 'Mango Plus',             'price' => 'NGN 19,929', 'speed' => '40Mbps',  'category' => 'Residential'],
    ['id' => 'premium',      'name' => 'Mango Premium',          'price' => 'NGN 25,790', 'speed' => '60Mbps',  'category' => 'Residential'],
    ['id' => 'premium_plus', 'name' => 'Mango Premium+',         'price' => 'NGN 35,172', 'speed' => '80Mbps',  'category' => 'Residential'],
    ['id' => 'gold',         'name' => 'Mango Gold',             'price' => 'NGN 40,447', 'speed' => '120Mbps', 'category' => 'Residential'],
    ['id' => 'diamond',      'name' => 'Mango Diamond',          'price' => 'NGN 48,362', 'speed' => '165Mbps', 'category' => 'Residential'],
    ['id' => 'platinum',     'name' => 'Mango Platinum',         'price' => 'NGN 58,245', 'speed' => '200Mbps', 'category' => 'Residential'],
    ['id' => 'sme',          'name' => 'Mango SME',              'price' => 'NGN 29,306', 'speed' => '65Mbps',  'category' => 'Corporate'],
    ['id' => 'corp_plus',    'name' => 'Mango Corporate Plus',   'price' => 'NGN 52,751', 'speed' => '100Mbps', 'category' => 'Corporate'],
    ['id' => 'corp_premium', 'name' => 'Mango Corporate Premium','price' => 'NGN 58,613', 'speed' => '140Mbps', 'category' => 'Corporate'],
    ['id' => 'preferred',    'name' => 'Mango Preferred',        'price' => 'NGN 67,404', 'speed' => '200Mbps', 'category' => 'Corporate'],
    ['id' => 'advantage',    'name' => 'Mango Advantage',        'price' => 'NGN 89,648', 'speed' => '250Mbps', 'category' => 'Corporate'],
    ['id' => 'ultimate',     'name' => 'Mango Ultimate',         'price' => 'NGN 107,578','speed' => '350Mbps', 'category' => 'Corporate'],
];

$NIGERIAN_STATES = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
    'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
    'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
    'Taraba','Yobe','Zamfara',
];
