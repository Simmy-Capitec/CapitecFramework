import { test, expect } from '@playwright/test';
test.describe('Simple API Test Suite: URL+Data & URL+Headers', () => {
     let api;

     test.beforeAll(async () => {
          api = await request.newContext();
     });

     // ----------- GET: URL + Data examples -----------
     test('GET Search users by role=editor', async () => {
          const res = await api.get('https://jsonplaceholder.typicode.com/users?role=editor');
          expect(res.ok()).toBeTruthy();
     });

     test('GET Get posts by userId=1', async () => {
          const res = await api.get('https://jsonplaceholder.typicode.com/posts?userId=1');
          expect(res.status()).toBe(200);
     });

     test('GET Find comments for postId=3', async () => {
          const res = await api.get('https://jsonplaceholder.typicode.com/comments?postId=3');
          expect(await res.json()).toEqual(expect.any(Array));
     });

     test('GET Fetch todos with completed=true', async () => {
          const res = await api.get('https://jsonplaceholder.typicode.com/todos?completed=true');
          expect(await res.status()).toBe(200);
     });

     test('GET Filter albums by userId=5', async () => {
          const res = await api.get('https://jsonplaceholder.typicode.com/albums?userId=5');
          expect(await res.ok()).toBe(true);
     });

     // ----------- POST: URL + Headers examples -----------
     test('POST Send post with custom Content-Type', async () => {
          const res = await api.post('https://jsonplaceholder.typicode.com/posts', {
               headers: { 'Content-Type': 'application/json' },
               data: { title: 'Hello', body: 'World', userId: 1 }
          });
          expect(res.status()).toBe(201);
     });

     test('POST Auth header test', async () => {
          const res = await api.post('https://jsonplaceholder.typicode.com/posts', {
               headers: { 'Authorization': 'Bearer fake-token' },
               data: { title: 'Secure', body: 'Content', userId: 2 }
          });
          expect(res.status()).toBe(201);
     });

     test('POST Language preference header', async () => {
          const res = await api.post('https://jsonplaceholder.typicode.com/posts', {
               headers: { 'Accept-Language': 'fr-FR' },
               data: { title: 'Bonjour', body: 'Monde', userId: 3 }
          });
          expect(res.ok()).toBe(true);
     });

     test('POST X-Custom header demo', async () => {
          const res = await api.post('https://jsonplaceholder.typicode.com/posts', {
               headers: { 'X-Custom-Header': 'PlaywrightTest' },
               data: { title: 'Custom', body: 'Header', userId: 4 }
          });
          expect(res.ok()).toBeTruthy();
     });

     test('POST User-Agent override', async () => {
          const res = await api.post('https://jsonplaceholder.typicode.com/posts', {
               headers: { 'User-Agent': 'PlaywrightBot/1.0' },
               data: { title: 'Bot', body: 'Post', userId: 5 }
          });
          expect(res.status()).toBe(201);
     });
});