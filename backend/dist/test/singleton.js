"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
const jest_mock_extended_1 = require("jest-mock-extended");
const db_1 = require("../src/config/db");
jest.mock('../src/config/db', () => ({
    __esModule: true,
    prisma: (0, jest_mock_extended_1.mockDeep)(),
}));
beforeEach(() => {
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
});
exports.prismaMock = db_1.prisma;
