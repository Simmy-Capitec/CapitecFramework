import { test, expect } from '@playwright/test';
import { testConnection, executeQuery, connectToDatabase, closeConnections } from '../../src/utils/database.js';

test.describe('Database Connection Tests', () => {

     test('should connect to MySQL database successfully', async () => {
          const isConnected = await testConnection();
          expect(isConnected).toBe(true);
     });

     test('should execute basic SQL queries', async () => {
          // Test basic query to show databases
          const databases = await executeQuery('SHOW DATABASES');
          expect(databases).toBeDefined();
          expect(Array.isArray(databases)).toBe(true);
          console.log('Available databases:', databases.map(db => db.Database));
     });

     test('should get MySQL version info', async () => {
          const version = await executeQuery('SELECT VERSION() as version');
          expect(version).toBeDefined();
          expect(version.length).toBeGreaterThan(0);
          console.log('MySQL Version:', version[0].version);
     });

     test('should show current user and connection info', async () => {
          const userInfo = await executeQuery('SELECT USER() as current_user, CONNECTION_ID() as connection_id');
          expect(userInfo).toBeDefined();
          expect(userInfo.length).toBeGreaterThan(0);
          console.log('Current user:', userInfo[0].current_user);
          console.log('Connection ID:', userInfo[0].connection_id);
     });

     // Clean up after all tests
     test.afterAll(async () => {
          await closeConnections();
     });
}); 