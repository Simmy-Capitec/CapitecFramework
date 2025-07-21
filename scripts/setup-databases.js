import { executeQuery, executeDDL, testConnection, closeConnections } from '../src/utils/database.js';
import fs from 'fs';
import path from 'path';

// Sample data variations for different databases
const sampleUsers = [
     [
          "('Michael Zhang', 'michael.zhang@company.com', 27, 'Engineering', 73000.00, '2022-02-10')",
          "('Sarah Connor', 'sarah.connor@company.com', 34, 'Operations', 67000.00, '2021-04-15')",
          "('Tom Hardy', 'tom.hardy@company.com', 41, 'Finance', 85000.00, '2020-08-20')",
          "('Lisa Park', 'lisa.park@company.com', 30, 'Engineering', 76000.00, '2022-06-12')",
          "('Mark Johnson', 'mark.johnson@company.com', 25, 'HR', 52000.00, '2023-03-08')"
     ],
     [
          "('Jennifer Lopez', 'jennifer.lopez@company.com', 33, 'Marketing', 71000.00, '2022-01-20')",
          "('Robert Smith', 'robert.smith@company.com', 40, 'Engineering', 88000.00, '2020-09-15')",
          "('Maria Garcia', 'maria.garcia@company.com', 29, 'Finance', 69000.00, '2022-11-10')",
          "('James Wilson', 'james.wilson@company.com', 35, 'Operations', 74000.00, '2021-06-25')",
          "('Linda Davis', 'linda.davis@company.com', 31, 'HR', 58000.00, '2023-04-12')"
     ],
     [
          "('William Brown', 'william.brown@company.com', 38, 'Engineering', 86000.00, '2021-02-18')",
          "('Susan Miller', 'susan.miller@company.com', 26, 'Marketing', 63000.00, '2023-01-08')",
          "('Daniel Taylor', 'daniel.taylor@company.com', 44, 'Finance', 91000.00, '2019-07-22')",
          "('Karen Anderson', 'karen.anderson@company.com', 32, 'Operations', 67000.00, '2022-05-30')",
          "('Christopher Lee', 'christopher.lee@company.com', 28, 'Engineering', 75000.00, '2022-12-15')"
     ]
];

const sampleProducts = [
     [
          "('Desktop PC', 'Electronics', 899.99, 30, 'Powerful desktop computer')",
          "('Wireless Headphones', 'Electronics', 199.99, 85, 'Noise-cancelling wireless headphones')",
          "('Standing Desk', 'Furniture', 399.99, 15, 'Height-adjustable standing desk')",
          "('Desk Organizer', 'Office Supplies', 34.99, 90, 'Multi-compartment desk organizer')",
          "('Travel Mug', 'Accessories', 24.99, 110, 'Leak-proof travel coffee mug')"
     ],
     [
          "('Gaming Monitor', 'Electronics', 329.99, 22, '27-inch gaming monitor with high refresh rate')",
          "('Ergonomic Keyboard', 'Electronics', 89.99, 45, 'Split ergonomic keyboard')",
          "('Bookshelf', 'Furniture', 159.99, 18, '5-tier wooden bookshelf')",
          "('Pen Set', 'Office Supplies', 25.99, 75, 'Premium ballpoint pen set')",
          "('Phone Case', 'Accessories', 19.99, 150, 'Protective phone case')"
     ],
     [
          "('Tablet Pro', 'Electronics', 599.99, 35, 'High-performance tablet for work')",
          "('Bluetooth Speaker', 'Electronics', 79.99, 60, 'Portable Bluetooth speaker')",
          "('Filing Cabinet', 'Furniture', 189.99, 12, '3-drawer filing cabinet')",
          "('Sticky Notes', 'Office Supplies', 8.99, 200, 'Colorful sticky note pack')",
          "('Cable Organizer', 'Accessories', 14.99, 95, 'Cable management organizer')"
     ]
];

