import { test, expect } from '@playwright/test';

// Task 1: API Filtering and Data Validation
test('Task 1: Check if a user has created multiple posts and test post creation failure', async ({ request }) => {
     // Test 1: Make a GET request with appropriate query parameter
     const userId = 1;
     const getResponse = await request.get(`http://localhost:3000/posts?userId=${userId}`);

     // Verify the status code is 200
     expect(getResponse.status()).toBe(200);

     // Validate that the user has at least 2 posts
     const posts = await getResponse.json();
     expect(posts.length).toBeGreaterThanOrEqual(2);

     // Check that all returned posts have the correct userId
     for (const post of posts) {
          expect(post.userId).toBe(userId);
     }

     // Test 2: POST /posts fails with missing required fields
     const incompletePost = {
          // title: "Missing Body Post", // Missing body - server requires title, body, userId
          userId: 1
     };

     const postResponse = await request.post('http://localhost:3000/posts', {
          data: incompletePost
     });

     // Verify the server rejects it with 400 status
     expect(postResponse.status()).toBe(400);

     // Check the error message mentions missing fields based on api-server.js
     const errorBody = await postResponse.json();
     expect(errorBody).toHaveProperty('error');
     expect(errorBody.error).toContain('Missing required fields');
     expect(errorBody.error).toContain('title'); // Server checks for title
     expect(errorBody.error).toContain('body'); // Server checks for body
});

// Task 2: Bearer Token Authentication
const SECRET_TOKEN = 'my-secret-token';

test('Task 2: GET /secure-data authentication scenarios', async ({ request }) => {
     // Test 1: No authentication
     const noAuthResponse = await request.get('http://localhost:3000/secure-data');
     // Verify 401 status code
     expect(noAuthResponse.status()).toBe(401);
     // Check error message
     const noAuthErrorBody = await noAuthResponse.json();
     expect(noAuthErrorBody).toHaveProperty('error');
     expect(noAuthErrorBody.error).toBe('Unauthorized: Missing Bearer token');

     // Test 2: Invalid authentication
     const invalidAuthResponse = await request.get('http://localhost:3000/secure-data', {
          headers: {
               'Authorization': `Bearer invalid-token`
          }
     });
     // Verify 403 status code
     expect(invalidAuthResponse.status()).toBe(403);
     // Check error message
     const invalidAuthErrorBody = await invalidAuthResponse.json();
     expect(invalidAuthErrorBody).toHaveProperty('error');
     expect(invalidAuthErrorBody.error).toBe('Forbidden: Invalid token');

     // Test 3: Valid authentication
     const validAuthResponse = await request.get('http://localhost:3000/secure-data', {
          headers: {
               'Authorization': `Bearer ${SECRET_TOKEN}`
          }
     });
     // Verify 200 status code and response content
     expect(validAuthResponse.status()).toBe(200);
     // Check response content
     const validAuthBody = await validAuthResponse.json();
     expect(validAuthBody).toHaveProperty('message');
     expect(validAuthBody.message).toBe('This is secure data, access granted.');
     expect(validAuthBody).toHaveProperty('user');
});

// Task 3: Authentication Methods Comparison (Code Example)
test('Task 3: Authentication example (Bearer Token)', async ({ request }) => {
     // Your code here implementing ONE of:
     // - Basic Authentication
     // - API Key Authentication
     // - Bearer Token Authentication

     // Using Bearer Token as implemented in Task 2
     const response = await request.get('http://localhost:3000/secure-data', {
          headers: {
               'Authorization': `Bearer ${SECRET_TOKEN}`
          }
     });

     // Make a request to a protected endpoint using your chosen method
     // Verify successful authentication (200 status)
     expect(response.status()).toBe(200);
     // Optional: Verify response content similar to Task 2
     // const responseBody = await response.json();
     // expect(responseBody).toHaveProperty('message');
}); 