import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.patch('/:id/read', authenticate, markAsRead);

export default router;
