<?php
function startAdminSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function isAdminLoggedIn(): bool {
    startAdminSession();
    return !empty($_SESSION['admin_id']);
}

function requireAdminLogin(): void {
    if (!isAdminLoggedIn()) {
        header('Location: /admin/login.php');
        exit;
    }
}

function adminLogin(string $username, string $password): bool {
    require_once __DIR__ . '/db.php';
    try {
        $db = getDb();
        $stmt = $db->prepare("SELECT id, password, role FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password'])) {
            startAdminSession();
            $_SESSION['admin_id']   = $user['id'];
            $_SESSION['admin_user'] = $username;
            $_SESSION['admin_role'] = $user['role'] ?? 'admin';
            return true;
        }
    } catch (Exception $e) {}
    return false;
}

function adminLogout(): void {
    startAdminSession();
    session_destroy();
}

function getAdminUser(): array {
    startAdminSession();
    return [
        'id'       => $_SESSION['admin_id']   ?? '',
        'username' => $_SESSION['admin_user'] ?? '',
        'role'     => $_SESSION['admin_role'] ?? 'admin',
    ];
}
