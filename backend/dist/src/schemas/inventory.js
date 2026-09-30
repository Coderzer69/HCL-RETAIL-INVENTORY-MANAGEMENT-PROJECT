"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransferStatusSchema = exports.createTransferSchema = exports.stockMovementSchema = void 0;
const zod_1 = require("zod");
exports.stockMovementSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    warehouseId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int(),
    movementType: zod_1.z.enum(['IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUST']),
    notes: zod_1.z.string().optional(),
});
exports.createTransferSchema = zod_1.z.object({
    sourceWarehouseId: zod_1.z.string().uuid(),
    destinationWarehouseId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
    })).min(1),
});
exports.updateTransferStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['IN_TRANSIT', 'COMPLETED', 'CANCELLED']),
});
