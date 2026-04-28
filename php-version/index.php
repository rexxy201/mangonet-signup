<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
$paystackKey = getSetting('paystack_public_key');
$signupNote  = getSetting('signup_note');
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MangoNet Online — Sign Up for Internet Service</title>
<meta name="description" content="Sign up for fast, reliable internet from MangoNet Online. Choose your plan and get connected today.">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://js.paystack.co/v1/inline.js"></script>
<style>
:root{--orange:#f97316;--orange-dark:#ea6c0a}
body{background:#f8f9fa;font-family:'Segoe UI',sans-serif}
.navbar-brand{font-weight:800;font-size:22px;color:var(--orange)!important}
.progress-step{display:flex;align-items:center;gap:8px;flex:1;position:relative}
.step-num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;border:2px solid #d1d5db;background:white;color:#9ca3af;transition:.3s}
.step-num.active{border-color:var(--orange);color:white;background:var(--orange)}
.step-num.done{border-color:#22c55e;background:#22c55e;color:white}
.step-label{font-size:12px;color:#6b7280;display:none}
@media(min-width:576px){.step-label{display:block}}
.step-line{flex:1;height:2px;background:#e5e7eb;margin:0 8px}
.step-line.done{background:var(--orange)}
.plan-card{cursor:pointer;border:2px solid #e5e7eb;border-radius:12px;padding:16px;transition:.2s;position:relative;background:white}
.plan-card:hover{border-color:var(--orange);box-shadow:0 4px 15px rgba(249,115,22,.1)}
.plan-card.selected{border-color:var(--orange);background:#fff7ed}
.plan-card .plan-check{position:absolute;top:10px;right:10px;color:var(--orange);display:none}
.plan-card.selected .plan-check{display:block}
.category-badge{font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px}
.category-Residential{background:#dcfce7;color:#166534}
.category-Corporate{background:#dbeafe;color:#1e40af}
.btn-orange{background:var(--orange);color:white;border:none;font-weight:600}
.btn-orange:hover{background:var(--orange-dark);color:white}
.form-section{background:white;border-radius:16px;padding:24px;box-shadow:0 2px 15px rgba(0,0,0,.06);margin-bottom:20px}
.upload-zone{border:2px dashed #d1d5db;border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:.2s;position:relative;background:#fafafa}
.upload-zone:hover{border-color:var(--orange);background:#fff7ed}
.upload-zone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.upload-preview{width:100%;height:130px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb}
.page{display:none}.page.active{display:block}
#calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px}
.cal-day{padding:8px 4px;border-radius:8px;text-align:center;cursor:pointer;font-size:13px;transition:.2s;border:1px solid transparent}
.cal-day:hover:not(.disabled){background:#fff7ed;border-color:var(--orange)}
.cal-day.selected{background:var(--orange);color:white}
.cal-day.disabled{color:#d1d5db;cursor:default;background:none}
.cal-day.today{font-weight:700}
.cal-header{font-weight:600;text-align:center;font-size:12px;color:#6b7280;padding:4px}
</style>
</head>
<body>

<nav class="navbar navbar-light bg-white border-bottom px-3 px-md-4">
  <span class="navbar-brand">🥭 MangoNet</span>
  <a href="/admin/login.php" class="btn btn-sm btn-outline-secondary">Admin</a>
</nav>

<div class="container py-4" style="max-width:780px">

  <?php if ($signupNote): ?>
  <div class="alert alert-warning py-2 mb-3 small"><?= htmlspecialchars($signupNote) ?></div>
  <?php endif ?>

  <!-- Progress -->
  <div class="d-flex align-items-center mb-4 px-2">
    <div class="progress-step"><div class="step-num active" id="step1num">1</div><div class="step-label">Plan</div></div>
    <div class="step-line" id="line1"></div>
    <div class="progress-step"><div class="step-num" id="step2num">2</div><div class="step-label">Details</div></div>
    <div class="step-line" id="line2"></div>
    <div class="progress-step"><div class="step-num" id="step3num">3</div><div class="step-label">WiFi & Docs</div></div>
    <div class="step-line" id="line3"></div>
    <div class="progress-step"><div class="step-num" id="step4num">4</div><div class="step-label">Schedule</div></div>
    <div class="step-line" id="line4"></div>
    <div class="progress-step"><div class="step-num" id="step5num">5</div><div class="step-label">Payment</div></div>
  </div>

  <!-- Step 1: Plan Selection -->
  <div class="page active" id="page1">
    <div class="form-section">
      <h5 class="fw-bold mb-1">Choose Your Plan</h5>
      <p class="text-muted small mb-3">Select the internet plan that fits your needs</p>

      <h6 class="text-muted small fw-semibold text-uppercase mb-2">Residential</h6>
      <div class="row g-2 mb-3" id="residentialPlans"></div>

      <h6 class="text-muted small fw-semibold text-uppercase mb-2 mt-3">Corporate</h6>
      <div class="row g-2 mb-3" id="corporatePlans"></div>

      <div id="planError" class="text-danger small mt-2" style="display:none">Please select a plan to continue.</div>
      <button class="btn btn-orange w-100 mt-3 py-2" onclick="nextStep(1)">Continue <i class="bi bi-arrow-right ms-1"></i></button>
    </div>
  </div>

  <!-- Step 2: Personal Info -->
  <div class="page" id="page2">
    <div class="form-section">
      <h5 class="fw-bold mb-3">Personal Information</h5>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label small">First Name *</label>
          <input class="form-control" id="firstName" placeholder="John" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Last Name *</label>
          <input class="form-control" id="lastName" placeholder="Doe" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Email Address *</label>
          <input class="form-control" type="email" id="email" placeholder="john@example.com" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Phone Number *</label>
          <input class="form-control" id="phone" placeholder="08012345678" required>
        </div>
        <div class="col-md-12">
          <label class="form-label small">NIN (National ID Number)</label>
          <input class="form-control" id="nin" placeholder="12345678901">
        </div>
      </div>
    </div>
    <div class="form-section">
      <h5 class="fw-bold mb-3">Service Address</h5>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label small">Street Address *</label>
          <input class="form-control" id="address" placeholder="14 Example Street" required>
        </div>
        <div class="col-md-4">
          <label class="form-label small">City *</label>
          <input class="form-control" id="city" placeholder="Lagos" required>
        </div>
        <div class="col-md-4">
          <label class="form-label small">State *</label>
          <select class="form-select" id="state" required>
            <option value="">Select state</option>
            <?php foreach ($NIGERIAN_STATES as $st): ?>
            <option value="<?= $st ?>"><?= $st ?></option>
            <?php endforeach ?>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Country</label>
          <input class="form-control" value="Nigeria" disabled>
        </div>
      </div>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary" onclick="prevStep(2)"><i class="bi bi-arrow-left"></i> Back</button>
      <button class="btn btn-orange flex-grow-1 py-2" onclick="nextStep(2)">Continue <i class="bi bi-arrow-right ms-1"></i></button>
    </div>
  </div>

  <!-- Step 3: WiFi & Documents -->
  <div class="page" id="page3">
    <div class="form-section">
      <h5 class="fw-bold mb-3">WiFi Configuration</h5>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label small">WiFi Network Name (SSID) *</label>
          <input class="form-control" id="wifiSsid" placeholder="MyHomeNetwork" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small">WiFi Password *</label>
          <input class="form-control" id="wifiPassword" placeholder="Min. 8 characters" required>
        </div>
      </div>
    </div>
    <div class="form-section">
      <h5 class="fw-bold mb-3">Document Upload</h5>
      <p class="text-muted small mb-3">Upload clear photos of the following documents</p>
      <div class="row g-3">
        <?php
        $docs = [
          ['id'=>'passportPhoto','label'=>'Passport Photo','icon'=>'person-bounding-box'],
          ['id'=>'govtId','label'=>'Government Issued ID','icon'=>'card-text'],
          ['id'=>'proofOfAddress','label'=>'Proof of Address','icon'=>'house-check'],
        ];
        foreach($docs as $doc): ?>
        <div class="col-md-4">
          <div class="small fw-semibold mb-1"><?= $doc['label'] ?></div>
          <div class="upload-zone" id="zone_<?= $doc['id'] ?>">
            <input type="file" accept="image/*" onchange="handleUpload(this,'<?= $doc['id'] ?>')">
            <img id="preview_<?= $doc['id'] ?>" src="" class="upload-preview" style="display:none">
            <div id="placeholder_<?= $doc['id'] ?>">
              <i class="bi bi-<?= $doc['icon'] ?> fs-3 text-muted"></i>
              <div class="small text-muted mt-1">Tap to upload</div>
            </div>
          </div>
        </div>
        <?php endforeach ?>
      </div>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary" onclick="prevStep(3)"><i class="bi bi-arrow-left"></i> Back</button>
      <button class="btn btn-orange flex-grow-1 py-2" onclick="nextStep(3)">Continue <i class="bi bi-arrow-right ms-1"></i></button>
    </div>
  </div>

  <!-- Step 4: Schedule -->
  <div class="page" id="page4">
    <div class="form-section">
      <h5 class="fw-bold mb-1">Preferred Installation Date</h5>
      <p class="text-muted small mb-3">Select a date at least 3 days from today</p>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button class="btn btn-sm btn-outline-secondary" onclick="changeMonth(-1)"><i class="bi bi-chevron-left"></i></button>
        <span id="calMonthLabel" class="fw-semibold"></span>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeMonth(1)"><i class="bi bi-chevron-right"></i></button>
      </div>
      <div id="calendar"></div>
      <div class="mt-3 p-3 rounded" id="selectedDateDisplay" style="background:#fff7ed;display:none">
        <i class="bi bi-calendar-check text-orange"></i>
        <span id="selectedDateText" class="fw-semibold ms-2"></span>
      </div>
      <div id="dateError" class="text-danger small mt-2" style="display:none">Please select an installation date.</div>
    </div>
    <div class="form-section">
      <h5 class="fw-bold mb-3">Additional Notes</h5>
      <textarea class="form-control" id="notes" rows="3" placeholder="Any special instructions or notes for the installation team..."></textarea>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary" onclick="prevStep(4)"><i class="bi bi-arrow-left"></i> Back</button>
      <button class="btn btn-orange flex-grow-1 py-2" onclick="nextStep(4)">Review & Pay <i class="bi bi-arrow-right ms-1"></i></button>
    </div>
  </div>

  <!-- Step 5: Review & Pay -->
  <div class="page" id="page5">
    <div class="form-section">
      <h5 class="fw-bold mb-3">Review Your Application</h5>
      <div id="reviewContent"></div>
    </div>
    <div class="form-section">
      <h5 class="fw-bold mb-2">Complete Payment</h5>
      <p class="text-muted small mb-3">Your application will be submitted after payment.</p>
      <div id="payError" class="alert alert-danger" style="display:none"></div>
      <button class="btn btn-orange w-100 py-2 fw-bold fs-5" id="payBtn" onclick="pay()">
        <i class="bi bi-lock-fill me-2"></i>Pay Now
      </button>
      <p class="text-center small text-muted mt-2">Secured by Paystack</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline-secondary" onclick="prevStep(5)"><i class="bi bi-arrow-left"></i> Back</button>
    </div>
  </div>

</div><!-- /container -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
const PAYSTACK_KEY = <?= json_encode($paystackKey) ?>;

const PLANS = [
  {id:'basic',       name:'Mango Basic',            price:'NGN 14,067', speed:'25Mbps',  category:'Residential', amount:1406700},
  {id:'plus',        name:'Mango Plus',              price:'NGN 19,929', speed:'40Mbps',  category:'Residential', amount:1992900},
  {id:'premium',     name:'Mango Premium',           price:'NGN 25,790', speed:'60Mbps',  category:'Residential', amount:2579000},
  {id:'premium_plus',name:'Mango Premium+',          price:'NGN 35,172', speed:'80Mbps',  category:'Residential', amount:3517200},
  {id:'gold',        name:'Mango Gold',              price:'NGN 40,447', speed:'120Mbps', category:'Residential', amount:4044700},
  {id:'diamond',     name:'Mango Diamond',           price:'NGN 48,362', speed:'165Mbps', category:'Residential', amount:4836200},
  {id:'platinum',    name:'Mango Platinum',          price:'NGN 58,245', speed:'200Mbps', category:'Residential', amount:5824500},
  {id:'sme',         name:'Mango SME',               price:'NGN 29,306', speed:'65Mbps',  category:'Corporate',   amount:2930600},
  {id:'corp_plus',   name:'Mango Corporate Plus',    price:'NGN 52,751', speed:'100Mbps', category:'Corporate',   amount:5275100},
  {id:'corp_premium',name:'Mango Corporate Premium', price:'NGN 58,613', speed:'140Mbps', category:'Corporate',   amount:5861300},
  {id:'preferred',   name:'Mango Preferred',         price:'NGN 67,404', speed:'200Mbps', category:'Corporate',   amount:6740400},
  {id:'advantage',   name:'Mango Advantage',         price:'NGN 89,648', speed:'250Mbps', category:'Corporate',   amount:8964800},
  {id:'ultimate',    name:'Mango Ultimate',          price:'NGN 107,578',speed:'350Mbps', category:'Corporate',   amount:10757800},
];

let selectedPlan = null;
let selectedDate = null;
let fileData = {passportPhoto: null, govtId: null, proofOfAddress: null};
let currentStep = 1;
let calYear, calMonth;

// Render plans
function renderPlans() {
  ['Residential','Corporate'].forEach(cat => {
    const el = document.getElementById(cat.toLowerCase() + 'Plans');
    PLANS.filter(p => p.category === cat).forEach(p => {
      el.innerHTML += `<div class="col-md-6"><div class="plan-card" id="plan_${p.id}" onclick="selectPlan('${p.id}')">
        <i class="bi bi-check-circle-fill plan-check"></i>
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">${p.name}</div>
            <div class="small text-muted">${p.speed}</div>
          </div>
          <span class="category-badge category-${cat}">${cat}</span>
        </div>
        <div class="fw-bold text-orange mt-2" style="color:var(--orange)">${p.price}<span class="text-muted fw-normal">/mo</span></div>
      </div></div>`;
    });
  });
}

function selectPlan(id) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('plan_' + id).classList.add('selected');
  selectedPlan = PLANS.find(p => p.id === id);
  document.getElementById('planError').style.display = 'none';
}

// Calendar
function initCalendar() {
  const today = new Date();
  calYear = today.getFullYear();
  calMonth = today.getMonth();
  renderCalendar();
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function renderCalendar() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calMonthLabel').textContent = months[calMonth] + ' ' + calYear;
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const today = new Date(); today.setHours(0,0,0,0);
  const minDate = new Date(today); minDate.setDate(minDate.getDate() + 3);
  const first = new Date(calYear, calMonth, 1).getDay();
  const total = new Date(calYear, calMonth + 1, 0).getDate();
  let html = days.map(d => `<div class="cal-header">${d}</div>`).join('');
  for (let i = 0; i < first; i++) html += '<div></div>';
  for (let d = 1; d <= total; d++) {
    const date = new Date(calYear, calMonth, d);
    const isDisabled = date < minDate;
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const cls = ['cal-day', isDisabled?'disabled':'', isSelected?'selected':'', isToday?'today':''].filter(Boolean).join(' ');
    html += `<div class="${cls}" ${!isDisabled?`onclick="selectDate(${calYear},${calMonth},${d})"`:''}>${d}</div>`;
  }
  document.getElementById('calendar').innerHTML = html;
}

function selectDate(y, m, d) {
  selectedDate = new Date(y, m, d);
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('selectedDateText').textContent = selectedDate.toLocaleDateString('en-NG', opts);
  document.getElementById('selectedDateDisplay').style.display = 'block';
  document.getElementById('dateError').style.display = 'none';
  renderCalendar();
}

// File upload
function handleUpload(input, field) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    fileData[field] = e.target.result;
    document.getElementById('preview_' + field).src = e.target.result;
    document.getElementById('preview_' + field).style.display = 'block';
    document.getElementById('placeholder_' + field).style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Validation
function validate(step) {
  if (step === 1) {
    if (!selectedPlan) { document.getElementById('planError').style.display = 'block'; return false; }
  }
  if (step === 2) {
    const fields = ['firstName','lastName','email','phone','address','city','state'];
    for (const f of fields) {
      const el = document.getElementById(f);
      if (!el.value.trim()) { el.focus(); el.classList.add('is-invalid'); return false; }
      el.classList.remove('is-invalid');
    }
  }
  if (step === 3) {
    if (!document.getElementById('wifiSsid').value.trim()) {
      document.getElementById('wifiSsid').focus(); return false;
    }
    if (!document.getElementById('wifiPassword').value.trim()) {
      document.getElementById('wifiPassword').focus(); return false;
    }
  }
  if (step === 4) {
    if (!selectedDate) { document.getElementById('dateError').style.display = 'block'; return false; }
  }
  return true;
}

function renderReview() {
  const p = selectedPlan;
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('reviewContent').innerHTML = `
    <div class="row g-2 small">
      <div class="col-6"><div class="text-muted">Plan</div><div class="fw-bold">${p.name} — ${p.speed}</div></div>
      <div class="col-6"><div class="text-muted">Price</div><div class="fw-bold text-success">${p.price}/mo</div></div>
      <div class="col-6"><div class="text-muted">Name</div><div>${val('firstName')} ${val('lastName')}</div></div>
      <div class="col-6"><div class="text-muted">Email</div><div>${val('email')}</div></div>
      <div class="col-6"><div class="text-muted">Phone</div><div>${val('phone')}</div></div>
      <div class="col-6"><div class="text-muted">Address</div><div>${val('address')}, ${val('city')}, ${val('state')}</div></div>
      <div class="col-6"><div class="text-muted">WiFi SSID</div><div class="font-monospace">${val('wifiSsid')}</div></div>
      <div class="col-6"><div class="text-muted">WiFi Password</div><div class="font-monospace">${val('wifiPassword')}</div></div>
      <div class="col-12"><div class="text-muted">Installation Date</div><div class="fw-semibold">${selectedDate.toLocaleDateString('en-NG', opts)}</div></div>
    </div>`;
}

function val(id) { return document.getElementById(id)?.value?.trim() || ''; }

function nextStep(step) {
  if (!validate(step)) return;
  if (step === 4) renderReview();
  document.getElementById('page' + step).classList.remove('active');
  document.getElementById('page' + (step+1)).classList.add('active');
  updateProgress(step + 1);
  window.scrollTo(0, 0);
}

function prevStep(step) {
  document.getElementById('page' + step).classList.remove('active');
  document.getElementById('page' + (step-1)).classList.add('active');
  updateProgress(step - 1);
  window.scrollTo(0, 0);
}

function updateProgress(step) {
  currentStep = step;
  for (let i = 1; i <= 5; i++) {
    const num = document.getElementById('step' + i + 'num');
    if (i < step) { num.className = 'step-num done'; num.innerHTML = '<i class="bi bi-check-fill" style="font-size:11px"></i>'; }
    else if (i === step) { num.className = 'step-num active'; num.textContent = i; }
    else { num.className = 'step-num'; num.textContent = i; }
  }
  for (let i = 1; i <= 4; i++) {
    document.getElementById('line' + i).className = 'step-line' + (i < step ? ' done' : '');
  }
}

let submissionId = null;

async function pay() {
  const btn = document.getElementById('payBtn');
  const errEl = document.getElementById('payError');
  btn.disabled = true; btn.textContent = 'Saving...';
  errEl.style.display = 'none';

  const body = {
    firstName: val('firstName'), lastName: val('lastName'),
    email: val('email'), phone: val('phone'),
    address: val('address'), city: val('city'), state: val('state'),
    plan: selectedPlan.name, wifiSsid: val('wifiSsid'), wifiPassword: val('wifiPassword'),
    installationDate: selectedDate.toISOString(),
    notes: val('notes'), nin: val('nin'),
    passportPhoto: fileData.passportPhoto,
    govtId: fileData.govtId,
    proofOfAddress: fileData.proofOfAddress,
  };

  try {
    const res = await fetch('/api/submit.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission failed');
    submissionId = data.id;
  } catch(e) {
    errEl.textContent = e.message; errEl.style.display = 'block';
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Pay Now';
    return;
  }

  if (!PAYSTACK_KEY) {
    errEl.textContent = 'Payment is not configured yet. Please contact support.';
    errEl.style.display = 'block';
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Pay Now';
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: val('email'),
    amount: selectedPlan.amount,
    currency: 'NGN',
    ref: 'MN_' + Date.now(),
    metadata: { name: val('firstName') + ' ' + val('lastName'), plan: selectedPlan.name },
    onClose: function() {
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Pay Now';
      errEl.textContent = 'Payment cancelled.'; errEl.style.display = 'block';
    },
    callback: async function(response) {
      btn.textContent = 'Verifying...';
      try {
        const vres = await fetch('/api/verify-payment.php', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ id: submissionId, paymentRef: response.reference })
        });
        const vdata = await vres.json();
        if (!vres.ok) throw new Error(vdata.error || 'Verification failed');
        window.location.href = '/success.php?id=' + submissionId;
      } catch(e) {
        errEl.textContent = 'Payment received but could not be verified. Reference: ' + response.reference + '. Please contact support.';
        errEl.style.display = 'block';
        btn.disabled = false; btn.innerHTML = '<i class="bi bi-lock-fill me-2"></i>Pay Now';
      }
    }
  });
  handler.openIframe();
}

// Init
renderPlans();
initCalendar();
</script>
</body>
</html>
