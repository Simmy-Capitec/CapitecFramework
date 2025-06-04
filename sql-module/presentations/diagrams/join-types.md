# SQL JOIN Types Visualization

```mermaid
graph TD
    subgraph "INNER JOIN"
        A1[Users Table] 
        A2[Orders Table]
        A3[Only matching records from both tables]
        A1 -.-> A3
        A2 -.-> A3
    end
    
    subgraph "LEFT JOIN"
        B1[Users Table<br/>ALL records]
        B2[Orders Table<br/>Matching only]
        B3[All users + their orders<br/>NULL for users without orders]
        B1 --> B3
        B2 -.-> B3
    end
    
    subgraph "RIGHT JOIN"
        C1[Users Table<br/>Matching only]
        C2[Orders Table<br/>ALL records]
        C3[All orders + their users<br/>NULL for orphaned orders]
        C1 -.-> C3
        C2 --> C3
    end
    
    subgraph "FULL OUTER JOIN"
        D1[Users Table<br/>ALL records]
        D2[Orders Table<br/>ALL records]
        D3[All users AND all orders<br/>NULL where no match]
        D1 --> D3
        D2 --> D3
    end
    
    style A3 fill:#c8e6c9
    style B3 fill:#fff3c4
    style C3 fill:#fff3c4
    style D3 fill:#ffccbc
```

## JOIN Usage in Testing

```mermaid
flowchart LR
    A[Test Scenario] --> B{Data Relationship}
    
    B -->|Need all matching data| C[INNER JOIN]
    B -->|Need all from main table| D[LEFT JOIN]
    B -->|Need all from related table| E[RIGHT JOIN]
    B -->|Need everything| F[FULL OUTER JOIN]
    
    C --> G[User + Order validation]
    D --> H[All users, with/without orders]
    E --> I[All orders, with/without users]
    F --> J[Complete data audit]
    
    style C fill:#c8e6c9
    style D fill:#fff3c4
    style E fill:#fff3c4
    style F fill:#ffccbc
```

## Common Testing Scenarios

| JOIN Type | Testing Use Case | Example |
|-----------|------------------|---------|
| **INNER JOIN** | Validate active relationships | Users who have placed orders |
| **LEFT JOIN** | Find missing relationships | Users without orders (potential leads) |
| **RIGHT JOIN** | Find orphaned data | Orders without valid users (data integrity) |
| **FULL OUTER** | Complete data audit | All users and orders for reporting |