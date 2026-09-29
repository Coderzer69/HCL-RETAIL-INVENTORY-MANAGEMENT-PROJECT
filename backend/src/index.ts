import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

const startServer = async () => {
  try {
    // Check DB Connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start Express Server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
