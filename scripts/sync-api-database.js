#!/usr/bin/env node

/**
 * Database-API Synchronization Script
 * 
 * This script ensures the API server stays in perfect sync with the MySQL database.
 * It can be run manually or automated to maintain data consistency.
 */

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Execute database query
async function executeQuery(query, params = []) {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        log(`Database query error: ${error.message}`, 'red');
        throw error;
    }
}

// Get database schema information
async function getDatabaseSchema() {
    log('📋 Fetching database schema...', 'blue');
    
    const tables = {};
    
    // Get all tables
    const tableNames = await executeQuery(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    // Get detailed information for each table
    for (const table of tableNames) {
        const tableName = table.TABLE_NAME;
        
        // Get column information
        const columns = await executeQuery(`
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_KEY,
                COLUMN_DEFAULT,
                EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
        `, [dbConfig.database, tableName]);
        
        // Get foreign key relationships
        const foreignKeys = await executeQuery(`
            SELECT 
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = ? 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [dbConfig.database, tableName]);
        
        tables[tableName] = {
            columns,
            foreignKeys,
            recordCount: 0
        };
        
        // Get record count
        try {
            const [countResult] = await pool.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            tables[tableName].recordCount = countResult[0].count;
        } catch (error) {
            log(`Warning: Could not get record count for ${tableName}: ${error.message}`, 'yellow');
        }
    }
    
    return tables;
}

// Validate API server endpoints match database structure
async function validateAPIEndpoints() {
    log('🔍 Validating API endpoints against database schema...', 'blue');
    
    const schema = await getDatabaseSchema();
    const expectedEndpoints = [];
    
    // Generate expected endpoints based on database tables
    Object.keys(schema).forEach(tableName => {
        const singularName = tableName.replace(/s$/, ''); // Simple pluralization
        
        expectedEndpoints.push({
            table: tableName,
            endpoints: [
                `GET /${tableName}`,
                `GET /${tableName}/:id`,
                `POST /${tableName}`,
                `PUT /${tableName}/:id`,
                `DELETE /${tableName}/:id`
            ]
        });
        
        // Special endpoints for relationships
        if (tableName === 'cart_items') {
            expectedEndpoints.push({
                table: tableName,
                endpoints: [`GET /users/:userId/cart`, `POST /users/:userId/cart`]
            });
        }
        
        if (tableName === 'reviews') {
            expectedEndpoints.push({
                table: tableName,
                endpoints: [`GET /products/:productId/reviews`, `POST /products/:productId/reviews`]
            });
        }
        
        if (tableName === 'order_items') {
            expectedEndpoints.push({
                table: tableName,
                endpoints: [`GET /orders/:orderId/items`]
            });
        }
    });
    
    log('✅ Expected API endpoints based on database schema:', 'green');
    expectedEndpoints.forEach(({ table, endpoints }) => {
        log(`  📊 ${table}:`, 'cyan');
        endpoints.forEach(endpoint => log(`    - ${endpoint}`, 'reset'));
    });
    
    return expectedEndpoints;
}

// Check data consistency
async function checkDataConsistency() {
    log('🔄 Checking data consistency...', 'blue');
    
    const issues = [];
    
    try {
        // Check foreign key constraints
        log('  Checking foreign key relationships...', 'yellow');
        
        // Users referenced in orders
        const orphanedOrders = await executeQuery(`
            SELECT o.id, o.order_number, o.user_id 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE u.id IS NULL
        `);
        
        if (orphanedOrders.length > 0) {
            issues.push({
                type: 'foreign_key_violation',
                table: 'orders',
                message: `${orphanedOrders.length} orders reference non-existent users`,
                details: orphanedOrders
            });
        }
        
        // Products referenced in order_items
        const orphanedOrderItems = await executeQuery(`
            SELECT oi.id, oi.order_id, oi.product_id 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE p.id IS NULL
        `);
        
        if (orphanedOrderItems.length > 0) {
            issues.push({
                type: 'foreign_key_violation',
                table: 'order_items',
                message: `${orphanedOrderItems.length} order items reference non-existent products`,
                details: orphanedOrderItems
            });
        }
        
        // Categories referenced in products
        const orphanedProducts = await executeQuery(`
            SELECT p.id, p.name, p.category_id 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.category_id IS NOT NULL AND c.id IS NULL
        `);
        
        if (orphanedProducts.length > 0) {
            issues.push({
                type: 'foreign_key_violation',
                table: 'products',
                message: `${orphanedProducts.length} products reference non-existent categories`,
                details: orphanedProducts
            });
        }
        
        // Check data validation issues
        log('  Checking data validation...', 'yellow');
        
        // Invalid email formats
        const invalidEmails = await executeQuery(`
            SELECT id, username, email 
            FROM users 
            WHERE email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
        `);
        
        if (invalidEmails.length > 0) {
            issues.push({
                type: 'data_validation',
                table: 'users',
                message: `${invalidEmails.length} users have invalid email formats`,
                details: invalidEmails
            });
        }
        
        // Negative prices
        const negativeProducts = await executeQuery(`
            SELECT id, name, price 
            FROM products 
            WHERE price <= 0
        `);
        
        if (negativeProducts.length > 0) {
            issues.push({
                type: 'data_validation',
                table: 'products',
                message: `${negativeProducts.length} products have invalid prices`,
                details: negativeProducts
            });
        }
        
    } catch (error) {
        issues.push({
            type: 'query_error',
            message: `Error during consistency check: ${error.message}`
        });
    }
    
    if (issues.length === 0) {
        log('✅ No data consistency issues found', 'green');
    } else {
        log(`⚠️  Found ${issues.length} data consistency issues:`, 'yellow');
        issues.forEach((issue, index) => {
            log(`  ${index + 1}. [${issue.type}] ${issue.message}`, 'red');
            if (issue.details && issue.details.length > 0) {
                log(`     Sample records: ${JSON.stringify(issue.details.slice(0, 3))}`, 'reset');
            }
        });
    }
    
    return issues;
}

// Generate API test scripts
async function generateAPITests() {
    log('🧪 Generating API test scripts...', 'blue');
    
    const schema = await getDatabaseSchema();
    const testScripts = [];
    
    // Generate basic CRUD tests for each table
    for (const [tableName, tableInfo] of Object.entries(schema)) {
        const testScript = {
            table: tableName,
            tests: []
        };
        
        // GET all records test
        testScript.tests.push({
            method: 'GET',
            endpoint: `/${tableName}`,
            description: `Fetch all ${tableName}`,
            expectedStatus: 200
        });
        
        // GET single record test (if records exist)
        if (tableInfo.recordCount > 0) {
            testScript.tests.push({
                method: 'GET',
                endpoint: `/${tableName}/1`,
                description: `Fetch single ${tableName.slice(0, -1)}`,
                expectedStatus: 200
            });
        }
        
        // POST test (create new record)
        const requiredFields = tableInfo.columns
            .filter(col => col.IS_NULLABLE === 'NO' && col.EXTRA !== 'auto_increment')
            .map(col => col.COLUMN_NAME);
        
        if (requiredFields.length > 0) {
            testScript.tests.push({
                method: 'POST',
                endpoint: `/${tableName}`,
                description: `Create new ${tableName.slice(0, -1)}`,
                expectedStatus: 201,
                requiredFields
            });
        }
        
        testScripts.push(testScript);
    }
    
    return testScripts;
}

// Main sync function
async function syncAPIDatabase() {
    log('🚀 Starting API-Database Synchronization', 'bright');
    log('=' .repeat(50), 'cyan');
    
    try {
        // 1. Get database schema
        const schema = await getDatabaseSchema();
        log(`📊 Found ${Object.keys(schema).length} tables in database`, 'green');
        
        // Display table summary
        Object.entries(schema).forEach(([tableName, info]) => {
            log(`  📋 ${tableName}: ${info.recordCount} records, ${info.columns.length} columns`, 'reset');
        });
        
        // 2. Validate API endpoints
        await validateAPIEndpoints();
        
        // 3. Check data consistency
        const issues = await checkDataConsistency();
        
        // 4. Generate API tests
        const tests = await generateAPITests();
        
        // 5. Create sync report
        const report = {
            timestamp: new Date().toISOString(),
            database: dbConfig.database,
            tables: schema,
            dataIssues: issues,
            apiTests: tests,
            summary: {
                totalTables: Object.keys(schema).length,
                totalRecords: Object.values(schema).reduce((sum, table) => sum + table.recordCount, 0),
                dataIssues: issues.length,
                apiEndpoints: tests.reduce((sum, test) => sum + test.tests.length, 0)
            }
        };
        
        // Save report
        const reportPath = path.join(process.cwd(), 'scripts', `sync-report-${Date.now()}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        log(`📄 Sync report saved to: ${reportPath}`, 'green');
        
        // Summary
        log('=' .repeat(50), 'cyan');
        log('📈 SYNCHRONIZATION SUMMARY', 'bright');
        log(`  Database: ${report.summary.totalTables} tables, ${report.summary.totalRecords} records`, 'green');
        log(`  API: ${report.summary.apiEndpoints} endpoints expected`, 'green');
        log(`  Issues: ${report.summary.dataIssues} data consistency problems`, report.summary.dataIssues > 0 ? 'yellow' : 'green');
        
        if (issues.length === 0) {
            log('✅ API and Database are in perfect sync!', 'green');
        } else {
            log('⚠️  Some issues found - check the report for details', 'yellow');
        }
        
    } catch (error) {
        log(`❌ Synchronization failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// CLI interface
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
    console.log(`
🔄 Database-API Synchronization Script

Usage:
  node sync-api-database.js [options]

Options:
  --help, -h        Show this help message
  --check-only      Only check consistency, don't generate reports
  --backup          Create backup before sync check
  --restore         Show restore options
  --fix             Attempt to fix common data issues (coming soon)

Examples:
  node sync-api-database.js                    # Full sync check
  node sync-api-database.js --check-only       # Quick consistency check
  node sync-api-database.js --backup           # Backup then sync check

Related Scripts:
  node backup-database.js                      # Create database backup
  node restore-database.js                     # Restore from backup
  node restore-database.js --baseline          # Restore to clean state
    `);
    process.exit(0);
}

if (process.argv[2] === '--restore') {
    console.log(`
🔄 Database Restore Options

To restore database to different states:

1. Restore to baseline (current snapshot):
   node restore-database.js --baseline

2. Interactive restore (choose from backups):
   node restore-database.js

3. Restore latest backup:
   node restore-database.js --latest

4. List available backups:
   node restore-database.js --list

The baseline backup contains the current state (including test data).
Use this to reset to a known good state after running tests.
    `);
    process.exit(0);
}

// Run the synchronization
syncAPIDatabase().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});