import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  shippingAddress: z.string().min(5),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
});

export const createShipmentSchema = z.object({
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export const updateShipmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
});
