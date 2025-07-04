// E-commerce API server aligned with MySQL database schema
import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
const PORT = 3000;
const SECRET_TOKEN = 'my-secret-token';

app.use(express.json());

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'sqltraining',
    password: 'training123',
    database: 'sql_training',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Helper Functions
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Middleware for authentication
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== SECRET_TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    req.user = { id: 'authenticated_user', roles: ['admin'] };
    next();
};

// =============================================================================
// USERS ENDPOINTS
// =============================================================================

// GET all users
app.get('/users', async (req, res) => {
    try {
        const users = await executeQuery('SELECT id, username, email, first_name, last_name, phone, created_at, is_active, last_login FROM users ORDER BY id');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET single user by id
app.get('/users/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const users = await executeQuery('SELECT id, username, email, first_name, last_name, phone, created_at, is_active, last_login FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(users[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// POST create new user
app.post('/users', async (req, res) => {
    try {
        const { username, email, password_hash, first_name, last_name, phone } = req.body;
        
        if (!username || !email || !password_hash) {
            return res.status(400).json({ error: 'Missing required fields: username, email, password_hash' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Check for duplicate username or email
        const existing = await executeQuery('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        const result = await executeQuery(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, first_name || null, last_name || null, phone || null]
        );
        
        const newUser = await executeQuery('SELECT id, username, email, first_name, last_name, phone, created_at FROM users WHERE id = ?', [result.insertId]);
        res.status(201).json(newUser[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT update user
app.put('/users/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { username, email, first_name, last_name, phone } = req.body;
        
        if (!username || !email) {
            return res.status(400).json({ error: 'Missing required fields: username, email' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Check if user exists
        const existingUser = await executeQuery('SELECT id FROM users WHERE id = ?', [userId]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check for duplicate username/email (excluding current user)
        const duplicates = await executeQuery('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?', [username, email, userId]);
        if (duplicates.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        await executeQuery(
            'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ? WHERE id = ?',
            [username, email, first_name || null, last_name || null, phone || null, userId]
        );
        
        const updatedUser = await executeQuery('SELECT id, username, email, first_name, last_name, phone, created_at FROM users WHERE id = ?', [userId]);
        res.status(200).json(updatedUser[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        
        const result = await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// =============================================================================
// CATEGORIES ENDPOINTS
// =============================================================================

// GET all categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await executeQuery('SELECT * FROM categories ORDER BY id');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET single category
app.get('/categories/:id', async (req, res) => {
    try {
        const categoryId = Number(req.params.id);
        const categories = await executeQuery('SELECT * FROM categories WHERE id = ?', [categoryId]);
        
        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.status(200).json(categories[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// POST create category
app.post('/categories', async (req, res) => {
    try {
        const { name, description, parent_id } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Missing required field: name' });
        }
        
        const result = await executeQuery(
            'INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)',
            [name, description || null, parent_id || null]
        );
        
        const newCategory = await executeQuery('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json(newCategory[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// =============================================================================
// PRODUCTS ENDPOINTS
// =============================================================================

// GET all products
app.get('/products', async (req, res) => {
    try {
        let query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE 1=1
        `;
        const params = [];
        
        // Filter by category
        if (req.query.category_id) {
            query += ' AND p.category_id = ?';
            params.push(Number(req.query.category_id));
        }
        
        // Filter by active status
        if (req.query.is_active !== undefined) {
            query += ' AND p.is_active = ?';
            params.push(req.query.is_active === 'true' ? 1 : 0);
        }
        
        // Search by name
        if (req.query.search) {
            query += ' AND p.name LIKE ?';
            params.push(`%${req.query.search}%`);
        }
        
        query += ' ORDER BY p.id';
        
        const products = await executeQuery(query, params);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET single product
app.get('/products/:id', async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const products = await executeQuery(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        `, [productId]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.status(200).json(products[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST create product
app.post('/products', async (req, res) => {
    try {
        const { sku, name, description, price, cost, category_id, stock_quantity, reorder_level } = req.body;
        
        if (!sku || !name || !price) {
            return res.status(400).json({ error: 'Missing required fields: sku, name, price' });
        }
        
        if (price <= 0) {
            return res.status(400).json({ error: 'Price must be greater than 0' });
        }
        
        // Check for duplicate SKU
        const existingSku = await executeQuery('SELECT id FROM products WHERE sku = ?', [sku]);
        if (existingSku.length > 0) {
            return res.status(400).json({ error: 'SKU already exists' });
        }
        
        const result = await executeQuery(`
            INSERT INTO products (sku, name, description, price, cost, category_id, stock_quantity, reorder_level) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [sku, name, description || null, price, cost || null, category_id || null, stock_quantity || 0, reorder_level || 10]);
        
        const newProduct = await executeQuery('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json(newProduct[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// =============================================================================
// ORDERS ENDPOINTS
// =============================================================================

// GET all orders
app.get('/orders', async (req, res) => {
    try {
        let query = `
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];
        
        // Filter by user
        if (req.query.user_id) {
            query += ' AND o.user_id = ?';
            params.push(Number(req.query.user_id));
        }
        
        // Filter by status
        if (req.query.status) {
            query += ' AND o.status = ?';
            params.push(req.query.status);
        }
        
        query += ' ORDER BY o.created_at DESC';
        
        const orders = await executeQuery(query, params);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET single order with items
app.get('/orders/:id', async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        
        // Get order details
        const orders = await executeQuery(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [orderId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get order items
        const orderItems = await executeQuery(`
            SELECT oi.*, p.name as product_name, p.sku 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        `, [orderId]);
        
        const order = orders[0];
        order.items = orderItems;
        
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// POST create order
app.post('/orders', async (req, res) => {
    try {
        const { user_id, items, shipping_address, billing_address, notes } = req.body;
        
        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields: user_id, items (array)' });
        }
        
        // Verify user exists
        const user = await executeQuery('SELECT id FROM users WHERE id = ?', [user_id]);
        if (user.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            if (!item.product_id || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ error: 'Invalid item: must have product_id and positive quantity' });
            }
            
            const product = await executeQuery('SELECT price FROM products WHERE id = ?', [item.product_id]);
            if (product.length === 0) {
                return res.status(400).json({ error: `Product ${item.product_id} not found` });
            }
            
            const unitPrice = product[0].price;
            const itemTotal = unitPrice * item.quantity;
            totalAmount += itemTotal;
        }
        
        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Create order
        const orderResult = await executeQuery(`
            INSERT INTO orders (order_number, user_id, status, total_amount, shipping_address, billing_address, notes) 
            VALUES (?, ?, 'pending', ?, ?, ?, ?)
        `, [orderNumber, user_id, totalAmount, shipping_address || null, billing_address || null, notes || null]);
        
        const orderId = orderResult.insertId;
        
        // Create order items
        for (const item of items) {
            const product = await executeQuery('SELECT price FROM products WHERE id = ?', [item.product_id]);
            const unitPrice = product[0].price;
            const totalPrice = unitPrice * item.quantity;
            
            await executeQuery(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                VALUES (?, ?, ?, ?, ?)
            `, [orderId, item.product_id, item.quantity, unitPrice, totalPrice]);
        }
        
        // Return created order with items
        const newOrder = await executeQuery('SELECT * FROM orders WHERE id = ?', [orderId]);
        const orderItems = await executeQuery(`
            SELECT oi.*, p.name as product_name, p.sku 
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        `, [orderId]);
        
        newOrder[0].items = orderItems;
        res.status(201).json(newOrder[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// PATCH update order status
app.patch('/orders/:id/status', async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;
        
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }
        
        const result = await executeQuery('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const updatedOrder = await executeQuery('SELECT * FROM orders WHERE id = ?', [orderId]);
        res.status(200).json(updatedOrder[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// =============================================================================
// CART ENDPOINTS
// =============================================================================

// GET user's cart
app.get('/users/:userId/cart', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        
        const cartItems = await executeQuery(`
            SELECT ci.*, p.name, p.price, p.sku, (ci.quantity * p.price) as total_price
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ?
        `, [userId]);
        
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// POST add item to cart
app.post('/users/:userId/cart', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const { product_id, quantity } = req.body;
        
        if (!product_id || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Missing or invalid fields: product_id, quantity' });
        }
        
        // Check if item already exists in cart
        const existing = await executeQuery('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, product_id]);
        
        if (existing.length > 0) {
            // Update quantity
            await executeQuery('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity, userId, product_id]);
        } else {
            // Add new item
            await executeQuery('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, quantity]);
        }
        
        const cartItems = await executeQuery(`
            SELECT ci.*, p.name, p.price, p.sku, (ci.quantity * p.price) as total_price
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ?
        `, [userId]);
        
        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// =============================================================================
// REVIEWS ENDPOINTS
// =============================================================================

// GET product reviews
app.get('/products/:productId/reviews', async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        
        const reviews = await executeQuery(`
            SELECT r.*, u.username 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = ? 
            ORDER BY r.created_at DESC
        `, [productId]);
        
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST create review
app.post('/products/:productId/reviews', async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        const { user_id, rating, title, comment } = req.body;
        
        if (!user_id || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Missing or invalid fields: user_id, rating (1-5)' });
        }
        
        const result = await executeQuery(`
            INSERT INTO reviews (product_id, user_id, rating, title, comment) 
            VALUES (?, ?, ?, ?, ?)
        `, [productId, user_id, rating, title || null, comment || null]);
        
        const newReview = await executeQuery(`
            SELECT r.*, u.username 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [result.insertId]);
        
        res.status(201).json(newReview[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// =============================================================================
// UTILITY ENDPOINTS
// =============================================================================

// GET secure data (requires authentication)
app.get('/secure-data', authenticate, (req, res) => {
    res.status(200).json({ message: 'This is secure data, access granted.', user: req.user });
});

// GET slow response (simulates delay)
app.get('/slow-response', (req, res) => {
    setTimeout(() => {
        res.status(200).json({ message: 'This took 2 seconds!' });
    }, 2000);
});

// GET text response (returns plain text)
app.get('/text-response', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('This is a plain text response.');
});

// GET internal error (always returns 500)
app.get('/internal-error', (req, res) => {
    console.error('[Simulated Error] An unexpected issue occurred.');
    res.status(500).json({ error: 'Internal Server Error (Simulated)' });
});

// =============================================================================
// GEMINI CREATIVE ENDPOINTS
// =============================================================================

// GET potential escape risks
app.get('/api/creative/escape-risks', async (req, res) => {
    try {
        const query = `
            WITH AtRiskHabitats AS (
                SELECT habitat_id
                FROM habitats
                WHERE habitat_type = 'Outdoor' OR (temp_range_high - temp_range_low) > 20
            )
            SELECT
                a.name AS AnimalName,
                a.species,
                a.weight_kg,
                h.habitat_name AS HabitatName,
                h.habitat_type
            FROM
                animals a
            JOIN
                habitats h ON a.habitat_id = h.habitat_id
            WHERE
                a.weight_kg < 10
                AND a.habitat_id IN (SELECT habitat_id FROM AtRiskHabitats);
        `;
        const results = await executeQuery(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch escape risks' });
    }
});

// GET potential animal friends
app.get('/api/creative/friendship-candidates', async (req, res) => {
    try {
        const query = `
            SELECT
                a1.name AS Animal1,
                a1.species,
                h1.habitat_name AS Habitat1,
                a2.name AS Animal2,
                h2.habitat_name AS Habitat2
            FROM
                animals a1
            JOIN
                animals a2 ON a1.species = a2.species AND a1.animal_id < a2.animal_id
            JOIN
                habitats h1 ON a1.habitat_id = h1.habitat_id
            JOIN
                habitats h2 ON a2.habitat_id = h2.habitat_id
            WHERE
                a1.habitat_id != a2.habitat_id;
        `;
        const results = await executeQuery(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch friendship candidates' });
    }
});

// GET the "A-Team"
app.get('/api/creative/a-team', async (req, res) => {
    try {
        const query = `
            SELECT
                vet.first_name AS Veterinarian,
                trainer.first_name AS Trainer,
                caretaker.first_name AS Caretaker
            FROM
                staff vet
            CROSS JOIN
                staff trainer
            CROSS JOIN
                staff caretaker
            WHERE
                vet.role = 'Veterinarian'
                AND trainer.role = 'Trainer'
                AND caretaker.role = 'Caretaker'
                AND vet.staff_id != trainer.staff_id
                AND vet.staff_id != caretaker.staff_id
                AND trainer.staff_id != caretaker.staff_id;
        `;
        const results = await executeQuery(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to assemble the A-Team' });
    }
});

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
    console.log(`E-commerce API server running on http://localhost:${PORT}`);
    console.log('--- E-commerce Resources ---');
    console.log('  /users (CRUD - User management)');
    console.log('  /categories (CRUD - Product categories)');
    console.log('  /products (CRUD, Filter, Search - Product catalog)');
    console.log('  /orders (CRUD, Filter - Order management)');
    console.log('  /users/:userId/cart (Cart management)');
    console.log('  /products/:productId/reviews (Product reviews)');
    console.log('--- Utility ---');
    console.log('  /secure-data (GET, Auth Required)');
    console.log('  /slow-response (GET, 2s Delay)');
    console.log('  /text-response (GET, Plain Text)');
    console.log('  /internal-error (GET, Always 500)');
    console.log('--- Database Aligned with MySQL sql_training schema ---');
});