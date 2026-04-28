<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/email.php';
requireAdminLogin();

$success = '';
$error   = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'paystack') {
        setSetting('paystack_public_key', trim($_POST['paystack_public_key'] ?? ''));
        setSetting('paystack_secret_key', trim($_POST['paystack_secret_key'] ?? ''));
        $success = 'Paystack keys saved.';

    } elseif ($action === 'smtp') {
        setSetting('smtp_host',     trim($_POST['smtp_host'] ?? ''));
        setSetting('smtp_port',     trim($_POST['smtp_port'] ?? '587'));
        setSetting('smtp_user',     trim($_POST['smtp_user'] ?? ''));
        setSetting('smtp_from',     trim($_POST['smtp_from'] ?? ''));
        setSetting('smtp_secure',   isset($_POST['smtp_secure']) ? 'true' : 'false');
        if (!empty($_POST['smtp_password'])) {
            setSetting('smtp_password', $_POST['smtp_password']);
        }
        $success = 'SMTP settings saved.';

    } elseif ($action === 'notifications') {
        setSetting('notification_emails', trim($_POST['notification_emails'] ?? ''));
        $success = 'Notification emails saved.';

    } elseif ($action === 'password') {
        $current = $_POST['current_password'] ?? '';
        $new     = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';
        if (strlen($new) < 6) {
            $error = 'New password must be at least 6 characters.';
        } elseif ($new !== $confirm) {
            $error = 'Passwords do not match.';
        } else {
            $admin = getAdminUser();
            $db = getDb();
            $stmt = $db->prepare("SELECT password FROM admin_users WHERE id = ?");
            $stmt->execute([$admin['id']]);
            $row = $stmt->fetch();
            if ($row && password_verify($current, $row['password'])) {
                $db->prepare("UPDATE admin_users SET password = ? WHERE id = ?")
                   ->execute([password_hash($new, PASSWORD_BCRYPT), $admin['id']]);
                $success = 'Password changed successfully.';
            } else {
                $error = 'Current password is incorrect.';
            }
        }
    }
}

