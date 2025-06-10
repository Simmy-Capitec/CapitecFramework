# Module 3: Advanced SQL Concepts

## Module 3.1: Advanced Query Techniques

### Aggregate Functions

Aggregate functions perform calculations on sets of rows and return a single value.

#### Core Aggregate Functions

```sql
-- COUNT: Number of rows
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(phone) AS users_with_phone FROM users;  -- Excludes NULLs
SELECT COUNT(DISTINCT category_id) AS unique_categories FROM products;

-- SUM: Total of numeric values
SELECT SUM(total_amount) AS total_revenue FROM orders;
SELECT SUM(stock_quantity * price) AS inventory_value FROM products;

-- AVG: Average of numeric values
SELECT AVG(price) AS average_price FROM products;
SELECT AVG(total_amount) AS avg_order_value FROM orders WHERE status = 'delivered';

-- MIN/MAX: Smallest/Largest values
SELECT MIN(created_at) AS first_order, MAX(created_at) AS latest_order FROM orders;
SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive FROM products;
```

#### Advanced Aggregate Usage

```sql
-- Multiple aggregates in one query
SELECT 
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS average_order_value,
    MIN(total_amount) AS smallest_order,
    MAX(total_amount) AS largest_order
FROM orders
WHERE status = 'delivered';

-- Conditional aggregation
SELECT 
    SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) AS delivered_revenue,
    SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) AS pending_revenue,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders
FROM orders;
```

### GROUP BY Clause

Groups rows with the same values and allows aggregate functions on each group.

#### Basic GROUP BY

```sql
-- Orders by status
SELECT 
    status,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY status;

-- Products by category
SELECT 
    c.name AS category_name,
    COUNT(p.id) AS product_count,
    AVG(p.price) AS avg_price,
    MIN(p.price) AS min_price,
    MAX(p.price) AS max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

#### Multiple Column Grouping

```sql
-- Sales by category and month
SELECT 
    c.name AS category,
    YEAR(o.created_at) AS year,
    MONTH(o.created_at) AS month,
    COUNT(DISTINCT o.id) AS order_count,
    SUM(oi.total_price) AS revenue
FROM categories c
INNER JOIN products p ON c.id = p.category_id
INNER JOIN order_items oi ON p.id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.id, c.name, YEAR(o.created_at), MONTH(o.created_at)
ORDER BY year DESC, month DESC, revenue DESC;
```

#### GROUP BY with ROLLUP

```sql
-- Hierarchical totals
SELECT 
    c.name AS category,
    p.name AS product,
    SUM(oi.quantity) AS total_sold
FROM categories c
INNER JOIN products p ON c.id = p.category_id
INNER JOIN order_items oi ON p.id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.name, p.name WITH ROLLUP;
```

### HAVING Clause

Filters groups based on aggregate conditions (WHERE filters rows, HAVING filters groups).

```sql
-- Categories with more than 5 products
SELECT 
    c.name AS category_name,
    COUNT(p.id) AS product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
HAVING COUNT(p.id) > 5
ORDER BY product_count DESC;

-- High-value customers (total orders > $1000)
SELECT 
    u.username,
    u.email,
    COUNT(o.id) AS order_count,
    SUM(o.total_amount) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'delivered'
GROUP BY u.id, u.username, u.email
HAVING SUM(o.total_amount) > 1000
ORDER BY total_spent DESC;

-- Products with low average ratings
SELECT 
    p.name,
    COUNT(r.id) AS review_count,
    AVG(r.rating) AS avg_rating
FROM products p
INNER JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name
HAVING COUNT(r.id) >= 3 AND AVG(r.rating) < 3.0
ORDER BY avg_rating ASC;
```

### Window Functions

Powerful functions that perform calculations across related rows without grouping.

#### ROW_NUMBER, RANK, DENSE_RANK

```sql
-- Rank products by price within each category
SELECT 
    p.name,
    c.name AS category,
    p.price,
    ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) AS price_rank,
    RANK() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) AS price_rank_with_ties,
    DENSE_RANK() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) AS dense_price_rank
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE;

