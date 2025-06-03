import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || '34.10.193.47',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root', // You may need to update this
    password: process.env.DB_PASSWORD || '2mD%nP9;rKH=;;Nj',
    connectTimeout: 60000,
    ssl: {
        rejectUnauthorized: false
    }
};

// Create connection pool for better performance
export const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
export async function testConnection() {
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

// Execute DDL queries (CREATE, DROP, USE, etc.) - use query() not execute()
export async function executeDDL(sql) {
    try {
        const [results] = await pool.query(sql);
        return results;
    } catch (error) {
        console.error('DDL execution error:', error.message);
        throw error;
    }
}

// Execute query with error handling (for DML operations with parameters)
export async function executeQuery(sql, params = []) {
    try {
        if (params.length === 0) {
            // If no parameters, use query() instead of execute()
            const [results] = await pool.query(sql);
            return results;
        } else {
            const [results] = await pool.execute(sql, params);
            return results;
        }
    } catch (error) {
        console.error('Query execution error:', error.message);
        throw error;
    }
}

// Connect to specific database
export async function connectToDatabase(databaseName) {
    try {
        const connection = await mysql.createConnection({
            ...dbConfig,
            database: databaseName
        });
        return connection;
    } catch (error) {
        console.error(`Failed to connect to database ${databaseName}:`, error.message);
        throw error;
    }
}

// Close all connections
export async function closeConnections() {
    try {
        await pool.end();
        console.log('Database connections closed');
    } catch (error) {
        console.error('Error closing connections:', error.message);
    }
}

// Temporary test block to verify functionality
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        console.log('Testing database connection...');
        const isConnected = await testConnection();
        if (isConnected) {
            console.log('Connection successful!');
        } else {
            console.log('Connection failed.');
        }
        await closeConnections();
    })();
}
