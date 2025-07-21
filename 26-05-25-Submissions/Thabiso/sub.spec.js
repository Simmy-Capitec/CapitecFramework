import { test, expect, request } from '@playwright/test';

test.describe('API Testing URL + data and URL + API Key Header', () => {
     let apiContext;

     test.beforeEach(async ({ playwright }) => {
          apiContext = await request.newContext({
               baseURL: 'https://reqres.in',
               extraHTTPHeaders: {
                    'x-api-key': 'reqres-free-v1',
                    'Content-Type': 'application/json'
               }
          });
     });

     // Using POST to register a new user
     test('Register a new user', async () => {
          const response = await apiContext.post('/api/register', {
               data: {
                    email: 'eve.holt@reqres.in',
                    password: 'pistol'
               }
          });
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.token).toBeTruthy();

     });


     // Using POST to login a user
     test('Login a user', async () => {
          const response = await apiContext.post('/api/login', {
               data: {
                    email: 'eve.holt@reqres.in',
                    password: 'cityslicka'
               }
          });
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.token).toBeDefined();
     });

     // Creating a new user with POST
     test('Create a new user', async () => {
          const response = await apiContext.post('/api/users', {
               data: {
                    name: 'morpheus',
                    job: 'leader'
               }
          });
          expect(response.status()).toBe(201);
          const body = await response.json();
          expect(body.name).toBe('morpheus');
     });

     // Delayed response with POST data
     test('Delayed response with post data', async () => {
          const response = await apiContext.post('/api/users?delay=3', {
               data: {
                    name: 'Neo',
                    job: 'The One'
               }
          });
          expect(response.status()).toBe(201);
          const body = await response.json();
          expect(body.name).toBe('Neo');


     });



     /*
     TestA     TestB
     \        /
      \      /
       \    /
        \  /
         \/
        Context  = Before All
     
     
     
        TestA                 TestB
        |                     |
        |                     |
        |                     |
        |                     |
        Context               Context = Before Each
     
     
     
     */

     // Using PUT to update an existing user
     test('Update user (PUT)', async () => {
          const response = await apiContext.put('/api/users/2', {
               data: {
                    name: 'Trinity',
                    job: 'STA'
               }
          });
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.name).toBe('Trinity');
     });

     // Using GET to retrieve a list of users
     test('Get list of users (GET)', async () => {
          const response = await apiContext.get('/api/users?page=2');
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.data.length).toBeGreaterThan(0);
     });

     // Using GET to retrieve a single user by ID
     test('Get single user by ID (GET)', async () => {
          const response = await apiContext.get('/api/users/2');
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.data.id).toBe(2);
     });

     // Using GET to retrieve a single resource
     test('Get single resource', async () => {
          const response = await apiContext.get('/api/unknown/2');
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.data.id).toBe(2);
     });

     // Using GET to retrieve a list of resources
     test('Get list of resources', async () => {
          const response = await apiContext.get('/api/unknown');
          expect(response.status()).toBe(200);
          const body = await response.json();
          expect(body.data.length).toBeGreaterThan(0);
     });

     // Using GET to retrieve a single resource that does not exist
     test('User not found', async () => {
          const response = await apiContext.get('/api/users/23');
          expect(response.status()).toBe(404);
     });

     test.afterAll(async () => {
          await apiContext.dispose();
     });
});
