# HCL Retail Inventory Management System

A full-stack **Retail Inventory Management System** designed to centralize product, inventory, warehouse, supplier, procurement, sales, stock-transfer, and user-management workflows.

## Project Overview

This project provides a modular backend API and a frontend application for managing retail operations. The backend is built with **Node.js, TypeScript, Express, Prisma, and PostgreSQL**, with JWT-based authentication and Zod environment validation.

The database model covers:

- User and role management
- Product and category management
- Supplier management
- Warehouse and warehouse staff management
- Inventory tracking
- Stock movements and stock transfers
- Sales orders and shipments
- Purchase orders and procurement
- Notifications

## Tech Stack

### Backend

- **Node.js**
- **TypeScript**
- **Express 5**
- **Prisma ORM 6**
- **PostgreSQL**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for environment validation
- **dotenv** for environment configuration
- **CORS**
- **Jest + Supertest** for testing

### Frontend

The repository contains a dedicated `frontend/` application. Its implementation is being developed alongside the backend.

## Architecture

```text
HCL-RETAIL-INVENTORY-MANAGEMENT-PROJECT/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│
└── README.md
```

## Backend Features

### Authentication & Authorization

The backend is prepared for authenticated retail operations using:

- JWT access tokens
- Password hashing with bcrypt
- User roles and role assignments
- Active/inactive user management

### Product Management

Products support:

- SKU
- Barcode
- Product name
- Description
- Base price
- Category association
- Active/inactive status
- Supplier relationships

### Inventory Management

Inventory is tracked per warehouse with:

- Quantity on hand
- Reserved quantity
- Reorder level
- Stock movement history
- Inventory updates

### Warehouse Management

The system supports:

- Multiple warehouses
- Warehouse managers
- Warehouse staff
- Warehouse-specific inventory
- Inter-warehouse stock transfers

### Supplier & Procurement Management

The data model supports:

- Supplier records
- Product-supplier relationships
- Purchase orders
- Purchase order items
- Ordered vs. received quantities
- Destination warehouses

### Sales & Shipping

Sales workflows include:

- Sales orders
- Order items
- Customer association
- Order status tracking
- Shipment records
- Tracking number and carrier details

### Stock Transfers

Stock transfers can move inventory between warehouses with statuses such as:

```text
PENDING
IN_TRANSIT
COMPLETED
CANCELLED
```

### Notifications

Notifications support different channels and statuses, including:

```text
EMAIL
SMS
IN_APP
```

## Getting Started

### Prerequisites

Install:

- Node.js
- npm
- PostgreSQL database

A hosted PostgreSQL database such as **Neon** can also be used.

### 1. Clone the repository

```bash
git clone https://github.com/Coderzer69/HCL-RETAIL-INVENTORY-MANAGEMENT-PROJECT.git
cd HCL-RETAIL-INVENTORY-MANAGEMENT-PROJECT
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"

JWT_SECRET="YOUR_SECURE_JWT_SECRET"
JWT_EXPIRES_IN=1d
```

Do not commit real credentials, database URLs, JWT secrets, or API keys.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Apply the database schema

For a development database:

```bash
npx prisma migrate dev
```

For environments where migrations already exist:

```bash
npx prisma migrate deploy
```

### 6. Run the backend

```bash
npm run dev
```

The current application starts on:

```text
http://localhost:5000
```

The root health-check endpoint is:

```http
GET /
```

Expected response:

```json
{
  "success": true,
  "message": "Retail Management Backend is running!"
}
```

## Available Backend Scripts

Run these commands inside `backend/`:

| Command | Description |
|---|---|
| `npm run dev` | Starts the TypeScript development server |
| `npm run build` | Compiles the project with TypeScript |
| `npm start` | Starts the compiled application |
| `npx prisma generate` | Generates the Prisma Client |
| `npx prisma migrate dev` | Creates/applies development migrations |
| `npx prisma migrate deploy` | Applies existing migrations |

## API Structure

The application mounts API routes under:

```text
/api
```

Use **Postman**, **Thunder Client**, or another API client while developing and testing the endpoints.

Standard REST conventions used by the project:

| Method | Purpose |
|---|---|
| `GET` | Retrieve data |
| `POST` | Create data |
| `PUT` | Replace/update data |
| `PATCH` | Partially update data |
| `DELETE` | Delete data |

As individual modules are completed, endpoint documentation can be added here.

## Database Model

The Prisma schema currently defines the following major entities:

```text
User
Role
UserRole
Category
Product
Supplier
ProductSupplier
Warehouse
WarehouseStaff
Inventory
StockMovement
StockTransfer
StockTransferItem
SalesOrder
OrderItem
Shipment
PurchaseOrder
PurchaseOrderItem
Notification
```

These entities are connected through relational constraints to support inventory, procurement, warehouse, and order workflows.

## Environment Validation

The backend validates required environment variables at startup using Zod.

Required:

- `DATABASE_URL`
- `JWT_SECRET` with a minimum length requirement

Defaults:

- `PORT=5000`
- `JWT_EXPIRES_IN=1d`

An invalid environment configuration stops the application from starting.

## Development Workflow

A typical development cycle is:

```text
Frontend
   ↓
REST API
   ↓
Express
   ↓
Service / Route Logic
   ↓
Prisma ORM
   ↓
PostgreSQL
```

## Security

- Keep `.env` files out of version control.
- Never expose production database credentials.
- Use strong, unique JWT secrets.
- Hash passwords with bcrypt rather than storing plaintext passwords.
- Validate incoming data before processing it.
- Protect authenticated and role-specific routes.

## Testing

The backend includes Jest and Supertest dependencies for automated testing.

Run the test suite after test scripts are configured:

```bash
npm test
```

## Future Enhancements

Planned areas for continued development include:

- Complete authentication and authorization flows
- Product and inventory CRUD APIs
- Stock adjustment and low-stock alerts
- Supplier and purchase-order workflows
- Sales-order processing
- Warehouse stock transfers
- Dashboard analytics
- Frontend integration with backend APIs
- Automated API and integration tests
- Production deployment and CI/CD

## License

This project currently uses the license configuration defined in the repository's package metadata. Add a dedicated license file before distributing the project publicly.
