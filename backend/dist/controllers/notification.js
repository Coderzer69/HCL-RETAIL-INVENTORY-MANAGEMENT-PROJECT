"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getMyNotifications = void 0;
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const getMyNotifications = async (req, res) => {
    const notifications = await db_1.prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: notifications });
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (req, res) => {
    const { id } = req.params;
    const notification = await db_1.prisma.notification.findUnique({
        where: { id: id }
    });
    if (!notification)
        throw new ApiError_1.ApiError(404, 'Notification not found');
    if (notification.userId !== req.user.id) {
        throw new ApiError_1.ApiError(403, 'Forbidden');
    }
    const updated = await db_1.prisma.notification.update({
        where: { id: id },
        data: { status: 'READ' }
    });
    res.status(200).json({ success: true, data: updated });
};
exports.markAsRead = markAsRead;
