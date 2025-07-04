# Lab 1: Basic SQL Exercises

## Prerequisites
- MySQL installed and running
- SQL training database loaded (`quick-start-database.sql`)
- MySQL Workbench or command line access

## Learning Objectives
- Write basic SELECT statements
- Use WHERE clauses effectively
- Sort and limit results
- Handle NULL values
- Apply learned concepts to testing scenarios

## Setup Instructions

1. **Connect to Database**
```bash
mysql -u root -p
USE sql_training;
```

2. **Verify Database Setup**
```sql
-- Check tables exist
SHOW TABLES;

-- Verify sample data
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS product_count FROM products;
SELECT COUNT(*) AS order_count FROM orders;
```

## Exercise Set 1: Basic SELECT Statements

### Exercise 1.1: Simple Selection
**Task**: Get basic user information

```sql
-- Your query here:
-- Expected result: List all users with username, email, and created_at

```

**Expected Output**: 8 users with their basic information

**Solution**:
```sql
SELECT username, email, created_at
FROM users;
```

### Exercise 1.2: Product Catalog
**Task**: Display product catalog information

```sql
-- Your query here:
-- Show SKU, name, price, and stock_quantity for all active products

```

**Verification**: Should show 18 active products

### Exercise 1.3: Order Summary
**Task**: Show order overview

```sql
-- Your query here:
-- Display order_number, status, total_amount, and created_at

```

## Exercise Set 2: Filtering with WHERE

### Exercise 2.1: User Status
**Task**: Find active users only

```sql
-- Your query here:
-- Get username and email for active users only

```

### Exercise 2.2: Price Range Products
**Task**: Find products in specific price range

```sql
-- Your query here:
-- Find products priced between $50 and $200

```

### Exercise 2.3: Recent Orders
**Task**: Find recent orders

```sql
-- Your query here:
-- Get orders placed in the last 30 days
-- Include order_number, user_id, status, and created_at

```

### Exercise 2.4: Pattern Matching
**Task**: Find users with Gmail addresses

```sql
-- Your query here:
-- Find all users with @gmail.com email addresses

```

### Exercise 2.5: Stock Management
**Task**: Find products needing restock

```sql
-- Your query here:
-- Find products where stock_quantity is less than reorder_level

```

## Exercise Set 3: Sorting and Limiting

### Exercise 3.1: Top Products by Price
**Task**: Most expensive products

```sql
-- Your query here:
-- Show top 5 most expensive products with name and price

```

### Exercise 3.2: Recent Users
**Task**: Newest users

```sql
-- Your query here:
-- Show 3 most recently registered users

```

### Exercise 3.3: Order History
**Task**: Sort orders by status and date

```sql
-- Your query here:
-- Show all orders sorted by status (ascending) and created_at (descending)

```

## Exercise Set 4: NULL Handling

### Exercise 4.1: Contact Information
**Task**: Find users missing phone numbers

```sql
-- Your query here:
-- Find users where phone is NULL

```

### Exercise 4.2: Product Categories
**Task**: Handle optional category assignments

```sql
-- Your query here:
-- Show all products, including those without assigned categories
-- Display name, price, and category_id (show NULL if not assigned)

```

### Exercise 4.3: User Activity
**Task**: Find users who never logged in

```sql
-- Your query here:
-- Find users where last_login is NULL

```

## Exercise Set 5: Testing Scenarios

### Exercise 5.1: User Registration Validation
**Scenario**: After a user registers through your web app, verify the data was saved correctly.

**Task**: Write a query to verify a specific user exists with correct details

```sql
-- Test scenario: User 'testuser1' should exist with email 'test1@example.com'
-- Your verification query here:

```

### Exercise 5.2: Product Inventory Check
**Scenario**: After a customer places an order, verify inventory was updated.

**Task**: Find products with critically low stock (less than 5 units)

```sql
-- Your query here:
-- This would be used to verify inventory updates after orders

```

### Exercise 5.3: Order Status Verification
**Scenario**: Verify orders are in correct status after processing.

**Task**: Find all pending orders older than 24 hours

```sql
-- Your query here:
-- These orders might need attention in a real system

```

### Exercise 5.4: Data Quality Check
**Scenario**: Ensure no duplicate email addresses exist.

**Task**: Find any duplicate email addresses in users table

```sql
-- Your query here:
-- Should return empty result in a healthy system

```

### Exercise 5.5: Business Rules Validation
**Scenario**: Verify pricing rules are followed.

**Task**: Find products with invalid pricing (price <= 0 or NULL)

```sql
-- Your query here:
-- Should help identify data quality issues

```

## Exercise Set 6: Mixed Practice

### Exercise 6.1: Customer Analysis
**Task**: Find potential VIP customers

```sql
-- Your query here:
-- Find users who have orders totaling more than $500
-- Show username, email, and total order amounts

```

### Exercise 6.2: Product Performance
**Task**: Identify popular product categories

```sql
-- Your query here:
-- Count products per category (show category_id and count)

```

### Exercise 6.3: Operational Metrics
**Task**: Generate daily dashboard data

```sql
-- Your query here:
-- Show count of orders by status

```

## Challenge Exercises

### Challenge 1: Complex Filtering
Find products that are:
- Active (is_active = TRUE)
- In Electronics category (category_id = 1 or 6 or 7)
- Priced over $100
- In stock (stock_quantity > 0)

Sort by price descending, limit to 10 results.

### Challenge 2: Data Validation Suite
Write a series of queries to validate:
1. No users have duplicate usernames
2. All orders have positive total_amount
3. All products have valid SKUs (not NULL, not empty)
4. No orders exist without corresponding users

### Challenge 3: Business Intelligence
Create queries for a simple report showing:
1. Total number of users
2. Total number of active products  
3. Total revenue from all orders
4. Average order value

## Answer Key Location
Answers are provided in separate file: `Lab_1_Solutions.sql`

## Assessment Criteria

### Correctness (60%)
- Queries return expected results
- Proper SQL syntax
- Correct use of operators and functions

### Code Quality (25%)
- Clean, readable queries
- Proper use of aliases where appropriate
- Consistent formatting

### Testing Mindset (15%)
- Understanding of testing scenarios
- Practical application of queries
- Data validation approaches

## Common Mistakes to Avoid

1. **Forgetting WHERE clauses** - Always be specific about what data you want
2. **Case sensitivity** - Remember MySQL string comparisons can be case-sensitive
3. **NULL handling** - Use `IS NULL` not `= NULL`
4. **Date formats** - Use 'YYYY-MM-DD' format for dates
5. **Missing semicolons** - End each statement with semicolon

## Next Steps

After completing this lab:
1. Review any incorrect answers
2. Practice the challenging queries until comfortable
3. Explore the database structure further
4. Prepare for Lab 2: JOINs and Multiple Tables

## Help and Resources

- MySQL Documentation: https://dev.mysql.com/doc/
- SQL Reference: Keep the basic syntax cheat sheet handy
- Ask instructor: Any conceptual questions
- Classmates: Help each other understand the logic

## Time Allocation
- Basic exercises (1-3): 30 minutes
- Filtering exercises (2): 45 minutes  
- Advanced exercises (4-6): 60 minutes
- Challenge exercises: 45 minutes
- **Total estimated time: 3 hours**

Remember: The goal is understanding, not speed. Take time to think through each query before writing it.