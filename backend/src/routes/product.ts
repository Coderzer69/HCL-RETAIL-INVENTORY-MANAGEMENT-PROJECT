import { Router } from 'express';
import { createCategory, getCategories, createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, createProductSchema, updateProductSchema } from '../schemas/product';

const router = Router();

// Categories
router.post('/categories', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(createCategorySchema), createCategory);
router.get('/categories', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getCategories);

// Products
router.post('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(createProductSchema), createProduct);
router.get('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getProducts);
router.get('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getProductById);
router.put('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), deleteProduct);

export default router;
