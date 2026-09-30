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
describe('Supplier Management APIs', () => {
    const customerUser = { id: 'user-2', email: 'customer@test.com', roles: [{ role: { name: 'CUSTOMER' } }] };
    const adminUser = { id: 'user-1', email: 'admin@test.com', roles: [{ role: { name: 'ADMIN' } }] };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const mockAuth = (user) => {
        inventory_test_1.testState.user = user;
    };
    it('should deny customer access to suppliers', async () => {
        mockAuth(customerUser);
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/suppliers')
            .set('Authorization', 'Bearer faketoken');
        expect(res.status).toBe(403);
    });
    it('should allow admin to create supplier', async () => {
        mockAuth(adminUser);
        singleton_1.prismaMock.supplier.create.mockResolvedValue({
            id: 'sup-1',
            companyName: 'Test Supplier',
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/suppliers')
            .set('Authorization', 'Bearer faketoken')
            .send({
            companyName: 'Test Supplier',
        });
        expect(res.status).toBe(201);
        expect(singleton_1.prismaMock.supplier.create).toHaveBeenCalled();
    });
});
