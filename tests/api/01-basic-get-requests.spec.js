import { test, expect } from '@playwright/test';

/**
 * LEVEL 1: BASIC GET REQUESTS
 * Learning Objectives:
 * - Understand basic HTTP GET requests
 * - Verify response status codes
 * - Check response data structure
 * - Handle JSON responses
 */

const API_BASE_URL = 'http://localhost:3000';

test.describe('Level 1: Basic GET Requests', () => {
    
    test('should fetch all users successfully', async ({ request }) => {
        // Make GET request to users endpoint
        const response = await request.get(`${API_BASE_URL}/users`);
        
        // Verify successful response
        expect(response.status()).toBe(200);
        
        // Parse JSON response
        const users = await response.json();
        
        // Verify response is an array
        expect(Array.isArray(users)).toBe(true);
        
        // If users exist, verify basic structure
        if (users.length > 0) {
            expect(users[0]).toHaveProperty('id');
            expect(users[0]).toHaveProperty('username');
            expect(users[0]).toHaveProperty('email');
        }
    });

    test('should fetch all products successfully', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/products`);
        
        expect(response.status()).toBe(200);
        
        const products = await response.json();
        expect(Array.isArray(products)).toBe(true);
        
        if (products.length > 0) {
            expect(products[0]).toHaveProperty('id');
            expect(products[0]).toHaveProperty('name');
            expect(products[0]).toHaveProperty('price');
            expect(products[0]).toHaveProperty('sku');
        }
    });

    test('should fetch all categories successfully', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/categories`);
        
        expect(response.status()).toBe(200);
        
        const categories = await response.json();
        expect(Array.isArray(categories)).toBe(true);
        
        if (categories.length > 0) {
            expect(categories[0]).toHaveProperty('id');
            expect(categories[0]).toHaveProperty('name');
        }
    });

    test('should fetch all orders successfully', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/orders`);
        
        expect(response.status()).toBe(200);
        
        const orders = await response.json();
        expect(Array.isArray(orders)).toBe(true);
        
        if (orders.length > 0) {
            expect(orders[0]).toHaveProperty('id');
            expect(orders[0]).toHaveProperty('order_number');
            expect(orders[0]).toHaveProperty('user_id');
            expect(orders[0]).toHaveProperty('status');
        }
    });

    test('should handle non-existent endpoint gracefully', async ({ request }) => {
        const response = await request.get(`${API_BASE_URL}/nonexistent`);
        
        // Should return 404 for non-existent endpoints
        expect(response.status()).toBe(404);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
    });
});