"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipmentStatusSchema = exports.updateGlobalShipmentSchema = exports.createGlobalShipmentSchema = exports.baseShipmentSchema = void 0;
const zod_1 = require("zod");
exports.baseShipmentSchema = zod_1.z.object({
    type: zod_1.z.enum(['OUTBOUND', 'INBOUND']).default('OUTBOUND'),
    salesOrderId: zod_1.z.string().uuid().optional(),
    purchaseOrderId: zod_1.z.string().uuid().optional(),
    trackingNumber: zod_1.z.string().optional(),
    carrier: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'CANCELLED', 'FAILED']).default('PENDING'),
    originAddress: zod_1.z.string().optional(),
    destinationAddress: zod_1.z.string().optional(),
    estimatedDeliveryDate: zod_1.z.string().datetime().optional(),
});
exports.createGlobalShipmentSchema = exports.baseShipmentSchema.refine(data => data.salesOrderId || data.purchaseOrderId, {
    message: 'Either salesOrderId or purchaseOrderId must be provided',
    path: ['salesOrderId']
});
exports.updateGlobalShipmentSchema = exports.baseShipmentSchema.partial();
exports.updateShipmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED', 'CANCELLED', 'FAILED']),
    location: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
