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

describe('Analytics APIs', () => {
  const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
  const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should prevent customer from accessing reports', async () => {
    testState.user = customerUser;
    const res = await request(app)
      .get('/api/analytics/inventory')
      .set('Authorization', 'Bearer fake');
    
    expect(res.status).toBe(403);
  });

  it('should fetch inventory report for admin', async () => {
    testState.user = adminUser;
    
    prismaMock.inventory.findMany.mockResolvedValue([
      { id: '1', quantityOnHand: 100, quantityReserved: 0, reorderLevel: 20 },
      { id: '2', quantityOnHand: 15, quantityReserved: 5, reorderLevel: 20 }
    ] as any);

    const res = await request(app)
      .get('/api/analytics/inventory')
      .set('Authorization', 'Bearer fake');
    
    expect(res.status).toBe(200);
    expect(res.body.data.totalItems).toBe(2);
    expect(res.body.data.lowStockItems).toBe(1); // Second item has 10 available, reorder is 20
  });

  it('should fetch sales report for admin', async () => {
    testState.user = adminUser;
    
    prismaMock.salesOrder.findMany.mockResolvedValue([
      { id: '1', totalAmount: 100 },
      { id: '2', totalAmount: 250 }
    ] as any);

    const res = await request(app)
      .get('/api/analytics/sales')
      .set('Authorization', 'Bearer fake');
    
    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBe(2);
    expect(res.body.data.totalRevenue).toBe(350);
  });
});
