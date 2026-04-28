<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$id = $_GET['id'] ?? '';
$submission = null;
if ($id) {
    $db = getDb();
    $stmt = $db->prepare("SELECT first_name, last_name, email, plan, installation_date, payment_ref FROM submissions WHERE id = ?");
    $stmt->execute([$id]);
    $submission = $stmt->fetch();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Application Submitted — MangoNet</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<style>
body{background:#f8f9fa;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
.success-icon{width:80px;height:80px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
</style>
</head>
<body>
<div class="card border-0 shadow text-center p-4 p-md-5" style="max-width:480px;width:100%;margin:20px">
  <div class="success-icon"><i class="bi bi-check-lg text-success" style="font-size:36px"></i></div>
  <h4 class="fw-bold">Application Submitted!</h4>
  <?php if ($submission): ?>
  <p class="text-muted">Thank you, <strong><?= htmlspecialchars($submission['first_name'] . ' ' . $submission['last_name']) ?></strong>!<br>
  Your signup for <strong><?= htmlspecialchars($submission['plan']) ?></strong> has been received.</p>
  <div class="bg-light rounded p-3 text-start small mb-3">
    <div class="row g-2">
      <div class="col-6"><span class="text-muted">Email</span><br><?= htmlspecialchars($submission['email']) ?></div>
      <div class="col-6"><span class="text-muted">Install Date</span><br><?= formatDate($submission['installation_date']) ?></div>
      <?php if ($submission['payment_ref']): ?>
      <div class="col-12"><span class="text-muted">Payment Ref</span><br><code><?= htmlspecialchars($submission['payment_ref']) ?></code></div>
      <?php endif ?>
    </div>
  </div>
  <?php else: ?>
  <p class="text-muted">Your application has been submitted and payment confirmed. Our team will be in touch shortly.</p>
  <?php endif ?>
  <p class="small text-muted">Our team will review your application and contact you to confirm the installation date.</p>
  <a href="/" class="btn btn-warning fw-bold mt-2">Submit Another Application</a>
</div>
</body>
</html>
