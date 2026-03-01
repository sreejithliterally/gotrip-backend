# GoTrip — Developer Guide

> Backend API for a multi-vertical travel booking platform supporting Hotels, Activities, Camping, and Packages.  
> Built for web, Android, and iOS clients.

---

## Table of Contents

1. [What is GoTrip?](#1-what-is-gotrip)
2. [Architecture Overview](#2-architecture-overview)
3. [Folder Structure](#3-folder-structure)
4. [Data Models](#4-data-models)
5. [Authentication Flow](#5-authentication-flow)
6. [API Design](#6-api-design)
7. [Local Development Setup](#7-local-development-setup)
8. [Database Migrations](#8-database-migrations)
9. [Environment Variables](#9-environment-variables)
10. [Deployment](#10-deployment)
11. [Key Conventions](#11-key-conventions)

---

## 1. What is GoTrip?

GoTrip is a **booking marketplace** where:

- **Users** browse and book hotels, activities, camping spots, and travel packages.
- **Vendors** onboard their business, create listings, manage availability, and receive payments.
- **Admins** approve vendors, manage categories, and oversee the platform.

The backend is a **Node.js + TypeScript REST API** using **Express 5**, **PostgreSQL** (via Sequelize ORM), and **Redis** for OTP/session caching. Payments are handled through **Razorpay**.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Clients                             │
│          Web App  ·  Android App  ·  iOS App            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│                  Express API Server                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Auth    │  │ Listings │  │ Bookings │  ...modules  │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  Middleware: Helmet · CORS · Rate Limit · JWT Auth      │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
┌──────────▼──────────┐   ┌───────────▼───────────┐
│    PostgreSQL        │   │        Redis           │
│  (Sequelize ORM)     │   │  OTP cache · Sessions  │
└─────────────────────┘   └───────────────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │       Razorpay           │
                         │  Payment Gateway         │
                         └─────────────────────────┘
```

### Architectural Pattern: Modular Monolith

The codebase is organized as a **modular monolith** — each domain (auth, users, vendors, listings, bookings, payments, reviews) is a self-contained module with its own routes, controller, service, and validator. This makes it straightforward to extract individual modules into microservices later if needed.

Each request flows through:

```
Request → Router → Validator (Zod) → Controller → Service → Model (Sequelize) → DB
```

---

## 3. Folder Structure

```
gotrip/
├── config/
│   └── database.js          # Sequelize CLI config (reads from .env)
├── src/
│   ├── server.ts            # Entry point — starts HTTP server, handles graceful shutdown
│   ├── app.ts               # Express app setup — middleware, routes, error handler
│   │
│   ├── auth/                # OTP-based login/signup + token refresh
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.validator.ts
│   │
│   ├── users/               # User profile management
│   ├── vendors/             # Vendor onboarding and admin review
│   ├── categories/          # Category tree (hotels, activities, camping, packages)
│   ├── listings/            # Vendor listings with media and availability
│   ├── bookings/            # Booking creation, cancellation, availability management
│   ├── payments/            # Razorpay order creation, verification, webhooks
│   ├── reviews/             # User reviews tied to completed bookings
│   │
│   ├── models/              # All Sequelize model definitions (single source of truth)
│   │   ├── index.ts         # Re-exports all models
│   │   ├── user.model.ts
│   │   ├── vendor.model.ts
│   │   ├── category.model.ts
│   │   ├── listing.model.ts
│   │   ├── listing-media.model.ts
│   │   ├── availability.model.ts
│   │   ├── booking.model.ts
│   │   ├── payment.model.ts
│   │   └── review.model.ts
│   │
│   ├── common/
│   │   ├── config/
│   │   │   ├── index.ts     # Centralized env var loading
│   │   │   └── swagger.ts   # OpenAPI 3.0 spec (served at /docs)
│   │   ├── middleware/
│   │   │   ├── auth.ts      # JWT verification middleware
│   │   │   ├── role.ts      # Role-based access control (user / vendor / admin)
│   │   │   ├── error-handler.ts
│   │   │   └── not-found.ts
│   │   ├── types/
│   │   │   └── index.ts     # Shared enums and TypeScript types
│   │   └── utils/
│   │       ├── jwt.ts       # sign / verify JWT helpers
│   │       ├── response.ts  # Standardized sendSuccess / sendError helpers
│   │       ├── validate.ts  # Zod validation middleware factory
│   │       └── ...
│   │
│   └── db/
│       ├── database.ts      # Sequelize instance configuration
│       ├── redis.ts         # ioredis client
│       ├── index.ts         # Connects DB + Redis, registers all models
│       ├── migrations/      # Sequelize CLI migration files (JS)
│       └── seeders/         # Sequelize CLI seeder files (JS)
│
├── .sequelizerc             # Tells Sequelize CLI where migrations/seeders live
├── tsconfig.json
├── env.example              # Template for .env
└── package.json
```

### Module anatomy (e.g. `listings/`)

| File | Responsibility |
|---|---|
| `listing.routes.ts` | Declares Express routes, wires middleware |
| `listing.controller.ts` | Parses request, calls service, sends response |
| `listing.service.ts` | Business logic, DB queries via Sequelize models |
| `listing.validator.ts` | Zod schemas for request body/query validation |

---

## 4. Data Models

### Entity Relationship (simplified)

```
User ──< Vendor ──< Listing ──< Availability
                       │
                       ├──< ListingMedia
                       └──< Booking ──< Payment
                                │
                              Review
Category ──< Listing
```

### Models

| Model | Table | Key Fields |
|---|---|---|
| `User` | `users` | `id`, `full_name`, `email`, `phone`, `role` (user/vendor/admin) |
| `Vendor` | `vendors` | `user_id`, `business_name`, `status` (pending/approved/rejected) |
| `Category` | `categories` | `name`, `slug`, `type`, `parent_id` (self-referential tree) |
| `Listing` | `listings` | `vendor_id`, `category_id`, `title`, `price_start`, `status` (draft/published/archived) |
| `ListingMedia` | `listing_media` | `listing_id`, `url`, `media_type`, `sort_order` |
| `Availability` | `availability` | `listing_id`, `date`, `total_units`, `available_units`, `price` |
| `Booking` | `bookings` | `user_id`, `listing_id`, `start_date`, `end_date`, `total_amount`, `status` |
| `Payment` | `payments` | `booking_id`, `razorpay_order_id`, `razorpay_payment_id`, `status` |
| `Review` | `reviews` | `user_id`, `listing_id`, `booking_id`, `rating`, `comment` |

---

## 5. Authentication Flow

GoTrip uses **OTP-based, passwordless authentication**.

```
1. POST /api/v1/auth/send-otp
   → Generates a 4-digit OTP, stores in Redis with TTL (5 min)
   → Sends via email or SMS (channel param)

2. POST /api/v1/auth/verify-otp
   → Validates OTP from Redis
   → If user doesn't exist → creates account (full_name required)
   → Returns { access_token, refresh_token, user }

3. POST /api/v1/auth/refresh-token
   → Validates refresh_token (7d TTL)
   → Returns new access_token (15m TTL) + new refresh_token
```

**JWT payload:**
```json
{ "userId": "uuid", "role": "user|vendor|admin" }
```

Protected routes use the `authenticate` middleware which verifies the Bearer token and attaches `req.user`.

Role-restricted routes additionally use `authorize('vendor')` or `authorize('admin')` middleware.

---

## 6. API Design

- **Base URL:** `http://localhost:4000/api/v1`
- **Docs (Swagger UI):** `http://localhost:4000/docs`
- **Health check:** `http://localhost:4000/health`

All responses follow a consistent envelope:

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": [...] }

// Paginated
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

**Rate limiting:** 100 requests per 15 minutes per IP on all `/api/` routes.

---

## 7. Local Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| PostgreSQL | ≥ 14 |
| Redis | ≥ 6 |
| npm | ≥ 9 |

### Step 1 — Clone and install

```bash
git clone <repo-url>
cd gotrip
npm install
```

### Step 2 — Create the database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql:
CREATE DATABASE gotrip;
\q
```

### Step 3 — Configure environment

```bash
cp env.example .env
```

Edit `.env` with your local values (see [Environment Variables](#9-environment-variables)).  
At minimum, set `DB_PASSWORD` to match your PostgreSQL setup.

### Step 4 — Run migrations

```bash
npm run migrate
```

This creates all tables in the correct order, respecting foreign key constraints.

### Step 5 — Seed initial data

```bash
npm run seed
```

Seeds: root categories (Hotels, Activities, Camping, Packages) and their subcategories.

### Step 6 — Start the dev server

```bash
npm run dev
```

Server starts at `http://localhost:4000` with hot-reload via `tsx watch`.

### Verify it's working

```bash
curl http://localhost:4000/health
# → {"status":"ok","timestamp":"..."}
```

Open **http://localhost:4000/docs** in your browser for the full interactive API docs.

---

## 8. Database Migrations

Schema changes are managed with **Sequelize CLI migrations** — never use `sequelize.sync()` in production.

### Workflow for schema changes

```bash
# 1. Generate a new migration file
npm run migrate:create -- --name add-column-to-listings

# 2. Edit the generated file in src/db/migrations/
#    Add your `up` (apply) and `down` (rollback) logic

# 3. Apply the migration
npm run migrate

# 4. To rollback the last migration
npm run migrate:undo

# 5. To rollback everything (careful!)
npm run migrate:undo:all
```

Migration files live in `src/db/migrations/` and are plain JavaScript (required by Sequelize CLI).  
They run in filename order — always prefix with a timestamp (e.g. `20241201000001-description.js`).

### Seeders

```bash
npm run seed          # Run all seeders
npm run seed:undo     # Undo all seeders
```

Seeder files live in `src/db/seeders/`.

---

## 9. Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment | `development` / `production` |
| `PORT` | HTTP port | `4000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `gotrip` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (if any) | _(blank for local)_ |
| `JWT_SECRET` | Access token signing secret | _(long random string)_ |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | _(long random string)_ |
| `JWT_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `OTP_EXPIRY_SECONDS` | OTP TTL in Redis | `300` |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_test_xxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | `xxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret | `xxx` |
| `AWS_ACCESS_KEY_ID` | S3 access key (media uploads) | _(optional)_ |
| `AWS_SECRET_ACCESS_KEY` | S3 secret | _(optional)_ |
| `AWS_REGION` | S3 region | `ap-south-1` |
| `AWS_S3_BUCKET` | S3 bucket name | `gotrip-media` |
| `SMTP_HOST` | SMTP server for email OTP | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | _(your email)_ |
| `SMTP_PASS` | SMTP password / app password | _(your app password)_ |
| `SMS_API_KEY` | SMS gateway API key | _(optional)_ |
| `SMS_SENDER_ID` | SMS sender ID | _(optional)_ |

> **Security:** Never commit `.env` to git. Use secrets managers (AWS Secrets Manager, Doppler, etc.) in production.

---

## 10. Deployment

### Build for production

```bash
npm run build
# Compiles TypeScript → dist/
```

### Run in production

```bash
NODE_ENV=production node dist/server.js
```

### Using PM2 (recommended)

```bash
npm install -g pm2

# Start
pm2 start dist/server.js --name gotrip-api

# Auto-restart on crash + startup on reboot
pm2 startup
pm2 save

# Logs
pm2 logs gotrip-api

# Reload without downtime
pm2 reload gotrip-api
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t gotrip-api .
docker run -p 4000:4000 --env-file .env gotrip-api
```

### Docker Compose (full stack)

```yaml
version: '3.9'
services:
  api:
    build: .
    ports:
      - "4000:4000"
    env_file: .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: gotrip
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

```bash
docker compose up -d
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

### Nginx reverse proxy (production)

```nginx
server {
    listen 80;
    server_name api.gotrip.in;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Use **Certbot** to add SSL:
```bash
sudo certbot --nginx -d api.gotrip.in
```

### Production checklist

- [ ] `NODE_ENV=production` is set
- [ ] Strong random values for `JWT_SECRET` and `JWT_REFRESH_SECRET` (≥ 64 chars)
- [ ] `RAZORPAY_KEY_ID` points to live keys (not `rzp_test_`)
- [ ] Razorpay webhook URL registered in Razorpay dashboard → `https://api.gotrip.in/api/v1/payments/webhook`
- [ ] Database running with connection pooling (PgBouncer recommended for high traffic)
- [ ] Redis password set and `REDIS_PASSWORD` configured
- [ ] Nginx + SSL configured
- [ ] PM2 or container orchestrator (ECS, Kubernetes) managing the process
- [ ] Log aggregation set up (CloudWatch, Datadog, Loki, etc.)
- [ ] Run `npm run migrate` as part of your deploy pipeline before starting the new version

---

## 11. Key Conventions

### Response helpers

Always use `sendSuccess` / `sendError` from `src/common/utils/response.ts` — never call `res.json()` directly in controllers.

### Validation

Every route that accepts a body or query params must use the `validate(schema)` middleware with a Zod schema. Schemas live in `<module>.validator.ts`.

### Error handling

Throw errors from services — the global `errorHandler` middleware in `app.ts` catches them and formats the response. Use `AppError` (or a plain `Error`) with a meaningful message.

### Adding a new module

1. Create `src/<module>/` with `routes`, `controller`, `service`, `validator` files.
2. Add the Sequelize model to `src/models/` and export it from `src/models/index.ts`.
3. Register the model in `src/db/index.ts`.
4. Create a migration file: `npm run migrate:create -- --name create-<module>-table`
5. Mount the router in `src/app.ts`.
6. Add the endpoints to `src/common/config/swagger.ts`.

### Adding a new migration

```bash
npm run migrate:create -- --name your-description
# Edit the generated file in src/db/migrations/
npm run migrate
```

Never edit an already-applied migration. Create a new one instead.
