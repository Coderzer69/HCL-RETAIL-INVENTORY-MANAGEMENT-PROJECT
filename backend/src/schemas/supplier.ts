import { z } from 'zod';

export const createSupplierSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const linkProductSchema = z.object({
  productId: z.string().uuid(),
  supplierSku: z.string().optional(),
  unitCost: z.number().positive(),
});
