<?php

class MangoMailer {
    private string $host;
    private int $port;
    private string $username;
    private string $password;
    private bool $secure;
    private string $from;
    private $socket = null;

    public function __construct(string $host, int $port, string $username, string $password, bool $secure, string $from) {
        $this->host     = $host;
        $this->port     = $port;
        $this->username = $username;
        $this->password = $password;
        $this->secure   = $secure;
        $this->from     = $from ?: "MangoNet <{$username}>";
    }

    private function cmd(string $cmd): string {
        fwrite($this->socket, $cmd . "\r\n");
        $res = '';
        while ($line = fgets($this->socket, 515)) {
            $res .= $line;
            if ($line[3] === ' ') break;
        }
        return $res;
    }

    private function expect(string $code, string $response): void {
        if (substr($response, 0, 3) !== $code) {
            throw new RuntimeException("SMTP error (expected {$code}): " . trim($response));
        }
    }

    public function testConnection(): array {
        try {
            $this->connect();
            $this->disconnect();
            return ['success' => true, 'message' => 'SMTP connection successful'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function connect(): void {
        $prefix = $this->secure && $this->port === 465 ? 'ssl://' : '';
        $this->socket = @fsockopen("{$prefix}{$this->host}", $this->port, $errno, $errstr, 15);
        if (!$this->socket) {
            throw new RuntimeException("Cannot connect to {$this->host}:{$this->port} — {$errstr} ({$errno})");
        }
        stream_set_timeout($this->socket, 30);

        $res = fgets($this->socket, 515);
        if (substr($res, 0, 3) !== '220') {
            throw new RuntimeException("SMTP greeting failed: " . trim($res));
        }

        $this->expect('250', $this->cmd("EHLO " . gethostname()));

        if ($this->secure && $this->port !== 465) {
            $this->expect('220', $this->cmd("STARTTLS"));
            stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $this->expect('250', $this->cmd("EHLO " . gethostname()));
        }

        $this->expect('334', $this->cmd("AUTH LOGIN"));
        $this->expect('334', $this->cmd(base64_encode($this->username)));
        $this->expect('235', $this->cmd(base64_encode($this->password)));
    }

    private function disconnect(): void {
        if ($this->socket) {
            @fwrite($this->socket, "QUIT\r\n");
            @fclose($this->socket);
            $this->socket = null;
        }
    }

    public function send(array $to, string $subject, string $htmlBody): void {
        $this->connect();

        preg_match('/<([^>]+)>/', $this->from, $fm);
        $fromEmail = $fm[1] ?? $this->username;

        $this->expect('250', $this->cmd("MAIL FROM:<{$fromEmail}>"));

        foreach ($to as $addr) {
            $this->expect('250', $this->cmd("RCPT TO:<{$addr}>"));
        }

        $this->expect('354', $this->cmd("DATA"));

        $boundary = md5(uniqid());
        $toHeader = implode(', ', $to);
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

        $message  = "From: {$this->from}\r\n";
        $message .= "To: {$toHeader}\r\n";
        $message .= "Subject: {$encodedSubject}\r\n";
        $message .= "MIME-Version: 1.0\r\n";
        $message .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
        $message .= "\r\n";
        $message .= "--{$boundary}\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $message .= strip_tags($htmlBody) . "\r\n";
        $message .= "--{$boundary}\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $message .= $htmlBody . "\r\n";
        $message .= "--{$boundary}--\r\n";
        $message .= ".";

        $this->expect('250', $this->cmd($message));
        $this->disconnect();
    }
}

function getMailer(): ?MangoMailer {
    require_once __DIR__ . '/db.php';
    $host   = getSetting('smtp_host');
    $port   = (int)(getSetting('smtp_port') ?: 587);
    $user   = getSetting('smtp_user');
    $pass   = getSetting('smtp_password');
    $from   = getSetting('smtp_from');
    $secure = getSetting('smtp_secure') === 'true';
    if (!$host || !$user || !$pass) return null;
    return new MangoMailer($host, $port, $user, $pass, $secure, $from);
}

function sendSignupEmail(array $submission): void {
    $mailer = getMailer();
    if (!$mailer) return;

    $recipients = getSetting('notification_emails');
    $toList = array_filter(array_map('trim', explode(',', $recipients)));
    if (empty($toList)) return;

    $installDate = formatDate($submission['installation_date'] ?? '');
    $name = htmlspecialchars($submission['first_name'] . ' ' . $submission['last_name'], ENT_QUOTES);
    $email = htmlspecialchars($submission['email'] ?? '', ENT_QUOTES);
    $phone = htmlspecialchars($submission['phone'] ?? '', ENT_QUOTES);
    $address = htmlspecialchars($submission['address'] . ', ' . $submission['city'] . ', ' . $submission['state'], ENT_QUOTES);
    $plan = htmlspecialchars($submission['plan'] ?? '', ENT_QUOTES);
    $ssid = htmlspecialchars($submission['wifi_ssid'] ?? '', ENT_QUOTES);
    $wifi = htmlspecialchars($submission['wifi_password'] ?? '', ENT_QUOTES);
    $ref  = htmlspecialchars($submission['payment_ref'] ?? '', ENT_QUOTES);

    $html = <<<HTML
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#f97316;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;font-size:24px">New MangoNet Signup</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <h2 style="color:#1f2937;font-size:18px;margin-top:0">Customer Details</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#6b7280;width:140px">Name</td><td style="padding:8px 0;font-weight:bold">$name</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">$email</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Phone</td><td style="padding:8px 0">$phone</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Address</td><td style="padding:8px 0">$address</td></tr>
    </table>
    <h2 style="color:#1f2937;font-size:18px">Plan & WiFi</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#6b7280;width:140px">Plan</td><td style="padding:8px 0;font-weight:bold">$plan</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">WiFi SSID</td><td style="padding:8px 0;font-family:monospace">$ssid</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">WiFi Password</td><td style="padding:8px 0;font-family:monospace">$wifi</td></tr>
    </table>
    <h2 style="color:#1f2937;font-size:18px">Installation</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="padding:8px 0;color:#6b7280;width:140px">Preferred Date</td><td style="padding:8px 0;font-weight:bold">$installDate</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Payment Ref</td><td style="padding:8px 0;font-family:monospace">$ref</td></tr>
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:6px;text-align:center">
      <p style="margin:0;color:#166534;font-weight:bold">Payment confirmed</p>
    </div>
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px">MangoNet Online — Automated Notification</p>
</div>
HTML;

    try {
        $mailer->send($toList, "New Signup: {$name} — {$plan}", $html);
    } catch (Exception $e) {
        error_log("MangoNet email error: " . $e->getMessage());
    }
}

if (!function_exists('formatDate')) {
    function formatDate(string $d): string {
        try { return (new DateTime($d))->format('l, F j, Y'); } catch (Exception $e) { return $d; }
    }
}
