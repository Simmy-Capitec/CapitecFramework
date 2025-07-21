import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 6: NEW SQL QUERIES (General Examples)
 * Learning Objectives:
 * - Execute more complex SELECT statements (JOINs, GROUP BY)
 * - Perform INSERT, UPDATE, and DELETE operations
 * - Verify data changes after DML operations
 * - Handle database connections properly
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

test.describe('Level 6: New SQL Queries', () => {

    test('should fetch products with their category names using JOIN', async () => {
        const [rows] = await connection.execute(`
            SELECT p.name AS productName, p.price, c.name AS categoryName
            FROM products p
            JOIN categories c ON p.category_id = c.id
            ORDER BY productName
        `);

        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBeGreaterThan(0);

        const product = rows[0];
        expect(product).toHaveProperty('productName');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('categoryName');
        expect(typeof product.productName).toBe('string');
        expect(typeof product.categoryName).toBe('string');
    });

    test('should count products per category using GROUP BY', async () => {
        const [rows] = await connection.execute(`
            SELECT c.name AS categoryName, COUNT(p.id) AS productCount
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.name
            ORDER BY categoryName
        `);

        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBeGreaterThan(0);

        const category = rows[0];
        expect(category).toHaveProperty('categoryName');
        expect(category).toHaveProperty('productCount');
        expect(typeof category.categoryName).toBe('string');
        expect(typeof category.productCount).toBe('number');
        expect(category.productCount).toBeGreaterThanOrEqual(0);
    });

    test('should insert a new product and then delete it', async () => {
        const newProduct = {
            sku: 'TESTSKU123',
            name: 'Test Product',
            description: 'A product for testing purposes',
            price: '99.99',
            cost: '50.00',
            category_id: 1, // Assuming category with ID 1 exists
            stock_quantity: 10,
            reorder_level: 2,
            is_active: 1
        };

        // Insert the new product
        const [insertResult] = await connection.execute(
            `INSERT INTO products (sku, name, description, price, cost, category_id, stock_quantity, reorder_level, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newProduct.sku, newProduct.name, newProduct.description, newProduct.price, newProduct.cost, newProduct.category_id, newProduct.stock_quantity, newProduct.reorder_level, newProduct.is_active]
        );
        expect(insertResult.affectedRows).toBe(1);
        const insertedProductId = insertResult.insertId;

        // Verify the product was inserted
        const [insertedRows] = await connection.execute(`SELECT * FROM products WHERE id = ?`, [insertedProductId]);
        expect(insertedRows.length).toBe(1);
        expect(insertedRows[0].sku).toBe(newProduct.sku);

        // Clean up: Delete the inserted product
        const [deleteResult] = await connection.execute(`DELETE FROM products WHERE id = ?`, [insertedProductId]);
        expect(deleteResult.affectedRows).toBe(1);

        // Verify the product was deleted
        const [deletedRows] = await connection.execute(`SELECT * FROM products WHERE id = ?`, [insertedProductId]);
        expect(deletedRows.length).toBe(0);
    });

    test('should update an existing user and then revert the change', async () => {
        // Assuming a user with ID 1 exists for this test
        const userIdToUpdate = 1;
        const originalEmail = 'user1@example.com'; // Replace with an actual email from your test data if different
        const newEmail = 'updated_user1@example.com';

        // First, ensure the user's email is in a known state (originalEmail)
        await connection.execute(`UPDATE users SET email = ? WHERE id = ?`, [originalEmail, userIdToUpdate]);

        // Update the user's email
        const [updateResult] = await connection.execute(
            `UPDATE users SET email = ? WHERE id = ?`,
            [newEmail, userIdToUpdate]
        );
        expect(updateResult.affectedRows).toBe(1);

        // Verify the update
        const [updatedRows] = await connection.execute(`SELECT email FROM users WHERE id = ?`, [userIdToUpdate]);
        expect(updatedRows.length).toBe(1);
        expect(updatedRows[0].email).toBe(newEmail);

        // Revert the change
        const [revertResult] = await connection.execute(
            `UPDATE users SET email = ? WHERE id = ?`,
            [originalEmail, userIdToUpdate]
        );
        expect(revertResult.affectedRows).toBe(1);

        // Verify the revert
        const [revertedRows] = await connection.execute(`SELECT email FROM users WHERE id = ?`, [userIdToUpdate]);
        expect(revertedRows.length).toBe(1);
        expect(revertedRows[0].email).toBe(originalEmail);
    });
});
