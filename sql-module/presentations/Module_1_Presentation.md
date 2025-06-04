# Module 1: SQL Fundamentals
## Introduction to Databases and SQL

---

## Agenda

1. What is a Database?
2. Why Databases Matter in Testing
3. Introduction to MySQL
4. Basic SQL Queries
5. Hands-on Practice

---

## What is a Database?

```mermaid
graph LR
    A[Database] --> B[Tables]
    B --> C[Rows<br/>Records]
    B --> D[Columns<br/>Fields]
    
    E[Filing Cabinet] --> F[Folders]
    F --> G[Documents]
    F --> H[Categories]
    
    A -.-> E
    B -.-> F
    C -.-> G
    D -.-> H
    
    style A fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
    style B fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style C fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style D fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style E fill:#9C27B0,stroke:#7B1FA2,stroke-width:2px,color:#fff
    style F fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style G fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style H fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
```

**A database is an organized collection of structured information**

- **Tables** = Folders
- **Rows** = Individual documents  
- **Columns** = Fields on a form

---

## Why Databases Matter in Testing

```mermaid
flowchart TD
    A[User Action on UI] --> B[Application Logic]
    B --> C[Database Change]
    C --> D[Data Validation Required]
    
    D --> E[Data Persistence ✓]
    D --> F[Data Integrity ✓]
    D --> G[Business Logic ✓]
    D --> H[Performance ✓]
    
    style A fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
    style B fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style C fill:#F44336,stroke:#D32F2F,stroke-width:2px,color:#fff
    style D fill:#9C27B0,stroke:#7B1FA2,stroke-width:2px,color:#fff
    style E fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style F fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style G fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style H fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
```

### Critical Validation Points
1. **Data Persistence**: Did the action save correctly?
2. **Data Integrity**: Is data consistent and valid?
3. **Business Logic**: Are rules applied correctly?
4. **Performance**: Response time acceptable?

---

## Database Types

### Relational Databases (SQL)
```mermaid
graph TD
    A[Relational Database] --> B[Structured Tables]
    A --> C[Relationships]
    A --> D[ACID Compliance]
    A --> E[SQL Language]
    
    B --> F[Users]
    B --> G[Orders]
    B --> H[Products]
    
    style A fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
    style B fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style C fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style D fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style E fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style F fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style G fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style H fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
```

**Examples**: MySQL, PostgreSQL, Oracle, SQL Server

### Non-Relational (NoSQL)
- Flexible data structures
- Horizontal scaling
- Eventually consistent
- **Examples**: MongoDB, Redis, Cassandra

---

## MySQL Overview

### Why MySQL?
- ✅ **Open-source** and free
- ✅ **Battle-tested** (powers Facebook, Twitter, YouTube)
- ✅ **Reliable** in production environments
- ✅ **Excellent documentation** and community

### MySQL in Testing Context
```mermaid
flowchart LR
    A[Test Environment] --> B[MySQL Database]
    B --> C[Test Data Setup]
    B --> D[Validation Queries]
    B --> E[Data Cleanup]
    
    style A fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
    style B fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style C fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style D fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style E fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
```

---

## Basic SQL Syntax

### Core Query Structure
```sql
SELECT column1, column2
FROM table_name
WHERE condition
ORDER BY column1;
```

### The Four Fundamental Operations

```mermaid
graph LR
    A[CRUD Operations] --> B[CREATE<br/>INSERT]
    A --> C[READ<br/>SELECT]
    A --> D[UPDATE<br/>UPDATE]
    A --> E[DELETE<br/>DELETE]
    
    style A fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#fff
    style B fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style C fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style D fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#fff
    style E fill:#F44336,stroke:#D32F2F,stroke-width:2px,color:#fff
```

---

## SELECT Statements

### Basic SELECT
```sql
-- Select all columns
SELECT * FROM users;

-- Select specific columns
SELECT username, email FROM users;

-- Select with conditions
SELECT * FROM users WHERE is_active = true;
```

### Filtering and Sorting
```sql
-- Multiple conditions
SELECT * FROM products 
WHERE price > 100 AND stock_quantity > 0;

-- Sorting results
SELECT * FROM products 
ORDER BY price DESC, name ASC;

-- Limiting results
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## WHERE Clause Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal | `WHERE price = 100` |
| `!=` or `<>` | Not equal | `WHERE status != 'pending'` |
| `>`, `<`, `>=`, `<=` | Comparison | `WHERE price > 50` |
| `LIKE` | Pattern matching | `WHERE name LIKE '%phone%'` |
| `IN` | Value in list | `WHERE status IN ('pending', 'shipped')` |
| `BETWEEN` | Range | `WHERE price BETWEEN 100 AND 500` |
| `IS NULL` | Null check | `WHERE phone IS NULL` |

---

## Hands-on Practice

### Exercise 1: Basic Queries
```sql
-- 1. Get all active users
SELECT * FROM users WHERE is_active = true;

-- 2. Find products under $100
SELECT name, price FROM products WHERE price < 100;

-- 3. Get recent orders (last 30 days)
SELECT * FROM orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Exercise 2: Pattern Matching
```sql
-- Find all products with 'phone' in the name
SELECT * FROM products 
WHERE name LIKE '%phone%';

-- Find users with Gmail addresses
SELECT username, email FROM users 
WHERE email LIKE '%@gmail.com';
```

---

## Testing Integration Preview

```mermaid
sequenceDiagram
    participant T as Test
    participant UI as Browser UI
    participant DB as Database
    
    T->>UI: Perform user action
    T->>DB: Query initial state
    UI->>DB: Application updates data
    T->>DB: Query final state
    T->>T: Compare states
    
    Note over T,DB: Validate data persistence
```

**Next Module**: We'll learn JOINs to query multiple tables and complex relationships!

---

## Key Takeaways

1. ✅ Databases are essential for data persistence validation
2. ✅ SQL provides powerful querying capabilities
3. ✅ WHERE clauses enable precise data filtering
4. ✅ Understanding basic syntax prepares us for testing integration
5. ✅ MySQL is an excellent choice for test automation projects

### Questions & Discussion