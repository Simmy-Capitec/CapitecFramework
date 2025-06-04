# Module 4: SQL in Test Automation

## Module 4.1: Database Testing Fundamentals

### Why Database Testing Matters

In modern applications, the database is often the single source of truth. UI interactions trigger database changes, and those changes must be validated to ensure:

1. **Data Persistence**: User actions are correctly saved
2. **Data Integrity**: Business rules are enforced
3. **Performance**: Operations complete within acceptable time
4. **Security**: Unauthorized access is prevented
5. **Consistency**: Related data remains synchronized

### Types of Database Tests

#### 1. Data Validation Tests
Verify that UI actions result in correct database state.

```javascript
// Example: User registration test
test('user registration saves correct data', async ({ page }) => {
    // UI Action
    await page.fill('#username', 'testuser123');
    await page.fill('#email', 'test@example.com');
    await page.click('#register');
    
    // Database Validation
    const user = await db.queryOne(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
    );
    
    expect(user).not.toBeNull();
    expect(user.username).toBe('testuser123');
    expect(user.is_active).toBe(true);
});
```

#### 2. Business Logic Tests
Ensure complex business rules are implemented correctly.

```javascript
// Example: Order total calculation
test('order total includes tax and discounts', async ({ page }) => {
    // Setup: Add items to cart
    await addItemToCart(productId, quantity, unitPrice);
    
    // UI Action: Checkout
    await page.click('#checkout');
    await page.fill('#discount-code', 'SAVE10');
    await page.click('#apply-discount');
    await page.click('#place-order');
    
    // Database Validation
    const order = await db.queryOne(`
        SELECT 
            subtotal,
            discount_amount,
            tax_amount,
            total_amount
        FROM orders 
        WHERE id = ?
    `, [orderId]);
    
    const expectedTotal = order.subtotal - order.discount_amount + order.tax_amount;
    expect(order.total_amount).toBeCloseTo(expectedTotal, 2);
});
```

#### 3. Data Consistency Tests
Verify related data remains synchronized.

```javascript
// Example: Inventory consistency
test('order placement reduces inventory correctly', async ({ page }) => {
    // Get initial inventory
    const initialStock = await db.queryOne(
        'SELECT stock_quantity FROM products WHERE id = ?',
        [productId]
    );
    
    // Place order for 3 items
    await placeOrder(productId, 3);
    
    // Verify inventory reduced
    const finalStock = await db.queryOne(
        'SELECT stock_quantity FROM products WHERE id = ?',
        [productId]
    );
    
    expect(finalStock.stock_quantity).toBe(initialStock.stock_quantity - 3);
});
```

#### 4. Performance Tests
Ensure database operations meet performance requirements.

```javascript
// Example: Query performance test
test('user dashboard loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    // UI Action
    await page.goto('/dashboard');
    await page.waitForSelector('#user-stats');
    
    const loadTime = Date.now() - startTime;
    
    // Verify underlying queries are efficient
    const dbStartTime = Date.now();
    await db.query(`
        SELECT 
            COUNT(DISTINCT o.id) as order_count,
            SUM(o.total_amount) as total_spent,
            AVG(o.total_amount) as avg_order
        FROM orders o
        WHERE o.user_id = ?
        AND o.status = 'delivered'
    `, [userId]);
    const dbTime = Date.now() - dbStartTime;
    
    expect(loadTime).toBeLessThan(2000);
    expect(dbTime).toBeLessThan(500);
});
```

### Database Assertions

#### Common Assertion Patterns

