import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, createShipment } from '../controllers/order';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema, createShipmentSchema } from '../schemas/order';

const router = Router();

router.post('/', authenticate, authorize(['CUSTOMER']), validate(createOrderSchema), createOrder);
router.get('/my', authenticate, authorize(['CUSTOMER']), getMyOrders);
router.get('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), getAllOrders);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/shipments', authenticate, authorize(['ADMIN', 'WAREHOUSE_STAFF']), validate(createShipmentSchema), createShipment);

export default router;
