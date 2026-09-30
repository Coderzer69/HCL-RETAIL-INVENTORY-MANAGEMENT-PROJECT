"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveGoodsSchema = exports.updatePOStatusSchema = exports.createPOSchema = void 0;
const zod_1 = require("zod");
exports.createPOSchema = zod_1.z.object({
    supplierId: zod_1.z.string().uuid(),
    destinationWarehouseId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantityOrdered: zod_1.z.number().int().positive(),
    })).min(1),
});
exports.updatePOStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'SUBMITTED', 'CANCELLED']),
});
exports.receiveGoodsSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantityReceived: zod_1.z.number().int().positive(),
    })).min(1),
});
