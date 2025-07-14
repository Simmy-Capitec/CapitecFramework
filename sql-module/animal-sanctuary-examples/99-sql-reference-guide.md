# SQL Reference Guide - Animal Sanctuary Database

## 🎯 Quick Reference for SQL Fundamentals

This guide provides a comprehensive reference for SQL concepts used in the animal sanctuary examples, organized for quick lookup and review.

---

## 📊 Database Schema Quick Reference

### Table Relationships
```sql
-- Primary Keys and Foreign Keys
habitats.habitat_id (PK) ← animals.habitat_id (FK)
animals.animal_id (PK) ← medical_records.animal_id (FK)  
staff.staff_id (PK) ← medical_records.staff_id (FK)
```

### Table Structures
```sql
-- Animals table
animal_id, name, species, breed, age, weight_kg, 
arrival_date, adoption_status, habitat_id

-- Habitats table  
habitat_id, habitat_name, habitat_type, capacity, 
current_occupancy, temperature_range

-- Staff table
staff_id, first_name, last_name, role, hire_date, 
salary, specialization

-- Medical records table
record_id, animal_id, staff_id, visit_date, diagnosis, 
treatment, medication, follow_up_required
```

---

## 🔤 SQL Keywords and Syntax

### Basic SELECT Structure
```sql
SELECT [DISTINCT] column1, column2, ...
FROM table_name
[WHERE condition]
[GROUP BY column1, column2, ...]
[HAVING condition]
[ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...]
[LIMIT number];
```

### Essential Keywords
| Keyword | Purpose | Example |
|---------|---------|---------|
| `SELECT` | Choose columns to retrieve | `SELECT name, age` |
| `FROM` | Specify source table | `FROM animals` |
| `WHERE` | Filter rows | `WHERE age > 5` |
| `ORDER BY` | Sort results | `ORDER BY name ASC` |
| `GROUP BY` | Group rows for aggregation | `GROUP BY species` |
| `HAVING` | Filter groups | `HAVING COUNT(*) > 2` |
| `LIMIT` | Restrict number of results | `LIMIT 10` |
| `DISTINCT` | Remove duplicates | `SELECT DISTINCT species` |

---

## 🔍 Operators and Conditions

### Comparison Operators
```sql
=          -- Equal to
!=  or  <> -- Not equal to
<          -- Less than
>          -- Greater than
<=         -- Less than or equal to
>=         -- Greater than or equal to
```

### Logical Operators
```sql
AND        -- Both conditions must be true
OR         -- At least one condition must be true
NOT        -- Negates a condition
IN         -- Value is in a list
NOT IN     -- Value is not in a list
BETWEEN    -- Value is within a range
LIKE       -- Pattern matching
IS NULL    -- Value is null
IS NOT NULL-- Value is not null
```

### Pattern Matching with LIKE
```sql
'A%'       -- Starts with A
'%ing'     -- Ends with ing
'%cat%'    -- Contains cat
'_at'      -- Three letters ending in 'at'
'[A-C]%'   -- Starts with A, B, or C (MySQL specific)
```

---

## 🔗 JOIN Operations

### JOIN Types
```sql
-- INNER JOIN - Only matching records
SELECT a.name, h.habitat_name
FROM animals a
INNER JOIN habitats h ON a.habitat_id = h.habitat_id;

-- LEFT JOIN - All records from left table
SELECT a.name, mr.diagnosis
FROM animals a  
LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id;

-- RIGHT JOIN - All records from right table
SELECT a.name, h.habitat_name
FROM animals a
RIGHT JOIN habitats h ON a.habitat_id = h.habitat_id;

-- CROSS JOIN - Cartesian product (every combination)
SELECT a.name, s.first_name
FROM animals a
CROSS JOIN staff s;
```

### Multiple JOINs
```sql
SELECT a.name, h.habitat_name, s.first_name
FROM animals a
JOIN habitats h ON a.habitat_id = h.habitat_id
JOIN medical_records mr ON a.animal_id = mr.animal_id
JOIN staff s ON mr.staff_id = s.staff_id;
```

---

## 📊 Aggregate Functions

### Common Aggregates
```sql
COUNT(*)           -- Count all rows
COUNT(column)      -- Count non-null values
COUNT(DISTINCT x)  -- Count unique values
SUM(column)        -- Add up values
AVG(column)        -- Calculate average
MIN(column)        -- Find minimum value
MAX(column)        -- Find maximum value
```

