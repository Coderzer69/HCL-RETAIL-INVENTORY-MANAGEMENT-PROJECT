import request from 'supertest';
import app from '../src/app';
import { prismaMock } from './singleton';
import { testState } from './inventory.test';

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

describe('Order & Fulfillment APIs', () => {
  const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
  const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockAuth = (user: any) => {
    testState.user = user;
  };

  it('should allow customer to create an order', async () => {
    mockAuth(customerUser);

    prismaMock.$transaction.mockImplementation(async (cb) => {
      return cb(prismaMock as any);
    });

    prismaMock.product.findMany.mockResolvedValue([
      { id: '11111111-1111-4111-8111-111111111111', basePrice: 100, isActive: true }
    ] as any);

    prismaMock.inventory.findMany.mockResolvedValue([
      { id: 'inv-1', quantityOnHand: 50, quantityReserved: 0 }
    ] as any);

    prismaMock.salesOrder.create.mockResolvedValue({
      id: 'so-1',
      status: 'PENDING',
      totalAmount: 200
    } as any);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer faketoken')
      .send({
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }],
        shippingAddress: '123 Test St'
      });

    expect(res.status).toBe(201);
    expect(prismaMock.salesOrder.create).toHaveBeenCalled();
  });

  it('should allow admin to confirm order and reserve stock', async () => {
    mockAuth(adminUser);

    prismaMock.$transaction.mockImplementation(async (cb) => {
      return cb(prismaMock as any);
    });

    prismaMock.salesOrder.findUnique.mockResolvedValue({
      id: 'so-1',
      status: 'PENDING',
      items: [
        { id: 'item-1', productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }
      ]
    } as any);

    prismaMock.inventory.findMany.mockResolvedValue([
      { id: 'inv-1', warehouseId: '22222222-2222-4222-8222-222222222222', quantityOnHand: 50, quantityReserved: 0 }
    ] as any);

    prismaMock.salesOrder.update.mockResolvedValue({
      id: 'so-1',
      status: 'CONFIRMED',
      customerId: 'user-2'
    } as any);

    const res = await request(app)
      .patch('/api/orders/so-1/status')
      .set('Authorization', 'Bearer faketoken')
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(prismaMock.inventory.update).toHaveBeenCalled(); // Reserved stock
    expect(prismaMock.salesOrder.update).toHaveBeenCalled();
  });
});
