import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

// ---------------------------------------------------------
// Category CRUD
// ---------------------------------------------------------

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ include: { children: true } });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------
// Product CRUD
// ---------------------------------------------------------

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku, barcode } = req.body;

    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { barcode: barcode || undefined }] }
    });

    if (existing) {
      throw new ApiError(400, 'Product with this SKU or Barcode already exists');
    }

    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, categoryId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
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
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      include: { category: true, inventory: true }
    });

    if (!product) throw new ApiError(404, 'Product not found');
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: req.body
    });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      next(new ApiError(404, 'Product not found'));
    } else {
      next(error);
    }
  }
};
