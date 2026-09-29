import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';
import { v4 as uuidv4 } from 'uuid';
import { createNotification, checkLowStockAndNotify } from '../utils/notify';

export const createOrder = async (req: Request, res: Response) => {
  const customerId = (req as any).user!.id;
  const { items, shippingAddress } = req.body;

  // Start transaction
  const order = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    // Check products and pricing
    const productIds = items.map((i: any) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, isActive: true }
    });

    if (products.length !== items.length) {
      throw new ApiError(400, 'One or more products are invalid or inactive');
    }

    // Verify stock availability across all warehouses
    // For simplicity, we just check total available stock globally first
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)!;
      const inventories = await tx.inventory.findMany({
        where: { productId: item.productId }
      });

      const totalAvailable = inventories.reduce((sum, inv) => sum + (inv.quantityOnHand - inv.quantityReserved), 0);
      if (totalAvailable < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product ${product.name}`);
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
          create: items.map((item: any) => {
            const product = products.find(p => p.id === item.productId)!;
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

export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await prisma.salesOrder.findMany({
    where: { customerId: (req as any).user!.id },
    include: { items: { include: { product: true } }, shipments: true },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: orders });
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await prisma.salesOrder.findMany({
    include: { items: { include: { product: true } }, customer: { select: { email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: orders });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: id as string },
      include: { items: true }
    }) as any;

    if (!order) throw new ApiError(404, 'Order not found');
    if (order.status === status) return order;

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
          if (remainingToReserve <= 0) break;
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
            
            await checkLowStockAndNotify(item.productId, inv.warehouseId, tx);
            
            remainingToReserve -= toReserve;
          }
        }
        
        if (remainingToReserve > 0) {
          throw new ApiError(400, 'Insufficient stock available to confirm order');
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
      where: { id: id as string },
      data: { status }
    });

    await createNotification(
      updated.customerId, 
      'ORDER_UPDATE', 
      `Your order ${updated.orderNumber} is now ${status}`, 
      updated.id, 
      tx
    );

    return updated;
  });

  res.status(200).json({ success: true, data: updatedOrder });
};

// Fulfillment
export const createShipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { trackingNumber, carrier } = req.body;

  const shipment = await prisma.$transaction(async (tx) => {
    const order = await tx.salesOrder.findUnique({
      where: { id: id as string },
      include: { items: true }
    }) as any;

    if (!order) throw new ApiError(404, 'Order not found');
    if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) {
       throw new ApiError(400, 'Order must be confirmed or processing to ship');
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
              performedById: (req as any).user!.id,
              notes: 'Order shipped'
            }
          });
       }
    }

    const updatedOrder = await tx.salesOrder.update({
       where: { id: id as string },
       data: { status: 'SHIPPED' }
    });

    const newShipment = await tx.shipment.create({
       data: {
          salesOrderId: id as string,
          trackingNumber,
          carrier,
          status: 'SHIPPED',
          shippedAt: new Date()
       }
    });

    await createNotification(
      updatedOrder.customerId,
      'SHIPMENT_UPDATE',
      `Your order ${updatedOrder.orderNumber} has been shipped via ${carrier} (Tracking: ${trackingNumber})`,
      updatedOrder.id,
      tx
    );

    return newShipment;
  });

  res.status(201).json({ success: true, data: shipment });
};
