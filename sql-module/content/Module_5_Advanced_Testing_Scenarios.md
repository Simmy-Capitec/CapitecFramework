# Module 5: Advanced Testing Scenarios

## Module 5.1: Security Testing with SQL

### SQL Injection Prevention Testing

Security testing is crucial when working with databases. As test automation engineers, we need to verify that our applications properly prevent SQL injection attacks.

#### Understanding SQL Injection

SQL injection occurs when malicious SQL code is inserted into application queries. For example:

```sql
-- Vulnerable query construction
SELECT * FROM users WHERE username = '" + userInput + "' AND password = '" + passwordInput + "'

-- If userInput is: admin'; DROP TABLE users; --
-- The resulting query becomes:
SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --' AND password = 'whatever'
```

#### Testing for SQL Injection Prevention

**Playwright Test Example:**

```javascript
// tests/security/sql-injection.spec.js
import { test, expect } from '@playwright/test';

test.describe('SQL Injection Prevention', () => {
  const maliciousInputs = [
    "'; DROP TABLE users; --",
    "admin'--",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --"
  ];

  maliciousInputs.forEach(maliciousInput => {
    test(`Should handle malicious input: ${maliciousInput}`, async ({ page }) => {
      await page.goto('/login');
      
      // Attempt injection in username field
      await page.fill('#username', maliciousInput);
      await page.fill('#password', 'anypassword');
      await page.click('#login-button');
      
      // Should show appropriate error, not succeed
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.dashboard')).not.toBeVisible();
      
      // Verify database integrity (if accessible)
      const userCount = await page.evaluate(async () => {
        const response = await fetch('/api/admin/user-count');
        return response.json();
      });
      
      // User count should remain unchanged
      expect(userCount.total).toBeGreaterThan(0);
    });
  });
});
```

#### Database-Level Security Validation

```javascript
// utils/security-helpers.js
import { executeQuery } from './database.js';

export class SecurityValidator {
  static async validateTableIntegrity() {
    // Check that critical tables still exist
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'testdb'
    `);
    
    const criticalTables = ['users', 'products', 'orders'];
    const existingTables = tables.map(row => row.table_name);
    
    for (const table of criticalTables) {
      if (!existingTables.includes(table)) {
        throw new Error(`Critical table ${table} is missing!`);
      }
    }
    
    return true;
  }
  
  static async validateDataIntegrity() {
    // Check for suspicious data changes
    const suspiciousUsers = await executeQuery(`
      SELECT * FROM users 
      WHERE username LIKE '%script%' 
         OR username LIKE '%drop%'
         OR username LIKE '%union%'
    `);
    
    if (suspiciousUsers.length > 0) {
      throw new Error('Suspicious user data detected');
    }
    
    return true;
  }
}
```

## Module 5.2: Performance Testing with Database Monitoring

### Database Performance Metrics

When testing applications with database interactions, we need to monitor:

1. **Query Execution Time**
2. **Connection Pool Usage**
3. **Database Lock Contention**
4. **Memory Usage**
5. **Index Effectiveness**

#### Performance Monitoring in Tests

```javascript
// utils/performance-monitor.js
export class DatabasePerformanceMonitor {
  constructor() {
    this.queryTimes = [];
    this.connectionCount = 0;
  }
  
