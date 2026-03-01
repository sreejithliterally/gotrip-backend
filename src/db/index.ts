// database.ts already registers all models — just re-export connections
export { default as sequelize } from './database';
export { default as redis } from './redis';