```javascript
// 1. Record Existence
async function assertRecordExists(table, conditions) {
    const record = await db.queryOne(
        `SELECT COUNT(*) as count FROM ${table} WHERE ${Object.keys(conditions).map(k => `${k} = ?`).join(' AND ')}`,
        Object.values(conditions)
    );
    expect(record.count).toBe(1);
}

// Usage
await assertRecordExists('users', { email: 'test@example.com', is_active: true });

// 2. Record Count
async function assertRecordCount(table, expectedCount, conditions = {}) {
    const whereClause = Object.keys(conditions).length > 0 
        ? 'WHERE ' + Object.keys(conditions).map(k => `${k} = ?`).join(' AND ')
        : '';
    
    const result = await db.queryOne(
        `SELECT COUNT(*) as count FROM ${table} ${whereClause}`,
        Object.values(conditions)
    );
    expect(result.count).toBe(expectedCount);
}

// Usage
await assertRecordCount('order_items', 3, { order_id: 123 });

// 3. Value Validation
async function assertFieldValue(table, field, expectedValue, conditions) {
    const record = await db.queryOne(
        `SELECT ${field} FROM ${table} WHERE ${Object.keys(conditions).map(k => `${k} = ?`).join(' AND ')}`,
        Object.values(conditions)
    );
    expect(record[field]).toBe(expectedValue);
}

// Usage
await assertFieldValue('products', 'stock_quantity', 47, { id: 123 });

// 4. Relationship Validation
async function assertRelationshipExists(parentTable, childTable, foreignKey, parentId) {
    const result = await db.query(`
        SELECT COUNT(*) as count 
        FROM ${childTable} 
        WHERE ${foreignKey} = ?
    `, [parentId]);
    
    expect(result[0].count).toBeGreaterThan(0);
}

// Usage
await assertRelationshipExists('orders', 'order_items', 'order_id', 123);
```

### Data Validation Techniques

#### 1. Schema Validation

```javascript
// Validate data types and constraints
async function validateUserSchema(userId) {
    const user = await db.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    
    // Required fields
    expect(user.username).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.password_hash).toBeDefined();
    
    // Data types
    expect(typeof user.username).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.is_active).toBe('number'); // MySQL boolean as int
    
    // Constraints
    expect(user.username.length).toBeGreaterThan(0);
    expect(user.username.length).toBeLessThanOrEqual(50);
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(user.password_hash.length).toBeGreaterThan(10);
}
```

#### 2. Business Rule Validation

```javascript
// Validate complex business logic
async function validateOrderBusinessRules(orderId) {
    const orderData = await db.queryOne(`
        SELECT 
            o.*,
            SUM(oi.total_price) as calculated_total,
            COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
        GROUP BY o.id
    `, [orderId]);
    
    // Order must have items
    expect(orderData.item_count).toBeGreaterThan(0);
    
    // Total must match sum of items
    expect(parseFloat(orderData.total_amount)).toBeCloseTo(
        parseFloat(orderData.calculated_total), 
        2
    );
    
    // Order total must be positive
    expect(parseFloat(orderData.total_amount)).toBeGreaterThan(0);
    
    // Validate status transitions
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    expect(validStatuses).toContain(orderData.status);
}
```

#### 3. Data Integrity Validation

```javascript
// Check referential integrity
async function validateDataIntegrity() {
    // Orphaned order items
    const orphanedItems = await db.query(`
        SELECT oi.id 
        FROM order_items oi
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.id IS NULL
    `);
    expect(orphanedItems).toHaveLength(0);
    
    // Orders without items
    const emptyOrders = await db.query(`
        SELECT o.id
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.id IS NULL
    `);
    expect(emptyOrders).toHaveLength(0);
    
    // Products with invalid categories
    const invalidProducts = await db.query(`
        SELECT p.id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id IS NOT NULL AND c.id IS NULL
    `);
    expect(invalidProducts).toHaveLength(0);
}
```

## Module 4.2: Integrating SQL with Playwright

### Advanced Database Connection Patterns

#### Connection Pool Management

```javascript
// Enhanced database manager
class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }
    
    async connect() {
        if (this.isConnected) return;
        
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });
            
            // Test connection
            await this.pool.execute('SELECT 1');
            this.isConnected = true;
            console.log('✅ Database connected');
            
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }
    
    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('✅ Database disconnected');
        }
    }
    
    async query(sql, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Query failed:', { sql, params, error: error.message });
            throw error;
        }
    }
    
    async transaction(queries) {
        const connection = await this.pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const results = [];
            for (const { sql, params = [] } of queries) {
                const [result] = await connection.execute(sql, params);
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
}

// Global instance
export const db = new DatabaseManager();
```

#### Database Fixtures for Playwright