### GROUP BY Examples
```sql
-- Count by species
SELECT species, COUNT(*) 
FROM animals 
GROUP BY species;

-- Average age by habitat
SELECT h.habitat_name, AVG(a.age)
FROM animals a
JOIN habitats h ON a.habitat_id = h.habitat_id
GROUP BY h.habitat_name;
```

---

## 🪟 Window Functions

### Basic Window Function Syntax
```sql
function() OVER (
    [PARTITION BY column1, column2, ...]
    [ORDER BY column1, column2, ...]
    [ROWS or RANGE specification]
)
```

### Common Window Functions
```sql
-- Ranking functions
RANK()             -- Ranking with gaps
DENSE_RANK()       -- Ranking without gaps  
ROW_NUMBER()       -- Sequential numbering
NTILE(n)          -- Divide into n buckets

-- Analytical functions
LAG(column, n)     -- Previous row value
LEAD(column, n)    -- Next row value
FIRST_VALUE()      -- First value in window
LAST_VALUE()       -- Last value in window

-- Aggregate window functions
SUM() OVER()       -- Running total
AVG() OVER()       -- Moving average
COUNT() OVER()     -- Running count
```

### Examples
```sql
-- Rank animals by age within species
SELECT name, species, age,
       RANK() OVER (PARTITION BY species ORDER BY age DESC) as age_rank
FROM animals;

-- Running total of animals by arrival date
SELECT name, arrival_date,
       COUNT(*) OVER (ORDER BY arrival_date) as running_total
FROM animals;
```

---

## 🔄 Subqueries

### Types of Subqueries
```sql
-- Scalar subquery (returns single value)
SELECT name, weight_kg
FROM animals 
WHERE weight_kg > (SELECT AVG(weight_kg) FROM animals);

-- Row subquery (returns single row)
SELECT * FROM animals
WHERE (species, age) = (SELECT species, MAX(age) FROM animals GROUP BY species LIMIT 1);

-- Table subquery (returns multiple rows/columns)
SELECT name FROM animals
WHERE habitat_id IN (SELECT habitat_id FROM habitats WHERE capacity > 10);
```

### Correlated Subqueries
```sql
-- Subquery references outer query
SELECT a1.name, a1.species, a1.age
FROM animals a1
WHERE a1.age > (
    SELECT AVG(a2.age) 
    FROM animals a2 
    WHERE a2.species = a1.species
);
```

---

## 🏗️ Common Table Expressions (CTEs)

### Basic CTE Syntax
```sql
WITH cte_name AS (
    SELECT column1, column2, ...
    FROM table_name
    WHERE condition
)
SELECT * FROM cte_name;
```

### Multiple CTEs
```sql
WITH habitat_stats AS (
    SELECT habitat_id, COUNT(*) as animal_count
    FROM animals
    GROUP BY habitat_id
),
habitat_summary AS (
    SELECT h.habitat_name, hs.animal_count
    FROM habitats h
    JOIN habitat_stats hs ON h.habitat_id = hs.habitat_id
)
SELECT * FROM habitat_summary;
```

---

## 📅 Date and Time Functions

### Common Date Functions
```sql
-- Current date/time
CURDATE()          -- Current date (2024-06-25)
CURTIME()          -- Current time (14:30:22)  
NOW()              -- Current datetime (2024-06-25 14:30:22)

-- Date arithmetic
DATE_ADD(date, INTERVAL n unit)    -- Add time
DATE_SUB(date, INTERVAL n unit)    -- Subtract time
DATEDIFF(date1, date2)             -- Difference in days

-- Date parts
YEAR(date)         -- Extract year
MONTH(date)        -- Extract month (1-12)
DAY(date)          -- Extract day
DAYNAME(date)      -- Day name (Monday, Tuesday, ...)
MONTHNAME(date)    -- Month name (January, February, ...)

-- Formatting
DATE_FORMAT(date, format)          -- Custom formatting
```

### Examples
```sql
-- Animals that arrived in the last 30 days
SELECT name, arrival_date
FROM animals
WHERE arrival_date > DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Calculate days at sanctuary
SELECT name, 
       DATEDIFF(CURDATE(), arrival_date) as days_here
FROM animals;
```

---

## 🔧 String Functions

### Common String Functions
```sql
CONCAT(str1, str2, ...)    -- Combine strings
UPPER(string)              -- Convert to uppercase
LOWER(string)              -- Convert to lowercase  
LENGTH(string)             -- String length
SUBSTRING(string, start, length)  -- Extract substring
TRIM(string)               -- Remove leading/trailing spaces
REPLACE(string, old, new)  -- Replace text
```

