# Module 2: Intermediate SQL - Working with Multiple Tables

## Module 2.1: Working with Multiple Tables

### Understanding Table Relationships

In real-world applications, data is distributed across multiple related tables. Understanding how to work with these relationships is crucial for effective testing.



### Types of Relationships

#### 1. One-to-Many (Most Common)
- One user can have many orders
- One category can have many products
- One order can have many order items

#### 2. Many-to-Many
- Products and tags (product can have many tags, tag can apply to many products)
- Users and roles (user can have many roles, role can have many users)
- Requires a junction/linking table

#### 3. One-to-One (Less Common)
- User and user profile
- Order and shipping details
- Often combined into single table

### Introduction to JOINs

JOINs combine rows from two or more tables based on related columns.

#### Basic JOIN Syntax
```sql
SELECT columns
FROM table1
JOIN table2 ON table1.column = table2.column;
```

### INNER JOIN

Returns only rows that have matching values in both tables.

#### Example: Users and Their Orders

Let's start with the basic syntax without aliases:

```sql
-- Basic INNER JOIN - full table names
SELECT 
    users.username,
    users.email,
    orders.order_number,
    orders.total_amount,
    orders.status
FROM users
INNER JOIN orders ON users.id = orders.user_id;
```

**Why do we need table prefixes?** When joining tables, both tables might have columns with the same name (like `id` or `created_at`). We need to specify which table each column comes from to avoid ambiguity.

**Introducing Table Aliases** - As queries get longer, typing full table names becomes tedious. We can use short aliases:

```sql
-- Using simple table aliases for cleaner code
SELECT 
    users.username,
    users.email,
    orders.order_number,
    orders.total_amount,
    orders.created_at
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- Same query with aliases (u = users, o = orders)
SELECT 
    u.username,
    u.email,
    o.order_number,
    o.total_amount,
    o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

#### When Aliases Become Necessary

As we join more tables, aliases become essential for readability:

```sql
-- Multiple table JOINs - here aliases are very helpful
-- Without aliases, this would be much harder to read!
SELECT 
    users.username,
    users.email,
    orders.order_number,
    products.name AS product_name,
    order_items.quantity
FROM users
INNER JOIN orders ON users.id = orders.user_id
INNER JOIN order_items ON orders.id = order_items.order_id
INNER JOIN products ON order_items.product_id = products.id;

-- Much cleaner with meaningful aliases:
SELECT 
    u.username,
    u.email,
    o.order_number,
    p.name AS product_name,
    oi.quantity
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;
```

**Tip:** Use meaningful aliases like `u` for users, `o` for orders, `p` for products. Avoid confusing single letters like `a`, `b`, `c`.

### LEFT JOIN (LEFT OUTER JOIN)

Returns ALL!!!!!! rows from the left table and matched rows from the right table. NULL for non-matching right side.

#### Example: All Users, With or Without Orders

Let's build this up step by step:1 | johndoe  

```sql
-- First, a simple LEFT JOIN to see all users and their orders
SELECT 
    users.username,
    users.email,
    orders.order_number,
    orders.total_amount
FROM users
LEFT JOIN orders ON users.id(4)= orders.user_id
ORDER BY users.username;

-- Now with aliases for cleaner code
SELECT 
    u.username,
    u.email,
    o.order_number,
    o.total_amount
FROM users u
LEFT JOIN orders o ON u.id(4) = o.user_id(4)
ORDER BY u.username;

-- Advanced: Count orders per user (including users with no orders)
-- Note: This uses GROUP BY which we'll cover in Module 3
SELECT 
    u.username,
    u.email,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username, u.email
ORDER BY order_count DESC;
```

#### Finding Records Without Matches

This is a common and very useful pattern:

```sql
-- Find users who have never placed an order
SELECT 
    users.username,
    users.email,
    users.created_at
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE orders.id IS NULL;

-- Same query with aliases
SELECT 
    u.username,
    u.email,
    u.created_at
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- Find products that have never been ordered
SELECT 
    p.name,
    p.sku,
    p.price
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL;
```

### RIGHT JOIN (RIGHT OUTER JOIN)

Returns ALL!!!!!! rows from the right table and matched rows from the left table. Less commonly used than LEFT JOIN.

```sql
-- All orders with user information (even if user deleted)
SELECT 
    o.order_number,
    o.total_amount,
    u.username,
    u.email
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- Equivalent using LEFT JOIN (preferred)
SELECT 
    o.order_number,
    o.total_amount,
    u.username,
    u.email
