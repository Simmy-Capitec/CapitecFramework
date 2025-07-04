const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Database Configuration and Connection Pool
 * Handles MySQL connection management for the Animal Sanctuary API
 */

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'animal_sanctuary_capstone',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Execute query with error handling
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Begin transaction
 * @returns {Promise} Connection with transaction started
 */
async function beginTransaction() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    return connection;
}

/**
 * Commit transaction
 * @param {Object} connection - Database connection
 */
async function commitTransaction(connection) {
    await connection.commit();
    connection.release();
}

/**
 * Rollback transaction
 * @param {Object} connection - Database connection
 */
async function rollbackTransaction(connection) {
    await connection.rollback();
    connection.release();
}

/**
 * Get database statistics
 * @returns {Promise} Database stats object
 */
async function getDatabaseStats() {
    try {
        const stats = {};
        
        // Get table counts
        const tables = [
            'animals', 'adopters', 'adoption_applications', 'adoptions',
            'donors', 'donations', 'volunteers', 'volunteer_assignments',
            'staff', 'medical_records', 'habitats'
        ];
        
        for (const table of tables) {
            const [result] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
            stats[table] = result[0].count;
        }
        
        // Get recent activity
        const [recentActivity] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM activity_log 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);
        stats.recent_activity = recentActivity[0].count;
        
        return stats;
    } catch (error) {
        console.error('Error getting database stats:', error);
        throw error;
    }
}

/**
 * Log activity to audit trail
 * @param {string} tableName - Table that was modified
 * @param {number} recordId - ID of the record
 * @param {string} action - Action performed (INSERT, UPDATE, DELETE)
 * @param {string} userType - Type of user (Staff, System, etc.)
 * @param {number} userId - ID of the user
 * @param {Object} oldValues - Previous values (for updates)
 * @param {Object} newValues - New values
 * @param {string} ipAddress - IP address of the user
 */
async function logActivity(tableName, recordId, action, userType = 'System', userId = null, oldValues = null, newValues = null, ipAddress = null) {
    try {
        const query = `
            INSERT INTO activity_log 
            (table_name, record_id, action, user_type, user_id, old_values, new_values, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            tableName,
            recordId,
            action,
            userType,
            userId,
            oldValues ? JSON.stringify(oldValues) : null,
            newValues ? JSON.stringify(newValues) : null,
            ipAddress
        ];
        
        await pool.execute(query, params);
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error for logging failures to avoid breaking main operations
    }
}

/**
 * Check if database is healthy
 * @returns {Promise<boolean>} Health status
 */
async function checkHealth() {
    try {
        await pool.execute('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    getDatabaseStats,
    logActivity,
    checkHealth
};