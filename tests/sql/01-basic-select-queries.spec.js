import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 1: BASIC SELECT QUERIES (SQL Equivalent to API Basic GET)
 * Learning Objectives:
 * - Connect to MySQL database
 * - Execute basic SELECT statements
 * - Verify data structure and types
 * - Handle database connections properly
 * - Compare with API endpoints data
 */

const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training'
};

let connection;

test.beforeEach(async () => {
    connection = await mysql.createConnection(dbConfig);
});

test.afterEach(async () => {
    if (connection) {
        await connection.end();
    }
});

test.describe('Level 1: Basic SELECT Queries', () => {
    
    test('should fetch all users from database', async () => {
        const [rows] = await connection.execute('SELECT * FROM users ORDER BY id');
        
        // Verify we get an array of results
        expect(Array.isArray(rows)).toBe(true);
        
        // If users exist, verify structure matches API response
        if (rows.length > 0) {
            const user = rows[0];
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('password_hash');
            expect(user).toHaveProperty('first_name');
            expect(user).toHaveProperty('last_name');
            expect(user).toHaveProperty('phone');
            expect(user).toHaveProperty('created_at');
            expect(user).toHaveProperty('updated_at');
            expect(user).toHaveProperty('is_active');
            expect(user).toHaveProperty('last_login');
            
            // Verify data types
            expect(typeof user.id).toBe('number');
            expect(typeof user.username).toBe('string');
            expect(typeof user.email).toBe('string');
            expect([0, 1]).toContain(user.is_active);
        }
    });

    test('should fetch all products from database', async () => {
        const [rows] = await connection.execute('SELECT * FROM products ORDER BY id');
        
        expect(Array.isArray(rows)).toBe(true);
        
        if (rows.length > 0) {
            const product = rows[0];
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('sku');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('description');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('cost');
            expect(product).toHaveProperty('category_id');
            expect(product).toHaveProperty('stock_quantity');
            expect(product).toHaveProperty('reorder_level');
            expect(product).toHaveProperty('is_active');
            expect(product).toHaveProperty('created_at');
            expect(product).toHaveProperty('updated_at');
            
            // Verify critical constraints
            expect(typeof product.id).toBe('number');
            expect(typeof product.sku).toBe('string');
            expect(typeof product.name).toBe('string');
            expect(typeof product.price).toBe('string'); // DECIMAL comes as string
            expect(parseFloat(product.price)).toBeGreaterThan(0);
            expect(typeof product.stock_quantity).toBe('number');
        }
    });

    test('should fetch all categories from database', async () => {
        const [rows] = await connection.execute('SELECT * FROM categories ORDER BY id');
        
        expect(Array.isArray(rows)).toBe(true);
        
        if (rows.length > 0) {
            const category = rows[0];
            expect(category).toHaveProperty('id');
            expect(category).toHaveProperty('name');
            expect(category).toHaveProperty('description');
            expect(category).toHaveProperty('parent_id');
            expect(category).toHaveProperty('created_at');
            
            expect(typeof category.id).toBe('number');
            expect(typeof category.name).toBe('string');
        }
    });

    test('should fetch all orders from database', async () => {
        const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
        
        expect(Array.isArray(rows)).toBe(true);
        
        if (rows.length > 0) {
            const order = rows[0];
            expect(order).toHaveProperty('id');
            expect(order).toHaveProperty('order_number');
            expect(order).toHaveProperty('user_id');
            expect(order).toHaveProperty('status');
            expect(order).toHaveProperty('total_amount');
            expect(order).toHaveProperty('shipping_address');
            expect(order).toHaveProperty('billing_address');
            expect(order).toHaveProperty('notes');
            expect(order).toHaveProperty('created_at');
            expect(order).toHaveProperty('updated_at');
            expect(order).toHaveProperty('shipped_at');
            expect(order).toHaveProperty('delivered_at');
            
            // Verify status is valid enum value
            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            expect(validStatuses).toContain(order.status);
            
            // Verify total amount is valid
            expect(parseFloat(order.total_amount)).toBeGreaterThan(0);
        }
    });

    test('should verify table relationships exist', async () => {
        // Check if products reference categories
        const [productCategories] = await connection.execute(`
            SELECT p.id, p.name, p.category_id, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LIMIT 5
        `);
        
        expect(Array.isArray(productCategories)).toBe(true);
        
        // Check if orders reference users
        const [orderUsers] = await connection.execute(`
            SELECT o.id, o.order_number, o.user_id, u.username 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            LIMIT 5
        `);
        
        expect(Array.isArray(orderUsers)).toBe(true);
        
        // Verify JOIN results have the expected structure
        if (orderUsers.length > 0) {
            const orderUser = orderUsers[0];
            expect(orderUser).toHaveProperty('id');
            expect(orderUser).toHaveProperty('order_number');
            expect(orderUser).toHaveProperty('user_id');
            expect(orderUser).toHaveProperty('username');
        }
    });

    test('should count records in each table', async () => {
        // Count users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        expect(typeof userCount[0].count).toBe('number');
        expect(userCount[0].count).toBeGreaterThanOrEqual(0);
        
        // Count products
        const [productCount] = await connection.execute('SELECT COUNT(*) as count FROM products');
        expect(typeof productCount[0].count).toBe('number');
        expect(productCount[0].count).toBeGreaterThanOrEqual(0);
        
        // Count categories
        const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
        expect(typeof categoryCount[0].count).toBe('number');
        expect(categoryCount[0].count).toBeGreaterThanOrEqual(0);
        
        // Count orders
        const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM orders');
        expect(typeof orderCount[0].count).toBe('number');
        expect(orderCount[0].count).toBeGreaterThanOrEqual(0);
        
        // Count order_items
        const [orderItemCount] = await connection.execute('SELECT COUNT(*) as count FROM order_items');
        expect(typeof orderItemCount[0].count).toBe('number');
        expect(orderItemCount[0].count).toBeGreaterThanOrEqual(0);
        
        // Count cart_items
        const [cartItemCount] = await connection.execute('SELECT COUNT(*) as count FROM cart_items');
        expect(typeof cartItemCount[0].count).toBe('number');
        expect(cartItemCount[0].count).toBeGreaterThanOrEqual(0);
        
        // Count reviews
        const [reviewCount] = await connection.execute('SELECT COUNT(*) as count FROM reviews');
        expect(typeof reviewCount[0].count).toBe('number');
        expect(reviewCount[0].count).toBeGreaterThanOrEqual(0);
    });

    test('should verify database constraints and data integrity', async () => {
        // Check for users with valid email formats
        const [invalidEmails] = await connection.execute(`
            SELECT id, username, email 
            FROM users 
            WHERE email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
        `);
        
        // Should have no invalid emails
        expect(invalidEmails.length).toBe(0);
        
        // Check for products with positive prices
        const [invalidPrices] = await connection.execute(`
            SELECT id, name, price 
            FROM products 
            WHERE price <= 0
        `);
        
        // Should have no products with invalid prices
        expect(invalidPrices.length).toBe(0);
        
        // Check for unique usernames
        const [duplicateUsernames] = await connection.execute(`
            SELECT username, COUNT(*) as count 
            FROM users 
            GROUP BY username 
            HAVING count > 1
        `);
        
        // Should have no duplicate usernames
        expect(duplicateUsernames.length).toBe(0);
        
        // Check for unique SKUs
        const [duplicateSkus] = await connection.execute(`
            SELECT sku, COUNT(*) as count 
            FROM products 
            GROUP BY sku 
            HAVING count > 1
        `);
        
        // Should have no duplicate SKUs
        expect(duplicateSkus.length).toBe(0);
    });
});