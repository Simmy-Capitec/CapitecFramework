const { test, expect, request } = require('@playwright/test');

test.describe('Banking App API Tests', () => {
     let apiContext;

     test.beforeAll(async ({ playwright }) => {
          apiContext = await request.newContext({
               baseURL: 'https://banking-app.example.com/api',
               extraHTTPHeaders: {
                    'Authorization': 'Bearer test_api_key_123456',
                    'Content-Type': 'application/json'
               }
          });
     });

     test('should fetch account details with API key', async () => {
          const response = await apiContext.get('/accounts/12345');
          expect(response.ok()).toBeTruthy();

          const data = await response.json();
          expect(data).toHaveProperty('accountNumber', '12345');
          expect(data).toHaveProperty('balance');
     });

     test('should fail with invalid API key', async () => {
          const tempContext = await request.newContext({
               baseURL: 'https://banking-app.example.com/api',
               extraHTTPHeaders: {
                    'Authorization': 'invalid_key'
               }
          });

          const response = await tempContext.get('/accounts/12345');
          expect(response.status()).toBe(200);
     });
});
