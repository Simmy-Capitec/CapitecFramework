# Advanced* SQL Examples - Animal Sanctuary Database
*Advanced for beginners - focusing on practical real-world scenarios

## 🎯 Learning Objectives
After completing these examples, you will be able to:
- Write subqueries for complex data filtering
- Use window functions for ranking and running totals
- Create Common Table Expressions (CTEs) for readable queries
- Combine multiple advanced techniques
- Understand when to use each approach

---

## 1. Subqueries - Queries Within Queries

### Example 1.1: Find Animals Heavier Than Average
**Goal:** Show animals that weigh more than the average weight

```sql
SELECT 
    name,
    species,
    weight_kg,
    (SELECT AVG(weight_kg) FROM animals) AS "Average Weight"
FROM animals
WHERE weight_kg > (SELECT AVG(weight_kg) FROM animals)
ORDER BY weight_kg DESC;
```

**Explanation:**
- Inner query `(SELECT AVG(weight_kg) FROM animals)` calculates average weight
- Outer query uses this value for comparison
- Subquery runs first, then its result is used in the main query

---

### Example 1.2: Find Animals in the Most Popular Habitat
**Goal:** Show animals living in the habitat with the most residents

```sql
SELECT 
    a.name,
    a.species,
    h.habitat_name
FROM animals a
JOIN habitats h ON a.habitat_id = h.habitat_id
WHERE a.habitat_id = (
    SELECT habitat_id 
    FROM animals 
    GROUP BY habitat_id 
    ORDER BY COUNT(*) DESC 
    LIMIT 1
);
```

**Breakdown:**
1. Subquery finds habitat_id with most animals
2. Main query shows animals in that habitat
3. `LIMIT 1` ensures we get only the top result

---

### Example 1.3: Animals Without Recent Medical Checkups
**Goal:** Find animals who haven't had medical visits in the last 6 months

```sql
SELECT 
    a.name,
    a.species,
    a.arrival_date,
    DATEDIFF(CURDATE(), a.arrival_date) AS "Days at Sanctuary"
FROM animals a
WHERE a.animal_id NOT IN (
    SELECT DISTINCT mr.animal_id 
    FROM medical_records mr 
    WHERE mr.visit_date > DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
);
```

**Key Concepts:**
- `NOT IN` excludes animals found in the subquery
- `DATE_SUB()` subtracts time from current date
- `DISTINCT` prevents duplicate animal_ids in subquery

---

## 2. Window Functions - Advanced Analytics

### Example 2.1: Ranking Animals by Age Within Species
**Goal:** Rank animals from oldest to youngest within each species group

```sql
SELECT 
    name,
    species,
    age,
    RANK() OVER (PARTITION BY species ORDER BY age DESC) AS "Age Rank in Species",
    ROW_NUMBER() OVER (PARTITION BY species ORDER BY age DESC) AS "Row Number"
FROM animals
ORDER BY species, age DESC;
```

**Window Function Components:**
- `RANK()` - Assigns ranks (can have ties)
- `ROW_NUMBER()` - Assigns unique sequential numbers
- `PARTITION BY` - Creates separate groups
- `ORDER BY` - Determines ranking order

---

### Example 2.2: Running Total of Animals by Arrival Date
**Goal:** Show cumulative count of animals as they arrived

```sql
SELECT 
    name,
    species,
    arrival_date,
    COUNT(*) OVER (ORDER BY arrival_date ROWS UNBOUNDED PRECEDING) AS "Total Animals So Far"
FROM animals
ORDER BY arrival_date;
```

**Explanation:**
- `ROWS UNBOUNDED PRECEDING` includes all rows from start to current row
- Creates a running count showing sanctuary growth over time

---

### Example 2.3: Compare Each Animal to Species Average
**Goal:** Show how each animal's weight compares to their species average

