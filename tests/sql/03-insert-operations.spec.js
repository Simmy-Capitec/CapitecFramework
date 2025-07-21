import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 3: INSERT OPERATIONS (SQL Equivalent to API Create Operations)
 * Learning Objectives:
 * - Execute INSERT statements safely
 * - Handle auto-increment IDs
 * - Validate required vs optional fields
 * - Test constraint violations
 * - Practice parameterized inserts for security
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

test.describe('Level 3: INSERT Operations', () => {

    test('should insert a new user successfully', async () => {
        const uniqueId = Date.now();
        const userData = {
            username: `testuser_${uniqueId}`,
            email: `test_${uniqueId}@example.com`,
            password_hash: 'hashed_password_123',
            first_name: 'Test',
            last_name: 'User',
            phone: '+1234567890'
        };

        // Insert user
        const [result] = await connection.execute(`
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userData.username, userData.email, userData.password_hash, userData.first_name, userData.last_name, userData.phone]);

        // Verify insert was successful
        expect(result.affectedRows).toBe(1);
        expect(result.insertId).toBeGreaterThan(0);

        const newUserId = result.insertId;

        // Verify the user was actually created
        const [createdUsers] = await connection.execute(
            'SELECT id, username, email, first_name, last_name, phone, created_at, is_active FROM users WHERE id = ?',
            [newUserId]
        );

        expect(createdUsers.length).toBe(1);

        const createdUser = createdUsers[0];
        expect(createdUser.id).toBe(newUserId);
        expect(createdUser.username).toBe(userData.username);
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.first_name).toBe(userData.first_name);
        expect(createdUser.last_name).toBe(userData.last_name);
        expect(createdUser.phone).toBe(userData.phone);
        expect(createdUser.is_active).toBe(1); // Default value
        expect(createdUser.created_at).toBeTruthy();
    });

    test('should insert a new category successfully', async () => {
        const uniqueId = Date.now();
        const categoryData = {
            name: `Test Category ${uniqueId}`,
            description: 'A test category for automation testing'
        };

        const [result] = await connection.execute(`
            INSERT INTO categories (name, description) 
            VALUES (?, ?)
        `, [categoryData.name, categoryData.description]);

        expect(result.affectedRows).toBe(1);
        expect(result.insertId).toBeGreaterThan(0);

        const categoryId = result.insertId;

        // Verify the category was created
        const [createdCategories] = await connection.execute(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );

        expect(createdCategories.length).toBe(1);

        const createdCategory = createdCategories[0];
        expect(createdCategory.name).toBe(categoryData.name);
        expect(createdCategory.description).toBe(categoryData.description);
        expect(createdCategory.parent_id).toBeNull();
        expect(createdCategory.created_at).toBeTruthy();
    });

    test('should insert a new product with category relationship', async () => {
        // First create a category for the product
        const [categoryResult] = await connection.execute(`
            INSERT INTO categories (name, description) 
            VALUES (?, ?)
        `, [`Product Category ${Date.now()}`, 'Category for product testing']);

        const categoryId = categoryResult.insertId;

        const uniqueId = Date.now();
        const productData = {
            sku: `TEST-SKU-${uniqueId}`,
            name: `Test Product ${uniqueId}`,
            description: 'A test product for automation testing',
            price: '99.99',
            cost: '50.00',
            category_id: categoryId,
            stock_quantity: 100,
            reorder_level: 10
        };

        const [result] = await connection.execute(`
            INSERT INTO products (sku, name, description, price, cost, category_id, stock_quantity, reorder_level) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [productData.sku, productData.name, productData.description, productData.price, productData.cost, productData.category_id, productData.stock_quantity, productData.reorder_level]);

        expect(result.affectedRows).toBe(1);
        expect(result.insertId).toBeGreaterThan(0);

        const productId = result.insertId;

        // Verify the product was created with category relationship
        const [createdProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [productId]);

        expect(createdProducts.length).toBe(1);

        const createdProduct = createdProducts[0];
        expect(createdProduct.sku).toBe(productData.sku);
        expect(createdProduct.name).toBe(productData.name);
        expect(createdProduct.description).toBe(productData.description);
        expect(createdProduct.price).toBe(productData.price);
        expect(createdProduct.cost).toBe(productData.cost);
        expect(createdProduct.category_id).toBe(categoryId);
        expect(createdProduct.stock_quantity).toBe(productData.stock_quantity);
        expect(createdProduct.reorder_level).toBe(productData.reorder_level);
        expect(createdProduct.is_active).toBe(1); // Default value
        expect(createdProduct.category_name).toContain('Product Category');
    });

    test('should handle constraint violations properly', async () => {
        // Test duplicate username
        const uniqueId = Date.now();
        const userData = {
            username: `duplicate_test_${uniqueId}`,
            email: `unique1_${uniqueId}@example.com`,
            password_hash: 'hashed_password'
        };

        // Insert first user
        const [firstResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [userData.username, userData.email, userData.password_hash]);

        expect(firstResult.affectedRows).toBe(1);

        // Try to insert second user with same username
        try {
            await connection.execute(`
                INSERT INTO users (username, email, password_hash) 
                VALUES (?, ?, ?)
            `, [userData.username, `unique2_${uniqueId}@example.com`, userData.password_hash]);

            // Should not reach this point
            expect(true).toBe(false);
        } catch (error) {
            // Should catch duplicate key error
            expect(error.code).toBe('ER_DUP_ENTRY');
            expect(error.message).toContain('Duplicate entry');
        }

        // Test duplicate email
        try {
            await connection.execute(`
                INSERT INTO users (username, email, password_hash) 
                VALUES (?, ?, ?)
            `, [`unique_user_${uniqueId}`, userData.email, userData.password_hash]);

            expect(true).toBe(false);
        } catch (error) {
            expect(error.code).toBe('ER_DUP_ENTRY');
            expect(error.message).toContain('Duplicate entry');
        }
    });

    test('should handle missing required fields', async () => {
        // Test missing username
        try {
            await connection.execute(`
                INSERT INTO users (email, password_hash) 
                VALUES (?, ?)
            `, ['test@example.com', 'hashed_password']);

            expect(true).toBe(false);
        } catch (error) {
            expect(error.code).toBe('ER_BAD_NULL_ERROR');
        }

        // Test missing product name
        try {
            await connection.execute(`
                INSERT INTO products (sku, price) 
                VALUES (?, ?)
            `, ['TEST-SKU', '50.00']);

            expect(true).toBe(false);
        } catch (error) {
            expect(error.code).toBe('ER_BAD_NULL_ERROR');
        }

        // Test missing category name
        try {
            await connection.execute(`
                INSERT INTO categories (description) 
                VALUES (?)
            `, ['Test description']);

            expect(true).toBe(false);
        } catch (error) {
            expect(error.code).toBe('ER_BAD_NULL_ERROR');
        }
    });

    test('should insert with default values', async () => {
        const uniqueId = Date.now();

        // Insert user with only required fields
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`minimal_user_${uniqueId}`, `minimal_${uniqueId}@example.com`, 'hashed_password']);

        const userId = userResult.insertId;

        // Verify default values were applied
        const [users] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        const user = users[0];
        expect(user.is_active).toBe(1); // Default value
        expect(user.created_at).toBeTruthy();
        expect(user.updated_at).toBeTruthy();
        expect(user.first_name).toBeNull();
        expect(user.last_name).toBeNull();
        expect(user.phone).toBeNull();
        expect(user.last_login).toBeNull();

        // Insert product with minimal fields
        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price) 
            VALUES (?, ?, ?)
        `, [`MIN-SKU-${uniqueId}`, `Minimal Product ${uniqueId}`, '25.00']);

        const productId = productResult.insertId;

        const [products] = await connection.execute(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        const product = products[0];
        expect(product.stock_quantity).toBe(0); // Default value
        expect(product.reorder_level).toBe(10); // Default value
        expect(product.is_active).toBe(1); // Default value
        expect(product.created_at).toBeTruthy();
        expect(product.updated_at).toBeTruthy();
        expect(product.description).toBeNull();
        expect(product.cost).toBeNull();
        expect(product.category_id).toBeNull();
    });

    test('should insert hierarchical categories', async () => {
        // Create parent category
        const [parentResult] = await connection.execute(`
            INSERT INTO categories (name, description) 
            VALUES (?, ?)
        `, ['Electronics', 'Electronic products and accessories']);

        const parentId = parentResult.insertId;

        // Create child category
        const [childResult] = await connection.execute(`
            INSERT INTO categories (name, description, parent_id) 
            VALUES (?, ?, ?)
        `, ['Laptops', 'Laptop computers and accessories', parentId]);

        const childId = childResult.insertId;

        // Verify hierarchy
        const [categories] = await connection.execute(`
            SELECT c.id, c.name, c.parent_id, p.name as parent_name 
            FROM categories c 
            LEFT JOIN categories p ON c.parent_id = p.id 
            WHERE c.id = ?
        `, [childId]);

        expect(categories.length).toBe(1);

        const category = categories[0];
        expect(category.name).toBe('Laptops');
        expect(category.parent_id).toBe(parentId);
        expect(category.parent_name).toBe('Electronics');
    });

    test('should insert cart items', async () => {
        // Create test user and product
        const uniqueId = Date.now();

        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`cart_user_${uniqueId}`, `cart_${uniqueId}@example.com`, 'hashed_password']);

        const userId = userResult.insertId;

        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price) 
            VALUES (?, ?, ?)
        `, [`CART-ITEM-${uniqueId}`, `Cart Product ${uniqueId}`, '30.00']);

        const productId = productResult.insertId;

        // Add item to cart
        const [cartResult] = await connection.execute(`
            INSERT INTO cart_items (user_id, product_id, quantity) 
            VALUES (?, ?, ?)
        `, [userId, productId, 3]);

        expect(cartResult.affectedRows).toBe(1);

        // Verify cart item
        const [cartItems] = await connection.execute(`
            SELECT ci.*, p.name, p.price, (ci.quantity * p.price) as total_price
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ? AND ci.product_id = ?
        `, [userId, productId]);

        expect(cartItems.length).toBe(1);

        const cartItem = cartItems[0];
        expect(cartItem.user_id).toBe(userId);
        expect(cartItem.product_id).toBe(productId);
        expect(cartItem.quantity).toBe(3);
        expect(cartItem.name).toContain('Cart Product');
        expect(parseFloat(cartItem.total_price)).toBe(90.00); // 30.00 * 3
        expect(cartItem.added_at).toBeTruthy();
    });

    test('should insert reviews with ratings', async () => {
        // Create test user and product
        const uniqueId = Date.now();

        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`reviewer_${uniqueId}`, `reviewer_${uniqueId}@example.com`, 'hashed_password']);

        const userId = userResult.insertId;

        const [productResult] = await connection.execute(`
            INSERT INTO products (sku, name, price) 
            VALUES (?, ?, ?)
        `, [`REVIEW-PROD-${uniqueId}`, `Reviewed Product ${uniqueId}`, '149.99']);

        const productId = productResult.insertId;

        // Insert review
        const reviewData = {
            product_id: productId,
            user_id: userId,
            rating: 5,
            title: 'Excellent product!',
            comment: 'Fast delivery and great quality. Highly recommended.',
            is_verified_purchase: 1
        };

        const [reviewResult] = await connection.execute(`
            INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [reviewData.product_id, reviewData.user_id, reviewData.rating, reviewData.title, reviewData.comment, reviewData.is_verified_purchase]);

        expect(reviewResult.affectedRows).toBe(1);

        const reviewId = reviewResult.insertId;

        // Verify review with user information
        const [reviews] = await connection.execute(`
            SELECT r.*, u.username 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [reviewId]);

        expect(reviews.length).toBe(1);

        const review = reviews[0];
        expect(review.product_id).toBe(productId);
        expect(review.user_id).toBe(userId);
        expect(review.rating).toBe(5);
        expect(review.title).toBe(reviewData.title);
        expect(review.comment).toBe(reviewData.comment);
        expect(review.is_verified_purchase).toBe(1);
        expect(review.username).toContain('reviewer_');
        expect(review.created_at).toBeTruthy();
        expect(review.updated_at).toBeTruthy();
    });
});