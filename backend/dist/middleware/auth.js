"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const ApiError_1 = require("../utils/ApiError");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError_1.ApiError(401, 'Unauthorized: No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            include: { roles: { include: { role: true } } },
        });
        if (!user) {
            throw new ApiError_1.ApiError(401, 'Unauthorized: Invalid token');
        }
        if (!user.isActive) {
            throw new ApiError_1.ApiError(403, 'Forbidden: User account is deactivated');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new ApiError_1.ApiError(401, 'Unauthorized: Invalid token'));
        }
        else {
            next(error);
        }
    }
};
exports.authenticate = authenticate;
const authorize = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new ApiError_1.ApiError(401, 'Unauthorized');
            }
            const userRoles = req.user.roles.map((r) => r.role.name);
            const hasRole = requiredRoles.some((role) => userRoles.includes(role));
            if (!hasRole && !userRoles.includes('ADMIN')) {
                throw new ApiError_1.ApiError(403, 'Forbidden: Insufficient permissions');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorize = authorize;
