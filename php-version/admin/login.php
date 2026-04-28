<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/auth.php';

if (isAdminLoggedIn()) { header('Location: /admin/'); exit; }

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (adminLogin($_POST['username'] ?? '', $_POST['password'] ?? '')) {
        header('Location: /admin/'); exit;
    }
    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login — MangoNet</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
body{background:#f97316;min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{width:100%;max-width:380px;border:none;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.card-header{background:#f97316;color:white;border-radius:16px 16px 0 0;text-align:center;padding:24px}
.logo{font-size:28px;font-weight:800;letter-spacing:-1px}
</style>
</head>
<body>
<div class="card">
  <div class="card-header">
    <div class="logo">🥭 MangoNet</div>
    <div class="small mt-1 opacity-75">Admin Portal</div>
  </div>
  <div class="card-body p-4">
    <?php if ($error): ?>
      <div class="alert alert-danger py-2 small"><?= htmlspecialchars($error) ?></div>
    <?php endif ?>
    <form method="post">
      <div class="mb-3">
        <label class="form-label small fw-semibold">Username</label>
        <input class="form-control" name="username" autofocus autocomplete="username" required>
      </div>
      <div class="mb-4">
        <label class="form-label small fw-semibold">Password</label>
        <input class="form-control" type="password" name="password" autocomplete="current-password" required>
      </div>
      <button class="btn btn-warning w-100 fw-bold" type="submit">Sign In</button>
    </form>
  </div>
</div>
</body>
</html>
