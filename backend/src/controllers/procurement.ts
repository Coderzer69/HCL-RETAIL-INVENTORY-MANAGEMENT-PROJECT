import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';
import { createNotification } from '../utils/notify';

export const createPO = async (req: Request, res: Response) => {
  const { supplierId, destinationWarehouseId, items } = req.body;

  const po = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;

    const productIds = items.map((i: any) => i.productId);
    const productSuppliers = await tx.productSupplier.findMany({
      where: { supplierId, productId: { in: productIds } }
    });

    if (productSuppliers.length !== items.length) {
      throw new ApiError(400, 'One or more products are not linked to this supplier');
    }

    const newPO = await tx.purchaseOrder.create({
      data: {
        poNumber: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        supplierId,
        destinationWarehouseId,
        status: 'DRAFT',
        orderedById: (req as any).user!.id,
        items: {
          create: items.map((item: any) => {
            const ps = productSuppliers.find(p => p.productId === item.productId)!;
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

export const updatePOStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const po = await prisma.purchaseOrder.findUnique({ where: { id: id as string } });
  if (!po) throw new ApiError(404, 'Purchase Order not found');

  const updated = await prisma.purchaseOrder.update({
    where: { id: id as string },
    data: { status }
  });

  await createNotification(
    updated.orderedById!,
    'PO_UPDATE',
    `Purchase Order ${id} status updated to ${status}`,
    updated.id
  );

  res.status(200).json({ success: true, data: updated });
};

export const receiveGoods = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { items } = req.body;

  const po = await prisma.$transaction(async (tx) => {
    const order = await tx.purchaseOrder.findUnique({
      where: { id: id as string },
      include: { items: true }
    }) as any;

    if (!order) throw new ApiError(404, 'Purchase Order not found');
    if (!['SUBMITTED', 'PARTIAL'].includes(order.status)) {
      throw new ApiError(400, 'Purchase Order must be SUBMITTED or PARTIAL to receive goods');
    }

    let allReceived = true;

    for (const item of items) {
      const poItem = order.items.find((i: any) => i.productId === item.productId);
      if (!poItem) throw new ApiError(400, `Product ${item.productId} not in PO`);

      const remainingToReceive = poItem.quantityOrdered - poItem.quantityReceived;
      if (item.quantityReceived > remainingToReceive) {
        throw new ApiError(400, `Cannot receive more than ordered for product ${item.productId}`);
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
            performedById: (req as any).user!.id,
            notes: 'Goods received from PO'
          }
        });
      }

      if (poItem.quantityReceived + item.quantityReceived < poItem.quantityOrdered) {
        allReceived = false;
      }
    }

    const updatedPO = await tx.purchaseOrder.update({
      where: { id: id as string },
      data: { status: allReceived ? 'COMPLETED' : 'PARTIAL' },
      include: { items: true }
    });

    await createNotification(
      updatedPO.orderedById!,
      'PO_RECEIPT',
      `Goods received for Purchase Order ${id}. New status: ${updatedPO.status}`,
      updatedPO.id,
      tx
    );

    return updatedPO;
  });

  res.status(200).json({ success: true, data: po });
};
