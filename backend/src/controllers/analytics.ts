import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getInventoryReport = async (req: Request, res: Response) => {
  const inventory = await prisma.inventory.findMany({
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

export const getSalesReport = async (req: Request, res: Response) => {
  const orders = await prisma.salesOrder.findMany({
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

export const getProcurementReport = async (req: Request, res: Response) => {
  const pos = await prisma.purchaseOrder.findMany();
  
  const totalSpend = pos.reduce((sum, po) => sum + Number(po.totalAmount), 0);
  
  res.status(200).json({
    success: true,
    data: {
      totalPurchaseOrders: pos.length,
      totalSpend
    }
  });
};

export const getStockMovementHistory = async (req: Request, res: Response) => {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true, warehouse: true },
    take: 100 // pagination could be implemented
  });

  res.status(200).json({ success: true, data: movements });
};
