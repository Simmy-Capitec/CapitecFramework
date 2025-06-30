# Animal Sanctuary Database - SQL Learning Examples

## 🎯 Overview
This directory contains comprehensive SQL examples using a real-world animal sanctuary database. The examples progress from basic to advanced concepts, perfect for beginners learning SQL fundamentals through practical, engaging scenarios.

## 📊 Database Schema

### Tables Overview
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────────┐
│  habitats   │    │   animals    │    │    staff    │    │ medical_records  │
├─────────────┤    ├──────────────┤    ├─────────────┤    ├──────────────────┤
│ habitat_id  │◄──┐│ animal_id    │┌──►│ staff_id    │    │ record_id        │
│ habitat_name│   ││ name         ││   │ first_name  │◄──┐│ animal_id        │
│ habitat_type│   ││ species      ││   │ last_name   │   ││ staff_id         │
│ capacity    │   ││ breed        ││   │ role        │   ││ visit_date       │
│ current_occ │   ││ age          ││   │ hire_date   │   ││ diagnosis        │
│ temp_range  │   ││ weight_kg    ││   │ salary      │   ││ treatment        │
└─────────────┘   ││ arrival_date ││   │ specializ.  │   ││ medication       │
                  ││ adoption_st. ││   └─────────────┘   ││ follow_up_req    │
                  ││ habitat_id   │┘                     │└─animal_id        │
                  │└──────────────┘                     └─┘staff_id         │
                  └──────────────────────────────────────────────────────────┘
```

### Sample Data
- **5 Habitats:** Indoor, outdoor, and mixed environments
- **10 Animals:** Dogs, cats, exotic animals from elephants to penguins
- **6 Staff Members:** Veterinarians, caretakers, trainers, administrators
- **5 Medical Records:** Health checkups and treatments

---

## 🚀 Getting Started

### 1. Database Connection
```bash
# Connect to the animal sanctuary database
mariadb -u root -p'password123' animal_sanctuary
```

### 2. Quick Verification
```sql
-- Check that everything is set up correctly
SHOW TABLES;
SELECT COUNT(*) FROM animals;
SELECT COUNT(*) FROM habitats;
```

---

## 📚 Learning Path

### **Level 1: Basic SQL** → `01-basic-sql-examples.md`
- SELECT statements and column selection
- WHERE clauses and filtering
- Comparison and logical operators
- ORDER BY for sorting
- Working with NULL values
- Pattern matching with LIKE

**Key Skills:** Foundation concepts, basic data retrieval

---

### **Level 2: Intermediate SQL** → `02-intermediate-sql-examples.md`
- INNER and LEFT JOINs
- Combining multiple tables
- GROUP BY and aggregate functions
- HAVING clause for group filtering
- Date functions and calculations
- CASE statements for conditional logic

**Key Skills:** Data relationships, aggregation, business logic

---

### **Level 3: Advanced SQL** → `03-advanced-sql-examples.md`
- Subqueries for complex filtering
- Window functions and analytics
- Common Table Expressions (CTEs)
- Ranking and running totals
- Complex multi-step queries
- Real-world scenario building

**Key Skills:** Complex analysis, performance insights, decision support

---

## 🎓 Learning Approach

### Each Example Includes:
1. **Clear Goal** - What business problem we're solving
2. **SQL Query** - The complete, runnable code
3. **Explanation** - Step-by-step breakdown of how it works
4. **Expected Results** - What output you should see
5. **Try It Yourself** - Variations to practice
6. **Real-World Context** - Why this matters in practice

### Progressive Difficulty:
- **Basic:** Single table, simple conditions
- **Intermediate:** Multiple tables, aggregation
- **Advanced:** Complex logic, analytics, decision support

---

## 🔧 Practical Applications

### Business Scenarios Covered:
- **Adoption Management** - Which animals are ready for adoption?
- **Medical Care Tracking** - Who needs checkups or follow-ups?
- **Resource Planning** - Are habitats overcrowded or underutilized?
- **Staff Workload** - How balanced is the veterinary caseload?
- **Operational Analytics** - Trends, patterns, and insights

### Real-World Skills:
- Data filtering and sorting
- Combining data from multiple sources
- Calculating business metrics
- Creating reports and dashboards
- Building decision support systems

---

## 📋 Quick Reference

### Essential SQL Keywords:
```sql
SELECT, FROM, WHERE, ORDER BY         -- Basic retrieval
JOIN, INNER JOIN, LEFT JOIN           -- Combining tables
GROUP BY, HAVING, COUNT, SUM, AVG     -- Aggregation
CASE WHEN, IF, COALESCE               -- Conditional logic
RANK(), ROW_NUMBER(), PARTITION BY    -- Window functions
WITH (CTE), SUBQUERY, EXISTS          -- Advanced techniques
```

### Common Patterns:
```sql
-- Basic filtering
SELECT * FROM table WHERE condition;

-- Joining tables  
SELECT a.col, b.col FROM table1 a JOIN table2 b ON a.id = b.id;

-- Aggregating data
SELECT category, COUNT(*) FROM table GROUP BY category;

-- Window function
SELECT col, RANK() OVER (ORDER BY col) FROM table;
```

---

## 🎯 Learning Tips

### For Beginners:
1. **Start with basics** - Master SELECT and WHERE first
2. **Practice each example** - Don't just read, run the queries
3. **Modify and experiment** - Change conditions, add columns
4. **Understand the data** - Know what each table represents
5. **Build gradually** - Each level prepares you for the next

### For Practice:
1. **Try variations** - Change the criteria in WHERE clauses
2. **Combine techniques** - Mix JOINs with GROUP BY
3. **Create your own scenarios** - "What if I wanted to find...?"
4. **Explain to someone else** - Teaching solidifies understanding
5. **Use real data** - Apply concepts to your own datasets

---

## 🔍 Troubleshooting

### Common Issues:
- **Syntax errors:** Check semicolons, quotes, and parentheses
- **No results:** Verify your WHERE conditions aren't too restrictive
- **Wrong results:** Double-check your JOIN conditions
- **Performance:** Add appropriate indexes for large datasets

### Getting Help:
- Review the explanations in each example
- Check the "Common Mistakes" sections
- Practice with simpler versions first
- Use DESCRIBE table_name to understand table structure

---

## 🚀 Next Steps

After completing these examples, you'll be ready for:
- **Database design** - Creating your own tables and relationships
- **Performance optimization** - Indexes, query tuning
- **Stored procedures** - Reusable database functions
- **Data analysis** - Advanced analytics and reporting
- **Integration** - Using SQL with programming languages

---

**Ready to start? Begin with `01-basic-sql-examples.md` and work your way through!**

*Remember: The best way to learn SQL is by doing. Run every example, try the exercises, and don't be afraid to experiment!*