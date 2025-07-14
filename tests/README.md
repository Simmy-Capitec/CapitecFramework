# Progressive API and SQL Test Framework

## 🎯 Overview

This testing framework provides a progressive learning path for API automation and SQL testing, designed to take learners from basic concepts to advanced integration testing. Each test category mirrors the others, allowing students to see the same concepts implemented across different layers.

## 📁 Directory Structure

```
tests/
├── api/                    # Progressive API tests (Level 1-5)
├── sql/                    # Mirror SQL tests (Level 1-5)  
├── integration/            # Combined API+SQL tests (Level 1-3)
└── README.md              # This documentation
```

## 🎓 Learning Progression

### 📊 Level 1: Basic Operations
**Learning Objectives:** Understand fundamental concepts and basic operations

#### API Tests (`api/01-basic-get-requests.spec.js`)
- Basic HTTP GET requests
- Response status code validation
- JSON response parsing
- Data structure verification
- Error handling for 404s

#### SQL Tests (`sql/01-basic-select-queries.spec.js`)
- Basic SELECT statements
- Database connection handling
- Data type validation
- Table relationship verification
- Record counting and constraints

#### Integration Tests (`integration/01-basic-api-db-sync.spec.js`)
- API response vs database state comparison
- Data consistency validation
- CRUD operation verification across layers
- Data type consistency checks

---

### 🔍 Level 2: Filtered Operations
**Learning Objectives:** Work with specific records and filtered data

#### API Tests (`api/02-single-resource-operations.spec.js`)
- Single resource retrieval by ID
- Handle missing resources (404 errors)
- Detailed response structure validation
- Edge cases with invalid IDs
- Relationship data in responses

#### SQL Tests (`sql/02-filtered-queries.spec.js`)
- WHERE clauses and parameterized queries
- Comparison operators and LIKE patterns
- JOIN operations for related data
- Filtering by multiple criteria
- Safe query practices

#### Integration Tests (`integration/02-complex-operations-sync.spec.js`)
- Cart operations synchronization
- Order creation with items
- Filtering consistency across layers
- Complex relationship validation

---

### ✏️ Level 3: Create Operations
**Learning Objectives:** Master data creation and validation

#### API Tests (`api/03-create-operations.spec.js`)
- POST requests with JSON payloads
- Required vs optional field validation
- Data type and format validation
- Duplicate prevention
- Error response handling

#### SQL Tests (`sql/03-insert-operations.spec.js`)
- INSERT statements with parameterization
- Auto-increment ID handling
- Default value application
- Constraint violation testing
- Hierarchical data insertion

#### Integration Tests (`integration/03-end-to-end-workflows.spec.js`)
- Complete business workflow testing
- Multi-step operation validation
- Performance consistency checks
- Data integrity verification
- Complex business rule validation

---

### 🔄 Level 4: Advanced Operations
**Learning Objectives:** Complex operations and business logic

#### API Tests (`api/04-advanced-operations.spec.js`)
- UPDATE operations (PUT/PATCH)
- DELETE operations
- Complex cart management
- Multi-item order creation
- Query parameters and filtering
- Helper functions for test data

#### SQL Tests (`sql/04-update-delete-operations.spec.js`)
- UPDATE statements with conditions
- DELETE operations with constraints
- Bulk operations
- Transaction-like operations
- JOIN operations in updates
- Foreign key considerations

---

### 🚀 Level 5: Complex Workflows
**Learning Objectives:** Real-world scenarios and advanced concepts

#### API Tests (`api/05-complex-workflows.spec.js`)
- End-to-end business workflows
- Product review systems
- Complex order scenarios
- Concurrent operation handling
- Business rule validation
- Edge case and error scenarios

#### SQL Tests (`sql/05-complex-queries.spec.js`)
- Advanced JOINs and subqueries
- Aggregate functions and GROUP BY
- Window functions and analytics
- Complex business logic queries
- Performance considerations
- Comprehensive business KPIs

---

## 🛠️ Running the Tests

### Prerequisites
1. **Start API Server:**
   ```bash
   node src/api-server.js
   ```

2. **Ensure Database is Running:**
   ```bash
   mysql -u sqltraining -ptraining123 sql_training -e "SHOW TABLES;"
   ```

