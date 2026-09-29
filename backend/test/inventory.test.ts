import request from 'supertest';
import { prismaMock } from './singleton';

// We'll store the current mock user in a mutable object so tests can change it
export const testState = {
  user: null as any
};

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    if (!testState.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    req.user = testState.user;
    next();
  },
  authorize: (roles: string[]) => (req: any, res: any, next: any) => {
    const userRoles = req.user.roles.map((r: any) => r.role.name);
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole && !userRoles.includes('ADMIN')) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  }
}));

import app from '../src/app';

describe('Inventory & Transfer APIs', () => {
  const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
  const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockAuth = (user: any) => {
    testState.user = user;
  };

  describe('POST /api/inventory/movements', () => {
    it('should deny access to customers', async () => {
      mockAuth(customerUser);
      const res = await request(app)
        .post('/api/inventory/movements')
        .set('Authorization', 'Bearer faketoken')
        .send({
          productId: '11111111-1111-4111-8111-111111111111',
          warehouseId: '22222222-2222-4222-8222-222222222222',
          quantity: 10,
          movementType: 'IN'
        });
      
      expect(res.status).toBe(403);
    });

    it('should allow admin and process movement', async () => {
      mockAuth(adminUser);
      
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock as any);
      });

      prismaMock.inventory.findUnique.mockResolvedValue(null);
      prismaMock.inventory.create.mockResolvedValue({ id: 'inv-1', quantityOnHand: 0 } as any);
      prismaMock.inventory.update.mockResolvedValue({ id: 'inv-1', quantityOnHand: 10 } as any);
      prismaMock.stockMovement.create.mockResolvedValue({ id: 'sm-1' } as any);

      const res = await request(app)
        .post('/api/inventory/movements')
        .set('Authorization', 'Bearer faketoken')
        .send({
          productId: '11111111-1111-4111-8111-111111111111',
          warehouseId: '22222222-2222-4222-8222-222222222222',
          quantity: 10,
          movementType: 'IN'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.stockMovement.create).toHaveBeenCalled();
    });

    it('should fail OUT movement if insufficient stock', async () => {
      mockAuth(adminUser);
      
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock as any);
      });

      prismaMock.inventory.findUnique.mockResolvedValue({
        id: 'inv-1',
        quantityOnHand: 5,
        quantityReserved: 0
      } as any);

      const res = await request(app)
        .post('/api/inventory/movements')
        .set('Authorization', 'Bearer faketoken')
        .send({
          productId: '11111111-1111-4111-8111-111111111111',
          warehouseId: '22222222-2222-4222-8222-222222222222',
          quantity: 10,
          movementType: 'OUT'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('POST /api/inventory/transfers', () => {
    it('should create transfer and reserve stock', async () => {
      mockAuth(adminUser);

      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock as any);
      });

      prismaMock.stockTransfer.create.mockResolvedValue({
        id: 'trans-1',
        sourceWarehouseId: '11111111-1111-4111-8111-111111111111',
        destinationWarehouseId: '22222222-2222-4222-8222-222222222222',
        status: 'PENDING'
      } as any);

      prismaMock.inventory.findUnique.mockResolvedValue({
        id: 'inv-1',
        quantityOnHand: 50,
        quantityReserved: 0
      } as any);

      const res = await request(app)
        .post('/api/inventory/transfers')
        .set('Authorization', 'Bearer faketoken')
        .send({
          sourceWarehouseId: '11111111-1111-4111-8111-111111111111',
          destinationWarehouseId: '22222222-2222-4222-8222-222222222222',
          items: [{ productId: '33333333-3333-4333-8333-333333333333', quantity: 10 }]
        });

      expect(res.status).toBe(201);
      expect(prismaMock.inventory.update).toHaveBeenCalled();
    });
  });
});
