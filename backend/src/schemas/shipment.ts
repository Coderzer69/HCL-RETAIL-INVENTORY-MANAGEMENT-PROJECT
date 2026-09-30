import { z } from 'zod';

export const baseShipmentSchema = z.object({
  type: z.enum(['OUTBOUND', 'INBOUND']).default('OUTBOUND'),
  salesOrderId: z.string().uuid().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  status: z.enum(['PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'CANCELLED', 'FAILED']).default('PENDING'),
  originAddress: z.string().optional(),
  destinationAddress: z.string().optional(),
  estimatedDeliveryDate: z.string().datetime().optional(),
});

export const createGlobalShipmentSchema = baseShipmentSchema.refine(data => data.salesOrderId || data.purchaseOrderId, {
  message: 'Either salesOrderId or purchaseOrderId must be provided',
  path: ['salesOrderId']
});

export const updateGlobalShipmentSchema = baseShipmentSchema.partial();

export const updateShipmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'CANCELLED', 'FAILED']),
  location: z.string().optional(),
  description: z.string().optional(),
});
