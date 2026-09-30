import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getUsers, getRoles } from '../controllers/user';

const router = Router();

router.use(authenticate);

router.get('/', getUsers);
router.get('/roles', getRoles);

export default router;
