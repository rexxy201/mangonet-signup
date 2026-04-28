# MangoNet PHP — cPanel Deployment Guide

## Requirements
- PHP 8.0 or higher
- MySQL 5.7+ or MariaDB 10.3+
- cPanel hosting (shared or VPS)

---

## Step 1 — Create a MySQL Database
1. In cPanel → **MySQL Databases**
2. Create a new database (e.g. `youruser_mangonet`)
3. Create a database user with a strong password
4. Add the user to the database with **All Privileges**
5. Note: your DB host, name, username, and password

---

## Step 2 — Upload Files
1. In cPanel → **File Manager**, go to `public_html/` (or your domain/subdomain root)
2. Upload `mangonet-php.zip` and click **Extract**
3. The files should be directly in `public_html/` (not in a subfolder)

---

## Step 3 — Run the Installer
1. Visit `https://yourdomain.com/setup/install.php` in your browser
2. Fill in your MySQL credentials and create an admin account
3. Click **Run Setup** — it will create all tables and the `config.php` file automatically

---

## Step 4 — Configure the App
1. Visit `https://yourdomain.com/admin/login.php`
2. Sign in with the admin credentials you set during setup
3. Go to **Settings** and configure:
   - **Paystack Keys** — add your public and secret keys from paystack.com
   - **SMTP Email Server** — configure your outgoing mail settings
   - **Notification Emails** — set where signup alerts should be sent

---

## Step 5 — Secure the Setup Folder
After setup is complete, protect the setup folder:

**Option A:** Delete the `setup/` folder entirely  
**Option B:** Password-protect it in cPanel → **Directory Privacy**

---

## File Structure
```
public_html/
├── index.php           ← Customer signup form (5 steps)
├── success.php         ← Post-payment confirmation
├── config.php          ← Auto-generated database config (created by installer)
├── .htaccess
├── admin/
│   ├── index.php       ← Submissions dashboard
│   ├── login.php       ← Admin login
│   ├── logout.php
│   ├── submission.php  ← Individual submission view
│   └── settings.php    ← App settings panel
├── api/
│   ├── submit.php          ← Creates submission record
│   ├── verify-payment.php  ← Confirms Paystack payment
│   ├── update-status.php   ← Approve/reject submission
│   ├── test-smtp.php       ← Test email connection
│   ├── settings.php        ← Get/save settings
│   └── submissions.php     ← List submissions (JSON)
├── includes/
│   ├── db.php          ← MySQL PDO connection
│   ├── auth.php        ← Session authentication
│   ├── email.php       ← SMTP mailer class
│   └── functions.php   ← Shared helpers + plan data
└── setup/
    └── install.php     ← One-time database setup wizard
```

---

## Plans Included
**Residential:** Mango Basic, Plus, Premium, Premium+, Gold, Diamond, Platinum  
**Corporate:** Mango SME, Corporate Plus, Corporate Premium, Preferred, Advantage, Ultimate

---

## Troubleshooting

**500 error on upload:** Increase PHP limits — edit `.htaccess` or ask your host to raise `upload_max_filesize` and `post_max_size`.

**Can't connect to database:** Double-check your DB host — on cPanel it's usually `localhost`, but some hosts use a different hostname.

**Paystack popup not opening:** Ensure your Paystack public key is saved in Settings and you're on HTTPS.

**Emails not sending:** Use the "Test Connection" button in Settings → SMTP to verify your credentials. Gmail users need an App Password (not your Gmail password).
