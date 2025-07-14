# Intermediate SQL Examples - Animal Sanctuary Database

## 🎯 Learning Objectives
After completing these examples, you will be able to:
- Join multiple tables to combine related data
- Use different types of JOINs (INNER, LEFT, RIGHT)
- Group data and calculate aggregates
- Filter groups with HAVING
- Use built-in functions for calculations

---

## 📊 Database Relationships

```
habitats (1) ← has many ← animals (many)
staff (1) ← treats many ← medical_records (many) → belongs to one → animals (1)
```

**Key Relationships:**
- Each animal belongs to one habitat
- Each medical record belongs to one animal and one staff member
- Staff members can have multiple medical records

---

## 1. INNER JOINs - Combining Related Tables

### Example 1.1: Animals with Their Habitat Information
**Goal:** Show each animal with their habitat details

```sql
SELECT 
    a.name AS "Animal Name",
    a.species,
    h.habitat_name AS "Habitat",
    h.habitat_type AS "Type"
FROM animals a
INNER JOIN habitats h ON a.habitat_id = h.habitat_id;
```

**Explanation:**
- `INNER JOIN` combines rows where the join condition is met
- `a` and `h` are table aliases (shorthand for table names)
- `ON` specifies the join condition (how tables relate)
- Only animals with valid habitat_id values will appear

**Expected Result:** All 10 animals with their habitat information

---

### Example 1.2: Medical Records with Animal and Staff Details
**Goal:** Create a comprehensive medical report

```sql
SELECT 
    a.name AS "Patient",
    a.species,
    CONCAT(s.first_name, ' ', s.last_name) AS "Veterinarian",
    s.role,
    mr.visit_date,
    mr.diagnosis,
    mr.treatment
FROM medical_records mr
INNER JOIN animals a ON mr.animal_id = a.animal_id
INNER JOIN staff s ON mr.staff_id = s.staff_id
ORDER BY mr.visit_date DESC;
```

**Key Concepts:**
- **Triple JOIN:** Combining three tables
- **CONCAT():** Function to combine text fields
- **Multiple ON clauses:** Each JOIN needs its own condition

---

## 2. LEFT JOINs - Including All Records from Left Table

### Example 2.1: All Animals with Optional Medical Records
**Goal:** Show all animals, even those without medical records

```sql
SELECT 
    a.name,
    a.species,
    mr.visit_date,
    mr.diagnosis
FROM animals a
LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
ORDER BY a.name;
```

**Explanation:**
- `LEFT JOIN` includes ALL records from the left table (animals)
- If no matching medical record exists, those columns show NULL
- Useful for finding animals that haven't had checkups

**Expected Result:** All 10 animals, some with NULL medical data

---

### Example 2.2: Finding Animals Without Medical Records
**Goal:** Identify animals that need checkups

```sql
SELECT 
    a.name,
    a.species,
    a.arrival_date
FROM animals a
LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
WHERE mr.animal_id IS NULL;
```

**Explanation:**
- After LEFT JOIN, records without matches have NULL in right table columns
- `WHERE mr.animal_id IS NULL` filters to only non-matching records
- This finds animals who haven't had any medical visits

---

## 3. GROUP BY and Aggregate Functions

### Example 3.1: Count Animals by Species
**Goal:** See how many of each type of animal we have

```sql
SELECT 
    species,
    COUNT(*) AS "Number of Animals"
FROM animals
GROUP BY species
ORDER BY COUNT(*) DESC;
```

**Explanation:**
- `GROUP BY` groups rows with the same values together
- `COUNT(*)` counts rows in each group
- `ORDER BY COUNT(*)` sorts by the count value

**Expected Result:** Each species with its count

---

### Example 3.2: Habitat Occupancy Report
**Goal:** Compare current occupancy to capacity for each habitat

```sql
SELECT 
    h.habitat_name,
    h.capacity,
    COUNT(a.animal_id) AS "Current Animals",
    h.capacity - COUNT(a.animal_id) AS "Available Spaces",
    ROUND((COUNT(a.animal_id) / h.capacity) * 100, 1) AS "Occupancy %"
FROM habitats h
LEFT JOIN animals a ON h.habitat_id = a.habitat_id
GROUP BY h.habitat_id, h.habitat_name, h.capacity
ORDER BY "Occupancy %" DESC;
```

**Key Concepts:**
- **Calculated fields:** Using arithmetic operations
- **ROUND():** Function to round decimals
- **Grouping by multiple columns:** When you SELECT non-aggregated columns

---

### Example 3.3: Staff Workload Analysis
**Goal:** See how many medical procedures each staff member has performed

