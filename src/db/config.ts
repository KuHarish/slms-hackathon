/**
 * ============================================
 * Database Configuration (Placeholder)
 * ============================================
 * 
 * This file is a placeholder for database connection.
 * Configure your own PostgreSQL connection here when ready.
 * 
 * Recommended: Use Prisma ORM or pg/node-postgres
 * 
 * Example with Prisma:
 *   import { PrismaClient } from '@prisma/client';
 *   export const prisma = new PrismaClient();
 * 
 * Example with pg:
 *   import { Pool } from 'pg';
 *   export const pool = new Pool({
 *     connectionString: process.env.DATABASE_URL,
 *   });
 * 
 * Schema models are defined in src/types/library.ts
 * Service interfaces are defined in src/services/api.ts
 */

// Placeholder: Replace with real database connection
export const db = {
  connected: false,
  connectionString: '', // Set via environment variable
  
  async connect() {
    // TODO: Implement actual database connection
    console.log('Database connection not configured. See src/db/config.ts for setup instructions.');
  },

  async disconnect() {
    // TODO: Implement disconnect
  },

  async query(_sql: string, _params?: unknown[]) {
    // TODO: Implement query execution
    throw new Error('Database not configured. Using mock data.');
  },
};

export default db;
