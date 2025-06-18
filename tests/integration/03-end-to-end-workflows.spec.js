import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 3: END-TO-END WORKFLOW INTEGRATION
 * Learning Objectives:
 * - Test complete business workflows from API to database
 * - Verify multi-step operations maintain data integrity
 * - Test error scenarios across both layers
 * - Validate complex business logic implementation
 * - Ensure performance consistency between API and direct SQL
 */

const API_BASE_URL = 'http://localhost:3000';
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

test.describe('Level 3: End-to-End Workflow Integration', () => {
    
    test('should complete full e-commerce customer journey with perfect API-DB sync', async ({ request }) => {
        const uniqueId = Date.now();
        
        // 1. User Registration
        const userData = {
            username: `e2euser_${uniqueId}`,
            email: `e2e_${uniqueId}@example.com`,
            password_hash: 'hashed_password_e2e',
            first_name: 'E2E',
            last_name: 'Test',
            phone: '+1555000123'
        };
        
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: userData
        });
        expect(userResponse.status()).toBe(201);
        const user = await userResponse.json();
        
        // Verify user in database
        const [dbUsers] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [user.id]
        );
        expect(dbUsers.length).toBe(1);
        expect(dbUsers[0].username).toBe(userData.username);
        
        // 2. Create Categories and Products
        const categoryResponse = await request.post(`${API_BASE_URL}/categories`, {
            data: {
                name: `E2E Electronics ${uniqueId}`,
                description: 'Electronics for end-to-end testing'
            }
        });
        const category = await categoryResponse.json();
        
        const products = [];
        const productData = [
            { name: 'E2E Laptop', price: 999.99, sku: `E2E-LAPTOP-${uniqueId}` },
            { name: 'E2E Mouse', price: 29.99, sku: `E2E-MOUSE-${uniqueId}` },
            { name: 'E2E Keyboard', price: 79.99, sku: `E2E-KEYBOARD-${uniqueId}` }
        ];
        
        for (const prodData of productData) {
            const prodResponse = await request.post(`${API_BASE_URL}/products`, {
                data: {
                    ...prodData,
                    category_id: category.id,
                    stock_quantity: 100,
                    reorder_level: 10
                }
            });
            products.push(await prodResponse.json());
        }
        
        // Verify products in database
        const [dbProducts] = await connection.execute(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [category.id]
        );
        expect(dbProducts[0].count).toBe(3);
        
        // 3. Browse and Add to Cart
        const cartOperations = [
            { product: products[0], quantity: 1 }, // Laptop
            { product: products[1], quantity: 2 }, // Mouse x2
            { product: products[2], quantity: 1 }  // Keyboard
        ];
        
        for (const op of cartOperations) {
            const cartResponse = await request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
                data: {
                    product_id: op.product.id,
                    quantity: op.quantity
                }
            });
            expect(cartResponse.status()).toBe(200);
        }
        
        // Verify cart in database
        const [dbCartItems] = await connection.execute(`
            SELECT ci.*, p.name, p.price, (ci.quantity * p.price) as total_price
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ?
        `, [user.id]);
        
        expect(dbCartItems.length).toBe(3);
        
        const totalCartValue = dbCartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
        const expectedCartValue = (999.99 * 1) + (29.99 * 2) + (79.99 * 1);
        expect(totalCartValue).toBeCloseTo(expectedCartValue, 2);
        
        // 4. Create Order from Cart
        const orderItems = cartOperations.map(op => ({
            product_id: op.product.id,
            quantity: op.quantity
        }));
        
        const orderData = {
            user_id: user.id,
            items: orderItems,
            shipping_address: '123 E2E Test Street, Test City, TC 12345',
            billing_address: '456 E2E Billing Ave, Bill City, BC 67890',
            notes: 'End-to-end test order - please handle with care'
        };
        
        const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: orderData
        });
        expect(orderResponse.status()).toBe(201);
        const order = await orderResponse.json();
        
        // Verify order total calculation
        expect(parseFloat(order.total_amount)).toBeCloseTo(expectedCartValue, 2);
        expect(order.items.length).toBe(3);
        
        // Verify complete order in database
        const [dbOrders] = await connection.execute(`
            SELECT o.*, u.username 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [order.id]);
        
        expect(dbOrders.length).toBe(1);
        expect(dbOrders[0].username).toBe(user.username);
        expect(parseFloat(dbOrders[0].total_amount)).toBeCloseTo(expectedCartValue, 2);
        
        // Verify order items in database
        const [dbOrderItems] = await connection.execute(`
            SELECT oi.*, p.name, p.sku 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        `, [order.id]);
        
        expect(dbOrderItems.length).toBe(3);
        
        // 5. Process Order Through Status Changes
        const statusProgression = ['processing', 'shipped', 'delivered'];
        
        for (const status of statusProgression) {
            const statusResponse = await request.patch(`${API_BASE_URL}/orders/${order.id}/status`, {
                data: { status }
            });
            expect(statusResponse.status()).toBe(200);
            
            // Verify status in database immediately
            const [dbStatus] = await connection.execute(
                'SELECT status, updated_at FROM orders WHERE id = ?',
                [order.id]
            );
            expect(dbStatus[0].status).toBe(status);
            expect(dbStatus[0].updated_at).toBeTruthy();
        }
        
        // 6. Leave Product Reviews
        const reviewsData = [
            {
                product: products[0],
                rating: 5,
                title: 'Excellent laptop!',
                comment: 'Fast performance and great build quality. Highly recommended.'
            },
            {
                product: products[1],
                rating: 4,
                title: 'Good mouse',
                comment: 'Works well, comfortable to use.'
            }
        ];
        
        for (const reviewData of reviewsData) {
            const reviewResponse = await request.post(`${API_BASE_URL}/products/${reviewData.product.id}/reviews`, {
                data: {
                    user_id: user.id,
                    rating: reviewData.rating,
                    title: reviewData.title,
                    comment: reviewData.comment
                }
            });
            expect(reviewResponse.status()).toBe(201);
        }
        
        // Verify reviews in database
        const [dbReviews] = await connection.execute(`
            SELECT r.*, p.name as product_name, u.username 
            FROM reviews r 
            JOIN products p ON r.product_id = p.id 
            JOIN users u ON r.user_id = u.id 
            WHERE r.user_id = ?
        `, [user.id]);
        
        expect(dbReviews.length).toBe(2);
        dbReviews.forEach(review => {
            expect(review.username).toBe(user.username);
            expect([4, 5]).toContain(review.rating);
        });
        
        // 7. Comprehensive Data Validation
        // Check that all data is consistent across API and database
        
        // Final order verification via API
        const finalOrderResponse = await request.get(`${API_BASE_URL}/orders/${order.id}`);
        const finalApiOrder = await finalOrderResponse.json();
        
        // Final order verification via database
        const [finalDbOrder] = await connection.execute(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [order.id]);
        
        expect(finalApiOrder.status).toBe('delivered');
        expect(finalDbOrder[0].status).toBe('delivered');
        expect(finalApiOrder.total_amount).toBe(finalDbOrder[0].total_amount);
        
        // Verify final product reviews via API
        for (const product of products.slice(0, 2)) { // Only first two have reviews
            const reviewsResponse = await request.get(`${API_BASE_URL}/products/${product.id}/reviews`);
            const productReviews = await reviewsResponse.json();
            
            const userReview = productReviews.find(r => r.user_id === user.id);
            expect(userReview).toBeTruthy();
            expect(userReview.username).toBe(user.username);
        }
        
        // Cleanup
        await connection.execute('DELETE FROM reviews WHERE user_id = ?', [user.id]);
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [user.id]);
        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [order.id]);
        await connection.execute('DELETE FROM orders WHERE id = ?', [order.id]);
        await connection.execute('DELETE FROM products WHERE category_id = ?', [category.id]);
        await connection.execute('DELETE FROM categories WHERE id = ?', [category.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });

    test('should handle concurrent operations maintaining data consistency', async ({ request }) => {
        // Create test data
        const uniqueId = Date.now();
        
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: `concurrent_${uniqueId}`,
                email: `concurrent_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        const user = await userResponse.json();
        
        const productResponse = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `CONCURRENT-${uniqueId}`,
                name: `Concurrent Test Product`,
                price: 25.00,
                stock_quantity: 10
            }
        });
        const product = await productResponse.json();
        
        // Simulate concurrent cart additions
        const concurrentPromises = [];
        for (let i = 0; i < 5; i++) {
            const promise = request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
                data: { product_id: product.id, quantity: 1 }
            });
            concurrentPromises.push(promise);
        }
        
        const results = await Promise.all(concurrentPromises);
        
        // All requests should succeed
        results.forEach(response => {
            expect(response.status()).toBe(200);
        });
        
        // Verify final state via API
        const cartResponse = await request.get(`${API_BASE_URL}/users/${user.id}/cart`);
        const apiCart = await cartResponse.json();
        
        // Verify final state via database
        const [dbCart] = await connection.execute(`
            SELECT ci.*, p.name, p.price, (ci.quantity * p.price) as total_price
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ? AND ci.product_id = ?
        `, [user.id, product.id]);
        
        // Both should show quantity of 5 (all concurrent additions)
        const apiCartItem = apiCart.find(item => item.product_id === product.id);
        expect(apiCartItem).toBeTruthy();
        expect(apiCartItem.quantity).toBe(5);
        
        expect(dbCart.length).toBe(1);
        expect(dbCart[0].quantity).toBe(5);
        expect(parseFloat(dbCart[0].total_price)).toBeCloseTo(125.00, 2); // 25.00 * 5
        
        // Cleanup
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [user.id]);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });

    test('should validate complex business rules across API and database', async ({ request }) => {
        const uniqueId = Date.now();
        
        // Create test user
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: `business_${uniqueId}`,
                email: `business_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        const user = await userResponse.json();
        
        // Test 1: Order with non-existent product should fail
        const invalidOrderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: {
                user_id: user.id,
                items: [{ product_id: 99999, quantity: 1 }]
            }
        });
        expect(invalidOrderResponse.status()).toBe(400);
        
        // Verify no order was created in database
        const [ordersAfterFailed] = await connection.execute(
            'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
            [user.id]
        );
        expect(ordersAfterFailed[0].count).toBe(0);
        
        // Test 2: Review with invalid rating should fail
        const productResponse = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `BUSINESS-${uniqueId}`,
                name: `Business Test Product`,
                price: 50.00
            }
        });
        const product = await productResponse.json();
        
        const invalidReviewResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: {
                user_id: user.id,
                rating: 10, // Invalid rating (should be 1-5)
                title: 'Invalid rating test'
            }
        });
        expect(invalidReviewResponse.status()).toBe(400);
        
        // Verify no review was created in database
        const [reviewsAfterFailed] = await connection.execute(
            'SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND product_id = ?',
            [user.id, product.id]
        );
        expect(reviewsAfterFailed[0].count).toBe(0);
        
        // Test 3: Valid review should work
        const validReviewResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: {
                user_id: user.id,
                rating: 4,
                title: 'Valid rating test',
                comment: 'This should work fine'
            }
        });
        expect(validReviewResponse.status()).toBe(201);
        
        // Verify review was created in database
        const [reviewsAfterValid] = await connection.execute(
            'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
            [user.id, product.id]
        );
        expect(reviewsAfterValid.length).toBe(1);
        expect(reviewsAfterValid[0].rating).toBe(4);
        
        // Test 4: Duplicate username should fail
        const duplicateUserResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: user.username, // Same username
                email: `different_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        expect(duplicateUserResponse.status()).toBe(400);
        
        // Verify only one user with that username exists
        const [usersWithSameName] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE username = ?',
            [user.username]
        );
        expect(usersWithSameName[0].count).toBe(1);
        
        // Cleanup
        await connection.execute('DELETE FROM reviews WHERE user_id = ?', [user.id]);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });

    test('should verify performance consistency between API and direct SQL queries', async ({ request }) => {
        // This test ensures that API performance is reasonable compared to direct SQL
        
        // Test 1: Get all users performance
        const apiStartTime = Date.now();
        const apiUsersResponse = await request.get(`${API_BASE_URL}/users`);
        const apiUsers = await apiUsersResponse.json();
        const apiEndTime = Date.now();
        const apiTime = apiEndTime - apiStartTime;
        
        const sqlStartTime = Date.now();
        const [sqlUsers] = await connection.execute(
            'SELECT id, username, email, first_name, last_name, phone, created_at, is_active, last_login FROM users ORDER BY id'
        );
        const sqlEndTime = Date.now();
        const sqlTime = sqlEndTime - sqlStartTime;
        
        // API should be reasonably close to direct SQL (allowing for network overhead)
        expect(apiTime).toBeLessThan(sqlTime * 10); // API should be at most 10x slower than direct SQL
        expect(apiUsers.length).toBe(sqlUsers.length);
        
        // Test 2: Get products with category joins
        const apiProdStartTime = Date.now();
        const apiProductsResponse = await request.get(`${API_BASE_URL}/products`);
        const apiProducts = await apiProductsResponse.json();
        const apiProdEndTime = Date.now();
        const apiProdTime = apiProdEndTime - apiProdStartTime;
        
        const sqlProdStartTime = Date.now();
        const [sqlProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id
        `);
        const sqlProdEndTime = Date.now();
        const sqlProdTime = sqlProdEndTime - sqlProdStartTime;
        
        expect(apiProdTime).toBeLessThan(sqlProdTime * 10);
        expect(apiProducts.length).toBe(sqlProducts.length);
        
        // Test 3: Complex order query with items
        const [ordersWithItems] = await connection.execute(`
            SELECT DISTINCT o.id 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            LIMIT 1
        `);
        
        if (ordersWithItems.length > 0) {
            const orderId = ordersWithItems[0].id;
            
            const apiOrderStartTime = Date.now();
            const apiOrderResponse = await request.get(`${API_BASE_URL}/orders/${orderId}`);
            const apiOrder = await apiOrderResponse.json();
            const apiOrderEndTime = Date.now();
            const apiOrderTime = apiOrderEndTime - apiOrderStartTime;
            
            const sqlOrderStartTime = Date.now();
            const [sqlOrderDetails] = await connection.execute(`
                SELECT o.*, u.username, u.email 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?
            `, [orderId]);
            
            const [sqlOrderItems] = await connection.execute(`
                SELECT oi.*, p.name as product_name, p.sku 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [orderId]);
            const sqlOrderEndTime = Date.now();
            const sqlOrderTime = sqlOrderEndTime - sqlOrderStartTime;
            
            expect(apiOrderTime).toBeLessThan(sqlOrderTime * 15); // More complex query, allow more overhead
            expect(apiOrder.items.length).toBe(sqlOrderItems.length);
        }
        
        console.log(`Performance metrics:
        - Users API: ${apiTime}ms, SQL: ${sqlTime}ms
        - Products API: ${apiProdTime}ms, SQL: ${sqlProdTime}ms
        - Order API: ${apiOrderTime || 'N/A'}ms, SQL: ${sqlOrderTime || 'N/A'}ms`);
    });

    test('should validate data integrity in complex multi-table operations', async ({ request }) => {
        const uniqueId = Date.now();
        
        // Create comprehensive test scenario
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: `integrity_${uniqueId}`,
                email: `integrity_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        const user = await userResponse.json();
        
        const categoryResponse = await request.post(`${API_BASE_URL}/categories`, {
            data: {
                name: `Integrity Category ${uniqueId}`,
                description: 'Category for data integrity testing'
            }
        });
        const category = await categoryResponse.json();
        
        const productResponse = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `INTEGRITY-${uniqueId}`,
                name: `Integrity Product ${uniqueId}`,
                price: 100.00,
                category_id: category.id,
                stock_quantity: 50
            }
        });
        const product = await productResponse.json();
        
        // Create order that affects multiple tables
        const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: {
                user_id: user.id,
                items: [{ product_id: product.id, quantity: 3 }],
                shipping_address: '789 Integrity Test Ave',
                notes: 'Data integrity test order'
            }
        });
        const order = await orderResponse.json();
        
        // Add review
        const reviewResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: {
                user_id: user.id,
                rating: 5,
                title: 'Integrity test review',
                comment: 'Testing data integrity across tables'
            }
        });
        const review = await reviewResponse.json();
        
        // Now verify data integrity across all related tables
        
        // 1. User should exist and be linked to order and review
        const [userIntegrity] = await connection.execute(`
            SELECT 
                u.id,
                u.username,
                COUNT(DISTINCT o.id) as order_count,
                COUNT(DISTINCT r.id) as review_count
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            LEFT JOIN reviews r ON u.id = r.user_id
            WHERE u.id = ?
            GROUP BY u.id, u.username
        `, [user.id]);
        
        expect(userIntegrity.length).toBe(1);
        expect(userIntegrity[0].order_count).toBe(1);
        expect(userIntegrity[0].review_count).toBe(1);
        
        // 2. Product should be linked to category, order item, and review
        const [productIntegrity] = await connection.execute(`
            SELECT 
                p.id,
                p.name,
                c.name as category_name,
                COUNT(DISTINCT oi.id) as order_item_count,
                COUNT(DISTINCT r.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.id = ?
            GROUP BY p.id, p.name, c.name
        `, [product.id]);
        
        expect(productIntegrity.length).toBe(1);
        expect(productIntegrity[0].category_name).toBe(category.name);
        expect(productIntegrity[0].order_item_count).toBe(1);
        expect(productIntegrity[0].review_count).toBe(1);
        
        // 3. Order should have correct total and item relationships
        const [orderIntegrity] = await connection.execute(`
            SELECT 
                o.id,
                o.total_amount,
                COUNT(oi.id) as item_count,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total_price) as calculated_total
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id, o.total_amount
        `, [order.id]);
        
        expect(orderIntegrity.length).toBe(1);
        expect(orderIntegrity[0].item_count).toBe(1);
        expect(orderIntegrity[0].total_quantity).toBe(3);
        expect(parseFloat(orderIntegrity[0].total_amount)).toBeCloseTo(parseFloat(orderIntegrity[0].calculated_total), 2);
        
        // 4. Verify referential integrity - all foreign keys should be valid
        const [referentialIntegrity] = await connection.execute(`
            SELECT 
                'orders' as table_name,
                COUNT(*) as invalid_references
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.user_id IS NOT NULL AND u.id IS NULL
            
            UNION ALL
            
            SELECT 
                'order_items' as table_name,
                COUNT(*) as invalid_references
            FROM order_items oi
            LEFT JOIN orders o ON oi.order_id = o.id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE (oi.order_id IS NOT NULL AND o.id IS NULL) 
               OR (oi.product_id IS NOT NULL AND p.id IS NULL)
            
            UNION ALL
            
            SELECT 
                'reviews' as table_name,
                COUNT(*) as invalid_references
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN products p ON r.product_id = p.id
            WHERE (r.user_id IS NOT NULL AND u.id IS NULL) 
               OR (r.product_id IS NOT NULL AND p.id IS NULL)
            
            UNION ALL
            
            SELECT 
                'products' as table_name,
                COUNT(*) as invalid_references
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id IS NOT NULL AND c.id IS NULL
        `);
        
        // All referential integrity checks should return 0 invalid references
        referentialIntegrity.forEach(check => {
            expect(check.invalid_references).toBe(0);
        });
        
        // Cleanup in proper order to maintain referential integrity
        await connection.execute('DELETE FROM reviews WHERE id = ?', [review.id]);
        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [order.id]);
        await connection.execute('DELETE FROM orders WHERE id = ?', [order.id]);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
        await connection.execute('DELETE FROM categories WHERE id = ?', [category.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });
});