```sql
SELECT 
    CONCAT(s.first_name, ' ', s.last_name) AS "Staff Member",
    s.role,
    COUNT(mr.record_id) AS "Procedures Performed",
    MIN(mr.visit_date) AS "First Procedure",
    MAX(mr.visit_date) AS "Latest Procedure"
FROM staff s
LEFT JOIN medical_records mr ON s.staff_id = mr.staff_id
GROUP BY s.staff_id, s.first_name, s.last_name, s.role
ORDER BY "Procedures Performed" DESC;
```

**Aggregate Functions Used:**
- `COUNT()` - Number of records
- `MIN()` - Earliest date
- `MAX()` - Latest date
- `AVG()` - Average (useful for numeric data)
- `SUM()` - Total (useful for numeric data)

---

## 4. HAVING Clause - Filtering Groups

### Example 4.1: Find Habitats with High Occupancy
**Goal:** Show only habitats that are more than 50% full

```sql
SELECT 
    h.habitat_name,
    h.capacity,
    COUNT(a.animal_id) AS "Current Animals",
    ROUND((COUNT(a.animal_id) / h.capacity) * 100, 1) AS "Occupancy %"
FROM habitats h
LEFT JOIN animals a ON h.habitat_id = a.habitat_id
GROUP BY h.habitat_id, h.habitat_name, h.capacity
HAVING COUNT(a.animal_id) / h.capacity > 0.5
ORDER BY "Occupancy %" DESC;
```

**HAVING vs WHERE:**
- `WHERE` filters rows before grouping
- `HAVING` filters groups after grouping
- Use HAVING with aggregate functions

---

### Example 4.2: Find Species with Multiple Animals
**Goal:** Show only species that have more than one animal

```sql
SELECT 
    species,
    COUNT(*) AS "Number of Animals",
    AVG(age) AS "Average Age",
    AVG(weight_kg) AS "Average Weight"
FROM animals
GROUP BY species
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;
```

---

## 5. Advanced Functions and Calculations

### Example 5.1: Age Categories with CASE Statements
**Goal:** Categorize animals by age groups

```sql
SELECT 
    name,
    species,
    age,
    CASE 
        WHEN age <= 2 THEN 'Young'
        WHEN age <= 10 THEN 'Adult'
        ELSE 'Senior'
    END AS "Age Category",
    CASE 
        WHEN adoption_status = 'Available' THEN '✅ Ready for Adoption'
        WHEN adoption_status = 'Foster' THEN '🏠 In Foster Care'
        WHEN adoption_status = 'Adopted' THEN '❤️ Adopted'
        ELSE '🏥 Medical Hold'
    END AS "Status"
FROM animals
ORDER BY age;
```

**CASE Statement:**
- Like if-then-else logic in SQL
- Useful for categorizing or formatting data
- Each WHEN condition is checked in order

---

### Example 5.2: Days Since Arrival Calculation
**Goal:** Calculate how long each animal has been at the sanctuary

```sql
SELECT 
    name,
    species,
    arrival_date,
    DATEDIFF(CURDATE(), arrival_date) AS "Days at Sanctuary",
    CASE 
        WHEN DATEDIFF(CURDATE(), arrival_date) < 30 THEN 'New Arrival'
        WHEN DATEDIFF(CURDATE(), arrival_date) < 365 THEN 'Resident'
        ELSE 'Long-term Resident'
    END AS "Residency Status"
FROM animals
ORDER BY arrival_date;
```

**Date Functions:**
- `CURDATE()` - Current date
- `DATEDIFF()` - Difference between two dates
- `DATE_ADD()` - Add time to a date
- `DATE_SUB()` - Subtract time from a date

---

## 6. Complex Queries with Multiple Techniques

### Example 6.1: Comprehensive Animal Profile Report
**Goal:** Create a detailed report combining multiple concepts

```sql
SELECT 
    a.name,
    a.species,
    a.breed,
    a.age,
    h.habitat_name,
    a.adoption_status,
    DATEDIFF(CURDATE(), a.arrival_date) AS "Days Here",
    COUNT(mr.record_id) AS "Medical Visits",
    CASE 
        WHEN COUNT(mr.record_id) = 0 THEN 'Needs Checkup'
        WHEN COUNT(mr.record_id) >= 3 THEN 'Well Monitored'
        ELSE 'Regular Care'
    END AS "Medical Status"
FROM animals a
LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
GROUP BY a.animal_id, a.name, a.species, a.breed, a.age, h.habitat_name, a.adoption_status, a.arrival_date
ORDER BY a.name;
```

