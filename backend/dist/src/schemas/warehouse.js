"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWarehouseSchema = exports.createWarehouseSchema = void 0;
const zod_1 = require("zod");
exports.createWarehouseSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    locationCode: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    managerId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateWarehouseSchema = exports.createWarehouseSchema.partial();
