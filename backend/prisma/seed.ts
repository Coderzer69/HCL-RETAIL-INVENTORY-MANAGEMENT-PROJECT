import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrator with full access' },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER', description: 'Standard customer' },
  });

  // 2. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@retail.local' },
    update: {},
    create: {
      email: 'admin@retail.local',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash: 'dummy_hash_for_dev_only', // Use appropriate hashing in production
      roles: {
        create: {
          role: {
            connect: { id: adminRole.id }
          }
        }
      }
    },
  });

  // 3. Categories
  const electronicsCategory = await prisma.category.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  });

  // 4. Suppliers
  const supplierUser = await prisma.user.upsert({
    where: { email: 'supplier@techcorp.local' },
    update: {},
    create: {
      email: 'supplier@techcorp.local',
      firstName: 'TechCorp',
      lastName: 'Supplier',
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      companyName: 'TechCorp Electronics',
      contactName: 'Jane Smith',
      phone: '+1-555-0199',
    },
  });

  // 5. Products
  const laptop = await prisma.product.upsert({
    where: { sku: 'TECH-LAP-01' },
    update: {},
    create: {
      sku: 'TECH-LAP-01',
      name: 'TechCorp Pro Laptop',
      categoryId: electronicsCategory.id,
      basePrice: 1299.99,
      suppliers: {
        create: {
          supplierId: supplier.id,
          unitCost: 950.00,
          supplierSku: 'TC-PRO-L1',
        }
      }
    },
  });

  // 6. Warehouses
  const warehouse = await prisma.warehouse.upsert({
    where: { locationCode: 'WH-NY-01' },
    update: {},
    create: {
      name: 'New York Central Warehouse',
      locationCode: 'WH-NY-01',
      address: '100 Warehouse Blvd, NY 10001',
      managerId: adminUser.id,
    },
  });

  // 7. Initial Inventory
  const inventory = await prisma.inventory.upsert({
    where: {
      productId_warehouseId: {
        productId: laptop.id,
        warehouseId: warehouse.id,
      }
    },
    update: {},
    create: {
      productId: laptop.id,
      warehouseId: warehouse.id,
      quantityOnHand: 100,
      quantityReserved: 0,
      reorderLevel: 20,
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
