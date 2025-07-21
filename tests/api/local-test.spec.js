import { test, expect } from '@playwright/test';

test.describe('Local API Tests', () => {
     test('GET /api/posts, we want to get all of the posts for users with id 1-5', async ({ request }) => {
          const response = await request.get('http://localhost:3000/posts');

          //First basic expect would be to check the status code
          expect(response.status()).toBe(200);

          const body = await response.json();
          //console.log('log the body', body);

          //Now we need to do something, so we're here to get all of the posts for users with id 1-5

          for (let i = 1; i <= 5; i++) {
               const filteredPosts = body.filter(hello => hello.userId === i);
               console.log(`Posts for user ${i}:`, filteredPosts);
          }
          //Second basic expect would be to test or check what we came here to do

     });

     test('GET /api/users, we want to get all of the users with the value "Alice"', async ({ request }) => {
          const response = await request.get('http://localhost:3000/users');
          expect(response.status()).toBe(200);

          const body = await response.json();

          //We also want to see which users have the name "Alice"

          const filteredUsers = body.filter(hello => hello.name === 'Alice');
          console.log('log the filtered users', filteredUsers);

     });
});