async function createDatabase(dbNumber) {
     const dbName = `candidate_${dbNumber.toString().padStart(2, '0')}_db`;

     try {
          console.log(`Creating database: ${dbName}`);

          // Create database - use executeDDL for DDL commands
          await executeDDL(`CREATE DATABASE IF NOT EXISTS ${dbName}`);

          // Switch to database - use executeDDL for USE command
          await executeDDL(`USE ${dbName}`);

          // Create tables - use executeQuery for CREATE TABLE
          await executeQuery(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                age INT,
                department VARCHAR(50),
                salary DECIMAL(10,2),
                hire_date DATE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

          // Products table
          await executeQuery(`
            CREATE TABLE products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50),
                price DECIMAL(10,2),
                stock_quantity INT DEFAULT 0,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

          // Orders table
          await executeQuery(`
            CREATE TABLE orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                product_id INT,
                quantity INT,
                total_amount DECIMAL(10,2),
                order_date DATE,
                status VARCHAR(20) DEFAULT 'pending',
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

          // Insert sample data with variations
          const userIndex = (dbNumber - 1) % sampleUsers.length;
          const productIndex = (dbNumber - 1) % sampleProducts.length;

          // Insert users
          const userValues = sampleUsers[userIndex].join(',\n');
          await executeQuery(`INSERT INTO users (name, email, age, department, salary, hire_date) VALUES ${userValues}`);

          // Insert products
          const productValues = sampleProducts[productIndex].join(',\n');
          await executeQuery(`INSERT INTO products (name, category, price, stock_quantity, description) VALUES ${productValues}`);

          // Insert some orders
          await executeQuery(`
            INSERT INTO orders (user_id, product_id, quantity, total_amount, order_date, status) VALUES
            (1, 1, 1, 899.99, '2024-01-${10 + dbNumber}', 'completed'),
            (2, 2, 1, 199.99, '2024-01-${11 + dbNumber}', 'shipped'),
            (3, 3, 1, 399.99, '2024-01-${12 + dbNumber}', 'pending'),
            (4, 4, 2, 69.98, '2024-01-${13 + dbNumber}', 'completed'),
            (5, 5, 1, 24.99, '2024-01-${14 + dbNumber}', 'shipped')
        `);

          // Create view for easy querying
          await executeQuery(`
            CREATE VIEW employee_orders AS
            SELECT 
                u.name as employee_name,
                u.department,
                p.name as product_name,
                o.quantity,
                o.total_amount,
                o.order_date,
                o.status
            FROM users u
            JOIN orders o ON u.id = o.user_id
            JOIN products p ON o.product_id = p.id
        `);

          console.log(`✅ Database ${dbName} created successfully`);
          return true;

     } catch (error) {
          console.error(`❌ Error creating database ${dbName}:`, error.message);
          return false;
     }
}

async function setupAllDatabases() {
     console.log('🚀 Starting database setup for 15 candidates...\n');

     // Test connection first
     const isConnected = await testConnection();
     if (!isConnected) {
          console.error('Cannot connect to database. Please check your credentials.');
          return;
     }

     let successCount = 0;

     // Create all 15 databases
     for (let i = 1; i <= 15; i++) {
          const success = await createDatabase(i);
          if (success) successCount++;

          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
     }

     console.log(`\n🎉 Setup completed! ${successCount}/15 databases created successfully.`);

     // Display summary
     console.log('\n📊 Database Summary:');
     for (let i = 1; i <= 15; i++) {
          const dbName = `candidate_${i.toString().padStart(2, '0')}_db`;
          console.log(`   - ${dbName}`);
     }

     console.log('\n📋 Each database contains:');
     console.log('   - users table (5 sample employees)');
     console.log('   - products table (5 sample products)');
     console.log('   - orders table (5 sample orders)');
     console.log('   - employee_orders view (for easy querying)');

     await closeConnections();
}

// Run the setup
setupAllDatabases().catch(console.error); 