$admin = getAdminUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Settings — MangoNet Admin</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<style>
body{background:#f8f9fa}
.sidebar{width:220px;min-height:100vh;background:#1a1a2e;position:fixed;top:0;left:0;z-index:100}
.sidebar-brand{padding:20px;color:#f97316;font-weight:800;font-size:20px;border-bottom:1px solid rgba(255,255,255,.1)}
.sidebar a{display:block;padding:12px 20px;color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;transition:.2s}
.sidebar a:hover,.sidebar a.active{background:rgba(249,115,22,.15);color:#f97316}
.main-content{margin-left:220px;padding:24px}
@media(max-width:768px){.sidebar{display:none}.main-content{margin-left:0}}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-brand">🥭 MangoNet</div>
  <nav class="mt-2">
    <a href="/admin/"><i class="bi bi-grid me-2"></i>Dashboard</a>
    <a href="/admin/settings.php" class="active"><i class="bi bi-gear me-2"></i>Settings</a>
    <a href="/admin/logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a>
  </nav>
</div>

<div class="main-content">
  <h4 class="fw-bold mb-4">Settings</h4>

  <?php if ($success): ?>
    <div class="alert alert-success alert-dismissible"><?= htmlspecialchars($success) ?><button class="btn-close" data-bs-dismiss="alert"></button></div>
  <?php endif ?>
  <?php if ($error): ?>
    <div class="alert alert-danger alert-dismissible"><?= htmlspecialchars($error) ?><button class="btn-close" data-bs-dismiss="alert"></button></div>
  <?php endif ?>

  <div class="row g-4">
    <!-- Paystack -->
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-white fw-semibold">Paystack Keys</div>
        <div class="card-body">
          <form method="post">
            <input type="hidden" name="action" value="paystack">
            <div class="mb-3">
              <label class="form-label small">Public Key</label>
              <input class="form-control" name="paystack_public_key" value="<?= htmlspecialchars(getSetting('paystack_public_key')) ?>" placeholder="pk_live_...">
            </div>
            <div class="mb-3">
              <label class="form-label small">Secret Key</label>
              <input class="form-control" type="password" name="paystack_secret_key" placeholder="Leave blank to keep current">
              <?php if (getSetting('paystack_secret_key')): ?><div class="form-text text-success small">✓ Secret key is set</div><?php endif ?>
            </div>
            <button class="btn btn-primary w-100" type="submit">Save Paystack Keys</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-white fw-semibold">Email Notification Recipients</div>
        <div class="card-body">
          <form method="post">
            <input type="hidden" name="action" value="notifications">
            <div class="mb-3">
              <label class="form-label small">Recipient Email(s)</label>
              <input class="form-control" name="notification_emails" value="<?= htmlspecialchars(getSetting('notification_emails')) ?>" placeholder="admin@example.com, team@example.com">
              <div class="form-text">Separate multiple emails with commas</div>
            </div>
            <button class="btn btn-primary w-100" type="submit">Save Recipients</button>
          </form>
        </div>
      </div>
    </div>

    <!-- SMTP -->
    <div class="col-12">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-semibold">SMTP Email Server</div>
        <div class="card-body">
          <form method="post" id="smtpForm">
            <input type="hidden" name="action" value="smtp">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label small">Host</label>
                <input class="form-control" name="smtp_host" id="smtp_host" value="<?= htmlspecialchars(getSetting('smtp_host')) ?>" placeholder="smtp.gmail.com">
              </div>
              <div class="col-md-4">
                <label class="form-label small">Port</label>
                <input class="form-control" name="smtp_port" id="smtp_port" value="<?= htmlspecialchars(getSetting('smtp_port','587')) ?>" placeholder="587">
              </div>
              <div class="col-md-6">
                <label class="form-label small">Username / Email</label>
                <input class="form-control" type="email" name="smtp_user" id="smtp_user" value="<?= htmlspecialchars(getSetting('smtp_user')) ?>" placeholder="you@example.com">
              </div>
              <div class="col-md-6">
                <label class="form-label small">Password / App Password</label>
                <input class="form-control" type="password" name="smtp_password" id="smtp_password" placeholder="Leave blank to keep current">
                <?php if (getSetting('smtp_password')): ?><div class="form-text text-success small">✓ Password is set</div><?php endif ?>
              </div>
              <div class="col-md-8">
                <label class="form-label small">From Address (optional)</label>
                <input class="form-control" name="smtp_from" id="smtp_from" value="<?= htmlspecialchars(getSetting('smtp_from')) ?>" placeholder="MangoNet &lt;noreply@example.com&gt;">
              </div>
              <div class="col-md-4 d-flex align-items-end pb-1">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" name="smtp_secure" id="smtp_secure" <?= getSetting('smtp_secure')==='true'?'checked':'' ?>>
                  <label class="form-check-label small" for="smtp_secure">Use SSL/TLS (port 465)</label>
                </div>
              </div>
              <div class="col-12" id="smtpTestResult"></div>
              <div class="col-12 d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary" onclick="testSmtp()">Test Connection</button>
                <button class="btn btn-primary" type="submit">Save SMTP Settings</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="col-md-6">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-semibold">Change Admin Password</div>
        <div class="card-body">
          <form method="post">
            <input type="hidden" name="action" value="password">
            <div class="mb-3">
              <label class="form-label small">Current Password</label>
              <input class="form-control" type="password" name="current_password" required>
            </div>
            <div class="mb-3">
              <label class="form-label small">New Password</label>
              <input class="form-control" type="password" name="new_password" required minlength="6">
            </div>
            <div class="mb-3">
              <label class="form-label small">Confirm New Password</label>
              <input class="form-control" type="password" name="confirm_password" required>
            </div>
            <button class="btn btn-warning w-100" type="submit">Change Password</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
async function testSmtp() {
  const el = document.getElementById('smtpTestResult');
  el.innerHTML = '<div class="text-muted small">Testing connection...</div>';
  const payload = {
    host: document.getElementById('smtp_host').value,
    port: parseInt(document.getElementById('smtp_port').value)||587,
    user: document.getElementById('smtp_user').value,
    password: document.getElementById('smtp_password').value,
    from: document.getElementById('smtp_from').value,
    secure: document.getElementById('smtp_secure').checked,
  };
  try {
    const res = await fetch('/api/test-smtp.php', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    el.innerHTML = data.success
      ? '<div class="alert alert-success py-2 small">✓ ' + data.message + '</div>'
      : '<div class="alert alert-danger py-2 small">✗ ' + data.message + '</div>';
  } catch(e) {
    el.innerHTML = '<div class="alert alert-danger py-2 small">Network error</div>';
  }
}
</script>
</body>
</html>