```javascript
// fixtures/databaseFixtures.js
import { test as base } from '@playwright/test';
import { db } from '../utils/databaseManager.js';
import { TestDataFactory } from '../utils/testDataFactory.js';

export const test = base.extend({
    // Database connection fixture
    database: async ({}, use) => {
        await db.connect();
        
        const dbUtils = {
            query: (sql, params) => db.query(sql, params),
            queryOne: async (sql, params) => {
                const results = await db.query(sql, params);
                return results[0] || null;
            },
            transaction: (queries) => db.transaction(queries),
            factory: new TestDataFactory(db)
        };
        
        await use(dbUtils);
        await db.disconnect();
    },
    
    // Clean database state
    cleanDatabase: async ({ database }, use) => {
        await use(database);
        
        // Cleanup test data after each test
        if (process.env.CLEANUP_TEST_DATA === 'true') {
            await database.factory.cleanupAll();
        }
    },
    
    // Pre-created test user
    testUser: async ({ database }, use) => {
        const user = await database.factory.createUser({
            username: `test_user_${Date.now()}`,
            email: `test_${Date.now()}@example.com`
        });
        
        await use(user);
        // Cleanup handled by cleanDatabase fixture
    },
    
    // Pre-created test product
    testProduct: async ({ database }, use) => {
        const product = await database.factory.createProduct({
            name: `Test Product ${Date.now()}`,
            price: 99.99,
            stock_quantity: 50
        });
        
        await use(product);
    }
});

export { expect } from '@playwright/test';
```

#### Advanced Test Data Factory

