"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const error_1 = require("./middleware/error");
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Retail Management Backend is running!',
    });
});
// Routes
app.use('/api', routes_1.default);
// Global Error Handler
app.use(error_1.errorHandler);
exports.default = app;
