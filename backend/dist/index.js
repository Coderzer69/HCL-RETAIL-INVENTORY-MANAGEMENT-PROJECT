"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const startServer = async () => {
    try {
        // Check DB Connection
        await db_1.prisma.$connect();
        console.log('✅ Database connected successfully');
        // Start Express Server
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`🚀 Server is running on port ${env_1.env.PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};
startServer();