-- Top 3 products by sales in each category
WITH product_sales AS (
    SELECT 
        p.id,
        p.name,
        c.name AS category,
        SUM(oi.quantity) AS total_sold,
        ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY SUM(oi.quantity) DESC) AS sales_rank
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    INNER JOIN order_items oi ON p.id = oi.product_id
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'delivered'
    GROUP BY p.id, p.name, c.id, c.name
)
SELECT * FROM product_sales
WHERE sales_rank <= 3;
```

#### LEAD and LAG

```sql
-- Compare each order with previous and next order for a user
SELECT 
    u.username,
    o.order_number,
    o.total_amount,
    o.created_at,
    LAG(o.total_amount) OVER (PARTITION BY u.id ORDER BY o.created_at) AS prev_order_amount,
    LEAD(o.total_amount) OVER (PARTITION BY u.id ORDER BY o.created_at) AS next_order_amount,
    o.total_amount - LAG(o.total_amount) OVER (PARTITION BY u.id ORDER BY o.created_at) AS amount_change
FROM users u
INNER JOIN orders o ON u.id = o.user_id
ORDER BY u.username, o.created_at;
```

#### Aggregate Window Functions

```sql
-- Running totals and moving averages
SELECT 
    o.created_at,
    o.total_amount,
    SUM(o.total_amount) OVER (ORDER BY o.created_at) AS running_total,
    AVG(o.total_amount) OVER (ORDER BY o.created_at ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7_days,
    COUNT(*) OVER (ORDER BY o.created_at) AS cumulative_order_count
FROM orders o
WHERE o.status = 'delivered'
ORDER BY o.created_at;

-- Percentage of total
SELECT 
    c.name AS category,
    COUNT(p.id) AS product_count,
    COUNT(p.id) * 100.0 / SUM(COUNT(p.id)) OVER () AS percentage_of_total
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

### Common Table Expressions (CTEs)

CTEs provide a way to define temporary named result sets.

#### Basic CTE

```sql
-- Find users who spent more than average
WITH avg_spending AS (
    SELECT AVG(total_amount) AS avg_order_value
    FROM orders
    WHERE status = 'delivered'
),
user_spending AS (
    SELECT 
        u.username,
        u.email,
        SUM(o.total_amount) AS total_spent,
        COUNT(o.id) AS order_count
    FROM users u
    INNER JOIN orders o ON u.id = o.user_id
    WHERE o.status = 'delivered'
    GROUP BY u.id, u.username, u.email
)
SELECT 
    us.username,
    us.email,
    us.total_spent,
    us.order_count,
    avg.avg_order_value
FROM user_spending us
CROSS JOIN avg_spending avg
WHERE us.total_spent > avg.avg_order_value * us.order_count;
```

#### Recursive CTE

```sql
-- Build category hierarchy (if categories have parent_id)
WITH RECURSIVE category_hierarchy AS (
    -- Base case: top-level categories
    SELECT 
        id,
        name,
        parent_id,
        0 AS level,
        CAST(name AS CHAR(1000)) AS path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ch.level + 1,
        CONCAT(ch.path, ' > ', c.name)
    FROM categories c
    INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
)
SELECT 
    id,
    name,
    level,
    path
FROM category_hierarchy
ORDER BY path;
```

#### Complex CTE Example

```sql
-- Customer lifecycle analysis
WITH customer_metrics AS (
    SELECT 
        u.id,
        u.username,
        u.created_at AS registration_date,
        MIN(o.created_at) AS first_order_date,
        MAX(o.created_at) AS last_order_date,
        COUNT(o.id) AS total_orders,
        SUM(o.total_amount) AS lifetime_value,
        AVG(o.total_amount) AS avg_order_value
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'delivered'
    GROUP BY u.id, u.username, u.created_at
),
customer_segments AS (
    SELECT 
        *,
        CASE 
            WHEN total_orders = 0 THEN 'Never Purchased'
            WHEN total_orders = 1 THEN 'One-Time Customer'
            WHEN total_orders BETWEEN 2 AND 5 THEN 'Regular Customer'
            WHEN total_orders > 5 THEN 'VIP Customer'
        END AS customer_segment,
        CASE 
            WHEN last_order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Active'
            WHEN last_order_date >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 'At Risk'
            WHEN last_order_date IS NOT NULL THEN 'Churned'
            ELSE 'Never Purchased'
        END AS activity_status
    FROM customer_metrics
)
SELECT 
    customer_segment,
    activity_status,
    COUNT(*) AS customer_count,
    AVG(lifetime_value) AS avg_lifetime_value,
    SUM(lifetime_value) AS total_revenue
FROM customer_segments
GROUP BY customer_segment, activity_status
ORDER BY customer_segment, activity_status;
```

### Subqueries

Queries nested within other queries.

#### Scalar Subqueries

```sql
-- Products priced above category average
SELECT 
    p.name,
    p.price,
    (SELECT AVG(price) FROM products WHERE category_id = p.category_id) AS category_avg_price
FROM products p
WHERE p.price > (
    SELECT AVG(price) 
    FROM products 
    WHERE category_id = p.category_id
);
```

#### Correlated Subqueries

```sql
-- Users with above-average order frequency
SELECT 
    u.username,
    u.email,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
FROM users u
WHERE (
    SELECT COUNT(*) 
    FROM orders 
    WHERE user_id = u.id
) > (
    SELECT AVG(order_count)
    FROM (
        SELECT COUNT(*) AS order_count
        FROM orders
        GROUP BY user_id
    ) AS avg_orders
);
```

#### EXISTS and NOT EXISTS

```sql
-- Users who have placed orders
SELECT u.username, u.email
FROM users u
WHERE EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.user_id = u.id 
    AND o.status = 'delivered'
);

-- Products never ordered
SELECT p.name, p.sku, p.price
FROM products p
WHERE NOT EXISTS (
    SELECT 1 
    FROM order_items oi 
    WHERE oi.product_id = p.id
);
```

## Module 3.2: Performance and Optimization

### Understanding Query Execution

#### Query Execution Plans

```sql
-- Analyze query performance
EXPLAIN SELECT 
    u.username,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;

-- More detailed analysis
EXPLAIN ANALYZE SELECT 
    p.name,
    c.name AS category
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.price > 100;
```

#### Reading Execution Plans

Key columns to understand:
- `select_type`: Type of SELECT (SIMPLE, SUBQUERY, etc.)
- `table`: Table being accessed
- `type`: Join type (const, eq_ref, ref, range, index, ALL)
- `key`: Index used
- `rows`: Estimated rows examined
- `Extra`: Additional information

```sql
-- Example of different join types
-- const: Single row match
EXPLAIN SELECT * FROM users WHERE id = 1;

-- eq_ref: One row from each table in join
EXPLAIN SELECT u.*, o.* FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.id = 1;

-- ref: Multiple rows with same index value
EXPLAIN SELECT * FROM orders WHERE status = 'pending';

-- range: Range scan
EXPLAIN SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';
```

### Indexing Strategies

#### Creating Indexes

```sql
-- Single column index
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Unique index
CREATE UNIQUE INDEX idx_products_sku ON products(sku);

-- Partial index (MySQL 8.0+)
CREATE INDEX idx_active_products ON products(category_id) WHERE is_active = TRUE;
```

#### Index Usage Analysis

```sql
-- Check index usage on main tables
SHOW INDEX FROM orders;
SHOW INDEX FROM order_items;
SHOW INDEX FROM products;

-- Analyze query with index
EXPLAIN SELECT * FROM orders WHERE status = 'pending';

-- Force index usage (for testing)
SELECT * FROM orders FORCE INDEX (idx_orders_status) WHERE status = 'pending';

-- Check index statistics
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'sql_training'
AND TABLE_NAME IN ('orders', 'order_items', 'products', 'users')
ORDER BY TABLE_NAME, INDEX_NAME;
```

#### Index Best Practices

```sql
-- Good: Selective columns first in composite index
CREATE INDEX idx_orders_status_date ON orders(status, created_at);

-- Better for this common query pattern
SELECT * FROM orders 
WHERE status = 'delivered'
AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- For product searches
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);

-- Index for ORDER BY
CREATE INDEX idx_products_category_price_desc ON products(category_id, price DESC);

-- Optimizes this query:
SELECT * FROM products 
WHERE category_id = 1 
ORDER BY price DESC 
LIMIT 10;
```

### Query Optimization Techniques

#### 1. Use Appropriate WHERE Clauses

```sql
-- Bad: Function on column prevents index usage
SELECT * FROM orders WHERE YEAR(created_at) = 2025;
SELECT * FROM users WHERE LOWER(email) = 'john.doe@email.com';

-- Good: Range condition allows index usage
SELECT * FROM orders 
WHERE created_at >= '2025-01-01' 
AND created_at < '2026-01-01';

-- Good: Store lowercase email if case-insensitive search needed
SELECT * FROM users WHERE email = 'john.doe@email.com';

-- Bad: OR conditions often prevent index usage
SELECT * FROM products WHERE category_id = 1 OR category_id = 2;

-- Good: Use IN instead
SELECT * FROM products WHERE category_id IN (1, 2);
```

#### 2. Optimize JOINs

```sql
-- Ensure JOIN conditions use indexed columns
-- Add indexes if missing:
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Join order matters for performance
-- Start with most selective table
SELECT p.name, oi.quantity
FROM order_items oi  -- Start with smaller result set
INNER JOIN products p ON oi.product_id = p.id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
AND oi.quantity > 1;
```

#### 3. Limit Result Sets

```sql
-- Use LIMIT for large result sets
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 100;

-- Paginate large datasets
SELECT * FROM products
WHERE category_id = 1
ORDER BY id
LIMIT 20 OFFSET 40;  -- Page 3, 20 items per page

-- Use WHERE to filter early
SELECT u.username, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status IN ('delivered', 'shipped')
WHERE u.is_active = 1  -- Filter before aggregation
  AND u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.username, u.email;
```

#### 4. Optimize Subqueries

```sql
-- Often EXISTS is faster than IN
-- Slower:
SELECT * FROM users 
WHERE id IN (SELECT user_id FROM orders WHERE status = 'delivered');

-- Faster:
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id 
    AND o.status = 'delivered'
);

-- Convert correlated subqueries to JOINs when possible
-- Slower:
SELECT u.*, 
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u;

-- Faster:
SELECT u.*, COALESCE(o.order_count, 0) as order_count
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    GROUP BY user_id
) o ON u.id = o.user_id;
```

### Performance Monitoring

#### Query Performance Metrics

```sql
-- Enable query logging (be careful in production)
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries taking > 1 second

-- Check query performance
SHOW PROCESSLIST;

-- Profile a query
SET profiling = 1;
SELECT COUNT(*) FROM orders o INNER JOIN order_items oi ON o.id = oi.order_id;
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

#### Database Performance Metrics

```sql
-- Check table sizes
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)',
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'sql_training'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- Index effectiveness
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'sql_training'
ORDER BY COUNT_FETCH DESC;
```

### Testing Query Performance

#### Performance Test Framework

```sql
-- Create test procedure for performance testing
DELIMITER //