```javascript
// utils/testDataFactory.js
export class TestDataFactory {
    constructor(database) {
        this.db = database;
        this.createdRecords = {
            users: [],
            products: [],
            orders: [],
            categories: []
        };
    }
    
    async createUser(userData = {}) {
        const defaultData = {
            username: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: `test_${Date.now()}@example.com`,
            password_hash: 'test_hash_' + Math.random().toString(36),
            first_name: 'Test',
            last_name: 'User',
            is_active: true
        };
        
        const data = { ...defaultData, ...userData };
        
        const result = await this.db.query(`
            INSERT INTO users (username, email, password_hash, first_name, last_name, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [data.username, data.email, data.password_hash, data.first_name, data.last_name, data.is_active]);
        
        const user = { id: result.insertId, ...data };
        this.createdRecords.users.push(user.id);
        return user;
    }
    
    async createProduct(productData = {}) {
        const defaultData = {
            sku: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            name: `Test Product ${Date.now()}`,
            description: 'Test product description',
            price: 29.99,
            cost: 15.00,
            category_id: 1,
            stock_quantity: 100,
            reorder_level: 10,
            is_active: true
        };
        
        const data = { ...defaultData, ...productData };
        
        const result = await this.db.query(`
            INSERT INTO products (sku, name, description, price, cost, category_id, stock_quantity, reorder_level, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [data.sku, data.name, data.description, data.price, data.cost, data.category_id, data.stock_quantity, data.reorder_level, data.is_active]);
        
        const product = { id: result.insertId, ...data };
        this.createdRecords.products.push(product.id);
        return product;
    }
    
    async createOrder(userId, orderData = {}) {
        const defaultData = {
            order_number: `TEST-${Date.now()}`,
            status: 'pending',
            total_amount: 0,
            shipping_address: '123 Test St, Test City, TC 12345',
            billing_address: '123 Test St, Test City, TC 12345'
        };
        
        const data = { ...defaultData, ...orderData };
        
        const result = await this.db.query(`
            INSERT INTO orders (order_number, user_id, status, total_amount, shipping_address, billing_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [data.order_number, userId, data.status, data.total_amount, data.shipping_address, data.billing_address]);
        
        const order = { id: result.insertId, user_id: userId, ...data };
        this.createdRecords.orders.push(order.id);
        return order;
    }
    
    async createOrderWithItems(userId, items, orderData = {}) {
        // Create order
        const order = await this.createOrder(userId, orderData);
        
        // Add items
        let totalAmount = 0;
        for (const item of items) {
            const itemTotal = item.quantity * item.unit_price;
            totalAmount += itemTotal;
            
            await this.db.query(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
            `, [order.id, item.product_id, item.quantity, item.unit_price, itemTotal]);
        }
        
        // Update order total
        await this.db.query(
            'UPDATE orders SET total_amount = ? WHERE id = ?',
            [totalAmount, order.id]
        );
        
        return { ...order, total_amount: totalAmount, items };
    }
    
    async createCompleteUserScenario() {
        // Create user
        const user = await this.createUser();
        
        // Create products
        const product1 = await this.createProduct({ price: 50.00 });
        const product2 = await this.createProduct({ price: 30.00 });
        
        // Create order with items
        const order = await this.createOrderWithItems(user.id, [
            { product_id: product1.id, quantity: 2, unit_price: product1.price },
            { product_id: product2.id, quantity: 1, unit_price: product2.price }
        ]);
        
        return { user, products: [product1, product2], order };
    }
    
    async cleanupAll() {
        try {
            // Clean in reverse order of dependencies
            await this.db.query(`DELETE FROM order_items WHERE order_id IN (${this.createdRecords.orders.map(() => '?').join(',')})`, this.createdRecords.orders);
            await this.db.query(`DELETE FROM orders WHERE id IN (${this.createdRecords.orders.map(() => '?').join(',')})`, this.createdRecords.orders);
            await this.db.query(`DELETE FROM products WHERE id IN (${this.createdRecords.products.map(() => '?').join(',')})`, this.createdRecords.products);
            await this.db.query(`DELETE FROM users WHERE id IN (${this.createdRecords.users.map(() => '?').join(',')})`, this.createdRecords.users);
            
            // Reset tracking
            this.createdRecords = { users: [], products: [], orders: [], categories: [] };
            
        } catch (error) {
            console.error('Cleanup failed:', error);
            // Continue anyway to avoid blocking other tests
        }
    }
}
```

### Database-Driven Test Patterns

#### Pattern 1: Data-Driven Testing

```javascript
// tests/data-driven-validation.spec.js
import { test, expect } from '../fixtures/databaseFixtures.js';

test.describe('Data-Driven Validation Tests', () => {
    
    test('validate all user emails are properly formatted', async ({ database }) => {
        const users = await database.query('SELECT id, email FROM users');
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = users.filter(user => !emailRegex.test(user.email));
        
        if (invalidEmails.length > 0) {
            console.log('Invalid emails found:', invalidEmails);
        }
        
        expect(invalidEmails).toHaveLength(0);
    });
    
    test('verify all order totals match item calculations', async ({ database }) => {
        const orderTotals = await database.query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount as stored_total,
                COALESCE(SUM(oi.total_price), 0) as calculated_total
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, o.order_number, o.total_amount
        `);
        
        const discrepancies = orderTotals.filter(order => {
            const diff = Math.abs(order.stored_total - order.calculated_total);
            return diff > 0.01; // Allow for rounding differences
        });
        
        if (discrepancies.length > 0) {
            console.log('Order total discrepancies:', discrepancies);
        }
        
        expect(discrepancies).toHaveLength(0);
    });
    
    test('check for orphaned records across all tables', async ({ database }) => {
        // Orders without users
        const orphanedOrders = await database.query(`
            SELECT o.id, o.order_number
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE u.id IS NULL
        `);
        
        // Order items without orders
        const orphanedItems = await database.query(`
            SELECT oi.id
            FROM order_items oi
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.id IS NULL
        `);
        
        // Order items without products
        const orphanedProducts = await database.query(`
            SELECT oi.id, oi.product_id
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE p.id IS NULL
        `);
        
        expect(orphanedOrders).toHaveLength(0);
        expect(orphanedItems).toHaveLength(0);
        expect(orphanedProducts).toHaveLength(0);
    });
});
```

#### Pattern 2: State Transition Testing

```javascript
// tests/state-transitions.spec.js
test.describe('Order State Transitions', () => {
    
    test('order progression follows valid state machine', async ({ testUser, testProduct, database, page }) => {
        // Create initial order
        const order = await database.factory.createOrderWithItems(testUser.id, [
            { product_id: testProduct.id, quantity: 2, unit_price: testProduct.price }
        ]);
        
        // Verify initial state
        let currentOrder = await database.queryOne(
            'SELECT status FROM orders WHERE id = ?',
            [order.id]
        );
        expect(currentOrder.status).toBe('pending');
        
        // Simulate state transitions through UI
        await page.goto(`/admin/orders/${order.id}`);
        
        // pending -> processing
        await page.click('#process-order');
        await page.waitForSelector('.status-updated');
        
        currentOrder = await database.queryOne(
            'SELECT status FROM orders WHERE id = ?',
            [order.id]
        );
        expect(currentOrder.status).toBe('processing');
        
        // processing -> shipped
        await page.click('#ship-order');
        await page.waitForSelector('.status-updated');
        
        currentOrder = await database.queryOne(
            'SELECT status FROM orders WHERE id = ?',
            [order.id]
        );
        expect(currentOrder.status).toBe('shipped');
        
        // Verify shipped_at timestamp was set
        const orderDetails = await database.queryOne(
            'SELECT shipped_at FROM orders WHERE id = ?',
            [order.id]
        );
        expect(orderDetails.shipped_at).not.toBeNull();
    });
    
    test('invalid state transitions are prevented', async ({ testUser, testProduct, database, page }) => {
        // Create delivered order
        const order = await database.factory.createOrder(testUser.id, {
            status: 'delivered'
        });
        
        await page.goto(`/admin/orders/${order.id}`);
        
        // Try to process a delivered order (should be disabled/error)
        const processButton = page.locator('#process-order');
        await expect(processButton).toBeDisabled();
        
        // Verify status unchanged
        const currentOrder = await database.queryOne(
            'SELECT status FROM orders WHERE id = ?',
            [order.id]
        );
        expect(currentOrder.status).toBe('delivered');
    });
});
```

#### Pattern 3: Concurrent Access Testing

```javascript
// tests/concurrent-access.spec.js
test.describe('Concurrent Access Tests', () => {
    
    test('concurrent inventory updates maintain consistency', async ({ database }) => {
        // Create product with known inventory
        const product = await database.factory.createProduct({
            stock_quantity: 100
        });
        
        // Simulate concurrent order placements
        const concurrentOrders = [];
        for (let i = 0; i < 5; i++) {
            const user = await database.factory.createUser();
            const orderPromise = database.transaction([
                {
                    sql: 'INSERT INTO orders (order_number, user_id, status, total_amount) VALUES (?, ?, ?, ?)',
                    params: [`CONCURRENT-${i}`, user.id, 'pending', 50.00]
                },
                {
                    sql: 'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (LAST_INSERT_ID(), ?, ?, ?, ?)',
                    params: [product.id, 5, 10.00, 50.00]
                },
                {
                    sql: 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    params: [5, product.id]
                }
            ]);
            concurrentOrders.push(orderPromise);
        }
        
        // Execute all transactions
        await Promise.all(concurrentOrders);
        
        // Verify final inventory
        const finalProduct = await database.queryOne(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [product.id]
        );
        
        // Should be 100 - (5 orders × 5 items) = 75
        expect(finalProduct.stock_quantity).toBe(75);
        
        // Verify all orders were created
        const orderCount = await database.queryOne(
            'SELECT COUNT(*) as count FROM orders WHERE order_number LIKE "CONCURRENT-%"'
        );
        expect(orderCount.count).toBe(5);
    });
});
```

### Error Handling and Recovery

#### Database Error Handling

```javascript
// utils/databaseErrorHandler.js
export class DatabaseErrorHandler {
    static async withRetry(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                if (this.isRetryableError(error)) {
                    console.log(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
                    await this.sleep(delay);
                    delay *= 2; // Exponential backoff
                } else {
                    throw error; // Don't retry non-retryable errors
                }
            }
        }
    }
    
    static isRetryableError(error) {
        const retryableCodes = [
            'ECONNRESET',
            'ENOTFOUND',
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ER_LOCK_WAIT_TIMEOUT',
            'ER_LOCK_DEADLOCK'
        ];
        
        return retryableCodes.some(code => 
            error.code === code || error.message.includes(code)
        );
    }
    
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Usage in tests
test('database operation with retry logic', async ({ database }) => {
    const result = await DatabaseErrorHandler.withRetry(async () => {
        return await database.query('SELECT * FROM users WHERE id = ?', [123]);
    });
    
    expect(result).toBeDefined();
});
```

#### Test Data Cleanup on Failure

```javascript
// fixtures/robustDatabaseFixtures.js
export const test = base.extend({
    robustDatabase: async ({}, use, testInfo) => {
        const factory = new TestDataFactory(db);
        
        try {
            await use({
                query: (sql, params) => db.query(sql, params),
                factory: factory
            });
        } catch (error) {
            // Log failure context
            console.error(`Test failed: ${testInfo.title}`, error);
            
            // Try to capture database state for debugging
            try {
                const debugInfo = await db.query(`
                    SELECT 
                        'users' as table_name, COUNT(*) as count 
                    FROM users WHERE username LIKE 'test_%'
                    UNION ALL
                    SELECT 
                        'orders' as table_name, COUNT(*) as count 
                    FROM orders WHERE order_number LIKE 'TEST-%'
                `);
                console.log('Database state at failure:', debugInfo);
            } catch (debugError) {
                console.error('Could not capture debug info:', debugError);
            }
            
            throw error;
        } finally {
            // Always cleanup, even on failure
            try {
                await factory.cleanupAll();
            } catch (cleanupError) {
                console.error('Cleanup failed:', cleanupError);
            }
        }
    }
});
```

### Best Practices for SQL in Test Automation

#### 1. Connection Management
- Use connection pooling for performance
- Implement proper connection timeouts
- Handle connection failures gracefully
- Clean up connections in test teardown

#### 2. Test Data Management
- Use factories for consistent test data creation
- Implement proper cleanup procedures
- Isolate test data with unique identifiers
- Use transactions for atomic test operations

#### 3. Query Optimization
- Use parameterized queries to prevent SQL injection
- Add appropriate indexes for test queries
- Monitor query performance in tests
- Use EXPLAIN to understand query execution

#### 4. Error Handling
- Implement retry logic for transient failures
- Distinguish between recoverable and fatal errors
- Log sufficient context for debugging
- Fail fast for configuration errors

#### 5. Test Isolation
- Ensure tests don't interfere with each other
- Use test-specific databases when possible
- Clean up test data after each test
- Consider using database snapshots for faster reset

### Common Pitfalls and Solutions

#### Pitfall 1: Test Data Pollution
```javascript
// Problem: Tests interfere with each other
test('first test', async ({ database }) => {
    await database.factory.createUser({ email: 'test@example.com' });
    // Test logic...
});

