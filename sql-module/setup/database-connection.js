// Database Connection Setup for SQL Training Module
// This file demonstrates how to connect to MySQL from JavaScript/Playwright tests

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || '34.10.193.47',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2mD%nP9;rKH=;;Nj',
    database: process.env.DB_NAME || 'sql_training',
    connectTimeout: 60000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: {
        rejectUnauthorized: false
    }
};

// Create connection pool
let pool;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Test connection
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        
        console.log('✅ Database connection established');
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

/**
 * Execute a query with parameters
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Query execution failed:', error);
        throw error;
    }
}

/**
 * Get a single row from query results
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} First row or null
 */
export async function getOne(query, params = []) {
    const results = await executeQuery(query, params);
    return results[0] || null;
}

/**
 * Execute multiple queries in a transaction
 * @param {Array<{query: string, params: Array}>} queries - Array of queries to execute
 * @returns {Promise<Array>} Results of all queries
 */
export async function executeTransaction(queries) {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { query, params = [] } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Close database connection pool
 */
export async function closeDatabase() {
    if (pool) {
        await pool.end();
        console.log('✅ Database connection closed');
    }
}

// Helper functions for common test scenarios

/**
 * Create a test user
 * @param {Object} userData - User data object
 * @returns {Promise<number>} Created user ID
 */
export async function createTestUser(userData = {}) {
    const defaultData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password_hash: 'test_hash',
        first_name: 'Test',
        last_name: 'User'
    };
    
    const data = { ...defaultData, ...userData };
    
    const query = `
        INSERT INTO users (username, email, password_hash, first_name, last_name)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
        data.username,
        data.email,
        data.password_hash,
        data.first_name,
        data.last_name
    ]);
    
    return result.insertId;
}

/**
 * Clean up test data
 * @param {string} table - Table name
 * @param {string} condition - WHERE condition
 * @param {Array} params - Condition parameters
 */
export async function cleanupTestData(table, condition, params = []) {
    const query = `DELETE FROM ${table} WHERE ${condition}`;
    await executeQuery(query, params);
}

/**
 * Verify data exists in database
 * @param {string} table - Table name
 * @param {string} condition - WHERE condition
 * @param {Array} params - Condition parameters
 * @returns {Promise<boolean>} True if data exists
 */
export async function verifyDataExists(table, condition, params = []) {
    const query = `SELECT COUNT(*) as count FROM ${table} WHERE ${condition}`;
    const result = await getOne(query, params);
    return result.count > 0;
}

/**
 * Get row count for a table with optional conditions
 * @param {string} table - Table name
 * @param {string} condition - WHERE condition (optional)
 * @param {Array} params - Condition parameters
 * @returns {Promise<number>} Row count
 */
export async function getRowCount(table, condition = '', params = []) {
    const query = condition 
        ? `SELECT COUNT(*) as count FROM ${table} WHERE ${condition}`
        : `SELECT COUNT(*) as count FROM ${table}`;
    
    const result = await getOne(query, params);
    return result.count;
}

// Example usage in tests
/*
// In your test file:
import { test, expect } from '@playwright/test';
import { 
    initializeDatabase, 
    closeDatabase, 
    createTestUser, 
    verifyDataExists,
    cleanupTestData 
} from './database-connection.js';

test.beforeAll(async () => {
    await initializeDatabase();
});

test.afterAll(async () => {
    await closeDatabase();
});

test('User registration should save to database', async ({ page }) => {
    // UI actions to register user
    await page.goto('/register');
    await page.fill('#username', 'newuser123');
    await page.fill('#email', 'newuser123@example.com');
    await page.fill('#password', 'SecurePass123');
    await page.click('#submit');
    
    // Verify in database
    const exists = await verifyDataExists(
        'users', 
        'email = ?', 
        ['newuser123@example.com']
    );
    
    expect(exists).toBe(true);
    
    // Cleanup
    await cleanupTestData('users', 'email = ?', ['newuser123@example.com']);
});
*/

// Export all functions
export default {
    initializeDatabase,
    closeDatabase,
    executeQuery,
    getOne,
    executeTransaction,
    createTestUser,
    cleanupTestData,
    verifyDataExists,
    getRowCount
};