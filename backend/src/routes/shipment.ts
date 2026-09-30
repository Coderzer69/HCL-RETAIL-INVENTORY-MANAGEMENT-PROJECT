import { Router } from 'express';
import { getAllShipments, getShipmentById, createShipment, updateShipment, updateShipmentStatus, deleteShipment } from '../controllers/shipment';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGlobalShipmentSchema, updateGlobalShipmentSchema, updateShipmentStatusSchema } from '../schemas/shipment';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getAllShipments);
router.get('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), getShipmentById);
router.post('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), validate(createGlobalShipmentSchema), createShipment);
router.put('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), validate(updateGlobalShipmentSchema), updateShipment);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), validate(updateShipmentStatusSchema), updateShipmentStatus);
router.delete('/:id', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), deleteShipment);

export default router;
