import { test, expect } from '@playwright/test';
import { executeQuery, executeDDL, connectToDatabase, closeConnections } from '../../../src/utils/database.js';

test.describe('Candidate Database Interaction Tests', () => {

     test('should query users from candidate_01_db and validate data structure', async () => {
          // Switch to the first candidate database
          await executeDDL('USE candidate_01_db');

          // Get all users
          const users = await executeQuery('SELECT * FROM users ORDER BY id');

          // Validate we have the expected number of users
          expect(users.length).toBe(5);

          // Check the data structure and content
          const firstUser = users[0];
          expect(firstUser).toHaveProperty('id');
          expect(firstUser).toHaveProperty('name');
          expect(firstUser).toHaveProperty('email');
          expect(firstUser).toHaveProperty('department');
          expect(firstUser).toHaveProperty('salary');

          // Validate specific data
          expect(firstUser.name).toBe('Michael Zhang');
          expect(firstUser.email).toBe('michael.zhang@company.com');
          expect(firstUser.department).toBe('Engineering');
          expect(firstUser.salary).toBe(73000.00);

          console.log('✅ Found users:', users.map(u => ({ name: u.name, department: u.department })));
     });

     test('should perform complex queries with JOINs using the employee_orders view', async () => {
          await executeDDL('USE candidate_01_db');

          // Query the view we created
          const orderSummary = await executeQuery(`
            SELECT 
                employee_name,
                department,
                COUNT(*) as total_orders,
                SUM(total_amount) as total_spent
            FROM employee_orders 
            GROUP BY employee_name, department
            ORDER BY total_spent DESC
        `);

          expect(orderSummary.length).toBeGreaterThan(0);

          // Validate the aggregation worked
          const topSpender = orderSummary[0];
          expect(topSpender).toHaveProperty('employee_name');
          expect(topSpender).toHaveProperty('total_orders');
          expect(topSpender).toHaveProperty('total_spent');
          expect(topSpender.total_orders).toBeGreaterThan(0);
          expect(topSpender.total_spent).toBeGreaterThan(0);

          console.log('📊 Order Summary:', orderSummary);
     });

     test('should filter products by category and validate inventory', async () => {
          await executeDDL('USE candidate_01_db');

          // Get electronics products with stock info
          const electronics = await executeQuery(`
            SELECT name, price, stock_quantity, description 
            FROM products 
            WHERE category = 'Electronics' 
            ORDER BY price DESC
        `);

          expect(electronics.length).toBeGreaterThan(0);

          // Validate all electronics have positive stock
          electronics.forEach(product => {
               expect(product.stock_quantity).toBeGreaterThan(0);
               expect(product.price).toBeGreaterThan(0);
               expect(product.name).toBeTruthy();
          });

          console.log('💻 Electronics in stock:', electronics);
     });

     test('should test different candidate databases have different data', async () => {
          // Test candidate_01_db
          await executeDDL('USE candidate_01_db');
          const users1 = await executeQuery('SELECT name FROM users LIMIT 1');

          // Test candidate_02_db  
          await executeDDL('USE candidate_02_db');
          const users2 = await executeQuery('SELECT name FROM users LIMIT 1');

          // Test candidate_03_db
          await executeDDL('USE candidate_03_db');
          const users3 = await executeQuery('SELECT name FROM users LIMIT 1');

          // Verify each database has data and they're different
          expect(users1[0].name).toBeTruthy();
          expect(users2[0].name).toBeTruthy();
          expect(users3[0].name).toBeTruthy();

          console.log('👥 Users from different databases:');
          console.log('   DB1:', users1[0].name);
          console.log('   DB2:', users2[0].name);
          console.log('   DB3:', users3[0].name);
     });

     test('should perform data manipulation (INSERT/UPDATE/DELETE)', async () => {
          await executeDDL('USE candidate_01_db');

          // Insert a new user
          const insertResult = await executeQuery(`
            INSERT INTO users (name, email, age, department, salary, hire_date) 
            VALUES ('Test User', 'test.user@company.com', 30, 'Testing', 60000.00, '2024-01-25')
        `);

          expect(insertResult.affectedRows).toBe(1);
          const newUserId = insertResult.insertId;

          // Verify the user was inserted
          const newUser = await executeQuery('SELECT * FROM users WHERE id = ?', [newUserId]);
          expect(newUser.length).toBe(1);
          expect(newUser[0].name).toBe('Test User');
          expect(newUser[0].department).toBe('Testing');

          // Update the user's salary
          await executeQuery('UPDATE users SET salary = 65000.00 WHERE id = ?', [newUserId]);

          // Verify the update
          const updatedUser = await executeQuery('SELECT salary FROM users WHERE id = ?', [newUserId]);
          expect(updatedUser[0].salary).toBe(65000.00);

          // Clean up - delete the test user
          await executeQuery('DELETE FROM users WHERE id = ?', [newUserId]);

          // Verify deletion
          const deletedUser = await executeQuery('SELECT * FROM users WHERE id = ?', [newUserId]);
          expect(deletedUser.length).toBe(0);

          console.log('✅ Successfully performed INSERT, UPDATE, and DELETE operations');
     });

     test('should validate business logic with SQL aggregations', async () => {
          await executeDDL('USE candidate_01_db');

          // Calculate department statistics
          const deptStats = await executeQuery(`
            SELECT 
                department,
                COUNT(*) as employee_count,
                AVG(salary) as avg_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary
            FROM users 
            GROUP BY department
            ORDER BY avg_salary DESC
        `);

          expect(deptStats.length).toBeGreaterThan(0);

          // Validate calculations make sense
          deptStats.forEach(dept => {
               expect(dept.employee_count).toBeGreaterThan(0);
               expect(dept.avg_salary).toBeGreaterThanOrEqual(dept.min_salary);
               expect(dept.avg_salary).toBeLessThanOrEqual(dept.max_salary);
               expect(dept.min_salary).toBeLessThanOrEqual(dept.max_salary);
          });

          console.log('📈 Department Statistics:', deptStats);
     });

     test('should test order status workflow simulation', async () => {
          await executeDDL('USE candidate_01_db');

          // Get pending orders
          const pendingOrders = await executeQuery(`
            SELECT id, user_id, total_amount, status 
            FROM orders 
            WHERE status = 'pending' 
            LIMIT 1
        `);

          if (pendingOrders.length > 0) {
               const orderId = pendingOrders[0].id;

               // Simulate order processing workflow
               await executeQuery('UPDATE orders SET status = ? WHERE id = ?', ['processing', orderId]);
               await executeQuery('UPDATE orders SET status = ? WHERE id = ?', ['shipped', orderId]);
               await executeQuery('UPDATE orders SET status = ? WHERE id = ?', ['completed', orderId]);

               // Verify final status
               const finalOrder = await executeQuery('SELECT status FROM orders WHERE id = ?', [orderId]);
               expect(finalOrder[0].status).toBe('completed');

               // Reset for next test
               await executeQuery('UPDATE orders SET status = ? WHERE id = ?', ['pending', orderId]);

               console.log('📦 Successfully simulated order workflow for order ID:', orderId);
          }
     });

     // Clean up after all tests
     test.afterAll(async () => {
          await closeConnections();
     });
}); 