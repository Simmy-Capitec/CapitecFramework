
import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 3a: ADVANCED INSERT OPERATIONS
 * Learning Objectives:
 * - Use INSERT IGNORE to skip duplicate records without errors
 * - Use ON DUPLICATE KEY UPDATE to modify existing records
 * - Insert multiple rows in a single statement
 * - Insert data using a subquery
 * - Handle NULLable foreign keys and special data types
 */

const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training'
};

let connection;

test.beforeAll(async () => {
    // It's often better to use a single connection for a test file
    // for efficiency, but we will reconnect for each test to ensure isolation.
});

test.beforeEach(async () => {
    connection = await mysql.createConnection(dbConfig);
});

test.afterEach(async () => {
    if (connection) {
        await connection.end();
    }
});

test.describe('Level 3a: Advanced INSERT Operations', () => {

    test('should use INSERT IGNORE to prevent errors on duplicate SKUs', async () => {
        const uniqueId = Date.now();
        const product = {
            sku: `SKU-IGNORE-${uniqueId}`,
            name: `Test Product ${uniqueId}`,
            price: '10.00'
        };

        // First insert should be successful
        const [firstResult] = await connection.execute(
            'INSERT INTO products (sku, name, price) VALUES (?, ?, ?)',
            [product.sku, product.name, product.price]
        );
        expect(firstResult.affectedRows).toBe(1);
        const productId = firstResult.insertId;

        // Second insert of the same SKU using INSERT IGNORE
        const [secondResult] = await connection.execute(
            'INSERT IGNORE INTO products (sku, name, price) VALUES (?, ?, ?)',
            [product.sku, 'Another Name', '20.00']
        );
        
        // affectedRows will be 0 because the row was ignored, not inserted
        expect(secondResult.affectedRows).toBe(0);

        // Verify that the original product was not changed
        const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [productId]);
        expect(rows.length).toBe(1);
        expect(rows[0].name).toBe(product.name);
        expect(rows[0].price).toBe(product.price);
    });

    test('should use ON DUPLICATE KEY UPDATE to update an existing product', async () => {
        const uniqueId = Date.now();
        const sku = `SKU-UPDATE-${uniqueId}`;
        const initialProduct = {
            sku: sku,
            name: `Initial Name ${uniqueId}`,
            price: '100.00',
            stock_quantity: 10
        };
        const updatedProduct = {
            sku: sku,
            name: `Updated Name ${uniqueId}`,
            price: '120.00',
            stock_quantity: 25
        };

        // Insert the initial product
        await connection.execute(
            'INSERT INTO products (sku, name, price, stock_quantity) VALUES (?, ?, ?, ?)',
            [initialProduct.sku, initialProduct.name, initialProduct.price, initialProduct.stock_quantity]
        );

        // Use ON DUPLICATE KEY UPDATE to change the name, price, and stock
        const [updateResult] = await connection.execute(`
            INSERT INTO products (sku, name, price, stock_quantity)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                price = VALUES(price),
                stock_quantity = stock_quantity + VALUES(stock_quantity)
        `, [updatedProduct.sku, updatedProduct.name, updatedProduct.price, 15]); // adding 15 to stock

        // affectedRows is 2 for an update, 1 for an insert
        expect(updateResult.affectedRows).toBe(2);

        // Verify the product was updated correctly
        const [rows] = await connection.execute('SELECT * FROM products WHERE sku = ?', [sku]);
        expect(rows.length).toBe(1);
        expect(rows[0].name).toBe(updatedProduct.name);
        expect(rows[0].price).toBe(updatedProduct.price);
        // Initial stock (10) + added stock (15) = 25
        expect(rows[0].stock_quantity).toBe(updatedProduct.stock_quantity);
    });

    test('should insert multiple rows in a single query', async () => {
        const uniqueId = Date.now();
        const categories = [
            [`Multi-Cat 1-${uniqueId}`, 'First category in multi-insert'],
            [`Multi-Cat 2-${uniqueId}`, 'Second category in multi-insert'],
            [`Multi-Cat 3-${uniqueId}`, 'Third category in multi-insert']
        ];

        const [result] = await connection.query(
            'INSERT INTO categories (name, description) VALUES ?',
            [categories]
        );

        expect(result.affectedRows).toBe(3);
        const startId = result.insertId;

        // Verify that all three categories were created
        const [rows] = await connection.execute(
            'SELECT * FROM categories WHERE id >= ? AND id < ?',
            [startId, startId + 3]
        );
        expect(rows.length).toBe(3);
        expect(rows[0].name).toBe(categories[0][0]);
        expect(rows[1].name).toBe(categories[1][0]);
        expect(rows[2].name).toBe(categories[2][0]);
    });

    test('should insert data using a SELECT subquery', async () => {
        // Create a user and some products
        const uniqueId = Date.now();
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [`subquery_user_${uniqueId}`, `subquery_${uniqueId}@example.com`, 'hash']
        );
        const userId = userResult.insertId;

        const [p1] = await connection.execute('INSERT INTO products (sku, name, price) VALUES (?, ?, ?)', [`p1-${uniqueId}`, 'Product 1', '10.00']);
        const [p2] = await connection.execute('INSERT INTO products (sku, name, price) VALUES (?, ?, ?)', [`p2-${uniqueId}`, 'Product 2', '20.00']);
        const productId1 = p1.insertId;
        const productId2 = p2.insertId;

        // Use a subquery to copy products from the products table to the cart_items table for the user
        const [cartResult] = await connection.execute(`
            INSERT INTO cart_items (user_id, product_id, quantity)
            SELECT ?, id, 2 FROM products WHERE id IN (?, ?)
        `, [userId, productId1, productId2]);

        expect(cartResult.affectedRows).toBe(2);

        // Verify the items are in the cart
        const [cartItems] = await connection.execute('SELECT * FROM cart_items WHERE user_id = ?', [userId]);
        expect(cartItems.length).toBe(2);
        expect(cartItems.map(item => item.product_id).sort()).toEqual([productId1, productId2].sort());
        expect(cartItems[0].quantity).toBe(2);
        expect(cartItems[1].quantity).toBe(2);
    });

    test('should correctly handle NULL for a nullable foreign key', async () => {
        // A product can be created without a category (category_id is NULL)
        const uniqueId = Date.now();
        const productData = {
            sku: `SKU-NULL-FK-${uniqueId}`,
            name: 'Product without Category',
            price: '9.99',
            category_id: null
        };

        const [result] = await connection.execute(
            'INSERT INTO products (sku, name, price, category_id) VALUES (?, ?, ?, ?)',
            [productData.sku, productData.name, productData.price, productData.category_id]
        );

        expect(result.affectedRows).toBe(1);
        const productId = result.insertId;

        // Verify the product was created with a NULL category_id
        const [rows] = await connection.execute('SELECT category_id FROM products WHERE id = ?', [productId]);
        expect(rows.length).toBe(1);
        expect(rows[0].category_id).toBeNull();
    });
});