---

### Example 6.2: Veterinarian Performance Report
**Goal:** Analyze veterinarian caseloads and follow-up rates

```sql
SELECT 
    CONCAT(s.first_name, ' ', s.last_name) AS "Veterinarian",
    COUNT(mr.record_id) AS "Total Cases",
    SUM(CASE WHEN mr.follow_up_required = TRUE THEN 1 ELSE 0 END) AS "Follow-ups Required",
    ROUND(
        (SUM(CASE WHEN mr.follow_up_required = TRUE THEN 1 ELSE 0 END) / COUNT(mr.record_id)) * 100, 
        1
    ) AS "Follow-up Rate %",
    MIN(mr.visit_date) AS "First Case",
    MAX(mr.visit_date) AS "Latest Case"
FROM staff s
INNER JOIN medical_records mr ON s.staff_id = mr.staff_id
WHERE s.role = 'Veterinarian'
GROUP BY s.staff_id, s.first_name, s.last_name
ORDER BY "Total Cases" DESC;
```

---

## 7. Practical Exercises

### Exercise 7.1: Adoption Readiness Report
Create a query showing available animals with their habitat information and medical history count.

**Requirements:**
- Only show available animals
- Include animal details, habitat name, and count of medical visits
- Sort by animals with the most medical attention first

<details>
<summary>Click for Solution</summary>

```sql
SELECT 
    a.name,
    a.species,
    a.age,
    h.habitat_name,
    COUNT(mr.record_id) AS "Medical Visits"
FROM animals a
LEFT JOIN habitats h ON a.habitat_id = h.habitat_id
LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
WHERE a.adoption_status = 'Available'
GROUP BY a.animal_id, a.name, a.species, a.age, h.habitat_name
ORDER BY COUNT(mr.record_id) DESC;
```
</details>

---

### Exercise 7.2: Habitat Efficiency Analysis
Find habitats that are either overcrowded (>80% capacity) or underutilized (<30% capacity).

**Hint:** Use HAVING with OR conditions

<details>
<summary>Click for Solution</summary>

```sql
SELECT 
    h.habitat_name,
    h.capacity,
    COUNT(a.animal_id) AS "Current Animals",
    ROUND((COUNT(a.animal_id) / h.capacity) * 100, 1) AS "Occupancy %"
FROM habitats h
LEFT JOIN animals a ON h.habitat_id = a.habitat_id
GROUP BY h.habitat_id, h.habitat_name, h.capacity
HAVING (COUNT(a.animal_id) / h.capacity) > 0.8 
    OR (COUNT(a.animal_id) / h.capacity) < 0.3
ORDER BY "Occupancy %" DESC;
```
</details>

---

### Exercise 7.3: Medical Follow-up Alert System
Create a report showing animals that have medical records requiring follow-up.

**Requirements:**
- Show animal details and latest medical visit
- Include veterinarian information
- Only include cases where follow-up is required

<details>
<summary>Click for Solution</summary>

```sql
SELECT 
    a.name,
    a.species,
    mr.visit_date AS "Last Visit",
    mr.diagnosis,
    CONCAT(s.first_name, ' ', s.last_name) AS "Veterinarian",
    DATEDIFF(CURDATE(), mr.visit_date) AS "Days Since Visit"
FROM animals a
INNER JOIN medical_records mr ON a.animal_id = mr.animal_id
INNER JOIN staff s ON mr.staff_id = s.staff_id
WHERE mr.follow_up_required = TRUE
ORDER BY mr.visit_date;
```
</details>

---

## 🔑 Key Concepts Summary

1. **INNER JOIN** - Only matching records from both tables
2. **LEFT JOIN** - All records from left table, matching from right
3. **GROUP BY** - Groups rows for aggregate calculations
4. **HAVING** - Filters groups (use with aggregates)
5. **Aggregate Functions** - COUNT(), SUM(), AVG(), MIN(), MAX()
6. **CASE Statements** - Conditional logic in SQL
7. **Date Functions** - CURDATE(), DATEDIFF(), etc.

---

## 📝 Common Mistakes to Avoid

1. **Forgetting GROUP BY:** If you use aggregates, non-aggregated columns need GROUP BY
2. **Using WHERE instead of HAVING:** Use HAVING for filtering groups
3. **Wrong JOIN type:** Choose INNER vs LEFT based on whether you want all records
4. **Missing table aliases:** Use aliases for clarity in multi-table queries
5. **Incorrect join conditions:** Make sure ON clause matches the right foreign keys

---

**Next:** Move on to `03-advanced-sql-examples.md` for subqueries and window functions!