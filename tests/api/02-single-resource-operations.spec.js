import { test, expect } from '@playwright/test';

/**
 * LEVEL 2: SINGLE RESOURCE OPERATIONS
 * Learning Objectives:
 * - Fetch individual resources by ID
 * - Handle missing resources (404 errors)
 * - Validate detailed response structure
 * - Test edge cases with invalid IDs
 */

const API_BASE_URL = 'http://localhost:3000';

test.describe('Level 2: Single Resource Operations', () => {
    
    test('should fetch a single user by ID', async ({ request }) => {
        // First, get all users to find a valid ID
        const usersResponse = await request.get(`${API_BASE_URL}/users`);
        const users = await usersResponse.json();
        
        if (users.length > 0) {
            const userId = users[0].id;
            
            // Fetch single user
            const response = await request.get(`${API_BASE_URL}/users/${userId}`);
            expect(response.status()).toBe(200);
            
            const user = await response.json();
            
            // Verify detailed user structure
            expect(user).toHaveProperty('id', userId);
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('email');
            expect(user).toHaveProperty('first_name');
            expect(user).toHaveProperty('last_name');
            expect(user).toHaveProperty('phone');
            expect(user).toHaveProperty('created_at');
            expect(user).toHaveProperty('is_active');
            
            // Validate data types
            expect(typeof user.id).toBe('number');
            expect(typeof user.username).toBe('string');
            expect(typeof user.email).toBe('string');
        }
    });

    test('should fetch a single product by ID', async ({ request }) => {
        const productsResponse = await request.get(`${API_BASE_URL}/products`);
        const products = await productsResponse.json();
        
        if (products.length > 0) {
            const productId = products[0].id;
            
            const response = await request.get(`${API_BASE_URL}/products/${productId}`);
            expect(response.status()).toBe(200);
            
            const product = await response.json();
            
            // Verify detailed product structure
            expect(product).toHaveProperty('id', productId);
            expect(product).toHaveProperty('sku');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('description');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('cost');
            expect(product).toHaveProperty('category_id');
            expect(product).toHaveProperty('stock_quantity');
            expect(product).toHaveProperty('reorder_level');
            expect(product).toHaveProperty('is_active');
            expect(product).toHaveProperty('created_at');
            expect(product).toHaveProperty('updated_at');
            
            // Validate critical data types and constraints
            expect(typeof product.price).toBe('string'); // Decimal comes as string from DB
            expect(parseFloat(product.price)).toBeGreaterThan(0);
            expect(typeof product.stock_quantity).toBe('number');
        }
    });

    test('should return 404 for non-existent user', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/users/99999`);
        
        expect(response.status()).toBe(404);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error).toContain('not found');
    });

    test('should return 404 for non-existent product', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/products/99999`);
        
        expect(response.status()).toBe(404);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error).toContain('not found');
    });

    test('should handle invalid ID formats gracefully', async ({ request }) => {
        // Test with non-numeric ID
        const response = await request.get(`${API_BASE_URL}/users/invalid-id`);
        
        // Should either return 404 or handle gracefully
        expect([404, 400]).toContain(response.status());
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
    });

    test('should fetch order with detailed information', async ({ request }) => {
        const ordersResponse = await request.get(`${API_BASE_URL}/orders`);
        const orders = await ordersResponse.json();
        
        if (orders.length > 0) {
            const orderId = orders[0].id;
            
            const response = await request.get(`${API_BASE_URL}/orders/${orderId}`);
            expect(response.status()).toBe(200);
            
            const order = await response.json();
            
            // Verify order structure
            expect(order).toHaveProperty('id', orderId);
            expect(order).toHaveProperty('order_number');
            expect(order).toHaveProperty('user_id');
            expect(order).toHaveProperty('status');
            expect(order).toHaveProperty('total_amount');
            expect(order).toHaveProperty('items'); // Should include order items
            
            // Validate order items structure
            if (order.items && order.items.length > 0) {
                const item = order.items[0];
                expect(item).toHaveProperty('product_id');
                expect(item).toHaveProperty('quantity');
                expect(item).toHaveProperty('unit_price');
                expect(item).toHaveProperty('total_price');
                expect(item).toHaveProperty('product_name');
            }
        }
    });
});