FROM orders o
LEFT JOIN users u ON u.id = o.user_id;
```

### FULL OUTER JOIN

Returns all rows when there's a match in either table. MySQL doesn't support FULL OUTER JOIN directly, but we can simulate it.

```sql
-- Simulate FULL OUTER JOIN using UNION
SELECT 
    u.username,
    o.order_number
FROM users u
LEFT JOIN orders o ON u.id = o.user_id

UNION

SELECT 
    u.username,
    o.order_number
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

### CROSS JOIN

Returns the Cartesian product of both tables (every row from first table paired with every row from second).

```sql
-- Generate all possible product-category combinations
-- Use with caution - can produce many rows!
SELECT 
    p.name AS product_name,
    c.name AS category_name
FROM products p
CROSS JOIN categories c
WHERE c.parent_id IS NULL  -- Only main categories
LIMIT 10;
```

### Self JOINs

Joining a table to itself, useful for hierarchical data.

```sql
-- Find categories and their parent categories
SELECT 
    c1.name AS category,
-- Find products in the same category
    c2.name AS parent_category
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id;

-- Find products in the same category
SELECT 
    p1.name AS product1,
    p2.name AS product2,
    c.name AS category
FROM products p1
INNER JOIN products p2 ON p1.category_id = p2.category_id
INNER JOIN categories c ON p1.category_id = c.id
WHERE p1.id < p2.id  -- Avoid duplicates and self-matches
  AND p1.price > 50
  AND p2.price > 50;
```

### Complex JOIN Patterns for Testing

#### Pattern 1: Verify Data Integrity
```sql
-- Check for orphaned order items (referencing non-existent products)
SELECT 
    oi.id AS order_item_id,
    oi.order_id,
    oi.product_id,
    p.id AS product_exists
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL;
```

#### Pattern 2: Business Logic Validation
```sql
-- Verify order totals match sum of items
SELECT 
    o.order_number,
    o.total_amount AS order_total,
    SUM(oi.total_price) AS calculated_total,
    o.total_amount - SUM(oi.total_price) AS difference
FROM orders o
INNER JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.total_amount
HAVING difference != 0;
```

#### Pattern 3: Test Data Generation
```sql
-- Get test users who have placed recent orders
SELECT 
    u.username,
    u.email,
    o.order_number,
    o.total_amount,
    o.created_at
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND o.status = 'delivered'
ORDER BY o.created_at DESC
LIMIT 5;
```

### Understanding Foreign Keys

Foreign keys establish and enforce relationships between tables.

#### Creating Foreign Keys
```sql
-- Adding foreign key to existing table
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- Creating table with foreign key
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### Foreign Key Actions
- **ON DELETE CASCADE**: Delete child records when parent deleted
- **ON DELETE SET NULL**: Set foreign key to NULL when parent deleted
- **ON DELETE RESTRICT**: Prevent parent deletion if children exist (default)
- **ON UPDATE CASCADE**: Update foreign key when parent key changes

### Subqueries vs JOINs

Sometimes you can achieve the same result with either approach.

#### Using Subquery
```sql
-- Find users who have placed high-value orders
SELECT username, email
FROM users
WHERE id IN (
    SELECT DISTINCT user_id
    FROM orders
    WHERE total_amount > 500
);
```

#### Using JOIN (Often More Efficient)
```sql
-- Same result using JOIN
SELECT DISTINCT u.username, u.email
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.total_amount > 500;
```

### Performance Considerations

#### 1. Use Appropriate Indexes
```sql
-- Check existing indexes
SHOW INDEX FROM orders;

-- Add index for foreign key if missing
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

#### 2. JOIN Order Matters
```sql
-- Start with smaller result sets
-- Good: Filter before joining
SELECT *
FROM (SELECT * FROM orders WHERE status = 'pending') o
INNER JOIN users u ON o.user_id = u.id;

-- Less efficient: Join then filter
SELECT *
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';
```

