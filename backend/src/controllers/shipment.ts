import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

export const getAllShipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        salesOrder: {
          include: {
            customer: { select: { firstName: true, lastName: true, email: true } },
            items: { include: { product: true } }
          }
        },
        purchaseOrder: {
          include: {
            supplier: true,
            items: { include: { product: true } }
          }
        },
        events: { orderBy: { timestamp: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: shipments });
  } catch (error) {
    next(error);
  }
};

export const getShipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id as string },
      include: {
        salesOrder: {
          include: {
            customer: { select: { firstName: true, lastName: true, email: true } },
            items: { include: { product: true } }
          }
        },
        purchaseOrder: {
          include: {
            supplier: true,
            items: { include: { product: true } }
          }
        },
        events: { orderBy: { timestamp: 'desc' } }
      }
    });

    if (!shipment) throw new ApiError(404, 'Shipment not found');
    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    next(error);
  }
};

export const createShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, salesOrderId, purchaseOrderId, trackingNumber, carrier, status, originAddress, destinationAddress, estimatedDeliveryDate } = req.body;
    
    const shipmentNumber = `SH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newShipment = await prisma.shipment.create({
      data: {
        shipmentNumber,
        type,
        salesOrderId,
        purchaseOrderId,
        trackingNumber,
        carrier,
        status: status || 'PENDING',
        originAddress,
        destinationAddress,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
        events: {
          create: {
            status: status || 'PENDING',
            description: 'Shipment created'
          }
        }
      },
      include: { events: true }
    });

    res.status(201).json({ success: true, data: newShipment });
  } catch (error) {
    next(error);
  }
};

export const updateShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estimatedDeliveryDate, ...data } = req.body;
    
    if (estimatedDeliveryDate) {
      data.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }

    const updated = await prisma.shipment.update({
      where: { id: req.params.id as string },
      data
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    if (error.code === 'P2025') next(new ApiError(404, 'Shipment not found'));
    else next(error);
  }
};

export const updateShipmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, location, description } = req.body;

    const shipment = await prisma.shipment.findUnique({ where: { id: id as string } });
    if (!shipment) throw new ApiError(404, 'Shipment not found');

    const updateData: any = { status };
    if (status === 'SHIPPED' && !shipment.shippedAt) updateData.shippedAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();

    const updatedShipment = await prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id: id as string },
        data: updateData
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: id as string,
          status,
          location,
          description: description || `Status updated to ${status}`
        }
      });

      return updated;
    });

    res.status(200).json({ success: true, data: updatedShipment });
  } catch (error) {
    next(error);
  }
};

export const deleteShipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.shipment.delete({
      where: { id: req.params.id as string }
    });
    res.status(200).json({ success: true, message: 'Shipment deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') next(new ApiError(404, 'Shipment not found'));
    else next(error);
  }
};
