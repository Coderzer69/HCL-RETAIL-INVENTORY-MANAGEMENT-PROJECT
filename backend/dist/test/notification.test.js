"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const singleton_1 = require("./singleton");
const inventory_test_1 = require("./inventory.test");
jest.mock('../src/middleware/auth', () => ({
    authenticate: (req, res, next) => {
        if (!inventory_test_1.testState.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        req.user = inventory_test_1.testState.user;
        next();
    },
    authorize: (roles) => (req, res, next) => {
        const userRoles = req.user.roles.map((r) => r.role.name);
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
        inventory_test_1.testState.user = customerUser;
        singleton_1.prismaMock.notification.findMany.mockResolvedValue([
            { id: 'notif-1', message: 'Hello' }
        ]);
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/notifications')
            .set('Authorization', 'Bearer fake');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(singleton_1.prismaMock.notification.findMany).toHaveBeenCalled();
    });
    it('should mark notification as read', async () => {
        inventory_test_1.testState.user = customerUser;
        singleton_1.prismaMock.notification.findUnique.mockResolvedValue({
            id: 'notif-1',
            userId: 'user-2',
            status: 'PENDING'
        });
        singleton_1.prismaMock.notification.update.mockResolvedValue({
            id: 'notif-1',
            status: 'READ'
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/notifications/notif-1/read')
            .set('Authorization', 'Bearer fake');
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('READ');
    });
    it('should prevent marking another user notification as read', async () => {
        inventory_test_1.testState.user = customerUser;
        singleton_1.prismaMock.notification.findUnique.mockResolvedValue({
            id: 'notif-2',
            userId: 'other-user', // Does not match user-2
            status: 'PENDING'
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/notifications/notif-2/read')
            .set('Authorization', 'Bearer fake');
        expect(res.status).toBe(403);
    });
});
