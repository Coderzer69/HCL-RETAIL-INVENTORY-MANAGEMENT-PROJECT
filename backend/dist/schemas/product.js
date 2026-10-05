"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    parentId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().optional(),
});
exports.createProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1),
    barcode: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().uuid().optional(),
    description: zod_1.z.string().optional(),
    basePrice: zod_1.z.number().min(0),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateProductSchema = exports.createProductSchema.partial();
