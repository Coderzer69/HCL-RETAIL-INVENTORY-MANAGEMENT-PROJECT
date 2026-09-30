"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovementHistory = exports.getProcurementReport = exports.getSalesReport = exports.getInventoryReport = void 0;
const db_1 = require("../config/db");
const getInventoryReport = async (req, res) => {
    const inventory = await db_1.prisma.inventory.findMany({
        include: { product: true, warehouse: true }
    });
    const lowStock = inventory.filter(inv => (inv.quantityOnHand - inv.quantityReserved) <= inv.reorderLevel);
    res.status(200).json({
        success: true,
        data: {
            totalItems: inventory.length,
            lowStockItems: lowStock.length,
            inventory,
            lowStock
        }
    });
};
exports.getInventoryReport = getInventoryReport;
const getSalesReport = async (req, res) => {
    const orders = await db_1.prisma.salesOrder.findMany({
        where: { status: { notIn: ['CANCELLED', 'RETURNED'] } }
    });
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    res.status(200).json({
        success: true,
        data: {
            totalOrders: orders.length,
            totalRevenue
        }
    });
};
exports.getSalesReport = getSalesReport;
const getProcurementReport = async (req, res) => {
    const pos = await db_1.prisma.purchaseOrder.findMany();
    const totalSpend = pos.reduce((sum, po) => sum + Number(po.totalAmount), 0);
    res.status(200).json({
        success: true,
        data: {
            totalPurchaseOrders: pos.length,
            totalSpend
        }
    });
};
exports.getProcurementReport = getProcurementReport;
const getStockMovementHistory = async (req, res) => {
    const movements = await db_1.prisma.stockMovement.findMany({
        orderBy: { createdAt: 'desc' },
        include: { product: true, warehouse: true },
        take: 100 // pagination could be implemented
    });
    res.status(200).json({ success: true, data: movements });
};
exports.getStockMovementHistory = getStockMovementHistory;
