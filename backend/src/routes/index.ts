import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './product';
import warehouseRoutes from './warehouse';
import inventoryRoutes from './inventory';
import orderRoutes from './order';
import supplierRoutes from './supplier';
import procurementRoutes from './procurement';
import analyticsRoutes from './analytics';
import notificationRoutes from './notification';
import shipmentRoutes from './shipment';
import userRoutes from './user';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/procurement', procurementRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/users', userRoutes);

export default router;
