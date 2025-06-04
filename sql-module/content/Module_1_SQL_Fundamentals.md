# Module 1: SQL Fundamentals

## Module 1.1: Introduction to Databases

### What is a Database?

A database is an organized collection of structured information stored electronically. Think of it as a sophisticated filing cabinet where:
- **Tables** are like folders
- **Rows** are like individual documents
- **Columns** are like fields on a form

### Why Databases Matter in Testing

As a test automation engineer, you need to validate:
1. **Data Persistence**: Did the user's action save correctly?
2. **Data Integrity**: Is the data consistent and valid?
3. **Business Logic**: Are calculations and rules applied correctly?
4. **Performance**: How quickly can we retrieve data?

### Types of Databases

#### Relational Databases (SQL)
- Structured data in tables
- Relationships between tables
- ACID compliance (Atomicity, Consistency, Isolation, Durability)
- Examples: MySQL, PostgreSQL, Oracle, SQL Server

#### Non-Relational Databases (NoSQL)
- Flexible data structures
- Horizontal scaling
- Eventually consistent
- Examples: MongoDB, Redis, Cassandra

*For this module, we focus on MySQL (relational).*

### Understanding MySQL

MySQL is:
- **Open-source**: Free to use
- **Popular**: Powers Facebook, Twitter, YouTube
- **Reliable**: Proven in production
- **Well-documented**: Extensive community support

### Setting Up MySQL Environment

#### Installation Steps

1. **Download MySQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS with Homebrew
brew install mysql

# Windows
# Download installer from https://dev.mysql.com/downloads/installer/
```

2. **Start MySQL Service**
```bash
# Linux
sudo systemctl start mysql

# macOS
brew services start mysql

# Windows
# Starts automatically after installation
```

3. **Secure Installation**
```bash
sudo mysql_secure_installation
# Follow prompts to:
# - Set root password
# - Remove anonymous users
# - Disable remote root login
# - Remove test database
```

4. **Connect to MySQL**
```bash
mysql -u root -p
# Enter password when prompted
```

#### MySQL Workbench Setup

1. Download from: https://dev.mysql.com/downloads/workbench/
2. Install following platform-specific instructions
3. Create connection:
   - Connection Name: Local MySQL
   - Hostname: 127.0.0.1
   - Port: 3306
   - Username: root

### Database Design Principles

#### 1. Normalization
Organizing data to reduce redundancy:

**Poor Design** (Denormalized):
```
Orders Table:
OrderID | CustomerName | CustomerEmail | Product | Price
1       | John Doe     | john@email    | Laptop  | 999
2       | John Doe     | john@email    | Mouse   | 29
```

**Better Design** (Normalized):
```
Customers Table:
CustomerID | Name     | Email
1          | John Doe | john@email

Orders Table:
OrderID | CustomerID | Product | Price
1       | 1          | Laptop  | 999
2       | 1          | Mouse   | 29
```

#### 2. Primary Keys
- Unique identifier for each row
- Cannot be NULL
- Cannot be duplicated
- Usually auto-incrementing integer

#### 3. Data Types
Common MySQL data types:

**Numeric**:
- `INT`: Whole numbers (-2147483648 to 2147483647)
- `BIGINT`: Large whole numbers
- `DECIMAL(10,2)`: Precise decimals (e.g., money)
- `FLOAT/DOUBLE`: Approximate decimals

**String**:
- `VARCHAR(255)`: Variable-length string (up to 255 chars)
- `TEXT`: Large text content
- `CHAR(10)`: Fixed-length string

**Date/Time**:
- `DATE`: YYYY-MM-DD
- `DATETIME`: YYYY-MM-DD HH:MM:SS
- `TIMESTAMP`: Like DATETIME but auto-updates

**Boolean**:
- `BOOLEAN` or `TINYINT(1)`: True/False

### Creating Your First Database

```sql
-- Create a database
CREATE DATABASE IF NOT EXISTS testautomation;

-- Use the database
USE testautomation;

-- Create a users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- View table structure
DESCRIBE users;

