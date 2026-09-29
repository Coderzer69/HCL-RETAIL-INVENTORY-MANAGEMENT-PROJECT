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

describe('Procurement APIs', () => {
  const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
  const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockAuth = (user: any) => {
    testState.user = user;
  };

  it('should allow admin to create purchase order', async () => {
    mockAuth(adminUser);

    prismaMock.$transaction.mockImplementation(async (cb) => {
      return cb(prismaMock as any);
    });

    prismaMock.productSupplier.findMany.mockResolvedValue([
      { productId: '11111111-1111-4111-8111-111111111111', supplierId: '22222222-2222-4222-8222-222222222222', unitCost: 50 }
    ] as any);

    prismaMock.purchaseOrder.create.mockResolvedValue({
      id: 'po-1',
    } as any);

    const res = await request(app)
      .post('/api/procurement')
      .set('Authorization', 'Bearer faketoken')
      .send({
        supplierId: '22222222-2222-4222-8222-222222222222',
        destinationWarehouseId: '33333333-3333-4333-8333-333333333333',
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantityOrdered: 100 }]
      });

    expect(res.status).toBe(201);
    expect(prismaMock.purchaseOrder.create).toHaveBeenCalled();
  });

  it('should receive partial goods on PO', async () => {
    mockAuth(adminUser);

    prismaMock.$transaction.mockImplementation(async (cb) => {
      return cb(prismaMock as any);
    });

    prismaMock.purchaseOrder.findUnique.mockResolvedValue({
      id: 'po-1',
      status: 'SUBMITTED',
      destinationWarehouseId: '33333333-3333-4333-8333-333333333333',
      items: [
        { id: 'item-1', productId: '11111111-1111-4111-8111-111111111111', quantityOrdered: 100, quantityReceived: 0 }
      ]
    } as any);

    prismaMock.purchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      status: 'PARTIAL',
    } as any);

    const res = await request(app)
      .post('/api/procurement/po-1/receive')
      .set('Authorization', 'Bearer faketoken')
      .send({
        items: [{ productId: '11111111-1111-4111-8111-111111111111', quantityReceived: 50 }]
      });

    expect(res.status).toBe(200);
    expect(prismaMock.inventory.upsert).toHaveBeenCalled();
    expect(prismaMock.stockMovement.create).toHaveBeenCalled();
    expect(prismaMock.purchaseOrder.update).toHaveBeenCalled();
  });
});
