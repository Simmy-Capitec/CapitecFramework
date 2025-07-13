import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ===================================================================
// DATABASE CONNECTION
// ===================================================================

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('PostgreSQL connection config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'
});

// Create the connection
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  ssl: 'require',
  onnotice: (notice) => console.log('PostgreSQL notice:', notice),
  transform: {
    undefined: null,
  },
});

// Create the database instance
export const db = drizzle(sql, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// ===================================================================
// CONNECTION UTILITIES
// ===================================================================

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const [
      totalAnimals,
      availableAnimals,
      totalAdopters,
      pendingApplications,
      totalDonations
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM animal_sanctuary_capstone.animals WHERE is_active = TRUE`,
      sql`SELECT COUNT(*) as count FROM animal_sanctuary_capstone.animals WHERE is_active = TRUE AND adoption_status = 'Available'`,
      sql`SELECT COUNT(*) as count FROM animal_sanctuary_capstone.adopters`,
      sql`SELECT COUNT(*) as count FROM animal_sanctuary_capstone.adoption_applications WHERE status IN ('Submitted', 'Under Review', 'Interview Scheduled', 'Approved')`,
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM animal_sanctuary_capstone.donations`
    ]);

    return {
      totalAnimals: Number(totalAnimals[0]?.count || 0),
      availableAnimals: Number(availableAnimals[0]?.count || 0),
      totalAdopters: Number(totalAdopters[0]?.count || 0),
      pendingApplications: Number(pendingApplications[0]?.count || 0),
      totalDonations: Number(totalDonations[0]?.total || 0),
    };
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    throw error;
  }
}

/**
 * Log activity for audit trail
 */
export async function logActivity(
  tableName: string,
  recordId: number,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  userType: string,
  userId: number | null = null,
  oldData: any = null,
  newData: any = null,
  ipAddress: string | null = null
): Promise<void> {
  try {
    await db.insert(schema.activityLog).values({
      tableName,
      recordId,
      action,
      userType,
      userId,
      oldData,
      newData,
      ipAddress,
    });
    
    console.log(`📝 Activity logged: ${action} on ${tableName}:${recordId}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw error for logging failures
  }
}

/**
 * Close database connections (for cleanup)
 */
export async function closeConnections(): Promise<void> {
  try {
    await sql.end();
    console.log('🔌 Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing database connections...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing database connections...');
  await closeConnections();
  process.exit(0);
});

// Export everything from schema for convenience
export * from './schema';
export default db;