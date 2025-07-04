import { test, expect } from '@playwright/test';

/**
 * LEVEL 4: ADVANCED OPERATIONS
 * Learning Objectives:
 * - Update operations (PUT/PATCH)
 * - Delete operations
 * - Complex data relationships
 * - Cart management
 * - Order creation with multiple items
 * - Query parameters and filtering
 */

const API_BASE_URL = 'http://localhost:3000';

test.describe('Level 4: Advanced Operations', () => {
    
    test('should update user information', async ({ request }) => {
        // First create a user to update
        const newUser = {
            username: `updatetest_${Date.now()}`,
            email: `update_${Date.now()}@example.com`,
            password_hash: 'hashed_password',
            first_name: 'Original',
            last_name: 'Name'
        };
        
        const createResponse = await request.post(`${API_BASE_URL}/users`, {
            data: newUser
        });
        const createdUser = await createResponse.json();
        
        // Update the user
        const updatedData = {
            username: createdUser.username, // Keep same username
            email: createdUser.email, // Keep same email
            first_name: 'Updated',
            last_name: 'NewName',
            phone: '+1987654321'
        };
        
        const updateResponse = await request.put(`${API_BASE_URL}/users/${createdUser.id}`, {
            data: updatedData
        });
        
        expect(updateResponse.status()).toBe(200);
        
        const updatedUser = await updateResponse.json();
        expect(updatedUser.first_name).toBe('Updated');
        expect(updatedUser.last_name).toBe('NewName');
        expect(updatedUser.phone).toBe('+1987654321');
    });

    test('should update order status using PATCH', async ({ request }) => {
        // First create a user and order to update
        const user = await createTestUser(request);
        const order = await createTestOrder(request, user.id);
        
        // Verify order was created successfully
        expect(order.id).toBeDefined();
        
        // Update order status
        const statusUpdate = { status: 'processing' };
        
        const response = await request.patch(`${API_BASE_URL}/orders/${order.id}/status`, {
            data: statusUpdate
        });
        
        expect(response.status()).toBe(200);
        
        const updatedOrder = await response.json();
        expect(updatedOrder.status).toBe('processing');
    });

    test('should delete a user', async ({ request }) => {
        // Create a user to delete
        const user = await createTestUser(request);
        
        // Delete the user
        const deleteResponse = await request.delete(`${API_BASE_URL}/users/${user.id}`);
        expect(deleteResponse.status()).toBe(204);
        
        // Verify user is deleted
        const fetchResponse = await request.get(`${API_BASE_URL}/users/${user.id}`);
        expect(fetchResponse.status()).toBe(404);
    });

    test('should manage shopping cart operations', async ({ request }) => {
        // Create test data
        const user = await createTestUser(request);
        const product = await createTestProduct(request);
        
        // Add item to cart
        const cartItem = {
            product_id: product.id,
            quantity: 3
        };
        
        const addResponse = await request.post(`${API_BASE_URL}/users/${user.id}/cart`, {
            data: cartItem
        });
        
        expect(addResponse.status()).toBe(200);
        
        const cart = await addResponse.json();
        expect(Array.isArray(cart)).toBe(true);
        expect(cart.length).toBeGreaterThan(0);
        
        const addedItem = cart.find(item => item.product_id === product.id);
        expect(addedItem).toBeTruthy();
        expect(addedItem.quantity).toBe(3);
        expect(addedItem.name).toBe(product.name);
        expect(parseFloat(addedItem.total_price)).toBeCloseTo(parseFloat(product.price) * 3, 2);
        
        // Get cart items
        const getCartResponse = await request.get(`${API_BASE_URL}/users/${user.id}/cart`);
        expect(getCartResponse.status()).toBe(200);
        
        const cartItems = await getCartResponse.json();
        expect(cartItems.length).toBe(cart.length);
    });

    test('should create complex order with multiple items', async ({ request }) => {
        // Create test data
        const user = await createTestUser(request);
        const product1 = await createTestProduct(request, 'Product 1', 10.00);
        const product2 = await createTestProduct(request, 'Product 2', 25.50);
        
        // Create order with multiple items
        const orderData = {
            user_id: user.id,
            items: [
                { product_id: product1.id, quantity: 2 },
                { product_id: product2.id, quantity: 1 }
            ],
            shipping_address: '123 Test St, Test City, TC 12345',
            billing_address: '456 Bill Ave, Bill City, BC 67890',
            notes: 'Test order for automation'
        };
        
        const response = await request.post(`${API_BASE_URL}/orders`, {
            data: orderData
        });
        
        expect(response.status()).toBe(201);
        
        const order = await response.json();
        
        // Verify order structure
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('order_number');
        expect(order.user_id).toBe(user.id);
        expect(order.status).toBe('pending');
        expect(order.shipping_address).toBe(orderData.shipping_address);
        expect(order.notes).toBe(orderData.notes);
        
        // Verify order items
        expect(order.items).toBeDefined();
        expect(order.items.length).toBe(2);
        
        // Verify total calculation
        const expectedTotal = (10.00 * 2) + (25.50 * 1);
        expect(parseFloat(order.total_amount)).toBe(expectedTotal);
        
        // Verify individual items
        const item1 = order.items.find(item => item.product_id === product1.id);
        expect(item1.quantity).toBe(2);
        expect(parseFloat(item1.unit_price)).toBe(10.00);
        expect(parseFloat(item1.total_price)).toBe(20.00);
        
        const item2 = order.items.find(item => item.product_id === product2.id);
        expect(item2.quantity).toBe(1);
        expect(parseFloat(item2.unit_price)).toBe(25.50);
        expect(parseFloat(item2.total_price)).toBe(25.50);
    });

    test('should filter products by category', async ({ request }) => {
        // Create test category and products
        const uniqueId = Date.now();
        const category1 = await createTestCategory(request, `Test Electronics ${uniqueId}`);
        const category2 = await createTestCategory(request, `Test Books ${uniqueId}`);
        
        const electronicsProduct = await createTestProduct(request, 'Laptop', 999.99, category1.id);
        const bookProduct = await createTestProduct(request, 'JavaScript Guide', 29.99, category2.id);
        
        // Filter products by category
        const response = await request.get(`${API_BASE_URL}/products?category_id=${category1.id}`);
        expect(response.status()).toBe(200);
        
        const filteredProducts = await response.json();
        
        // Verify we get some results
        expect(Array.isArray(filteredProducts)).toBe(true);
        
        // Verify all products belong to the requested category (if any returned)
        filteredProducts.forEach(product => {
            expect(product.category_id).toBe(category1.id);
        });
        
        // Verify our test product is included
        const foundProduct = filteredProducts.find(p => p.id === electronicsProduct.id);
        expect(foundProduct).toBeTruthy();
        expect(foundProduct.name).toContain('Laptop');
    });

    test('should filter orders by status', async ({ request }) => {
        // Create test data
        const user = await createTestUser(request);
        const product = await createTestProduct(request);
        
        // Create orders with different statuses
        const pendingOrder = await createTestOrder(request, user.id, [{ product_id: product.id, quantity: 1 }]);
        
        // Verify order was created
        expect(pendingOrder.id).toBeDefined();
        
        // Update one order to processing status
        const statusResponse = await request.patch(`${API_BASE_URL}/orders/${pendingOrder.id}/status`, {
            data: { status: 'processing' }
        });
        expect(statusResponse.status()).toBe(200);
        
        // Filter orders by status
        const response = await request.get(`${API_BASE_URL}/orders?status=processing`);
        expect(response.status()).toBe(200);
        
        const processingOrders = await response.json();
        
        // Verify we get results
        expect(Array.isArray(processingOrders)).toBe(true);
        
        // Verify all orders have processing status
        processingOrders.forEach(order => {
            expect(order.status).toBe('processing');
        });
        
        // Verify our test order is included
        const foundOrder = processingOrders.find(o => o.id === pendingOrder.id);
        expect(foundOrder).toBeTruthy();
        expect(foundOrder.status).toBe('processing');
    });

    test('should search products by name', async ({ request }) => {
        // Create test products with different names
        const searchableProduct = await createTestProduct(request, 'Special Searchable Item', 50.00);
        const normalProduct = await createTestProduct(request, 'Regular Product', 30.00);
        
        // Search for products
        const response = await request.get(`${API_BASE_URL}/products?search=Searchable`);
        expect(response.status()).toBe(200);
        
        const searchResults = await response.json();
        
        // Verify search results contain our searchable product
        const foundProduct = searchResults.find(p => p.id === searchableProduct.id);
        expect(foundProduct).toBeTruthy();
        
        // Verify all results contain the search term
        searchResults.forEach(product => {
            expect(product.name.toLowerCase()).toContain('searchable');
        });
    });
});