```sql
SELECT 
    name,
    species,
    weight_kg,
    ROUND(AVG(weight_kg) OVER (PARTITION BY species), 2) AS "Species Avg Weight",
    ROUND(weight_kg - AVG(weight_kg) OVER (PARTITION BY species), 2) AS "Difference from Avg",
    CASE 
        WHEN weight_kg > AVG(weight_kg) OVER (PARTITION BY species) THEN 'Above Average'
        WHEN weight_kg < AVG(weight_kg) OVER (PARTITION BY species) THEN 'Below Average'
        ELSE 'Average'
    END AS "Weight Status"
FROM animals
WHERE weight_kg IS NOT NULL
ORDER BY species, weight_kg DESC;
```

---

## 3. Common Table Expressions (CTEs) - Readable Complex Queries

### Example 3.1: Habitat Utilization Analysis with CTEs
**Goal:** Break down complex habitat analysis into readable steps

```sql
WITH habitat_stats AS (
    -- Step 1: Calculate basic habitat statistics
    SELECT 
        h.habitat_id,
        h.habitat_name,
        h.capacity,
        COUNT(a.animal_id) AS current_animals,
        ROUND((COUNT(a.animal_id) / h.capacity) * 100, 1) AS occupancy_rate
    FROM habitats h
    LEFT JOIN animals a ON h.habitat_id = a.habitat_id
    GROUP BY h.habitat_id, h.habitat_name, h.capacity
),
habitat_categories AS (
    -- Step 2: Categorize habitats by occupancy
    SELECT 
        *,
        CASE 
            WHEN occupancy_rate >= 80 THEN 'Overcrowded'
            WHEN occupancy_rate >= 50 THEN 'Well Used'
            WHEN occupancy_rate >= 20 THEN 'Moderate'
            ELSE 'Underutilized'
        END AS utilization_category
    FROM habitat_stats
)
-- Step 3: Final output with summary
SELECT 
    habitat_name,
    capacity,
    current_animals,
    occupancy_rate,
    utilization_category,
    capacity - current_animals AS spaces_available
FROM habitat_categories
ORDER BY occupancy_rate DESC;
```

**CTE Benefits:**
- Breaks complex logic into named, reusable steps
- More readable than nested subqueries
- Can reference previous CTEs

---

### Example 3.2: Medical Care Timeline Analysis
**Goal:** Analyze medical care patterns with multiple CTEs

```sql
WITH animal_medical_summary AS (
    -- Step 1: Summarize medical history per animal
    SELECT 
        a.animal_id,
        a.name,
        a.species,
        a.arrival_date,
        COUNT(mr.record_id) AS total_visits,
        MIN(mr.visit_date) AS first_medical_visit,
        MAX(mr.visit_date) AS last_medical_visit,
        SUM(CASE WHEN mr.follow_up_required THEN 1 ELSE 0 END) AS follow_ups_needed
    FROM animals a
    LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
    GROUP BY a.animal_id, a.name, a.species, a.arrival_date
),
care_categories AS (
    -- Step 2: Categorize animals by care level
    SELECT 
        *,
        DATEDIFF(CURDATE(), arrival_date) AS days_at_sanctuary,
        CASE 
            WHEN total_visits = 0 THEN 'No Medical History'
            WHEN total_visits >= 3 THEN 'High Care'
            WHEN total_visits >= 1 THEN 'Regular Care'
            ELSE 'Minimal Care'
        END AS care_level,
        CASE 
            WHEN last_medical_visit IS NULL THEN 'Never'
            WHEN DATEDIFF(CURDATE(), last_medical_visit) <= 30 THEN 'Recent'
            WHEN DATEDIFF(CURDATE(), last_medical_visit) <= 90 THEN 'Moderate'
            ELSE 'Overdue'
        END AS last_visit_status
    FROM animal_medical_summary
)
-- Step 3: Final comprehensive report
SELECT 
    name,
    species,
    days_at_sanctuary,
    total_visits,
    care_level,
    last_visit_status,
    follow_ups_needed,
    CASE 
        WHEN last_visit_status = 'Never' OR last_visit_status = 'Overdue' THEN '🔴 Priority'
        WHEN follow_ups_needed > 0 THEN '🟡 Follow-up Needed'
        ELSE '🟢 Up to Date'
    END AS care_priority
FROM care_categories
ORDER BY 
    CASE care_priority 
        WHEN '🔴 Priority' THEN 1 
        WHEN '🟡 Follow-up Needed' THEN 2 
        ELSE 3 
    END,
    days_at_sanctuary DESC;
```

