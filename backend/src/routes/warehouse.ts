import { Router } from 'express';
import { createWarehouse, getWarehouses, getWarehouseById, updateWarehouse } from '../controllers/warehouse';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createWarehouseSchema, updateWarehouseSchema } from '../schemas/warehouse';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(createWarehouseSchema), createWarehouse);
router.get('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getWarehouses);
router.get('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getWarehouseById);
router.put('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(updateWarehouseSchema), updateWarehouse);

export default router;