-- View all tables
SHOW TABLES;
```

## Module 1.2: Basic SQL Syntax

### The SELECT Statement

The most fundamental SQL command retrieves data from tables.

#### Basic Syntax
```sql
SELECT column1, column2, ...
FROM table_name;
```

#### Examples

**Select All Columns**:
```sql
SELECT * FROM users;
```

**Select Specific Columns**:
```sql
SELECT username, email FROM users;
```

**Select with Column Aliases**:
```sql
SELECT 
    username AS 'User Name',
    email AS 'Email Address',
    created_at AS 'Registration Date'
FROM users;
```

### The WHERE Clause

Filter results based on conditions.

#### Comparison Operators
```sql
-- Equal to
SELECT * FROM users WHERE username = 'johndoe';

-- Not equal to
SELECT * FROM users WHERE is_active != FALSE;
SELECT * FROM users WHERE is_active <> FALSE;  -- Alternative syntax

-- Greater than / Less than
SELECT * FROM products WHERE price > 100;
SELECT * FROM products WHERE stock_quantity < 10;

-- Greater than or equal / Less than or equal
SELECT * FROM orders WHERE total_amount >= 50;
SELECT * FROM orders WHERE created_at <= '2024-01-01';
```

#### Logical Operators

**AND - All conditions must be true**:
```sql
SELECT * FROM products 
WHERE price > 50 
  AND stock_quantity > 0 
  AND category = 'Electronics';
```

**OR - At least one condition must be true**:
```sql
SELECT * FROM users 
WHERE email LIKE '%gmail.com' 
   OR email LIKE '%yahoo.com';
```

**NOT - Negates a condition**:
```sql
SELECT * FROM products 
WHERE NOT category = 'Discontinued';
```

#### Pattern Matching with LIKE

```sql
-- % matches any sequence of characters
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM products WHERE name LIKE 'iPhone%';
SELECT * FROM customers WHERE address LIKE '%New York%';

-- _ matches exactly one character
SELECT * FROM products WHERE sku LIKE 'PRD_____';  -- Matches PRD12345
```

#### The IN Operator

Check if value matches any in a list:
```sql
SELECT * FROM orders 
WHERE status IN ('pending', 'processing', 'shipped');

-- Equivalent to:
SELECT * FROM orders 
WHERE status = 'pending' 
   OR status = 'processing' 
   OR status = 'shipped';
```

#### The BETWEEN Operator

Check if value is within a range:
```sql
-- Numeric range
SELECT * FROM products 
WHERE price BETWEEN 10 AND 100;

-- Date range
SELECT * FROM orders 
WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';
```

### NULL Handling

NULL represents missing or unknown data.

```sql
-- Check for NULL
SELECT * FROM users WHERE phone_number IS NULL;

-- Check for NOT NULL
SELECT * FROM users WHERE phone_number IS NOT NULL;

