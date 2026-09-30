"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWarehouse = exports.getWarehouseById = exports.getWarehouses = exports.createWarehouse = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const createWarehouse = async (req, res, next) => {
    try {
        const { locationCode } = req.body;
        const existing = await db_1.prisma.warehouse.findUnique({ where: { locationCode } });
        if (existing)
            throw new ApiError_1.ApiError(400, 'Warehouse with this location code already exists');
        const warehouse = await db_1.prisma.warehouse.create({ data: req.body });
        res.status(201).json({ success: true, data: warehouse });
    }
    catch (error) {
        next(error);
    }
};
exports.createWarehouse = createWarehouse;
const getWarehouses = async (req, res, next) => {
    try {
        const warehouses = await db_1.prisma.warehouse.findMany({
            include: { manager: { select: { id: true, firstName: true, lastName: true } } }
        });
        res.status(200).json({ success: true, data: warehouses });
    }
    catch (error) {
        next(error);
    }
};
exports.getWarehouses = getWarehouses;
const getWarehouseById = async (req, res, next) => {
    try {
        const warehouse = await db_1.prisma.warehouse.findUnique({
            where: { id: req.params.id },
            include: { manager: { select: { id: true, firstName: true, lastName: true } } }
        });
        if (!warehouse)
            throw new ApiError_1.ApiError(404, 'Warehouse not found');
        res.status(200).json({ success: true, data: warehouse });
    }
    catch (error) {
        next(error);
    }
};
exports.getWarehouseById = getWarehouseById;
const updateWarehouse = async (req, res, next) => {
    try {
        const warehouse = await db_1.prisma.warehouse.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.status(200).json({ success: true, data: warehouse });
    }
    catch (error) {
        next(error);
    }
};
exports.updateWarehouse = updateWarehouse;
