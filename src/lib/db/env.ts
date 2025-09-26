// Centralized database configuration - use ONE connection string everywhere
export const DB_URL = 
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.DATABASE_URL!;

console.log('🔗 [DB_ENV] Using centralized connection:', DB_URL?.substring(0, 50) + '...');
