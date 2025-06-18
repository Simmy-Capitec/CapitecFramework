import { test, expect } from '@playwright/test';

/**
 * LEVEL 5: COMPLEX WORKFLOWS & BUSINESS SCENARIOS
 * Learning Objectives:
 * - End-to-end business workflows
 * - Product reviews and ratings
 * - Complex data validation
 * - Performance testing
 * - Error handling and edge cases
 * - Real-world e-commerce scenarios
 */

const API_BASE_URL = 'http://localhost:3000';

test.describe('Level 5: Complex Workflows & Business Scenarios', () => {
    
    test('should complete full e-commerce user journey', async ({ request }) => {
        // 1. User Registration
        const user = await createTestUser(request);
        expect(user.id).toBeDefined();
        
        // 2. Browse products by category
        const category = await createTestCategory(request, 'Electronics');
        const products = [
            await createTestProduct(request, 'Laptop', 999.99, category.id),
            await createTestProduct(request, 'Mouse', 29.99, category.id),
            await createTestProduct(request, 'Keyboard', 79.99, category.id)
        ];
        
        // Browse category products
        const browseResponse = await request.get(`${API_BASE_URL}/products?category_id=${category.id}`);
        const categoryProducts = await browseResponse.json();
        expect(categoryProducts.length).toBeGreaterThanOrEqual(3);
        
        // 3. Add items to cart
        await request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
            data: { product_id: products[0].id, quantity: 1 } // Laptop
        });
        
        await request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
            data: { product_id: products[1].id, quantity: 2 } // 2 Mice
        });
        
        // Verify cart contents
        const cartResponse = await request.get(`${API_BASE_URL}/users/${user.id}/cart`);
        const cart = await cartResponse.json();
        expect(cart.length).toBe(2);
        
        const totalCartValue = cart.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
        expect(totalCartValue).toBeCloseTo(999.99 + (29.99 * 2), 2);
        
        // 4. Create order from cart
        const orderItems = cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        }));
        
        const orderData = {
            user_id: user.id,
            items: orderItems,
            shipping_address: '123 Main St, Anytown, AT 12345',
            billing_address: '123 Main St, Anytown, AT 12345',
            notes: 'Please deliver during business hours'
        };
        
        const orderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: orderData
        });
        expect(orderResponse.status()).toBe(201);
        
        const order = await orderResponse.json();
        expect(order.items.length).toBe(2);
        expect(parseFloat(order.total_amount)).toBeCloseTo(totalCartValue, 2);
        
        // 5. Process order through different statuses
        const statuses = ['processing', 'shipped', 'delivered'];
        
        for (const status of statuses) {
            const statusResponse = await request.patch(`${API_BASE_URL}/orders/${order.id}/status`, {
                data: { status }
            });
            expect(statusResponse.status()).toBe(200);
            
            const updatedOrder = await statusResponse.json();
            expect(updatedOrder.status).toBe(status);
        }
        
        // 6. Leave product reviews
        const reviewData = {
            user_id: user.id,
            rating: 5,
            title: 'Excellent laptop!',
            comment: 'Fast delivery and great quality. Highly recommended.'
        };
        
        const reviewResponse = await request.post(`${API_BASE_URL}/products/${products[0].id}/reviews`, {
            data: reviewData
        });
        expect(reviewResponse.status()).toBe(201);
        
        const review = await reviewResponse.json();
        expect(review.rating).toBe(5);
        expect(review.title).toBe(reviewData.title);
        expect(review.username).toBe(user.username);
        
        // Verify review appears in product reviews
        const productReviewsResponse = await request.get(`${API_BASE_URL}/products/${products[0].id}/reviews`);
        const productReviews = await productReviewsResponse.json();
        
        const userReview = productReviews.find(r => r.user_id === user.id);
        expect(userReview).toBeTruthy();
        expect(userReview.rating).toBe(5);
    });

    test('should handle product reviews and ratings system', async ({ request }) => {
        const user1 = await createTestUser(request, 'reviewer1');
        const user2 = await createTestUser(request, 'reviewer2');
        const user3 = await createTestUser(request, 'reviewer3');
        const product = await createTestProduct(request, 'Reviewed Product', 149.99);
        
        // Multiple users leave reviews
        const reviews = [
            { user: user1, rating: 5, title: 'Excellent!', comment: 'Love this product' },
            { user: user2, rating: 4, title: 'Good quality', comment: 'Works as expected' },
            { user: user3, rating: 3, title: 'Average', comment: 'Could be better' }
        ];
        
        for (const reviewData of reviews) {
            const response = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
                data: {
                    user_id: reviewData.user.id,
                    rating: reviewData.rating,
                    title: reviewData.title,
                    comment: reviewData.comment
                }
            });
            expect(response.status()).toBe(201);
        }
        
        // Fetch all reviews and verify structure
        const reviewsResponse = await request.get(`${API_BASE_URL}/products/${product.id}/reviews`);
        const productReviews = await reviewsResponse.json();
        
        expect(productReviews.length).toBe(3);
        
        // Verify reviews are sorted by creation date (most recent first)
        const timestamps = productReviews.map(r => new Date(r.created_at));
        for (let i = 1; i < timestamps.length; i++) {
            expect(timestamps[i-1].getTime()).toBeGreaterThanOrEqual(timestamps[i].getTime());
        }
        
        // Calculate average rating
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / productReviews.length;
        expect(averageRating).toBeCloseTo(4.0, 1);
        
        // Verify each review has required fields
        productReviews.forEach(review => {
            expect(review).toHaveProperty('id');
            expect(review).toHaveProperty('product_id', product.id);
            expect(review).toHaveProperty('user_id');
            expect(review).toHaveProperty('rating');
            expect(review).toHaveProperty('title');
            expect(review).toHaveProperty('comment');
            expect(review).toHaveProperty('username');
            expect(review).toHaveProperty('created_at');
            expect(review.rating).toBeGreaterThanOrEqual(1);
            expect(review.rating).toBeLessThanOrEqual(5);
        });
    });

    test('should validate complex order scenarios', async ({ request }) => {
        const user = await createTestUser(request);
        const category = await createTestCategory(request, 'Test Category');
        
        // Create products with different stock levels
        const highStockProduct = await createTestProduct(request, 'High Stock Item', 25.00, category.id);
        const lowStockProduct = await createTestProduct(request, 'Low Stock Item', 15.00, category.id);
        
        // Test large quantity order
        const largeOrderData = {
            user_id: user.id,
            items: [
                { product_id: highStockProduct.id, quantity: 50 },
                { product_id: lowStockProduct.id, quantity: 10 }
            ],
            shipping_address: '789 Bulk Order St, Warehouse District, WD 54321',
            notes: 'Large quantity order for business'
        };
        
        const largeOrderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: largeOrderData
        });
        expect(largeOrderResponse.status()).toBe(201);
        
        const largeOrder = await largeOrderResponse.json();
        
        // Verify total calculation for large quantities
        const expectedTotal = (25.00 * 50) + (15.00 * 10);
        expect(parseFloat(largeOrder.total_amount)).toBe(expectedTotal);
        
        // Test order with invalid product
        const invalidOrderData = {
            user_id: user.id,
            items: [
                { product_id: 99999, quantity: 1 } // Non-existent product
            ]
        };
        
        const invalidOrderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: invalidOrderData
        });
        expect(invalidOrderResponse.status()).toBe(400);
        
        const errorResponse = await invalidOrderResponse.json();
        expect(errorResponse.error).toContain('not found');
        
        // Test order with zero quantity
        const zeroQuantityData = {
            user_id: user.id,
            items: [
                { product_id: highStockProduct.id, quantity: 0 }
            ]
        };
        
        const zeroQuantityResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: zeroQuantityData
        });
        expect(zeroQuantityResponse.status()).toBe(400);
    });

    test('should handle concurrent operations gracefully', async ({ request }) => {
        const user = await createTestUser(request);
        const product = await createTestProduct(request, 'Concurrent Test Product', 30.00);
        
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
        
        // Verify final cart state
        const cartResponse = await request.get(`${API_BASE_URL}/users/${user.id}/cart`);
        const cart = await cartResponse.json();
        
        const productInCart = cart.find(item => item.product_id === product.id);
        expect(productInCart).toBeTruthy();
        expect(productInCart.quantity).toBe(5); // All additions should be accumulated
    });

    test('should validate business rules and constraints', async ({ request }) => {
        // Test invalid order status transitions
        const user = await createTestUser(request);
        const order = await createTestOrder(request, user.id);
        
        // Invalid status
        const invalidStatusResponse = await request.patch(`${API_BASE_URL}/orders/${order.id}/status`, {
            data: { status: 'invalid_status' }
        });
        expect(invalidStatusResponse.status()).toBe(400);
        
        // Test review rating constraints
        const product = await createTestProduct(request);
        
        // Invalid rating (too high)
        const highRatingResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: {
                user_id: user.id,
                rating: 10, // Should be 1-5
                title: 'Invalid rating test'
            }
        });
        expect(highRatingResponse.status()).toBe(400);
        
        // Invalid rating (too low)
        const lowRatingResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: {
                user_id: user.id,
                rating: 0, // Should be 1-5
                title: 'Invalid rating test'
            }
        });
        expect(lowRatingResponse.status()).toBe(400);
        
        // Valid rating should work
        const validRatingResponse = await request.post(`${API_BASE_URL}/products/${product.id}/reviews`, {
            data: {
                user_id: user.id,
                rating: 3,
                title: 'Valid rating test',
                comment: 'This should work fine'
            }
        });
        expect(validRatingResponse.status()).toBe(201);
    });

    test('should handle edge cases and error conditions', async ({ request }) => {
        // Test empty cart checkout
        const user = await createTestUser(request);
        
        const emptyOrderData = {
            user_id: user.id,
            items: [] // Empty items array
        };
        
        const emptyOrderResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: emptyOrderData
        });
        expect(emptyOrderResponse.status()).toBe(400);
        
        // Test non-existent user order
        const nonExistentUserOrder = {
            user_id: 99999,
            items: [{ product_id: 1, quantity: 1 }]
        };
        
        const nonExistentUserResponse = await request.post(`${API_BASE_URL}/orders`, {
            data: nonExistentUserOrder
        });
        expect(nonExistentUserResponse.status()).toBe(400);
        
        // Test extremely long product names and descriptions
        const longNameProduct = {
            sku: `LONG-${Date.now()}`,
            name: 'A'.repeat(300), // Very long name
            description: 'B'.repeat(1000), // Very long description
            price: 50.00
        };
        
        // This should either succeed or fail gracefully with appropriate error
        const longNameResponse = await request.post(`${API_BASE_URL}/products`, {
            data: longNameProduct
        });
        expect([201, 400]).toContain(longNameResponse.status());
        
        // Test SQL injection attempts (should be safely handled)
        const maliciousUser = {
            username: "'; DROP TABLE users; --",
            email: 'hacker@example.com',
            password_hash: 'hashed_password'
        };
        
        const maliciousResponse = await request.post(`${API_BASE_URL}/users`, {
            data: maliciousUser
        });
        // Should either create safely or reject with validation error
        expect([201, 400]).toContain(maliciousResponse.status());
        
        // Verify users table still exists by listing users
        const usersResponse = await request.get(`${API_BASE_URL}/users`);
        expect(usersResponse.status()).toBe(200);
    });
});

