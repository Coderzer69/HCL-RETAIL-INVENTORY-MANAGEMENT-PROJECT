"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipmentStatusSchema = exports.createShipmentSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
    })).min(1),
    shippingAddress: zod_1.z.string().min(5),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
});
exports.createShipmentSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().optional(),
    carrier: zod_1.z.string().optional(),
});
exports.updateShipmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED']),
});
