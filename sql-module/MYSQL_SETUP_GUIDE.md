# MySQL Setup Guide for SQL Training Presentation

## Pre-Presentation Checklist

### 1. Start MySQL Service
```bash
# Check if MySQL is running
sudo systemctl status mysql

# If not running, start it
sudo systemctl start mysql

# Enable automatic startup
sudo systemctl enable mysql
```

### 2. Setup the Training Database

Run the setup script that creates the `sql_training` database with sample e-commerce data:

```bash
# Navigate to the project directory
cd /home/christiaan/Documents/CapitecFramework

# Run the setup script as root
sudo mysql < sql-module/setup/clean-setup.sql
```

This script will:
- Create the `sql_training` database
- Create a user `sqltraining` with password `training123`
- Create tables: users, products, categories, orders, order_items, reviews, cart_items
- Insert sample data for demonstrations

### 3. Test Database Access

```bash
# Connect as the training user
mysql -u sqltraining -p sql_training
# Password: training123

# Once connected, verify the tables
SHOW TABLES;

# Check sample data
SELECT COUNT(*) FROM users;     # Should show 8 users
SELECT COUNT(*) FROM products;  # Should show 18 products
SELECT COUNT(*) FROM orders;    # Should show 7 orders
```

### 4. Alternative: Connect as Root
```bash
# If you prefer using root
mysql -u root -p

# Then use the database
USE sql_training;
```

## Quick Reference for Presentation

### Database Details
- **Database Name**: sql_training
- **Training User**: sqltraining / training123
- **Tables**: users, products, categories, orders, order_items, reviews, cart_items

### Module 1 Demo Queries
```sql
-- Show all tables
SHOW TABLES;

-- Basic SELECT
SELECT * FROM users LIMIT 5;

-- WHERE clause
SELECT * FROM products WHERE price > 100;

-- Pattern matching
SELECT * FROM users WHERE email LIKE '%@email.com';

-- Sorting
SELECT name, price FROM products ORDER BY price DESC LIMIT 5;
```

### Module 2 Demo Queries
```sql
-- Simple JOIN
SELECT 
    u.username,
    o.order_number,
    o.total_amount,
    o.status
FROM users u
JOIN orders o ON u.id = o.user_id;

-- Multiple JOINs
SELECT 
    o.order_number,
    u.username,
    p.name AS product_name,
    oi.quantity,
    oi.unit_price
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'delivered';
```

### Common Issues & Solutions

1. **MySQL service not running**
   ```bash
   sudo systemctl start mysql
   ```

2. **Access denied for user**
   ```bash
   # Reset root password if needed
   sudo mysql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'newpassword';
   FLUSH PRIVILEGES;
   ```

3. **Database doesn't exist**
   ```bash
   # Re-run the setup script
   sudo mysql < sql-module/setup/clean-setup.sql
   ```

### Visual Tools (Optional)
- **MySQL Workbench**: GUI tool for database management
- **DBeaver**: Universal database tool (supports MySQL)
- **Command line**: Sufficient for the presentation

## Presentation Flow

1. Start with showing the database structure
2. Demonstrate basic SELECT queries (Module 1)
3. Show data relationships with JOINs (Module 2)
4. Connect to Playwright tests if time permits

Good luck with your presentation!