### Run Individual Test Categories

```bash
# API Tests (Progressive Levels 1-5)
npx playwright test tests/api/01-basic-get-requests.spec.js
npx playwright test tests/api/02-single-resource-operations.spec.js
npx playwright test tests/api/03-create-operations.spec.js
npx playwright test tests/api/04-advanced-operations.spec.js
npx playwright test tests/api/05-complex-workflows.spec.js

# SQL Tests (Mirror API Progression)
npx playwright test tests/sql/01-basic-select-queries.spec.js
npx playwright test tests/sql/02-filtered-queries.spec.js
npx playwright test tests/sql/03-insert-operations.spec.js
npx playwright test tests/sql/04-update-delete-operations.spec.js
npx playwright test tests/sql/05-complex-queries.spec.js

# Integration Tests (Combined API+SQL)
npx playwright test tests/integration/01-basic-api-db-sync.spec.js
npx playwright test tests/integration/02-complex-operations-sync.spec.js
npx playwright test tests/integration/03-end-to-end-workflows.spec.js
```

### Run Complete Categories

```bash
# All API tests
npx playwright test tests/api/

# All SQL tests  
npx playwright test tests/sql/

# All Integration tests
npx playwright test tests/integration/

# Everything
npx playwright test tests/
```

### Run with Different Options

```bash
# With browser window visible
npx playwright test tests/api/ --headed

# Generate detailed report
npx playwright test tests/ --reporter=html

# Run in debug mode
npx playwright test tests/api/01-basic-get-requests.spec.js --debug

# Run specific test
npx playwright test tests/api/01-basic-get-requests.spec.js -g "should fetch all users"
```

## 📚 Learning Path Recommendations

### For Beginners
1. Start with **Level 1** across all categories to understand basics
2. Compare API vs SQL approaches for the same operations
3. See how Integration tests validate both layers

### For Intermediate Learners
1. Focus on **Levels 2-3** for core automation skills
2. Study the helper functions in Level 4+ tests
3. Understand data flow between API and database

### For Advanced Learners
1. Analyze **Levels 4-5** for complex scenarios
2. Study performance testing approaches
3. Learn business logic implementation patterns
4. Explore concurrent operation handling

## 🔧 Key Learning Concepts

### API Testing Concepts
- HTTP methods and status codes
- JSON request/response handling
- Parameterized requests
- Error handling and validation
- Authentication simulation
- Performance considerations

### SQL Testing Concepts
- Database connection management
- Parameterized queries for security
- Transaction handling
- Data type validation
- Referential integrity
- Complex query optimization

### Integration Testing Concepts
- Data consistency validation
- Multi-layer operation testing
- Performance comparison
- Business rule enforcement
- Error propagation testing
- End-to-end workflow validation

## 🎯 Best Practices Demonstrated

### Test Design
- Progressive complexity building
- Comprehensive test data creation
- Proper cleanup procedures
- Parameterized test approaches
- Error scenario coverage

### Code Quality
- Helper function extraction
- Consistent naming conventions
- Clear test descriptions
- Comprehensive assertions
- Resource management

### Database Testing
- Safe parameterized queries
- Transaction considerations
- Referential integrity validation
- Performance awareness
- Data cleanup strategies

## 🚨 Important Notes

1. **Test Order Independence:** All tests are designed to be independent and can run in any order
2. **Data Cleanup:** Each test cleans up its own test data to prevent interference
3. **Database State:** Tests assume a populated database with some existing data
4. **API Server:** Most tests require the API server to be running on localhost:3000
5. **Concurrent Safety:** Integration tests include concurrent operation scenarios
6. **Performance:** Some tests include performance validations between API and SQL

## 🎓 Assessment Suggestions

### Level 1-2 Assessment
- Can student write basic API tests?
- Do they understand SQL SELECT statements?
- Can they validate data consistency?

### Level 3-4 Assessment
- Can student handle CRUD operations?
- Do they understand data relationships?
- Can they write parameterized queries safely?

### Level 5 Assessment
- Can student design complex test scenarios?
- Do they understand business logic testing?
- Can they handle concurrent operations?
- Do they consider performance implications?

---

*This framework serves as both a learning tool and a comprehensive test suite for the e-commerce API and database system.*