-- WRONG way (won't work)
SELECT * FROM users WHERE phone_number = NULL;  -- Don't do this!
```

**NULL in Calculations**:
```sql
-- NULL in arithmetic returns NULL
SELECT price * quantity AS total FROM order_items;  -- Returns NULL if either is NULL

-- Use COALESCE to provide default
SELECT COALESCE(price, 0) * COALESCE(quantity, 0) AS total FROM order_items;
```

### ORDER BY Clause

Sort results in ascending (ASC) or descending (DESC) order.

```sql
-- Single column sort (ascending by default)
SELECT * FROM products ORDER BY price;

-- Descending order
SELECT * FROM products ORDER BY price DESC;

-- Multiple columns
SELECT * FROM users 
ORDER BY last_name ASC, first_name ASC;

-- Sort by calculated field
SELECT 
    product_name,
    price,
    quantity,
    price * quantity AS total_value
FROM inventory
ORDER BY total_value DESC;
```

### LIMIT Clause

Restrict the number of rows returned.

```sql
-- Get first 10 rows
SELECT * FROM users LIMIT 10;

-- Get rows 11-20 (pagination)
SELECT * FROM users LIMIT 10 OFFSET 10;

-- Alternative syntax
SELECT * FROM users LIMIT 10, 10;  -- LIMIT offset, count

-- Common use: Get most recent entries
SELECT * FROM log_entries 
ORDER BY created_at DESC 
LIMIT 5;
```

### DISTINCT Keyword

Remove duplicate rows from results.

```sql
-- Get unique categories
SELECT DISTINCT category FROM products;

-- Multiple columns (combination must be unique)
SELECT DISTINCT category, subcategory FROM products;

-- Count unique values
SELECT COUNT(DISTINCT customer_id) AS unique_customers 
FROM orders;
```

### Practical Examples for Testing

#### Example 1: Verify User Registration
```sql
-- Check if user was created
SELECT * FROM users 
WHERE email = 'testuser@example.com' 
  AND created_at > NOW() - INTERVAL 1 MINUTE;
```

#### Example 2: Validate Product Inventory
```sql
-- Find products that need restocking
SELECT 
    product_name,
    stock_quantity,
    reorder_level
FROM products
WHERE stock_quantity < reorder_level
ORDER BY stock_quantity ASC;
```

#### Example 3: Check Order Status
```sql
-- Get recent orders for a customer
SELECT 
    order_id,
    order_date,
    total_amount,
    status
FROM orders
WHERE customer_email = 'john@example.com'
  AND order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY order_date DESC;
```

### Common Pitfalls and Best Practices

#### 1. String Comparison is Case-Sensitive (Sometimes)
```sql
-- May not match 'JOHN@EXAMPLE.COM' depending on collation
SELECT * FROM users WHERE email = 'john@example.com';

-- Case-insensitive comparison
SELECT * FROM users WHERE LOWER(email) = LOWER('john@example.com');
```

#### 2. Date Formatting
```sql
-- Correct date format: YYYY-MM-DD
SELECT * FROM orders WHERE order_date = '2024-01-15';

-- For datetime, be careful with time component
SELECT * FROM orders 
WHERE DATE(created_at) = '2024-01-15';  -- Ignores time
```

#### 3. Avoid SELECT * in Production
```sql
-- Bad: Retrieves all columns (inefficient)
SELECT * FROM large_table;

-- Good: Only get needed columns
SELECT id, name, email FROM large_table;
```

#### 4. Use Meaningful Aliases
```sql
-- Bad: Confusing aliases
SELECT u.n, o.t 
FROM users u 
JOIN orders o ON u.id = o.uid;

-- Good: Clear aliases
SELECT 
    users.name AS customer_name,
    orders.total AS order_total
FROM users
JOIN orders ON users.id = orders.user_id;
```

### Lab Exercises

#### Exercise 1: Basic Queries
Create these queries using the sample e-commerce database:

1. Find all active users
2. List products priced between $10 and $50
3. Get orders placed in the last 7 days
4. Find users with Gmail addresses
5. List top 5 most expensive products

#### Exercise 2: Complex Filters
1. Find products that are either 'Electronics' OR priced over $100
2. Get users registered this year who have made at least one order
3. Find orders with status 'pending' that are older than 24 hours
4. List products with low stock (less than 10) but high price (over $50)

#### Exercise 3: Testing Scenarios
Write queries to validate:
1. A new user registration was saved correctly
2. Product inventory decreased after an order
3. Order total matches sum of line items
4. No duplicate email addresses exist
5. All orders have valid customer IDs

### Quick Reference

#### SELECT Statement Structure
```sql
SELECT [DISTINCT] columns
FROM table
[WHERE conditions]
[ORDER BY columns [ASC|DESC]]
[LIMIT count [OFFSET offset]];
```

#### Operator Precedence
1. Parentheses ()
2. Multiplication/Division
3. Addition/Subtraction  
4. Comparison operators
5. NOT
6. AND
7. OR

#### Common Functions Preview
- `COUNT()`: Count rows
- `SUM()`: Add values
- `AVG()`: Calculate average
- `MAX()`: Find maximum
- `MIN()`: Find minimum
- `NOW()`: Current datetime
- `DATE()`: Extract date part

*We'll cover these in detail in Module 3*

### Summary

You've learned the foundation of SQL:
- How databases organize data
- Basic SELECT queries
- Filtering with WHERE
- Sorting with ORDER BY
- Limiting results
- Handling NULL values

These fundamentals form the basis for everything else in SQL. Practice these concepts thoroughly before moving to the next module!

### Next Steps

In Module 2, we'll explore:
- Working with multiple tables (JOINs)
- Modifying data (INSERT, UPDATE, DELETE)
- Understanding relationships
- Transaction management

Keep practicing, and remember: every complex query starts with SELECT * FROM!