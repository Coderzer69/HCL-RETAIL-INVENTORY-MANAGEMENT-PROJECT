"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_1 = require("../controllers/inventory");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const inventory_2 = require("../schemas/inventory");
const router = (0, express_1.Router)();
// Inventory
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), inventory_1.getInventory);
router.post('/movements', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'WAREHOUSE_STAFF']), (0, validate_1.validate)(inventory_2.stockMovementSchema), inventory_1.recordStockMovement);
// Stock Transfers
router.post('/transfers', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), (0, validate_1.validate)(inventory_2.createTransferSchema), inventory_1.createTransfer);
router.put('/transfers/:id/status', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'WAREHOUSE_STAFF']), (0, validate_1.validate)(inventory_2.updateTransferStatusSchema), inventory_1.updateTransferStatus);
exports.default = router;
