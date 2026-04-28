<?php
function getDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host = defined('DB_HOST') ? DB_HOST : 'localhost';
    $name = defined('DB_NAME') ? DB_NAME : '';
    $user = defined('DB_USER') ? DB_USER : '';
    $pass = defined('DB_PASS') ? DB_PASS : '';
    $port = defined('DB_PORT') ? DB_PORT : '3306';

    if (!$name) {
        http_response_code(500);
        die(json_encode(['error' => 'Database not configured. Please run setup/install.php first.']));
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

function getSetting(string $key, string $default = ''): string {
    try {
        $db = getDb();
        $stmt = $db->prepare("SELECT `value` FROM settings WHERE `key` = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ? (string)$row['value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}

function setSetting(string $key, string $value): void {
    $db = getDb();
    $db->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")
       ->execute([$key, $value]);
}
