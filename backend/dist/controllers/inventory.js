"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransferStatus = exports.createTransfer = exports.getInventory = exports.recordStockMovement = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
// ---------------------------------------------------------
// Single Stock Movements
// ---------------------------------------------------------
const recordStockMovement = async (req, res, next) => {
    try {
        const { productId, warehouseId, quantity, movementType, notes } = req.body;
        const userId = req.user.id;
        if (quantity <= 0)
            throw new ApiError_1.ApiError(400, 'Quantity must be greater than 0');
        // Use a transaction to ensure atomicity
        const result = await db_1.prisma.$transaction(async (tx) => {
            // Find or create inventory record
            let inventory = await tx.inventory.findUnique({
                where: { productId_warehouseId: { productId, warehouseId } }
            });
            if (!inventory) {
                inventory = await tx.inventory.create({
                    data: { productId, warehouseId, quantityOnHand: 0 }
                });
            }
            // Calculate new quantities based on movement type
            let newOnHand = inventory.quantityOnHand;
            let newReserved = inventory.quantityReserved;
            switch (movementType) {
                case 'IN':
                    newOnHand += quantity;
                    break;
                case 'OUT':
                    if (newOnHand < quantity)
                        throw new ApiError_1.ApiError(400, 'Insufficient stock on hand');
                    newOnHand -= quantity;
                    break;
                case 'RESERVE':
                    if (newOnHand - newReserved < quantity)
                        throw new ApiError_1.ApiError(400, 'Insufficient available stock to reserve');
                    newReserved += quantity;
                    break;
                case 'RELEASE':
                    if (newReserved < quantity)
                        throw new ApiError_1.ApiError(400, 'Cannot release more than reserved');
                    newReserved -= quantity;
                    break;
                case 'ADJUST': // Can be negative or positive in real scenarios, but our schema quantity is positive, we treat ADJUST as generic replacement or we need signed quantity.
                    throw new ApiError_1.ApiError(400, 'Direct ADJUST is not fully implemented in this phase');
                default:
                    throw new ApiError_1.ApiError(400, 'Invalid movement type');
            }
            // Update inventory
            const updatedInventory = await tx.inventory.update({
                where: { id: inventory.id },
                data: { quantityOnHand: newOnHand, quantityReserved: newReserved }
            });
            // Record movement
            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    warehouseId,
                    movementType,
                    quantity,
                    referenceType: 'MANUAL',
                    performedById: userId,
                    notes
                }
            });
            return { inventory: updatedInventory, movement };
        });
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.recordStockMovement = recordStockMovement;
const getInventory = async (req, res, next) => {
    try {
        const { warehouseId, productId } = req.query;
        const where = {};
        if (warehouseId)
            where.warehouseId = warehouseId;
        if (productId)
            where.productId = productId;
        const inventory = await db_1.prisma.inventory.findMany({
            where,
            include: {
                product: { select: { id: true, name: true, sku: true } },
                warehouse: { select: { id: true, name: true } }
            }
        });
        res.status(200).json({ success: true, data: inventory });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventory = getInventory;
// ---------------------------------------------------------
// Stock Transfers
// ---------------------------------------------------------
const createTransfer = async (req, res, next) => {
    try {
        const { sourceWarehouseId, destinationWarehouseId, items } = req.body;
        const userId = req.user.id;
        if (sourceWarehouseId === destinationWarehouseId) {
            throw new ApiError_1.ApiError(400, 'Source and destination warehouses must be different');
        }
        const transfer = await db_1.prisma.$transaction(async (tx) => {
            // Create transfer record
            const newTransfer = await tx.stockTransfer.create({
                data: {
                    sourceWarehouseId,
                    destinationWarehouseId,
                    status: 'PENDING',
                    initiatedById: userId,
                    items: {
                        create: items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity
                        }))
                    }
                },
                include: { items: true }
            });
            // Reserve stock in source warehouse immediately
            for (const item of items) {
                const inv = await tx.inventory.findUnique({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: sourceWarehouseId } }
                });
                if (!inv || (inv.quantityOnHand - inv.quantityReserved) < item.quantity) {
                    throw new ApiError_1.ApiError(400, `Insufficient available stock for product ${item.productId} at source warehouse`);
                }
                await tx.inventory.update({
                    where: { id: inv.id },
                    data: { quantityReserved: inv.quantityReserved + item.quantity }
                });
            }
            return newTransfer;
        });
        res.status(201).json({ success: true, data: transfer });
    }
    catch (error) {
        next(error);
    }
};
exports.createTransfer = createTransfer;
const updateTransferStatus = async (req, res, next) => {
    try {
        const transferId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;
        const transfer = await db_1.prisma.$transaction(async (tx) => {
            const existing = (await tx.stockTransfer.findUnique({
                where: { id: transferId },
                include: { items: true }
            }));
            if (!existing)
                throw new ApiError_1.ApiError(404, 'Transfer not found');
            if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
                throw new ApiError_1.ApiError(400, 'Cannot update a completed or cancelled transfer');
            }
            let updatedTransfer;
            if (status === 'IN_TRANSIT') {
                if (existing.status !== 'PENDING')
                    throw new ApiError_1.ApiError(400, 'Only pending transfers can be marked in transit');
                updatedTransfer = await tx.stockTransfer.update({
                    where: { id: transferId },
                    data: { status: 'IN_TRANSIT' }
                });
            }
            else if (status === 'CANCELLED') {
                // Release reservations
                for (const item of existing.items) {
                    const inv = await tx.inventory.findUnique({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId: existing.sourceWarehouseId } }
                    });
                    if (inv) {
                        await tx.inventory.update({
                            where: { id: inv.id },
                            data: { quantityReserved: inv.quantityReserved - item.quantity }
                        });
                    }
                }
                updatedTransfer = await tx.stockTransfer.update({
                    where: { id: transferId },
                    data: { status: 'CANCELLED' }
                });
            }
            else if (status === 'COMPLETED') {
                // Remove from source, un-reserve, add to destination, record movements
                for (const item of existing.items) {
                    // Source Warehouse
                    const sourceInv = await tx.inventory.findUnique({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId: existing.sourceWarehouseId } }
                    });
                    if (!sourceInv || sourceInv.quantityReserved < item.quantity || sourceInv.quantityOnHand < item.quantity) {
                        throw new ApiError_1.ApiError(500, 'Data integrity error: reserved stock missing at source');
                    }
                    await tx.inventory.update({
                        where: { id: sourceInv.id },
                        data: {
                            quantityOnHand: sourceInv.quantityOnHand - item.quantity,
                            quantityReserved: sourceInv.quantityReserved - item.quantity
                        }
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: existing.sourceWarehouseId,
                            movementType: 'TRANSFER_OUT',
                            quantity: item.quantity,
                            referenceType: 'TRANSFER',
                            referenceId: transferId,
                            performedById: userId
                        }
                    });
                    // Destination Warehouse
                    let destInv = await tx.inventory.findUnique({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId: existing.destinationWarehouseId } }
                    });
                    if (!destInv) {
                        destInv = await tx.inventory.create({
                            data: { productId: item.productId, warehouseId: existing.destinationWarehouseId, quantityOnHand: 0 }
                        });
                    }
                    await tx.inventory.update({
                        where: { id: destInv.id },
                        data: { quantityOnHand: destInv.quantityOnHand + item.quantity }
                    });
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: existing.destinationWarehouseId,
                            movementType: 'TRANSFER_IN',
                            quantity: item.quantity,
                            referenceType: 'TRANSFER',
                            referenceId: transferId,
                            performedById: userId
                        }
                    });
                }
                updatedTransfer = await tx.stockTransfer.update({
                    where: { id: transferId },
                    data: { status: 'COMPLETED', receivedById: userId }
                });
            }
            return updatedTransfer;
        });
        res.status(200).json({ success: true, data: transfer });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransferStatus = updateTransferStatus;
