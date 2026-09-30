"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.profile = exports.login = exports.register = exports.setupInitialAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const setupInitialAdmin = async (req, res, next) => {
    try {
        const userCount = await db_1.prisma.user.count();
        if (userCount > 0) {
            throw new ApiError_1.ApiError(403, 'Setup is already complete. Admin user exists.');
        }
        const { email, password, firstName, lastName } = req.body;
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        let role = await db_1.prisma.role.findUnique({ where: { name: 'ADMIN' } });
        if (!role) {
            role = await db_1.prisma.role.create({ data: { name: 'ADMIN' } });
        }
        const admin = await db_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                roles: { create: [{ roleId: role.id }] },
            },
            include: { roles: { include: { role: true } } },
        });
        res.status(201).json({
            success: true,
            message: 'Initial Admin account is created successfully',
            data: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                roles: admin.roles.map((r) => r.role.name),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.setupInitialAdmin = setupInitialAdmin;
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, roles } = req.body;
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ApiError_1.ApiError(400, 'User with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        // Default to CUSTOMER if no roles provided
        const userRoles = roles && roles.length > 0 ? roles : ['CUSTOMER'];
        // Ensure roles exist
        const rolesData = [];
        for (const roleName of userRoles) {
            let role = await db_1.prisma.role.findUnique({ where: { name: roleName } });
            if (!role) {
                role = await db_1.prisma.role.create({ data: { name: roleName } });
            }
            rolesData.push({ roleId: role.id });
        }
        const user = await db_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                roles: {
                    create: rolesData,
                },
            },
            include: {
                roles: { include: { role: true } },
            },
        });
        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map((r) => r.role.name),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.prisma.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } },
        });
        if (!user || !user.passwordHash) {
            throw new ApiError_1.ApiError(401, 'Invalid email or password');
        }
        if (!user.isActive) {
            throw new ApiError_1.ApiError(403, 'User account is deactivated');
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new ApiError_1.ApiError(401, 'Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, roles: user.roles.map((r) => r.role.name) }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        res.status(200).json({
            success: true,
            token,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map((r) => r.role.name),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const profile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            throw new ApiError_1.ApiError(401, 'Unauthorized');
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map((r) => r.role.name),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.profile = profile;
const logout = async (req, res, next) => {
    try {
        // With stateless JWT, true invalidation requires a token blacklist (e.g. Redis).
        // For this implementation, we simply instruct the client to discard the token.
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
