import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 2: FILTERED QUERIES (SQL Equivalent to API Single Resource Operations)
 * Learning Objectives:
 * - Use WHERE clauses for filtering
 * - Handle parameterized queries safely
 * - Test specific record retrieval
 * - Validate individual record structure
 * - Practice different comparison operators
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

test.describe('Level 2: Filtered Queries', () => {
    
    test('should fetch a single user by ID', async () => {
        // First get a valid user ID
        const [allUsers] = await connection.execute('SELECT id FROM users LIMIT 1');
        
        if (allUsers.length > 0) {
            const userId = allUsers[0].id;
            
            // Fetch single user using parameterized query
            const [users] = await connection.execute(
                'SELECT id, username, email, first_name, last_name, phone, created_at, is_active, last_login FROM users WHERE id = ?',
                [userId]
            );
            
            expect(users.length).toBe(1);
            
            const user = users[0];
            expect(user.id).toBe(userId);
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('first_name');
            expect(user).toHaveProperty('last_name');
            expect(user).toHaveProperty('phone');
            expect(user).toHaveProperty('created_at');
            expect(user).toHaveProperty('is_active');
            expect(user).toHaveProperty('last_login');
            
            // Verify password_hash is not included (security)
            expect(user).not.toHaveProperty('password_hash');
        }
    });

    test('should fetch a single product by ID with category information', async () => {
        // Get a valid product ID
        const [allProducts] = await connection.execute('SELECT id FROM products LIMIT 1');
        
        if (allProducts.length > 0) {
            const productId = allProducts[0].id;
            
            // Fetch product with category join
            const [products] = await connection.execute(`
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ?
            `, [productId]);
            
            expect(products.length).toBe(1);
            
            const product = products[0];
            expect(product.id).toBe(productId);
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
            expect(product).toHaveProperty('category_name');
            
            // Verify data types and constraints
            expect(parseFloat(product.price)).toBeGreaterThan(0);
            expect(product.stock_quantity).toBeGreaterThanOrEqual(0);
        }
    });

    test('should fetch non-existent records gracefully', async () => {
        // Test with non-existent ID
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [99999]
        );
        
        expect(users.length).toBe(0);
        
        const [products] = await connection.execute(
            'SELECT * FROM products WHERE id = ?',
            [99999]
        );
        
        expect(products.length).toBe(0);
        
        const [orders] = await connection.execute(
            'SELECT * FROM orders WHERE id = ?',
            [99999]
        );
        
        expect(orders.length).toBe(0);
    });

    test('should filter users by different criteria', async () => {
        // Filter by active status
        const [activeUsers] = await connection.execute(
            'SELECT * FROM users WHERE is_active = ?',
            [1]
        );
        
        activeUsers.forEach(user => {
            expect(user.is_active).toBe(1);
        });
        
        // Filter by email domain
        const [gmailUsers] = await connection.execute(
            'SELECT * FROM users WHERE email LIKE ?',
            ['%@gmail.com']
        );
        
        gmailUsers.forEach(user => {
            expect(user.email).toContain('@gmail.com');
        });
        
        // Filter by creation date (users created today)
        const [recentUsers] = await connection.execute(
            'SELECT * FROM users WHERE DATE(created_at) = CURDATE()'
        );
        
        // Should be an array (might be empty)
        expect(Array.isArray(recentUsers)).toBe(true);
    });

    test('should filter products by various criteria', async () => {
        // Filter by price range
        const [expensiveProducts] = await connection.execute(
            'SELECT * FROM products WHERE price > ?',
            ['100.00']
        );
        
        expensiveProducts.forEach(product => {
            expect(parseFloat(product.price)).toBeGreaterThan(100);
        });
        
        // Filter by stock quantity
        const [lowStockProducts] = await connection.execute(
            'SELECT * FROM products WHERE stock_quantity < reorder_level'
        );
        
        lowStockProducts.forEach(product => {
            expect(product.stock_quantity).toBeLessThan(product.reorder_level);
        });
        
        // Filter by category
        const [categoryProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE c.name LIKE ?
        `, ['%Electronics%']);
        
        categoryProducts.forEach(product => {
            expect(product.category_name).toContain('Electronics');
        });
        
        // Filter by active status
        const [activeProducts] = await connection.execute(
            'SELECT * FROM products WHERE is_active = ?',
            [1]
        );
        
        activeProducts.forEach(product => {
            expect(product.is_active).toBe(1);
        });
    });

    test('should filter orders by status and user', async () => {
        // Filter by order status
        const [pendingOrders] = await connection.execute(
            'SELECT * FROM orders WHERE status = ?',
            ['pending']
        );
        
        pendingOrders.forEach(order => {
            expect(order.status).toBe('pending');
        });
        
        // Filter by specific user
        const [userOrders] = await connection.execute(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE u.username LIKE ?
        `, ['%test%']);
        
        userOrders.forEach(order => {
            expect(order.username).toContain('test');
        });
        
        // Filter by date range (orders from last 30 days)
        const [recentOrders] = await connection.execute(`
            SELECT * FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY created_at DESC
        `);
        
        expect(Array.isArray(recentOrders)).toBe(true);
        
        // Filter by total amount range
        const [highValueOrders] = await connection.execute(
            'SELECT * FROM orders WHERE total_amount > ?',
            ['500.00']
        );
        
        highValueOrders.forEach(order => {
            expect(parseFloat(order.total_amount)).toBeGreaterThan(500);
        });
    });

    test('should fetch order with detailed items', async () => {
        // Get an order with items
        const [ordersWithItems] = await connection.execute(`
            SELECT DISTINCT o.id 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            LIMIT 1
        `);
        
        if (ordersWithItems.length > 0) {
            const orderId = ordersWithItems[0].id;
            
            // Get order details
            const [orders] = await connection.execute(`
                SELECT o.*, u.username, u.email 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?
            `, [orderId]);
            
            expect(orders.length).toBe(1);
            
            // Get order items
            const [orderItems] = await connection.execute(`
                SELECT oi.*, p.name as product_name, p.sku 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [orderId]);
            
            expect(orderItems.length).toBeGreaterThan(0);
            
            const order = orders[0];
            expect(order).toHaveProperty('id', orderId);
            expect(order).toHaveProperty('order_number');
            expect(order).toHaveProperty('user_id');
            expect(order).toHaveProperty('status');
            expect(order).toHaveProperty('total_amount');
            expect(order).toHaveProperty('username');
            
            // Verify order items structure
            orderItems.forEach(item => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('order_id', orderId);
                expect(item).toHaveProperty('product_id');
                expect(item).toHaveProperty('quantity');
                expect(item).toHaveProperty('unit_price');
                expect(item).toHaveProperty('total_price');
                expect(item).toHaveProperty('product_name');
                expect(item).toHaveProperty('sku');
                
                // Verify calculations
                const expectedTotal = parseFloat(item.unit_price) * item.quantity;
                expect(parseFloat(item.total_price)).toBeCloseTo(expectedTotal, 2);
            });
        }
    });

    test('should search using LIKE and wildcards', async () => {
        // Search products by name
        const [productSearch] = await connection.execute(
            'SELECT * FROM products WHERE name LIKE ?',
            ['%test%']
        );
        
        productSearch.forEach(product => {
            expect(product.name.toLowerCase()).toContain('test');
        });
        
        // Search users by first name starting with specific letter
        const [nameSearch] = await connection.execute(
            'SELECT * FROM users WHERE first_name LIKE ?',
            ['A%']
        );
        
        nameSearch.forEach(user => {
            if (user.first_name) {
                expect(user.first_name.charAt(0).toLowerCase()).toBe('a');
            }
        });
        
        // Search categories by description containing specific words
        const [categorySearch] = await connection.execute(
            'SELECT * FROM categories WHERE description LIKE ? OR description LIKE ?',
            ['%product%', '%item%']
        );
        
        categorySearch.forEach(category => {
            if (category.description) {
                const desc = category.description.toLowerCase();
                expect(desc.includes('product') || desc.includes('item')).toBe(true);
            }
        });
    });

    test('should use comparison operators effectively', async () => {
        // Products with stock below a threshold
        const [lowStock] = await connection.execute(
            'SELECT * FROM products WHERE stock_quantity <= ?',
            [10]
        );
        
        lowStock.forEach(product => {
            expect(product.stock_quantity).toBeLessThanOrEqual(10);
        });
        
        // Orders with amounts in a specific range
        const [mediumOrders] = await connection.execute(
            'SELECT * FROM orders WHERE total_amount BETWEEN ? AND ?',
            ['100.00', '500.00']
        );
        
        mediumOrders.forEach(order => {
            const amount = parseFloat(order.total_amount);
            expect(amount).toBeGreaterThanOrEqual(100);
            expect(amount).toBeLessThanOrEqual(500);
        });
        
        // Products NOT in specific categories
        const [nonElectronics] = await connection.execute(`
            SELECT p.* 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE c.name NOT LIKE '%Electronics%' OR c.name IS NULL
        `);
        
        nonElectronics.forEach(product => {
            // Should not have 'Electronics' in category name if category exists
            if (product.category_name) {
                expect(product.category_name).not.toContain('Electronics');
            }
        });
    });
});