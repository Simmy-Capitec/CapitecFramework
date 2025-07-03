import mysql from 'mysql2/promise';

// ===================================================================
// DATABASE CONFIGURATION
// ===================================================================

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'animal_sanctuary',
  ssl: process.env.DATABASE_SSL === 'true',
  connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

console.log('Database config:', {
  ...dbConfig,
  password: dbConfig.password ? '[HIDDEN]' : '[NOT SET]'
});

// Create connection pool
let pool: mysql.Pool;

function createPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Database connection pool created');
  }
  return pool;
}

// ===================================================================
// DATABASE UTILITIES
// ===================================================================

/**
 * Execute a SQL query with parameters
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const connection = createPool();
  
  try {
    console.log('🔍 Executing query:', query.substring(0, 100) + '...');
    console.log('📝 Parameters:', params);
    
    const [results] = await connection.execute(query, params);
    
    console.log('✅ Query executed successfully');
    return results as T[];
  } catch (error) {
    console.error('❌ Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = createPool();
    await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
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
    const query = `
      INSERT INTO activity_log (
        table_name, record_id, action, user_type, user_id,
        old_data, new_data, ip_address, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      tableName,
      recordId,
      action,
      userType,
      userId,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
      ipAddress
    ];

    await executeQuery(query, params);
    console.log(`📝 Activity logged: ${action} on ${tableName}:${recordId}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw error for logging failures
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  totalAnimals: number;
  availableAnimals: number;
  totalAdopters: number;
  pendingApplications: number;
  totalDonations: number;
}> {
  try {
    const queries = [
      'SELECT COUNT(*) as count FROM animals WHERE is_active = TRUE',
      'SELECT COUNT(*) as count FROM animals WHERE is_active = TRUE AND adoption_status = "Available"',
      'SELECT COUNT(*) as count FROM adopters',
      'SELECT COUNT(*) as count FROM adoption_applications WHERE status IN ("Submitted", "Under Review", "Interview Scheduled", "Approved")',
      'SELECT COALESCE(SUM(amount), 0) as total FROM donations'
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery<{ count?: number; total?: number }>(query))
    );

    return {
      totalAnimals: results[0][0]?.count || 0,
      availableAnimals: results[1][0]?.count || 0,
      totalAdopters: results[2][0]?.count || 0,
      pendingApplications: results[3][0]?.count || 0,
      totalDonations: results[4][0]?.total || 0,
    };
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    throw error;
  }
}

// ===================================================================
// CONNECTION MANAGEMENT
// ===================================================================

/**
 * Close database connections (for cleanup)
 */
export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('🔌 Database connections closed');
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

export default { executeQuery, testConnection, logActivity, getDatabaseStats };