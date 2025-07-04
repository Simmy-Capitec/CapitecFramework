import { test, expect } from '@playwright/test';

/**
 * LEVEL 3: CREATE OPERATIONS (POST)
 * Learning Objectives:
 * - Create new resources using POST requests
 * - Send JSON payloads
 * - Handle validation errors
 * - Verify created resource structure
 * - Test required vs optional fields
 */

const API_BASE_URL = 'http://localhost:3000';

test.describe('Level 3: Create Operations', () => {
    
    test('should create a new user successfully', async ({ request }) => {
        const newUser = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password_hash: 'hashed_password_123',
            first_name: 'Test',
            last_name: 'User',
            phone: '+1234567890'
        };
        
        const response = await request.post(`${API_BASE_URL}/users`, {
            data: newUser
        });
        
        expect(response.status()).toBe(201);
        
        const createdUser = await response.json();
        
        // Verify the created user structure
        expect(createdUser).toHaveProperty('id');
        expect(createdUser.username).toBe(newUser.username);
        expect(createdUser.email).toBe(newUser.email);
        expect(createdUser.first_name).toBe(newUser.first_name);
        expect(createdUser.last_name).toBe(newUser.last_name);
        expect(createdUser.phone).toBe(newUser.phone);
        expect(createdUser).toHaveProperty('created_at');
        
        // Password hash should not be returned
        expect(createdUser).not.toHaveProperty('password_hash');
        
        // Verify the user was actually created by fetching it
        const fetchResponse = await request.get(`${API_BASE_URL}/users/${createdUser.id}`);
        expect(fetchResponse.status()).toBe(200);
    });

    test('should create a new category successfully', async ({ request }) => {
        const newCategory = {
            name: `Test Category ${Date.now()}`,
            description: 'A test category for automation testing'
        };
        
        const response = await request.post(`${API_BASE_URL}/categories`, {
            data: newCategory
        });
        
        expect(response.status()).toBe(201);
        
        const createdCategory = await response.json();
        expect(createdCategory).toHaveProperty('id');
        expect(createdCategory.name).toBe(newCategory.name);
        expect(createdCategory.description).toBe(newCategory.description);
        expect(createdCategory).toHaveProperty('created_at');
    });

    test('should create a new product successfully', async ({ request }) => {
        // First create a category for the product
        const categoryResponse = await request.post(`${API_BASE_URL}/categories`, {
            data: {
                name: `Product Category ${Date.now()}`,
                description: 'Category for product testing'
            }
        });
        const category = await categoryResponse.json();
        
        const newProduct = {
            sku: `TEST-SKU-${Date.now()}`,
            name: `Test Product ${Date.now()}`,
            description: 'A test product for automation testing',
            price: 99.99,
            cost: 50.00,
            category_id: category.id,
            stock_quantity: 100,
            reorder_level: 10
        };
        
        const response = await request.post(`${API_BASE_URL}/products`, {
            data: newProduct
        });
        
        expect(response.status()).toBe(201);
        
        const createdProduct = await response.json();
        expect(createdProduct).toHaveProperty('id');
        expect(createdProduct.sku).toBe(newProduct.sku);
        expect(createdProduct.name).toBe(newProduct.name);
        expect(createdProduct.description).toBe(newProduct.description);
        expect(parseFloat(createdProduct.price)).toBe(newProduct.price);
        expect(createdProduct.category_id).toBe(newProduct.category_id);
        expect(createdProduct.stock_quantity).toBe(newProduct.stock_quantity);
    });

    test('should validate required fields for user creation', async ({ request }) => {
        // Test missing username
        const incompleteUser = {
            email: 'test@example.com',
            password_hash: 'hashed_password'
        };
        
        const response = await request.post(`${API_BASE_URL}/users`, {
            data: incompleteUser
        });
        
        expect(response.status()).toBe(400);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error).toContain('required');
    });

    test('should validate email format', async ({ request }) => {
        const invalidUser = {
            username: 'testuser',
            email: 'invalid-email-format',
            password_hash: 'hashed_password'
        };
        
        const response = await request.post(`${API_BASE_URL}/users`, {
            data: invalidUser
        });
        
        expect(response.status()).toBe(400);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error.toLowerCase()).toContain('email');
    });

    test('should prevent duplicate usernames', async ({ request }) => {
        const uniqueId = Date.now();
        const userData = {
            username: `duplicate_test_${uniqueId}`,
            email: `unique1_${uniqueId}@example.com`,
            password_hash: 'hashed_password'
        };
        
        // Create first user
        const firstResponse = await request.post(`${API_BASE_URL}/users`, {
            data: userData
        });
        expect(firstResponse.status()).toBe(201);
        
        // Try to create second user with same username
        const duplicateData = {
            ...userData,
            email: `unique2_${uniqueId}@example.com` // Different email
        };
        
        const secondResponse = await request.post(`${API_BASE_URL}/users`, {
            data: duplicateData
        });
        
        expect(secondResponse.status()).toBe(400);
        
        const errorResponse = await secondResponse.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error.toLowerCase()).toContain('exist');
    });

    test('should validate product price constraints', async ({ request }) => {
        const invalidProduct = {
            sku: `INVALID-${Date.now()}`,
            name: 'Invalid Product',
            price: -10.00 // Negative price should be invalid
        };
        
        const response = await request.post(`${API_BASE_URL}/products`, {
            data: invalidProduct
        });
        
        expect(response.status()).toBe(400);
        
        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error.toLowerCase()).toContain('price');
    });

    test('should prevent duplicate SKUs', async ({ request }) => {
        const uniqueId = Date.now();
        const productData = {
            sku: `DUPLICATE-SKU-${uniqueId}`,
            name: `First Product ${uniqueId}`,
            price: 50.00
        };
        
        // Create first product
        const firstResponse = await request.post(`${API_BASE_URL}/products`, {
            data: productData
        });
        expect(firstResponse.status()).toBe(201);
        
        // Try to create second product with same SKU
        const duplicateData = {
            ...productData,
            name: `Second Product ${uniqueId}` // Different name
        };
        
        const secondResponse = await request.post(`${API_BASE_URL}/products`, {
            data: duplicateData
        });
        
        expect(secondResponse.status()).toBe(400);
        
        const errorResponse = await secondResponse.json();
        expect(errorResponse).toHaveProperty('error');
        expect(errorResponse.error.toLowerCase()).toContain('sku');
    });
});