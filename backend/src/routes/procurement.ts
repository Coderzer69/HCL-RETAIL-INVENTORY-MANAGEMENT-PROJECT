import { Router } from 'express';
import { createPO, updatePOStatus, receiveGoods } from '../controllers/procurement';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPOSchema, updatePOStatusSchema, receiveGoodsSchema } from '../schemas/procurement';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(createPOSchema), createPO);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'STORE_MANAGER']), validate(updatePOStatusSchema), updatePOStatus);
router.post('/:id/receive', authenticate, authorize(['ADMIN', 'WAREHOUSE_STAFF']), validate(receiveGoodsSchema), receiveGoods);

export default router;
