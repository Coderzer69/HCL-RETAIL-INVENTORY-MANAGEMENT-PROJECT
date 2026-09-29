import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

export const setupInitialAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      throw new ApiError(403, 'Setup is already complete. Admin user exists.');
    }

    const { email, password, firstName, lastName } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    let role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    if (!role) {
      role = await prisma.role.create({ data: { name: 'ADMIN' } });
    }

    const admin = await prisma.user.create({
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
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, roles } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Default to CUSTOMER if no roles provided
    const userRoles = roles && roles.length > 0 ? roles : ['CUSTOMER'];

    // Ensure roles exist
    const rolesData = [];
    for (const roleName of userRoles) {
      let role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        role = await prisma.role.create({ data: { name: roleName } });
      }
      rolesData.push({ roleId: role.id });
    }

    const user = await prisma.user.create({
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
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.passwordHash) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'User account is deactivated');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles.map((r) => r.role.name) },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

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
  } catch (error) {
    next(error);
  }
};

export const profile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError(401, 'Unauthorized');

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((r: any) => r.role.name),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // With stateless JWT, true invalidation requires a token blacklist (e.g. Redis).
    // For this implementation, we simply instruct the client to discard the token.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
