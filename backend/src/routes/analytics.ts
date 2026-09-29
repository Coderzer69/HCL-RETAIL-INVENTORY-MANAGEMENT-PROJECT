import { Router } from 'express';
import { getInventoryReport, getSalesReport, getProcurementReport, getStockMovementHistory } from '../controllers/analytics';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/inventory', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), getInventoryReport);
router.get('/sales', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), getSalesReport);
router.get('/procurement', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), getProcurementReport);
router.get('/movements', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getStockMovementHistory);

export default router;
