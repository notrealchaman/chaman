# PEAKLOOP

PEAKLOOP is a full-stack SaaS marketplace and business-operating platform. It combines a curated software marketplace (discover, compare, review, and track thousands of tools) with a personal command center and a suite of built-in business apps — CRM, support desk, social commerce, analytics, and an automation builder.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **NextAuth v5**, and **node:sqlite** for a zero-config local database. `prisma/schema.prisma` documents the production PostgreSQL target.

> This project is original work. It takes conceptual inspiration from the category of "software marketplace + business OS" tools but does not copy any existing product's layout, copy, branding, or assets.

---

## ✨ Features

### Public marketplace
- Browse **1,200+ tools** across **24 categories** with full-text search, filtering (price, free plan, free trial, AI, min rating) and sorting (recommended, popular, top-rated, newest, trending, price).
- **Compare** up to 4 tools side by side with a 12-row feature matrix and winner highlighting.
- **Deals** page with live countdowns and coupon codes.
- **Verified reviews** with a review submission flow (pending moderation).
- **Blog** with rich articles, guides, and related-tool recommendations.
- Pricing, about, and contact pages (contact POSTs to the API).

### Personal & business dashboard
- Command center with **revenue/spend charts**, AI insights, and recent activity.
- **Subscription manager** — track spend, yearly/monthly, renewal dates, and savings; add/edit/delete subscriptions.
- **Favorites** and per-user tool management.
- **Alerts & reminders** for renewals and deals.

### PEAK CRM
- Kanban-style sales pipeline with drag-and-drop stages, deal values, and upcoming tasks.

### PEAK Desk (support)
- Ticket inbox with conversation threads and **AI-drafted replies**.

### PEAK Social (commerce)
- Connect social accounts, unified inbox with order creation, products, and customers.

### PEAK Analytics
- Revenue, orders, customers, conversion & retention, sales-by-channel, top customers, and AI-generated insights.

### Automation builder
- No-code trigger → action workflows with run history.

### Integrations & API platform
- Connect third-party apps, create/revoke scoped **API keys** with a one-time secret.

### Platform features
- **Auth** — email/password with bcrypt, plus OAuth (Google/GitHub when configured), email verification, account setup (personal/business).
- **Team management** — invite members with roles & permissions.
- **Notifications** — centralized center with unread tracking.
- **Security** — 2FA toggle, device/session view, activity log.
- **AI recommendation engine** — answer budget/size/industry to get a tailored shortlist.
- **⌘K command menu**, compare tray, and save-to-favorites everywhere.

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file (or copy `.env.example`):

```bash
cp .env.example .env
```

Then generate a strong `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Leave OAuth/Stripe/OpenAI/Resend placeholders blank for demo mode. PEAK AI falls back to a deterministic recommendation engine when no key is set, and Social/Support "AI" replies are simulated, so the app is fully functional out of the box.

### 3. Seed the database

The app uses `node:sqlite` (Node's built-in driver) — no external DB or binary downloads required.

```bash
npm run db:seed
# or
npm run setup
```

This creates `prisma/dev.db` with realistic demo data: **1,245 tools**, 24 categories, 39k+ reviews, deals, blog posts, integrations, CRM deals, support tickets, orders, subscriptions, API keys, and automation workflows.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Email              | Password      | Role    |
| ------------------ | ------------- | ------- |
| `demo@peakloop.app`| `password123` | User (business) |
| `admin@peakloop.app`| `password123`| Admin   |
| `vendor@peakloop.app`| `password123`| Vendor |
| `sarah@peakloop.app`| `password123`| User (personal) |

---

## 🧱 Architecture

- **`app/`** — Next.js App Router pages and API routes.
- **`components/`** — UI primitives (`ui/`), dashboard components, site sections, and shared widgets.
- **`lib/db.ts`** — thin `node:sqlite` wrapper (`getDb`, `run`, `get`, `all`, `insert`, `update`, `remove`, `count`, JSON helpers).
- **`lib/schema.ts`** — SQLite DDL that mirrors `prisma/schema.prisma`.
- **`lib/data.ts`** — all data-access functions (catalog, per-user CRM/orders/tickets/automations/notifications/subscriptions/API keys/usage/payments/team/vendor/admin metrics; analytics series).
- **`lib/auth.ts` / `middleware.ts` / `lib/session.ts`** — NextAuth v5 (JWT) config, edge-safe middleware guard, and a `requireUser()` helper for protected server pages.
- **`prisma/schema.prisma`** — the production PostgreSQL target schema (44 models). The runtime uses SQLite locally with zero binary downloads; swap the provider to `postgresql` and set `DATABASE_URL` to migrate to production.

### Design system

- Primary palette: green `#22C55E`, emerald `#10B981`, sky `#38BDF8`, dark `#0F172A`, background `#F8FAFC`, white.
- Light-first, accessible, semantic tokens defined in `globals.css`.
- Consistent `Card`, `Button`, `Badge`, `Input`, `Dialog`, `Select`, and chart components.

---

## 📜 Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build                |
| `npm run start`     | Start the production server     |
| `npm run lint`      | Run ESLint                      |
| `npm run db:seed`   | Seed the SQLite DB              |
| `npm run db:reset`  | Delete + reseed the DB          |

---

## 🔒 Security notes

- Never commit `.env` — secrets live only in environment variables (`AUTH_SECRET`, OAuth, Stripe, OpenAI, etc.).
- Passwords are hashed with bcrypt.
- API routes check the session before mutating user data.
- Middleware guards `/dashboard` and `/admin` and redirects unauthenticated visitors to `/login`.
- API keys are stored server-side; the full secret is shown **once** on creation.
