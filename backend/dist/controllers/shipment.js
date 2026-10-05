"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShipment = exports.updateShipmentStatus = exports.updateShipment = exports.createShipment = exports.getShipmentById = exports.getAllShipments = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const getAllShipments = async (req, res, next) => {
    try {
        const shipments = await db_1.prisma.shipment.findMany({
            include: {
                salesOrder: {
                    include: {
                        customer: { select: { firstName: true, lastName: true, email: true } },
                        items: { include: { product: true } }
                    }
                },
                purchaseOrder: {
                    include: {
                        supplier: true,
                        items: { include: { product: true } }
                    }
                },
                events: { orderBy: { timestamp: 'desc' } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: shipments });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllShipments = getAllShipments;
const getShipmentById = async (req, res, next) => {
    try {
        const shipment = await db_1.prisma.shipment.findUnique({
            where: { id: req.params.id },
            include: {
                salesOrder: {
                    include: {
                        customer: { select: { firstName: true, lastName: true, email: true } },
                        items: { include: { product: true } }
                    }
                },
                purchaseOrder: {
                    include: {
                        supplier: true,
                        items: { include: { product: true } }
                    }
                },
                events: { orderBy: { timestamp: 'desc' } }
            }
        });
        if (!shipment)
            throw new ApiError_1.ApiError(404, 'Shipment not found');
        res.status(200).json({ success: true, data: shipment });
    }
    catch (error) {
        next(error);
    }
};
exports.getShipmentById = getShipmentById;
const createShipment = async (req, res, next) => {
    try {
        const { type, salesOrderId, purchaseOrderId, trackingNumber, carrier, status, originAddress, destinationAddress, estimatedDeliveryDate } = req.body;
        const shipmentNumber = `SH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newShipment = await db_1.prisma.shipment.create({
            data: {
                shipmentNumber,
                type,
                salesOrderId,
                purchaseOrderId,
                trackingNumber,
                carrier,
                status: status || 'PENDING',
                originAddress,
                destinationAddress,
                estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
                events: {
                    create: {
                        status: status || 'PENDING',
                        description: 'Shipment created'
                    }
                }
            },
            include: { events: true }
        });
        res.status(201).json({ success: true, data: newShipment });
    }
    catch (error) {
        next(error);
    }
};
exports.createShipment = createShipment;
const updateShipment = async (req, res, next) => {
    try {
        const { estimatedDeliveryDate, ...data } = req.body;
        if (estimatedDeliveryDate) {
            data.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
        }
        const updated = await db_1.prisma.shipment.update({
            where: { id: req.params.id },
            data
        });
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        if (error.code === 'P2025')
            next(new ApiError_1.ApiError(404, 'Shipment not found'));
        else
            next(error);
    }
};
exports.updateShipment = updateShipment;
const updateShipmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, location, description } = req.body;
        const shipment = await db_1.prisma.shipment.findUnique({ where: { id: id } });
        if (!shipment)
            throw new ApiError_1.ApiError(404, 'Shipment not found');
        const updateData = { status };
        if (status === 'SHIPPED' && !shipment.shippedAt)
            updateData.shippedAt = new Date();
        if (status === 'DELIVERED')
            updateData.deliveredAt = new Date();
        const updatedShipment = await db_1.prisma.$transaction(async (tx) => {
            const updated = await tx.shipment.update({
                where: { id: id },
                data: updateData
            });
            await tx.shipmentEvent.create({
                data: {
                    shipmentId: id,
                    status,
                    location,
                    description: description || `Status updated to ${status}`
                }
            });
            return updated;
        });
        res.status(200).json({ success: true, data: updatedShipment });
    }
    catch (error) {
        next(error);
    }
};
exports.updateShipmentStatus = updateShipmentStatus;
const deleteShipment = async (req, res, next) => {
    try {
        await db_1.prisma.shipment.delete({
            where: { id: req.params.id }
        });
        res.status(200).json({ success: true, message: 'Shipment deleted successfully' });
    }
    catch (error) {
        if (error.code === 'P2025')
            next(new ApiError_1.ApiError(404, 'Shipment not found'));
        else
            next(error);
    }
};
exports.deleteShipment = deleteShipment;
