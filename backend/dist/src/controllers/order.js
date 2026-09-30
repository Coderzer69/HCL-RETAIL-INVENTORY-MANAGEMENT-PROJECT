"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShipment = exports.updateOrderStatus = exports.getAllOrders = exports.getMyOrders = exports.createOrder = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const notify_1 = require("../utils/notify");
const createOrder = async (req, res) => {
    const customerId = req.user.id;
    const { items, shippingAddress } = req.body;
    // Start transaction
    const order = await db_1.prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        // Check products and pricing
        const productIds = items.map((i) => i.productId);
        const products = await tx.product.findMany({
            where: { id: { in: productIds }, isActive: true }
        });
        if (products.length !== items.length) {
            throw new ApiError_1.ApiError(400, 'One or more products are invalid or inactive');
        }
        // Verify stock availability across all warehouses
        // For simplicity, we just check total available stock globally first
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            const inventories = await tx.inventory.findMany({
                where: { productId: item.productId }
            });
            const totalAvailable = inventories.reduce((sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved), 0);
            if (totalAvailable < item.quantity) {
                throw new ApiError_1.ApiError(400, `Insufficient stock for product ${product.name}`);
            }
            totalAmount += (Number(product.basePrice) * item.quantity);
        }
        // Create Order
        const newOrder = await tx.salesOrder.create({
            data: {
                orderNumber: `SO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                customerId,
                status: 'PENDING',
                totalAmount,
                shippingAddress,
                items: {
                    create: items.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: product.basePrice
                        };
                    })
                }
            },
            include: { items: true }
        });
        // We do NOT reserve stock here yet, we reserve when CONFIRMED
        return newOrder;
    });
    res.status(201).json({ success: true, data: order });
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    const orders = await db_1.prisma.salesOrder.findMany({
        where: { customerId: req.user.id },
        include: { items: { include: { product: true } }, shipments: true },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: orders });
};
exports.getMyOrders = getMyOrders;
const getAllOrders = async (req, res) => {
    const orders = await db_1.prisma.salesOrder.findMany({
        include: { items: { include: { product: true } }, customer: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: orders });
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
    const updatedOrder = await db_1.prisma.$transaction(async (tx) => {
        const order = await tx.salesOrder.findUnique({
            where: { id: id },
            include: { items: true }
        });
        if (!order)
            throw new ApiError_1.ApiError(404, 'Order not found');
        if (order.status === status)
            return order;
        // Handle CONFIRMED: Reserve stock
        if (status === 'CONFIRMED' && order.status === 'PENDING') {
            for (const item of order.items) {
                // Reserve stock from warehouses having inventory
                let remainingToReserve = item.quantity;
                const inventories = await tx.inventory.findMany({
                    where: { productId: item.productId },
                    orderBy: { quantityOnHand: 'desc' }
                });
                for (const inv of inventories) {
                    if (remainingToReserve <= 0)
                        break;
                    const available = inv.quantityOnHand - inv.quantityReserved;
                    if (available > 0) {
                        const toReserve = Math.min(available, remainingToReserve);
                        await tx.inventory.update({
                            where: { id: inv.id },
                            data: { quantityReserved: { increment: toReserve } }
                        });
                        // Record allocation on item (simplification: only one warehouse allocation supported per item for now)
                        if (!item.allocatedWarehouseId) {
                            await tx.orderItem.update({
                                where: { id: item.id },
                                data: { allocatedWarehouseId: inv.warehouseId }
                            });
                        }
                        await (0, notify_1.checkLowStockAndNotify)(item.productId, inv.warehouseId, tx);
                        remainingToReserve -= toReserve;
                    }
                }
                if (remainingToReserve > 0) {
                    throw new ApiError_1.ApiError(400, 'Insufficient stock available to confirm order');
                }
            }
        }
        // Handle CANCELLED: Release reserved stock
        if (status === 'CANCELLED' && ['CONFIRMED', 'PROCESSING'].includes(order.status)) {
            for (const item of order.items) {
                if (item.allocatedWarehouseId) {
                    await tx.inventory.update({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId: item.allocatedWarehouseId } },
                        data: { quantityReserved: { decrement: item.quantity } }
                    });
                }
            }
        }
        const updated = await tx.salesOrder.update({
            where: { id: id },
            data: { status }
        });
        await (0, notify_1.createNotification)(updated.customerId, 'ORDER_UPDATE', `Your order ${updated.orderNumber} is now ${status}`, updated.id, tx);
        return updated;
    });
    res.status(200).json({ success: true, data: updatedOrder });
};
exports.updateOrderStatus = updateOrderStatus;
// Fulfillment
const createShipment = async (req, res) => {
    const { id } = req.params;
    const { trackingNumber, carrier } = req.body;
    const shipment = await db_1.prisma.$transaction(async (tx) => {
        const order = await tx.salesOrder.findUnique({
            where: { id: id },
            include: { items: true }
        });
        if (!order)
            throw new ApiError_1.ApiError(404, 'Order not found');
        if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) {
            throw new ApiError_1.ApiError(400, 'Order must be confirmed or processing to ship');
        }
        // Creating shipment means we decrement on hand and reserved
        for (const item of order.items) {
            if (item.allocatedWarehouseId) {
                await tx.inventory.update({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: item.allocatedWarehouseId } },
                    data: {
                        quantityReserved: { decrement: item.quantity },
                        quantityOnHand: { decrement: item.quantity }
                    }
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: item.allocatedWarehouseId,
                        movementType: 'OUT',
                        quantity: item.quantity,
                        referenceType: 'SO',
                        referenceId: order.id,
                        performedById: req.user.id,
                        notes: 'Order shipped'
                    }
                });
            }
        }
        const updatedOrder = await tx.salesOrder.update({
            where: { id: id },
            data: { status: 'SHIPPED' }
        });
        const newShipment = await tx.shipment.create({
            data: {
                salesOrderId: id,
                trackingNumber,
                carrier,
                status: 'SHIPPED',
                shippedAt: new Date()
            }
        });
        await (0, notify_1.createNotification)(updatedOrder.customerId, 'SHIPMENT_UPDATE', `Your order ${updatedOrder.orderNumber} has been shipped via ${carrier} (Tracking: ${trackingNumber})`, updatedOrder.id, tx);
        return newShipment;
    });
    res.status(201).json({ success: true, data: shipment });
};
exports.createShipment = createShipment;
