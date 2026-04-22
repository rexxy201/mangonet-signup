# MangoNet — cPanel Deployment Guide

## Requirements
- cPanel with **Node.js Selector** (Node.js 20+)
- **PostgreSQL** database

---

## Step 1 — Create a PostgreSQL Database
1. In cPanel → **PostgreSQL Databases**
2. Create a new database (e.g. `mangonet_db`)
3. Create a database user and set a strong password
4. Assign the user to the database with **All Privileges**
5. Note your connection details:
   - Host: `localhost` (or your host's DB host)
   - Port: `5432`
   - Database name, username, password

---

## Step 2 — Upload Files
1. In cPanel → **File Manager**, go to your desired folder (e.g. `public_html/mangonet` or a subdomain root)
2. Upload and extract `mangonet-signup.zip`

---

## Step 3 — Set Up Node.js App
1. In cPanel → **Node.js Selector** → **Create Application**
   - **Node.js version**: 20 (or latest available)
   - **Application mode**: Production
   - **Application root**: the folder where you extracted the zip
   - **Application URL**: your domain or subdomain
   - **Application startup file**: `dist/index.cjs`
2. Click **Create**

---

## Step 4 — Set Environment Variables
In the Node.js app settings, add these environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME` |
| `NODE_ENV` | `production` |

---

## Step 5 — Install Dependencies
In the Node.js Selector for your app, click **Run NPM Install** (this installs production dependencies).

---

## Step 6 — Set Up the Database Schema
Open the **Terminal** in cPanel (or SSH) and run:

```bash
cd /path/to/your/app
NODE_ENV=production npx drizzle-kit push
```

This creates all the required tables in your PostgreSQL database.

---

## Step 7 — Start the App
Click **Restart** in Node.js Selector. Your app should now be live at your domain.

---

## Step 8 — Configure the App (Admin Panel)
1. Visit `https://yourdomain.com/admin/login`
2. Login: `admin` / `MangoNet@2026`  ← **Change this password immediately**
3. Go to Settings and configure:
   - Paystack public & secret keys
   - SMTP email server
   - Notification email recipients

---

## Default Admin Credentials
- **Username**: admin
- **Password**: MangoNet@2026
- ⚠️ Change this immediately after first login via Admin → Settings → Change Password

---

## Port Notes
The app runs on port **5000** by default. cPanel's Node.js Selector handles proxying your domain to this port automatically — no changes needed.
