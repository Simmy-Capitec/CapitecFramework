# Database Testing Workflow with Playwright

```mermaid
flowchart TD
    A[Test Start] --> B[Setup Test Data]
    B --> C[Database Connection]
    C --> D[UI Action in Browser]
    D --> E[Database Query/Validation]
    E --> F{Data Valid?}
    
    F -->|Yes| G[Continue Test]
    F -->|No| H[Test Failure]
    
    G --> I{More Actions?}
    I -->|Yes| D
    I -->|No| J[Cleanup Data]
    
    J --> K[Close DB Connection]
    K --> L[Test Complete]
    
    H --> M[Log Error Details]
    M --> N[Cleanup on Failure]
    N --> K
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style H fill:#ffcdd2
    style M fill:#ffcdd2
```

## Testing Patterns

```mermaid
graph LR
    subgraph "UI Layer"
        A[User Action]
        B[Browser UI]
    end
    
    subgraph "Application Layer"
        C[API Call]
        D[Business Logic]
    end
    
    subgraph "Database Layer"
        E[SQL Query]
        F[Data Storage]
    end
    
    subgraph "Test Validation"
        G[UI Assertion]
        H[DB Validation]
        I[API Response Check]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    
    B --> G
    F --> H
    C --> I
    
    style G fill:#c8e6c9
    style H fill:#c8e6c9
    style I fill:#c8e6c9
```

## Key Testing Principles

1. **Test Data Isolation**: Each test should have independent data
2. **State Verification**: Validate both UI and database state
3. **Rollback Strategy**: Clean up test data after each test
4. **Performance Monitoring**: Track query execution times
5. **Error Scenarios**: Test edge cases and error conditions