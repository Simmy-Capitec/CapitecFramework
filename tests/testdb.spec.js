import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

// Local database configuration
const localDbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training'
};

test('should connect to local database and verify setup', async () => {
    let connection;
    
    try {
        // Test connection
        connection = await mysql.createConnection(localDbConfig);
        console.log('✅ Database connected successfully');
        
        // Test basic queries
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Tables found:', tables.length);
        expect(tables.length).toBe(7); // Should have 7 tables
        
        // Test data counts
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [productCount] = await connection.execute('SELECT COUNT(*) as count FROM products');
        const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM orders');
        
        console.log('👥 Users:', userCount[0].count);
        console.log('📦 Products:', productCount[0].count);
        console.log('🛒 Orders:', orderCount[0].count);
        
        expect(userCount[0].count).toBe(8);
        expect(productCount[0].count).toBe(18);
        expect(orderCount[0].count).toBe(7);
        
        // Test sample query with JOIN
        const [orderDetails] = await connection.execute(`
            SELECT o.order_number, u.username, o.total_amount, o.status
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LIMIT 3
        `);
        
        console.log('🔍 Sample order details:', orderDetails.length);
        expect(orderDetails.length).toBe(3);
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
});