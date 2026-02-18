# MangoNet Online Signup

## Overview

MangoNet is an ISP (Internet Service Provider) customer signup application. It allows customers to sign up for internet service plans, select WiFi credentials, choose installation dates, and make payments via Paystack. An admin panel lets staff view and manage submitted applications (approve/reject). The app is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, no SSR (RSC is disabled)
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin, CSS variables for theming
- **Build Tool**: Vite with path aliases (`@/` → `client/src/`, `@shared/` → `shared/`)

### Key Pages
- `/` — Customer signup form (plan selection, personal info, WiFi setup, installation date, Paystack payment)
- `/success` — Post-submission confirmation page
- `/admin` — Admin dashboard to view/manage submissions
- `/admin/login` — Admin login page

### Backend
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, executed via `tsx` in development
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Build**: esbuild bundles server to `dist/index.cjs` for production; Vite builds client to `dist/public/`

### API Routes
- `POST /api/submissions` — Create a new signup submission (status: pending)
- `GET /api/submissions` — List all submissions
- `PATCH /api/submissions/:id/status` — Update submission status (pending/paid/approved/rejected)
- `PATCH /api/submissions/:id/payment` — Update payment reference and set status to "paid"
- `POST /api/admin/login` — Admin login (default password: MangoNet@2026, stored as bcrypt hash)
- `POST /api/admin/change-password` — Change admin password (requires current password)
- `GET /api/settings/:key` — Get a setting value
- `PUT /api/settings/:key` — Update a setting value

### Database
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Push**: `npm run db:push` uses `drizzle-kit push` to sync schema to database
- **Tables**:
  - `submissions` — Customer signup data (name, email, phone, address, plan, WiFi credentials, installation date, payment reference, status)
  - `settings` — Key-value store for app configuration
  - `admin_users` — Admin authentication credentials

### Shared Code
- `shared/schema.ts` contains Drizzle table definitions and Zod insert schemas, shared between frontend and backend via path aliases

### Development vs Production
- **Development**: Vite dev server runs as middleware on the Express server with HMR
- **Production**: Client is pre-built to static files; Express serves them from `dist/public/`

## External Dependencies

### Payment Processing
- **Paystack**: JavaScript SDK loaded via `<script>` tag in `index.html` (`https://js.paystack.co/v1/inline.js`). Used for processing customer payments during signup. Requires a Paystack public key (stored in settings table).

### Email Notifications
- **Mailgun**: Used to send signup details to support@mangonetonline.com on successful submission. Configured via `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` secrets. Uses `mailgun.js` + `form-data` packages. Email is sent asynchronously after submission is saved (non-blocking).

### Database
- **PostgreSQL**: Required. Connection string provided via `DATABASE_URL` environment variable. Uses `pg` (node-postgres) driver with `connect-pg-simple` for session storage capability.

### Key NPM Dependencies
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `express` v5 — HTTP server
- `react-day-picker` — Calendar/date picker for installation date selection
- `wouter` — Client-side routing
- `@tanstack/react-query` — Async state management
- `zod` — Runtime validation
- `recharts` — Charting (available for admin dashboard)
- `vaul` — Drawer component

### Fonts
- **Google Fonts**: Inter font family loaded from Google Fonts CDN