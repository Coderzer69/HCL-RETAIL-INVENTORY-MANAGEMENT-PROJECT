import { Router } from 'express';
import { recordStockMovement, getInventory, createTransfer, updateTransferStatus } from '../controllers/inventory';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { stockMovementSchema, createTransferSchema, updateTransferStatusSchema } from '../schemas/inventory';

const router = Router();

// Inventory
router.get('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getInventory);
router.post('/movements', authenticate, authorize(['ADMIN', 'WAREHOUSE_STAFF']), validate(stockMovementSchema), recordStockMovement);

// Stock Transfers
router.post('/transfers', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), validate(createTransferSchema), createTransfer);
router.put('/transfers/:id/status', authenticate, authorize(['ADMIN', 'WAREHOUSE_STAFF']), validate(updateTransferStatusSchema), updateTransferStatus);

export default router;
