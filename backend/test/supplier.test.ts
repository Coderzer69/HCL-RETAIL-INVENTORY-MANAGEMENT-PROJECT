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

describe('Supplier Management APIs', () => {
  const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
  const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockAuth = (user: any) => {
    testState.user = user;
  };

  it('should deny customer access to suppliers', async () => {
    mockAuth(customerUser);

    const res = await request(app)
      .get('/api/suppliers')
      .set('Authorization', 'Bearer faketoken');

    expect(res.status).toBe(403);
  });

  it('should allow admin to create supplier', async () => {
    mockAuth(adminUser);

    prismaMock.supplier.create.mockResolvedValue({
      id: 'sup-1',
      companyName: 'Test Supplier',
    } as any);

    const res = await request(app)
      .post('/api/suppliers')
      .set('Authorization', 'Bearer faketoken')
      .send({
        companyName: 'Test Supplier',
      });

    expect(res.status).toBe(201);
    expect(prismaMock.supplier.create).toHaveBeenCalled();
  });
});
