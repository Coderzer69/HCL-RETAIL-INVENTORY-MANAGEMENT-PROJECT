import { Router } from 'express';
import { register, login, profile, logout, setupInitialAdmin } from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/auth';

const router = Router();

router.post('/setup', validate(registerSchema), setupInitialAdmin);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, profile);
router.get('/profile', authenticate, profile);

export default router;
