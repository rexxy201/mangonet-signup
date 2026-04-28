<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdminLogin();

$admin = getAdminUser();
$db = getDb();

$statusFilter = $_GET['status'] ?? '';
$search       = $_GET['search'] ?? '';

$sql = "SELECT id, first_name, last_name, email, phone, city, state, plan, status, payment_ref, submitted_at
        FROM submissions WHERE 1=1";
$params = [];
if ($statusFilter) { $sql .= " AND status = ?"; $params[] = $statusFilter; }
if ($search) {
    $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
    $s = "%{$search}%"; $params = array_merge($params, [$s,$s,$s,$s]);
}
$sql .= " ORDER BY submitted_at DESC";
$stmt = $db->prepare($sql);
$stmt->execute($params);
$submissions = $stmt->fetchAll();

$counts = $db->query("SELECT status, COUNT(*) as cnt FROM submissions GROUP BY status")->fetchAll();
$countMap = [];
foreach ($counts as $c) $countMap[$c['status']] = $c['cnt'];
$total = array_sum(array_column($counts, 'cnt'));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Dashboard — MangoNet</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<style>
body{background:#f8f9fa}
.sidebar{width:220px;min-height:100vh;background:#1a1a2e;position:fixed;top:0;left:0;z-index:100;padding:0}
.sidebar-brand{padding:20px;color:#f97316;font-weight:800;font-size:20px;border-bottom:1px solid rgba(255,255,255,.1)}
.sidebar a{display:block;padding:12px 20px;color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;transition:.2s}
.sidebar a:hover,.sidebar a.active{background:rgba(249,115,22,.15);color:#f97316}
.main-content{margin-left:220px;padding:24px}
.stat-card{border:none;border-radius:12px;transition:.2s}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.1)}
.badge-status-pending{background:#fef3c7;color:#92400e}
.badge-status-paid{background:#dbeafe;color:#1e40af}
.badge-status-approved{background:#dcfce7;color:#166534}
.badge-status-rejected{background:#fee2e2;color:#991b1b}
.table-hover tbody tr:hover{background:#fff7ed;cursor:pointer}
@media(max-width:768px){.sidebar{display:none}.main-content{margin-left:0}}
</style>
</head>
<body>

<div class="sidebar">
  <div class="sidebar-brand">🥭 MangoNet</div>
  <nav class="mt-2">
    <a href="/admin/" class="active"><i class="bi bi-grid me-2"></i>Dashboard</a>
    <a href="/admin/settings.php"><i class="bi bi-gear me-2"></i>Settings</a>
    <a href="/" target="_blank"><i class="bi bi-box-arrow-up-right me-2"></i>Signup Form</a>
    <a href="/admin/logout.php" class="mt-auto"><i class="bi bi-box-arrow-right me-2"></i>Logout</a>
  </nav>
  <div style="position:absolute;bottom:16px;left:0;right:0;padding:0 20px">
    <div class="small text-white-50">Logged in as</div>
    <div class="small text-white fw-semibold"><?= htmlspecialchars($admin['username']) ?></div>
  </div>
</div>

<div class="main-content">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="mb-0 fw-bold">Dashboard</h4>
      <small class="text-muted">Manage customer signups</small>
    </div>
  </div>

  <!-- Stats -->
  <div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
      <div class="card stat-card p-3">
        <div class="small text-muted">Total</div>
        <div class="fs-3 fw-bold"><?= $total ?></div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card stat-card p-3" style="border-left:4px solid #f59e0b!important">
        <div class="small text-muted">Pending</div>
        <div class="fs-3 fw-bold text-warning"><?= $countMap['pending'] ?? 0 ?></div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card stat-card p-3" style="border-left:4px solid #22c55e!important">
        <div class="small text-muted">Approved</div>
        <div class="fs-3 fw-bold text-success"><?= $countMap['approved'] ?? 0 ?></div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card stat-card p-3" style="border-left:4px solid #3b82f6!important">
        <div class="small text-muted">Paid</div>
        <div class="fs-3 fw-bold text-primary"><?= $countMap['paid'] ?? 0 ?></div>
      </div>
    </div>
  </div>

  <!-- Filters -->
  <div class="card border-0 shadow-sm mb-3">
    <div class="card-body py-2">
      <form method="get" class="row g-2 align-items-center">
        <div class="col-md-5">
          <input class="form-control form-control-sm" name="search" placeholder="Search name, email, phone..." value="<?= htmlspecialchars($search) ?>">
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm" name="status" onchange="this.form.submit()">
            <option value="">All Statuses</option>
            <?php foreach (['pending','paid','approved','rejected'] as $s): ?>
              <option value="<?= $s ?>" <?= $statusFilter===$s?'selected':'' ?>><?= ucfirst($s) ?></option>
            <?php endforeach ?>
          </select>
        </div>
        <div class="col-auto">
          <button class="btn btn-sm btn-primary" type="submit"><i class="bi bi-search"></i> Search</button>
          <?php if ($search||$statusFilter): ?><a href="/admin/" class="btn btn-sm btn-outline-secondary ms-1">Clear</a><?php endif ?>
        </div>
      </form>
    </div>
  </div>

  <!-- Table -->
  <div class="card border-0 shadow-sm">
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th class="small">Name</th>
            <th class="small">Email</th>
            <th class="small">Plan</th>
            <th class="small">Location</th>
            <th class="small">Status</th>
            <th class="small">Date</th>
            <th class="small"></th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($submissions)): ?>
            <tr><td colspan="7" class="text-center py-5 text-muted">No submissions found</td></tr>
          <?php else: ?>
            <?php foreach ($submissions as $s): ?>
            <tr onclick="window.location='/admin/submission.php?id=<?= $s['id'] ?>'" style="cursor:pointer">
              <td class="fw-semibold"><?= htmlspecialchars($s['first_name'] . ' ' . $s['last_name']) ?></td>
              <td class="text-muted small"><?= htmlspecialchars($s['email']) ?></td>
              <td class="small"><?= htmlspecialchars($s['plan']) ?></td>
              <td class="small text-muted"><?= htmlspecialchars($s['city'] . ', ' . $s['state']) ?></td>
              <td><?= statusBadge($s['status']) ?></td>
              <td class="small text-muted"><?= formatDateTime($s['submitted_at']) ?></td>
              <td><a href="/admin/submission.php?id=<?= $s['id'] ?>" class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation()">View</a></td>
            </tr>
            <?php endforeach ?>
          <?php endif ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
