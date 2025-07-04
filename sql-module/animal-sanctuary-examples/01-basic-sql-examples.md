# Basic SQL Examples - Animal Sanctuary Database

## 🎯 Learning Objectives
After completing these examples, you will be able to:
- Write basic SELECT statements
- Filter data using WHERE clauses
- Sort results with ORDER BY
- Use comparison and logical operators
- Work with NULL values

---

## 📊 Database Overview

**Connection Command:**
```bash
mariadb -u root -p'password123' animal_sanctuary
```

**Tables Available:**
- `animals` - Information about sanctuary animals
- `habitats` - Living environments for animals
- `staff` - Employees working at the sanctuary
- `medical_records` - Health records for animals

---

## 1. Basic SELECT Statements

### Example 1.1: Select All Data
**Goal:** See everything in the animals table

```sql
SELECT * FROM animals;
```

**Explanation:**
- `SELECT *` means "select all columns"
- `FROM animals` specifies which table to query
- `;` ends the SQL statement

**Expected Result:** All 10 animals with all their information

---

### Example 1.2: Select Specific Columns
**Goal:** Show only animal names and species

```sql
SELECT name, species FROM animals;
```

**Explanation:**
- Instead of `*`, we list specific column names
- Columns are separated by commas
- Order of columns in SELECT determines display order

**Try It:** Show only animal names and their ages

---

### Example 1.3: Select with Column Aliases
**Goal:** Make column names more readable

```sql
SELECT 
    name AS "Animal Name",
    species AS "Type of Animal",
    age AS "Age (Years)"
FROM animals;
```

**Explanation:**
- `AS` creates an alias (alternative name) for columns
- Quotes around aliases allow spaces and special characters
- Makes output more user-friendly

---

## 2. Filtering Data with WHERE

### Example 2.1: Simple WHERE Condition
**Goal:** Find only dogs in the sanctuary

```sql
SELECT name, breed, age 
FROM animals 
WHERE species = 'Dog';
```

**Explanation:**
- `WHERE` filters rows based on conditions
- `=` is the equality operator
- String values must be in single quotes
- Only rows meeting the condition are returned

**Expected Result:** Luna and Rex (both dogs)

---

### Example 2.2: Numeric Comparisons
**Goal:** Find animals older than 5 years

```sql
SELECT name, species, age 
FROM animals 
WHERE age > 5;
```

**Comparison Operators:**
- `>` greater than
- `<` less than
- `>=` greater than or equal
- `<=` less than or equal
- `=` equal to
- `!=` or `<>` not equal to

**Try It:** Find animals weighing more than 100 kg

---

### Example 2.3: Multiple Conditions with AND
**Goal:** Find dogs that are available for adoption

```sql
SELECT name, breed, adoption_status 
FROM animals 
WHERE species = 'Dog' AND adoption_status = 'Available';
```

**Explanation:**
- `AND` requires both conditions to be true
- Both conditions must be met for a row to be included

**Expected Result:** Only Luna (Rex is in foster care)

---

### Example 2.4: Multiple Conditions with OR
**Goal:** Find animals that are either cats or dogs

```sql
SELECT name, species, breed 
FROM animals 
WHERE species = 'Cat' OR species = 'Dog';
```

**Explanation:**
- `OR` requires at least one condition to be true
- If either condition is met, the row is included

**Expected Result:** Luna, Simba, Rex, and Whiskers

---

### Example 2.5: Using IN for Multiple Values
**Goal:** Find animals in specific habitats (more elegant than multiple ORs)

```sql
SELECT name, species, habitat_id 
FROM animals 
WHERE habitat_id IN (1, 2, 3);
```

**Explanation:**
- `IN` checks if a value matches any value in a list
- More readable than multiple OR conditions
- Equivalent to: `habitat_id = 1 OR habitat_id = 2 OR habitat_id = 3`

---

### Example 2.6: Pattern Matching with LIKE
**Goal:** Find animals whose names start with a specific letter

```sql
SELECT name, species 
FROM animals 
WHERE name LIKE 'S%';
```

**LIKE Patterns:**
- `%` matches any number of characters
- `_` matches exactly one character
- `'S%'` means "starts with S"
- `'%a'` means "ends with a"
- `'%ll%'` means "contains ll"

**Try It:** Find animals with names containing "a"

---

### Example 2.7: Working with NULL Values
**Goal:** Find animals where breed information is missing

