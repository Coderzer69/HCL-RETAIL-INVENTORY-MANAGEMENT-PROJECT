import { Router } from 'express';
import { createSupplier, getAllSuppliers, getSupplierById, linkProduct } from '../controllers/supplier';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSupplierSchema, linkProductSchema } from '../schemas/supplier';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN']), validate(createSupplierSchema), createSupplier);
router.get('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), getAllSuppliers);
router.get('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), getSupplierById);
router.post('/:id/products', authenticate, authorize(['ADMIN']), validate(linkProductSchema), linkProduct);

export default router;
