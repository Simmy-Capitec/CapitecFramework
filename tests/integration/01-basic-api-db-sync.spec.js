import { test, expect } from '@playwright/test';
import mysql from 'mysql2/promise';

/**
 * LEVEL 1: BASIC API-DATABASE SYNCHRONIZATION
 * Learning Objectives:
 * - Verify API responses match database state
 * - Understand data flow between API and database
 * - Test basic CRUD operations end-to-end
 * - Validate data consistency between layers
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

test.describe('Level 1: Basic API-Database Synchronization', () => {
    
    test('should verify API users endpoint matches database users table', async ({ request }) => {
        // Fetch users from API
        const apiResponse = await request.get(`${API_BASE_URL}/users`);
        expect(apiResponse.status()).toBe(200);
        const apiUsers = await apiResponse.json();
        
        // Fetch users from database
        const [dbUsers] = await connection.execute(
            'SELECT id, username, email, first_name, last_name, phone, created_at, is_active, last_login FROM users ORDER BY id'
        );
        
        // Compare counts
        expect(apiUsers.length).toBe(dbUsers.length);
        
        // Compare data structure and content
        if (apiUsers.length > 0 && dbUsers.length > 0) {
            for (let i = 0; i < Math.min(apiUsers.length, dbUsers.length); i++) {
                const apiUser = apiUsers[i];
                const dbUser = dbUsers[i];
                
                expect(apiUser.id).toBe(dbUser.id);
                expect(apiUser.username).toBe(dbUser.username);
                expect(apiUser.email).toBe(dbUser.email);
                expect(apiUser.first_name).toBe(dbUser.first_name);
                expect(apiUser.last_name).toBe(dbUser.last_name);
                expect(apiUser.phone).toBe(dbUser.phone);
                expect(apiUser.is_active).toBe(dbUser.is_active);
                
                // API should NOT expose password_hash
                expect(apiUser).not.toHaveProperty('password_hash');
                
                // Dates should be equivalent (allowing for formatting differences)
                if (apiUser.created_at && dbUser.created_at) {
                    const apiDate = new Date(apiUser.created_at);
                    const dbDate = new Date(dbUser.created_at);
                    expect(Math.abs(apiDate.getTime() - dbDate.getTime())).toBeLessThan(1000);
                }
            }
        }
    });

    test('should verify API products endpoint matches database products table', async ({ request }) => {
        // Fetch products from API
        const apiResponse = await request.get(`${API_BASE_URL}/products`);
        expect(apiResponse.status()).toBe(200);
        const apiProducts = await apiResponse.json();
        
        // Fetch products from database with category join (as API does)
        const [dbProducts] = await connection.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id
        `);
        
        expect(apiProducts.length).toBe(dbProducts.length);
        
        if (apiProducts.length > 0 && dbProducts.length > 0) {
            for (let i = 0; i < Math.min(apiProducts.length, dbProducts.length); i++) {
                const apiProduct = apiProducts[i];
                const dbProduct = dbProducts[i];
                
                expect(apiProduct.id).toBe(dbProduct.id);
                expect(apiProduct.sku).toBe(dbProduct.sku);
                expect(apiProduct.name).toBe(dbProduct.name);
                expect(apiProduct.description).toBe(dbProduct.description);
                expect(apiProduct.category_id).toBe(dbProduct.category_id);
                expect(apiProduct.stock_quantity).toBe(dbProduct.stock_quantity);
                expect(apiProduct.reorder_level).toBe(dbProduct.reorder_level);
                expect(apiProduct.is_active).toBe(dbProduct.is_active);
                expect(apiProduct.category_name).toBe(dbProduct.category_name);
                
                // Price comparison (API returns string, DB returns string)
                expect(apiProduct.price).toBe(dbProduct.price);
                expect(parseFloat(apiProduct.price)).toBeGreaterThan(0);
            }
        }
    });

    test('should verify API categories endpoint matches database categories table', async ({ request }) => {
        const apiResponse = await request.get(`${API_BASE_URL}/categories`);
        expect(apiResponse.status()).toBe(200);
        const apiCategories = await apiResponse.json();
        
        const [dbCategories] = await connection.execute('SELECT * FROM categories ORDER BY id');
        
        expect(apiCategories.length).toBe(dbCategories.length);
        
        if (apiCategories.length > 0 && dbCategories.length > 0) {
            for (let i = 0; i < Math.min(apiCategories.length, dbCategories.length); i++) {
                const apiCategory = apiCategories[i];
                const dbCategory = dbCategories[i];
                
                expect(apiCategory.id).toBe(dbCategory.id);
                expect(apiCategory.name).toBe(dbCategory.name);
                expect(apiCategory.description).toBe(dbCategory.description);
                expect(apiCategory.parent_id).toBe(dbCategory.parent_id);
                
                if (apiCategory.created_at && dbCategory.created_at) {
                    const apiDate = new Date(apiCategory.created_at);
                    const dbDate = new Date(dbCategory.created_at);
                    expect(Math.abs(apiDate.getTime() - dbDate.getTime())).toBeLessThan(1000);
                }
            }
        }
    });

    test('should verify API orders endpoint matches database orders table', async ({ request }) => {
        const apiResponse = await request.get(`${API_BASE_URL}/orders`);
        expect(apiResponse.status()).toBe(200);
        const apiOrders = await apiResponse.json();
        
        // Fetch orders from database with user join (as API does)
        const [dbOrders] = await connection.execute(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        
        expect(apiOrders.length).toBe(dbOrders.length);
        
        if (apiOrders.length > 0 && dbOrders.length > 0) {
            for (let i = 0; i < Math.min(apiOrders.length, dbOrders.length); i++) {
                const apiOrder = apiOrders[i];
                const dbOrder = dbOrders[i];
                
                expect(apiOrder.id).toBe(dbOrder.id);
                expect(apiOrder.order_number).toBe(dbOrder.order_number);
                expect(apiOrder.user_id).toBe(dbOrder.user_id);
                expect(apiOrder.status).toBe(dbOrder.status);
                expect(apiOrder.total_amount).toBe(dbOrder.total_amount);
                expect(apiOrder.shipping_address).toBe(dbOrder.shipping_address);
                expect(apiOrder.billing_address).toBe(dbOrder.billing_address);
                expect(apiOrder.notes).toBe(dbOrder.notes);
                expect(apiOrder.username).toBe(dbOrder.username);
                expect(apiOrder.email).toBe(dbOrder.email);
                
                // Verify status is valid
                const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                expect(validStatuses).toContain(apiOrder.status);
            }
        }
    });

    test('should create user via API and verify in database', async ({ request }) => {
        const uniqueId = Date.now();
        const newUser = {
            username: `apitest_${uniqueId}`,
            email: `apitest_${uniqueId}@example.com`,
            password_hash: 'hashed_password_123',
            first_name: 'API',
            last_name: 'Test',
            phone: '+1234567890'
        };
        
        // Create user via API
        const createResponse = await request.post(`${API_BASE_URL}/users`, {
            data: newUser
        });
        expect(createResponse.status()).toBe(201);
        
        const createdUser = await createResponse.json();
        expect(createdUser).toHaveProperty('id');
        expect(createdUser.username).toBe(newUser.username);
        expect(createdUser.email).toBe(newUser.email);
        
        const userId = createdUser.id;
        
        // Verify user exists in database
        const [dbUsers] = await connection.execute(
            'SELECT id, username, email, password_hash, first_name, last_name, phone, is_active FROM users WHERE id = ?',
            [userId]
        );
        
        expect(dbUsers.length).toBe(1);
        
        const dbUser = dbUsers[0];
        expect(dbUser.id).toBe(userId);
        expect(dbUser.username).toBe(newUser.username);
        expect(dbUser.email).toBe(newUser.email);
        expect(dbUser.password_hash).toBe(newUser.password_hash);
        expect(dbUser.first_name).toBe(newUser.first_name);
        expect(dbUser.last_name).toBe(newUser.last_name);
        expect(dbUser.phone).toBe(newUser.phone);
        expect(dbUser.is_active).toBe(1); // Default value
        
        // Cleanup
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    });

    test('should create product via API and verify in database', async ({ request }) => {
        // First create a category
        const categoryResponse = await request.post(`${API_BASE_URL}/categories`, {
            data: {
                name: `API Test Category ${Date.now()}`,
                description: 'Category created via API for testing'
            }
        });
        const category = await categoryResponse.json();
        
        const uniqueId = Date.now();
        const newProduct = {
            sku: `API-TEST-${uniqueId}`,
            name: `API Test Product ${uniqueId}`,
            description: 'Product created via API for testing',
            price: 99.99,
            cost: 60.00,
            category_id: category.id,
            stock_quantity: 50,
            reorder_level: 5
        };
        
        // Create product via API
        const createResponse = await request.post(`${API_BASE_URL}/products`, {
            data: newProduct
        });
        expect(createResponse.status()).toBe(201);
        
        const createdProduct = await createResponse.json();
        expect(createdProduct).toHaveProperty('id');
        expect(createdProduct.sku).toBe(newProduct.sku);
        
        const productId = createdProduct.id;
        
        // Verify product exists in database with exact values
        const [dbProducts] = await connection.execute(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );
        
        expect(dbProducts.length).toBe(1);
        
        const dbProduct = dbProducts[0];
        expect(dbProduct.id).toBe(productId);
        expect(dbProduct.sku).toBe(newProduct.sku);
        expect(dbProduct.name).toBe(newProduct.name);
        expect(dbProduct.description).toBe(newProduct.description);
        expect(parseFloat(dbProduct.price)).toBe(newProduct.price);
        expect(parseFloat(dbProduct.cost)).toBe(newProduct.cost);
        expect(dbProduct.category_id).toBe(newProduct.category_id);
        expect(dbProduct.stock_quantity).toBe(newProduct.stock_quantity);
        expect(dbProduct.reorder_level).toBe(newProduct.reorder_level);
        expect(dbProduct.is_active).toBe(1); // Default value
        
        // Cleanup
        await connection.execute('DELETE FROM products WHERE id = ?', [productId]);
        await connection.execute('DELETE FROM categories WHERE id = ?', [category.id]);
    });

    test('should update user via API and verify changes in database', async ({ request }) => {
        // First create a test user via database
        const uniqueId = Date.now();
        const [insertResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash, first_name, last_name) 
            VALUES (?, ?, ?, ?, ?)
        `, [`dbtest_${uniqueId}`, `dbtest_${uniqueId}@example.com`, 'hashed_password', 'Original', 'Name']);
        
        const userId = insertResult.insertId;
        
        // Update user via API
        const updateData = {
            username: `dbtest_${uniqueId}`, // Keep same username
            email: `dbtest_${uniqueId}@example.com`, // Keep same email
            first_name: 'Updated',
            last_name: 'NewName',
            phone: '+9876543210'
        };
        
        const updateResponse = await request.put(`${API_BASE_URL}/users/${userId}`, {
            data: updateData
        });
        expect(updateResponse.status()).toBe(200);
        
        const updatedUser = await updateResponse.json();
        expect(updatedUser.first_name).toBe('Updated');
        expect(updatedUser.last_name).toBe('NewName');
        expect(updatedUser.phone).toBe('+9876543210');
        
        // Verify changes in database
        const [dbUsers] = await connection.execute(
            'SELECT first_name, last_name, phone, updated_at FROM users WHERE id = ?',
            [userId]
        );
        
        expect(dbUsers.length).toBe(1);
        
        const dbUser = dbUsers[0];
        expect(dbUser.first_name).toBe('Updated');
        expect(dbUser.last_name).toBe('NewName');
        expect(dbUser.phone).toBe('+9876543210');
        expect(dbUser.updated_at).toBeTruthy();
        
        // Cleanup
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    });

    test('should delete user via API and verify removal from database', async ({ request }) => {
        // Create test user via database
        const uniqueId = Date.now();
        const [insertResult] = await connection.execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (?, ?, ?)
        `, [`deletetest_${uniqueId}`, `deletetest_${uniqueId}@example.com`, 'hashed_password']);
        
        const userId = insertResult.insertId;
        
        // Verify user exists in database
        const [beforeDelete] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE id = ?',
            [userId]
        );
        expect(beforeDelete[0].count).toBe(1);
        
        // Delete user via API
        const deleteResponse = await request.delete(`${API_BASE_URL}/users/${userId}`);
        expect(deleteResponse.status()).toBe(204);
        
        // Verify user is deleted from database
        const [afterDelete] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE id = ?',
            [userId]
        );
        expect(afterDelete[0].count).toBe(0);
        
        // Verify API also returns 404 for deleted user
        const fetchResponse = await request.get(`${API_BASE_URL}/users/${userId}`);
        expect(fetchResponse.status()).toBe(404);
    });

    test('should verify single user API response matches database record', async ({ request }) => {
        // Get a user ID from database
        const [dbUsers] = await connection.execute('SELECT id FROM users LIMIT 1');
        
        if (dbUsers.length > 0) {
            const userId = dbUsers[0].id;
            
            // Fetch user from API
            const apiResponse = await request.get(`${API_BASE_URL}/users/${userId}`);
            expect(apiResponse.status()).toBe(200);
            const apiUser = await apiResponse.json();
            
            // Fetch same user from database
            const [dbUserDetails] = await connection.execute(
                'SELECT id, username, email, first_name, last_name, phone, created_at, is_active, last_login FROM users WHERE id = ?',
                [userId]
            );
            
            expect(dbUserDetails.length).toBe(1);
            const dbUser = dbUserDetails[0];
            
            // Compare all fields
            expect(apiUser.id).toBe(dbUser.id);
            expect(apiUser.username).toBe(dbUser.username);
            expect(apiUser.email).toBe(dbUser.email);
            expect(apiUser.first_name).toBe(dbUser.first_name);
            expect(apiUser.last_name).toBe(dbUser.last_name);
            expect(apiUser.phone).toBe(dbUser.phone);
            expect(apiUser.is_active).toBe(dbUser.is_active);
            
            // Verify sensitive data is not exposed
            expect(apiUser).not.toHaveProperty('password_hash');
        }
    });

    test('should verify data type consistency between API and database', async ({ request }) => {
        // Create a comprehensive test record
        const uniqueId = Date.now();
        
        // Create via API to test full round-trip
        const userData = {
            username: `typetest_${uniqueId}`,
            email: `typetest_${uniqueId}@example.com`,
            password_hash: 'hashed_password',
            first_name: 'Type',
            last_name: 'Test',
            phone: '+1234567890'
        };
        
        const createResponse = await request.post(`${API_BASE_URL}/users`, {
            data: userData
        });
        const createdUser = await createResponse.json();
        const userId = createdUser.id;
        
        // Fetch from API
        const apiResponse = await request.get(`${API_BASE_URL}/users/${userId}`);
        const apiUser = await apiResponse.json();
        
        // Fetch from database
        const [dbUsers] = await connection.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        const dbUser = dbUsers[0];
        
        // Verify data types match expectations
        expect(typeof apiUser.id).toBe('number');
        expect(typeof dbUser.id).toBe('number');
        expect(apiUser.id).toBe(dbUser.id);
        
        expect(typeof apiUser.username).toBe('string');
        expect(typeof dbUser.username).toBe('string');
        
        expect(typeof apiUser.email).toBe('string');
        expect(typeof dbUser.email).toBe('string');
        
        expect(typeof apiUser.is_active).toBe('number');
        expect(typeof dbUser.is_active).toBe('number');
        expect([0, 1]).toContain(apiUser.is_active);
        expect([0, 1]).toContain(dbUser.is_active);
        
        // Cleanup
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
    });
});