```sql
SELECT name, species, breed 
FROM animals 
WHERE breed IS NULL;
```

**Important Notes:**
- Use `IS NULL` not `= NULL`
- Use `IS NOT NULL` to find non-empty values
- NULL represents missing or unknown data

---

## 3. Sorting Results with ORDER BY

### Example 3.1: Simple Sorting
**Goal:** Show animals sorted by age (youngest first)

```sql
SELECT name, species, age 
FROM animals 
ORDER BY age;
```

**Explanation:**
- `ORDER BY` sorts the result set
- Default sorting is ascending (ASC)
- NULL values typically appear first or last

---

### Example 3.2: Descending Order
**Goal:** Show animals by weight (heaviest first)

```sql
SELECT name, species, weight_kg 
FROM animals 
ORDER BY weight_kg DESC;
```

**Explanation:**
- `DESC` means descending order (largest to smallest)
- `ASC` means ascending order (smallest to largest) - this is default

**Expected Result:** Ella (elephant) will be first at 4500 kg

---

### Example 3.3: Multiple Column Sorting
**Goal:** Sort by species first, then by age within each species

```sql
SELECT name, species, age 
FROM animals 
ORDER BY species, age DESC;
```

**Explanation:**
- First sorts by species alphabetically
- Within each species group, sorts by age (oldest first)
- Each column can have its own ASC/DESC

---

### Example 3.4: Combining WHERE and ORDER BY
**Goal:** Find available animals, ordered by arrival date

```sql
SELECT name, species, arrival_date, adoption_status 
FROM animals 
WHERE adoption_status = 'Available' 
ORDER BY arrival_date DESC;
```

**Order of Operations:**
1. Filter rows with WHERE
2. Sort remaining rows with ORDER BY

---

## 4. Practical Exercises

### Exercise 4.1: Animal Adoption Board
Create a query for the adoption board showing available animals with their key information, sorted by how long they've been at the sanctuary.

**Expected Columns:** name, species, breed, age, arrival_date
**Filter:** Only available animals
**Sort:** Oldest arrival date first

<details>
<summary>Click for Solution</summary>

```sql
SELECT name, species, breed, age, arrival_date 
FROM animals 
WHERE adoption_status = 'Available' 
ORDER BY arrival_date;
```
</details>

---

### Exercise 4.2: Large Animal Report
Find all animals weighing more than 50 kg, showing their name, species, weight, and habitat information.

**Filter:** Weight > 50 kg
**Sort:** By weight (heaviest first)

<details>
<summary>Click for Solution</summary>

```sql
SELECT name, species, weight_kg, habitat_id 
FROM animals 
WHERE weight_kg > 50 
ORDER BY weight_kg DESC;
```
</details>

---

### Exercise 4.3: Recent Arrivals
Show animals that arrived in 2024, sorted by arrival date.

**Hint:** Use LIKE with the year pattern or comparison operators

<details>
<summary>Click for Solution</summary>

```sql
-- Option 1: Using LIKE
SELECT name, species, arrival_date 
FROM animals 
WHERE arrival_date LIKE '2024%' 
ORDER BY arrival_date;

-- Option 2: Using comparison operators
SELECT name, species, arrival_date 
FROM animals 
WHERE arrival_date >= '2024-01-01' 
ORDER BY arrival_date;
```
</details>

---

## 🔑 Key Concepts Summary

1. **SELECT** - Retrieves data from tables
2. **WHERE** - Filters rows based on conditions
3. **ORDER BY** - Sorts results
4. **Operators** - `=`, `>`, `<`, `LIKE`, `IN`, `IS NULL`
5. **Logical operators** - `AND`, `OR`, `NOT`
6. **Aliases** - Make column names more readable with `AS`

---

## 📝 Common Mistakes to Avoid

1. **Forgetting quotes around strings:** `WHERE species = Dog` ❌ → `WHERE species = 'Dog'` ✅
2. **Using = with NULL:** `WHERE breed = NULL` ❌ → `WHERE breed IS NULL` ✅
3. **Forgetting semicolon:** Can cause issues in some contexts
4. **Case sensitivity:** Column names are usually case-insensitive, but values might be case-sensitive
5. **Missing FROM clause:** Every SELECT needs a FROM (except in special cases)

---

**Next:** Move on to `02-intermediate-sql-examples.md` for JOINs and GROUP BY operations!