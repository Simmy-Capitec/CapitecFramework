# Lab 4: Playwright + SQL Integration

## Overview
This lab teaches you to integrate SQL database operations with Playwright tests, enabling comprehensive end-to-end testing that validates both UI interactions and database state.

## Prerequisites
- Completed Labs 1-3 (Basic SQL, JOINs, Advanced SQL)
- Node.js and npm installed
- Playwright project set up
- MySQL database running with training data

## Learning Objectives
- Connect to MySQL database from Playwright tests
- Write database utilities for testing
- Implement data-driven tests
- Validate UI actions against database state
- Create test data setup and cleanup procedures

## Project Setup

### 1. Install Required Dependencies

```bash
npm install mysql2 dotenv
npm install --save-dev @faker-js/faker
```

### 2. Environment Configuration

Create `.env` file in your project root:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sql_training

# Test Configuration
BASE_URL=http://localhost:3000
CLEANUP_TEST_DATA=true
```

### 3. Database Helper Setup

Create `utils/database.js`:
```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

export async function initDatabase() {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connected');
}

export async function closeDatabase() {
    if (pool) {
        await pool.end();
        console.log('✅ Database connection closed');
    }
}

export async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

export async function queryOne(sql, params = []) {
    const results = await query(sql, params);
    return results[0] || null;
}
```

## Exercise 1: Basic Database Integration

### Test File: `tests/database-integration.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { initDatabase, closeDatabase, query, queryOne } from '../utils/database.js';

test.beforeAll(async () => {
    await initDatabase();
});

test.afterAll(async () => {
    await closeDatabase();
});

test.describe('Database Integration Tests', () => {
    
    test('should connect to database and retrieve data', async () => {
        // Test basic database connectivity
        const users = await query('SELECT COUNT(*) as count FROM users');
        expect(users[0].count).toBeGreaterThan(0);
    });

    test('should find specific user by email', async () => {
        const user = await queryOne(
            'SELECT username, email FROM users WHERE email = ?',
            ['john.doe@email.com']
        );
        
        expect(user).not.toBeNull();
        expect(user.username).toBe('johndoe');
        expect(user.email).toBe('john.doe@email.com');
    });

    test('should count products by category', async () => {
        const categoryCount = await query(`
            SELECT c.name, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name
            ORDER BY product_count DESC
        `);
        
        expect(categoryCount.length).toBeGreaterThan(0);
        expect(categoryCount[0].product_count).toBeGreaterThanOrEqual(0);
    });
});
```

### Your Task
1. Run the above test and ensure it passes
2. Add a test to verify order totals match sum of order items
3. Add a test to find products with low inventory

## Exercise 2: Test Data Management

### Test Data Factory: `utils/testDataFactory.js`

```javascript
import { faker } from '@faker-js/faker';
import { query, queryOne } from './database.js';

export class TestDataFactory {
    
    static async createTestUser(userData = {}) {
        const defaultData = {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password_hash: faker.string.alphanumeric(32),
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            phone: faker.phone.number(),
            is_active: true
        };
        
        const data = { ...defaultData, ...userData };
        
        const result = await query(`
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            data.username, data.email, data.password_hash,
            data.first_name, data.last_name, data.phone, data.is_active
        ]);
        
        return { id: result.insertId, ...data };
    }
    
    static async createTestProduct(productData = {}) {
        const defaultData = {
            sku: `TEST-${faker.string.alphanumeric(6).toUpperCase()}`,
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            cost: parseFloat(faker.commerce.price()) * 0.6,
            category_id: 1, // Electronics
            stock_quantity: faker.number.int({ min: 10, max: 100 }),
            reorder_level: 10,
            is_active: true
        };
        
        const data = { ...defaultData, ...productData };
        
        const result = await query(`
            INSERT INTO products (sku, name, description, price, cost, category_id, stock_quantity, reorder_level, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.sku, data.name, data.description, data.price, data.cost,
            data.category_id, data.stock_quantity, data.reorder_level, data.is_active
        ]);
        
        return { id: result.insertId, ...data };
    }
    
