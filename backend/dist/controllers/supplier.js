"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkProduct = exports.getSupplierById = exports.getAllSuppliers = exports.createSupplier = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const createSupplier = async (req, res) => {
    const { companyName, contactName, phone, address } = req.body;
    const supplier = await db_1.prisma.supplier.create({
        data: { companyName, contactName, phone, address }
    });
    res.status(201).json({ success: true, data: supplier });
};
exports.createSupplier = createSupplier;
const getAllSuppliers = async (req, res) => {
    const suppliers = await db_1.prisma.supplier.findMany({
        include: { products: { include: { product: true } } }
    });
    res.status(200).json({ success: true, data: suppliers });
};
exports.getAllSuppliers = getAllSuppliers;
const getSupplierById = async (req, res) => {
    const supplier = await db_1.prisma.supplier.findUnique({
        where: { id: req.params.id },
        include: { products: { include: { product: true } }, purchaseOrders: true }
    });
    if (!supplier)
        throw new ApiError_1.ApiError(404, 'Supplier not found');
    res.status(200).json({ success: true, data: supplier });
};
exports.getSupplierById = getSupplierById;
const linkProduct = async (req, res) => {
    const { id } = req.params;
    const { productId, supplierSku, unitCost } = req.body;
    const product = await db_1.prisma.product.findUnique({ where: { id: productId } });
    if (!product)
        throw new ApiError_1.ApiError(404, 'Product not found');
    const supplier = await db_1.prisma.supplier.findUnique({ where: { id: id } });
    if (!supplier)
        throw new ApiError_1.ApiError(404, 'Supplier not found');
    const link = await db_1.prisma.productSupplier.upsert({
        where: { productId_supplierId: { productId, supplierId: id } },
        update: { supplierSku, unitCost },
        create: { productId, supplierId: id, supplierSku, unitCost }
    });
    res.status(200).json({ success: true, data: link });
};
exports.linkProduct = linkProduct;
