"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_1 = require("../controllers/notification");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, notification_1.getMyNotifications);
router.patch('/:id/read', auth_1.authenticate, notification_1.markAsRead);
exports.default = router;