---

## 4. Advanced Analytical Queries

### Example 4.1: Staff Efficiency and Workload Balance
**Goal:** Analyze staff workload distribution and identify patterns

```sql
WITH staff_workload AS (
    SELECT 
        s.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) AS staff_name,
        s.role,
        s.specialization,
        COUNT(mr.record_id) AS procedures_performed,
        AVG(DATEDIFF(CURDATE(), mr.visit_date)) AS avg_days_since_procedure
    FROM staff s
    LEFT JOIN medical_records mr ON s.staff_id = mr.staff_id
    GROUP BY s.staff_id, s.first_name, s.last_name, s.role, s.specialization
),
workload_analysis AS (
    SELECT 
        *,
        AVG(procedures_performed) OVER () AS avg_procedures_all_staff,
        MAX(procedures_performed) OVER () AS max_procedures,
        RANK() OVER (ORDER BY procedures_performed DESC) AS workload_rank
    FROM staff_workload
)
SELECT 
    staff_name,
    role,
    specialization,
    procedures_performed,
    ROUND(avg_procedures_all_staff, 1) AS avg_across_all_staff,
    CASE 
        WHEN procedures_performed > avg_procedures_all_staff * 1.5 THEN 'High Workload'
        WHEN procedures_performed > avg_procedures_all_staff THEN 'Above Average'
        WHEN procedures_performed > 0 THEN 'Below Average'
        ELSE 'No Procedures'
    END AS workload_status,
    workload_rank
FROM workload_analysis
ORDER BY procedures_performed DESC;
```

---

### Example 4.2: Seasonal Arrival Patterns
**Goal:** Analyze when animals typically arrive at the sanctuary

```sql
WITH monthly_arrivals AS (
    SELECT 
        YEAR(arrival_date) AS arrival_year,
        MONTH(arrival_date) AS arrival_month,
        MONTHNAME(arrival_date) AS month_name,
        COUNT(*) AS animals_arrived,
        GROUP_CONCAT(name SEPARATOR ', ') AS animals_list
    FROM animals
    GROUP BY YEAR(arrival_date), MONTH(arrival_date), MONTHNAME(arrival_date)
),
arrival_patterns AS (
    SELECT 
        *,
        AVG(animals_arrived) OVER () AS avg_monthly_arrivals,
        SUM(animals_arrived) OVER (ORDER BY arrival_year, arrival_month) AS cumulative_arrivals
    FROM monthly_arrivals
)
SELECT 
    arrival_year,
    month_name,
    animals_arrived,
    ROUND(avg_monthly_arrivals, 1) AS avg_monthly,
    cumulative_arrivals,
    animals_list,
    CASE 
        WHEN animals_arrived > avg_monthly_arrivals * 1.5 THEN 'Peak Month'
        WHEN animals_arrived > avg_monthly_arrivals THEN 'Above Average'
        ELSE 'Below Average'
    END AS activity_level
FROM arrival_patterns
ORDER BY arrival_year, arrival_month;
```

---

## 5. Practical Real-World Scenarios

### Example 5.1: Adoption Recommendation Engine
**Goal:** Create a smart system to recommend animals for adoption

