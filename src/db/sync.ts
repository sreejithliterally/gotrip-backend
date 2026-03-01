/**
 * ⚠️  DEPRECATED — do not use in production.
 * Use migrations instead: npm run migrate
 *
 * This file is kept only for quick local dev bootstrapping
 * when you don't have a DB yet and just want to get running fast.
 */
import { sequelize } from './index';

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    console.warn('⚠️  Using sync() — for dev only. Use migrations in production.');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ All tables created (no alter, no drop)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

sync();
