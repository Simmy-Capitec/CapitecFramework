# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Project: SQL Zero-to-Hero Module Development

### Progress Tracking
- ✅ MCP Server Recommendations completed
- ✅ Module Structure and outline completed  
- ✅ Teacher's Guide completed
- ✅ Candidate's Guide completed
- ✅ MySQL database setup with sample e-commerce data
- ✅ Module 1 (SQL Fundamentals) content completed
- ✅ Module 2 (Intermediate SQL - JOINs & Data Manipulation) completed
- ✅ Module 3 (Advanced SQL - Aggregates, Window Functions, Performance) completed
- ✅ Module 4 (SQL in Test Automation) content completed
- ✅ Module 5 (Advanced Testing Scenarios) content completed
- ✅ Module 6 (Final Project - E-commerce Test Suite) completed
- ✅ Lab 1 (Basic SQL Exercises) created
- ✅ Lab 4 (Playwright + SQL Integration) created
- ✅ MCP Servers installed and configured for development
- ✅ Presentation materials with mermaid diagrams created
- ✅ Course Overview presentation completed
- ✅ Module 1, 2, and 4 presentations completed
- 🔄 Currently working on: Remaining presentations (Modules 3, 5, 6) and assessment materials

### SQL Module Location
All SQL module materials are in: `/sql-module/`

### Core Curriculum Status: COMPLETE ✅
**12-Week Course Structure:**
- **Weeks 1-2:** SQL Fundamentals (Module 1)
- **Weeks 3-4:** Intermediate SQL (Module 2) 
- **Weeks 5-6:** Advanced SQL (Module 3)
- **Weeks 7-8:** SQL in Test Automation (Module 4)
- **Weeks 9-10:** Advanced Testing Scenarios (Module 5)
- **Weeks 11-12:** Final Project (Module 6)

### MCP Servers Configuration ✅
**Installed and Configured:**
- MySQL MCP Server (`@benborla29/mcp-server-mysql`) - Connected to training database at 34.10.193.47
- Mermaid MCP Server (`@devstefancho/mermaid-mcp`) - For ER diagrams and flowcharts
- GitHub MCP Server (`@modelcontextprotocol/server-github`) - Repository management with token
- PostgreSQL MCP Server (`postgres-mcp`) - Alternative database option
- Filesystem MCP Server (`@modelcontextprotocol/server-filesystem`) - Project file access

**Configuration Files:**
- `.mcp-config.json` - Complete MCP server configuration with credentials
- `.env` - Environment variables for database and GitHub access
- `setup-mcp.sh` - Setup verification script

### Presentation Materials Status ✅ (Partially Complete)
**Completed:**
- ✅ Course Overview presentation with learning journey visualization
- ✅ Mermaid diagrams: E-commerce ER diagram, SQL query flow, testing workflow, JOIN types
- ✅ Module 1: SQL Fundamentals presentation
- ✅ Module 2: Intermediate SQL (JOINs & Data Manipulation) presentation  
- ✅ Module 4: SQL in Test Automation presentation

**Location:** `/sql-module/presentations/`

### Presentation Structure
```
sql-module/presentations/
├── diagrams/                     # Mermaid visualization diagrams
│   ├── ecommerce-er-diagram.md   # Database relationships
│   ├── sql-query-flow.md         # Query execution visualization
│   ├── testing-workflow.md       # Testing process flows
│   └── join-types.md             # JOIN operations visual guide
├── Course_Overview.md            # Complete 12-week course introduction
├── Module_1_Presentation.md      # SQL Fundamentals 
├── Module_2_Presentation.md      # JOINs & Data Manipulation
└── Module_4_Presentation.md      # SQL in Test Automation
```

**Features:**
- Markdown-based presentations easily convertible to slides
- Interactive mermaid diagrams for complex concepts
- Hands-on code examples integrated throughout
- Progressive learning structure with visual learning aids

