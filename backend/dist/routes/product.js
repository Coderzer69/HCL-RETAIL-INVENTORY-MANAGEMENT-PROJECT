"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_1 = require("../controllers/product");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const product_2 = require("../schemas/product");
const router = (0, express_1.Router)();
// Categories
router.post('/categories', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER']), (0, validate_1.validate)(product_2.createCategorySchema), product_1.createCategory);
router.get('/categories', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), product_1.getCategories);
// Products
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER']), (0, validate_1.validate)(product_2.createProductSchema), product_1.createProduct);
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), product_1.getProducts);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_STAFF']), product_1.getProductById);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER']), (0, validate_1.validate)(product_2.updateProductSchema), product_1.updateProduct);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'STORE_MANAGER']), product_1.deleteProduct);
exports.default = router;