#### 3. Avoid SELECT * with JOINs
```sql
-- Bad: Retrieves duplicate columns and unnecessary data
SELECT *
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- Good: Select only needed columns
SELECT 
    u.username,
    u.email,
    o.order_number,
    o.total_amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

## Module 2.2: Data Manipulation

### INSERT Statement

Add new records to a table.

#### Basic INSERT Syntax
```sql
-- Insert single row with all required columns
INSERT INTO users (username, email, password_hash, first_name, last_name, phone)
VALUES ('newuser', 'new@example.com', 'hash123', 'New', 'User', '555-0199');

-- Insert product with category reference
INSERT INTO products (sku, name, description, price, category_id, stock_quantity)
VALUES ('TEST001', 'Test Product', 'A test product description', 29.99, 1, 100);
-- Other columns get default values or NULL
```

#### Multiple Row INSERT
```sql
-- Insert multiple rows in one statement
INSERT INTO categories (name, description) VALUES
    ('Test Category 1', 'First test category'),
    ('Test Category 2', 'Second test category'),
    ('Test Category 3', 'Third test category');
```

#### INSERT with SELECT
```sql
-- Copy data from one table to another
INSERT INTO archived_orders (order_number, user_id, total_amount, created_at)
SELECT order_number, user_id, total_amount, created_at
FROM orders
WHERE status = 'delivered'
  AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Create test data based on existing data
INSERT INTO users (username, email, password_hash, first_name, last_name)
SELECT 
    CONCAT('test_', username),
    CONCAT('test_', email),
    password_hash,
    first_name,
    'TestUser'
FROM users
WHERE id <= 5;
```

#### INSERT IGNORE and ON DUPLICATE KEY
```sql
-- Ignore errors (e.g., duplicate key)
INSERT IGNORE INTO users (username, email, password_hash)
VALUES ('existinguser', 'existing@email.com', 'hash');

-- Update if duplicate key found
INSERT INTO product_views (product_id, view_count, last_viewed)
VALUES (123, 1, NOW())
ON DUPLICATE KEY UPDATE 
    view_count = view_count + 1,
    last_viewed = NOW();
```

### UPDATE Statement

Modify existing records in a table.

#### Basic UPDATE Syntax
```sql
-- Update single column
UPDATE users
SET is_active = FALSE
WHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Update multiple columns
UPDATE products
SET 
    price = price * 1.10,  -- 10% price increase
    updated_at = NOW()
WHERE category_id = 1;
```

#### UPDATE with JOIN
```sql
-- Update based on data from another table
UPDATE orders o
INNER JOIN (
    SELECT user_id, SUM(total_amount) as total_spent
    FROM orders
    WHERE status = 'delivered'
    GROUP BY user_id
) user_totals ON o.user_id = user_totals.user_id
SET o.status = 'processing'
WHERE user_totals.total_spent > 1000
  AND o.status = 'pending';

-- Update product stock based on recent sales
UPDATE products p
INNER JOIN (
    SELECT oi.product_id, SUM(oi.quantity) as total_sold
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND o.status IN ('delivered', 'shipped')
    GROUP BY oi.product_id
) sales ON p.id = sales.product_id
SET p.reorder_level = CASE 
    WHEN sales.total_sold >= 50 THEN p.reorder_level * 2
    WHEN sales.total_sold >= 20 THEN CEILING(p.reorder_level * 1.5)
    ELSE p.reorder_level
END;
```

#### Conditional UPDATE
```sql
-- Update with CASE statement
UPDATE orders
SET status = CASE
    WHEN total_amount > 1000 THEN 'high_priority'
    WHEN total_amount > 500 THEN 'medium_priority'
    ELSE 'standard'
END
WHERE status = 'pending';
```

### DELETE Statement

Remove records from a table.

#### Basic DELETE Syntax
```sql
-- Delete specific records
DELETE FROM cart_items
WHERE user_id = 123
  AND added_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Delete all records (use with caution!)
DELETE FROM temp_data;  -- Slower, logged
TRUNCATE TABLE temp_data;  -- Faster, resets auto_increment
```

#### DELETE with JOIN
```sql
-- Delete orders from inactive users
DELETE o
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE u.is_active = FALSE
  AND o.status = 'pending';