  async measureQuery(queryFunction, description) {
    const startTime = performance.now();
    
    try {
      const result = await queryFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.queryTimes.push({
        description,
        duration,
        timestamp: new Date(),
        success: true
      });
      
      // Alert on slow queries
      if (duration > 1000) { // 1 second threshold
        console.warn(`Slow query detected: ${description} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.queryTimes.push({
        description,
        duration,
        timestamp: new Date(),
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
  
  getPerformanceReport() {
    const totalQueries = this.queryTimes.length;
    const averageTime = this.queryTimes.reduce((sum, q) => sum + q.duration, 0) / totalQueries;
    const slowQueries = this.queryTimes.filter(q => q.duration > 1000);
    
    return {
      totalQueries,
      averageTime: Math.round(averageTime),
      slowQueries: slowQueries.length,
      slowQueriesDetails: slowQueries
    };
  }
}
```

#### Performance Test Implementation

```javascript
// tests/performance/database-performance.spec.js
import { test, expect } from '@playwright/test';
import { DatabasePerformanceMonitor } from '../../utils/performance-monitor.js';
import { executeQuery } from '../../utils/database.js';

test.describe('Database Performance Tests', () => {
  let performanceMonitor;
  
  test.beforeEach(() => {
    performanceMonitor = new DatabasePerformanceMonitor();
  });
  
  test('Product search should perform within acceptable limits', async ({ page }) => {
    await page.goto('/products');
    
    // Measure database query performance
    const searchTerm = 'jacket';
    
    const startTime = performance.now();
    await page.fill('#search-input', searchTerm);
    await page.click('#search-button');
    await page.waitForSelector('.product-results');
    const endTime = performance.now();
    
    const uiResponseTime = endTime - startTime;
    
    // Verify the underlying database query performance
    const dbResults = await performanceMonitor.measureQuery(
      () => executeQuery(`
        SELECT * FROM products 
        WHERE name LIKE '%${searchTerm}%' 
           OR description LIKE '%${searchTerm}%'
        LIMIT 20
      `),
      `Product search for: ${searchTerm}`
    );
    
    // Performance assertions
    expect(uiResponseTime).toBeLessThan(3000); // UI response < 3 seconds
    
    const report = performanceMonitor.getPerformanceReport();
    expect(report.averageTime).toBeLessThan(500); // DB queries < 500ms average
    expect(report.slowQueries).toBe(0); // No slow queries
    
    // Verify results are reasonable
    expect(dbResults.length).toBeGreaterThan(0);
    expect(dbResults.length).toBeLessThanOrEqual(20);
  });
  
  test('Concurrent user simulation', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    // Create 5 concurrent browser contexts
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }
    
    try {
      // Simulate concurrent operations
      const operations = pages.map(async (page, index) => {
        await page.goto('/products');
        
        // Each user performs different actions
        const actions = [
          () => page.click('.category-electronics'),
          () => page.fill('#search-input', 'laptop'),
          () => page.click('.sort-by-price'),
          () => page.click('.filter-in-stock'),
          () => page.click('.product-item:first-child')
        ];
        
        await actions[index % actions.length]();
        await page.waitForLoadState('networkidle');
        
        return index;
      });
      
      const startTime = performance.now();
      await Promise.all(operations);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(10000); // All operations complete within 10 seconds
      
    } finally {
      // Cleanup
      for (const context of contexts) {
        await context.close();
      }
    }
  });
});
```

## Module 5.3: Data Migration and Schema Testing

### Testing Database Migrations

Database schema changes are critical and must be thoroughly tested to ensure:

1. **Migration Scripts Execute Successfully**
2. **Data Integrity is Maintained**
3. **Rollback Procedures Work**
4. **Performance Impact is Acceptable**

#### Migration Testing Framework

```javascript
// utils/migration-tester.js
import { executeQuery, getConnection } from './database.js';

export class MigrationTester {
  constructor() {
    this.backupData = new Map();
  }
  
  async backupTableData(tableName) {
    const data = await executeQuery(`SELECT * FROM ${tableName}`);
    this.backupData.set(tableName, data);
    console.log(`Backed up ${data.length} rows from ${tableName}`);
  }
  
  async restoreTableData(tableName) {
    const data = this.backupData.get(tableName);
    if (!data) {
      throw new Error(`No backup data found for table: ${tableName}`);
    }
    
    // Clear current data
    await executeQuery(`DELETE FROM ${tableName}`);
    
    // Restore backup data
    for (const row of data) {
      const columns = Object.keys(row).join(', ');
      const values = Object.values(row).map(v => `'${v}'`).join(', ');
      await executeQuery(`INSERT INTO ${tableName} (${columns}) VALUES (${values})`);
    }
    
    console.log(`Restored ${data.length} rows to ${tableName}`);
  }
  
  async validateMigration(migrationScript, validationQueries) {
    const connection = await getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();
      
      // Execute migration
      console.log('Executing migration script...');
      await connection.query(migrationScript);
      
      // Run validation queries
      const results = {};
      for (const [name, query] of Object.entries(validationQueries)) {
        console.log(`Running validation: ${name}`);
        const [rows] = await connection.query(query);
        results[name] = rows;
      }
      
      // Rollback transaction (we're just testing)
      await connection.rollback();
      
      return results;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
```

#### Migration Test Examples

```javascript
// tests/database/migration.spec.js
import { test, expect } from '@playwright/test';
import { MigrationTester } from '../../utils/migration-tester.js';

test.describe('Database Migration Tests', () => {
  let migrationTester;
  
  test.beforeEach(() => {
    migrationTester = new MigrationTester();
  });
  
  test('Add customer_notes column to orders table', async () => {
    // Backup current data
    await migrationTester.backupTableData('orders');
    
    const migrationScript = `
      ALTER TABLE orders 
      ADD COLUMN customer_notes TEXT DEFAULT NULL;
    `;
    
    const validationQueries = {
      'column_exists': `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'orders' 
          AND COLUMN_NAME = 'customer_notes'
      `,
      'data_preserved': `
        SELECT COUNT(*) as count 
        FROM orders
      `,
      'default_values': `
        SELECT COUNT(*) as null_notes_count 
        FROM orders 
        WHERE customer_notes IS NULL
      `
    };
    
    const results = await migrationTester.validateMigration(
      migrationScript, 
      validationQueries
    );
    
    // Validate migration results
    expect(results.column_exists.length).toBe(1);
    expect(results.column_exists[0].COLUMN_NAME).toBe('customer_notes');
    
    // Ensure data count is preserved
    const originalCount = migrationTester.backupData.get('orders').length;
    expect(results.data_preserved[0].count).toBe(originalCount);
    
    // All existing records should have NULL customer_notes
    expect(results.default_values[0].null_notes_count).toBe(originalCount);
  });
  
  test('Create audit log table', async () => {
    const migrationScript = `
      CREATE TABLE audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_name VARCHAR(50) NOT NULL,
        operation VARCHAR(20) NOT NULL,
        record_id INT NOT NULL,
        old_values JSON,
        new_values JSON,
        changed_by VARCHAR(100),
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_table_record (table_name, record_id),
        INDEX idx_changed_at (changed_at)
      );
    `;
    
    const validationQueries = {
      'table_created': `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'audit_log'
      `,
      'columns_correct': `
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'audit_log'
        ORDER BY ORDINAL_POSITION
      `,
      'indexes_created': `
        SELECT INDEX_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_NAME = 'audit_log'
          AND INDEX_NAME != 'PRIMARY'
      `
    };
    
    const results = await migrationTester.validateMigration(
      migrationScript, 
      validationQueries
    );
    
    // Validate table creation
    expect(results.table_created.length).toBe(1);
    
    // Validate columns
    expect(results.columns_correct.length).toBe(8); // 8 columns defined
    
    // Check specific column types
    const idColumn = results.columns_correct.find(col => col.COLUMN_NAME === 'id');
    expect(idColumn.DATA_TYPE).toBe('int');
    expect(idColumn.IS_NULLABLE).toBe('NO');
    
    const jsonColumn = results.columns_correct.find(col => col.COLUMN_NAME === 'old_values');
    expect(jsonColumn.DATA_TYPE).toBe('json');
    expect(jsonColumn.IS_NULLABLE).toBe('YES');
    
    // Validate indexes
    expect(results.indexes_created.length).toBeGreaterThan(0);
    const indexNames = results.indexes_created.map(idx => idx.INDEX_NAME);
    expect(indexNames).toContain('idx_table_record');
    expect(indexNames).toContain('idx_changed_at');
  });
});
```

## Module 5.4: Cross-Browser Database Consistency

### Testing Database Behavior Across Browsers

Different browsers may handle certain database-related operations differently, especially when dealing with:

1. **Local Storage and IndexedDB**
2. **Cookie Handling**
3. **Session Management**
4. **AJAX Request Handling**

#### Cross-Browser Database Test Framework

```javascript
// tests/cross-browser/database-consistency.spec.js
import { test, expect, devices } from '@playwright/test';
import { executeQuery } from '../../utils/database.js';

// Test across multiple browsers
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  test.describe(`Database Consistency - ${browserName}`, () => {
    test.use({ 
      ...devices['Desktop Chrome'], // Base configuration
      browserName: browserName 
    });
    
    test('User session persistence across page reloads', async ({ page, context }) => {
      // Login and create session
      await page.goto('/login');
      await page.fill('#username', 'testuser');
      await page.fill('#password', 'testpass');
      await page.click('#login-button');
      
      // Verify initial session
      await expect(page.locator('.user-profile')).toBeVisible();
      
      // Get session data from database
      const initialSession = await executeQuery(`
        SELECT session_id, user_id, expires_at 
        FROM user_sessions 
        WHERE user_id = (SELECT id FROM users WHERE username = 'testuser')
      `);
      
      expect(initialSession.length).toBe(1);
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Session should persist
      await expect(page.locator('.user-profile')).toBeVisible();
      
      // Verify database session is still valid
      const persistedSession = await executeQuery(`
        SELECT session_id, user_id, expires_at 
        FROM user_sessions 
        WHERE session_id = '${initialSession[0].session_id}'
      `);
      
      expect(persistedSession.length).toBe(1);
      expect(persistedSession[0].user_id).toBe(initialSession[0].user_id);
    });
    
    test('Shopping cart persistence', async ({ page }) => {
      await page.goto('/products');
      
      // Add items to cart
      await page.click('.product-item:first-child .add-to-cart');
      await page.click('.product-item:nth-child(2) .add-to-cart');
      
      // Verify cart in UI
      await expect(page.locator('.cart-count')).toHaveText('2');
      
      // Get cart data from database
      const cartItems = await executeQuery(`
        SELECT ci.product_id, ci.quantity, p.name 
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = (
          SELECT session_id FROM user_sessions 
          WHERE user_id IS NULL 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      `);
      
      expect(cartItems.length).toBe(2);
      
      // Navigate away and back
      await page.goto('/about');
      await page.goto('/cart');
      
      // Cart should persist
      await expect(page.locator('.cart-item')).toHaveCount(2);
      
      // Verify database consistency
      const persistedCart = await executeQuery(`
        SELECT COUNT(*) as count 
        FROM cart_items ci
        WHERE ci.session_id = (
          SELECT session_id FROM user_sessions 
          WHERE user_id IS NULL 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      `);
      
      expect(persistedCart[0].count).toBe(2);
    });
  });
});
```

## Module 5.5: API and Database Integration Testing

### Testing API Endpoints with Database Validation

When testing APIs, we need to verify both the HTTP response and the actual database changes.

#### API Integration Test Framework

```javascript
// tests/api-integration/orders-api.spec.js
import { test, expect } from '@playwright/test';
import { executeQuery } from '../../utils/database.js';

test.describe('Orders API Integration', () => {
  let testUserId;
  let testProductId;
  
  test.beforeEach(async () => {
    // Set up test data
    const userResult = await executeQuery(`
      INSERT INTO users (username, email, password) 
      VALUES ('apitest', 'apitest@example.com', 'hashedpassword')
    `);
    testUserId = userResult.insertId;
    
    const productResult = await executeQuery(`
      INSERT INTO products (name, price, stock_quantity) 
      VALUES ('Test Product', 29.99, 100)
    `);
    testProductId = productResult.insertId;
  });
  
  test.afterEach(async () => {
    // Cleanup test data
    await executeQuery(`DELETE FROM order_items WHERE order_id IN 
      (SELECT id FROM orders WHERE user_id = ${testUserId})`);
    await executeQuery(`DELETE FROM orders WHERE user_id = ${testUserId}`);
    await executeQuery(`DELETE FROM products WHERE id = ${testProductId}`);
    await executeQuery(`DELETE FROM users WHERE id = ${testUserId}`);
  });
  
  test('Create order via API', async ({ request }) => {
    const orderData = {
      user_id: testUserId,
      items: [
        { product_id: testProductId, quantity: 2, price: 29.99 }
      ],
      shipping_address: '123 Test St, Test City, TC 12345',
      total_amount: 59.98
    };
    
    // Make API request
    const response = await request.post('/api/orders', {
      data: orderData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    expect(response.status()).toBe(201);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.order_id).toBeGreaterThan(0);
    
    const orderId = responseData.order_id;
    
    // Verify database changes
    const order = await executeQuery(`
      SELECT * FROM orders WHERE id = ${orderId}
    `);
    
    expect(order.length).toBe(1);
    expect(order[0].user_id).toBe(testUserId);
    expect(order[0].total_amount).toBe('59.98');
    expect(order[0].status).toBe('pending');
    
    // Verify order items
    const orderItems = await executeQuery(`
      SELECT * FROM order_items WHERE order_id = ${orderId}
    `);
    
    expect(orderItems.length).toBe(1);
    expect(orderItems[0].product_id).toBe(testProductId);
    expect(orderItems[0].quantity).toBe(2);
    expect(orderItems[0].price).toBe('29.99');
    
    // Verify stock reduction
    const product = await executeQuery(`
      SELECT stock_quantity FROM products WHERE id = ${testProductId}
    `);
    
    expect(product[0].stock_quantity).toBe(98); // 100 - 2
  });
  
  test('Update order status via API', async ({ request }) => {
    // Create initial order
    const orderResult = await executeQuery(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address) 
      VALUES (${testUserId}, 59.98, 'pending', '123 Test St')
    `);
    const orderId = orderResult.insertId;
    
    // Update order status
    const response = await request.put(`/api/orders/${orderId}/status`, {
      data: { status: 'shipped', tracking_number: 'TRK123456' },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      }
    });
    
    expect(response.status()).toBe(200);
    
    // Verify database update
    const updatedOrder = await executeQuery(`
      SELECT status, tracking_number, updated_at 
      FROM orders 
      WHERE id = ${orderId}
    `);
    
    expect(updatedOrder[0].status).toBe('shipped');
    expect(updatedOrder[0].tracking_number).toBe('TRK123456');
    expect(new Date(updatedOrder[0].updated_at)).toBeInstanceOf(Date);
    
    // Verify audit log (if implemented)
    const auditLog = await executeQuery(`
      SELECT * FROM audit_log 
      WHERE table_name = 'orders' 
        AND record_id = ${orderId} 
        AND operation = 'UPDATE'
    `);
    
    if (auditLog.length > 0) {
      expect(auditLog[0].new_values).toContain('shipped');
    }
  });
});
```

## Module 5.6: Real-time Data Testing

### Testing Real-time Updates and WebSocket Communications

Modern applications often use real-time features like WebSockets, Server-Sent Events, or polling for live updates.

#### Real-time Testing Framework

```javascript
// tests/realtime/live-updates.spec.js
import { test, expect } from '@playwright/test';
import { executeQuery } from '../../utils/database.js';

