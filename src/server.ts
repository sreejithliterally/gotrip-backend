import app from './app';
import { sequelize, redis } from './db';
import { config } from './common/config';

async function bootstrap() {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');

    // NOTE: DB schema is managed via migrations (npm run migrate)
    // Never use sequelize.sync() in any environment

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 GoTrip API running on http://localhost:${config.port}`);
      console.log(`📋 Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down...');
  await sequelize.close();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down...');
  await sequelize.close();
  redis.disconnect();
  process.exit(0);
});

bootstrap();
