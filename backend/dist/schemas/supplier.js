"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkProductSchema = exports.createSupplierSchema = void 0;
const zod_1 = require("zod");
exports.createSupplierSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2),
    contactName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
});
exports.linkProductSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    supplierSku: zod_1.z.string().optional(),
    unitCost: zod_1.z.number().positive(),
});