```sql
WITH adoption_scoring AS (
    SELECT 
        a.animal_id,
        a.name,
        a.species,
        a.breed,
        a.age,
        DATEDIFF(CURDATE(), a.arrival_date) AS days_waiting,
        COUNT(mr.record_id) AS medical_visits,
        SUM(CASE WHEN mr.follow_up_required THEN 1 ELSE 0 END) AS pending_follow_ups,
        
        -- Scoring criteria
        CASE 
            WHEN a.age <= 2 THEN 10        -- Young animals score higher
            WHEN a.age <= 5 THEN 8
            WHEN a.age <= 10 THEN 6
            ELSE 4
        END AS age_score,
        
        CASE 
            WHEN DATEDIFF(CURDATE(), a.arrival_date) > 365 THEN 10  -- Long-term residents priority
            WHEN DATEDIFF(CURDATE(), a.arrival_date) > 180 THEN 8
            WHEN DATEDIFF(CURDATE(), a.arrival_date) > 90 THEN 6
            ELSE 4
        END AS waiting_score,
        
        CASE 
            WHEN COUNT(mr.record_id) >= 2 AND SUM(CASE WHEN mr.follow_up_required THEN 1 ELSE 0 END) = 0 THEN 10  -- Good medical history
            WHEN COUNT(mr.record_id) >= 1 AND SUM(CASE WHEN mr.follow_up_required THEN 1 ELSE 0 END) = 0 THEN 8
            WHEN COUNT(mr.record_id) = 0 THEN 5  -- Needs checkup
            ELSE 3  -- Has pending medical issues
        END AS health_score
        
    FROM animals a
    LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
    WHERE a.adoption_status = 'Available'
    GROUP BY a.animal_id, a.name, a.species, a.breed, a.age, a.arrival_date
)
SELECT 
    name,
    species,
    breed,
    age,
    days_waiting,
    medical_visits,
    pending_follow_ups,
    (age_score + waiting_score + health_score) AS total_adoption_score,
    CASE 
        WHEN (age_score + waiting_score + health_score) >= 25 THEN '⭐⭐⭐ Highly Recommended'
        WHEN (age_score + waiting_score + health_score) >= 20 THEN '⭐⭐ Recommended'
        WHEN (age_score + waiting_score + health_score) >= 15 THEN '⭐ Consider'
        ELSE '❗ Needs Attention'
    END AS recommendation
FROM adoption_scoring
ORDER BY total_adoption_score DESC, days_waiting DESC;
```

---

### Example 5.2: Resource Planning Dashboard
**Goal:** Create a comprehensive overview for sanctuary management

```sql
WITH sanctuary_overview AS (
    -- Overall statistics
    SELECT 
        COUNT(DISTINCT a.animal_id) AS total_animals,
        COUNT(DISTINCT CASE WHEN a.adoption_status = 'Available' THEN a.animal_id END) AS available_for_adoption,
        COUNT(DISTINCT h.habitat_id) AS total_habitats,
        COUNT(DISTINCT s.staff_id) AS total_staff,
        COUNT(DISTINCT mr.record_id) AS total_medical_records
    FROM animals a
    CROSS JOIN habitats h
    CROSS JOIN staff s
    CROSS JOIN medical_records mr
),
species_breakdown AS (
    SELECT 
        species,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM animals), 1) AS percentage
    FROM animals
    GROUP BY species
),
habitat_utilization AS (
    SELECT 
        AVG((COUNT(a.animal_id) * 100.0) / h.capacity) AS avg_occupancy_rate,
        MAX((COUNT(a.animal_id) * 100.0) / h.capacity) AS max_occupancy_rate,
        MIN((COUNT(a.animal_id) * 100.0) / h.capacity) AS min_occupancy_rate
    FROM habitats h
    LEFT JOIN animals a ON h.habitat_id = a.habitat_id
    GROUP BY h.habitat_id
)
SELECT 
    'Sanctuary Statistics' AS metric_category,
    CONCAT(
        'Total Animals: ', so.total_animals, ' | ',
        'Available for Adoption: ', so.available_for_adoption, ' | ',
        'Staff Members: ', so.total_staff, ' | ',
        'Medical Records: ', so.total_medical_records
    ) AS summary
FROM sanctuary_overview so

UNION ALL

SELECT 
    'Species Distribution' AS metric_category,
    GROUP_CONCAT(
        CONCAT(species, ': ', count, ' (', percentage, '%)')
        ORDER BY count DESC
        SEPARATOR ' | '
    ) AS summary
FROM species_breakdown

UNION ALL

SELECT 
    'Habitat Utilization' AS metric_category,
    CONCAT(
        'Average Occupancy: ', ROUND(hu.avg_occupancy_rate, 1), '% | ',
        'Highest: ', ROUND(hu.max_occupancy_rate, 1), '% | ',
        'Lowest: ', ROUND(hu.min_occupancy_rate, 1), '%'
    ) AS summary
FROM habitat_utilization hu;
```