// Comprehensive helper functions
async function createTestUser(request, suffix = Date.now()) {
    const userData = {
        username: `testuser_${suffix}`,
        email: `test_${suffix}@example.com`,
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890'
    };
    
    const response = await request.post(`${API_BASE_URL}/users`, { data: userData });
    return await response.json();
}

async function createTestCategory(request, name = `Category ${Date.now()}`) {
    const categoryData = {
        name: name,
        description: `Test category: ${name}`
    };
    
    const response = await request.post(`${API_BASE_URL}/categories`, { data: categoryData });
    return await response.json();
}

async function createTestProduct(request, name = `Product ${Date.now()}`, price = 99.99, categoryId = null) {
    const productData = {
        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: name,
        description: `Test product: ${name}`,
        price: price,
        cost: price * 0.6,
        category_id: categoryId,
        stock_quantity: 100,
        reorder_level: 10
    };
    
    const response = await request.post(`${API_BASE_URL}/products`, { data: productData });
    return await response.json();
}

async function createTestOrder(request, userId, items = null) {
    if (!items) {
        const product = await createTestProduct(request);
        items = [{ product_id: product.id, quantity: 1 }];
    }
    
    const orderData = {
        user_id: userId,
        items: items,
        shipping_address: '123 Test Street, Test City, TC 12345',
        billing_address: '456 Billing Ave, Bill City, BC 67890',
        notes: 'Test order created by automation'
    };
    
    const response = await request.post(`${API_BASE_URL}/orders`, { data: orderData });
    return await response.json();
}