### Examples
```sql
-- Combine first and last name
SELECT CONCAT(first_name, ' ', last_name) as full_name
FROM staff;

-- Find names with specific patterns
SELECT name 
FROM animals
WHERE UPPER(name) LIKE '%A%';
```

---

## 🔢 Mathematical Functions

### Common Math Functions
```sql
ROUND(number, decimals)    -- Round to decimal places
CEIL(number)               -- Round up to integer
FLOOR(number)              -- Round down to integer
ABS(number)                -- Absolute value
MOD(number, divisor)       -- Modulo (remainder)
POWER(number, exponent)    -- Exponentiation
SQRT(number)               -- Square root
```

---

## 🎯 CASE Statements

### Simple CASE
```sql
CASE column_name
    WHEN value1 THEN result1
    WHEN value2 THEN result2
    ELSE default_result
END
```

### Searched CASE
```sql
CASE 
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ELSE default_result
END
```

### Example
```sql
SELECT name, age,
    CASE 
        WHEN age <= 2 THEN 'Young'
        WHEN age <= 10 THEN 'Adult'
        ELSE 'Senior'
    END as age_category
FROM animals;
```

---

## ⚡ Performance Tips

### Indexing Guidelines
```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_species ON animals(species);
CREATE INDEX idx_arrival_date ON animals(arrival_date);

-- Composite indexes for multiple column queries
CREATE INDEX idx_species_age ON animals(species, age);
```

### Query Optimization
1. **Use WHERE clauses** to filter early
2. **SELECT only needed columns** instead of SELECT *
3. **Use appropriate JOIN types** (INNER vs LEFT)
4. **Add indexes** on columns used in WHERE, JOIN, and ORDER BY
5. **Use LIMIT** when you don't need all results
6. **Avoid functions in WHERE clauses** when possible

---

## 🚨 Common Mistakes

### Syntax Errors
```sql
-- ❌ Wrong
SELECT name species FROM animals WHERE age > 5

-- ✅ Correct  
SELECT name, species FROM animals WHERE age > 5;
```

### Logic Errors
```sql
-- ❌ Wrong (always false)
WHERE age > 10 AND age < 5

-- ✅ Correct
WHERE age > 10 OR age < 5
```

### NULL Handling
```sql
-- ❌ Wrong
WHERE breed = NULL

-- ✅ Correct
WHERE breed IS NULL
```

### JOIN Issues
```sql
-- ❌ Cartesian product (missing ON clause)
SELECT * FROM animals, habitats;

-- ✅ Proper JOIN
SELECT * FROM animals a JOIN habitats h ON a.habitat_id = h.habitat_id;
```

---

## 📚 Best Practices

### Code Style
1. **Use meaningful aliases** for tables (`a` for animals, `h` for habitats)
2. **Capitalize SQL keywords** for readability
3. **Indent subqueries and complex conditions**
4. **Use consistent naming conventions**
5. **Add comments** for complex logic

### Query Structure
1. **Start simple** and build complexity gradually
2. **Test frequently** while building complex queries
3. **Use CTEs** for complex multi-step logic
4. **Break down** complex problems into smaller parts
5. **Consider performance** implications of your queries

---

## 🔗 Quick Examples by Use Case

### Finding Data
```sql
-- Find specific records
SELECT * FROM animals WHERE name = 'Luna';

-- Find patterns
SELECT * FROM animals WHERE name LIKE 'S%';

-- Find ranges
SELECT * FROM animals WHERE age BETWEEN 5 AND 10;
```

### Counting and Summarizing
```sql
-- Simple counts
SELECT COUNT(*) FROM animals;

-- Grouped counts
SELECT species, COUNT(*) FROM animals GROUP BY species;

-- Conditional counts
SELECT COUNT(CASE WHEN age > 5 THEN 1 END) as older_animals FROM animals;
```

### Combining Data
```sql
-- Basic join
SELECT a.name, h.habitat_name 
FROM animals a 
JOIN habitats h ON a.habitat_id = h.habitat_id;

-- Multiple table join
SELECT a.name, h.habitat_name, s.first_name
FROM animals a
JOIN medical_records mr ON a.animal_id = mr.animal_id
JOIN staff s ON mr.staff_id = s.staff_id
JOIN habitats h ON a.habitat_id = h.habitat_id;
```

---

This reference guide covers the essential SQL concepts used throughout the animal sanctuary examples. Keep it handy while practicing and building your own queries!