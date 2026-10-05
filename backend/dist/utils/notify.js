"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLowStockAndNotify = exports.createNotification = void 0;
const db_1 = require("../config/db");
const createNotification = async (userId, type, message, referenceId, tx) => {
    const db = tx || db_1.prisma;
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
exports.createNotification = createNotification;
const checkLowStockAndNotify = async (productId, warehouseId, tx) => {
    const db = tx || db_1.prisma;
    const inventory = await db.inventory.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
        include: { product: true, warehouse: true }
    });
    if (!inventory)
        return;
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
            await (0, exports.createNotification)(manager.id, 'LOW_STOCK', `Low stock alert for ${inventory.product.name} at ${inventory.warehouse.name}. Available: ${available}, Reorder Level: ${inventory.reorderLevel}`, inventory.productId, db);
        }
    }
};
exports.checkLowStockAndNotify = checkLowStockAndNotify;
