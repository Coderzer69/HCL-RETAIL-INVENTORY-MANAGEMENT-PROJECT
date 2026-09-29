import { prisma } from '../config/db';

export const createNotification = async (
  userId: string,
  type: string,
  message: string,
  referenceId?: string,
  tx?: any
) => {
  const db = tx || prisma;
  return await db.notification.create({
    data: {
      userId,
      type,
      message,
      referenceId,
      channel: 'IN_APP',
      status: 'PENDING' // Can be updated to READ by the user
    }
  });
};

export const checkLowStockAndNotify = async (productId: string, warehouseId: string, tx?: any) => {
  const db = tx || prisma;
  
  const inventory = await db.inventory.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
    include: { product: true, warehouse: true }
  });

  if (!inventory) return;

  const available = inventory.quantityOnHand - inventory.quantityReserved;
  if (available <= inventory.reorderLevel) {
    // Notify managers
    const managers = await db.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: { in: ['ADMIN', 'STORE_MANAGER'] }
            }
          }
        }
      }
    });

    for (const manager of managers) {
      await createNotification(
        manager.id,
        'LOW_STOCK',
        `Low stock alert for ${inventory.product.name} at ${inventory.warehouse.name}. Available: ${available}, Reorder Level: ${inventory.reorderLevel}`,
        inventory.productId,
        db
      );
    }
  }
};
