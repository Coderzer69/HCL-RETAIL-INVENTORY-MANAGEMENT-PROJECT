import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

export const createSupplier = async (req: Request, res: Response) => {
  const { companyName, contactName, phone, address } = req.body;

  const supplier = await prisma.supplier.create({
    data: { companyName, contactName, phone, address }
  });

  res.status(201).json({ success: true, data: supplier });
};

export const getAllSuppliers = async (req: Request, res: Response) => {
  const suppliers = await prisma.supplier.findMany({
    include: { products: { include: { product: true } } }
  });
  res.status(200).json({ success: true, data: suppliers });
};

export const getSupplierById = async (req: Request, res: Response) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id as string },
    include: { products: { include: { product: true } }, purchaseOrders: true }
  });

  if (!supplier) throw new ApiError(404, 'Supplier not found');

  res.status(200).json({ success: true, data: supplier });
};

export const linkProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { productId, supplierSku, unitCost } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found');

  const supplier = await prisma.supplier.findUnique({ where: { id: id as string } });
  if (!supplier) throw new ApiError(404, 'Supplier not found');

  const link = await prisma.productSupplier.upsert({
    where: { productId_supplierId: { productId, supplierId: id as string } },
    update: { supplierSku, unitCost },
    create: { productId, supplierId: id as string, supplierSku, unitCost }
  });

  res.status(200).json({ success: true, data: link });
};