test.describe('Real-time Data Updates', () => {
  test('Product stock updates in real-time', async ({ browser }) => {
    // Create two browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    try {
      // Both users navigate to the same product
      await page1.goto('/products/1');
      await page2.goto('/products/1');
      
      // Wait for initial stock display
      await expect(page1.locator('.stock-count')).toBeVisible();
      await expect(page2.locator('.stock-count')).toBeVisible();
      
      const initialStock1 = await page1.locator('.stock-count').textContent();
      const initialStock2 = await page2.locator('.stock-count').textContent();
      
      expect(initialStock1).toBe(initialStock2);
      
      // User 1 adds item to cart (reducing stock)
      await page1.click('.add-to-cart');
      await page1.waitForSelector('.cart-confirmation');
      
      // Wait for real-time update on page 2
      await page2.waitForFunction(
        (oldStock) => {
          const currentStock = document.querySelector('.stock-count').textContent;
          return currentStock !== oldStock;
        },
        initialStock2,
        { timeout: 5000 }
      );
      
      // Verify stock decreased by 1 on both pages
      const newStock1 = await page1.locator('.stock-count').textContent();
      const newStock2 = await page2.locator('.stock-count').textContent();
      
      expect(parseInt(newStock1)).toBe(parseInt(initialStock1) - 1);
      expect(newStock1).toBe(newStock2);
      
      // Verify database reflects the change
      const dbStock = await executeQuery(`
        SELECT stock_quantity FROM products WHERE id = 1
      `);
      
      expect(dbStock[0].stock_quantity).toBe(parseInt(newStock1));
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
  
  test('Live order status updates', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const adminContext = await browser.newContext();
    
    const customerPage = await customerContext.newPage();
    const adminPage = await adminContext.newPage();
    
    try {
      // Customer creates an order
      await customerPage.goto('/checkout');
      await customerPage.fill('#shipping-address', '123 Test St');
      await customerPage.click('#place-order');
      
      // Get order ID from confirmation page
      await customerPage.waitForSelector('.order-confirmation');
      const orderIdText = await customerPage.locator('.order-id').textContent();
      const orderId = orderIdText.match(/\d+/)[0];
      
      // Customer goes to order tracking page
      await customerPage.goto(`/orders/${orderId}`);
      await expect(customerPage.locator('.order-status')).toHaveText('pending');
      
      // Admin updates order status
      await adminPage.goto('/admin/orders');
      await adminPage.click(`[data-order-id="${orderId}"] .update-status`);
      await adminPage.selectOption('.status-select', 'processing');
      await adminPage.click('.save-status');
      
      // Customer should see real-time update
      await customerPage.waitForFunction(
        () => document.querySelector('.order-status').textContent === 'processing',
        undefined,
        { timeout: 5000 }
      );
      
      await expect(customerPage.locator('.order-status')).toHaveText('processing');
      
      // Verify database update
      const orderStatus = await executeQuery(`
        SELECT status FROM orders WHERE id = ${orderId}
      `);
      
      expect(orderStatus[0].status).toBe('processing');
      
    } finally {
      await customerContext.close();
      await adminContext.close();
    }
  });
});
```

## Module 5.7: Advanced Test Data Management

### Complex Test Data Scenarios

As applications grow more complex, test data management becomes crucial for maintaining reliable tests.

#### Advanced Test Data Factory

```javascript
// utils/test-data-factory.js
import { executeQuery } from './database.js';

export class TestDataFactory {
  constructor() {
    this.createdRecords = new Map();
  }
  
  async createUser(overrides = {}) {
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'hashedpassword',
      created_at: new Date(),
      ...overrides
    };
    
    const result = await executeQuery(`
      INSERT INTO users (username, email, password, created_at) 
      VALUES (?, ?, ?, ?)
    `, [userData.username, userData.email, userData.password, userData.created_at]);
    
    const userId = result.insertId;
    this.trackRecord('users', userId);
    
    return { id: userId, ...userData };
  }
  
  async createProduct(overrides = {}) {
    const productData = {
      name: `Test Product ${Date.now()}`,
      description: 'A test product',
      price: 29.99,
      stock_quantity: 100,
      category_id: 1,
      ...overrides
    };
    
    const result = await executeQuery(`
      INSERT INTO products (name, description, price, stock_quantity, category_id) 
      VALUES (?, ?, ?, ?, ?)
    `, [productData.name, productData.description, productData.price, 
        productData.stock_quantity, productData.category_id]);
    
    const productId = result.insertId;
    this.trackRecord('products', productId);
    
    return { id: productId, ...productData };
  }
  
  async createOrder(user, items = [], overrides = {}) {
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
      user_id: user.id,
      total_amount: totalAmount,
      status: 'pending',
      shipping_address: '123 Test Street, Test City, TC 12345',
      created_at: new Date(),
      ...overrides
    };
    
    const result = await executeQuery(`
      INSERT INTO orders (user_id, total_amount, status, shipping_address, created_at) 
      VALUES (?, ?, ?, ?, ?)
    `, [orderData.user_id, orderData.total_amount, orderData.status, 
        orderData.shipping_address, orderData.created_at]);
    
    const orderId = result.insertId;
    this.trackRecord('orders', orderId);
    
    // Create order items
    for (const item of items) {
      await executeQuery(`
        INSERT INTO order_items (order_id, product_id, quantity, price) 
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.price]);
      
      this.trackRecord('order_items', `order_${orderId}_product_${item.product_id}`);
    }
    
    return { id: orderId, ...orderData, items };
  }
  
  async createCompleteEcommerceScenario() {
    // Create users
    const customer = await this.createUser({ 
      username: 'customer1', 
      email: 'customer1@test.com' 
    });
    const admin = await this.createUser({ 
      username: 'admin1', 
      email: 'admin1@test.com',
      role: 'admin'
    });
    
    // Create products
    const products = await Promise.all([
      this.createProduct({ name: 'Laptop', price: 999.99, stock_quantity: 50 }),
      this.createProduct({ name: 'Mouse', price: 29.99, stock_quantity: 200 }),
      this.createProduct({ name: 'Keyboard', price: 79.99, stock_quantity: 150 })
    ]);
    
    // Create orders with different statuses
    const orders = await Promise.all([
      this.createOrder(customer, [
        { product_id: products[0].id, quantity: 1, price: products[0].price }
      ], { status: 'pending' }),
      
      this.createOrder(customer, [
        { product_id: products[1].id, quantity: 2, price: products[1].price },
        { product_id: products[2].id, quantity: 1, price: products[2].price }
      ], { status: 'shipped' })
    ]);
    
    return {
      users: { customer, admin },
      products,
      orders
    };
  }
  
  trackRecord(table, id) {
    if (!this.createdRecords.has(table)) {
      this.createdRecords.set(table, []);
    }
    this.createdRecords.get(table).push(id);
  }
  
  async cleanup() {
    // Clean up in reverse dependency order
    const cleanupOrder = ['order_items', 'orders', 'cart_items', 'products', 'users'];
    
    for (const table of cleanupOrder) {
      const ids = this.createdRecords.get(table);
      if (ids && ids.length > 0) {
        try {
          if (table === 'order_items') {
            // Special handling for composite keys
            for (const id of ids) {
              if (id.startsWith('order_')) {
                const [, orderId, , productId] = id.split('_');
                await executeQuery(`
                  DELETE FROM order_items 
                  WHERE order_id = ? AND product_id = ?
                `, [orderId, productId]);
              }
            }
          } else {
            const idList = ids.join(',');
            await executeQuery(`DELETE FROM ${table} WHERE id IN (${idList})`);
          }
          console.log(`Cleaned up ${ids.length} records from ${table}`);
        } catch (error) {
          console.warn(`Failed to cleanup ${table}:`, error.message);
        }
      }
    }
    
    this.createdRecords.clear();
  }
}
```

## Summary

Module 5 covered advanced testing scenarios that professional test automation engineers encounter in real-world applications:

### Key Topics Covered:
1. **Security Testing** - SQL injection prevention and validation
2. **Performance Testing** - Database query monitoring and optimization
3. **Migration Testing** - Schema changes and data integrity
4. **Cross-Browser Consistency** - Ensuring database behavior works across browsers
5. **API Integration** - Testing endpoints with database validation
6. **Real-time Testing** - WebSocket and live update validation
7. **Advanced Data Management** - Complex test data factories and cleanup

### Skills Developed:
- Security validation techniques
- Performance monitoring and optimization
- Database migration testing strategies
- Cross-browser compatibility testing
- API integration testing with database verification
- Real-time application testing
- Advanced test data management and cleanup

### Next Steps:
Module 6 will focus on the capstone project where students will apply all learned concepts to build a comprehensive testing suite for a real-world application scenario.