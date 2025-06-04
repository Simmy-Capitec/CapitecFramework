-- SQL Zero-to-Hero Module: Quick Start Database Setup
-- This script creates a sample e-commerce database for learning SQL

-- Create and use the database
DROP DATABASE IF EXISTS sql_training;
CREATE DATABASE sql_training;
USE sql_training;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2),
    category_id INT,
    stock_quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_sku (sku),
    INDEX idx_name (name),
    INDEX idx_category (category_id)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    shipped_at DATETIME,
    delivered_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product_rating (product_id, rating),
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Shopping cart table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Audit log table (for testing triggers and tracking changes)
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(10) NOT NULL,
    user_id INT,
    old_values JSON,
    new_values JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id)
);

-- Insert sample data

-- Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Physical and digital books'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports & Outdoors', 'Sporting goods and outdoor equipment');

INSERT INTO categories (name, description, parent_id) VALUES
('Laptops', 'Portable computers', 1),
('Smartphones', 'Mobile phones', 1),
('Men\'s Clothing', 'Clothing for men', 2),
('Women\'s Clothing', 'Clothing for women', 2),
('Fiction', 'Fiction books', 3),
('Non-Fiction', 'Non-fiction books', 3);

-- Users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone) VALUES
('johndoe', 'john.doe@email.com', 'hash123', 'John', 'Doe', '555-0101'),
('janesmith', 'jane.smith@email.com', 'hash456', 'Jane', 'Smith', '555-0102'),
('bobwilson', 'bob.wilson@email.com', 'hash789', 'Bob', 'Wilson', '555-0103'),
('alicebrown', 'alice.brown@email.com', 'hash012', 'Alice', 'Brown', '555-0104'),
('charlieclark', 'charlie.clark@email.com', 'hash345', 'Charlie', 'Clark', '555-0105'),
('testuser1', 'test1@example.com', 'hash111', 'Test', 'User1', '555-0201'),
('testuser2', 'test2@example.com', 'hash222', 'Test', 'User2', '555-0202'),
('testuser3', 'test3@example.com', 'hash333', 'Test', 'User3', '555-0203');

-- Products
INSERT INTO products (sku, name, description, price, cost, category_id, stock_quantity, reorder_level) VALUES
-- Electronics
('LAP001', 'Dell XPS 13', 'Ultra-thin laptop with Intel i7', 1299.99, 900.00, 6, 15, 5),
('LAP002', 'MacBook Pro 14"', 'Apple M3 Pro chip laptop', 1999.99, 1400.00, 6, 10, 3),
('PHN001', 'iPhone 15', 'Latest Apple smartphone', 999.99, 700.00, 7, 25, 10),
('PHN002', 'Samsung Galaxy S24', 'Android flagship phone', 899.99, 600.00, 7, 20, 8),
('PHN003', 'Google Pixel 8', 'Google\'s AI-powered phone', 699.99, 500.00, 7, 18, 7),

-- Clothing
('MCL001', 'Classic Fit Jeans', 'Comfortable denim jeans', 59.99, 25.00, 8, 50, 20),
('MCL002', 'Cotton T-Shirt', 'Basic cotton t-shirt', 19.99, 8.00, 8, 100, 40),
('WCL001', 'Summer Dress', 'Floral print summer dress', 79.99, 35.00, 9, 30, 15),
('WCL002', 'Yoga Pants', 'Stretchy workout pants', 49.99, 20.00, 9, 45, 20),

-- Books
('BKF001', 'The Great Adventure', 'Bestselling fiction novel', 24.99, 10.00, 10, 60, 25),
('BKF002', 'Mystery at Midnight', 'Thrilling mystery novel', 19.99, 8.00, 10, 40, 15),
('BKN001', 'SQL Mastery', 'Complete guide to SQL', 49.99, 20.00, 11, 35, 10),
('BKN002', 'Test Automation Guide', 'Learn test automation', 39.99, 15.00, 11, 25, 10),

-- Home & Garden
('HOM001', 'Smart LED Bulb', 'WiFi connected light bulb', 29.99, 12.00, 4, 80, 30),
('HOM002', 'Garden Hose 50ft', 'Durable garden hose', 39.99, 18.00, 4, 25, 10),

-- Sports
('SPT001', 'Yoga Mat', 'Non-slip exercise mat', 34.99, 15.00, 5, 40, 15),
('SPT002', 'Dumbbells Set', '5-25 lb adjustable weights', 199.99, 120.00, 5, 15, 5),
('SPT003', 'Running Shoes', 'Professional running shoes', 129.99, 70.00, 5, 35, 12);

-- Orders
INSERT INTO orders (order_number, user_id, status, total_amount, shipping_address, billing_address) VALUES
('ORD-2024-001', 1, 'delivered', 1324.98, '123 Main St, City, State 12345', '123 Main St, City, State 12345'),
('ORD-2024-002', 2, 'shipped', 79.98, '456 Oak Ave, Town, State 23456', '456 Oak Ave, Town, State 23456'),
('ORD-2024-003', 1, 'processing', 234.97, '123 Main St, City, State 12345', '123 Main St, City, State 12345'),
('ORD-2024-004', 3, 'pending', 999.99, '789 Pine Rd, Village, State 34567', '789 Pine Rd, Village, State 34567'),
('ORD-2024-005', 4, 'delivered', 169.97, '321 Elm St, Metro, State 45678', '321 Elm St, Metro, State 45678'),
('ORD-2024-006', 2, 'cancelled', 49.99, '456 Oak Ave, Town, State 23456', '456 Oak Ave, Town, State 23456'),
('ORD-2024-007', 5, 'pending', 89.98, '654 Maple Dr, Suburb, State 56789', '654 Maple Dr, Suburb, State 56789');

