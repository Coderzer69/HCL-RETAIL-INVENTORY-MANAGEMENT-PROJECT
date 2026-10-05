"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoles = exports.getUsers = void 0;
const db_1 = require("../config/db");
const getUsers = async (req, res) => {
    try {
        const users = await db_1.prisma.user.findMany({
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUsers = getUsers;
const getRoles = async (req, res) => {
    try {
        const roles = await db_1.prisma.role.findMany({
            include: {
                _count: {
                    select: { userRoles: true }
                }
            }
        });
        res.status(200).json({ success: true, data: roles });
    }
    catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getRoles = getRoles;
