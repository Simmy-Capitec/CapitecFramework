import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 2: COMPLEX OPERATIONS SYNCHRONIZATION
 * Learning Objectives:
 * - Test complex API operations with database validation
 * - Verify cart operations sync properly
 * - Test order creation and item relationships
 * - Validate filtering and search across layers
 * - Ensure data integrity in complex workflows
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

test.describe('Level 2: Complex Operations Synchronization', () => {
    
    test('should verify cart operations sync between API and database', async ({ request }) => {
        // Create test user and product
        const uniqueId = Date.now();
        
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: `cartuser_${uniqueId}`,
                email: `cartuser_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        const user = await userResponse.json();
        
        const productResponse = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `CART-PROD-${uniqueId}`,
                name: `Cart Product ${uniqueId}`,
                price: 25.99
            }
        });
        const product = await productResponse.json();
        
        // Add item to cart via API
        const addToCartResponse = await request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
            data: {
                product_id: product.id,
                quantity: 3
            }
        });
        expect(addToCartResponse.status()).toBe(200);
        
        const apiCart = await addToCartResponse.json();
        expect(apiCart.length).toBeGreaterThan(0);
        
        const cartItem = apiCart.find(item => item.product_id === product.id);
        expect(cartItem).toBeTruthy();
        expect(cartItem.quantity).toBe(3);
        expect(cartItem.name).toBe(product.name);
        expect(parseFloat(cartItem.total_price)).toBeCloseTo(25.99 * 3, 2);
        
        // Verify in database
        const [dbCartItems] = await connection.execute(`
            SELECT ci.*, p.name, p.price, (ci.quantity * p.price) as total_price
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ? AND ci.product_id = ?
        `, [user.id, product.id]);
        
        expect(dbCartItems.length).toBe(1);
        
        const dbCartItem = dbCartItems[0];
        expect(dbCartItem.user_id).toBe(user.id);
        expect(dbCartItem.product_id).toBe(product.id);
        expect(dbCartItem.quantity).toBe(3);
        expect(parseFloat(dbCartItem.total_price)).toBeCloseTo(25.99 * 3, 2);
        expect(dbCartItem.added_at).toBeTruthy();
        
        // Get cart via API and verify it matches database
        const getCartResponse = await request.get(`${API_BASE_URL}/users/${user.id}/cart`);
        const apiCartGet = await getCartResponse.json();
        
        expect(apiCartGet.length).toBe(dbCartItems.length);
        
        // Add more quantity via API
        await request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
            data: {
                product_id: product.id,
                quantity: 2
            }
        });
        
        // Verify total quantity is updated in database
        const [updatedDbCart] = await connection.execute(
            'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [user.id, product.id]
        );
        
        expect(updatedDbCart[0].quantity).toBe(5); // 3 + 2
        
        // Cleanup
        await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [user.id]);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });

    test('should verify order creation with items syncs properly', async ({ request }) => {
        // Create test data
        const uniqueId = Date.now();
        
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: `orderuser_${uniqueId}`,
                email: `orderuser_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        const user = await userResponse.json();
        
        const product1Response = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `ORDER-PROD1-${uniqueId}`,
                name: `Order Product 1`,
                price: 15.99
            }
        });
        const product1 = await product1Response.json();
        
        const product2Response = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `ORDER-PROD2-${uniqueId}`,
                name: `Order Product 2`,
                price: 32.50
            }
        });
        const product2 = await product2Response.json();
        
        // Create order via API
        const orderData = {
            user_id: user.id,
            items: [
                { product_id: product1.id, quantity: 2 },
                { product_id: product2.id, quantity: 1 }
            ],
            shipping_address: '123 Integration Test St',
            billing_address: '456 Test Billing Ave',
            notes: 'Integration test order'
        };
        
        const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: orderData
        });
        expect(orderResponse.status()).toBe(201);
        
        const apiOrder = await orderResponse.json();
        expect(apiOrder).toHaveProperty('id');
        expect(apiOrder).toHaveProperty('order_number');
        expect(apiOrder.user_id).toBe(user.id);
        expect(apiOrder.status).toBe('pending');
        expect(apiOrder.shipping_address).toBe(orderData.shipping_address);
        expect(apiOrder.billing_address).toBe(orderData.billing_address);
        expect(apiOrder.notes).toBe(orderData.notes);
        expect(apiOrder.items).toBeDefined();
        expect(apiOrder.items.length).toBe(2);
        
        const orderId = apiOrder.id;
        
        // Verify order in database
        const [dbOrders] = await connection.execute(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [orderId]);
        
        expect(dbOrders.length).toBe(1);
        
        const dbOrder = dbOrders[0];
        expect(dbOrder.id).toBe(orderId);
        expect(dbOrder.user_id).toBe(user.id);
        expect(dbOrder.status).toBe('pending');
        expect(dbOrder.shipping_address).toBe(orderData.shipping_address);
        expect(dbOrder.billing_address).toBe(orderData.billing_address);
        expect(dbOrder.notes).toBe(orderData.notes);
        expect(dbOrder.username).toBe(user.username);
        
        // Verify order items in database
        const [dbOrderItems] = await connection.execute(`
            SELECT oi.*, p.name as product_name, p.sku 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        `, [orderId]);
        
        expect(dbOrderItems.length).toBe(2);
        
        // Verify total amount calculation
        const expectedTotal = (15.99 * 2) + (32.50 * 1);
        expect(parseFloat(apiOrder.total_amount)).toBeCloseTo(expectedTotal, 2);
        expect(parseFloat(dbOrder.total_amount)).toBeCloseTo(expectedTotal, 2);
        
        // Verify individual items
        const item1 = dbOrderItems.find(item => item.product_id === product1.id);
        expect(item1).toBeTruthy();
        expect(item1.quantity).toBe(2);
        expect(parseFloat(item1.unit_price)).toBe(15.99);
        expect(parseFloat(item1.total_price)).toBeCloseTo(31.98, 2);
        
        const item2 = dbOrderItems.find(item => item.product_id === product2.id);
        expect(item2).toBeTruthy();
        expect(item2.quantity).toBe(1);
        expect(parseFloat(item2.unit_price)).toBe(32.50);
        expect(parseFloat(item2.total_price)).toBeCloseTo(32.50, 2);
        
        // Verify API order items match database
        apiOrder.items.forEach(apiItem => {
            const dbItem = dbOrderItems.find(db => db.product_id === apiItem.product_id);
            expect(dbItem).toBeTruthy();
            expect(apiItem.quantity).toBe(dbItem.quantity);
            expect(parseFloat(apiItem.unit_price)).toBeCloseTo(parseFloat(dbItem.unit_price), 2);
            expect(parseFloat(apiItem.total_price)).toBeCloseTo(parseFloat(dbItem.total_price), 2);
            expect(apiItem.product_name).toBe(dbItem.product_name);
        });
        
        // Cleanup
        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        await connection.execute('DELETE FROM orders WHERE id = ?', [orderId]);
        await connection.execute('DELETE FROM products WHERE id IN (?, ?)', [product1.id, product2.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });

    test('should verify order status updates sync between API and database', async ({ request }) => {
        // Create test order
        const uniqueId = Date.now();
        
        const [userResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`statususer_${uniqueId}`, `status_${uniqueId}@example.com`, 'hashed_password']);
        
        const [orderResult] = await connection.execute(`
            INSERT INTO orders (order_number, user_id, status, total_amount) 
            VALUES (?, ?, ?, ?)
        `, [`ORD-STATUS-${uniqueId}`, userResult.insertId, 'pending', '100.00']);
        
        const orderId = orderResult.insertId;
        const userId = userResult.insertId;
        
        // Update status via API
        const updateResponse = await request.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
            data: { status: 'processing' }
        });
        expect(updateResponse.status()).toBe(200);
        
        const apiUpdatedOrder = await updateResponse.json();
        expect(apiUpdatedOrder.status).toBe('processing');
        
        // Verify status in database
        const [dbOrders] = await connection.execute(
            'SELECT status, updated_at FROM orders WHERE id = ?',
            [orderId]
        );
        
        expect(dbOrders.length).toBe(1);
        expect(dbOrders[0].status).toBe('processing');
        expect(dbOrders[0].updated_at).toBeTruthy();
        
        // Test progression through all statuses
        const statuses = ['shipped', 'delivered'];
        
        for (const status of statuses) {
            const statusResponse = await request.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
                data: { status }
            });
            expect(statusResponse.status()).toBe(200);
            
            const apiOrder = await statusResponse.json();
            expect(apiOrder.status).toBe(status);
            
            // Verify in database
            const [dbStatus] = await connection.execute(
                'SELECT status FROM orders WHERE id = ?',
                [orderId]
            );
            expect(dbStatus[0].status).toBe(status);
        }
        
        // Cleanup
        await connection.execute('DELETE FROM orders WHERE id = ?', [orderId]);
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    });

    test('should verify product filtering works consistently across API and database', async ({ request }) => {
        // Create test category and products
        const uniqueId = Date.now();
        
        const categoryResponse = await request.post(`${API_BASE_URL}/categories`, {
            data: {
                name: `Filter Category ${uniqueId}`,
                description: 'Category for filter testing'
            }
        });
        const category = await categoryResponse.json();
        
        const products = [];
        for (let i = 0; i < 3; i++) {
            const productResponse = await request.post(`${API_BASE_URL}/products`, {
                data: {
                    sku: `FILTER-${uniqueId}-${i}`,
                    name: `Filter Product ${i}`,
                    price: 10.00 + (i * 5), // 10.00, 15.00, 20.00
                    category_id: category.id,
                    is_active: i < 2 ? 1 : 0 // First two active, third inactive
                }
            });
            products.push(await productResponse.json());
        }
        
        // Test category filter via API
        const apiFilterResponse = await request.get(`${API_BASE_URL}/products?category_id=${category.id}`);
        const apiFilteredProducts = await apiFilterResponse.json();
        
        // Test same filter via database
        const [dbFilteredProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.category_id = ?
        `, [category.id]);
        
        // Compare results
        expect(apiFilteredProducts.length).toBe(dbFilteredProducts.length);
        expect(apiFilteredProducts.length).toBe(3); // All products regardless of is_active
        
        // Verify all returned products belong to the category
        apiFilteredProducts.forEach(product => {
            expect(product.category_id).toBe(category.id);
        });
        
        dbFilteredProducts.forEach(product => {
            expect(product.category_id).toBe(category.id);
        });
        
        // Test active filter via API
        const apiActiveResponse = await request.get(`${API_BASE_URL}/products?is_active=true`);
        const apiActiveProducts = await apiActiveResponse.json();
        
        // Test same filter via database
        const [dbActiveProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = 1
        `);
        
        // Verify active filter results
        apiActiveProducts.forEach(product => {
            expect(product.is_active).toBe(1);
        });
        
        dbActiveProducts.forEach(product => {
            expect(product.is_active).toBe(1);
        });
        
        // Test search filter via API
        const searchTerm = `Filter Product`;
        const apiSearchResponse = await request.get(`${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`);
        const apiSearchProducts = await apiSearchResponse.json();
        
        // Test same search via database
        const [dbSearchProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.name LIKE ?
        `, [`%${searchTerm}%`]);
        
        // Verify search results
        expect(apiSearchProducts.length).toBe(dbSearchProducts.length);
        
        apiSearchProducts.forEach(product => {
            expect(product.name).toContain(searchTerm);
        });
        
        dbSearchProducts.forEach(product => {
            expect(product.name).toContain(searchTerm);
        });
        
        // Cleanup
        await connection.execute('DELETE FROM products WHERE category_id = ?', [category.id]);
        await connection.execute('DELETE FROM categories WHERE id = ?', [category.id]);
    });

    test('should verify review system synchronization', async ({ request }) => {
        // Create test user and product
        const uniqueId = Date.now();
        
        const userResponse = await request.post(`${API_BASE_URL}/users`, {
            data: {
                username: `reviewer_${uniqueId}`,
                email: `reviewer_${uniqueId}@example.com`,
                password_hash: 'hashed_password'
            }
        });
        const user = await userResponse.json();
        
        const productResponse = await request.post(`${API_BASE_URL}/products`, {
            data: {
                sku: `REVIEW-PROD-${uniqueId}`,
                name: `Review Product ${uniqueId}`,
                price: 75.99
            }
        });
        const product = await productResponse.json();
        
        // Create review via API
        const reviewData = {
            user_id: user.id,
            rating: 4,
            title: 'Great product!',
            comment: 'Really happy with this purchase. Fast delivery and great quality.'
        };
        
        const reviewResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: reviewData
        });
        expect(reviewResponse.status()).toBe(201);
        
        const apiReview = await reviewResponse.json();
        expect(apiReview).toHaveProperty('id');
        expect(apiReview.product_id).toBe(product.id);
        expect(apiReview.user_id).toBe(user.id);
        expect(apiReview.rating).toBe(reviewData.rating);
        expect(apiReview.title).toBe(reviewData.title);
        expect(apiReview.comment).toBe(reviewData.comment);
        expect(apiReview.username).toBe(user.username);
        
        const reviewId = apiReview.id;
        
        // Verify review in database
        const [dbReviews] = await connection.execute(`
            SELECT r.*, u.username 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [reviewId]);
        
        expect(dbReviews.length).toBe(1);
        
        const dbReview = dbReviews[0];
        expect(dbReview.id).toBe(reviewId);
        expect(dbReview.product_id).toBe(product.id);
        expect(dbReview.user_id).toBe(user.id);
        expect(dbReview.rating).toBe(reviewData.rating);
        expect(dbReview.title).toBe(reviewData.title);
        expect(dbReview.comment).toBe(reviewData.comment);
        expect(dbReview.username).toBe(user.username);
        expect(dbReview.created_at).toBeTruthy();
        expect(dbReview.updated_at).toBeTruthy();
        
        // Get product reviews via API
        const apiProductReviewsResponse = await request.get(`${API_BASE_URL}/products/${product.id}/reviews`);
        const apiProductReviews = await apiProductReviewsResponse.json();
        
        // Get same reviews via database
        const [dbProductReviews] = await connection.execute(`
            SELECT r.*, u.username 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? 
            ORDER BY r.created_at DESC
        `, [product.id]);
        
        // Compare API and database results
        expect(apiProductReviews.length).toBe(dbProductReviews.length);
        expect(apiProductReviews.length).toBeGreaterThan(0);
        
        apiProductReviews.forEach((apiReview, index) => {
            const dbReview = dbProductReviews[index];
            expect(apiReview.id).toBe(dbReview.id);
            expect(apiReview.product_id).toBe(dbReview.product_id);
            expect(apiReview.user_id).toBe(dbReview.user_id);
            expect(apiReview.rating).toBe(dbReview.rating);
            expect(apiReview.title).toBe(dbReview.title);
            expect(apiReview.comment).toBe(dbReview.comment);
            expect(apiReview.username).toBe(dbReview.username);
        });
        
        // Cleanup
        await connection.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
        await connection.execute('DELETE FROM products WHERE id = ?', [product.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
    });

    test('should verify complex order fetching with items matches between API and database', async ({ request }) => {
        // Get an existing order with items from database
        const [ordersWithItems] = await connection.execute(`
            SELECT DISTINCT o.id 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            LIMIT 1
        `);
        
        if (ordersWithItems.length > 0) {
            const orderId = ordersWithItems[0].id;
            
            // Fetch order via API
            const apiResponse = await request.get(`${API_BASE_URL}/orders/${orderId}`);
            expect(apiResponse.status()).toBe(200);
            const apiOrder = await apiResponse.json();
            
            // Fetch order via database
            const [dbOrders] = await connection.execute(`
                SELECT o.*, u.username, u.email 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?
            `, [orderId]);
            
            const [dbOrderItems] = await connection.execute(`
                SELECT oi.*, p.name as product_name, p.sku 
                FROM order_items oi 
                LEFT JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [orderId]);
            
            expect(dbOrders.length).toBe(1);
            const dbOrder = dbOrders[0];
            
            // Compare order details
            expect(apiOrder.id).toBe(dbOrder.id);
            expect(apiOrder.order_number).toBe(dbOrder.order_number);
            expect(apiOrder.user_id).toBe(dbOrder.user_id);
            expect(apiOrder.status).toBe(dbOrder.status);
            expect(apiOrder.total_amount).toBe(dbOrder.total_amount);
            expect(apiOrder.username).toBe(dbOrder.username);
            expect(apiOrder.email).toBe(dbOrder.email);
            
            // Compare order items
            expect(apiOrder.items).toBeDefined();
            expect(apiOrder.items.length).toBe(dbOrderItems.length);
            
            apiOrder.items.forEach(apiItem => {
                const dbItem = dbOrderItems.find(db => db.id === apiItem.id);
                expect(dbItem).toBeTruthy();
                expect(apiItem.order_id).toBe(dbItem.order_id);
                expect(apiItem.product_id).toBe(dbItem.product_id);
                expect(apiItem.quantity).toBe(dbItem.quantity);
                expect(apiItem.unit_price).toBe(dbItem.unit_price);
                expect(apiItem.total_price).toBe(dbItem.total_price);
                expect(apiItem.product_name).toBe(dbItem.product_name);
                expect(apiItem.sku).toBe(dbItem.sku);
            });
        }
    });
});