test('second test', async ({ database }) => {
    await database.factory.createUser({ email: 'test@example.com' }); // Fails!
});

// Solution: Use unique identifiers
test('first test', async ({ database }) => {
    await database.factory.createUser(); // Auto-generates unique email
});
```

#### Pitfall 2: Timing Issues
```javascript
// Problem: Database writes are async
await page.click('#save-button');
const user = await database.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
expect(user.last_updated).toBeGreaterThan(startTime); // May fail

// Solution: Wait for UI confirmation
await page.click('#save-button');
await page.waitForSelector('.save-success');
const user = await database.queryOne('SELECT * FROM users WHERE id = ?', [userId]);
expect(user.last_updated).toBeGreaterThan(startTime);
```

#### Pitfall 3: Hardcoded Values
```javascript
// Problem: Brittle tests
expect(user.id).toBe(123); // Breaks if data changes

// Solution: Use relative assertions
expect(user.id).toBeGreaterThan(0);
expect(typeof user.id).toBe('number');
```

### Summary

Module 4 covers:
- Database testing fundamentals
- Advanced Playwright integration patterns
- Robust test data management
- Error handling and recovery
- Best practices for SQL in automation

These skills enable:
- Comprehensive end-to-end validation
- Reliable database-driven tests
- Efficient test data management
- Production-ready test automation

### Next Steps

Module 5 will cover advanced testing scenarios:
- Performance testing with SQL
- Security testing and SQL injection prevention
- Database migration testing
- Advanced test strategies for complex systems