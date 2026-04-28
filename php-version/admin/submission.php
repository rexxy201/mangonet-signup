<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
requireAdminLogin();

$id = $_GET['id'] ?? '';
if (!$id) { header('Location: /admin/'); exit; }

$db = getDb();
$stmt = $db->prepare("SELECT * FROM submissions WHERE id = ?");
$stmt->execute([$id]);
$s = $stmt->fetch();
if (!$s) { header('Location: /admin/'); exit; }

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newStatus = $_POST['status'] ?? '';
    $allowed = ['pending','paid','approved','rejected'];
    if (in_array($newStatus, $allowed)) {
        $db->prepare("UPDATE submissions SET status = ? WHERE id = ?")->execute([$newStatus, $id]);
        header("Location: /admin/submission.php?id={$id}&updated=1"); exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Submission — <?= htmlspecialchars($s['first_name'].' '.$s['last_name']) ?></title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<style>
body{background:#f8f9fa}
.sidebar{width:220px;min-height:100vh;background:#1a1a2e;position:fixed;top:0;left:0;z-index:100}
.sidebar-brand{padding:20px;color:#f97316;font-weight:800;font-size:20px;border-bottom:1px solid rgba(255,255,255,.1)}
.sidebar a{display:block;padding:12px 20px;color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;transition:.2s}
.sidebar a:hover{background:rgba(249,115,22,.15);color:#f97316}
.main-content{margin-left:220px;padding:24px}
.doc-img{width:100%;max-height:260px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb;background:#f9f9f9;cursor:pointer}
@media(max-width:768px){.sidebar{display:none}.main-content{margin-left:0}}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-brand">🥭 MangoNet</div>
  <nav class="mt-2">
    <a href="/admin/"><i class="bi bi-grid me-2"></i>Dashboard</a>
    <a href="/admin/settings.php"><i class="bi bi-gear me-2"></i>Settings</a>
    <a href="/admin/logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a>
  </nav>
</div>

<div class="main-content">
  <div class="mb-3">
    <a href="/admin/" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Back to Dashboard</a>
  </div>

  <?php if (isset($_GET['updated'])): ?>
    <div class="alert alert-success alert-dismissible">Status updated successfully. <button class="btn-close" data-bs-dismiss="alert"></button></div>
  <?php endif ?>

  <div class="row g-3">
    <!-- Left: Details -->
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0 fw-bold"><?= htmlspecialchars($s['first_name'].' '.$s['last_name']) ?></h5>
            <small class="text-muted">Submitted <?= formatDateTime($s['submitted_at']) ?></small>
          </div>
          <?= statusBadge($s['status']) ?>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="small text-muted">Email</div>
              <div><?= htmlspecialchars($s['email']) ?></div>
            </div>
            <div class="col-md-6">
              <div class="small text-muted">Phone</div>
              <div><?= htmlspecialchars($s['phone']) ?></div>
            </div>
            <div class="col-md-6">
              <div class="small text-muted">Address</div>
              <div><?= htmlspecialchars($s['address'] . ', ' . $s['city'] . ', ' . $s['state']) ?></div>
            </div>
            <?php if ($s['zip_code']): ?>
            <div class="col-md-3">
              <div class="small text-muted">Zip Code</div>
              <div><?= htmlspecialchars($s['zip_code']) ?></div>
            </div>
            <?php endif ?>
            <?php if ($s['nin']): ?>
            <div class="col-md-3">
              <div class="small text-muted">NIN</div>
              <div><?= htmlspecialchars($s['nin']) ?></div>
            </div>
            <?php endif ?>
          </div>
          <hr>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="small text-muted">Plan</div>
              <div class="fw-semibold"><?= htmlspecialchars($s['plan']) ?></div>
            </div>
            <div class="col-md-4">
              <div class="small text-muted">WiFi SSID</div>
              <div class="font-monospace"><?= htmlspecialchars($s['wifi_ssid']) ?></div>
            </div>
            <div class="col-md-4">
              <div class="small text-muted">WiFi Password</div>
              <div class="font-monospace"><?= htmlspecialchars($s['wifi_password']) ?></div>
            </div>
            <div class="col-md-4">
              <div class="small text-muted">Installation Date</div>
              <div class="fw-semibold"><?= formatDate($s['installation_date']) ?></div>
            </div>
            <?php if ($s['payment_ref']): ?>
            <div class="col-md-4">
              <div class="small text-muted">Payment Ref</div>
              <div class="font-monospace small"><?= htmlspecialchars($s['payment_ref']) ?></div>
            </div>
            <?php endif ?>
            <?php if ($s['notes']): ?>
            <div class="col-12">
              <div class="small text-muted">Notes</div>
              <div class="fst-italic"><?= htmlspecialchars($s['notes']) ?></div>
            </div>
            <?php endif ?>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-semibold">Documents</div>
        <div class="card-body">
          <div class="row g-3">
            <?php
            $docs = [
                'passport_photo'   => 'Passport Photo',
                'govt_id'          => 'Government ID',
                'proof_of_address' => 'Proof of Address',
            ];
            foreach ($docs as $col => $label):
                $data = $s[$col] ?? '';
            ?>
            <div class="col-md-4">
              <div class="small text-muted mb-1"><?= $label ?></div>
              <?php if ($data): ?>
                <img src="<?= $data ?>" class="doc-img" alt="<?= $label ?>" onclick="openImg(this.src,'<?= $label ?>')">
                <div class="mt-1 d-flex gap-1">
                  <a href="<?= $data ?>" target="_blank" class="btn btn-outline-primary btn-sm w-50">View</a>
                  <a href="<?= $data ?>" download="<?= str_replace(' ','-',strtolower($label)) ?>.jpg" class="btn btn-outline-secondary btn-sm w-50">Save</a>
                </div>
              <?php else: ?>
                <div class="text-center py-4 text-muted border rounded small bg-light">No file uploaded</div>
              <?php endif ?>
            </div>
            <?php endforeach ?>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-semibold">Update Status</div>
        <div class="card-body">
          <form method="post">
            <div class="d-grid gap-2">
              <button name="status" value="approved" class="btn btn-success" <?= $s['status']==='approved'?'disabled':'' ?>>
                <i class="bi bi-check-circle me-1"></i> Approve
              </button>
              <button name="status" value="rejected" class="btn btn-danger" <?= $s['status']==='rejected'?'disabled':'' ?>>
                <i class="bi bi-x-circle me-1"></i> Reject
              </button>
              <button name="status" value="pending" class="btn btn-outline-warning" <?= $s['status']==='pending'?'disabled':'' ?>>
                <i class="bi bi-clock me-1"></i> Set Pending
              </button>
              <button name="status" value="paid" class="btn btn-outline-info" <?= $s['status']==='paid'?'disabled':'' ?>>
                <i class="bi bi-credit-card me-1"></i> Mark Paid
              </button>
            </div>
          </form>
          <hr>
          <div class="small text-muted">Submission ID</div>
          <div class="small font-monospace text-break"><?= htmlspecialchars($s['id']) ?></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Image Modal -->
<div class="modal fade" id="imgModal" tabindex="-1">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header"><h6 class="modal-title" id="imgModalLabel"></h6>
        <button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="modal-body text-center">
        <img id="imgModalSrc" src="" style="max-width:100%;max-height:70vh;object-fit:contain">
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
function openImg(src, label) {
  document.getElementById('imgModalSrc').src = src;
  document.getElementById('imgModalLabel').textContent = label;
  new bootstrap.Modal(document.getElementById('imgModal')).show();
}
</script>
</body>
</html>
