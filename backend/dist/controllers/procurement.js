"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPOs = exports.receiveGoods = exports.updatePOStatus = exports.createPO = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const notify_1 = require("../utils/notify");
const createPO = async (req, res) => {
    const { supplierId, destinationWarehouseId, items } = req.body;
    const po = await db_1.prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const productIds = items.map((i) => i.productId);
        const products = await tx.product.findMany({
            where: { id: { in: productIds } }
        });
        const productSuppliers = await tx.productSupplier.findMany({
            where: { supplierId, productId: { in: productIds } }
        });
        for (const item of items) {
            const existing = productSuppliers.find(ps => ps.productId === item.productId);
            if (!existing) {
                const product = products.find(p => p.id === item.productId);
                const newPs = await tx.productSupplier.create({
                    data: {
                        supplierId,
                        productId: item.productId,
                        unitCost: product ? product.basePrice : 0
                    }
                });
                productSuppliers.push(newPs);
            }
        }
        const newPO = await tx.purchaseOrder.create({
            data: {
                poNumber: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                supplierId,
                destinationWarehouseId,
                status: 'DRAFT',
                orderedById: req.user.id,
                items: {
                    create: items.map((item) => {
                        const ps = productSuppliers.find(p => p.productId === item.productId);
                        const cost = Number(ps.unitCost);
                        totalAmount += (cost * item.quantityOrdered);
                        return {
                            productId: item.productId,
                            quantityOrdered: item.quantityOrdered,
                            unitCost: ps.unitCost
                        };
                    })
                },
                totalAmount
            },
            include: { items: true }
        });
        return await tx.purchaseOrder.update({
            where: { id: newPO.id },
            data: { totalAmount },
            include: { items: true }
        });
    });
    res.status(201).json({ success: true, data: po });
};
exports.createPO = createPO;
const updatePOStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const po = await db_1.prisma.purchaseOrder.findUnique({ where: { id: id } });
    if (!po)
        throw new ApiError_1.ApiError(404, 'Purchase Order not found');
    const updated = await db_1.prisma.purchaseOrder.update({
        where: { id: id },
        data: { status }
    });
    await (0, notify_1.createNotification)(updated.orderedById, 'PO_UPDATE', `Purchase Order ${id} status updated to ${status}`, updated.id);
    res.status(200).json({ success: true, data: updated });
};
exports.updatePOStatus = updatePOStatus;
const receiveGoods = async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;
    const po = await db_1.prisma.$transaction(async (tx) => {
        const order = await tx.purchaseOrder.findUnique({
            where: { id: id },
            include: { items: true }
        });
        if (!order)
            throw new ApiError_1.ApiError(404, 'Purchase Order not found');
        if (!['SUBMITTED', 'PARTIAL'].includes(order.status)) {
            throw new ApiError_1.ApiError(400, 'Purchase Order must be SUBMITTED or PARTIAL to receive goods');
        }
        let allReceived = true;
        for (const item of items) {
            const poItem = order.items.find((i) => i.productId === item.productId);
            if (!poItem)
                throw new ApiError_1.ApiError(400, `Product ${item.productId} not in PO`);
            const remainingToReceive = poItem.quantityOrdered - poItem.quantityReceived;
            if (item.quantityReceived > remainingToReceive) {
                throw new ApiError_1.ApiError(400, `Cannot receive more than ordered for product ${item.productId}`);
            }
            if (item.quantityReceived > 0) {
                await tx.purchaseOrderItem.update({
                    where: { id: poItem.id },
                    data: { quantityReceived: { increment: item.quantityReceived } }
                });
                const inventory = await tx.inventory.upsert({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: order.destinationWarehouseId } },
                    update: { quantityOnHand: { increment: item.quantityReceived } },
                    create: { productId: item.productId, warehouseId: order.destinationWarehouseId, quantityOnHand: item.quantityReceived }
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: order.destinationWarehouseId,
                        movementType: 'IN',
                        quantity: item.quantityReceived,
                        referenceType: 'PO',
                        referenceId: order.id,
                        performedById: req.user.id,
                        notes: 'Goods received from PO'
                    }
                });
            }
            if (poItem.quantityReceived + item.quantityReceived < poItem.quantityOrdered) {
                allReceived = false;
            }
        }
        const updatedPO = await tx.purchaseOrder.update({
            where: { id: id },
            data: { status: allReceived ? 'COMPLETED' : 'PARTIAL' },
            include: { items: true }
        });
        await (0, notify_1.createNotification)(updatedPO.orderedById, 'PO_RECEIPT', `Goods received for Purchase Order ${id}. New status: ${updatedPO.status}`, updatedPO.id, tx);
        return updatedPO;
    });
    res.status(200).json({ success: true, data: po });
};
exports.receiveGoods = receiveGoods;
const getAllPOs = async (req, res) => {
    const pos = await db_1.prisma.purchaseOrder.findMany({
        include: {
            supplier: true,
            destinationWarehouse: true,
            items: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: pos });
};
exports.getAllPOs = getAllPOs;