-- Order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
-- Order 1 items
(1, 1, 1, 1299.99, 1299.99),
(1, 10, 1, 24.99, 24.99),

-- Order 2 items
(2, 6, 1, 59.99, 59.99),
(2, 7, 1, 19.99, 19.99),

-- Order 3 items
(3, 16, 1, 34.99, 34.99),
(3, 17, 1, 199.99, 199.99),

-- Order 4 items
(4, 3, 1, 999.99, 999.99),

-- Order 5 items
(5, 9, 2, 49.99, 99.98),
(5, 11, 2, 19.99, 39.98),
(5, 14, 1, 29.99, 29.99),

-- Order 7 items
(7, 10, 1, 24.99, 24.99),
(7, 11, 1, 19.99, 19.99),
(7, 12, 1, 49.99, 49.99);

-- Reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase) VALUES
(1, 1, 5, 'Excellent laptop!', 'Fast, lightweight, and great battery life.', TRUE),
(1, 2, 4, 'Good but pricey', 'Great performance but expensive.', FALSE),
(3, 4, 5, 'Best phone ever', 'Amazing camera and battery life.', TRUE),
(6, 2, 5, 'Perfect fit', 'Comfortable and looks great.', TRUE),
(10, 1, 4, 'Good read', 'Engaging story, well written.', TRUE),
(12, 3, 5, 'Must-have for developers', 'Comprehensive SQL guide.', FALSE),
(16, 5, 3, 'Decent quality', 'Good for beginners, not for professionals.', TRUE);

-- Cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 4, 1),
(1, 8, 2),
(2, 2, 1),
(3, 13, 1),
(3, 15, 1);

-- Update some timestamps for testing
UPDATE orders SET 
    shipped_at = DATE_SUB(NOW(), INTERVAL 2 DAY),
    delivered_at = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE status = 'delivered';

UPDATE orders SET 
    shipped_at = DATE_SUB(NOW(), INTERVAL 1 DAY)
WHERE status = 'shipped';

UPDATE users SET 
    last_login = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
WHERE id <= 5;

-- Create views for common queries

-- Product inventory view
CREATE VIEW product_inventory AS
SELECT 
    p.id,
    p.sku,
    p.name,
    c.name AS category,
    p.price,
    p.stock_quantity,
    p.reorder_level,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity < p.reorder_level THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE;

-- Customer order summary view
CREATE VIEW customer_order_summary AS
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
    MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status NOT IN ('cancelled')
GROUP BY u.id, u.username, u.email;

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to place an order from cart
CREATE PROCEDURE place_order_from_cart(
    IN p_user_id INT,
    IN p_shipping_address TEXT,
    IN p_billing_address TEXT
)
BEGIN
    DECLARE v_order_id INT;
    DECLARE v_total DECIMAL(10, 2) DEFAULT 0;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Create order
    INSERT INTO orders (
        order_number, 
        user_id, 
        status, 
        total_amount, 
        shipping_address, 
        billing_address
    ) VALUES (
        CONCAT('ORD-', YEAR(NOW()), '-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
        p_user_id,
        'pending',
        0,
        p_shipping_address,
        p_billing_address
    );
    
    SET v_order_id = LAST_INSERT_ID();
    
    -- Copy cart items to order items
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
    SELECT 
        v_order_id,
        c.product_id,
        c.quantity,
        p.price,
        p.price * c.quantity
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = p_user_id;
    
    -- Calculate total
    SELECT SUM(total_price) INTO v_total
    FROM order_items
    WHERE order_id = v_order_id;
    
    -- Update order total
    UPDATE orders SET total_amount = v_total WHERE id = v_order_id;
    
    -- Clear cart
    DELETE FROM cart_items WHERE user_id = p_user_id;
    
    -- Commit transaction
    COMMIT;
    
    -- Return order details
    SELECT * FROM orders WHERE id = v_order_id;
END//

-- Function to calculate product average rating
CREATE FUNCTION get_product_rating(p_product_id INT) 
RETURNS DECIMAL(3,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    
    SELECT AVG(rating) INTO avg_rating
    FROM reviews
    WHERE product_id = p_product_id;
    
    RETURN COALESCE(avg_rating, 0);
END//

DELIMITER ;

-- Grant permissions for test user (adjust as needed)
-- CREATE USER IF NOT EXISTS 'testuser'@'localhost' IDENTIFIED BY 'testpass123';
-- GRANT ALL PRIVILEGES ON sql_training.* TO 'testuser'@'localhost';
-- FLUSH PRIVILEGES;

-- Verification queries
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS product_count FROM products;
SELECT COUNT(*) AS order_count FROM orders;
SELECT COUNT(*) AS review_count FROM reviews;