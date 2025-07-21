import { test, expect, request } from '@playwright/test';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

// This test suite demonstrates the difference between PUT and PATCH methods in API testing
test.describe('API Testing: Difference between PUT and PATCH', () => {
     let apiContext;

     test.beforeAll(async () => {
          apiContext = await request.newContext({
               baseURL: 'https://reqres.in',
               extraHTTPHeaders: {
                    'x-api-key': 'reqres-free-v1',
                    'Content-Type': 'application/json'
               }
          });
     });

     // Using PUT to update user information
     test('Update User Information', async () => {
          const response = await apiContext.put('/api/users/2', {
               data: {
                    name: 'Bob',
                    job: 'Architect'
               }
          });

          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body).toHaveProperty('name', 'Bob');
          expect(body).toHaveProperty('job', 'Architect');
          expect(body).toHaveProperty('updatedAt');
     });

     // Using PATCH to modify user information
     test('Modify User information', async () => {
          const response = await apiContext.patch('/api/users/2', {
               data: {
                    job: 'Senior Architect'
               }
          });

          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body).toHaveProperty('job', 'Senior Architect');
          expect(body).toHaveProperty('updatedAt');
     });

});