-- Delete orphaned records
DELETE oi
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;
```

#### Safe DELETE Practices
```sql
-- Always test with SELECT first
-- First, see what would be deleted:
SELECT * FROM users
WHERE last_login < '2023-01-01'
  AND is_active = FALSE;

-- Then, if correct, change to DELETE:
DELETE FROM users
WHERE last_login < '2023-01-01'
  AND is_active = FALSE
LIMIT 1000;  -- Batch deletion
```

### Transactions and ACID Properties

Transactions ensure data consistency by treating multiple operations as a single unit.

#### ACID Properties
- **Atomicity**: All or nothing - entire transaction succeeds or fails
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist

#### Basic Transaction Usage
```sql
-- Start transaction
START TRANSACTION;

-- Perform operations
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If all successful
COMMIT;

-- If any error occurs
ROLLBACK;
```

#### Transaction Example: Order Processing
```sql
DELIMITER //

CREATE PROCEDURE process_order(IN p_user_id INT, IN p_cart_id INT)
BEGIN
    DECLARE v_order_id INT;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Create order
    INSERT INTO orders (user_id, status, total_amount)
    VALUES (p_user_id, 'pending', 0);
    
    SET v_order_id = LAST_INSERT_ID();
    
    -- Move items from cart to order
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
    SELECT 
        v_order_id,
        c.product_id,
        c.quantity,
        p.price,
        p.price * c.quantity
    FROM cart_items c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.user_id = p_user_id;
    
    -- Calculate total
    SELECT SUM(total_price) INTO v_total
    FROM order_items
    WHERE order_id = v_order_id;
    
    -- Update order total
    UPDATE orders 
    SET total_amount = v_total 
    WHERE id = v_order_id;
    
    -- Update product stock
    UPDATE products p
    INNER JOIN order_items oi ON p.id = oi.product_id
    SET p.stock_quantity = p.stock_quantity - oi.quantity
    WHERE oi.order_id = v_order_id;
    
    -- Clear cart
    DELETE FROM cart_items WHERE user_id = p_user_id;
    
    -- Commit if all successful
    COMMIT;
    
    SELECT v_order_id AS order_id, v_total AS total;
    
END//

DELIMITER ;
```

### Data Integrity Constraints

Ensure data quality and consistency.

#### Types of Constraints
```sql
-- NOT NULL
ALTER TABLE users
MODIFY email VARCHAR(100) NOT NULL;

-- UNIQUE
ALTER TABLE products
ADD CONSTRAINT uk_product_sku UNIQUE (sku);

-- CHECK (MySQL 8.0+)
ALTER TABLE products
ADD CONSTRAINT chk_price CHECK (price >= 0);

ALTER TABLE reviews
ADD CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5);

-- DEFAULT
ALTER TABLE orders
ALTER COLUMN status SET DEFAULT 'pending';
```

#### Composite Constraints
```sql
-- Composite unique constraint
ALTER TABLE cart_items
ADD CONSTRAINT uk_user_product UNIQUE (user_id, product_id);

-- Composite foreign key
ALTER TABLE order_status_history
ADD CONSTRAINT fk_order_user 
FOREIGN KEY (order_id, user_id) 
REFERENCES orders(id, user_id);
```

### Best Practices for Data Manipulation

#### 1. Always Use WHERE Clause
```sql
-- Dangerous - updates ALL records
UPDATE users SET is_active = FALSE;  -- DON'T DO THIS!

-- Safe - specific condition
UPDATE users SET is_active = FALSE WHERE last_login < '2023-01-01';
```

#### 2. Test in Development First
```sql
-- Create test table with same structure
CREATE TABLE users_test LIKE users;
INSERT INTO users_test SELECT * FROM users;

-- Test your query
UPDATE users_test SET is_active = 0 WHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Verify results before applying to production
SELECT username, email, last_login, is_active FROM users_test 
WHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

#### 3. Use Transactions for Multiple Operations
```sql
START TRANSACTION;
-- Multiple related operations
UPDATE products SET stock_quantity = stock_quantity - 10 WHERE id = 1;
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
VALUES (1, 1, 10, 99.99, 999.90);
UPDATE orders SET total_amount = total_amount + 999.90 WHERE id = 1;
COMMIT;
```