// Helper functions for creating test data
async function createTestUser(request, suffix = Date.now()) {
    const userData = {
        username: `testuser_${suffix}`,
        email: `test_${suffix}@example.com`,
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
    };
    
    const response = await request.post(`${API_BASE_URL}/users`, { data: userData });
    
    if (response.status() !== 201) {
        console.error('Failed to create user:', response.status(), await response.text());
        throw new Error(`Failed to create user: ${response.status()}`);
    }
    
    return await response.json();
}

async function createTestCategory(request, name = `Category ${Date.now()}`) {
    const categoryData = {
        name: name,
        description: `Test category: ${name}`
    };
    
    const response = await request.post(`${API_BASE_URL}/categories`, { data: categoryData });
    
    if (response.status() !== 201) {
        console.error('Failed to create category:', response.status(), await response.text());
        throw new Error(`Failed to create category: ${response.status()}`);
    }
    
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
        stock_quantity: 100
    };
    
    const response = await request.post(`${API_BASE_URL}/products`, { data: productData });
    
    if (response.status() !== 201) {
        console.error('Failed to create product:', response.status(), await response.text());
        throw new Error(`Failed to create product: ${response.status()}`);
    }
    
    return await response.json();
}

async function createTestOrder(request, userId, items = null) {
    if (!items) {
        // Create a default product for the order
        const product = await createTestProduct(request);
        items = [{ product_id: product.id, quantity: 1 }];
    }
    
    const orderData = {
        user_id: userId,
        items: items,
        shipping_address: '123 Test Street, Test City',
        notes: 'Test order'
    };
    
    const response = await request.post(`${API_BASE_URL}/orders`, { data: orderData });
    
    if (response.status() !== 201) {
        console.error('Failed to create order:', response.status(), await response.text());
        throw new Error(`Failed to create order: ${response.status()}`);
    }
    
    return await response.json();
}