CREATE PROCEDURE test_query_performance(
    IN query_name VARCHAR(100),
    IN test_query TEXT,
    IN iterations INT DEFAULT 10
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE start_time BIGINT;
    DECLARE end_time BIGINT;
    DECLARE total_time DECIMAL(10,3) DEFAULT 0;
    DECLARE avg_time DECIMAL(10,3);
    
    -- Warm up
    SET @sql = test_query;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Time the query
    WHILE i < iterations DO
        SET start_time = UNIX_TIMESTAMP(NOW(3)) * 1000;
        
        SET @sql = test_query;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET end_time = UNIX_TIMESTAMP(NOW(3)) * 1000;
        SET total_time = total_time + (end_time - start_time);
        SET i = i + 1;
    END WHILE;
    
    SET avg_time = total_time / iterations;
    
    SELECT 
        query_name AS 'Query Name',
        iterations AS 'Iterations',
        total_time AS 'Total Time (ms)',
        avg_time AS 'Average Time (ms)';
END//

DELIMITER ;

-- Test query performance
CALL test_query_performance(
    'User Order Count',
    'SELECT u.username, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id',
    50
);
```

### Best Practices for Testing Queries

#### 1. Use Realistic Data Volumes

```sql
-- Generate test data for performance testing
-- First, create a numbers table for generating rows
CREATE TEMPORARY TABLE IF NOT EXISTS numbers (n INT);
INSERT INTO numbers VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

-- Generate test orders (1000 rows)
INSERT INTO orders (order_number, user_id, status, total_amount, shipping_address, billing_address, created_at)
SELECT 
    CONCAT('TEST-', LPAD((@row_num:=@row_num+1), 6, '0')),
    FLOOR(RAND() * 8) + 1,  -- Random user from 1-8
    ELT(FLOOR(RAND() * 5) + 1, 'pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    ROUND(RAND() * 1000 + 10, 2),
    CONCAT(FLOOR(RAND() * 999) + 1, ' Test St, Test City, TS 12345'),
    CONCAT(FLOOR(RAND() * 999) + 1, ' Test St, Test City, TS 12345'),
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY)
FROM 
    numbers n1,
    numbers n2,
    numbers n3,
    (SELECT @row_num:=1000) r
LIMIT 1000;
```

#### 2. Test Before and After Index Changes

```sql
-- Baseline measurement
CALL test_query_performance('Before Index', 'SELECT * FROM orders WHERE status = "pending"', 100);

-- Add index
CREATE INDEX idx_orders_status ON orders(status);

-- Measure improvement
CALL test_query_performance('After Index', 'SELECT * FROM orders WHERE status = "pending"', 100);
```

#### 3. Monitor Resource Usage

```sql
-- Check for expensive queries
SELECT 
    QUERY,
    EXEC_COUNT,
    TOTAL_LATENCY,
    AVG_LATENCY,
    ROWS_SENT_AVG,
    ROWS_EXAMINED_AVG
FROM sys.x$statement_analysis
ORDER BY TOTAL_LATENCY DESC
LIMIT 10;
```

### Common Performance Anti-Patterns

#### 1. N+1 Query Problem

```sql
-- Bad: Causes N+1 queries in application code
-- Application loops through users and queries orders for each
SELECT * FROM users;
-- Then for each user: SELECT COUNT(*) FROM orders WHERE user_id = ?

-- Good: Single query with JOIN
SELECT 
    u.username,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username;
```

#### 2. Selecting Unnecessary Data

```sql
-- Bad: Retrieves all columns
SELECT * FROM products 
INNER JOIN categories ON products.category_id = categories.id;

-- Good: Only needed columns
SELECT 
    products.name,
    products.price,
    categories.name as category_name
FROM products
INNER JOIN categories ON products.category_id = categories.id;
```

#### 3. Inefficient WHERE Clauses

```sql
-- Bad: Multiple inefficiencies
SELECT * FROM products p, categories c 
WHERE p.category_id = c.id 
AND DATE(p.created_at) = '2025-06-04'
AND UPPER(p.name) LIKE '%LAPTOP%';

-- Good: Optimized version
SELECT p.id, p.name, p.price, c.name AS category
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.created_at >= '2025-06-04 00:00:00' 
  AND p.created_at < '2025-06-05 00:00:00'
  AND p.name LIKE '%Laptop%'  -- Assuming consistent casing
```

### Lab Exercises

#### Exercise 1: Aggregate Analysis
1. Create a sales report showing monthly revenue by category
2. Find the top 5 customers by lifetime value with their order patterns
3. Calculate conversion rates (users with orders / total users) by registration month
4. Analyze product performance: units sold, revenue, and return rate by category

#### Exercise 2: Window Functions
1. Rank products by sales volume and revenue within each category
2. Calculate 7-day and 30-day moving averages for order values
3. Identify customers with declining order frequency using LAG/LEAD
4. Create a cohort analysis showing customer retention by month

#### Exercise 3: Performance Optimization
1. Use EXPLAIN ANALYZE to identify slow queries in the order processing flow
2. Create covering indexes for the most common query patterns
3. Measure query performance before and after optimization
4. Optimize a complex inventory report that joins 5+ tables
5. Implement query result caching strategies

#### Exercise 4: Advanced CTEs
1. Build a product recommendation system based on purchase patterns
2. Create RFM (Recency, Frequency, Monetary) customer segmentation
3. Analyze seasonal purchase patterns and predict inventory needs
4. Generate a multi-level sales funnel analysis from browsing to purchase
5. Create a recursive CTE to analyze referral chains (if applicable)

### Summary

Advanced SQL concepts covered:
- Aggregate functions and GROUP BY/HAVING
- Window functions for analytical queries
- CTEs for complex query organization
- Performance optimization techniques
- Index strategies and query tuning

These skills enable:
- Complex data analysis for testing
- Performance validation
- Advanced reporting capabilities
- Optimization of test queries

### Next Steps

Module 4 will integrate these advanced concepts with Playwright testing:
- Building sophisticated test data queries
- Performance testing of database operations
- Advanced validation strategies
- Real-world automation scenarios

Practice these advanced concepts - they're essential for professional database testing!