---

## 6. Challenge Exercises

### Exercise 6.1: Medical Alert System
Create a query that identifies animals requiring immediate medical attention based on multiple criteria.

**Requirements:**
- Animals without medical records who've been at sanctuary >30 days
- Animals with overdue follow-ups (>60 days since last visit requiring follow-up)
- Rank by priority level

<details>
<summary>Click for Solution</summary>

```sql
WITH medical_alerts AS (
    SELECT 
        a.animal_id,
        a.name,
        a.species,
        a.arrival_date,
        DATEDIFF(CURDATE(), a.arrival_date) AS days_at_sanctuary,
        COUNT(mr.record_id) AS medical_visits,
        MAX(mr.visit_date) AS last_visit,
        SUM(CASE WHEN mr.follow_up_required THEN 1 ELSE 0 END) AS follow_ups_needed,
        MAX(CASE WHEN mr.follow_up_required THEN mr.visit_date END) AS last_follow_up_visit
    FROM animals a
    LEFT JOIN medical_records mr ON a.animal_id = mr.animal_id
    GROUP BY a.animal_id, a.name, a.species, a.arrival_date
)
SELECT 
    name,
    species,
    days_at_sanctuary,
    medical_visits,
    last_visit,
    CASE 
        WHEN medical_visits = 0 AND days_at_sanctuary > 30 THEN 'No Initial Checkup'
        WHEN follow_ups_needed > 0 AND DATEDIFF(CURDATE(), last_follow_up_visit) > 60 THEN 'Overdue Follow-up'
        WHEN last_visit IS NOT NULL AND DATEDIFF(CURDATE(), last_visit) > 365 THEN 'Annual Checkup Due'
        ELSE 'Monitor'
    END AS alert_type,
    CASE 
        WHEN medical_visits = 0 AND days_at_sanctuary > 30 THEN 1
        WHEN follow_ups_needed > 0 AND DATEDIFF(CURDATE(), last_follow_up_visit) > 60 THEN 2
        WHEN last_visit IS NOT NULL AND DATEDIFF(CURDATE(), last_visit) > 365 THEN 3
        ELSE 4
    END AS priority_rank
FROM medical_alerts
WHERE (medical_visits = 0 AND days_at_sanctuary > 30)
   OR (follow_ups_needed > 0 AND DATEDIFF(CURDATE(), COALESCE(last_follow_up_visit, '1900-01-01')) > 60)
   OR (last_visit IS NOT NULL AND DATEDIFF(CURDATE(), last_visit) > 365)
ORDER BY priority_rank, days_at_sanctuary DESC;
```
</details>

---

## 🔑 Key Advanced Concepts Summary

1. **Subqueries** - Queries within queries for complex filtering
2. **Window Functions** - Advanced analytics without grouping
3. **CTEs** - Readable, step-by-step query building
4. **Ranking Functions** - RANK(), ROW_NUMBER(), DENSE_RANK()
5. **Running Totals** - Cumulative calculations over ordered data
6. **Complex CASE Statements** - Multi-criteria decision logic

---

## 🚀 When to Use Each Technique

- **Subqueries:** When you need to filter based on calculated values
- **Window Functions:** When you need analytics without losing row detail
- **CTEs:** When your query logic is complex and needs to be readable
- **Ranking:** When you need to order or categorize within groups
- **Running Totals:** When you need cumulative metrics over time

---

**Next:** Move on to practical exercises and real-world applications!