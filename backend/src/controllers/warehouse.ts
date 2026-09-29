import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { locationCode } = req.body;
    
    const existing = await prisma.warehouse.findUnique({ where: { locationCode } });
    if (existing) throw new ApiError(400, 'Warehouse with this location code already exists');

    const warehouse = await prisma.warehouse.create({ data: req.body });
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: { manager: { select: { id: true, firstName: true, lastName: true } } }
    });
    res.status(200).json({ success: true, data: warehouses });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: req.params.id as string },
      include: { manager: { select: { id: true, firstName: true, lastName: true } } }
    });
    if (!warehouse) throw new ApiError(404, 'Warehouse not found');
    res.status(200).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const warehouse = await prisma.warehouse.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.status(200).json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};
