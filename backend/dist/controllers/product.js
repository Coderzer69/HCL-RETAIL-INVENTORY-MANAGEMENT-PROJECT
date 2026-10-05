"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = exports.getCategories = exports.createCategory = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
// ---------------------------------------------------------
// Category CRUD
// ---------------------------------------------------------
const createCategory = async (req, res, next) => {
    try {
        const category = await db_1.prisma.category.create({ data: req.body });
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res, next) => {
    try {
        const categories = await db_1.prisma.category.findMany({ include: { children: true } });
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// ---------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------
const createProduct = async (req, res, next) => {
    try {
        const { sku, barcode } = req.body;
        const existing = await db_1.prisma.product.findFirst({
            where: { OR: [{ sku }, { barcode: barcode || undefined }] }
        });
        if (existing) {
            throw new ApiError_1.ApiError(400, 'Product with this SKU or Barcode already exists');
        }
        const product = await db_1.prisma.product.create({ data: req.body });
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res, next) => {
    try {
        const { search, categoryId, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const where = {};
        if (categoryId)
            where.categoryId = categoryId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, products] = await Promise.all([
            db_1.prisma.product.count({ where }),
            db_1.prisma.product.findMany({
                where,
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                include: { category: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);
        res.status(200).json({
            success: true,
            data: products,
            pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res, next) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: req.params.id },
            include: { category: true, inventory: true }
        });
        if (!product)
            throw new ApiError_1.ApiError(404, 'Product not found');
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res, next) => {
    try {
        const product = await db_1.prisma.product.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        await db_1.prisma.product.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            next(new ApiError_1.ApiError(404, 'Product not found'));
        }
        else {
            next(error);
        }
    }
};
exports.deleteProduct = deleteProduct;
