# Retail Inventory Management System - Database Schema

This directory contains the database schema, migrations, and seeding configuration for the Retail Inventory Management System. We use [Prisma ORM](https://www.prisma.io/) to manage the PostgreSQL database.

## Folder Structure

- `schema.prisma`: The main Prisma configuration file containing all data models and relations.
- `migrations/`: Auto-generated SQL migration files. Do not edit these directly unless necessary.
- `seed.ts`: Script to populate the database with initial development data.

## Getting Started

### 1. Setup Environment
Ensure you have a PostgreSQL instance running. Configure your connection string in the `.env` file at the root of the `backend/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/retail_db?schema=public"
```

### 2. Install Dependencies
Make sure all dependencies are installed:
```bash
npm install
```

### 3. Validate Schema
If you make changes to `schema.prisma`, validate them:
```bash
npx prisma validate
```

### 4. Database Migrations
To apply the schema to the database (and create the database if it doesn't exist), generate and run migrations:
```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client
After making changes to the schema or running migrations, update the Prisma Client:
```bash
npx prisma generate
```

### 6. Seed the Database
To populate the database with initial development data (Admin user, dummy products, initial inventory):
```bash
npm run seed
# or
npx prisma db seed
```
*(Ensure the `prisma.seed` configuration exists in `package.json` pointing to `ts-node prisma/seed.ts`)*
