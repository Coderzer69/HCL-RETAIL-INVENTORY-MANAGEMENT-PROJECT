"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testState = void 0;
const supertest_1 = __importDefault(require("supertest"));
const singleton_1 = require("./singleton");
// We'll store the current mock user in a mutable object so tests can change it
exports.testState = {
    user: null
};
jest.mock('../src/middleware/auth', () => ({
    authenticate: (req, res, next) => {
        if (!exports.testState.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        req.user = exports.testState.user;
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
const app_1 = __importDefault(require("../src/app"));
describe('Inventory & Transfer APIs', () => {
    const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
    const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const mockAuth = (user) => {
        exports.testState.user = user;
    };
    describe('POST /api/inventory/movements', () => {
        it('should deny access to customers', async () => {
            mockAuth(customerUser);
            const res = await (0, supertest_1.default)(app_1.default)
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
            singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
                return cb(singleton_1.prismaMock);
            });
            singleton_1.prismaMock.inventory.findUnique.mockResolvedValue(null);
            singleton_1.prismaMock.inventory.create.mockResolvedValue({ id: 'inv-1', quantityOnHand: 0 });
            singleton_1.prismaMock.inventory.update.mockResolvedValue({ id: 'inv-1', quantityOnHand: 10 });
            singleton_1.prismaMock.stockMovement.create.mockResolvedValue({ id: 'sm-1' });
            const res = await (0, supertest_1.default)(app_1.default)
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
            expect(singleton_1.prismaMock.stockMovement.create).toHaveBeenCalled();
        });
        it('should fail OUT movement if insufficient stock', async () => {
            mockAuth(adminUser);
            singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
                return cb(singleton_1.prismaMock);
            });
            singleton_1.prismaMock.inventory.findUnique.mockResolvedValue({
                id: 'inv-1',
                quantityOnHand: 5,
                quantityReserved: 0
            });
            const res = await (0, supertest_1.default)(app_1.default)
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
            singleton_1.prismaMock.$transaction.mockImplementation(async (cb) => {
                return cb(singleton_1.prismaMock);
            });
            singleton_1.prismaMock.stockTransfer.create.mockResolvedValue({
                id: 'trans-1',
                sourceWarehouseId: '11111111-1111-4111-8111-111111111111',
                destinationWarehouseId: '22222222-2222-4222-8222-222222222222',
                status: 'PENDING'
            });
            singleton_1.prismaMock.inventory.findUnique.mockResolvedValue({
                id: 'inv-1',
                quantityOnHand: 50,
                quantityReserved: 0
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/inventory/transfers')
                .set('Authorization', 'Bearer faketoken')
                .send({
                sourceWarehouseId: '11111111-1111-4111-8111-111111111111',
                destinationWarehouseId: '22222222-2222-4222-8222-222222222222',
                items: [{ productId: '33333333-3333-4333-8333-333333333333', quantity: 10 }]
            });
            expect(res.status).toBe(201);
            expect(singleton_1.prismaMock.inventory.update).toHaveBeenCalled();
        });
    });
});
