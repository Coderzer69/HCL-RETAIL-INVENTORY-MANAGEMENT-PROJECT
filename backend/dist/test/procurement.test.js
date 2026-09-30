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
describe('Procurement APIs', () => {
    const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
    const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const mockAuth = (user) => {
        inventory_test_1.testState.user = user;
    };
    it('should allow admin to create purchase order', async () => {
        mockAuth(adminUser);
        singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
            return cb(singleton_1.prismaMock);
        });
        singleton_1.prismaMock.productSupplier.findMany.mockResolvedValue([
            { productId: '11111111-1111-4111-8111-111111111111', supplierId: '22222222-2222-4222-8222-222222222222', unitCost: 50 }
        ]);
        singleton_1.prismaMock.purchaseOrder.create.mockResolvedValue({
            id: 'po-1',
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/procurement')
            .set('Authorization', 'Bearer faketoken')
            .send({
            supplierId: '22222222-2222-4222-8222-222222222222',
            destinationWarehouseId: '33333333-3333-4333-8333-333333333333',
            items: [{ productId: '11111111-1111-4111-8111-111111111111', quantityOrdered: 100 }]
        });
        expect(res.status).toBe(201);
        expect(singleton_1.prismaMock.purchaseOrder.create).toHaveBeenCalled();
    });
    it('should receive partial goods on PO', async () => {
        mockAuth(adminUser);
        singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
            return cb(singleton_1.prismaMock);
        });
        singleton_1.prismaMock.purchaseOrder.findUnique.mockResolvedValue({
            id: 'po-1',
            status: 'SUBMITTED',
            destinationWarehouseId: '33333333-3333-4333-8333-333333333333',
            items: [
                { id: 'item-1', productId: '11111111-1111-4111-8111-111111111111', quantityOrdered: 100, quantityReceived: 0 }
            ]
        });
        singleton_1.prismaMock.purchaseOrder.update.mockResolvedValue({
            id: 'po-1',
            status: 'PARTIAL',
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/procurement/po-1/receive')
            .set('Authorization', 'Bearer faketoken')
            .send({
            items: [{ productId: '11111111-1111-4111-8111-111111111111', quantityReceived: 50 }]
        });
        expect(res.status).toBe(200);
        expect(singleton_1.prismaMock.inventory.upsert).toHaveBeenCalled();
        expect(singleton_1.prismaMock.stockMovement.create).toHaveBeenCalled();
        expect(singleton_1.prismaMock.purchaseOrder.update).toHaveBeenCalled();
    });
});
