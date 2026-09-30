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
describe('Order & Fulfillment APIs', () => {
    const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
    const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const mockAuth = (user) => {
        inventory_test_1.testState.user = user;
    };
    it('should allow customer to create an order', async () => {
        mockAuth(customerUser);
        singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
            return cb(singleton_1.prismaMock);
        });
        singleton_1.prismaMock.product.findMany.mockResolvedValue([
            { id: '11111111-1111-4111-8111-111111111111', basePrice: 100, isActive: true }
        ]);
        singleton_1.prismaMock.inventory.findMany.mockResolvedValue([
            { id: 'inv-1', quantityOnHand: 50, quantityReserved: 0 }
        ]);
        singleton_1.prismaMock.salesOrder.create.mockResolvedValue({
            id: 'so-1',
            status: 'PENDING',
            totalAmount: 200
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/orders')
            .set('Authorization', 'Bearer faketoken')
            .send({
            items: [{ productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }],
            shippingAddress: '123 Test St'
        });
        expect(res.status).toBe(201);
        expect(singleton_1.prismaMock.salesOrder.create).toHaveBeenCalled();
    });
    it('should allow admin to confirm order and reserve stock', async () => {
        mockAuth(adminUser);
        singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
            return cb(singleton_1.prismaMock);
        });
        singleton_1.prismaMock.salesOrder.findUnique.mockResolvedValue({
            id: 'so-1',
            status: 'PENDING',
            items: [
                { id: 'item-1', productId: '11111111-1111-4111-8111-111111111111', quantity: 2 }
            ]
        });
        singleton_1.prismaMock.inventory.findMany.mockResolvedValue([
            { id: 'inv-1', warehouseId: '22222222-2222-4222-8222-222222222222', quantityOnHand: 50, quantityReserved: 0 }
        ]);
        singleton_1.prismaMock.salesOrder.update.mockResolvedValue({
            id: 'so-1',
            status: 'CONFIRMED',
            customerId: 'user-2'
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/orders/so-1/status')
            .set('Authorization', 'Bearer faketoken')
            .send({ status: 'CONFIRMED' });
        expect(res.status).toBe(200);
        expect(singleton_1.prismaMock.inventory.update).toHaveBeenCalled(); // Reserved stock
        expect(singleton_1.prismaMock.salesOrder.update).toHaveBeenCalled();
    });
});
