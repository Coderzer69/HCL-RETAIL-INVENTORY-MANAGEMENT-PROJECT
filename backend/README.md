# Retail Inventory Management System - Backend

This is the fully implemented robust, production-ready backend for the Retail Inventory Management System.

## Architecture & Technology Stack
- **Node.js, Express, TypeScript** for the REST API
- **PostgreSQL** as the relational database
- **Prisma 6** as the ORM
- **Zod** for schema and payload validation
- **Jest & Supertest** for automated integration and unit testing
- **Bcrypt & JWT** for secure authentication and RBAC

## Project Features

- **Authentication & Authorization**: Secure JWT login, RBAC (`ADMIN`, `STORE_MANAGER`, `WAREHOUSE_STAFF`, `CUSTOMER`).
- **Product Catalog**: Manage products, SKUs, and pricing.
- **Inventory & Warehouses**: Multi-warehouse stock tracking, stock movements (`IN`, `OUT`, `TRANSFER`), and reserve allocations.
- **Sales Orders & Fulfillment**: Customer orders, lifecycle management (PENDING to SHIPPED), stock reservation, and shipment tracking.
- **Procurement & Suppliers**: Supplier directory, Purchase Orders, and partial/complete goods receipt.
- **Analytics & Reporting**: Inventory reports, sales summaries, procurement spend, and stock movement history.
- **Notifications**: Automated in-app alerts for low stock, order updates, and goods receipt.

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `backend` directory (do not commit to version control):
   ```
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/retail_db
   JWT_SECRET=super_secret_key_123
   ```
   *(For testing, a `.env.test` is provided or created automatically)*

3. **Database Migrations**:
   Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed Database** (Optional):
   ```bash
   npx prisma db seed
   ```

5. **Start the Server**:
   Development mode with hot-reloading:
   ```bash
   npm run dev
   ```

## Testing

Run the full suite of unit and integration tests (36 passing tests across all modules):
```bash
npm run test
```
Tests utilize `jest-mock-extended` to mock Prisma client and simulate database transactions successfully.

## API Overview

Here is a high-level overview of the exposed endpoints. All endpoints expect `Authorization: Bearer <token>` where appropriate.

- `POST /api/auth/register` & `POST /api/auth/login`
- `GET /api/products` (Includes pagination and search)
- `GET /api/inventory/:warehouseId`
- `POST /api/inventory/transfer` (Stock Transfer)
- `POST /api/orders` (Create sales order)
- `PATCH /api/orders/:id/status` (Confirm/Cancel order - Updates inventory reservations)
- `POST /api/orders/:id/shipments` (Ship order - Consumes reserved stock)
- `POST /api/procurement` (Create Purchase Order)
- `POST /api/procurement/:id/receive` (Receive supplier goods - Increments inventory)
- `GET /api/analytics/sales`, `/inventory`, `/procurement`, `/movements` (Reporting)
- `GET /api/notifications` & `PATCH /api/notifications/:id/read`

*Note: Strict RBAC is enforced on administrative endpoints.*