    static async createTestOrder(userId, orderData = {}) {
        const defaultData = {
            order_number: `TEST-ORDER-${Date.now()}`,
            status: 'pending',
            total_amount: 0,
            shipping_address: faker.location.streetAddress({ useFullAddress: true }),
            billing_address: faker.location.streetAddress({ useFullAddress: true })
        };
        
        const data = { ...defaultData, ...orderData };
        
        const result = await query(`
            INSERT INTO orders (order_number, user_id, status, total_amount, shipping_address, billing_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            data.order_number, userId, data.status, data.total_amount,
            data.shipping_address, data.billing_address
        ]);
        
        return { id: result.insertId, user_id: userId, ...data };
    }
    
    static async cleanupTestData() {
        // Clean up test data in correct order (foreign key constraints)
        await query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'TEST-%')");
        await query("DELETE FROM orders WHERE order_number LIKE 'TEST-%'");
        await query("DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_%')");
        await query("DELETE FROM reviews WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'test_%')");
        await query("DELETE FROM products WHERE sku LIKE 'TEST-%'");
        await query("DELETE FROM users WHERE username LIKE 'test_%' OR email LIKE 'test_%'");
    }
}
```

### Test: `tests/test-data-management.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { initDatabase, closeDatabase, queryOne } from '../utils/database.js';
import { TestDataFactory } from '../utils/testDataFactory.js';

test.beforeAll(async () => {
    await initDatabase();
});

test.afterAll(async () => {
    await closeDatabase();
});

test.afterEach(async () => {
    if (process.env.CLEANUP_TEST_DATA === 'true') {
        await TestDataFactory.cleanupTestData();
    }
});

test.describe('Test Data Management', () => {
    
    test('should create and verify test user', async () => {
        // Create test user
        const testUser = await TestDataFactory.createTestUser({
            username: 'test_user_123',
            email: 'test123@example.com'
        });
        
        // Verify user exists in database
        const dbUser = await queryOne(
            'SELECT * FROM users WHERE id = ?',
            [testUser.id]
        );
        
        expect(dbUser).not.toBeNull();
        expect(dbUser.username).toBe('test_user_123');
        expect(dbUser.email).toBe('test123@example.com');
        expect(dbUser.is_active).toBe(1); // MySQL boolean as int
    });
    
    test('should create test product with valid data', async () => {
        const testProduct = await TestDataFactory.createTestProduct({
            name: 'Test Product 123',
            price: 99.99
        });
        
        const dbProduct = await queryOne(
            'SELECT * FROM products WHERE id = ?',
            [testProduct.id]
        );
        
        expect(dbProduct).not.toBeNull();
        expect(dbProduct.name).toBe('Test Product 123');
        expect(parseFloat(dbProduct.price)).toBe(99.99);
        expect(dbProduct.sku).toMatch(/^TEST-/);
    });
});
```

### Your Task
1. Complete the test data factory with a method to create order items
2. Add a method to create a complete order with items
3. Write tests to verify the cleanup functionality works correctly

## Exercise 3: End-to-End Testing with Database Validation

### Test: `tests/e2e-with-database.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { initDatabase, closeDatabase, query, queryOne } from '../utils/database.js';
import { TestDataFactory } from '../utils/testDataFactory.js';

test.beforeAll(async () => {
    await initDatabase();
});

test.afterAll(async () => {
    await closeDatabase();
});

test.afterEach(async () => {
    await TestDataFactory.cleanupTestData();
});

test.describe('E2E Tests with Database Validation', () => {
    
    test('user registration should save data to database', async ({ page }) => {
        // Navigate to registration page
        await page.goto('/register');
        
        // Fill registration form
        const testEmail = `test_${Date.now()}@example.com`;
        const testUsername = `test_user_${Date.now()}`;
        
        await page.fill('#username', testUsername);
        await page.fill('#email', testEmail);
        await page.fill('#password', 'TestPassword123');
        await page.fill('#confirmPassword', 'TestPassword123');
        
        // Submit form
        await page.click('#registerButton');
        
        // Wait for success message
        await expect(page.locator('.success-message')).toBeVisible();
        
        // Verify user exists in database
        const dbUser = await queryOne(
            'SELECT * FROM users WHERE email = ?',
            [testEmail]
        );
        
        expect(dbUser).not.toBeNull();
        expect(dbUser.username).toBe(testUsername);
        expect(dbUser.email).toBe(testEmail);
        expect(dbUser.is_active).toBe(1);
        
        // Verify password is hashed (not plain text)
        expect(dbUser.password_hash).not.toBe('TestPassword123');
        expect(dbUser.password_hash.length).toBeGreaterThan(10);
    });
    
    test('adding item to cart should update database', async ({ page }) => {
        // Create test user and login
        const testUser = await TestDataFactory.createTestUser();
        
        // Login process (assuming login functionality)
        await page.goto('/login');
        await page.fill('#email', testUser.email);
        await page.fill('#password', 'test_password');
        await page.click('#loginButton');
        
        // Navigate to product page
        await page.goto('/products/1'); // Assuming product ID 1 exists
        
        // Add to cart
        await page.click('#addToCartButton');
        await expect(page.locator('.cart-success')).toBeVisible();
        
        // Verify cart item in database
        const cartItem = await queryOne(`
            SELECT ci.*, p.name as product_name
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ? AND ci.product_id = 1
        `, [testUser.id]);
        
        expect(cartItem).not.toBeNull();
        expect(cartItem.quantity).toBe(1);
        expect(cartItem.product_id).toBe(1);
    });
    
    test('placing order should update inventory', async ({ page }) => {
        // Setup: Create test user and product
        const testUser = await TestDataFactory.createTestUser();
        const testProduct = await TestDataFactory.createTestProduct({
            stock_quantity: 50
        });
        
        // Get initial stock
        const initialStock = await queryOne(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [testProduct.id]
        );
        
        // Simulate order placement (you would implement UI interaction here)
        // For this example, we'll create the order directly
        const order = await TestDataFactory.createTestOrder(testUser.id);
        
        // Add order item
        await query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, 2, ?, ?)
        `, [order.id, testProduct.id, testProduct.price, testProduct.price * 2]);
        
        // Simulate inventory update (this would happen in your application)
        await query(`
            UPDATE products 
            SET stock_quantity = stock_quantity - 2 
            WHERE id = ?
        `, [testProduct.id]);
        
        // Verify inventory was reduced
        const updatedStock = await queryOne(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [testProduct.id]
        );
        
        expect(updatedStock.stock_quantity).toBe(initialStock.stock_quantity - 2);
    });
});
```

### Your Task
1. Adapt the tests to match your actual application's UI
2. Add test for order cancellation (should restore inventory)
3. Add test for user profile updates
4. Create test for product review submission

## Exercise 4: Data-Driven Testing

### Test: `tests/data-driven-tests.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { initDatabase, closeDatabase, query } from '../utils/database.js';

test.beforeAll(async () => {
    await initDatabase();
});

test.afterAll(async () => {
    await closeDatabase();
});

test.describe('Data-Driven Tests', () => {
    
    test('validate all users have valid email formats', async () => {
        const users = await query('SELECT id, email FROM users');
        
        for (const user of users) {
            expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        }
    });
    
    test('verify order totals match item sums', async () => {
        const orderTotals = await query(`
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                SUM(oi.total_price) as calculated_total
            FROM orders o
            INNER JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, o.order_number, o.total_amount
        `);
        
        for (const order of orderTotals) {
            expect(parseFloat(order.total_amount)).toBeCloseTo(
                parseFloat(order.calculated_total), 
                2
            );
        }
    });
    
    test('check product price consistency', async () => {
        const products = await query(`
            SELECT id, sku, name, price, cost
            FROM products
            WHERE is_active = TRUE
        `);
        
        for (const product of products) {
            // Price should be positive
            expect(parseFloat(product.price)).toBeGreaterThan(0);
            
            // Price should be greater than cost (if cost is set)
            if (product.cost !== null) {
                expect(parseFloat(product.price)).toBeGreaterThan(
                    parseFloat(product.cost)
                );
            }
        }
    });
});
```

### Your Task
1. Add test to validate all order dates are not in the future
2. Create test to check for orphaned records (foreign key integrity)
3. Add performance test for large dataset queries

## Exercise 5: Test Fixtures with Database

### Fixture: `fixtures/databaseFixtures.js`

```javascript
import { test as base } from '@playwright/test';
import { initDatabase, closeDatabase } from '../utils/database.js';
import { TestDataFactory } from '../utils/testDataFactory.js';

export const test = base.extend({
    database: async ({}, use) => {
        await initDatabase();
        await use({
            query: require('../utils/database.js').query,
            queryOne: require('../utils/database.js').queryOne,
            factory: TestDataFactory
        });
        await closeDatabase();
    },
    
    testUser: async ({ database }, use) => {
        const user = await database.factory.createTestUser();
        await use(user);
        // Cleanup happens in afterEach
    },
    
    testProduct: async ({ database }, use) => {
        const product = await database.factory.createTestProduct();
        await use(product);
    }
});

test.afterEach(async () => {
    if (process.env.CLEANUP_TEST_DATA === 'true') {
        await TestDataFactory.cleanupTestData();
    }
});
```

### Using Fixtures: `tests/fixture-example.spec.js`

```javascript
import { test, expect } from '../fixtures/databaseFixtures.js';

test('should use database fixtures', async ({ testUser, testProduct, database }) => {
    // Test user and product are automatically created
    expect(testUser.id).toBeDefined();
    expect(testProduct.id).toBeDefined();
    
    // Can use database utilities
    const user = await database.queryOne(
        'SELECT * FROM users WHERE id = ?',
        [testUser.id]
    );
    
    expect(user.username).toBe(testUser.username);
});
```

## Exercise 6: Performance and Load Testing

### Test: `tests/performance-database.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { initDatabase, closeDatabase, query } from '../utils/database.js';

test.beforeAll(async () => {
    await initDatabase();
});

test.afterAll(async () => {
    await closeDatabase();
});

test.describe('Database Performance Tests', () => {
    
    test('query performance should be acceptable', async () => {
        const startTime = Date.now();
        
        await query(`
            SELECT 
                u.username,
                COUNT(o.id) as order_count,
                SUM(o.total_amount) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id, u.username
            ORDER BY total_spent DESC
        `);
        
        const executionTime = Date.now() - startTime;
        
        // Query should complete within 1 second
        expect(executionTime).toBeLessThan(1000);
    });
    
    test('bulk insert performance', async () => {
        const startTime = Date.now();
        
        // Insert 100 test records
        const values = Array.from({ length: 100 }, (_, i) => 
            `('test_bulk_${i}', 'bulk${i}@test.com', 'hash')`
        ).join(',');
        
        await query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ${values}
        `);
        
        const executionTime = Date.now() - startTime;
        
        // Bulk insert should be fast
        expect(executionTime).toBeLessThan(500);
        
        // Cleanup
        await query("DELETE FROM users WHERE username LIKE 'test_bulk_%'");
    });
});
```

## Assessment and Deliverables

### What to Submit
1. All completed test files
2. Database utility functions
3. Test data factory with cleanup
4. Performance test results
5. Documentation of any issues encountered

### Grading Criteria

**Database Integration (25%)**
- Proper connection handling
- Error handling
- Query execution

**Test Data Management (25%)**
- Clean data factories
- Proper cleanup procedures
- No test pollution

**E2E Validation (25%)**
- UI actions validated against database
- Comprehensive test coverage
- Realistic test scenarios

**Code Quality (25%)**
- Clean, readable code
- Proper error handling
- Good documentation

## Common Issues and Solutions

### Issue 1: Connection Pool Exhaustion
```javascript
// Solution: Always close connections
test.afterAll(async () => {
    await closeDatabase();
});
```

### Issue 2: Test Data Pollution
```javascript
// Solution: Consistent cleanup
test.afterEach(async () => {
    await TestDataFactory.cleanupTestData();
});
```

### Issue 3: Foreign Key Constraints
```javascript
// Solution: Delete in correct order
await query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'TEST-%')");
await query("DELETE FROM orders WHERE order_number LIKE 'TEST-%'");
```

## Next Steps
- Module 5: Advanced Testing Scenarios
- Performance optimization techniques
- Security testing with SQL injection prevention
- CI/CD integration with database tests

## Resources
- Playwright documentation
- MySQL Node.js driver docs
- SQL injection prevention guide
- Database testing best practices

This lab provides the foundation for professional database testing with Playwright. Master these concepts before moving to advanced scenarios!