# E-commerce Database ER Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone
        timestamp created_at
        timestamp updated_at
        boolean is_active
        enum role
    }
    
    CATEGORIES {
        int id PK
        varchar name
        text description
        timestamp created_at
    }
    
    PRODUCTS {
        int id PK
        varchar name
        text description
        decimal price
        int stock_quantity
        int category_id FK
        varchar sku UK
        timestamp created_at
        timestamp updated_at
        boolean is_active
    }
    
    ORDERS {
        int id PK
        int user_id FK
        varchar order_number UK
        decimal total_amount
        enum status
        text shipping_address
        text billing_address
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
        decimal total_price
    }
    
    USERS ||--o{ ORDERS : "places"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    ORDERS ||--o{ ORDER_ITEMS : "includes"
    PRODUCTS ||--o{ ORDER_ITEMS : "included_in"
```

## Relationship Explanations

- **USERS → ORDERS**: One user can place many orders (1:Many)
- **CATEGORIES → PRODUCTS**: One category contains many products (1:Many)  
- **ORDERS → ORDER_ITEMS**: One order includes many items (1:Many)
- **PRODUCTS → ORDER_ITEMS**: One product can be in many order items (1:Many)

## Key Points for Testing

1. **Foreign Key Constraints**: Ensure referential integrity
2. **Unique Constraints**: Test duplicate prevention (username, email, sku, order_number)
3. **Business Rules**: Stock quantity validation, order total calculations
4. **Data Types**: Ensure proper data type validation