#### 4. Backup Before Major Changes
```sql
-- Create backup table
CREATE TABLE users_backup_20240106 AS SELECT * FROM users;

-- Or export to file
-- mysqldump -u root -p database_name users > users_backup.sql
```

### Testing Scenarios for Data Manipulation

#### Scenario 1: User Registration Test
```sql
-- Test: Ensure user registration works correctly
START TRANSACTION;

-- Register new user with all fields
INSERT INTO users (username, email, password_hash, first_name, last_name, phone)
VALUES ('testuser123', 'test123@example.com', 'testhash', 'Test', 'User', '555-TEST');

SET @user_id = LAST_INSERT_ID();

-- Verify user created with defaults
SELECT id, username, email, is_active, created_at 
FROM users WHERE id = @user_id;

-- Cleanup (in test environment)
ROLLBACK;  -- Or DELETE for persistent test
```

#### Scenario 2: Order Fulfillment Test
```sql
-- Test: Process order and update inventory
DELIMITER //

CREATE PROCEDURE test_order_fulfillment(IN p_order_id INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'Error occurred, transaction rolled back' AS status;
    END;
    
    START TRANSACTION;
    
    -- Update order status
    UPDATE orders SET status = 'processing' WHERE id = p_order_id;
    
    -- Reduce inventory
    UPDATE products p
    INNER JOIN order_items oi ON p.id = oi.product_id
    SET p.stock_quantity = p.stock_quantity - oi.quantity
    WHERE oi.order_id = p_order_id;
    
    -- Check for negative inventory (business rule)
    IF EXISTS (
        SELECT 1 FROM products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        WHERE oi.order_id = p_order_id AND p.stock_quantity < 0
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient inventory';
    END IF;
    
    COMMIT;
    SELECT 'Order processed successfully' AS status;
END//

DELIMITER ;
```

### Common Pitfalls and Solutions

#### Pitfall 1: Forgetting WHERE in UPDATE/DELETE
```sql
-- Enable safe mode in MySQL Workbench
SET SQL_SAFE_UPDATES = 1;

-- Now this will error:
UPDATE users SET is_active = FALSE;  -- Error: safe update mode
```

#### Pitfall 2: Not Handling NULL in JOINs
```sql
-- Problem: Missing results due to NULL category_id
SELECT * FROM products p
INNER JOIN categories c ON p.category_id = c.id;  -- Misses products without categories

-- Solution: Use LEFT JOIN
SELECT p.*, COALESCE(c.name, 'Uncategorized') as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

#### Pitfall 3: Ambiguous Column Names
```sql
-- Problem: Ambiguous column 'id' and 'created_at'
SELECT id, created_at FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- Solution: Use table prefixes or aliases
SELECT 
    u.id AS user_id, 
    u.username, 
    u.created_at AS user_created,
    o.id AS order_id,
    o.created_at AS order_created
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
```

### Lab Exercises

#### Exercise 1: JOIN Practice
1. Find all orders with customer and product details
2. List products that have never been reviewed
3. Show categories with their product counts
4. Find users who ordered the same product multiple times

#### Exercise 2: Data Manipulation
1. Create a stored procedure to archive old orders
2. Update product prices based on category
3. Delete inactive user sessions
4. Transfer data between related tables

#### Exercise 3: Transaction Practice
1. Implement a complete checkout process
2. Create atomic inventory adjustment
3. Build a refund procedure
4. Implement bulk data import with rollback

### Summary

In this module, you've learned:
- How to JOIN tables to retrieve related data
- Different types of JOINs and when to use them
- How to INSERT, UPDATE, and DELETE data safely
- Transaction management for data consistency
- Best practices for data manipulation

These skills are essential for:
- Validating data relationships in tests
- Setting up test data
- Cleaning up after tests
- Ensuring data integrity

### Next Steps

Module 3 will cover:
- Aggregate functions (COUNT, SUM, AVG, etc.)
- GROUP BY and HAVING clauses
- Window functions
- Stored procedures and functions
- Query optimization techniques

Keep practicing JOINs - they're the foundation of complex queries!