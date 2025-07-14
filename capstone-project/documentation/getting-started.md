# 🚀 Getting Started Guide

## Prerequisites

Before beginning the capstone project, ensure you have:

### Software Requirements
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Git** (for version control)
- **VS Code** (recommended IDE)
- **Chrome/Firefox** (for UI testing)

### Knowledge Prerequisites
- Basic SQL query writing
- JavaScript/TypeScript fundamentals
- Understanding of REST APIs
- Basic HTML/CSS knowledge
- Version control with Git

## 🔧 Environment Setup

### 1. Clone and Setup Project
```bash
# Clone the capstone project
git clone [your-repo-url]
cd capstone-project

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### 2. Database Setup
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
# OR for Windows
net start postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE animal_sanctuary_capstone;
CREATE USER capstone_user WITH ENCRYPTED PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE animal_sanctuary_capstone TO capstone_user;
\q

# Import database schema using Drizzle
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. Environment Configuration
Create `.env` file in project root:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=capstone_user
DB_PASSWORD=password123
DB_NAME=animal_sanctuary_capstone
DATABASE_URL=postgresql://capstone_user:password123@localhost:5432/animal_sanctuary_capstone

# API Configuration
API_BASE_URL=http://localhost:3001
API_PORT=3001

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
FRONTEND_PORT=3000

# Test Configuration
TEST_TIMEOUT=30000
HEADLESS=true
```

### 4. Start Application Services
```bash
# Terminal 1: Start API server
cd api-server
npm install
npm start

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev

# Terminal 3: Verify everything is running
curl http://localhost:3001/api/health
curl http://localhost:3000
```

## 📁 Project Structure Understanding

```
capstone-project/
├── README.md                     # Project overview
├── package.json                  # Dependencies and scripts
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── playwright.config.js         # Playwright configuration
├── jest.config.js              # Jest configuration
│
├── src/
│   ├── tests/
│   │   ├── sql/                # SQL automation tests
│   │   ├── api/                # API automation tests
│   │   └── ui/                 # UI automation tests
│   │
│   ├── helpers/
│   │   ├── database.js         # Database utilities
│   │   ├── api.js              # API utilities
│   │   └── ui.js               # UI utilities
│   │
│   ├── fixtures/
│   │   ├── test-data.js        # Test data management
│   │   └── database-setup.js   # Database setup utilities
│   │
│   └── config/
│       ├── test-config.js      # Test configuration
│       └── constants.js        # Test constants
│
├── database/
│   ├── schema.sql              # Database schema
│   ├── sample-data.sql         # Sample data
│   └── migrations/             # Database migrations
│
├── api-server/                 # Backend API (provided)
│   ├── server.js
│   ├── routes/
│   └── models/
│
├── frontend/                   # Frontend app (provided)
│   ├── src/
│   ├── public/
│   └── package.json
│
└── reports/                    # Test reports
    ├── html/
    ├── json/
    └── screenshots/
```

## 🧪 Running Your First Tests

### 1. Database Connection Test
```bash
# Test database connectivity
node src/helpers/database.js

# Expected output:
# ✓ Database connection successful
# ✓ Found 10 animals in database
# ✓ Database schema validated
```

### 2. API Health Check
```bash
# Test API endpoints
npm run test:api:health

# Expected output:
# ✓ API server is running
# ✓ Database connection active
# ✓ All endpoints responding
```

### 3. UI Smoke Test
```bash
# Test frontend loading
npm run test:ui:smoke

# Expected output:
# ✓ Frontend application loads
# ✓ Navigation menu present
# ✓ Login form functional
```

## 📝 Development Workflow

### 1. Task-Based Development
```bash
# Work on specific testing layers
npm run test:sql          # SQL automation tests
npm run test:api          # API automation tests  
npm run test:ui           # UI automation tests
npm run test:integration  # Integration tests
npm run test:all          # All tests
```

### 2. Development Commands
```bash
# Development mode (watch for changes)
npm run dev:sql
npm run dev:api
npm run dev:ui

# Debug mode (with detailed output)
npm run debug:sql
npm run debug:api
npm run debug:ui

# Generate test reports
npm run report:generate
npm run report:serve
```

### 3. Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

## 🎯 Task Approach Strategy

### Phase 1: SQL Automation (Week 1-2)
1. **Setup**: Configure database connection utilities
2. **Basic Tests**: Simple CRUD operation validation
3. **Complex Tests**: JOIN operations, transactions, constraints
4. **Performance**: Query optimization and performance testing

### Phase 2: API Automation (Week 3-4)
1. **Setup**: Configure API testing framework
2. **Endpoint Testing**: Test all CRUD endpoints
3. **Error Handling**: Validate error responses
4. **Integration**: Connect API tests with database validation

### Phase 3: UI Automation (Week 5-6)
1. **Setup**: Configure Playwright for UI testing
2. **Page Objects**: Create reusable page object models
3. **User Workflows**: Test complete user journeys
4. **Cross-Browser**: Validate across different browsers

### Phase 4: Integration & Polish (Week 7-8)
1. **End-to-End**: Complete workflow testing
2. **Performance**: Load testing and optimization
3. **Documentation**: Complete all documentation
4. **Final Review**: Code review and testing

## 🚨 Common Setup Issues

### Database Connection Issues
```bash
# Check MySQL service status
sudo systemctl status mysql

# Test connection manually
mysql -u capstone_user -p -h localhost

# Common fixes:
# 1. Reset password: ALTER USER 'capstone_user'@'localhost' IDENTIFIED BY 'password123';
# 2. Check firewall: sudo ufw allow 3306
# 3. Restart service: sudo systemctl restart mysql
```

### API Server Issues
```bash
# Check if port is in use
netstat -tulpn | grep :3001

# Kill process if needed
sudo kill -9 $(lsof -t -i:3001)

# Check logs
npm run logs:api
```

### Frontend Issues
```bash
# Clear cache
npm run clean
npm install

# Check port availability
netstat -tulpn | grep :3000

# Restart development server
npm run dev
```

## 📞 Getting Help

### Self-Help Resources
1. **Check Documentation**: Always review task-specific documentation first
2. **Console Logs**: Use `console.log()` for debugging
3. **Test Reports**: Review generated test reports for detailed results
4. **Error Messages**: Read error messages carefully for clues

### When to Ask for Help
- After trying self-help resources
- When stuck for more than 30 minutes
- For clarification on requirements
- For environment setup issues

### How to Ask for Help
1. **Describe the Problem**: What you're trying to do
2. **Show Your Work**: What you've already tried
3. **Include Error Messages**: Full error text and stack traces
4. **Provide Context**: Which part of the project you're working on

## 🏆 Success Tips

1. **Start Small**: Begin with simple tests and build complexity
2. **Test Frequently**: Run tests after each change
3. **Read Documentation**: Don't skip the provided documentation
4. **Use Version Control**: Commit your work regularly
5. **Keep Notes**: Document your approach and discoveries
6. **Ask Questions**: Don't hesitate to seek clarification

## 🎉 You're Ready!

Once you've completed the setup and run your first tests successfully, you're ready to begin the capstone project. Remember:

- **Take it step by step** - Don't try to do everything at once
- **Focus on quality** - Better to have fewer, well-written tests than many poor ones
- **Document as you go** - Don't leave documentation until the end
- **Test your tests** - Make sure your tests actually catch issues

Good luck with your capstone project! 🍀

---

**Next Steps**: Review the specific task requirements in the `tasks/` directory and begin with SQL automation.