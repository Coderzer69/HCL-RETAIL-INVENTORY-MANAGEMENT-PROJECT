import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { userRoles: true }
        }
      }
    });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
