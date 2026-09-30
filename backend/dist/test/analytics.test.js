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
describe('Analytics APIs', () => {
    const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
    const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('should prevent customer from accessing reports', async () => {
        inventory_test_1.testState.user = customerUser;
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/analytics/inventory')
            .set('Authorization', 'Bearer fake');
        expect(res.status).toBe(403);
    });
    it('should fetch inventory report for admin', async () => {
        inventory_test_1.testState.user = adminUser;
        singleton_1.prismaMock.inventory.findMany.mockResolvedValue([
            { id: '1', quantityOnHand: 100, quantityReserved: 0, reorderLevel: 20 },
            { id: '2', quantityOnHand: 15, quantityReserved: 5, reorderLevel: 20 }
        ]);
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/analytics/inventory')
            .set('Authorization', 'Bearer fake');
        expect(res.status).toBe(200);
        expect(res.body.data.totalItems).toBe(2);
        expect(res.body.data.lowStockItems).toBe(1); // Second item has 10 available, reorder is 20
    });
    it('should fetch sales report for admin', async () => {
        inventory_test_1.testState.user = adminUser;
        singleton_1.prismaMock.salesOrder.findMany.mockResolvedValue([
            { id: '1', totalAmount: 100 },
            { id: '2', totalAmount: 250 }
        ]);
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/analytics/sales')
            .set('Authorization', 'Bearer fake');
        expect(res.status).toBe(200);
        expect(res.body.data.totalOrders).toBe(2);
        expect(res.body.data.totalRevenue).toBe(350);
    });
});
