import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 4: UPDATE & DELETE OPERATIONS (SQL Equivalent to API Advanced Operations)
 * Learning Objectives:
 * - Execute UPDATE statements safely
 * - Perform DELETE operations with proper constraints
 * - Handle conditional updates and deletes
 * - Work with JOINs in UPDATE/DELETE
 * - Practice transaction safety
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

test.describe('Level 4: UPDATE & DELETE Operations', () => {
    
    test('should update user information', async () => {
        // First create a test user
        const uniqueId = Date.now();
        const [insertResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash, first_name, last_name) 
            VALUES (?, ?, ?, ?, ?)
        `, [`updatetest_${uniqueId}`, `update_${uniqueId}@example.com`, 'hashed_password', 'Original', 'Name']);
        
        const userId = insertResult.insertId;
        
        // Update the user information
        const [updateResult] = await connection.execute(`
            UPDATE users 
            SET first_name = ?, last_name = ?, phone = ? 
            WHERE id = ?
        `, ['Updated', 'NewName', '+1987654321', userId]);
        
        expect(updateResult.affectedRows).toBe(1);
        expect(updateResult.changedRows).toBe(1);
        
        // Verify the update
        const [updatedUsers] = await connection.execute(
            'SELECT id, first_name, last_name, phone, updated_at FROM users WHERE id = ?',
            [userId]
        );
        
        expect(updatedUsers.length).toBe(1);
        
        const updatedUser = updatedUsers[0];
        expect(updatedUser.first_name).toBe('Updated');
        expect(updatedUser.last_name).toBe('NewName');
        expect(updatedUser.phone).toBe('+1987654321');
        expect(updatedUser.updated_at).toBeTruthy();
    });

    test('should update product stock quantities', async () => {
        // Create test product
        const uniqueId = Date.now();
        const [insertResult] = await connection.execute(`
            INSERT INTO products (sku, name, price, stock_quantity, reorder_level) 
            VALUES (?, ?, ?, ?, ?)
        `, [`UPDATE-SKU-${uniqueId}`, `Update Product ${uniqueId}`, '50.00', 100, 10]);
        
        const productId = insertResult.insertId;
        
        // Simulate stock reduction (e.g., after a sale)
        const [updateResult] = await connection.execute(`
            UPDATE products 
            SET stock_quantity = stock_quantity - ? 
            WHERE id = ?
        `, [25, productId]);
        
        expect(updateResult.affectedRows).toBe(1);
        
        // Verify stock was reduced
        const [products] = await connection.execute(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [productId]
        );
        
        expect(products[0].stock_quantity).toBe(75);
        
        // Update with conditional check (only if stock is sufficient)
        const [conditionalUpdate] = await connection.execute(`
            UPDATE products 
            SET stock_quantity = stock_quantity - ? 
            WHERE id = ? AND stock_quantity >= ?
        `, [30, productId, 30]);
        
        expect(conditionalUpdate.affectedRows).toBe(1);
        
        // Verify conditional update worked
        const [afterConditional] = await connection.execute(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [productId]
        );
        
        expect(afterConditional[0].stock_quantity).toBe(45);
        
        // Try conditional update that should fail
        const [failedUpdate] = await connection.execute(`
            UPDATE products 
            SET stock_quantity = stock_quantity - ? 
            WHERE id = ? AND stock_quantity >= ?
        `, [100, productId, 100]); // Trying to reduce by 100 when only 45 available
        
        expect(failedUpdate.affectedRows).toBe(0); // No rows affected
    });

    test('should update order status progression', async () => {
        // Create test user and order
        const uniqueId = Date.now();
        
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`orderuser_${uniqueId}`, `order_${uniqueId}@example.com`, 'hashed_password']);
        
        const userId = userResult.insertId;
        
        const [orderResult] = await connection.execute(`
            INSERT INTO orders (order_number, user_id, status, total_amount) 
            VALUES (?, ?, ?, ?)
        `, [`ORD-${uniqueId}`, userId, 'pending', '150.00']);
        
        const orderId = orderResult.insertId;
        
        // Progress order through different statuses
        const statuses = ['processing', 'shipped', 'delivered'];
        
        for (const status of statuses) {
            const [updateResult] = await connection.execute(`
                UPDATE orders 
                SET status = ? 
                WHERE id = ?
            `, [status, orderId]);
            
            expect(updateResult.affectedRows).toBe(1);
            
            // Verify status update
            const [orders] = await connection.execute(
                'SELECT status FROM orders WHERE id = ?',
                [orderId]
            );
            
            expect(orders[0].status).toBe(status);
        }
        
        // Update with timestamp for shipped status
        await connection.execute(`
            UPDATE orders 
            SET status = ?, shipped_at = NOW() 
            WHERE id = ?
        `, ['shipped', orderId]);
        
        const [shippedOrder] = await connection.execute(
            'SELECT status, shipped_at FROM orders WHERE id = ?',
            [orderId]
        );
        
        expect(shippedOrder[0].status).toBe('shipped');
        expect(shippedOrder[0].shipped_at).toBeTruthy();
    });

    test('should update cart item quantities', async () => {
        // Create test data
        const uniqueId = Date.now();
        
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`cartuser_${uniqueId}`, `cart_${uniqueId}@example.com`, 'hashed_password']);
        
        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price) 
            VALUES (?, ?, ?)
        `, [`CART-UPDATE-${uniqueId}`, `Cart Update Product ${uniqueId}`, '25.00']);
        
        const userId = userResult.insertId;
        const productId = productResult.insertId;
        
        // Add item to cart
        await connection.execute(`
            INSERT INTO cart_items (user_id, product_id, quantity) 
            VALUES (?, ?, ?)
        `, [userId, productId, 2]);
        
        // Update cart item quantity
        const [updateResult] = await connection.execute(`
            UPDATE cart_items 
            SET quantity = ? 
            WHERE user_id = ? AND product_id = ?
        `, [5, userId, productId]);
        
        expect(updateResult.affectedRows).toBe(1);
        
        // Verify update
        const [cartItems] = await connection.execute(
            'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        expect(cartItems[0].quantity).toBe(5);
        
        // Increase quantity (simulating adding more of same item)
        await connection.execute(`
            UPDATE cart_items 
            SET quantity = quantity + ? 
            WHERE user_id = ? AND product_id = ?
        `, [3, userId, productId]);
        
        const [updatedCart] = await connection.execute(
            'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        expect(updatedCart[0].quantity).toBe(8);
    });

    test('should delete records with proper constraints', async () => {
        // Create test user
        const uniqueId = Date.now();
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`deletetest_${uniqueId}`, `delete_${uniqueId}@example.com`, 'hashed_password']);
        
        const userId = userResult.insertId;
        
        // Verify user was created
        const [beforeDelete] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE id = ?',
            [userId]
        );
        expect(beforeDelete[0].count).toBe(1);
        
        // Delete the user
        const [deleteResult] = await connection.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
        
        expect(deleteResult.affectedRows).toBe(1);
        
        // Verify user was deleted
        const [afterDelete] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE id = ?',
            [userId]
        );
        expect(afterDelete[0].count).toBe(0);
    });

    test('should delete cart items', async () => {
        // Create test data
        const uniqueId = Date.now();
        
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`cartdeluser_${uniqueId}`, `cartdel_${uniqueId}@example.com`, 'hashed_password']);
        
        const [product1Result] = await connection.execute(`
            INSERT INTO products (sku, name, price) 
            VALUES (?, ?, ?)
        `, [`DEL-CART-1-${uniqueId}`, `Delete Cart Product 1`, '20.00']);
        
        const [product2Result] = await connection.execute(`
            INSERT INTO products (sku, name, price) 
            VALUES (?, ?, ?)
        `, [`DEL-CART-2-${uniqueId}`, `Delete Cart Product 2`, '30.00']);
        
        const userId = userResult.insertId;
        const product1Id = product1Result.insertId;
        const product2Id = product2Result.insertId;
        
        // Add multiple items to cart
        await connection.execute(`
            INSERT INTO cart_items (user_id, product_id, quantity) 
            VALUES (?, ?, ?), (?, ?, ?)
        `, [userId, product1Id, 2, userId, product2Id, 1]);
        
        // Verify items were added
        const [beforeDelete] = await connection.execute(
            'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
            [userId]
        );
        expect(beforeDelete[0].count).toBe(2);
        
        // Delete specific item from cart
        const [deleteResult] = await connection.execute(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [userId, product1Id]
        );
        
        expect(deleteResult.affectedRows).toBe(1);
        
        // Verify only one item deleted
        const [afterSingleDelete] = await connection.execute(
            'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
            [userId]
        );
        expect(afterSingleDelete[0].count).toBe(1);
        
        // Clear entire cart
        const [clearCartResult] = await connection.execute(
            'DELETE FROM cart_items WHERE user_id = ?',
            [userId]
        );
        
        expect(clearCartResult.affectedRows).toBe(1);
        
        // Verify cart is empty
        const [afterClearCart] = await connection.execute(
            'SELECT COUNT(*) as count FROM cart_items WHERE user_id = ?',
            [userId]
        );
        expect(afterClearCart[0].count).toBe(0);
    });

    test('should handle bulk operations', async () => {
        // Create multiple test products
        const uniqueId = Date.now();
        const productIds = [];
        
        for (let i = 0; i < 5; i++) {
            const [productResult] = await connection.execute(`
                INSERT INTO products (sku, name, price, stock_quantity) 
                VALUES (?, ?, ?, ?)
            `, [`BULK-${uniqueId}-${i}`, `Bulk Product ${i}`, '10.00', 50]);
            
            productIds.push(productResult.insertId);
        }
        
        // Bulk update - increase all prices by 10%
        const [bulkUpdateResult] = await connection.execute(`
            UPDATE products 
            SET price = price * 1.1 
            WHERE sku LIKE ?
        `, [`BULK-${uniqueId}-%`]);
        
        expect(bulkUpdateResult.affectedRows).toBe(5);
        
        // Verify all products were updated
        const [updatedProducts] = await connection.execute(`
            SELECT price FROM products 
            WHERE sku LIKE ?
        `, [`BULK-${uniqueId}-%`]);
        
        updatedProducts.forEach(product => {
            expect(parseFloat(product.price)).toBeCloseTo(11.00, 2);
        });
        
        // Bulk update with condition - reduce stock for low-priced items
        const [conditionalBulkUpdate] = await connection.execute(`
            UPDATE products 
            SET stock_quantity = stock_quantity - 10 
            WHERE price < ? AND stock_quantity >= 10
        `, ['15.00']);
        
        expect(conditionalBulkUpdate.affectedRows).toBeGreaterThanOrEqual(0);
        
        // Bulk delete test products
        const [bulkDeleteResult] = await connection.execute(`
            DELETE FROM products 
            WHERE sku LIKE ?
        `, [`BULK-${uniqueId}-%`]);
        
        expect(bulkDeleteResult.affectedRows).toBe(5);
    });

    test('should update with JOINs', async () => {
        // Create test data
        const uniqueId = Date.now();
        
        const [categoryResult] = await connection.execute(`
            INSERT INTO categories (name, description) 
            VALUES (?, ?)
        `, [`Join Category ${uniqueId}`, 'Category for JOIN update test']);
        
        const categoryId = categoryResult.insertId;
        
        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price, category_id) 
            VALUES (?, ?, ?, ?)
        `, [`JOIN-PROD-${uniqueId}`, `Join Product ${uniqueId}`, '100.00', categoryId]);
        
        const productId = productResult.insertId;
        
        // Update product based on category information (simulating category-based pricing)
        const [joinUpdateResult] = await connection.execute(`
            UPDATE products p 
            JOIN categories c ON p.category_id = c.id 
            SET p.price = p.price * 0.9 
            WHERE c.name LIKE ? AND p.id = ?
        `, [`%Join Category%`, productId]);
        
        expect(joinUpdateResult.affectedRows).toBe(1);
        
        // Verify update
        const [updatedProduct] = await connection.execute(
            'SELECT price FROM products WHERE id = ?',
            [productId]
        );
        
        expect(parseFloat(updatedProduct[0].price)).toBeCloseTo(90.00, 2);
    });

    test('should handle transaction-like operations', async () => {
        // Create test data for order processing
        const uniqueId = Date.now();
        
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`transuser_${uniqueId}`, `trans_${uniqueId}@example.com`, 'hashed_password']);
        
        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price, stock_quantity) 
            VALUES (?, ?, ?, ?)
        `, [`TRANS-PROD-${uniqueId}`, `Transaction Product ${uniqueId}`, '50.00', 100]);
        
        const [orderResult] = await connection.execute(`
            INSERT INTO orders (order_number, user_id, status, total_amount) 
            VALUES (?, ?, ?, ?)
        `, [`ORD-TRANS-${uniqueId}`, userResult.insertId, 'pending', '100.00']);
        
        const [orderItemResult] = await connection.execute(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
            VALUES (?, ?, ?, ?, ?)
        `, [orderResult.insertId, productResult.insertId, 2, '50.00', '100.00']);
        
        const productId = productResult.insertId;
        const orderId = orderResult.insertId;
        
        // Simulate order processing - reduce stock and update order status
        
        // Step 1: Reduce product stock
        const [stockUpdate] = await connection.execute(`
            UPDATE products 
            SET stock_quantity = stock_quantity - 2 
            WHERE id = ? AND stock_quantity >= 2
        `, [productId]);
        
        expect(stockUpdate.affectedRows).toBe(1);
        
        // Step 2: Update order status
        if (stockUpdate.affectedRows > 0) {
            const [orderUpdate] = await connection.execute(`
                UPDATE orders 
                SET status = ? 
                WHERE id = ?
            `, ['processing', orderId]);
            
            expect(orderUpdate.affectedRows).toBe(1);
        }
        
        // Verify both updates
        const [finalProduct] = await connection.execute(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [productId]
        );
        expect(finalProduct[0].stock_quantity).toBe(98);
        
        const [finalOrder] = await connection.execute(
            'SELECT status FROM orders WHERE id = ?',
            [orderId]
        );
        expect(finalOrder[0].status).toBe('processing');
    });

    test('should handle delete with foreign key considerations', async () => {
        // Create test data with relationships
        const uniqueId = Date.now();
        
        const [categoryResult] = await connection.execute(`
            INSERT INTO categories (name, description) 
            VALUES (?, ?)
        `, [`Delete Category ${uniqueId}`, 'Category to be deleted']);
        
        const categoryId = categoryResult.insertId;
        
        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price, category_id) 
            VALUES (?, ?, ?, ?)
        `, [`DEL-FK-${uniqueId}`, `Delete FK Product ${uniqueId}`, '75.00', categoryId]);
        
        const productId = productResult.insertId;
        
        // Try to delete category with associated products
        // This should handle the foreign key constraint appropriately
        
        // First, update products to remove category reference
        const [updateProducts] = await connection.execute(`
            UPDATE products 
            SET category_id = NULL 
            WHERE category_id = ?
        `, [categoryId]);
        
        expect(updateProducts.affectedRows).toBe(1);
        
        // Now delete the category
        const [deleteCategory] = await connection.execute(`
            DELETE FROM categories 
            WHERE id = ?
        `, [categoryId]);
        
        expect(deleteCategory.affectedRows).toBe(1);
        
        // Verify product still exists but without category
        const [remainingProduct] = await connection.execute(
            'SELECT id, category_id FROM products WHERE id = ?',
            [productId]
        );
        
        expect(remainingProduct.length).toBe(1);
        expect(remainingProduct[0].category_id).toBeNull();
        
        // Clean up
        await connection.execute('DELETE FROM products WHERE id = ?', [productId]);
    });
});