### Remaining Tasks
1. ✅ ~~Complete Module 2-6 content~~
2. ✅ ~~Create practical exercises for Playwright integration~~
3. ✅ ~~Setup MCP servers for enhanced development~~
4. ✅ ~~Create presentation materials with diagrams and visualizations~~ (Mostly complete)
5. Complete remaining presentations (Modules 3, 5, 6)
6. Create assessment materials and project assignments
7. Compile additional resources and references

## Development Commands

### Running Tests
```bash
# Run all tests
npm test

# Run tests in specific browser
npm run test:chrome    # Chromium only
npm run test:firefox   # Firefox only
npm run test:safari    # WebKit/Safari only

# Run tests with debugging
npm run test:debug     # Step-through debugging
npm run test:ui        # Interactive UI mode
npm run test:headed    # With browser window visible

# Run tests in mobile viewport
npm run test:mobile    # Tests on Pixel 5 viewport

# Run a single test file
npx playwright test tests/login.spec.js

# Generate test code
npm run codegen        # Launch Playwright code generator
```

### Environment Variables
- `BASE_URL`: Target application URL (default: https://www.saucedemo.com)
- `HEADLESS`: Run in headless mode (default: true)
- `SLOWMO`: Slow down execution in milliseconds (default: 0)

## Architecture Overview

This is a Playwright test automation framework using the Page Object Model pattern for E2E testing.

### Core Structure
- **Page Objects** (`src/pages/`): Each page extends `BasePage` with encapsulated selectors and methods
- **Test Fixtures** (`src/fixtures/testFixtures.js`): Custom fixtures provide page objects and test data to tests
- **Test Data** (`src/data/`): JSON-based test data managed by `TestDataManager`
- **Tests** (`tests/`): Test files using Playwright's test runner with custom fixtures

### Key Patterns
1. **Page Object Access**: Tests receive page objects via fixtures:
   ```javascript
   test('test name', async ({ loginPage, productsPage, testData }) => {
     // Direct access to page objects and test data
   });
   ```

2. **Selector Storage**: CSS selectors are stored as class properties in page constructors

3. **Test Structure**: Use `test.describe()` for grouping, `test.beforeEach()` for setup

4. **Assertions**: Use Playwright's built-in `expect` assertions

### Test Configuration
- Tests run in parallel by default
- Multi-browser support: Chromium, Firefox, WebKit, and mobile viewports
- Artifacts on failure: screenshots, videos, and traces
- Test timeout: 60 seconds per test

### Database and API
- MySQL database connectivity available via `src/utils/database.js`
- Training database: Remote MySQL at 34.10.193.47 with SSL
- Database connection helper: `sql-module/setup/database-connection.js`
- Basic API testing examples in `tests/Api/` directory

### MCP Development Tools
```bash
# List configured MCP servers
claude mcp list

# Add MCP servers (if needed)
claude mcp add mysql "@benborla29/mcp-server-mysql" --env MYSQL_HOST=34.10.193.47 --env MYSQL_PORT=3306 --env MYSQL_USER=root --env MYSQL_PASSWORD="2mD%nP9;rKH=;;Nj" --env MYSQL_DATABASE=sql_training --env MYSQL_SSL=true
claude mcp add mermaid "@devstefancho/mermaid-mcp"
claude mcp add github "@modelcontextprotocol/server-github" --env GITHUB_TOKEN="your_token_here"
claude mcp add filesystem "@modelcontextprotocol/server-filesystem" --env ALLOWED_DIRECTORIES="/home/christiaan/Documents/CapitecFramework"
claude mcp add postgres "postgres-mcp" --env POSTGRES_HOST=localhost --env POSTGRES_PORT=5432 --env POSTGRES_USER=postgres --env POSTGRES_DATABASE=sql_training

# Test database connection
node -e "import('./sql-module/setup/database-connection.js').then(db => db.initializeDatabase())"
```

## Important Notes
- Framework uses ES6 modules (`type: "module"`)
- No linting or build commands configured - this is a pure test framework
- Primary test target is SauceDemo e-commerce website
- All async operations use async/await pattern