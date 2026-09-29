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

describe('Notification APIs', () => {
  const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch my notifications', async () => {
    testState.user = customerUser;
    
    prismaMock.notification.findMany.mockResolvedValue([
      { id: 'notif-1', message: 'Hello' }
    ] as any);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer fake');
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(prismaMock.notification.findMany).toHaveBeenCalled();
  });

  it('should mark notification as read', async () => {
    testState.user = customerUser;
    
    prismaMock.notification.findUnique.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-2',
      status: 'PENDING'
    } as any);

    prismaMock.notification.update.mockResolvedValue({
      id: 'notif-1',
      status: 'READ'
    } as any);

    const res = await request(app)
      .patch('/api/notifications/notif-1/read')
      .set('Authorization', 'Bearer fake');
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('READ');
  });

  it('should prevent marking another user notification as read', async () => {
    testState.user = customerUser;
    
    prismaMock.notification.findUnique.mockResolvedValue({
      id: 'notif-2',
      userId: 'other-user', // Does not match user-2
      status: 'PENDING'
    } as any);

    const res = await request(app)
      .patch('/api/notifications/notif-2/read')
      .set('Authorization', 'Bearer fake');
    
    expect(res.status).toBe(403);
  });
});
